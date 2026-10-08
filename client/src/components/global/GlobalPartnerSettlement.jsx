import React, { useState } from 'react';
import { Scale, PlusCircle, ArrowDownRight, History, Calendar, DollarSign, Wallet, Sparkles, Building2, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalPartnerSettlement({
  metrics = {},
  disbursements = [],
  onOpenDisburseModal,
  onEditDisbursement,
  onDeleteDisbursement,
  currentUser,
  usdRate = 330
}) {
  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'PARTNER' || true;
  // Two-step inline confirm (no window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const profitAnujaya = metrics.profitAnujaya !== undefined ? metrics.profitAnujaya : (metrics.partnerShare || 0);
  const profitGlobal = metrics.profitGlobal !== undefined ? metrics.profitGlobal : (metrics.partnerShare || 0);
  const profitShared5050 = metrics.profitShared5050 !== undefined ? metrics.profitShared5050 : (metrics.netProfit || 0);
  const profitGlobal100 = metrics.profitGlobal100 || 0;
  const profitAnujaya100 = metrics.profitAnujaya100 || 0;

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white tracking-tight">
                Consortium Capital & Retained Earnings Reconciliation
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Equity Agreement & Profit Policy Audit Between Anujaya Enterprises & Global Enterprises
              </p>
            </div>
          </div>
        </div>

        {canManage && (
          <button
            onClick={onOpenDisburseModal}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Capital Draw</span>
          </button>
        )}
      </div>

      {/* Consortium Policy Allocation Summary Banner */}
      <div className="glass-card p-5 rounded-3xl border border-carbon-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs shadow-lg">
        <div className="p-3.5 rounded-2xl bg-carbon-900/80 border border-carbon-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Consortium Realized Profit</span>
          <div className="text-base font-black text-white">{formatLKR(metrics.netProfit || 0)}</div>
          <span className="text-[10px] text-slate-500">Across all completed dispatches</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-carbon-900/80 border border-carbon-800 space-y-1">
          <span className="text-sky-300 text-[10px] uppercase font-bold block">50/50 Shared Pool Profit</span>
          <div className="text-base font-black text-sky-400">{formatLKR(profitShared5050)}</div>
          <span className="text-[10px] text-slate-500">Split 50% Anujaya / 50% Global</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-carbon-900/80 border border-carbon-800 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] uppercase font-bold">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>100% Global Exclusive Profit</span>
          </div>
          <div className="text-base font-black text-emerald-400">{formatLKR(profitGlobal100)}</div>
          <span className="text-[10px] text-slate-500">Credited 100% to Global Enterprises</span>
        </div>
      </div>

      {/* Reconciliation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Anujaya (Partner X) */}
        <div className="glass-card p-6 rounded-3xl border border-sky-500/40 space-y-5 relative shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-carbon-700">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-md bg-sky-400 inline-block shadow-sm shadow-sky-400/50"></span>
              <div>
                <span className="font-display font-black text-lg text-white">Anujaya Enterprises</span>
                <span className="text-[11px] text-slate-400 block font-mono">Consortium Operating Partner (Sri Lanka)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              50.0% EQUITY
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Total Entitled Realized Profit:</span>
              <span className="font-black text-sky-300 text-sm">{formatLKR(profitAnujaya)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400 text-[11px]">
              <span>• From 50/50 Shared Pool:</span>
              <span className="text-slate-200">{formatLKR(profitShared5050 * 0.5)}</span>
            </div>
            {profitAnujaya100 > 0 && (
              <div className="flex justify-between py-1.5 text-slate-400 text-[11px]">
                <span>• From 100% Anujaya Direct:</span>
                <span className="text-slate-200">{formatLKR(profitAnujaya100)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Total Capital Draws (Advances):</span>
              <span className="font-bold text-rose-400 text-sm">-{formatLKR(metrics.drawAnujaya || 0)}</span>
            </div>
            <div className="flex justify-between py-3.5 bg-carbon-900/90 px-4 rounded-2xl border border-sky-500/40 shadow-inner">
              <div>
                <span className="font-bold text-slate-200 text-sm block">Net Unsettled Balance:</span>
                <span className="text-[10px] text-slate-400">Profit less partner draws</span>
              </div>
              <span className="font-black text-sky-300 text-lg">{formatLKR(metrics.balAnujaya || 0)}</span>
            </div>
          </div>
        </div>

        {/* Global Enterprises (Partner Y) */}
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/40 space-y-5 relative shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-carbon-700">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50"></span>
              <div>
                <span className="font-display font-black text-lg text-white">Global Enterprises</span>
                <span className="text-[11px] text-slate-400 block font-mono">China Sourcing & Logistics Partner</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              50% + DIRECT
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Total Entitled Realized Profit:</span>
              <span className="font-black text-emerald-400 text-sm">{formatLKR(profitGlobal)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400 text-[11px]">
              <span>• From 50/50 Shared Pool:</span>
              <span className="text-slate-200">{formatLKR(profitShared5050 * 0.5)}</span>
            </div>
            {profitGlobal100 > 0 && (
              <div className="flex justify-between py-1.5 text-emerald-400 text-[11px] font-semibold">
                <span>• From 100% Global Exclusive:</span>
                <span>+{formatLKR(profitGlobal100)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-carbon-800">
              <span className="text-slate-400">Total Capital Draws (Advances):</span>
              <span className="font-bold text-rose-400 text-sm">-{formatLKR(metrics.drawGlobal || 0)}</span>
            </div>
            <div className="flex justify-between py-3.5 bg-carbon-900/90 px-4 rounded-2xl border border-emerald-500/40 shadow-inner">
              <div>
                <span className="font-bold text-slate-200 text-sm block">Net Unsettled Balance:</span>
                <span className="text-[10px] text-slate-400">Profit less partner draws</span>
              </div>
              <span className="font-black text-emerald-400 text-lg">{formatLKR(metrics.balGlobal || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta & Audit Card */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono shadow-lg">
        <div>
          <span className="text-slate-400">Partner Equity Reconciliation Delta:</span>
          <div className="text-lg font-bold text-amber-400 mt-0.5">
            {formatLKR(Math.abs((metrics.balAnujaya || 0) - (metrics.balGlobal || 0)))}
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
                {canManage && <th className="px-4 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60">
              {disbursements.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="text-center py-8 text-slate-500 font-mono">
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
                        d.partner === 'X' || d.partner === 'ANUJAYA'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800' 
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {d.partner === 'X' || d.partner === 'ANUJAYA' ? 'Anujaya Enterprises' : 'Global Enterprises'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{d.notes || d.memo || 'Capital Advance Disbursement'}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-400">
                      -{formatLKR(d.amount)}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditDisbursement && onEditDisbursement(d)}
                            title="Edit Capital Draw"
                            className="p-1.5 rounded-lg bg-carbon-850 hover:bg-amber-600 text-slate-400 hover:text-white transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {/* Two-step delete confirm */}
                          {confirmDeleteId === d.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  onDeleteDisbursement && onDeleteDisbursement(d.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center gap-1 animate-pulse"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded-lg bg-carbon-800 hover:bg-carbon-700 text-slate-400 text-[10px] font-mono"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(d.id)}
                              title="Delete Capital Draw"
                              className="p-1.5 rounded-lg bg-carbon-850 hover:bg-rose-700 text-slate-400 hover:text-white transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
