import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  PlusCircle, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Download,
  Building2
} from 'lucide-react';
import { formatLKR } from '../../../utils/formatters';

export function ChinaPartnerFundingTab({ shipment, onOpenPartnerReceiptModal }) {
  if (!shipment) return null;

  const receipts = shipment.partnerReceipts || [];
  const partners = shipment.partners || [];
  const summary = shipment.financialSummary || {};

  const totalInwardReceived = receipts.reduce((sum, r) => sum + (Number(r.amountLkr) || 0), 0);
  const globalPartner = partners.find(p => p.name.includes("Global")) || partners[0] || {};
  const globalTargetLkr = Number(globalPartner.targetLiabilityLkr) || (Number(summary.totalBudgetLkr || 73076096.80) * 0.50);
  const globalRemainingDue = Math.max(0, globalTargetLkr - totalInwardReceived);
  const globalProgress = globalTargetLkr > 0 ? (totalInwardReceived / globalTargetLkr) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Funding Summary Header */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>Global Inflow Log & Partner Funding Commitments</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Tracking inward funds received from Global Apparel Solutions for Shipment {shipment.shipmentNo}
            </p>
          </div>

          <button
            onClick={onOpenPartnerReceiptModal}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 shadow-lg shadow-sky-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Inward Funding Receipt</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Global Target Funding (50%)
            </span>
            <div className="text-lg font-black text-white mt-1">
              {formatLKR(globalTargetLkr)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Agreed joint funding obligation</span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/40">
            <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-bold">
              Cumulative Received to Date
            </span>
            <div className="text-lg font-black text-sky-300 mt-1">
              {formatLKR(totalInwardReceived)}
            </div>
            <span className="text-[10px] text-sky-400/80 block mt-0.5">
              {globalProgress.toFixed(1)}% of total funding share
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-bold">
              Global Remaining Due
            </span>
            <div className="text-lg font-black text-rose-300 mt-1">
              {formatLKR(globalRemainingDue)}
            </div>
            <span className="text-[10px] text-rose-400/80 block mt-0.5">
              {globalRemainingDue <= 0 ? '✓ Fully Settled' : 'Pending Tranches'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 font-mono pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Funding Fulfillment: Global Apparel Solutions</span>
            <span className="font-bold text-sky-400">{globalProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-carbon-950 border border-carbon-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, globalProgress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Inward Receipts Table */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Official Inward Receipts Log (Global Inflow Log)</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Total {receipts.length} Receipt Entry
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-carbon-800 bg-carbon-950 font-mono text-xs">
          <table className="w-full text-left divide-y divide-carbon-800">
            <thead className="bg-carbon-900/90 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Receipt ID</th>
                <th className="py-3 px-3">Date Received</th>
                <th className="py-3 px-4">Partner Entity</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-4">Bank Reference / Account Details</th>
                <th className="py-3 px-3 text-right">Amount (LKR)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Special Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800 text-slate-300">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No inward funding receipts recorded yet for this shipment.
                  </td>
                </tr>
              ) : (
                receipts.map((r, idx) => (
                  <tr key={idx} className="hover:bg-carbon-900/50 transition">
                    <td className="py-3 px-3 font-bold text-sky-400">{r.receiptId}</td>
                    <td className="py-3 px-3 text-slate-300">{r.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{r.partnerName}</td>
                    <td className="py-3 px-3 text-slate-300">{r.paymentMethod}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{r.reference || 'Bank Transfer'}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400 text-sm">
                      {formatLKR(r.amountLkr)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                        {r.status || 'Confirmed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs">{r.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footnote Rule */}
        <div className="p-3.5 bg-carbon-950 border border-carbon-800 rounded-xl text-xs font-mono text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Financial Control Rule:</strong> Receiving inward funds from a partner does <em>NOT</em> automatically mark the China supplier invoice as paid. Inward receipts must be independently routed through overseas intermediaries or direct bank TT wires.
          </span>
        </div>
      </div>

    </div>
  );
}
