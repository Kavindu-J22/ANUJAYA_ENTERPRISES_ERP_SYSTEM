import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Send, 
  Wallet, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck, 
  Printer, 
  FileSpreadsheet, 
  PlusCircle, 
  Clock, 
  Scale, 
  Building2,
  Handshake,
  AlertCircle
} from 'lucide-react';
import { formatLKR, formatUSD } from '../../../utils/formatters';

export function ChinaDashboardTab({ 
  shipment, 
  onOpenPartnerReceiptModal, 
  onOpenSupplierPaymentModal, 
  onOpenIntermediaryAdvanceModal, 
  onOpenPrintModal, 
  setActiveSubTab 
}) {
  if (!shipment) return null;

  const summary = shipment.financialSummary || {};
  const partners = summary.partnersSummary || [];
  const intermediaries = summary.intermediariesSummary || [];
  const reviewFlags = shipment.historicalReviewFlags || [];

  return (
    <div className="space-y-6">
      
      {/* 1. Live Executive Financial Position - 5 Major KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-300">
              1. Live Executive Financial Position & Cash Flow (LKR)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-carbon-800/80 px-2 py-0.5 rounded-full border border-carbon-700">
            FOB USD {formatUSD(shipment.fobUsd)} @ {shipment.budgetUsdRate} LKR Rate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: Total Liability */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-carbon-900 via-carbon-900 to-carbon-950 border border-carbon-800 hover:border-slate-700 transition relative overflow-hidden group shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider">Total China Liability</span>
              <div className="p-1.5 rounded-lg bg-carbon-800 text-slate-300">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono font-black text-lg text-white group-hover:text-sky-300 transition">
              {formatLKR(summary.totalBudgetLkr || 73076096.80)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-mono">
              <span>Customs: {formatLKR(summary.budgetCustomsLkr)}</span>
            </div>
          </div>

          {/* Card 2: Received from Global */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 via-carbon-900 to-carbon-950 border border-sky-800/40 hover:border-sky-600/60 transition relative overflow-hidden group shadow-lg">
            <div className="flex items-center justify-between text-sky-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider">Received from Global</span>
              <div className="p-1.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/60">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono font-black text-lg text-sky-300">
              {formatLKR(summary.totalReceivedFromGlobal || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-sky-400/80 font-mono">
              <span>Global Inflow: {(shipment.partnerReceipts || []).length} Tranche</span>
            </div>
          </div>

          {/* Card 3: Total Settled to China */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-carbon-900 to-carbon-950 border border-emerald-800/40 hover:border-emerald-600/60 transition relative overflow-hidden group shadow-lg">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider">Total Settled to China</span>
              <div className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono font-black text-lg text-emerald-300">
              {formatLKR(summary.totalSettledToChinaLkr || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400/80 font-mono">
              <span>{(summary.rmbSettledTotal || 0).toLocaleString()} RMB + ${((summary.usdSettledTotal || 0)).toLocaleString()} USD</span>
            </div>
          </div>

          {/* Card 4: Our Net Cash Contributed */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-carbon-900 to-carbon-950 border border-amber-800/40 hover:border-amber-600/60 transition relative overflow-hidden group shadow-lg">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider">Our Net Contributed</span>
              <div className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/60">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono font-black text-lg text-amber-300">
              {formatLKR(summary.ourNetCashContributedLkr || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400/80 font-mono">
              <span>Direct Net Execution</span>
            </div>
          </div>

          {/* Card 5: Remaining Due to China */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-carbon-900 to-carbon-950 border border-rose-800/40 hover:border-rose-600/60 transition relative overflow-hidden group shadow-lg">
            <div className="flex items-center justify-between text-rose-400 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider">Remaining Due</span>
              <div className="p-1.5 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/60">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono font-black text-lg text-rose-300">
              {formatLKR(summary.remainingTotalLiabilityLkr || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-rose-400/80 font-mono">
              <span>FOB Rem: ~${(summary.remainingSupplierFobUsd || 0).toLocaleString()} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Partner Liability & Settlement Share (50% / 50%) */}
      <div className="p-5 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>2. Partner Liability & Joint Venture Settlement Share</span>
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              50/50 Joint venture contribution model between Global Apparel Solutions and Our Company
            </p>
          </div>
          <button
            onClick={onOpenPartnerReceiptModal}
            className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-md shadow-sky-950/40"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Global Inflow</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((partner, idx) => {
            const isGlobal = partner.name.includes("Global");
            const accentColor = isGlobal ? "sky" : "emerald";

            return (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800 space-y-3 font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isGlobal ? 'bg-sky-400' : 'bg-emerald-400'}`}></div>
                    <span className="font-bold text-sm text-white">{partner.name}</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    partner.isFullySettled 
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-400' 
                      : (isGlobal ? 'bg-amber-950 border-amber-800 text-amber-300' : 'bg-indigo-950 border-indigo-800 text-indigo-300')
                  }`}>
                    {partner.statusLabel}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  <span>Role: {partner.role}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Funding Progress</span>
                    <span className="font-bold text-white">{(partner.progressPct * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-carbon-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isGlobal ? 'bg-sky-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, partner.progressPct * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Amount Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-carbon-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Liability</span>
                    <span className="font-bold text-slate-200">{formatLKR(partner.targetLiabilityLkr)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Actual Paid</span>
                    <span className={`font-bold ${isGlobal ? 'text-sky-300' : 'text-emerald-300'}`}>
                      {formatLKR(partner.actualPaidLkr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Remaining Due</span>
                    <span className="font-bold text-rose-400">{formatLKR(partner.remainingDueLkr)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Overseas Friends & Intermediaries Reconciliation Summary */}
      <div className="p-5 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <Handshake className="w-4 h-4 text-amber-400" />
              <span>3. Overseas Friends & Intermediary Reconciliation Ledger</span>
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Net balance formula: <code className="text-amber-300">Net Balance = Cash Advanced - Confirmed Settlement (LKR Equiv)</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenIntermediaryAdvanceModal}
              className="px-3.5 py-2 bg-carbon-800 hover:bg-carbon-700 text-slate-200 border border-carbon-700 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Cash Advance</span>
            </button>
            <button
              onClick={onOpenSupplierPaymentModal}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Record China Outflow</span>
            </button>
          </div>
        </div>

        {/* Table of Intermediaries */}
        <div className="overflow-x-auto rounded-2xl border border-carbon-800 bg-carbon-950 font-mono text-xs">
          <table className="w-full text-left divide-y divide-carbon-800">
            <thead className="bg-carbon-900/90 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Intermediary Name</th>
                <th className="py-3 px-3">Route / Currency</th>
                <th className="py-3 px-3 text-right">Cash Given by Us (LKR)</th>
                <th className="py-3 px-3 text-right">Foreign Settled</th>
                <th className="py-3 px-3 text-right">Settled to China (LKR)</th>
                <th className="py-3 px-3 text-right">Net Balance (LKR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Audit Instruction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800 text-slate-300">
              {intermediaries.map((inter, idx) => {
                const isOwed = inter.netBalanceLkr < -0.01;
                const isSurplus = inter.netBalanceLkr > 0.01;

                return (
                  <tr key={idx} className="hover:bg-carbon-900/50 transition">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <span>{inter.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <span>{inter.country} ({inter.operatingCurrency})</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-200">
                      {formatLKR(inter.totalCashGivenLkr)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-300">
                      {inter.foreignAmountSettled.toLocaleString()} {inter.operatingCurrency}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-300">
                      {formatLKR(inter.totalSettledLkr)}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold text-sm ${
                      isOwed ? 'text-rose-400' : (isSurplus ? 'text-sky-400' : 'text-slate-400')
                    }`}>
                      {formatLKR(inter.netBalanceLkr)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isOwed 
                          ? 'bg-rose-950/80 border-rose-800 text-rose-300' 
                          : (isSurplus ? 'bg-sky-950/80 border-sky-800 text-sky-300' : 'bg-carbon-800 border-carbon-700 text-slate-400')
                      }`}>
                        {inter.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {inter.actionInstruction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Combined Intermediaries Summary Footnote */}
        <div className="p-3 bg-carbon-950 border border-carbon-800 rounded-xl flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Combined Amount Owed to Intermediaries (Ashen + Friend 2):
          </span>
          <span className="font-bold text-rose-400 text-sm">
            {formatLKR(summary.totalOwedToIntermediariesLkr || 207490)} LKR
          </span>
        </div>
      </div>

      {/* 4. Review & Audit Queue Banner (If flags exist) */}
      {reviewFlags.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 flex items-start gap-3 text-xs font-mono">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 block">
              Accounting Audit Queue ({reviewFlags.length} Items Flagged for Review)
            </span>
            <p className="text-slate-300 text-[11px]">
              Direct TT wire reference and cash-only advances from historical workbook have been flagged for verification. 
              Review the detailed entries under the <strong>Audit & Review Queue</strong> tab.
            </p>
          </div>
          <button
            onClick={() => setActiveSubTab('review')}
            className="ml-auto px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700 rounded-lg text-[11px] font-bold transition shrink-0"
          >
            Open Review Queue
          </button>
        </div>
      )}

    </div>
  );
}
