import React, { useState } from 'react';
import { 
  Send, 
  DollarSign, 
  PlusCircle, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Calculator,
  Search
} from 'lucide-react';
import { formatLKR, formatUSD } from '../../../utils/formatters';

export function ChinaSupplierPaymentsTab({ shipment, onOpenSupplierPaymentModal }) {
  if (!shipment) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const payments = shipment.supplierPayments || [];
  const summary = shipment.financialSummary || {};

  const filteredPayments = payments.filter(p => {
    return (
      (p.trxId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.intermediaryName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.channel || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Outflow Performance Header */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              <span>China Outflow Log — Supplier Settlements</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Settlements executed to China supplier via overseas intermediaries and direct bank TT wires
            </p>
          </div>

          <button
            onClick={onOpenSupplierPaymentModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record China Supplier Payment</span>
          </button>
        </div>

        {/* 4 Currency & Settlement Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          <div className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Total LKR Settled to China
            </span>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {formatLKR(summary.totalSettledToChinaLkr || 0)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {((summary.totalSettledToChinaLkr / (summary.totalBudgetLkr || 1)) * 100).toFixed(1)}% of total liability
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">
              Total RMB Settled
            </span>
            <div className="text-lg font-black text-amber-300 mt-1">
              {(summary.rmbSettledTotal || 0).toLocaleString()} RMB
            </div>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">
              Via Ashen (86K) & Friend 2 (195.8K)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/40">
            <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-bold">
              Total USD Wire Settled
            </span>
            <div className="text-lg font-black text-sky-300 mt-1">
              ${(summary.usdSettledTotal || 0).toLocaleString()} USD
            </div>
            <span className="text-[10px] text-sky-400/80 block mt-0.5">
              Direct Commercial Bank TT
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-bold">
              Remaining Supplier FOB (USD)
            </span>
            <div className="text-lg font-black text-rose-300 mt-1">
              ${(summary.remainingSupplierFobUsd || 0).toLocaleString()} USD
            </div>
            <span className="text-[10px] text-rose-400/80 block mt-0.5">
              Original Supplier FOB Due
            </span>
          </div>
        </div>
      </div>

      {/* Outflows Table */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>China Outward Payment Transactions Log</span>
          </h4>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search Trx ID, Intermediary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl bg-carbon-950 border border-carbon-700 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-carbon-800 bg-carbon-950 font-mono text-xs">
          <table className="w-full text-left divide-y divide-carbon-800">
            <thead className="bg-carbon-900/90 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Trx ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-4">Intermediary / Bank</th>
                <th className="py-3 px-3 text-center">Currency</th>
                <th className="py-3 px-3 text-right">Foreign Amount</th>
                <th className="py-3 px-3 text-right">Applied FX Rate</th>
                <th className="py-3 px-3 text-right">Total Settled (LKR)</th>
                <th className="py-3 px-3">Source of Funds</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Proof / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800 text-slate-300">
              {filteredPayments.map((p, idx) => (
                <tr key={idx} className="hover:bg-carbon-900/50 transition">
                  <td className="py-2.5 px-3 font-bold text-sky-400">{p.trxId}</td>
                  <td className="py-2.5 px-3 text-slate-300">{p.paymentDate}</td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <span className="text-[11px] font-medium">{p.channel}</span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-white">
                    {p.intermediaryName || 'Direct TT'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-carbon-800 text-amber-300">
                      {p.currency}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">
                    {(p.foreignAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-300 font-bold">
                    {p.appliedFxRate || 0}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-300 text-sm">
                    {formatLKR(p.settledLkr)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {p.sourceOfFunds}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                      {p.status || 'Confirmed'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px] truncate max-w-xs">
                    {p.isNeedsReview && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded mr-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Review</span>
                      </span>
                    )}
                    <span>{p.reference || p.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Totals */}
        <div className="p-3 bg-carbon-950 border border-carbon-800 rounded-2xl flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Total Recorded Outflow Transactions: {filteredPayments.length}</span>
          <span className="text-slate-300 font-bold">
            Total Settled: <strong className="text-emerald-400 text-sm">{formatLKR(summary.totalSettledToChinaLkr)} LKR</strong>
          </span>
        </div>
      </div>

    </div>
  );
}
