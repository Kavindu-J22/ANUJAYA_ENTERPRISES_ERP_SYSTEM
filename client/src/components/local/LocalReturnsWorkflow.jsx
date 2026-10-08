import React, { useMemo, useState } from 'react';
import { RotateCcw, Printer, ArrowUpRight, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalReturnsWorkflow({
  customers,
  onOpenReturnModal,
  onRollbackReturn,
  onPrintReturnNote
}) {
  const [confirmRollbackId, setConfirmRollbackId] = useState(null);

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

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>Central Yard Machinery Returns & De-Hire Workflow</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Inspection Reports, Relieved Monthly Rent Deductions & Return Slips
          </p>
        </div>

        {onOpenReturnModal && (
          <button
            onClick={() => onOpenReturnModal()}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Process Yard Return</span>
          </button>
        )}
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
              {allReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No returned machinery fleet units logged yet.
                  </td>
                </tr>
              ) : (
                allReturns.map(({ customer, rental, returnDetails }) => (
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
