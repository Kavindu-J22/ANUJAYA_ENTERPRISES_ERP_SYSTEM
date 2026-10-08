import React, { useState, useEffect } from 'react';
import { X, TrendingUp, CheckCircle2 } from 'lucide-react';

export function LocalExpenseModal({ isOpen, expense, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    type: 'Operations'
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || '',
        amount: expense.amount || 0,
        type: expense.type || 'Operations'
      });
    } else {
      setFormData({
        title: '',
        amount: 0,
        type: 'Operations'
      });
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Expense title is required.");
    if (!formData.amount || parseFloat(formData.amount) <= 0) return alert("Please enter a valid expense amount.");
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
  };

  const categories = ['Salary', 'Operations', 'Maintenance', 'Transport', 'Other'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {expense ? "Edit Yard Operational Expense" : "Record Yard Expense"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Kosgama Yard Maintenance, Wages & Logistics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-400 font-mono mb-1">Expense Title / Purpose *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
              placeholder="e.g. Technician Workshop Wages (Kasun & Nimal)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Category</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Amount (LKR) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-purple-300 font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                placeholder="e.g. 35000"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{expense ? "Update Expense" : "Save Expense"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
