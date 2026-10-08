const store = require('../data/store');
const { sendRentalDueAlertEmail } = require('./emailService');

function parseMonthYear(monthStr) {
  if (!monthStr) return { year: 2026, monthIndex: 7 };
  const parts = monthStr.split(" ");
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mIdx = monthNames.indexOf(parts[0]);
  const y = parseInt(parts[1]) || 2026;
  return { year: y, monthIndex: mIdx >= 0 ? mIdx : 7 };
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function calculateMachineRentForMonth(rental, targetMonth) {
  if (!rental || rental.status !== "Active") return 0;
  const baseMonthly = Number(rental.rentRate || 0);
  if (!rental.startDate || !rental.isProratedFirstMonth) return baseMonthly;

  const [sYear, sMonth, sDay] = rental.startDate.split("-").map(Number);
  const { year: tYear, monthIndex: tMonthIndex } = parseMonthYear(targetMonth);

  if (sYear === tYear && (sMonth - 1) === tMonthIndex) {
    const totalDays = getDaysInMonth(tYear, tMonthIndex);
    const billableDays = Math.max(1, totalDays - sDay + 1);
    return Math.round((baseMonthly / totalDays) * billableDays);
  }
  return baseMonthly;
}

function getActiveRentForCustomerInMonth(c, targetMonth) {
  if (!c || c.isArchived || !Array.isArray(c.rentals)) return 0;
  return c.rentals.filter(r => r && r.status === "Active")
    .reduce((sum, r) => sum + calculateMachineRentForMonth(r, targetMonth), 0);
}

function getCustomerPaidInMonth(cId, monthName, payments) {
  return (payments || [])
    .filter(p => p && p.customerId === cId && p.month === monthName)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
}

function getCustomerOpeningArrears(c, targetMonth, allMonths, payments) {
  if (!c) return 0;
  const monthIndex = allMonths.indexOf(targetMonth);
  if (monthIndex <= 0) return Number(c.baseOpeningBalance || 0);
  const prevMonth = allMonths[monthIndex - 1];
  const prevArrears = getCustomerOpeningArrears(c, prevMonth, allMonths, payments);
  const prevRent = getActiveRentForCustomerInMonth(c, prevMonth);
  const prevPaid = getCustomerPaidInMonth(c.id, prevMonth, payments);
  return prevArrears + prevRent - prevPaid;
}

// Calculate the next due date and alert tier
function computeCustomerAlertDetails(customer, localConfig, payments) {
  if (customer.isArchived) return null;

  const activeRentals = (customer.rentals || []).filter(r => r.status === "Active");
  if (activeRentals.length === 0) return null;

  const targetMonth = localConfig.activeMonth || "August 2026";
  const allMonths = localConfig.allMonths || ["August 2026"];

  const activeRent = getActiveRentForCustomerInMonth(customer, targetMonth);
  const arrears = getCustomerOpeningArrears(customer, targetMonth, allMonths, payments);
  const paid = getCustomerPaidInMonth(customer.id, targetMonth, payments);
  const currentTotalDue = arrears + activeRent - paid;

  // Determine scheduled due date: default is 5th of current target month (or customer.billingCycleDay)
  const { year, monthIndex } = parseMonthYear(targetMonth);
  const dueDay = customer.billingCycleDay || (localConfig.alertSettings && localConfig.alertSettings.dueDayOfMonth) || 5;
  const scheduledDueDate = new Date(year, monthIndex, dueDay);

  // Compare with current system time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = scheduledDueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let alertType = null;
  let urgency = 'NORMAL';

  // Only trigger alerts if there is an outstanding amount to pay
  if (currentTotalDue > 0) {
    if (diffDays < 0) {
      alertType = 'OVERDUE';
      urgency = 'CRITICAL';
    } else if (diffDays === 0) {
      alertType = 'DUE_TODAY';
      urgency = 'HIGH';
    } else if (diffDays > 0 && diffDays <= 3) {
      alertType = '3_DAYS';
      urgency = 'HIGH';
    } else if (diffDays > 3 && diffDays <= 7) {
      alertType = '7_DAYS';
      urgency = 'MEDIUM';
    }
  }

  const formattedDueDate = `${scheduledDueDate.getFullYear()}-${String(scheduledDueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;

  return {
    customer,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    activeRentals,
    activeRentCount: activeRentals.length,
    monthlyRent: activeRent,
    arrears,
    paidInMonth: paid,
    totalBalanceDue: currentTotalDue,
    dueDate: formattedDueDate,
    daysDiff: diffDays,
    alertType, // '7_DAYS' | '3_DAYS' | 'DUE_TODAY' | 'OVERDUE' | null
    urgency,
    isAlertActive: !!alertType
  };
}

async function getAlertsOverview() {
  const [customers, payments, localConfig] = await Promise.all([
    store.getLocalCustomers(),
    store.getLocalPayments(),
    store.getLocalConfig()
  ]);

  const allAlertStatuses = [];
  const activeAlerts = [];

  let count7Days = 0;
  let count3Days = 0;
  let countDueToday = 0;
  let countOverdue = 0;

  for (const c of customers) {
    const details = computeCustomerAlertDetails(c, localConfig, payments);
    if (!details) continue;

    allAlertStatuses.push(details);

    if (details.isAlertActive) {
      activeAlerts.push(details);
      if (details.alertType === '7_DAYS') count7Days++;
      if (details.alertType === '3_DAYS') count3Days++;
      if (details.alertType === 'DUE_TODAY') countDueToday++;
      if (details.alertType === 'OVERDUE') countOverdue++;
    }
  }

  // Sort active alerts by urgency: OVERDUE, DUE_TODAY, 3_DAYS, 7_DAYS
  const urgencyWeight = { 'OVERDUE': 4, 'DUE_TODAY': 3, '3_DAYS': 2, '7_DAYS': 1 };
  activeAlerts.sort((a, b) => (urgencyWeight[b.alertType] || 0) - (urgencyWeight[a.alertType] || 0));

  return {
    counts: {
      total: activeAlerts.length,
      sevenDays: count7Days,
      threeDays: count3Days,
      dueToday: countDueToday,
      overdue: countOverdue
    },
    activeAlerts,
    allTracked: allAlertStatuses,
    activeMonth: localConfig.activeMonth
  };
}

async function triggerAlertEmailForCustomer(customerId) {
  const [customers, payments, localConfig] = await Promise.all([
    store.getLocalCustomers(),
    store.getLocalPayments(),
    store.getLocalConfig()
  ]);

  const customer = customers.find(c => c.id === customerId);
  if (!customer) throw new Error("Customer not found");

  const alertDetails = computeCustomerAlertDetails(customer, localConfig, payments);
  if (!alertDetails) throw new Error("No active rentals for this customer");

  const alertTypeToUse = alertDetails.alertType || (alertDetails.daysDiff < 0 ? 'OVERDUE' : 'UPCOMING');

  const res = await sendRentalDueAlertEmail({
    customer,
    alertType: alertTypeToUse,
    daysDiff: alertDetails.daysDiff,
    dueDate: alertDetails.dueDate,
    amountDue: alertDetails.totalBalanceDue,
    activeRentals: alertDetails.activeRentals,
    bankInfo: localConfig.bank
  });

  const logEntry = {
    id: "AL-" + Date.now(),
    customerId: customer.id,
    customerName: customer.name,
    alertType: alertTypeToUse,
    daysDiff: alertDetails.daysDiff,
    dueDate: alertDetails.dueDate,
    amountDue: alertDetails.totalBalanceDue,
    recipientEmail: res.recipient,
    status: res.success ? 'SENT' : 'FAILED',
    error: res.error || null,
    sentAt: new Date()
  };

  await store.addAlertLog(logEntry);

  return { success: res.success, log: logEntry, details: alertDetails };
}

async function triggerBatchAlerts() {
  const overview = await getAlertsOverview();
  const results = [];

  for (const alert of overview.activeAlerts) {
    try {
      const res = await triggerAlertEmailForCustomer(alert.customerId);
      results.push(res);
    } catch (err) {
      results.push({ success: false, customerId: alert.customerId, error: err.message });
    }
  }

  return { totalTriggered: results.length, results };
}

module.exports = {
  getAlertsOverview,
  triggerAlertEmailForCustomer,
  triggerBatchAlerts,
  computeCustomerAlertDetails
};
