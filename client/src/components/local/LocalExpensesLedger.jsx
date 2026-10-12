import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, PlusCircle, Edit3, Trash2, Calendar, Search } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';
import { 
  MONTH_NAMES, 
  YEARS, 
  parseMonthYear, 
  getDateYearMonth 
} from './LocalCustomerDirectory';

export function LocalExpensesLedger({
  expenses,
  activeMonth,
  onSwitchMonth,
  onOpenNewExpense,
  onOpenEditExpense,
  onDeleteExpense
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Month & Year selection state
  const parsedActive = parseMonthYear(activeMonth);
  const [selectedMonth, setSelectedMonth] = useState(parsedActive.month);
  const [selectedYear, setSelectedYear] = useState(parsedActive.year);
  const [viewAllMonths, setViewAllMonths] = useState(false);

  useEffect(() => {
    const parsed = parseMonthYear(activeMonth);
    setSelectedMonth(parsed.month);
    setSelectedYear(parsed.year);
  }, [activeMonth]);

  const handleMonthYearChange = (newM, newY) => {
    setSelectedMonth(newM);
    setSelectedYear(newY);
    setViewAllMonths(false);
    const targetStr = `${newM} ${newY}`;
    if (onSwitchMonth) {
      onSwitchMonth(targetStr);
    }
  };

  const handleJumpCurrentMonth = () => {
    const now = new Date();
    const currM = MONTH_NAMES[now.getMonth()];
    const currY = now.getFullYear();
    handleMonthYearChange(currM, currY);
  };

  const targetYM = useMemo(() => ({
    year: selectedYear,
    month: MONTH_NAMES.indexOf(selectedMonth)
  }), [selectedMonth, selectedYear]);

  // Filter expenses by selected Month & Year
  const filteredExpenses = useMemo(() => {
    let list = expenses || [];

    if (!viewAllMonths) {
      list = list.filter(exp => {
        const d = exp.date || (exp.createdAt ? new Date(exp.createdAt).toISOString().slice(0, 10) : null);
        if (!d) return true; // Include legacy if no date recorded
        const ym = getDateYearMonth(d);
        return ym.year === targetYM.year && ym.month === targetYM.month;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(exp => 
        (exp.title || '').toLowerCase().includes(q) ||
        (exp.type || '').toLowerCase().includes(q) ||
        (exp.date || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [expenses, viewAllMonths, targetYM, searchQuery]);

  const totalExpenses = filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span>Yard Operational & Technician Expenses</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Cycle: <span className="text-purple-300 font-bold">{viewAllMonths ? 'All Historical Periods' : `${selectedMonth} ${selectedYear}`}</span> • Total Expenses: <span className="text-white font-bold">{formatLKR(totalExpenses)}</span> ({filteredExpenses.length} Records)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Enhanced Month & Year Selector */}
          <div className="flex items-center gap-1.5 p-1.5 bg-carbon-900 border border-carbon-700/80 rounded-2xl shadow-inner font-mono text-xs">
            <div className="flex items-center gap-1 px-2 py-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Month:</span>
            </div>
            
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthYearChange(e.target.value, selectedYear)}
              disabled={viewAllMonths}
              className="bg-carbon-800 text-emerald-300 font-bold px-2.5 py-1.5 rounded-xl border border-carbon-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs disabled:opacity-50"
            >
              {MONTH_NAMES.map(m => (
                <option key={m} value={m} className="bg-carbon-900 text-white font-bold">{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value))}
              disabled={viewAllMonths}
              className="bg-carbon-800 text-white font-bold px-2.5 py-1.5 rounded-xl border border-carbon-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs disabled:opacity-50"
            >
              {YEARS.map(y => (
                <option key={y} value={y} className="bg-carbon-900 text-white font-bold">{y}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleJumpCurrentMonth}
              className="px-2 py-1 text-[10px] font-bold bg-carbon-800 hover:bg-carbon-700 text-slate-300 hover:text-white rounded-xl transition border border-carbon-700/60"
              title="Jump to Current Real-time Month"
            >
              Current
            </button>

            <button
              type="button"
              onClick={() => setViewAllMonths(prev => !prev)}
              className={`px-2 py-1 text-[10px] font-bold rounded-xl transition border ${viewAllMonths ? 'bg-purple-600 text-white border-purple-500' : 'bg-carbon-800 hover:bg-carbon-700 text-slate-300 hover:text-white border-carbon-700/60'}`}
              title="Toggle View All Expenses"
            >
              {viewAllMonths ? 'All' : 'All Periods'}
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Expense, Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
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
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-right">Amount (LKR)</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60 font-mono">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No operational expenses recorded for {viewAllMonths ? 'any period' : `${selectedMonth} ${selectedYear}`}.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-carbon-900/40 transition">
                    <td className="px-4 py-3 font-sans font-bold text-white text-sm">
                      {exp.title}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {exp.date || (exp.createdAt ? new Date(exp.createdAt).toISOString().slice(0, 10) : 'Recorded')}
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
