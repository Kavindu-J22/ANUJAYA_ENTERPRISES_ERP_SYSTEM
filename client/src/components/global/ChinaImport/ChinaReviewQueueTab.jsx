import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldCheck, 
  FileText, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatLKR } from '../../../utils/formatters';

export function ChinaReviewQueueTab({ shipment, onResolveFlag }) {
  if (!shipment) return null;

  const reviewFlags = shipment.historicalReviewFlags || [];

  const defectCorrections = [
    {
      title: "Missing 'Our Company' Contribution Calculation",
      issue: "Excel cell E16 had a blank/zero formula for Our Company contribution, distorting live cash flow position.",
      correction: "Implemented live formula: Our Net Cash Contributed = Total Settled to China - Total Received from Global."
    },
    {
      title: "Double-Application of FX Rates",
      issue: "In Excel China Outflow rows, some converted LKR amounts were multiplied by the FX rate twice in cumulative columns.",
      correction: "Applied exact single multiplication: Foreign Amount × Applied FX Rate, with safe decimal rounding."
    },
    {
      title: "Cash-Only Intermediary Advances Without Foreign Remittance",
      issue: "Friend 2 advances of LKR 10,000 (R23) and LKR 190,000 (R26) were handed over as cash with no corresponding China wire.",
      correction: "Built independent dual ledger. Cash advances credit the friend's account while foreign wires debit it, calculating true net balance (-LKR 52,690)."
    },
    {
      title: "Mismatched Partnership vs Shipment Totals",
      issue: "Master Dashboard remaining total LKR 42,541,798.70 was confused between unallocated budget and supplier payable.",
      correction: "Separated Total Liability Budget remaining from verified Original Supplier FOB payable in USD ($113,788.79)."
    }
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white font-sans flex items-center gap-2">
              <span>Historical Excel Import Audit & Reconciliation Queue</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-800 text-amber-300">
                Source: China.xlsx
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Reviewing ambiguous, cash-only, and manually adjusted transactions imported from the reference workbook
            </p>
          </div>
        </div>
      </div>

      {/* Flagged Transactions Queue */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <h4 className="font-display font-black text-sm text-white font-sans flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Active Flagged Items ({reviewFlags.length} Items)</span>
        </h4>

        <div className="space-y-3">
          {reviewFlags.map((flag, idx) => {
            const isResolved = flag.status === 'Resolved';

            return (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-carbon-800 text-sky-400">
                      {flag.recordId}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">{flag.entityType}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isResolved ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {flag.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs font-sans font-medium">
                    {flag.warning}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onResolveFlag(flag.recordId, isResolved ? 'Open' : 'Resolved')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition text-xs flex items-center gap-1.5 ${
                      isResolved 
                        ? 'bg-carbon-800 text-slate-400 hover:text-white' 
                        : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isResolved ? 'Re-open Review' : 'Mark as Verified'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corrected Excel Defects Reference */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <h4 className="font-display font-black text-sm text-white font-sans flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Accounting Formula Integrity & Corrections Applied</span>
        </h4>
        <p className="text-xs text-slate-400 font-sans">
          The following defects in `China.xlsx` were identified and safely corrected in this production financial module:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {defectCorrections.map((d, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800 space-y-2">
              <span className="font-bold text-white font-sans block text-xs">
                {idx + 1}. {d.title}
              </span>
              <div className="text-[11px] space-y-1">
                <p className="text-rose-400">
                  <strong className="text-rose-500">Defect in Excel: </strong>{d.issue}
                </p>
                <p className="text-emerald-400">
                  <strong className="text-emerald-500">ERP Engine Fix: </strong>{d.correction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
