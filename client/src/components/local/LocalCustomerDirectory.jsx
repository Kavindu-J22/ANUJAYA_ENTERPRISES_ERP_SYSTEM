import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  CreditCard, 
  RotateCcw, 
  FileText, 
  FileCheck, 
  Truck, 
  Edit3, 
  Archive, 
  Trash2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Printer,
  Calendar,
  X,
  Warehouse
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
export const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export function parseMonthYear(mStr) {
  if (!mStr) {
    const now = new Date();
    return { month: MONTH_NAMES[now.getMonth()], year: now.getFullYear() };
  }
  const parts = mStr.trim().split(/\s+/);
  if (parts.length === 2 && MONTH_NAMES.includes(parts[0])) {
    return { month: parts[0], year: parseInt(parts[1]) || 2026 };
  }
  if (/^\d{4}-\d{2}$/.test(mStr)) {
    const [y, m] = mStr.split('-').map(Number);
    return { month: MONTH_NAMES[(m - 1 + 12) % 12], year: y };
  }
  return { month: "October", year: 2026 };
}

export function getYearMonth(mStr) {
  if (!mStr) {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  if (/^\d{4}-\d{2}$/.test(mStr)) {
    const [y, m] = mStr.split('-').map(Number);
    return { year: y, month: m - 1 };
  }
  const parts = mStr.trim().split(/\s+/);
  if (parts.length === 2 && MONTH_NAMES.includes(parts[0])) {
    return { year: parseInt(parts[1]) || 2026, month: MONTH_NAMES.indexOf(parts[0]) };
  }
  return { year: 2026, month: 9 };
}

export function getDateYearMonth(dateStr) {
  if (!dateStr) return { year: 2000, month: 0 };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { year: 2000, month: 0 };
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function compareYM(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}

export function paymentBelongsToYM(p, ym) {
  if (p.month) {
    const pYM = getYearMonth(p.month);
    if (pYM.year === ym.year && pYM.month === ym.month) return true;
  }
  if (p.date) {
    const pDateYM = getDateYearMonth(p.date);
    if (pDateYM.year === ym.year && pDateYM.month === ym.month) return true;
  }
  return false;
}

export function calculateCustomerArrearsBreakdown(customer, payments, activeMonth) {
  const activeYM = getYearMonth(activeMonth);
  
  let earliestYM = { ...activeYM };
  
  (customer.rentals || []).forEach(r => {
    if (r.startDate) {
      const ym = getDateYearMonth(r.startDate);
      if (compareYM(ym, earliestYM) < 0) earliestYM = ym;
    }
  });

  (payments || []).filter(p => p.customerId === customer.id).forEach(p => {
    if (p.month) {
      const ym = getYearMonth(p.month);
      if (compareYM(ym, earliestYM) < 0) earliestYM = ym;
    } else if (p.date) {
      const ym = getDateYearMonth(p.date);
      if (compareYM(ym, earliestYM) < 0) earliestYM = ym;
    }
  });

  const breakdown = [];
  let curY = earliestYM.year;
  let curM = earliestYM.month;

  let totalPreviousRent = 0;
  let totalPreviousPaid = 0;

  while (curY < activeYM.year || (curY === activeYM.year && curM < activeYM.month)) {
    const ym = { year: curY, month: curM };
    const monthLabel = `${MONTH_NAMES[curM]} ${curY}`;

    const monthRentals = (customer.rentals || []).filter(r => {
      const rYM = getDateYearMonth(r.startDate || '2026-01-01');
      if (compareYM(rYM, ym) > 0) return false;
      if (r.status === 'Returned' && r.returnDetails?.returnDate) {
        const retYM = getDateYearMonth(r.returnDetails.returnDate);
        if (compareYM(retYM, ym) < 0) return false;
      }
      return true;
    });

    const monthRent = monthRentals.reduce((sum, r) => sum + (Number(r.rentRate) || 0), 0);
    const monthPaid = (payments || []).filter(p => p.customerId === customer.id && paymentBelongsToYM(p, ym))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const netArrears = monthRent - monthPaid;
    totalPreviousRent += monthRent;
    totalPreviousPaid += monthPaid;

    breakdown.push({
      monthLabel,
      year: curY,
      month: curM,
      machineCount: monthRentals.length,
      monthRent,
      monthPaid,
      netArrears
    });

    curM++;
    if (curM > 11) {
      curM = 0;
      curY++;
    }
  }

  const carriedBase = Number(customer.baseOpeningBalance || 0);
  const netPreviousArrears = carriedBase + (totalPreviousRent - totalPreviousPaid);

  return {
    breakdown,
    carriedBase,
    totalPreviousRent,
    totalPreviousPaid,
    netPreviousArrears
  };
}

// Subcomponent: Fleet Item Edit Modal
function FleetItemEditModal({ item, onClose, onSave }) {
  const { customer, rental } = item;
  const [model, setModel] = useState(rental.model || '');
  const [machineCode, setMachineCode] = useState(rental.machineCode || '');
  const [serialNumber, setSerialNumber] = useState(rental.serialNumber || '');
  const [rentRate, setRentRate] = useState(rental.rentRate || 4500);
  const [startDate, setStartDate] = useState(rental.startDate || new Date().toISOString().slice(0, 10));
  const [accessories, setAccessories] = useState(rental.accessories || '');
  const [deliveryStatus, setDeliveryStatus] = useState(rental.deliveryStatus || 'Ongoing');
  const [deliveredDate, setDeliveredDate] = useState(rental.deliveredDate || new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState(rental.status || 'Active');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...rental,
      model,
      machineCode,
      serialNumber,
      rentRate: parseFloat(rentRate) || 0,
      startDate,
      accessories,
      deliveryStatus,
      deliveredDate: deliveryStatus === 'Handovered' ? (deliveredDate || new Date().toISOString().slice(0, 10)) : (rental.deliveredDate || ''),
      status
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-carbon-700 shadow-2xl space-y-5 my-8">
        <div className="flex justify-between items-center pb-3 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-sky-400" />
              <span>Edit Assigned Fleet Machine</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Client: <span className="text-white font-bold">{customer.name}</span> ({customer.code})
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Machine Code</label>
              <input
                type="text"
                required
                value={machineCode}
                onChange={(e) => setMachineCode(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-sky-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Serial Number (SN)</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-white font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Machinery Model Description</label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Monthly Rent (LKR)</label>
              <input
                type="number"
                step="any"
                required
                value={rentRate}
                onChange={(e) => setRentRate(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-emerald-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Rental Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Included Accessories</label>
            <input
              type="text"
              value={accessories}
              onChange={(e) => setAccessories(e.target.value)}
              className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Delivery Status</label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-white font-bold"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Handovered">Handovered</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Delivered Date</label>
              <input
                type="date"
                disabled={deliveryStatus !== 'Handovered'}
                value={deliveredDate}
                onChange={(e) => setDeliveredDate(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-white font-mono disabled:opacity-40"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">Fleet Operational Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-white font-bold"
            >
              <option value="Active">Active Fleet</option>
              <option value="Returned">Returned to Yard</option>
            </select>
          </div>

          <div className="pt-3 border-t border-carbon-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Machine Updates</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponent: Arrears Breakdown Modal
function ArrearsBreakdownModal({ customer, arrearsData, onClose }) {
  if (!customer || !arrearsData) return null;
  const { breakdown = [], carriedBase = 0, netPreviousArrears = 0 } = arrearsData;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-carbon-700 shadow-2xl space-y-5 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Previous Months Arrears Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Client: <span className="text-white font-bold">{customer.name}</span> ({customer.code})
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {carriedBase > 0 && (
          <div className="p-3 bg-carbon-900 border border-amber-500/30 rounded-2xl flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 font-bold">Carried Initial Opening Balance:</span>
            <span className="font-black text-amber-300">{formatLKR(carriedBase)}</span>
          </div>
        )}

        <div className="bg-carbon-900/80 rounded-2xl border border-carbon-800 overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-carbon-950 text-slate-400 text-[10px] uppercase border-b border-carbon-800">
              <tr>
                <th className="p-3">Prior Month</th>
                <th className="p-3 text-center">Active Fleet</th>
                <th className="p-3 text-right">Rent Accrued</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Month Arrears</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60">
              {breakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-slate-500">
                    No prior month rental cycles recorded for this account.
                  </td>
                </tr>
              ) : (
                breakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-carbon-850/50">
                    <td className="p-3 font-bold text-white">{row.monthLabel}</td>
                    <td className="p-3 text-center text-slate-300">{row.machineCount} unit(s)</td>
                    <td className="p-3 text-right text-slate-300">{formatLKR(row.monthRent)}</td>
                    <td className="p-3 text-right text-sky-400">{formatLKR(row.monthPaid)}</td>
                    <td className={`p-3 text-right font-bold ${row.netArrears > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatLKR(row.netArrears)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex justify-between items-center font-mono">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-300 block">Total Previous Months Arrears:</span>
            <span className="text-xs text-slate-400">Sum of initial carried balance + all prior unpaid month balances</span>
          </div>
          <span className="text-xl font-black text-amber-300">
            {formatLKR(netPreviousArrears)}
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-white font-bold text-xs"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}

export function LocalCustomerDirectory({
  customers,
  payments,
  machines = [],
  activeMonth,
  allMonths,
  onSwitchMonth,
  onAssignMachine,
  onUpdateRental,
  onDeleteRental,
  onOpenNewCustomer,
  onOpenEditCustomer,
  onOpenPaymentModal,
  onOpenReturnModal,
  onRollbackReturn,
  onToggleArchive,
  onDeleteCustomer,
  onPrintDoc
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteCustId, setConfirmDeleteCustId] = useState(null);
  const [confirmDeleteRentalKey, setConfirmDeleteRentalKey] = useState(null);
  const [editingFleetItem, setEditingFleetItem] = useState(null);
  const [viewingArrearsCustomer, setViewingArrearsCustomer] = useState(null);
  // Optimistic local state for delivery status changes (key: `${customerId}_${machineId}`)
  const [pendingDeliveryStatus, setPendingDeliveryStatus] = useState({});

  // Month & Year selection state
  const parsedActive = parseMonthYear(activeMonth);
  const [selectedMonth, setSelectedMonth] = useState(parsedActive.month);
  const [selectedYear, setSelectedYear] = useState(parsedActive.year);

  useEffect(() => {
    const parsed = parseMonthYear(activeMonth);
    setSelectedMonth(parsed.month);
    setSelectedYear(parsed.year);
  }, [activeMonth]);

  const handleMonthYearChange = (newM, newY) => {
    setSelectedMonth(newM);
    setSelectedYear(newY);
    const targetStr = `${newM} ${newY}`;
    if (onSwitchMonth) {
      onSwitchMonth(targetStr);
    }
  };

  const handleJumpCurrentMonth = () => {
    const now = new Date();
    const currM = MONTH_NAMES[now.getMonth()];
    const currY = now.getFullYear();
    handleMonthYearChange(currM, currY);
  };

  // Assign Yard Machine state
  const [assigningCustomer, setAssigningCustomer] = useState(null);
  const [selectedYardMachineId, setSelectedYardMachineId] = useState('');
  const [yardSearch, setYardSearch] = useState('');
  const [newSerialNo, setNewSerialNo] = useState('');
  const [newRentRate, setNewRentRate] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newAccessories, setNewAccessories] = useState('');
  const [newProrated, setNewProrated] = useState(false);

  const selectedYardMachine = useMemo(() => {
    return (machines || []).find(m => m.id === selectedYardMachineId);
  }, [machines, selectedYardMachineId]);

  const filteredYardMachines = useMemo(() => {
    const q = yardSearch.toLowerCase().trim();
    if (!q) return machines || [];
    return (machines || []).filter(m =>
      (m.machineCode || '').toLowerCase().includes(q) ||
      (m.brand || '').toLowerCase().includes(q) ||
      (m.model || '').toLowerCase().includes(q) ||
      (m.category || '').toLowerCase().includes(q)
    );
  }, [machines, yardSearch]);

  const handleSelectYardMachine = (ym) => {
    setSelectedYardMachineId(ym.id);
    setNewRentRate(ym.standardMonthlyRent || 4500);
    setNewAccessories(ym.accessories || 'Complete Stand, Table, Servo Motor');
    setNewSerialNo('');
  };

  const handleConfirmAssign = (e) => {
    e.preventDefault();
    if (!assigningCustomer || !selectedYardMachine) return;
    if (!newSerialNo.trim()) {
      alert("Physical Serial Number (SN) is required.");
      return;
    }
    const newRental = {
      machineId: "m_" + Date.now(),
      machineCode: selectedYardMachine.machineCode,
      model: `${selectedYardMachine.brand} ${selectedYardMachine.model}`,
      serialNumber: newSerialNo.trim(),
      rentRate: parseFloat(newRentRate) || selectedYardMachine.standardMonthlyRent || 0,
      accessories: newAccessories || selectedYardMachine.accessories || 'Complete Set',
      startDate: newStartDate || new Date().toISOString().slice(0, 10),
      isProratedFirstMonth: newProrated,
      deliveryStatus: 'Ongoing',
      deliveredDate: '',
      status: 'Active'
    };
    if (onAssignMachine) {
      onAssignMachine(assigningCustomer.id, newRental);
    }
    setAssigningCustomer(null);
    setSelectedYardMachineId('');
    setNewSerialNo('');
  };

  // Use locally-selected month/year so isFutureItem reflects UI selection immediately
  const currentYM = useMemo(() => ({
    year: selectedYear,
    month: MONTH_NAMES.indexOf(selectedMonth)
  }), [selectedMonth, selectedYear]);

  const enrichedCustomers = useMemo(() => {
    return (customers || []).map(c => {
      const arrearsData = calculateCustomerArrearsBreakdown(c, payments, activeMonth);
      const arrears = arrearsData.netPreviousArrears;

      // Current Month Rent: only active rentals whose startDate <= currentYM
      const monthlyRent = c.isArchived ? 0 : (c.rentals || []).filter(r => {
        if (r.status !== 'Active') return false;
        const rYM = getDateYearMonth(r.startDate || '2026-01-01');
        return compareYM(rYM, currentYM) <= 0;
      }).reduce((sum, r) => sum + (Number(r.rentRate) || 0), 0);

      const paid = (payments || []).filter(p => p.customerId === c.id && paymentBelongsToYM(p, currentYM))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const currentBalance = arrears + monthlyRent - paid;
      const isOverdue = currentBalance > 0;

      return {
        ...c,
        arrearsData,
        monthlyRent,
        arrears,
        paid,
        currentBalance,
        isOverdue
      };
    });
  }, [customers, payments, activeMonth, currentYM]);

  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter(c => {
      if (statusFilter === 'ACTIVE' && c.isArchived) return false;
      if (statusFilter === 'CLOSED' && !c.isArchived) return false;
      if (statusFilter === 'OVERDUE' && (!c.isOverdue || c.isArchived)) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchRental = (c.rentals || []).some(r => 
        (r.model || '').toLowerCase().includes(q) || 
        (r.serialNumber || '').toLowerCase().includes(q) ||
        (r.machineCode || '').toLowerCase().includes(q)
      );

      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        matchRental
      );
    });
  }, [enrichedCustomers, statusFilter, searchQuery]);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Master Apparel Clients & Fleet Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Active Accounts, Monthly Fleet Hire Ledgers & Operational Documents
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Enhanced Month & Year Selector */}
          <div className="flex items-center gap-1.5 p-1.5 bg-carbon-900 border border-carbon-700/80 rounded-2xl shadow-inner font-mono text-xs">
            <div className="flex items-center gap-1 px-2 py-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Month:</span>
            </div>
            
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthYearChange(e.target.value, selectedYear)}
              className="bg-carbon-800 text-emerald-300 font-bold px-2.5 py-1.5 rounded-xl border border-carbon-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs"
            >
              {MONTH_NAMES.map(m => (
                <option key={m} value={m} className="bg-carbon-900 text-white font-bold">{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value))}
              className="bg-carbon-800 text-white font-bold px-2.5 py-1.5 rounded-xl border border-carbon-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs"
            >
              {YEARS.map(y => (
                <option key={y} value={y} className="bg-carbon-900 text-white font-bold">{y}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleJumpCurrentMonth}
              className="px-2 py-1 text-[10px] font-bold bg-carbon-800 hover:bg-carbon-700 text-slate-300 hover:text-white rounded-xl transition border border-carbon-700/60"
              title="Jump to Current Real-time Month"
            >
              Current
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Client, SN, Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={onOpenNewCustomer}
            className="bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center text-xs font-mono">
        {[
          { key: 'ALL', label: `All Clients (${enrichedCustomers.length})` },
          { key: 'ACTIVE', label: `Active Accounts (${enrichedCustomers.filter(x => !x.isArchived).length})` },
          { key: 'OVERDUE', label: `Overdue Balances (${enrichedCustomers.filter(x => x.isOverdue && !x.isArchived).length})` },
          { key: 'CLOSED', label: `Closed Accounts (${enrichedCustomers.filter(x => x.isArchived).length})` }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition border ${
              statusFilter === item.key
                ? 'bg-sky-600/30 text-sky-300 border-sky-500'
                : 'bg-carbon-900 text-slate-400 border-carbon-700 hover:border-carbon-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Customer Cards */}
      <div className="space-y-6">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono glass-card rounded-3xl">
            No matching client accounts found.
          </div>
        ) : (
          filteredCustomers.map(customer => {
            const activeRentals = (customer.rentals || []).filter(r => r.status === 'Active');
            const returnedRentals = (customer.rentals || []).filter(r => r.status === 'Returned');
            const handoveredCount = (customer.rentals || []).filter(r => r.deliveryStatus === 'Handovered').length;

            return (
              <div 
                key={customer.id} 
                className={`glass-card p-6 sm:p-7 rounded-3xl border transition space-y-5 ${
                  customer.isArchived 
                    ? 'border-carbon-800 opacity-70 bg-carbon-950/60' 
                    : customer.isOverdue 
                    ? 'border-rose-500/40 hover:border-rose-500/70' 
                    : 'border-carbon-700/80 hover:border-sky-500/40'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-carbon-700/60">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-carbon-800 border border-carbon-700 text-sky-400 font-bold">
                        {customer.code}
                      </span>
                      <h3 className="font-display font-extrabold text-xl text-white">
                        {customer.name}
                      </h3>
                      {customer.isArchived ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                          CLOSED ACCOUNT
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                          ACTIVE ACCOUNT
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-sky-400" />
                        {customer.phone || 'No Contact'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {customer.address || 'Sri Lanka'}
                      </span>
                      {customer.email && (
                        <span className="text-slate-400">
                          ✉️ {customer.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Metrics Pill */}
                  <div className="flex flex-wrap items-center gap-3 bg-carbon-900/90 p-3 rounded-2xl border border-carbon-700 font-mono text-xs shadow-inner">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Opening / Prev. Arrears</span>
                        <button
                          type="button"
                          onClick={() => setViewingArrearsCustomer({ customer, arrearsData: customer.arrearsData })}
                          className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[9px] font-bold border border-amber-500/40 transition flex items-center gap-1 cursor-pointer"
                          title="Click to view previous months arrears breakdown"
                        >
                          <span>Breakdown</span>
                          <span className="text-[8px]">🔍</span>
                        </button>
                      </div>
                      <span className="font-bold text-amber-300">{formatLKR(customer.arrears)}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-carbon-700"></div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Monthly Rent ({activeMonth})</span>
                      <span className="font-bold text-white">{formatLKR(customer.monthlyRent)}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-carbon-700"></div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Paid ({activeMonth})</span>
                      <span className="font-bold text-sky-400">{formatLKR(customer.paid)}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-carbon-700"></div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Net Balance Due</span>
                      <span className={`font-black text-sm ${customer.currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatLKR(customer.currentBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Machinery Fleet Table */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs font-mono">
                    <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                      <span>Assigned Machinery Fleet ({activeRentals.length} Active • {returnedRentals.length} Returned)</span>
                      <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800">
                        {handoveredCount} Handovered
                      </span>
                    </span>
                    <button
                      onClick={() => {
                        setAssigningCustomer(customer);
                        setSelectedYardMachineId('');
                        setNewSerialNo('');
                        setYardSearch('');
                        setNewStartDate(new Date().toISOString().slice(0, 10));
                        setNewProrated(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/50 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Assign New Fleet Machine</span>
                    </button>
                  </div>

                  <div className="bg-carbon-900/60 rounded-2xl border border-carbon-800/80 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-carbon-900 text-slate-400 font-mono text-[10px] uppercase border-b border-carbon-800">
                          <tr>
                            <th className="px-3 py-2.5">Code</th>
                            <th className="px-3 py-2.5">Machinery Model Description</th>
                            <th className="px-3 py-2.5">Serial Number (SN)</th>
                            <th className="px-3 py-2.5">Start Date</th>
                            <th className="px-3 py-2.5 text-right">Agreed Monthly Hire</th>
                            <th className="px-3 py-2.5 text-center">Delivery Status</th>
                            <th className="px-3 py-2.5 text-center">Cycle Status</th>
                            <th className="px-3 py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-carbon-800/60 font-mono">
                          {(customer.rentals || []).length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-5 text-slate-500">
                                No machines currently assigned to this client. Click "Assign New Fleet Machine" above to deploy.
                              </td>
                            </tr>
                          ) : (
                            (customer.rentals || []).map(r => {
                              const rYM = getDateYearMonth(r.startDate || '2026-01-01');
                              const isFutureItem = compareYM(rYM, currentYM) > 0;
                              const pendingKey = `${customer.id}_${r.machineId}`;
                              const currentDeliveryStatus = pendingDeliveryStatus[pendingKey] ?? (r.deliveryStatus || 'Ongoing');
                              const isHandovered = currentDeliveryStatus === 'Handovered';

                              return (
                                <tr 
                                  key={r.machineId} 
                                  className={`transition ${isFutureItem ? 'opacity-80 bg-carbon-900/40' : 'hover:bg-carbon-850/40'}`}
                                >
                                  <td className="px-3 py-2.5 font-bold text-sky-400">{r.machineCode || 'MCH'}</td>
                                  <td className="px-3 py-2.5 font-sans font-bold text-white">
                                    {r.model}
                                    <span className="text-[10px] text-slate-400 font-mono block">{r.accessories}</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-slate-300 font-bold">{r.serialNumber || 'Yard Batch'}</td>
                                  <td className="px-3 py-2.5 text-slate-400">{r.startDate || '2026-08-01'}</td>
                                  <td className="px-3 py-2.5 text-right font-bold text-emerald-400">
                                    {formatLKR(r.rentRate)}
                                  </td>

                                  {/* Delivery Status Column with optimistic inline toggle */}
                                  <td className="px-3 py-2.5 text-center">
                                    <div className="inline-flex flex-col items-center gap-1">
                                      <select
                                        value={currentDeliveryStatus}
                                        onChange={(e) => {
                                          const newStatus = e.target.value;
                                          const newDeliveredDate = newStatus === 'Handovered'
                                            ? (r.deliveredDate || new Date().toISOString().slice(0, 10))
                                            : r.deliveredDate;
                                          // Optimistic update — show change immediately
                                          setPendingDeliveryStatus(prev => ({ ...prev, [pendingKey]: newStatus }));
                                          if (onUpdateRental) {
                                            Promise.resolve(onUpdateRental(customer.id, {
                                              ...r,
                                              deliveryStatus: newStatus,
                                              deliveredDate: newDeliveredDate
                                            })).finally(() => {
                                              // Once API resolves, clear optimistic override
                                              setPendingDeliveryStatus(prev => {
                                                const next = { ...prev };
                                                delete next[pendingKey];
                                                return next;
                                              });
                                            });
                                          }
                                        }}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border focus:outline-none cursor-pointer ${
                                          isHandovered
                                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                            : 'bg-amber-950 text-amber-300 border-amber-700'
                                        }`}
                                      >
                                        <option value="Ongoing" className="bg-carbon-900 text-amber-300">Ongoing</option>
                                        <option value="Handovered" className="bg-carbon-900 text-emerald-300">Handovered</option>
                                      </select>
                                      {isHandovered && (
                                        <span className="text-[9px] text-emerald-400 font-mono block">
                                          Del: {r.deliveredDate || new Date().toISOString().slice(0, 10)}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Cycle & Operational Status */}
                                  <td className="px-3 py-2.5 text-center">
                                    {isFutureItem ? (
                                      <span 
                                        className="px-2 py-0.5 rounded text-[9px] font-bold bg-carbon-800 text-slate-300 border border-carbon-700 block text-center"
                                        title={`Starts ${r.startDate} — Not billed in ${activeMonth}`}
                                      >
                                        Inactive for {selectedMonth}
                                        <span className="block text-[8px] text-sky-400">Starts {r.startDate}</span>
                                      </span>
                                    ) : (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        r.status === 'Active' 
                                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                                      }`}>
                                        {r.status}
                                      </span>
                                    )}
                                  </td>

                                  {/* Row Actions */}
                                  <td className="px-3 py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Individual Delivery Note Button (only if Handovered) */}
                                      {isHandovered && (
                                        <button
                                          type="button"
                                          onClick={() => onPrintDoc({ type: 'DELIVERY', customer, singleRental: r })}
                                          title="Print Individual Delivery Note for this Handovered Unit"
                                          className="px-2 py-1 rounded bg-teal-950/70 hover:bg-teal-700 text-teal-300 hover:text-white border border-teal-800 text-[10px] transition font-bold flex items-center gap-1"
                                        >
                                          <Truck className="w-3 h-3 text-teal-400" />
                                          <span>Delivery Note</span>
                                        </button>
                                      )}

                                      {/* Edit Fleet Item */}
                                      <button
                                        type="button"
                                        onClick={() => setEditingFleetItem({ customer, rental: r })}
                                        title="Edit Machine Details, Serial No & Hire Rate"
                                        className="p-1 rounded bg-carbon-800 hover:bg-sky-700 text-slate-300 hover:text-white text-[10px] transition font-bold"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Return or Restore */}
                                      {r.status === 'Returned' ? (
                                        <button
                                          type="button"
                                          onClick={() => onRollbackReturn(customer.id, r.machineId)}
                                          title="Restore back to Active Fleet"
                                          className="px-2 py-1 rounded bg-carbon-800 hover:bg-emerald-700 text-slate-300 hover:text-white text-[10px] transition font-bold"
                                        >
                                          Restore
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => onOpenReturnModal(customer, r)}
                                          title="Process Yard Return"
                                          className="px-2 py-1 rounded bg-carbon-800 hover:bg-amber-600 text-slate-300 hover:text-white text-[10px] transition font-bold"
                                        >
                                          Return
                                        </button>
                                      )}

                                      {/* Delete with Restock Inline Confirmation */}
                                      {confirmDeleteRentalKey === `${customer.id}_${r.machineId}` ? (
                                        <div className="flex items-center gap-1 animate-fadeIn">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setConfirmDeleteRentalKey(null);
                                              if (onDeleteRental) {
                                                onDeleteRental(customer.id, r.machineId);
                                              }
                                            }}
                                            className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-mono text-[9px] font-bold"
                                            title="Confirm Delete and Restock Yard Master"
                                          >
                                            Confirm?
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteRentalKey(null)}
                                            className="px-1.5 py-1 bg-carbon-700 hover:bg-carbon-600 text-slate-300 rounded font-mono text-[9px]"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteRentalKey(`${customer.id}_${r.machineId}`)}
                                          title="Delete machine from customer & Restock Rental Machinery Master Yard"
                                          className="p-1 rounded bg-carbon-800 hover:bg-rose-900 border border-carbon-700 text-slate-400 hover:text-rose-300 transition"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Operations & Document Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-carbon-700/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onOpenPaymentModal(customer)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                    <button
                      onClick={() => onOpenReturnModal(customer)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/50 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yard Return</span>
                    </button>
                  </div>

                  {/* Print Document Triggers & Management */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onPrintDoc({ 
                        type: 'INVOICE', 
                        customer, 
                        month: activeMonth, 
                        payments, 
                        arrearsData: customer.arrearsData 
                      })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-sky-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Monthly Rent Invoice"
                    >
                      <FileText className="w-3 h-3 text-sky-400" />
                      <span>Invoice</span>
                    </button>
                    <button
                      onClick={() => onPrintDoc({ 
                        type: 'STATEMENT', 
                        customer, 
                        payments, 
                        activeMonth, 
                        arrearsData: customer.arrearsData 
                      })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-emerald-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Full Rental Statement of Account"
                    >
                      <Printer className="w-3 h-3 text-emerald-400" />
                      <span>Statement</span>
                    </button>
                    <button
                      onClick={() => onPrintDoc({ 
                        type: 'AGREEMENT', 
                        customer,
                        activeMonth 
                      })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-indigo-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Formal Rental Agreement (Fully Editable)"
                    >
                      <FileCheck className="w-3 h-3 text-indigo-400" />
                      <span>Agreement</span>
                    </button>
                    <button
                      onClick={() => onPrintDoc({ 
                        type: 'DELIVERY', 
                        customer, 
                        handoveredOnly: true 
                      })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-teal-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Full Delivery Note (Handovered Units Only)"
                    >
                      <Truck className="w-3 h-3 text-teal-400" />
                      <span>Delivery</span>
                    </button>

                    <button
                      onClick={() => onOpenEditCustomer(customer)}
                      className="p-1.5 rounded-lg bg-carbon-850 hover:bg-carbon-800 border border-carbon-700 text-slate-400 hover:text-white transition"
                      title="Edit Customer Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleArchive(customer)}
                      className="p-1.5 rounded-lg bg-carbon-850 hover:bg-amber-900/60 border border-carbon-700 text-slate-400 hover:text-amber-300 transition"
                      title={customer.isArchived ? "Re-activate Account" : "Close Customer Account"}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteCustId === customer.id ? (
                      <div className="flex items-center gap-1 animate-fadeIn">
                        <button
                          onClick={() => {
                            setConfirmDeleteCustId(null);
                            onDeleteCustomer(customer.id);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-mono text-[10px] font-bold"
                          title="Confirm Delete"
                        >
                          Confirm?
                        </button>
                        <button
                          onClick={() => setConfirmDeleteCustId(null)}
                          className="px-1.5 py-1 bg-carbon-700 hover:bg-carbon-600 text-slate-300 rounded font-mono text-[10px]"
                          title="Cancel"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteCustId(customer.id)}
                        className="p-1.5 rounded-lg bg-carbon-850 hover:bg-rose-900 border border-carbon-700 text-slate-400 hover:text-rose-300 transition"
                        title="Delete Customer from System"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Yard Fleet Machine to Client Modal */}
      {assigningCustomer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-carbon-900 border border-carbon-700/90 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                  <Warehouse className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">
                    Assign Fleet Machinery to Client
                  </h3>
                  <p className="text-xs text-sky-400 font-mono">
                    {assigningCustomer.name} ({assigningCustomer.code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssigningCustomer(null)}
                className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1.5">
                  Select Yard Machine from Master Inventory *
                </label>
                
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search master machinery by code, brand, model..."
                    value={yardSearch}
                    onChange={(e) => setYardSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-carbon-950 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-carbon-700/80 bg-carbon-950/70 divide-y divide-carbon-800/80 font-mono">
                  {filteredYardMachines.length === 0 ? (
                    <div className="p-3 text-center text-slate-500 text-xs">
                      No matching yard machinery models found.
                    </div>
                  ) : (
                    filteredYardMachines.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectYardMachine(m)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                          selectedYardMachineId === m.id
                            ? 'bg-sky-600/30 border-l-4 border-sky-400'
                            : 'hover:bg-carbon-800/60'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span className="text-sky-400">{m.machineCode}</span>
                            <span>{m.brand} {m.model}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {m.category} • Location: {m.yardLocation || 'Kosgama Bay 1'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 block">
                            {formatLKR(m.standardMonthlyRent || 4500)}/mo
                          </span>
                          <span className="text-[9px] text-slate-400">
                            Available: {m.availableInYard != null ? m.availableInYard : m.totalYardStock}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedYardMachine && (
                <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-2xl flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sky-400 block">Selected Fleet Asset</span>
                    <span className="text-sm font-bold text-white font-sans">{selectedYardMachine.brand} {selectedYardMachine.model}</span>
                    <span className="text-[11px] text-slate-400 block">Code: {selectedYardMachine.machineCode}</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">
                    {formatLKR(selectedYardMachine.standardMonthlyRent || 4500)}/mo
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">
                    Physical Serial Number (SN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-8700-44912"
                    value={newSerialNo}
                    onChange={(e) => setNewSerialNo(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">
                    Monthly Rent Rate (LKR) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newRentRate}
                    onChange={(e) => setNewRentRate(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">
                    Rental Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">
                    Accessories / Configuration
                  </label>
                  <input
                    type="text"
                    value={newAccessories}
                    onChange={(e) => setNewAccessories(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-700 rounded-xl text-slate-300 focus:outline-none focus:border-sky-500"
                    placeholder="Complete Stand, Table, Servo Motor"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  id="proratedCheck"
                  checked={newProrated}
                  onChange={(e) => setNewProrated(e.target.checked)}
                  className="rounded bg-carbon-950 border-carbon-700 text-sky-500 focus:ring-0"
                />
                <label htmlFor="proratedCheck" className="cursor-pointer">
                  Calculate prorated days for the first month
                </label>
              </div>

              <div className="pt-3 border-t border-carbon-700/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningCustomer(null)}
                  className="px-4 py-2 bg-carbon-800 hover:bg-carbon-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedYardMachineId || !newSerialNo.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deploy & Assign Machine</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fleet Item Modal */}
      {editingFleetItem && (
        <FleetItemEditModal
          item={editingFleetItem}
          onClose={() => setEditingFleetItem(null)}
          onSave={(updatedRental) => {
            if (onUpdateRental) {
              onUpdateRental(editingFleetItem.customer.id, updatedRental);
            }
            setEditingFleetItem(null);
          }}
        />
      )}

      {/* Arrears Breakdown Modal */}
      {viewingArrearsCustomer && (
        <ArrearsBreakdownModal
          customer={viewingArrearsCustomer.customer}
          arrearsData={viewingArrearsCustomer.arrearsData}
          onClose={() => setViewingArrearsCustomer(null)}
        />
      )}
    </section>
  );
}
