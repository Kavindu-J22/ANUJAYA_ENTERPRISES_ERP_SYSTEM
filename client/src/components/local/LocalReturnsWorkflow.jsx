import React, { useMemo, useState, useEffect } from 'react';
import { RotateCcw, Printer, PlusCircle, Calendar, Search } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';
import { 
  MONTH_NAMES, 
  YEARS, 
  parseMonthYear, 
  getDateYearMonth 
} from './LocalCustomerDirectory';

export function LocalReturnsWorkflow({
  customers,
  activeMonth,
  onSwitchMonth,
  onOpenReturnModal,
  onRollbackReturn,
  onPrintReturnNote
}) {
  const [confirmRollbackId, setConfirmRollbackId] = useState(null);
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

  // Aggregate all returned machines across all customers
  const allReturns = useMemo(() => {
    const list = [];
    (customers || []).forEach(c => {
      (c.rentals || []).filter(r => r.status === 'Returned').forEach(r => {
        list.push({
          customer: c,
          rental: r,
          returnDetails: r.returnDetails || {}
        });
      });
    });
    return list;
  }, [customers]);

  // Filter returns by selected Month & Year
  const filteredReturns = useMemo(() => {
    let list = allReturns;

    if (!viewAllMonths) {
      list = list.filter(item => {
        const retDate = item.returnDetails.returnDate || item.rental.returnDate;
        if (!retDate) return true;
        const ym = getDateYearMonth(retDate);
        return ym.year === targetYM.year && ym.month === targetYM.month;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(({ customer, rental, returnDetails }) =>
        (customer.name || '').toLowerCase().includes(q) ||
        (rental.model || '').toLowerCase().includes(q) ||
        (rental.serialNumber || '').toLowerCase().includes(q) ||
        (returnDetails.slipNo || '').toLowerCase().includes(q) ||
        (returnDetails.remarks || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [allReturns, viewAllMonths, targetYM, searchQuery]);

  const totalRelievedRent = filteredReturns.reduce((s, item) => s + (Number(item.rental.rentRate) || 0), 0);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 shadow-xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>Central Yard Machinery Returns & De-Hire Workflow</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Cycle: <span className="text-amber-400 font-bold">{viewAllMonths ? 'All Periods' : `${selectedMonth} ${selectedYear}`}</span> • Relieved Rent: <span className="text-emerald-400 font-bold">{formatLKR(totalRelievedRent)}</span> ({filteredReturns.length} Units Returned)
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
              className={`px-2 py-1 text-[10px] font-bold rounded-xl transition border ${viewAllMonths ? 'bg-amber-600 text-white border-amber-500' : 'bg-carbon-800 hover:bg-carbon-700 text-slate-300 hover:text-white border-carbon-700/60'}`}
              title="Toggle View All Machinery Returns"
            >
              {viewAllMonths ? 'All' : 'All Periods'}
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Client, Model, Slip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {onOpenReturnModal && (
            <button
              onClick={() => onOpenReturnModal()}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Process Return</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl border border-carbon-700/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-carbon-900/90 text-slate-300 font-mono uppercase text-[11px] tracking-wider border-b border-carbon-700">
              <tr>
                <th className="px-4 py-3.5">Slip #</th>
                <th className="px-4 py-3.5">Return Date</th>
                <th className="px-4 py-3.5">Apparel Client</th>
                <th className="px-4 py-3.5">Machinery Model Description</th>
                <th className="px-4 py-3.5">Serial Number (SN)</th>
                <th className="px-4 py-3.5 text-right">Relieved Monthly Rent</th>
                <th className="px-4 py-3.5">Yard Condition & Remarks</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60 font-mono">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No returned machinery fleet units logged for {viewAllMonths ? 'any period' : `${selectedMonth} ${selectedYear}`}.
                  </td>
                </tr>
              ) : (
                filteredReturns.map(({ customer, rental, returnDetails }) => (
                  <tr key={rental.machineId} className="hover:bg-carbon-900/40 transition">
                    <td className="px-4 py-3 font-bold text-amber-400">
                      {returnDetails.slipNo || 'RET-YARD'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {returnDetails.returnDate || rental.startDate || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-sans font-bold text-white">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 font-sans font-bold text-slate-200">
                      {rental.model}
                    </td>
                    <td className="px-4 py-3 text-sky-400">{rental.serialNumber || 'Yard Tracked'}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">
                      {formatLKR(rental.rentRate)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{returnDetails.condition || 'Operational'}</div>
                      <div className="text-[10px] text-slate-500">{returnDetails.remarks || 'Kosgama Yard Inspection Completed'}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintReturnNote({
                            type: 'RETURN',
                            customer,
                            returnedMachines: [{
                              model: rental.model,
                              serialNumber: rental.serialNumber,
                              rentRate: rental.rentRate
                            }],
                            meta: returnDetails
                          })}
                          title="Print Yard Machinery Return Note"
                          className="p-1.5 rounded-lg bg-carbon-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        
                        {confirmRollbackId === rental.machineId ? (
                          <div className="flex items-center gap-1 animate-fadeIn">
                            <button
                              onClick={() => {
                                setConfirmRollbackId(null);
                                onRollbackReturn(customer.id, rental.machineId);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                              title="Confirm Reactivate"
                            >
                              Confirm?
                            </button>
                            <button
                              onClick={() => setConfirmRollbackId(null)}
                              className="px-1.5 py-1 bg-carbon-700 hover:bg-carbon-600 text-slate-300 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRollbackId(rental.machineId)}
                            title="Rollback / Restore to Active Customer Fleet"
                            className="px-2 py-1 rounded bg-carbon-800 hover:bg-emerald-700 text-slate-300 hover:text-white text-[10px] transition font-bold"
                          >
                            Restore Active
                          </button>
                        )}
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
