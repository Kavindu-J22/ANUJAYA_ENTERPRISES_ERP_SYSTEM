import React from 'react';
import { X, History, Mail, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalAlertLogsModal({ isOpen, logs, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <History className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                Automated Due Date Email Logs
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Nodemailer SMTP Dispatch Audit Trail (anujayaenterprises.info@gmail.com)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {(logs || []).length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No alert emails have been dispatched yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Alerts are sent automatically at 08:00 AM daily or via one-click triggers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-carbon-850 text-slate-300 font-mono uppercase text-[10px] tracking-wider sticky top-0 border-b border-carbon-700">
                  <tr>
                    <th className="px-3 py-2.5">Date / Time</th>
                    <th className="px-3 py-2.5">Client</th>
                    <th className="px-3 py-2.5">Alert Level</th>
                    <th className="px-3 py-2.5">Due Date</th>
                    <th className="px-3 py-2.5 text-right">Amount Due</th>
                    <th className="px-3 py-2.5">Recipient</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-800 font-mono">
                  {logs.map((log) => {
                    const dateStr = log.sentAt ? new Date(log.sentAt).toLocaleString() : 'N/A';
                    return (
                      <tr key={log.id || log._id} className="hover:bg-carbon-850/50 transition">
                        <td className="px-3 py-2.5 text-[11px] text-slate-400 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-white whitespace-nowrap">
                          {log.customerName}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.alertType === 'OVERDUE'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : log.alertType === 'DUE_TODAY'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : log.alertType === '3_DAYS'
                              ? 'bg-orange-950 text-orange-300 border border-orange-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {log.alertType?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-300">
                          {log.dueDate}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-emerald-400">
                          {formatLKR(log.amountDue)}
                        </td>
                        <td className="px-3 py-2.5 text-slate-400 text-[11px]">
                          {log.recipientEmail}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {log.status === 'SENT' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Delivered</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400" title={log.error}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Failed</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end font-mono">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-white font-bold transition"
            >
              Close Log Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
