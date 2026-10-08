import React, { useState } from 'react';
import { TrendingUp, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalExpensesLedger({
  expenses,
  onOpenNewExpense,
  onOpenEditExpense,
  onDeleteExpense
}) {
  const totalExpenses = (expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span>Yard Operational & Technician Expenses</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Mechanical Technician Wages, Fleet Spares, Kosgama Yard Power & Logistics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400">Total Expenses:</span>
            <span className="text-purple-300 font-bold ml-2 text-sm">{formatLKR(totalExpenses)}</span>
          </div>

          <button
            onClick={onOpenNewExpense}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card rounded-3xl border border-carbon-700/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-carbon-900/90 text-slate-300 font-mono uppercase text-[11px] tracking-wider border-b border-carbon-700">
              <tr>
                <th className="px-4 py-3.5">Expense Item / Purpose</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-right">Amount (LKR)</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60 font-mono">
              {(expenses || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500">
                    No operational expenses recorded.
                  </td>
                </tr>
              ) : (
                (expenses || []).map(exp => (
                  <tr key={exp.id} className="hover:bg-carbon-900/40 transition">
                    <td className="px-4 py-3 font-sans font-bold text-white text-sm">
                      {exp.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-carbon-800 text-slate-300 border border-carbon-700 uppercase">
                        {exp.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-purple-300 text-sm">
                      {formatLKR(exp.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenEditExpense(exp)}
                          title="Edit Expense"
                          className="p-1.5 rounded-lg bg-carbon-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          title="Delete Expense"
                          className="p-1.5 rounded-lg bg-carbon-800 hover:bg-rose-700 text-slate-400 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
