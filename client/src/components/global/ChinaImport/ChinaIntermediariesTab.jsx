import React, { useState } from 'react';
import { 
  Handshake, 
  HandCoins, 
  Send, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileText
} from 'lucide-react';
import { formatLKR } from '../../../utils/formatters';

export function ChinaIntermediariesTab({ 
  shipment, 
  onOpenIntermediaryAdvanceModal, 
  onOpenSupplierPaymentModal 
}) {
  if (!shipment) return null;

  const intermediaries = shipment.intermediaries || [];
  const advances = shipment.intermediaryAdvances || [];
  const supplierPayments = shipment.supplierPayments || [];

  const [selectedIntermediaryId, setSelectedIntermediaryId] = useState(
    intermediaries[0]?.id || "INT-01"
  );

  const selectedInter = intermediaries.find(i => i.id === selectedIntermediaryId) || intermediaries[0];

  // Build unified running ledger for selected intermediary
  const relevantAdvances = advances.filter(a => 
    a.intermediaryId === selectedInter?.id || 
    (a.intermediaryName && selectedInter?.name && a.intermediaryName.toLowerCase().includes(selectedInter.name.toLowerCase()))
  );

  const relevantPayments = supplierPayments.filter(p => 
    p.intermediaryId === selectedInter?.id || 
    (p.intermediaryName && selectedInter?.name && p.intermediaryName.toLowerCase().includes(selectedInter.name.toLowerCase()))
  );

  // Combine and sort chronologically
  const unifiedLedger = [
    ...relevantAdvances.map(a => ({
      type: 'ADVANCE',
      date: a.date,
      description: a.description || 'Cash Handover Advance',
      reference: a.bankReference || 'Bank Transfer',
      cashGivenLkr: Number(a.amountLkr) || 0,
      currency: '',
      foreignAmount: 0,
      appliedFxRate: 0,
      settledLkr: 0,
      notes: a.notes
    })),
    ...relevantPayments.map(p => ({
      type: 'SETTLEMENT',
      date: p.paymentDate,
      description: `China Supplier Settlement (${p.trxId})`,
      reference: p.reference || 'Supplier Remittance Slip',
      cashGivenLkr: 0,
      currency: p.currency || 'RMB',
      foreignAmount: Number(p.foreignAmount) || 0,
      appliedFxRate: Number(p.appliedFxRate) || 0,
      settledLkr: Number(p.settledLkr) || 0,
      notes: p.notes
    }))
  ].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Calculate running balance: Balance = Cumulative Cash Given - Cumulative Settled LKR
  let runningBalance = 0;
  const ledgerWithRunningBalance = unifiedLedger.map(entry => {
    if (entry.type === 'ADVANCE') {
      runningBalance += entry.cashGivenLkr;
    } else {
      runningBalance -= entry.settledLkr;
    }
    return {
      ...entry,
      runningBalanceLkr: runningBalance
    };
  });

  const totalCashGiven = relevantAdvances.reduce((sum, a) => sum + (Number(a.amountLkr) || 0), 0);
  const totalSettledLkr = relevantPayments.reduce((sum, p) => sum + (Number(p.settledLkr) || 0), 0);
  const totalForeignAmount = relevantPayments.reduce((sum, p) => sum + (Number(p.foreignAmount) || 0), 0);
  const netBalance = Math.round((totalCashGiven - totalSettledLkr) * 100) / 100;

  return (
    <div className="space-y-6">
      
      {/* Header and Intermediary Selector Pills */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Handshake className="w-5 h-5 text-amber-400" />
              <span>Overseas Friends & Intermediaries Individual Ledgers</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Independent tracking of cash advanced to friends vs foreign payments settled to China supplier
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenIntermediaryAdvanceModal(selectedInter?.id)}
              className="px-3.5 py-2.5 bg-carbon-800 hover:bg-carbon-700 text-slate-200 border border-carbon-700 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5"
            >
              <HandCoins className="w-4 h-4 text-amber-400" />
              <span>Record Cash Advance</span>
            </button>
            <button
              onClick={onOpenSupplierPaymentModal}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <Send className="w-4 h-4" />
              <span>Record Foreign Remittance</span>
            </button>
          </div>
        </div>

        {/* Intermediaries Tab Selection */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-carbon-800/80">
          {intermediaries.map(inter => {
            const isSelected = inter.id === selectedIntermediaryId;

            return (
              <button
                key={inter.id}
                onClick={() => setSelectedIntermediaryId(inter.id)}
                className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600/40 to-orange-600/30 text-white border-2 border-amber-500 shadow-lg shadow-amber-950/40'
                    : 'bg-carbon-950 text-slate-400 border border-carbon-800 hover:text-white hover:bg-carbon-900'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></div>
                <span>{inter.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-carbon-800 text-slate-300">
                  {inter.country}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Intermediary Account Status Card */}
      {selectedInter && (
        <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-carbon-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-white">
                  Account Reconciliation: {selectedInter.name}
                </h4>
                <span className="text-xs text-slate-400">({selectedInter.country} • Currency: {selectedInter.operatingCurrency})</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedInter.notes || 'Remittance agent for foreign supplier payments'}
              </p>
            </div>

            <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              netBalance < 0 
                ? 'bg-rose-950/80 border-rose-800 text-rose-300' 
                : (netBalance > 0 ? 'bg-sky-950/80 border-sky-800 text-sky-300' : 'bg-emerald-950/80 border-emerald-800 text-emerald-300')
            }`}>
              {netBalance < 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>WE OWE {selectedInter.name.toUpperCase()}: {formatLKR(Math.abs(netBalance))} LKR</span>
                </>
              ) : netBalance > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>{selectedInter.name.toUpperCase()} HOLDS SURPLUS: {formatLKR(netBalance)} LKR</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ACCOUNT PERFECTLY BALANCED / RECONCILED</span>
                </>
              )}
            </div>
          </div>

          {/* 3 Metric Cards for this Intermediary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Total Cash Given by Us
              </span>
              <div className="text-lg font-black text-slate-200 mt-1">
                {formatLKR(totalCashGiven)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {relevantAdvances.length} Cash Advances / Handover entries
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Total Settled to China (LKR Equiv)
              </span>
              <div className="text-lg font-black text-emerald-400 mt-1">
                {formatLKR(totalSettledLkr)}
              </div>
              <span className="text-[10px] text-amber-300 block mt-0.5">
                {totalForeignAmount.toLocaleString()} {selectedInter.operatingCurrency} Remitted to Supplier
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              netBalance < 0 
                ? 'bg-rose-950/30 border-rose-800/40 text-rose-300' 
                : 'bg-sky-950/30 border-sky-800/40 text-sky-300'
            }`}>
              <span className="text-[10px] uppercase tracking-wider block font-bold">
                Net Account Balance (LKR)
              </span>
              <div className="text-lg font-black mt-1">
                {formatLKR(netBalance)}
              </div>
              <span className="text-[10px] block mt-0.5">
                {netBalance < 0 
                  ? `Must pay balance of LKR ${Math.abs(netBalance).toLocaleString()} to ${selectedInter.name}` 
                  : 'Holding surplus for next tranche'}
              </span>
            </div>
          </div>

          {/* Detailed Chronological Running Ledger */}
          <div className="space-y-3 pt-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Chronological Running Ledger ({selectedInter.name})</span>
            </h5>

            <div className="overflow-x-auto rounded-2xl border border-carbon-800 bg-carbon-950 text-xs">
              <table className="w-full text-left divide-y divide-carbon-800">
                <thead className="bg-carbon-900/90 text-slate-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Transaction Type</th>
                    <th className="py-2.5 px-4">Description / Bank Ref</th>
                    <th className="py-2.5 px-3 text-right">Cash Given (LKR)</th>
                    <th className="py-2.5 px-3 text-right">Foreign Amount</th>
                    <th className="py-2.5 px-3 text-right">FX Rate</th>
                    <th className="py-2.5 px-3 text-right">LKR Settled to China</th>
                    <th className="py-2.5 px-4 text-right">Running Balance (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-800 text-slate-300">
                  {ledgerWithRunningBalance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500">
                        No transactions recorded for this intermediary yet.
                      </td>
                    </tr>
                  ) : (
                    ledgerWithRunningBalance.map((item, idx) => {
                      const isAdvance = item.type === 'ADVANCE';
                      const isNegative = item.runningBalanceLkr < 0;

                      return (
                        <tr key={idx} className="hover:bg-carbon-900/50 transition">
                          <td className="py-2.5 px-3 text-slate-300">{item.date}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAdvance 
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/80' 
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                            }`}>
                              {isAdvance ? 'Cash Advance' : 'China Remittance'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-white block">{item.description}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{item.reference}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                            {item.cashGivenLkr > 0 ? formatLKR(item.cashGivenLkr) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                            {item.foreignAmount > 0 ? `${item.foreignAmount.toLocaleString()} ${item.currency}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400">
                            {item.appliedFxRate > 0 ? item.appliedFxRate : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                            {item.settledLkr > 0 ? formatLKR(item.settledLkr) : '-'}
                          </td>
                          <td className={`py-2.5 px-4 text-right font-bold text-sm ${
                            isNegative ? 'text-rose-400' : 'text-sky-400'
                          }`}>
                            {formatLKR(item.runningBalanceLkr)}
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
      )}

    </div>
  );
}
