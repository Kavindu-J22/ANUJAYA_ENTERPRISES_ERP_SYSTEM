import React, { useState, useMemo } from 'react';
import { CreditCard, Search, PlusCircle, Printer, Edit3, Trash2, Calendar } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalPaymentsLedger({
  payments,
  customers,
  activeMonth,
  onOpenNewPayment,
  onOpenEditPayment,
  onDeletePayment,
  onPrintReceipt
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const monthlyPayments = useMemo(() => {
    return (payments || []).filter(p => p.month === activeMonth);
  }, [payments, activeMonth]);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return monthlyPayments;
    return monthlyPayments.filter(p => 
      (p.customerName || '').toLowerCase().includes(q) ||
      (p.method || '').toLowerCase().includes(q) ||
      (p.refNo || '').toLowerCase().includes(q) ||
      (p.date || '').toLowerCase().includes(q)
    );
  }, [monthlyPayments, searchQuery]);

  const totalCollected = monthlyPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-400" />
            <span>Monthly Rent Payments & Collection Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Cycle: <span className="text-emerald-400 font-bold">{activeMonth}</span> • Total Received: <span className="text-white font-bold">{formatLKR(totalCollected)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Client, Ref #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={onOpenNewPayment}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="glass-card rounded-3xl border border-carbon-700/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-carbon-900/90 text-slate-300 font-mono uppercase text-[11px] tracking-wider border-b border-carbon-700">
              <tr>
                <th className="px-4 py-3.5">Receipt / Ref #</th>
                <th className="px-4 py-3.5">Payment Date</th>
                <th className="px-4 py-3.5">Client Garment Name</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5 text-right">Amount Settled (LKR)</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60 font-mono">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No rental payment collections recorded for {activeMonth}.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => {
                  const cust = customers.find(c => c.id === p.customerId);

                  return (
                    <tr key={p.id} className="hover:bg-carbon-900/40 transition">
                      <td className="px-4 py-3 font-bold text-sky-400">{p.refNo || p.id}</td>
                      <td className="px-4 py-3 text-slate-400">{p.date}</td>
                      <td className="px-4 py-3 font-sans font-bold text-white">
                        {p.customerName || (cust && cust.name)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{p.method}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400 text-sm">
                        {formatLKR(p.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onPrintReceipt(p, cust)}
                            title="Print Official Payment Receipt"
                            className="p-1.5 rounded-lg bg-carbon-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditPayment(p)}
                            title="Edit Payment"
                            className="p-1.5 rounded-lg bg-carbon-800 hover:bg-amber-600 text-slate-300 hover:text-white transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePayment(p.id)}
                            title="Delete Payment Record"
                            className="p-1.5 rounded-lg bg-carbon-800 hover:bg-rose-700 text-slate-400 hover:text-white transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
    </section>
  );
}
