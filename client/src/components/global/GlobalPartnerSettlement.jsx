import React, { useState } from 'react';
import { Scale, PlusCircle, ArrowDownRight, History, Calendar, DollarSign, Wallet } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalPartnerSettlement({
  metrics,
  disbursements,
  onOpenDisburseModal,
  currentUser,
  usdRate
}) {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <span>Consortium Capital & Retained Earnings Reconciliation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            50/50 Equity Agreement Between Anujaya Enterprises & Global Enterprises
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenDisburseModal}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Capital Draw</span>
          </button>
        )}
      </div>

      {/* Reconciliation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Anujaya (Partner X) */}
        <div className="glass-card p-6 rounded-3xl border border-sky-500/40 space-y-5 relative">
          <div className="flex justify-between items-center pb-3 border-b border-carbon-700">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-sky-400 inline-block"></span>
              <span className="font-display font-extrabold text-lg text-white">Anujaya Enterprises</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              50.0% EQUITY SHARE
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Total Consortium Realized Profit:</span>
              <span className="font-bold text-white">{formatLKR(metrics.netProfit)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Entitled 50% Profit Share:</span>
              <span className="font-bold text-sky-300 text-sm">{formatLKR(metrics.partnerShare)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Total Capital Draws (Advances):</span>
              <span className="font-bold text-rose-400 text-sm">-{formatLKR(metrics.drawAnujaya)}</span>
            </div>
            <div className="flex justify-between py-3.5 bg-carbon-900/80 px-4 rounded-xl border border-sky-500/30">
              <span className="font-bold text-slate-300 text-sm">Net Unsettled Balance:</span>
              <span className="font-bold text-sky-300 text-base">{formatLKR(metrics.balAnujaya)}</span>
            </div>
          </div>
        </div>

        {/* Global Enterprises (Partner Y) */}
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/40 space-y-5 relative">
          <div className="flex justify-between items-center pb-3 border-b border-carbon-700">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-400 inline-block"></span>
              <span className="font-display font-extrabold text-lg text-white">Global Enterprises</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              50.0% EQUITY SHARE
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Total Consortium Realized Profit:</span>
              <span className="font-bold text-white">{formatLKR(metrics.netProfit)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Entitled 50% Profit Share:</span>
              <span className="font-bold text-emerald-300 text-sm">{formatLKR(metrics.partnerShare)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Total Capital Draws (Advances):</span>
              <span className="font-bold text-rose-400 text-sm">-{formatLKR(metrics.drawGlobal)}</span>
            </div>
            <div className="flex justify-between py-3.5 bg-carbon-900/80 px-4 rounded-xl border border-emerald-500/30">
              <span className="font-bold text-slate-300 text-sm">Net Unsettled Balance:</span>
              <span className="font-bold text-emerald-400 text-base">{formatLKR(metrics.balGlobal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta & Audit Card */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-400">Partner Equity Reconciliation Delta:</span>
          <div className="text-lg font-bold text-amber-400 mt-0.5">
            {formatLKR(Math.abs(metrics.balAnujaya - metrics.balGlobal))}
          </div>
        </div>
        <div className="text-right text-slate-400">
          <span>Active Spot Anchor:</span>
          <div className="font-bold text-white mt-0.5">1 USD = {usdRate.toFixed(2)} LKR</div>
        </div>
      </div>

      {/* Capital Draws Log Table */}
      <div className="glass-card rounded-3xl border border-carbon-700/80 overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-carbon-700/60">
          <div>
            <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <span>Capital Draws & Partner Advance Audit Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">Real-time disbursements audited against consortium equity</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-carbon-900/90 text-slate-300 font-mono uppercase text-[11px] tracking-wider border-b border-carbon-700">
              <tr>
                <th className="px-4 py-3">Disbursement ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Partner Entity</th>
                <th className="px-4 py-3">Transaction Memo / Reference</th>
                <th className="px-4 py-3 text-right">Withdrawn Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60">
              {disbursements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 font-mono">
                    No capital draws recorded yet. Click "Log Capital Draw" to register an advance.
                  </td>
                </tr>
              ) : (
                disbursements.map(d => (
                  <tr key={d.id} className="hover:bg-carbon-900/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-sky-400">{d.id}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{d.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        d.partner === 'X' 
                          ? 'bg-sky-950 text-sky-300 border border-sky-800' 
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {d.partner === 'X' ? 'Anujaya Enterprises' : 'Global Enterprises'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{d.memo || 'Capital Draw'}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-400">
                      -{formatLKR(d.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
