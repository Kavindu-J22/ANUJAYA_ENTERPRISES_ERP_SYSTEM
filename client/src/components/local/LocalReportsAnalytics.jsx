import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  Clock, 
  Warehouse, 
  Layers, 
  CheckCircle2, 
  Users, 
  FileSpreadsheet, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  X,
  PieChart,
  Activity,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';
import { CompanyLogo } from '../common/BrandAssets';
import { 
  MONTH_NAMES, 
  parseMonthYear, 
  getYearMonth, 
  getDateYearMonth, 
  compareYM, 
  isMachineRentedInMonth, 
  paymentBelongsToYM,
  calculateCustomerArrearsBreakdown
} from './LocalCustomerDirectory';

export function LocalReportsAnalytics({
  customers = [],
  machines = [],
  payments = [],
  expenses = [],
  partners = [],
  config = {},
  companyInfo = null,
  bankInfo = null
}) {
  // Report Tab Selection
  const [activeReportTab, setActiveReportTab] = useState('daily_income'); // daily_income, monthly_income, outstanding, overdue, machine_utilization, profit_loss

  // Date Filter State
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const firstDayOfMonthStr = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }, []);

  const [datePreset, setDatePreset] = useState('this_month'); // today, this_week, this_month, last_month, this_year, all_time, custom
  const [startDate, setStartDate] = useState(firstDayOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Handle Preset Changes
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'today') {
      const s = now.toISOString().slice(0, 10);
      setStartDate(s);
      setEndDate(s);
    } else if (preset === 'this_week') {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(d.setDate(diff));
      setStartDate(monday.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'last_month') {
      const firstDayPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstDayPrev.toISOString().slice(0, 10));
      setEndDate(lastDayPrev.toISOString().slice(0, 10));
    } else if (preset === 'this_year') {
      const firstDayYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(firstDayYear.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'all_time') {
      setStartDate('2024-01-01');
      setEndDate(now.toISOString().slice(0, 10));
    }
  };

  // Company details fallback
  const cInfo = companyInfo || config.company || {
    name: "ANUJAYA ENTERPRISES",
    regNo: "PV/WP/78412",
    taglineEn: "INDUSTRIAL SEWING MACHINERY FLEET, AUTOMATION & MAINTENANCE",
    taglineSi: "කාර්මික මහන මැෂින් කුලියට දීම, නඩත්තුව සහ අලෙවිය",
    addressEn: "200/2B/1, Pahala Kosgama, Kosgama, Sri Lanka",
    hotline: "077 412 7702",
    email: "anujayaenterprises.info@gmail.com"
  };

  // ================= 1. DAILY INCOME CALCULATION =================
  const dailyIncomeData = useMemo(() => {
    let filtered = (payments || []).filter(p => {
      if (!p.date) return false;
      if (startDate && p.date < startDate) return false;
      if (endDate && p.date > endDate) return false;
      if (selectedCustomerId && p.customerId !== selectedCustomerId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesClient = (p.customerName || '').toLowerCase().includes(q);
        const matchesRef = (p.refNo || '').toLowerCase().includes(q);
        const matchesMethod = (p.method || '').toLowerCase().includes(q);
        const matchesRemarks = (p.remarks || '').toLowerCase().includes(q);
        if (!matchesClient && !matchesRef && !matchesMethod && !matchesRemarks) return false;
      }
      return true;
    });

    // Group by Date descending
    const grouped = {};
    filtered.forEach(p => {
      const dateKey = p.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          total: 0,
          count: 0,
          payments: []
        };
      }
      grouped[dateKey].total += Number(p.amount) || 0;
      grouped[dateKey].count += 1;
      grouped[dateKey].payments.push(p);
    });

    const list = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
    const totalCollected = list.reduce((sum, item) => sum + item.total, 0);
    const totalTransactions = filtered.length;
    const avgPerDay = list.length > 0 ? totalCollected / list.length : 0;

    return {
      list,
      flatList: filtered.sort((a, b) => (b.date || '').localeCompare(a.date || '')),
      totalCollected,
      totalTransactions,
      avgPerDay
    };
  }, [payments, startDate, endDate, selectedCustomerId, searchQuery]);

  // ================= 2. MONTHLY INCOME CALCULATION =================
  const monthlyIncomeData = useMemo(() => {
    // Collect all unique months across payments, active customers rentals, and config
    const monthsSet = new Set();
    (payments || []).forEach(p => {
      if (p.month) monthsSet.add(p.month);
      else if (p.date) {
        const ym = getDateYearMonth(p.date);
        monthsSet.add(`${MONTH_NAMES[ym.month]} ${ym.year}`);
      }
    });
    (config.allMonths || []).forEach(m => monthsSet.add(m));

    const allMonthsList = Array.from(monthsSet).map(mStr => {
      const parsed = parseMonthYear(mStr);
      return {
        label: mStr,
        ym: getYearMonth(mStr),
        year: parsed.year,
        monthIdx: MONTH_NAMES.indexOf(parsed.month)
      };
    }).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.monthIdx - a.monthIdx;
    });

    const monthRows = allMonthsList.map(mObj => {
      // 1. Calculate active machinery rented during this month
      let expectedBilling = 0;
      let activeMachinesCount = 0;
      (customers || []).forEach(c => {
        if (selectedCustomerId && c.id !== selectedCustomerId) return;
        (c.rentals || []).forEach(r => {
          if (isMachineRentedInMonth(r, mObj.ym)) {
            expectedBilling += Number(r.rentRate) || 0;
            activeMachinesCount++;
          }
        });
      });

      // 2. Total collections received for this cycle
      const cyclePayments = (payments || []).filter(p => {
        if (selectedCustomerId && p.customerId !== selectedCustomerId) return;
        return paymentBelongsToYM(p, mObj.ym);
      });
      const collectedAmount = cyclePayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const collectionRate = expectedBilling > 0 ? Math.min(100, Math.round((collectedAmount / expectedBilling) * 100)) : (collectedAmount > 0 ? 100 : 0);
      const variance = collectedAmount - expectedBilling;

      return {
        month: mObj.label,
        year: mObj.year,
        monthIdx: mObj.monthIdx,
        expectedBilling,
        collectedAmount,
        collectionRate,
        variance,
        transactionsCount: cyclePayments.length,
        activeMachinesCount
      };
    });

    const totalExpected = monthRows.reduce((s, r) => s + r.expectedBilling, 0);
    const totalCollected = monthRows.reduce((s, r) => s + r.collectedAmount, 0);
    const overallRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 100;

    return {
      rows: monthRows,
      totalExpected,
      totalCollected,
      overallRate
    };
  }, [payments, customers, config.allMonths, selectedCustomerId]);

  // ================= 3. OUTSTANDING PAYMENTS REPORT =================
  const outstandingData = useMemo(() => {
    const currentMonth = config.activeMonth || 'October 2026';
    const activeYM = getYearMonth(currentMonth);

    const clientRows = (customers || []).map(cust => {
      const arrears = calculateCustomerArrearsBreakdown(cust, payments, currentMonth);

      // Active machines this cycle
      const activeRentals = (cust.rentals || []).filter(r => isMachineRentedInMonth(r, activeYM));
      const currentMonthRent = activeRentals.reduce((sum, r) => sum + (Number(r.rentRate) || 0), 0);
      const currentMonthPaid = (payments || []).filter(p => p.customerId === cust.id && paymentBelongsToYM(p, activeYM))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const netPriorArrears = Number(arrears.netPreviousArrears || 0);
      const totalBalanceDue = netPriorArrears + currentMonthRent - currentMonthPaid;

      // Customer all-time totals
      const allTimePaid = (payments || []).filter(p => p.customerId === cust.id)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Aging estimation
      let agingBucket = 'Current';
      if (netPriorArrears > 0) {
        if (arrears.breakdown.length >= 3) agingBucket = '90+ Days';
        else if (arrears.breakdown.length === 2) agingBucket = '60+ Days';
        else agingBucket = '30+ Days';
      }

      return {
        customerId: cust.id,
        customerCode: cust.code,
        customerName: cust.name,
        phone: cust.phone || 'N/A',
        address: cust.address || 'Sri Lanka',
        billingCycleDay: cust.billingCycleDay || 5,
        activeMachinesCount: activeRentals.length,
        currentMonthRent,
        currentMonthPaid,
        netPriorArrears,
        totalBalanceDue,
        allTimePaid,
        agingBucket,
        isOverdue: totalBalanceDue > 0
      };
    }).filter(c => {
      if (selectedCustomerId && c.customerId !== selectedCustomerId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.customerName.toLowerCase().includes(q) || c.customerCode.toLowerCase().includes(q) || c.phone.includes(q);
      }
      return true;
    }).sort((a, b) => b.totalBalanceDue - a.totalBalanceDue);

    const totalOutstanding = clientRows.reduce((s, c) => s + (c.totalBalanceDue > 0 ? c.totalBalanceDue : 0), 0);
    const totalPriorArrears = clientRows.reduce((s, c) => s + (c.netPriorArrears > 0 ? c.netPriorArrears : 0), 0);
    const clientsWithDueCount = clientRows.filter(c => c.totalBalanceDue > 0).length;

    return {
      rows: clientRows,
      totalOutstanding,
      totalPriorArrears,
      clientsWithDueCount
    };
  }, [customers, payments, config.activeMonth, selectedCustomerId, searchQuery]);

  // ================= 4. OVERDUE CUSTOMERS REPORT =================
  const overdueCustomersData = useMemo(() => {
    const list = outstandingData.rows.filter(c => c.totalBalanceDue > 0).map(c => {
      // Find last payment date
      const custPayments = (payments || []).filter(p => p.customerId === c.customerId)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      const lastPayment = custPayments[0] || null;

      // Severity rating
      let severity = 'Moderate';
      if (c.totalBalanceDue > 50000 || c.agingBucket === '90+ Days') severity = 'Critical';
      else if (c.totalBalanceDue > 25000 || c.agingBucket === '60+ Days') severity = 'High';

      return {
        ...c,
        lastPaymentDate: lastPayment ? lastPayment.date : 'No payment recorded',
        lastPaymentAmount: lastPayment ? lastPayment.amount : 0,
        severity
      };
    });

    const criticalCount = list.filter(c => c.severity === 'Critical').length;
    const highCount = list.filter(c => c.severity === 'High').length;
    const totalOverdueAmount = list.reduce((s, c) => s + c.totalBalanceDue, 0);

    return {
      list,
      criticalCount,
      highCount,
      totalOverdueAmount
    };
  }, [outstandingData, payments]);

  // ================= 5. MACHINE UTILIZATION REPORT =================
  const machineUtilizationData = useMemo(() => {
    // 1. Gather all machines across yard master inventory
    const yardMachinesList = (machines || []).map(m => ({
      ...m,
      source: 'YARD',
      status: m.status || 'Available'
    }));

    // 2. Gather partner sub-leased machines actively deployed with customers
    const partnerMachinesList = [];
    (customers || []).forEach(c => {
      (c.rentals || []).forEach(r => {
        if (r.isPartnerMachine || r.partnerId) {
          partnerMachinesList.push({
            id: r.machineId,
            machineCode: r.machineCode || r.partnerMachineCode,
            brand: 'Partner Fleet',
            model: r.model,
            category: r.category || 'Sewing Machine',
            serialNumber: r.serialNumber,
            status: r.status === 'Returned' ? 'Returned' : 'Rented',
            customerName: c.name,
            customerCode: c.code,
            rentRate: r.rentRate,
            source: 'PARTNER'
          });
        }
      });
    });

    // 3. Count machines by status in Yard
    const totalYardUnits = yardMachinesList.length;
    const rentedYardUnits = yardMachinesList.filter(m => m.status === 'Rented').length;
    const availableYardUnits = yardMachinesList.filter(m => m.status === 'Available').length;
    const maintenanceYardUnits = yardMachinesList.filter(m => m.status === 'Maintenance').length;

    // Total enterprise fleet = yard units + partner deployed units
    const totalFleetUnits = totalYardUnits + partnerMachinesList.length;
    const totalDeployedUnits = rentedYardUnits + partnerMachinesList.filter(p => p.status === 'Rented').length;
    const overallUtilizationRate = totalFleetUnits > 0 ? Math.round((totalDeployedUnits / totalFleetUnits) * 100) : 0;

    // Breakdown by Category
    const categoryMap = {};
    [...yardMachinesList, ...partnerMachinesList].forEach(m => {
      const cat = m.category || 'Standard Sewing Machine';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, total: 0, deployed: 0, available: 0 };
      }
      categoryMap[cat].total++;
      if (m.status === 'Rented') categoryMap[cat].deployed++;
      else categoryMap[cat].available++;
    });

    const categoryBreakdown = Object.values(categoryMap).map(c => ({
      ...c,
      rate: c.total > 0 ? Math.round((c.deployed / c.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    return {
      yardMachinesList,
      partnerMachinesList,
      totalFleetUnits,
      totalDeployedUnits,
      availableYardUnits,
      maintenanceYardUnits,
      overallUtilizationRate,
      categoryBreakdown
    };
  }, [machines, customers]);

  // ================= 6. PROFIT & EXPENSE (P&L) REPORT =================
  const profitExpenseData = useMemo(() => {
    // 1. Filter payments in date range
    const periodPayments = (payments || []).filter(p => {
      if (!p.date) return true;
      if (startDate && p.date < startDate) return false;
      if (endDate && p.date > endDate) return false;
      return true;
    });
    const totalIncome = periodPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    // 2. Filter expenses in date range
    const periodExpenses = (expenses || []).filter(e => {
      const d = e.date || (e.createdAt ? new Date(e.createdAt).toISOString().slice(0, 10) : null);
      if (!d) return true;
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
    const totalExpenses = periodExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    // 3. Partner payments made in date range
    let totalPartnerLeasePaid = 0;
    (partners || []).forEach(p => {
      (p.payments || []).forEach(pay => {
        if (!pay.date) return;
        if (startDate && pay.date < startDate) return false;
        if (endDate && pay.date > endDate) return false;
        totalPartnerLeasePaid += Number(pay.amount) || 0;
      });
    });

    const grandTotalOutflow = totalExpenses + totalPartnerLeasePaid;
    const netProfit = totalIncome - grandTotalOutflow;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    // Group expenses by Category
    const expCategoryMap = {};
    periodExpenses.forEach(e => {
      const cat = e.type || e.category || 'General Operations';
      expCategoryMap[cat] = (expCategoryMap[cat] || 0) + (Number(e.amount) || 0);
    });

    const expenseCategories = Object.entries(expCategoryMap).map(([category, amount]) => ({
      category,
      amount,
      pct: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpenses,
      totalPartnerLeasePaid,
      grandTotalOutflow,
      netProfit,
      profitMargin,
      expenseCategories,
      periodExpenses
    };
  }, [payments, expenses, partners, startDate, endDate]);

  // ================= EXCEL EXPORT FUNCTION =================
  const handleExportExcel = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM so Excel opens with proper encoding
    let fileName = `ANUJAYA_REPORT_${activeReportTab.toUpperCase()}_${startDate}_to_${endDate}.csv`;

    csvContent += `ANUJAYA ENTERPRISES - OFFICIAL BUSINESS REPORT\r\n`;
    csvContent += `Report Title: ${activeReportTab.replace(/_/g, ' ').toUpperCase()}\r\n`;
    csvContent += `Date Filter Range: ${startDate} to ${endDate}\r\n`;
    csvContent += `Generated On: ${new Date().toLocaleString()}\r\n`;
    csvContent += `Corporate Reg No: ${cInfo.regNo} | Hotline: ${cInfo.hotline}\r\n\r\n`;

    if (activeReportTab === 'daily_income') {
      csvContent += `Date,Client Name,Payment Method,Receipt/Ref No,Settlement Month,Remarks,Amount (LKR)\r\n`;
      dailyIncomeData.flatList.forEach(p => {
        const row = [
          `"${p.date || ''}"`,
          `"${p.customerName || ''}"`,
          `"${p.method || ''}"`,
          `"${p.refNo || ''}"`,
          `"${p.month || ''}"`,
          `"${(p.remarks || '').replace(/"/g, '""')}"`,
          Number(p.amount) || 0
        ];
        csvContent += row.join(',') + '\r\n';
      });
      csvContent += `\r\n,,,,,TOTAL INCOME COLLECTED:,${dailyIncomeData.totalCollected}\r\n`;
    } else if (activeReportTab === 'monthly_income') {
      csvContent += `Billing Cycle Month,Active Machines Deployed,Expected Monthly Rent (LKR),Actual Collections Received (LKR),Collection Rate (%),Variance (LKR),Transactions Count\r\n`;
      monthlyIncomeData.rows.forEach(r => {
        const row = [
          `"${r.month}"`,
          r.activeMachinesCount,
          r.expectedBilling,
          r.collectedAmount,
          `${r.collectionRate}%`,
          r.variance,
          r.transactionsCount
        ];
        csvContent += row.join(',') + '\r\n';
      });
      csvContent += `\r\nTOTALS:,${monthlyIncomeData.totalExpected},${monthlyIncomeData.totalCollected},${monthlyIncomeData.overallRate}%\r\n`;
    } else if (activeReportTab === 'outstanding') {
      csvContent += `Client Code,Client Name,Hotline,Active Fleet Count,Current Month Rent (LKR),Current Month Paid (LKR),Prior Carried Arrears (LKR),Total Outstanding Balance Due (LKR),Aging Category\r\n`;
      outstandingData.rows.forEach(c => {
        const row = [
          `"${c.customerCode}"`,
          `"${c.customerName}"`,
          `"${c.phone}"`,
          c.activeMachinesCount,
          c.currentMonthRent,
          c.currentMonthPaid,
          c.netPriorArrears,
          c.totalBalanceDue,
          `"${c.agingBucket}"`
        ];
        csvContent += row.join(',') + '\r\n';
      });
      csvContent += `\r\n,,,,,,,TOTAL PORTFOLIO OUTSTANDING:,${outstandingData.totalOutstanding}\r\n`;
    } else if (activeReportTab === 'overdue_customers') {
      csvContent += `Client Code,Client Name,Contact Phone,Active Fleet,Total Overdue Amount (LKR),Due Day,Last Payment Date,Last Payment (LKR),Severity Status\r\n`;
      overdueCustomersData.list.forEach(c => {
        const row = [
          `"${c.customerCode}"`,
          `"${c.customerName}"`,
          `"${c.phone}"`,
          c.activeMachinesCount,
          c.totalBalanceDue,
          `Day ${c.billingCycleDay}`,
          `"${c.lastPaymentDate}"`,
          c.lastPaymentAmount,
          `"${c.severity}"`
        ];
        csvContent += row.join(',') + '\r\n';
      });
      csvContent += `\r\n,,,,TOTAL OVERDUE AMOUNT:,${overdueCustomersData.totalOverdueAmount}\r\n`;
    } else if (activeReportTab === 'machine_utilization') {
      csvContent += `Machine Category,Total Inventory Units,Currently Deployed (In-Use),Available in Central Yard,Utilization Rate (%)\r\n`;
      machineUtilizationData.categoryBreakdown.forEach(c => {
        const row = [
          `"${c.category}"`,
          c.total,
          c.deployed,
          c.available,
          `${c.rate}%`
        ];
        csvContent += row.join(',') + '\r\n';
      });
      csvContent += `\r\nOVERALL FLEET METRICS: Total Units: ${machineUtilizationData.totalFleetUnits}, Deployed: ${machineUtilizationData.totalDeployedUnits}, Overall Utilization: ${machineUtilizationData.overallUtilizationRate}%\r\n`;
    } else if (activeReportTab === 'profit_loss') {
      csvContent += `Category / Breakdown Item,Type,Amount (LKR),Share (%)\r\n`;
      csvContent += `Total Rental Income Received,Revenue,${profitExpenseData.totalIncome},100%\r\n`;
      csvContent += `Technician & Yard Operating Expenses,Expense,-${profitExpenseData.totalExpenses},-\r\n`;
      csvContent += `Sub-Lease Partner Payables,Expense,-${profitExpenseData.totalPartnerLeasePaid},-\r\n`;
      csvContent += `Total Cash Outflow,Outflow,-${profitExpenseData.grandTotalOutflow},-\r\n`;
      csvContent += `NET OPERATING PROFIT,Net Cashflow,${profitExpenseData.netProfit},${profitExpenseData.profitMargin}%\r\n\r\n`;
      csvContent += `EXPENSE CATEGORIES BREAKDOWN:\r\n`;
      profitExpenseData.expenseCategories.forEach(e => {
        csvContent += `"${e.category}",Expense,${e.amount},${e.pct}%\r\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* ================= PAGE HEADER & METRICS RIBBON ================= */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-carbon-900/90 p-5 rounded-3xl border border-carbon-700/80 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl text-white tracking-tight flex items-center gap-2">
                <span>Official Reports & Analytics</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                  Executive Suite
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Central Yard Machinery Rental Operations • Cashflow, Fleet Utilization & Risk Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Global Export & Print Action Buttons */}
        <div className="flex items-center gap-2.5 font-mono">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-2 shadow-md hover:border-emerald-500/60"
            title="Download structured spreadsheet (.csv format with UTF-8 BOM for Microsoft Excel)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export to Excel</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg"
            title="Generate official executive printable report with Anujaya corporate header and signature block"
          >
            <Printer className="w-4 h-4" />
            <span>Generate PDF / Print</span>
          </button>
        </div>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="p-4 bg-carbon-900/80 border border-carbon-700/80 rounded-2xl space-y-3 font-mono text-xs shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Range:</span>
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'this_year', label: 'This Year' },
              { id: 'all_time', label: 'All Time' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  datePreset === p.id 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'bg-carbon-800 hover:bg-carbon-750 text-slate-400 hover:text-white border border-carbon-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-carbon-950 px-2.5 py-1 rounded-xl border border-carbon-700">
              <span className="text-[10px] text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
              />
            </div>
            <span className="text-slate-600">→</span>
            <div className="flex items-center gap-1 bg-carbon-950 px-2.5 py-1 rounded-xl border border-carbon-700">
              <span className="text-[10px] text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Secondary Filters: Client & Text Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-carbon-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Client Name, Code, Machine Model, Reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-carbon-950 border border-carbon-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-1.5 bg-carbon-950 border border-carbon-700 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- All Garment Clients & Factories --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            {(searchQuery || selectedCustomerId || datePreset !== 'this_month') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCustomerId('');
                  handlePresetChange('this_month');
                }}
                className="p-1.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition flex-shrink-0"
                title="Reset Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= REPORT NAVIGATION PILLS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { id: 'daily_income', label: 'Daily Income', icon: TrendingUp, color: 'emerald', badge: `${dailyIncomeData.totalTransactions} Tx` },
          { id: 'monthly_income', label: 'Monthly Income', icon: Calendar, color: 'sky', badge: `${monthlyIncomeData.overallRate}%` },
          { id: 'outstanding', label: 'Outstanding Due', icon: CreditCard, color: 'amber', badge: `${outstandingData.clientsWithDueCount} Due` },
          { id: 'overdue_customers', label: 'Overdue Clients', icon: AlertTriangle, color: 'rose', badge: `${overdueCustomersData.list.length} Alert` },
          { id: 'machine_utilization', label: 'Fleet Utilization', icon: Warehouse, color: 'purple', badge: `${machineUtilizationData.overallUtilizationRate}%` },
          { id: 'profit_loss', label: 'Profit & Expense', icon: DollarSign, color: 'teal', badge: `${profitExpenseData.profitMargin}%` }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`p-3 rounded-2xl font-mono text-left transition flex flex-col justify-between border ${
                isActive
                  ? 'bg-carbon-800/90 border-emerald-500/80 shadow-lg shadow-emerald-950/40 text-white'
                  : 'bg-carbon-900/60 border-carbon-700/60 text-slate-400 hover:text-white hover:bg-carbon-850'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-carbon-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </div>
              <span className="font-bold text-xs font-sans block truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= 1. DAILY INCOME VIEW ================= */}
      {activeReportTab === 'daily_income' && (
        <div className="space-y-4">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Income (Selected Period)</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatLKR(dailyIncomeData.totalCollected)}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{dailyIncomeData.totalTransactions} recorded collections</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Collection Days</span>
              <div className="text-2xl font-black text-white font-mono mt-1">{dailyIncomeData.list.length} Days</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Across filtered date range</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Daily Average Collection</span>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1">{formatLKR(dailyIncomeData.avgPerDay)}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Per active business day</span>
            </div>
          </div>

          {/* Daily Records Table */}
          <div className="overflow-x-auto rounded-2xl border border-carbon-700/80 bg-carbon-900/80 shadow-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-carbon-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-carbon-800">
                <tr>
                  <th className="px-4 py-3.5">Payment Date</th>
                  <th className="px-4 py-3.5">Garment Client</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Ref / Receipt No</th>
                  <th className="px-4 py-3.5">Settlement Cycle</th>
                  <th className="px-4 py-3.5">Remarks / Details</th>
                  <th className="px-4 py-3.5 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800 font-mono">
                {dailyIncomeData.flatList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No income records found for the selected date range and filter criteria.
                    </td>
                  </tr>
                ) : (
                  dailyIncomeData.flatList.map(pay => (
                    <tr key={pay.id} className="hover:bg-carbon-800/40 transition">
                      <td className="px-4 py-3 text-slate-300 font-bold">{pay.date}</td>
                      <td className="px-4 py-3 font-sans font-bold text-white">
                        {pay.customerName || 'Garment Client'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{pay.method}</td>
                      <td className="px-4 py-3 text-sky-400">{pay.refNo || '-'}</td>
                      <td className="px-4 py-3 text-amber-400">{pay.month || '-'}</td>
                      <td className="px-4 py-3 text-slate-400 font-sans italic text-[11px]">
                        {pay.remarks || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400 text-sm">
                        {formatLKR(pay.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-carbon-950 border-t-2 border-carbon-700 font-mono text-xs">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right uppercase text-slate-400 font-bold">
                    Total Income Collected:
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-black text-base">
                    {formatLKR(dailyIncomeData.totalCollected)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ================= 2. MONTHLY INCOME VIEW ================= */}
      {activeReportTab === 'monthly_income' && (
        <div className="space-y-4">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Expected Rent</span>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1">{formatLKR(monthlyIncomeData.totalExpected)}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Based on active machinery agreements</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Actual Collected</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatLKR(monthlyIncomeData.totalCollected)}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Collections in bank & cash</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Overall Collection Efficiency</span>
              <div className={`text-2xl font-black font-mono mt-1 ${monthlyIncomeData.overallRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {monthlyIncomeData.overallRate}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Target: 95%+ recovery rate</span>
            </div>
          </div>

          {/* Monthly Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-carbon-700/80 bg-carbon-900/80 shadow-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-carbon-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-carbon-800">
                <tr>
                  <th className="px-4 py-3.5">Billing Cycle Month</th>
                  <th className="px-4 py-3.5 text-center">Active Machinery Units</th>
                  <th className="px-4 py-3.5 text-right">Expected Rent (LKR)</th>
                  <th className="px-4 py-3.5 text-right">Actual Collected (LKR)</th>
                  <th className="px-4 py-3.5 text-center">Collection Rate (%)</th>
                  <th className="px-4 py-3.5 text-right">Variance / Outstanding (LKR)</th>
                  <th className="px-4 py-3.5 text-center">Receipts Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800 font-mono">
                {monthlyIncomeData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No monthly billing cycles found.
                    </td>
                  </tr>
                ) : (
                  monthlyIncomeData.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-carbon-800/40 transition">
                      <td className="px-4 py-3 font-bold text-white font-sans">{row.month}</td>
                      <td className="px-4 py-3 text-center text-slate-300 font-bold">{row.activeMachinesCount} Units</td>
                      <td className="px-4 py-3 text-right text-sky-300 font-bold">{formatLKR(row.expectedBilling)}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-bold">{formatLKR(row.collectedAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.collectionRate >= 90 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          row.collectionRate >= 60 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {row.collectionRate}%
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${row.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {row.variance >= 0 ? `+${formatLKR(row.variance)}` : formatLKR(row.variance)}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">{row.transactionsCount} Tx</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-carbon-950 border-t-2 border-carbon-700 font-mono text-xs">
                <tr>
                  <td className="px-4 py-3 uppercase text-slate-400 font-bold">Total Enterprise:</td>
                  <td className="px-4 py-3 text-center text-slate-400 font-bold">-</td>
                  <td className="px-4 py-3 text-right text-sky-400 font-black text-sm">{formatLKR(monthlyIncomeData.totalExpected)}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-black text-sm">{formatLKR(monthlyIncomeData.totalCollected)}</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-black">{monthlyIncomeData.overallRate}%</td>
                  <td className="px-4 py-3 text-right font-black text-sm text-slate-300">
                    {formatLKR(monthlyIncomeData.totalCollected - monthlyIncomeData.totalExpected)}
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ================= 3. OUTSTANDING PAYMENTS VIEW ================= */}
      {activeReportTab === 'outstanding' && (
        <div className="space-y-4">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Outstanding Balance Due</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">{formatLKR(outstandingData.totalOutstanding)}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Across all garment factories</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Prior Carried Arrears</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{formatLKR(outstandingData.totalPriorArrears)}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Unsettled before active cycle</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Accounts with Unpaid Balance</span>
              <div className="text-2xl font-black text-white font-mono mt-1">{outstandingData.clientsWithDueCount} Clients</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Requiring recovery follow-up</span>
            </div>
          </div>

          {/* Outstanding Table */}
          <div className="overflow-x-auto rounded-2xl border border-carbon-700/80 bg-carbon-900/80 shadow-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-carbon-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-carbon-800">
                <tr>
                  <th className="px-4 py-3.5">Client Code</th>
                  <th className="px-4 py-3.5">Garment Factory Client</th>
                  <th className="px-4 py-3.5">Hotline</th>
                  <th className="px-4 py-3.5 text-center">Active Fleet</th>
                  <th className="px-4 py-3.5 text-right">Cycle Rent (LKR)</th>
                  <th className="px-4 py-3.5 text-right">Cycle Paid (LKR)</th>
                  <th className="px-4 py-3.5 text-right">Prior Arrears (LKR)</th>
                  <th className="px-4 py-3.5 text-right">Net Balance Due (LKR)</th>
                  <th className="px-4 py-3.5 text-center">Aging Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800 font-mono">
                {outstandingData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      No matching client records found.
                    </td>
                  </tr>
                ) : (
                  outstandingData.rows.map(c => (
                    <tr key={c.customerId} className="hover:bg-carbon-800/40 transition">
                      <td className="px-4 py-3 font-bold text-amber-400">{c.customerCode}</td>
                      <td className="px-4 py-3 font-sans font-bold text-white">
                        <div>{c.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.address}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{c.phone}</td>
                      <td className="px-4 py-3 text-center text-sky-400 font-bold">{c.activeMachinesCount} Units</td>
                      <td className="px-4 py-3 text-right text-slate-300">{formatLKR(c.currentMonthRent)}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-bold">{formatLKR(c.currentMonthPaid)}</td>
                      <td className="px-4 py-3 text-right text-amber-300 font-bold">{formatLKR(c.netPriorArrears)}</td>
                      <td className={`px-4 py-3 text-right font-black text-sm ${c.totalBalanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatLKR(c.totalBalanceDue)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.agingBucket === '90+ Days' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          c.agingBucket === '60+ Days' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          c.agingBucket === '30+ Days' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {c.agingBucket}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-carbon-950 border-t-2 border-carbon-700 font-mono text-xs">
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-right uppercase text-slate-400 font-bold">
                    Total Portfolio Net Balance Due:
                  </td>
                  <td className="px-4 py-3 text-right text-rose-400 font-black text-base">
                    {formatLKR(outstandingData.totalOutstanding)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ================= 4. OVERDUE CUSTOMERS VIEW ================= */}
      {activeReportTab === 'overdue_customers' && (
        <div className="space-y-4">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Overdue Default Sum</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">{formatLKR(overdueCustomersData.totalOverdueAmount)}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Immediate collection priority</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Critical Risk Accounts</span>
              <div className="text-2xl font-black text-rose-500 font-mono mt-1">{overdueCustomersData.criticalCount} Clients</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Arrears &gt; LKR 50,000 or 90+ days</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">High Attention Accounts</span>
              <div className="text-2xl font-black text-orange-400 font-mono mt-1">{overdueCustomersData.highCount} Clients</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Arrears &gt; LKR 25,000 or 60+ days</span>
            </div>
          </div>

          {/* Overdue Clients Listing */}
          <div className="overflow-x-auto rounded-2xl border border-carbon-700/80 bg-carbon-900/80 shadow-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-carbon-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-carbon-800">
                <tr>
                  <th className="px-4 py-3.5">Risk Rating</th>
                  <th className="px-4 py-3.5">Client Code</th>
                  <th className="px-4 py-3.5">Garment Factory Client</th>
                  <th className="px-4 py-3.5">Contact Hotline</th>
                  <th className="px-4 py-3.5 text-center">Active Fleet</th>
                  <th className="px-4 py-3.5 text-right">Total Overdue Amount (LKR)</th>
                  <th className="px-4 py-3.5 text-center">Due Day</th>
                  <th className="px-4 py-3.5">Last Payment Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800 font-mono">
                {overdueCustomersData.list.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-emerald-400 font-bold">
                      ✓ All client accounts are fully settled and up-to-date! No overdue accounts detected.
                    </td>
                  </tr>
                ) : (
                  overdueCustomersData.list.map(c => (
                    <tr key={c.customerId} className="hover:bg-carbon-800/40 transition">
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          c.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          c.severity === 'High' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          <ShieldAlert className="w-3 h-3" />
                          <span>{c.severity}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-400">{c.customerCode}</td>
                      <td className="px-4 py-3 font-sans font-bold text-white">
                        <div>{c.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.address}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-bold">{c.phone}</td>
                      <td className="px-4 py-3 text-center text-sky-400 font-bold">{c.activeMachinesCount} Units</td>
                      <td className="px-4 py-3 text-right font-black text-rose-400 text-sm">
                        {formatLKR(c.totalBalanceDue)}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">
                        Day {c.billingCycleDay} of month
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        <div>{c.lastPaymentDate}</div>
                        {c.lastPaymentAmount > 0 && (
                          <div className="text-[10px] text-emerald-400 font-bold">{formatLKR(c.lastPaymentAmount)}</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-carbon-950 border-t-2 border-carbon-700 font-mono text-xs">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right uppercase text-slate-400 font-bold">
                    Total Critical Default Overdue:
                  </td>
                  <td className="px-4 py-3 text-right text-rose-400 font-black text-base">
                    {formatLKR(overdueCustomersData.totalOverdueAmount)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ================= 5. MACHINE UTILIZATION VIEW ================= */}
      {activeReportTab === 'machine_utilization' && (
        <div className="space-y-4">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Enterprise Fleet</span>
              <div className="text-2xl font-black text-white font-mono mt-1">{machineUtilizationData.totalFleetUnits} Units</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Yard stock + Partner sub-leases</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Currently Deployed (In-Use)</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{machineUtilizationData.totalDeployedUnits} Units</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Earning active monthly hire</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Available Central Yard Stock</span>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1">{machineUtilizationData.availableYardUnits} Units</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Ready for immediate dispatch</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Fleet Utilization Rate</span>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1">{machineUtilizationData.overallUtilizationRate}%</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Active deployed efficiency</span>
            </div>
          </div>

          {/* Category Utilization Breakdown */}
          <div className="p-5 bg-carbon-900/80 border border-carbon-700/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-800">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                <span>Fleet Category Utilization Breakdown</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {machineUtilizationData.categoryBreakdown.length} Equipment Categories
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {machineUtilizationData.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="p-3 bg-carbon-950/70 rounded-xl border border-carbon-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white font-sans">{cat.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{cat.deployed} / {cat.total} Units Deployed</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        cat.rate >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        cat.rate >= 50 ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {cat.rate}% Utilization
                      </span>
                    </div>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 bg-carbon-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${cat.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. PROFIT & EXPENSE (P&L) VIEW ================= */}
      {activeReportTab === 'profit_loss' && (
        <div className="space-y-4">
          {/* Executive P&L Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Rental Gross Income</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatLKR(profitExpenseData.totalIncome)}</div>
              <span className="text-[10px] text-emerald-500/80 font-mono mt-0.5 block">Collections in selected range</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Yard Operating Expenses</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">{formatLKR(profitExpenseData.totalExpenses)}</div>
              <span className="text-[10px] text-rose-500/80 font-mono mt-0.5 block">Technicians, logistics, parts</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Partner Lease Costs</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{formatLKR(profitExpenseData.totalPartnerLeasePaid)}</div>
              <span className="text-[10px] text-amber-500/80 font-mono mt-0.5 block">Sub-leased machine payables</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-carbon-700/80 bg-gradient-to-br from-carbon-900 to-emerald-950/30">
              <span className="text-[10px] text-slate-300 uppercase font-mono block font-bold">Net Operating Profit</span>
              <div className={`text-2xl font-black font-mono mt-1 ${profitExpenseData.netProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {profitExpenseData.netProfit >= 0 ? `+${formatLKR(profitExpenseData.netProfit)}` : formatLKR(profitExpenseData.netProfit)}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Margin: {profitExpenseData.profitMargin}%</span>
            </div>
          </div>

          {/* Expense Category Breakdown & Cashflow Statement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* P&L Statement breakdown */}
            <div className="p-5 bg-carbon-900/80 border border-carbon-700/80 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-carbon-800 pb-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Executive Operating Cashflow Statement</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-carbon-800">
                  <span className="text-slate-300 font-bold">Total Rental Collections Received (A)</span>
                  <span className="text-emerald-400 font-bold">{formatLKR(profitExpenseData.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-carbon-800">
                  <span className="text-slate-400">Technician & Yard Operations (B1)</span>
                  <span className="text-rose-400 font-bold">- {formatLKR(profitExpenseData.totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-carbon-800">
                  <span className="text-slate-400">Partner Sub-Leasing Disbursements (B2)</span>
                  <span className="text-amber-400 font-bold">- {formatLKR(profitExpenseData.totalPartnerLeasePaid)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-carbon-800">
                  <span className="text-slate-300 font-bold">Total Cash Outflow (B = B1 + B2)</span>
                  <span className="text-rose-400 font-black">- {formatLKR(profitExpenseData.grandTotalOutflow)}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 bg-carbon-950 p-3 rounded-xl border border-carbon-800 font-black text-sm">
                  <span className="text-white">Net Yard Operating Cashflow (A - B)</span>
                  <span className={profitExpenseData.netProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                    {profitExpenseData.netProfit >= 0 ? `+${formatLKR(profitExpenseData.netProfit)}` : formatLKR(profitExpenseData.netProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses By Category */}
            <div className="p-5 bg-carbon-900/80 border border-carbon-700/80 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-carbon-800 pb-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                <span>Operating Expenses by Category</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {profitExpenseData.expenseCategories.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No operating expenses recorded in this period.
                  </div>
                ) : (
                  profitExpenseData.expenseCategories.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-sans">{exp.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{formatLKR(exp.amount)}</span>
                          <span className="text-purple-400 text-[10px]">({exp.pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-carbon-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full"
                          style={{ width: `${exp.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= PRINTABLE REPORT MODAL (A4 Executive View) ================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 sm:my-8">
            
            {/* Top Toolbar (No-Print) */}
            <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 font-mono text-xs">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Executive Report Print Engine</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">A4 Document Layout</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div id="printable-document" className="p-6 sm:p-10 space-y-6 text-slate-900 bg-white">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                <div className="flex items-center gap-3">
                  <CompanyLogo className="w-14 h-14" />
                  <div>
                    <h1 className="font-display font-black text-2xl uppercase tracking-tight text-slate-900">
                      {cInfo.name}
                    </h1>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      {cInfo.taglineEn}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {cInfo.addressEn}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Reg No: {cInfo.regNo} • Hotline: {cInfo.hotline} • Email: {cInfo.email}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
                    OFFICIAL REPORT
                  </div>
                  <div className="text-lg font-black text-slate-900 uppercase">
                    {activeReportTab.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Date Range: {startDate} to {endDate}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Generated: {new Date().toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Printable Table Content based on active tab */}
              {activeReportTab === 'daily_income' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between font-mono text-xs">
                    <div><strong>Total Income Collected:</strong> {formatLKR(dailyIncomeData.totalCollected)}</div>
                    <div><strong>Transactions:</strong> {dailyIncomeData.totalTransactions}</div>
                    <div><strong>Daily Average:</strong> {formatLKR(dailyIncomeData.avgPerDay)}</div>
                  </div>

                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Garment Client</th>
                        <th className="p-2">Method</th>
                        <th className="p-2">Ref No</th>
                        <th className="p-2">Cycle</th>
                        <th className="p-2 text-right">Amount (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {dailyIncomeData.flatList.map(p => (
                        <tr key={p.id}>
                          <td className="p-2 font-bold">{p.date}</td>
                          <td className="p-2 font-sans font-bold">{p.customerName}</td>
                          <td className="p-2">{p.method}</td>
                          <td className="p-2">{p.refNo}</td>
                          <td className="p-2">{p.month}</td>
                          <td className="p-2 text-right font-bold text-emerald-800">{formatLKR(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-mono font-bold">
                      <tr>
                        <td colSpan={5} className="p-2 text-right uppercase">Total Collected:</td>
                        <td className="p-2 text-right text-emerald-900 text-sm">{formatLKR(dailyIncomeData.totalCollected)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {activeReportTab === 'monthly_income' && (
                <div className="space-y-4">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Billing Cycle</th>
                        <th className="p-2 text-center">Active Units</th>
                        <th className="p-2 text-right">Expected Rent</th>
                        <th className="p-2 text-right">Actual Collected</th>
                        <th className="p-2 text-center">Recovery (%)</th>
                        <th className="p-2 text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {monthlyIncomeData.rows.map((r, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold font-sans">{r.month}</td>
                          <td className="p-2 text-center">{r.activeMachinesCount}</td>
                          <td className="p-2 text-right">{formatLKR(r.expectedBilling)}</td>
                          <td className="p-2 text-right font-bold text-emerald-800">{formatLKR(r.collectedAmount)}</td>
                          <td className="p-2 text-center font-bold">{r.collectionRate}%</td>
                          <td className="p-2 text-right font-bold">{formatLKR(r.variance)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-mono font-bold">
                      <tr>
                        <td colSpan={2} className="p-2 uppercase">Totals:</td>
                        <td className="p-2 text-right">{formatLKR(monthlyIncomeData.totalExpected)}</td>
                        <td className="p-2 text-right text-emerald-900 text-sm">{formatLKR(monthlyIncomeData.totalCollected)}</td>
                        <td className="p-2 text-center">{monthlyIncomeData.overallRate}%</td>
                        <td className="p-2 text-right">{formatLKR(monthlyIncomeData.totalCollected - monthlyIncomeData.totalExpected)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {activeReportTab === 'outstanding' && (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex justify-between font-mono text-xs">
                    <div><strong>Total Portfolio Balance Due:</strong> {formatLKR(outstandingData.totalOutstanding)}</div>
                    <div><strong>Prior Arrears:</strong> {formatLKR(outstandingData.totalPriorArrears)}</div>
                    <div><strong>Clients with Due:</strong> {outstandingData.clientsWithDueCount}</div>
                  </div>

                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Code</th>
                        <th className="p-2">Client Name</th>
                        <th className="p-2">Phone</th>
                        <th className="p-2 text-center">Fleet</th>
                        <th className="p-2 text-right">Cycle Rent</th>
                        <th className="p-2 text-right">Cycle Paid</th>
                        <th className="p-2 text-right">Prior Arrears</th>
                        <th className="p-2 text-right">Net Due (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {outstandingData.rows.map(c => (
                        <tr key={c.customerId}>
                          <td className="p-2 font-bold">{c.customerCode}</td>
                          <td className="p-2 font-sans font-bold">{c.customerName}</td>
                          <td className="p-2">{c.phone}</td>
                          <td className="p-2 text-center">{c.activeMachinesCount}</td>
                          <td className="p-2 text-right">{formatLKR(c.currentMonthRent)}</td>
                          <td className="p-2 text-right">{formatLKR(c.currentMonthPaid)}</td>
                          <td className="p-2 text-right font-bold text-amber-800">{formatLKR(c.netPriorArrears)}</td>
                          <td className="p-2 text-right font-bold text-rose-800">{formatLKR(c.totalBalanceDue)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-mono font-bold">
                      <tr>
                        <td colSpan={7} className="p-2 text-right uppercase">Total Net Balance Due:</td>
                        <td className="p-2 text-right text-rose-900 text-sm">{formatLKR(outstandingData.totalOutstanding)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {activeReportTab === 'overdue_customers' && (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex justify-between font-mono text-xs">
                    <div><strong>Total Default Overdue:</strong> {formatLKR(overdueCustomersData.totalOverdueAmount)}</div>
                    <div><strong>Critical Risk:</strong> {overdueCustomersData.criticalCount}</div>
                    <div><strong>High Risk:</strong> {overdueCustomersData.highCount}</div>
                  </div>

                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Rating</th>
                        <th className="p-2">Code</th>
                        <th className="p-2">Client Name</th>
                        <th className="p-2">Phone</th>
                        <th className="p-2 text-center">Fleet</th>
                        <th className="p-2 text-right">Overdue (LKR)</th>
                        <th className="p-2">Last Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {overdueCustomersData.list.map(c => (
                        <tr key={c.customerId}>
                          <td className="p-2 font-bold text-rose-700">{c.severity}</td>
                          <td className="p-2">{c.customerCode}</td>
                          <td className="p-2 font-sans font-bold">{c.customerName}</td>
                          <td className="p-2">{c.phone}</td>
                          <td className="p-2 text-center">{c.activeMachinesCount}</td>
                          <td className="p-2 text-right font-bold text-rose-800">{formatLKR(c.totalBalanceDue)}</td>
                          <td className="p-2">{c.lastPaymentDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeReportTab === 'machine_utilization' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl font-mono text-xs text-center">
                    <div><strong>Total Fleet:</strong> {machineUtilizationData.totalFleetUnits} Units</div>
                    <div><strong>Deployed:</strong> {machineUtilizationData.totalDeployedUnits} Units</div>
                    <div><strong>Yard Stock:</strong> {machineUtilizationData.availableYardUnits} Units</div>
                    <div><strong>Utilization:</strong> {machineUtilizationData.overallUtilizationRate}%</div>
                  </div>

                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-center">Total Units</th>
                        <th className="p-2 text-center">Deployed</th>
                        <th className="p-2 text-center">Available Stock</th>
                        <th className="p-2 text-right">Utilization (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {machineUtilizationData.categoryBreakdown.map((cat, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold font-sans">{cat.category}</td>
                          <td className="p-2 text-center">{cat.total}</td>
                          <td className="p-2 text-center font-bold text-emerald-800">{cat.deployed}</td>
                          <td className="p-2 text-center text-slate-600">{cat.available}</td>
                          <td className="p-2 text-right font-bold text-purple-900">{cat.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeReportTab === 'profit_loss' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span>Gross Rental Collections Received:</span>
                      <strong className="text-emerald-800">{formatLKR(profitExpenseData.totalIncome)}</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Yard & Technician Operating Expenses:</span>
                      <strong className="text-rose-800">- {formatLKR(profitExpenseData.totalExpenses)}</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Partner Sub-Lease Payables:</span>
                      <strong className="text-amber-800">- {formatLKR(profitExpenseData.totalPartnerLeasePaid)}</strong>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-sm">
                      <span>Net Operating Profit / (Loss):</span>
                      <span className={profitExpenseData.netProfit >= 0 ? 'text-teal-900 font-black' : 'text-rose-900 font-black'}>
                        {formatLKR(profitExpenseData.netProfit)} ({profitExpenseData.profitMargin}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Authorizations and Signatures Block */}
              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-300 font-mono text-xs">
                <div className="text-center">
                  <div className="border-b border-slate-400 pb-8"></div>
                  <div className="font-bold text-slate-800 mt-2">Prepared By</div>
                  <div className="text-[10px] text-slate-500">Accounts & Ledger Executive</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 pb-8"></div>
                  <div className="font-bold text-slate-800 mt-2">Checked & Verified</div>
                  <div className="text-[10px] text-slate-500">Central Yard Operations Manager</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 pb-8"></div>
                  <div className="font-bold text-slate-800 mt-2">Authorized Signatory</div>
                  <div className="text-[10px] text-slate-500">Managing Director / Partner</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
