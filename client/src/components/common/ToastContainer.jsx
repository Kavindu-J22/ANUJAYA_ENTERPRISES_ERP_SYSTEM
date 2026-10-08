import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 shadow-2xl transition-all duration-300 pointer-events-auto border ${
            toast.type === 'error'
              ? 'bg-rose-950/95 text-rose-200 border-rose-700/80 shadow-rose-950/50'
              : toast.type === 'info'
              ? 'bg-sky-950/95 text-sky-200 border-sky-700/80 shadow-sky-950/50'
              : 'bg-emerald-950/95 text-emerald-200 border-emerald-700/80 shadow-emerald-950/50'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-sky-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
