import React, { useState } from 'react';
import { X, Scale, CheckCircle2 } from 'lucide-react';

export function GlobalDisburseModal({ isOpen, onClose, onSubmit, onSave }) {
  if (!isOpen) return null;

  const [partner, setPartner] = useState('X');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState('Consortium Capital Draw');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    const payload = {
      id: "DIS-" + Date.now().toString().slice(-6),
      partner,
      amount: parsedAmount,
      date,
      memo: memo.trim() || 'Capital Draw'
    };

    const saveFn = onSubmit || onSave;
    if (saveFn) {
      saveFn(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <span>Log Capital Draw</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Consortium Advance Disbursement Audit</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Partner Entity</label>
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="X">Anujaya Enterprises (Partner X)</option>
              <option value="Y">Global Enterprises (Partner Y)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Draw Amount (LKR)</label>
            <input
              type="number"
              min={1}
              step="any"
              required
              placeholder="e.g. 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Transaction Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Memo / Purpose</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-lg transition flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Capital Draw</span>
          </button>
        </form>
      </div>
    </div>
  );
}
