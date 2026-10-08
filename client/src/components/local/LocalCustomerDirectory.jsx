import React, { useState, useMemo } from 'react';
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
  Printer
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalCustomerDirectory({
  customers,
  payments,
  activeMonth,
  allMonths,
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

  // Helper calculation functions matching system.html
  const getCustomerMonthlyRent = (c) => {
    if (c.isArchived) return 0;
    return (c.rentals || []).filter(r => r.status === 'Active').reduce((sum, r) => sum + (Number(r.rentRate) || 0), 0);
  };

  const getCustomerPaid = (cId) => {
    return (payments || []).filter(p => p.customerId === cId && p.month === activeMonth)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  };

  const getCustomerArrears = (c) => {
    const mIdx = allMonths.indexOf(activeMonth);
    if (mIdx <= 0) return Number(c.baseOpeningBalance || 0);

    // Recursively compute previous month balance
    let prevBal = Number(c.baseOpeningBalance || 0);
    for (let i = 0; i < mIdx; i++) {
      const prevMonth = allMonths[i];
      const prevRent = (c.rentals || []).filter(r => r.status === 'Active').reduce((s, r) => s + (Number(r.rentRate) || 0), 0);
      const prevPaid = (payments || []).filter(p => p.customerId === c.id && p.month === prevMonth)
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
        (r.serialNumber || '').toLowerCase().includes(q)
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
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Master Apparel Clients & Fleet Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Active Accounts, Monthly Fleet Hire Ledgers & Operational Documents
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
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
            className="bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
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
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      Assigned Machinery Fleet ({activeRentals.length} Active • {returnedRentals.length} Returned)
                    </span>
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
                              No machines currently assigned to this client.
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
                              <td className="px-3.5 py-2.5 text-slate-300">{r.serialNumber || 'Yard Batch'}</td>
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
                                    className="px-2 py-1 rounded bg-carbon-800 hover:bg-emerald-700 text-slate-300 hover:text-white text-[10px] transition"
                                  >
                                    Restore Active
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onOpenReturnModal(customer, r)}
                                    title="Process Yard Return"
                                    className="px-2 py-1 rounded bg-carbon-800 hover:bg-amber-600 text-slate-300 hover:text-white text-[10px] transition"
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

                  {/* Print Document Triggers */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onPrintDoc({ type: 'INVOICE', customer })}
                      className="px-2.5 py-1.5 rounded-lg bg-carbon-850 hover:bg-sky-600 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Print Monthly Rent Invoice"
                    >
                      <FileText className="w-3 h-3 text-sky-400" />
                      <span>Invoice</span>
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
                    <button
                      onClick={() => onDeleteCustomer(customer)}
                      className="p-1.5 rounded-lg bg-carbon-850 hover:bg-rose-900 border border-carbon-700 text-slate-400 hover:text-rose-300 transition"
                      title="Delete Customer from System"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
