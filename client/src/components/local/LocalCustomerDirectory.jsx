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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

function parseMonthYear(mStr) {
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

function normalizeMonth(str) {
  if (!str) return '';
  if (/^\d{4}-\d{2}$/.test(str)) {
    const [y, m] = str.split('-').map(Number);
    return `${MONTH_NAMES[(m - 1 + 12) % 12]} ${y}`.toLowerCase();
  }
  return str.trim().toLowerCase();
}

export function LocalCustomerDirectory({
  customers,
  payments,
  machines = [],
  activeMonth,
  allMonths,
  onSwitchMonth,
  onAssignMachine,
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
      status: 'Active'
    };
    if (onAssignMachine) {
      onAssignMachine(assigningCustomer.id, newRental);
    }
    setAssigningCustomer(null);
    setSelectedYardMachineId('');
    setNewSerialNo('');
  };

  // Helper calculation functions
  const getCustomerMonthlyRent = (c) => {
    if (c.isArchived) return 0;
    return (c.rentals || []).filter(r => r.status === 'Active').reduce((sum, r) => sum + (Number(r.rentRate) || 0), 0);
  };

  const getCustomerPaid = (cId) => {
    return (payments || []).filter(p => {
      if (p.customerId !== cId) return false;
      if (p.month === activeMonth) return true;
      return normalizeMonth(p.month) === normalizeMonth(activeMonth);
    }).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  };

  const getCustomerArrears = (c) => {
    const mIdx = (allMonths || []).indexOf(activeMonth);
    if (mIdx <= 0) return Number(c.baseOpeningBalance || 0);

    let prevBal = Number(c.baseOpeningBalance || 0);
    for (let i = 0; i < mIdx; i++) {
      const prevMonth = allMonths[i];
      const prevRent = (c.rentals || []).filter(r => r.status === 'Active').reduce((s, r) => s + (Number(r.rentRate) || 0), 0);
      const prevPaid = (payments || []).filter(p => p.customerId === c.id && (p.month === prevMonth || normalizeMonth(p.month) === normalizeMonth(prevMonth)))
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);
      prevBal = prevBal + prevRent - prevPaid;
    }
    return prevBal;
  };

  const enrichedCustomers = useMemo(() => {
    return (customers || []).map(c => {
      const monthlyRent = getCustomerMonthlyRent(c);
      const arrears = getCustomerArrears(c);
      const paid = getCustomerPaid(c.id);
      const currentBalance = arrears + monthlyRent - paid;
      const isOverdue = currentBalance > 0;

      return {
        ...c,
        monthlyRent,
        arrears,
        paid,
        currentBalance,
        isOverdue
      };
    });
  }, [customers, payments, activeMonth, allMonths]);

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
            
            {/* Month Select */}
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthYearChange(e.target.value, selectedYear)}
              className="bg-carbon-800 text-emerald-300 font-bold px-2.5 py-1.5 rounded-xl border border-carbon-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs"
            >
              {MONTH_NAMES.map(m => (
                <option key={m} value={m} className="bg-carbon-900 text-white font-bold">{m}</option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={selectedYear}
              onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value))}
              className="bg-carbon-800 text-white font-bold px-2.5 py-1.5 rounded-xl border border-carbon-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs"
            >
              {YEARS.map(y => (
                <option key={y} value={y} className="bg-carbon-900 text-white font-bold">{y}</option>
              ))}
            </select>

            {/* Quick Button to Current Real Month */}
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
                  <div className="flex flex-wrap items-center gap-3 bg-carbon-900/90 p-3 rounded-2xl border border-carbon-700 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Opening Arrears</span>
                      <span className="font-bold text-amber-300">{formatLKR(customer.arrears)}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-carbon-700"></div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Monthly Rent</span>
                      <span className="font-bold text-white">{formatLKR(customer.monthlyRent)}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-carbon-700"></div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Paid ({activeMonth})</span>
                      <span className="font-bold text-sky-400">{formatLKR(customer.paid)}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-carbon-700"></div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Net Balance Due</span>
                      <span className={`font-black text-sm ${customer.currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatLKR(customer.currentBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Machinery Fleet Table */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs font-mono">
                    <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      Assigned Machinery Fleet ({activeRentals.length} Active • {returnedRentals.length} Returned)
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
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-carbon-900 text-slate-400 font-mono text-[10px] uppercase border-b border-carbon-800">
                        <tr>
                          <th className="px-3.5 py-2">Code</th>
                          <th className="px-3.5 py-2">Machinery Model Description</th>
                          <th className="px-3.5 py-2">Serial Number (SN)</th>
                          <th className="px-3.5 py-2">Start Date</th>
                          <th className="px-3.5 py-2 text-right">Agreed Monthly Hire</th>
                          <th className="px-3.5 py-2 text-center">Status</th>
                          <th className="px-3.5 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-carbon-800/60 font-mono">
                        {(customer.rentals || []).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-slate-500">
                              No machines currently assigned to this client. Click "Assign New Fleet Machine" above to deploy.
                            </td>
                          </tr>
                        ) : (
                          (customer.rentals || []).map(r => (
                            <tr key={r.machineId} className="hover:bg-carbon-850/40 transition">
                              <td className="px-3.5 py-2.5 font-bold text-sky-400">{r.machineCode || 'MCH'}</td>
                              <td className="px-3.5 py-2.5 font-sans font-bold text-white">
                                {r.model}
                                <span className="text-[10px] text-slate-400 font-mono block">{r.accessories}</span>
                              </td>
                              <td className="px-3.5 py-2.5 text-slate-300 font-bold">{r.serialNumber || 'Yard Batch'}</td>
                              <td className="px-3.5 py-2.5 text-slate-400">{r.startDate || '2026-08-01'}</td>
                              <td className="px-3.5 py-2.5 text-right font-bold text-emerald-400">
                                {formatLKR(r.rentRate)}
                              </td>
                              <td className="px-3.5 py-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  r.status === 'Active' 
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5 text-right">
                                {r.status === 'Returned' ? (
                                  <button
                                    onClick={() => onRollbackReturn(customer.id, r.machineId)}
                                    title="Restore back to Active Fleet"
                                    className="px-2 py-1 rounded bg-carbon-800 hover:bg-emerald-700 text-slate-300 hover:text-white text-[10px] transition font-bold"
                                  >
                                    Restore Active
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onOpenReturnModal(customer, r)}
                                    title="Process Yard Return"
                                    className="px-2 py-1 rounded bg-carbon-800 hover:bg-amber-600 text-slate-300 hover:text-white text-[10px] transition font-bold"
                                  >
                                    Return Note
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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
                      onClick={() => onPrintDoc({ type: 'INVOICE', customer, month: activeMonth })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-sky-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Monthly Rent Invoice"
                    >
                      <FileText className="w-3 h-3 text-sky-400" />
                      <span>Invoice</span>
                    </button>
                    <button
                      onClick={() => onPrintDoc({ type: 'STATEMENT', customer })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-emerald-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Full Rental Statement of Account"
                    >
                      <Printer className="w-3 h-3 text-emerald-400" />
                      <span>Statement</span>
                    </button>
                    <button
                      onClick={() => onPrintDoc({ type: 'AGREEMENT', customer })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-indigo-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Formal Rental Agreement"
                    >
                      <FileCheck className="w-3 h-3 text-indigo-400" />
                      <span>Agreement</span>
                    </button>
                    <button
                      onClick={() => onPrintDoc({ type: 'DELIVERY', customer })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-teal-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Equipment Delivery Note"
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
              {/* Searchable Yard Machinery Selection */}
              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1.5">
                  Select Yard Machine from Master Inventory *
                </label>
                
                {/* Search input for yard machines */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search yard machine by model, brand, code..."
                    value={yardSearch}
                    onChange={(e) => setYardSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-carbon-950 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <select
                  required
                  value={selectedYardMachineId}
                  onChange={(e) => {
                    const ym = (machines || []).find(m => m.id === e.target.value);
                    if (ym) handleSelectYardMachine(ym);
                    else setSelectedYardMachineId('');
                  }}
                  className="w-full px-3 py-2.5 bg-carbon-950 border border-carbon-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choose Yard Machine ({filteredYardMachines.length} available) --</option>
                  {filteredYardMachines.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.machineCode}] {m.brand} {m.model} • Rate: LKR {m.standardMonthlyRent?.toLocaleString()}/mo • Stock: {m.totalYardStock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled Details Preview */}
              {selectedYardMachineId && selectedYardMachine && (
                <div className="p-3.5 rounded-2xl bg-carbon-950/70 border border-carbon-800 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
                    Auto-Filled Machine Specifications:
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Brand & Model:</span>
                      <span className="font-bold text-white">
                        {selectedYardMachine.brand} {selectedYardMachine.model}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Yard Code:</span>
                      <span className="font-bold text-sky-400">{selectedYardMachine.machineCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Category:</span>
                      <span>{selectedYardMachine.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Standard Rent:</span>
                      <span className="text-emerald-400 font-bold">LKR {selectedYardMachine.standardMonthlyRent?.toLocaleString()} / mo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Serial Number & Rent Rate inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">
                    Serial Number (SN) * (Required)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-8700-4491"
                    value={newSerialNo}
                    onChange={(e) => setNewSerialNo(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Only manual entry required</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] font-mono mb-1">
                    Agreed Monthly Hire (LKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={newRentRate}
                    onChange={(e) => setNewRentRate(e.target.value)}
                    className="w-full px-3 py-2 bg-carbon-950 border border-carbon-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Start Date & Accessories */}
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
    </section>
  );
}
