import React from 'react';
import { 
  ShieldAlert, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Boxes,
  Layers,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { formatLKR, formatUSD } from '../../../utils/formatters';

export function ChinaCustomsExpensesTab({ shipment, onOpenCustomsExpenseModal }) {
  if (!shipment) return null;

  const expenses = shipment.customsExpenses || [];
  const summary = shipment.financialSummary || {};

  const totalCustomsBudget = Number(summary.budgetCustomsLkr) || 4991500;
  const totalActualPaid = expenses.reduce((sum, e) => sum + (Number(e.actualLkr || e.estimatedLkr) || 0), 0);
  const variance = totalCustomsBudget - totalActualPaid;

  const fobUsd = Number(shipment.fobUsd) || 206316.96;
  const budgetUsdRate = Number(shipment.budgetUsdRate) || 330;
  const totalLandedCost = (fobUsd * budgetUsdRate) + totalActualPaid;
  const landedCostPerUnit = shipment.totalUnits > 0 ? Math.round(totalLandedCost / shipment.totalUnits) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Customs & Landed Cost Header */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <span>Customs, Taxes, Clearing & Landed Cost Accounting</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Sri Lanka Customs entry tariffs, ocean freight, port clearing charges and landed cost allocation
            </p>
          </div>

          <button
            onClick={onOpenCustomsExpenseModal}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 shadow-lg shadow-purple-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Customs / Clearing Fee</span>
          </button>
        </div>

        {/* 4 Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          <div className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Customs & Clearing Budget
            </span>
            <div className="text-lg font-black text-white mt-1">
              {formatLKR(totalCustomsBudget)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Reference allocation in workbook</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40">
            <span className="text-[10px] text-purple-400 uppercase tracking-wider block font-bold">
              Actual Landed Expenses
            </span>
            <div className="text-lg font-black text-purple-300 mt-1">
              {formatLKR(totalActualPaid)}
            </div>
            <span className="text-[10px] text-purple-400/80 block mt-0.5">
              Duty, Port, Freight & Transport
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Total Landed Cost (FOB + Charges)
            </span>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {formatLKR(totalLandedCost)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Full capitalized cost</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-bold">
              Avg Landed Cost / Machine Unit
            </span>
            <div className="text-lg font-black text-indigo-300 mt-1">
              {formatLKR(landedCostPerUnit)}
            </div>
            <span className="text-[10px] text-indigo-400/80 block mt-0.5">Across {shipment.totalUnits} Units</span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Itemized Customs & Port Clearing Expenses Ledger</span>
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-carbon-800 bg-carbon-950 font-mono text-xs">
          <table className="w-full text-left divide-y divide-carbon-800">
            <thead className="bg-carbon-900/90 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Expense ID</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-3">Paid Date</th>
                <th className="py-3 px-3">Paid By</th>
                <th className="py-3 px-3">Reference #</th>
                <th className="py-3 px-3 text-right">Estimated</th>
                <th className="py-3 px-3 text-right">Actual Paid (LKR)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800 text-slate-300">
              {expenses.map((e, idx) => (
                <tr key={idx} className="hover:bg-carbon-900/50 transition">
                  <td className="py-2.5 px-3 font-bold text-sky-400">{e.id}</td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    <span className="text-[11px]">{e.category}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{e.description}</td>
                  <td className="py-2.5 px-3 text-slate-400">{e.paymentDate || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-300">{e.paidBy || 'Our Company'}</td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{e.reference || '-'}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{formatLKR(e.estimatedLkr)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-purple-300">{formatLKR(e.actualLkr)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 border border-purple-800 text-purple-300">
                      {e.status || 'Paid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
