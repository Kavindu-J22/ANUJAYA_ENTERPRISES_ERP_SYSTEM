import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function RecordCustomsExpenseModal({ shipment, isOpen, onClose, onSave, editingRecord }) {
  const isEditing = !!editingRecord;
  const [formData, setFormData] = useState(
    isEditing ? {
      category: editingRecord.category || 'Customs Duty & CESS',
      description: editingRecord.description || '',
      estimatedLkr: String(editingRecord.estimatedLkr || ''),
      actualLkr: String(editingRecord.actualLkr || ''),
      paymentDate: editingRecord.paymentDate || new Date().toISOString().slice(0, 10),
      paidBy: editingRecord.paidBy || 'Our Company',
      reference: editingRecord.reference || '',
      status: editingRecord.status || 'Paid'
    } : {
      category: "Customs Duty & CESS",
      description: "",
      estimatedLkr: "",
      actualLkr: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      paidBy: "Our Company",
      reference: "",
      status: "Paid"
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.actualLkr && !formData.estimatedLkr) {
      setError("Please enter an expense amount in LKR.");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        estimatedLkr: Number(formData.estimatedLkr) || Number(formData.actualLkr) || 0,
        actualLkr: Number(formData.actualLkr) || Number(formData.estimatedLkr) || 0
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to record customs expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-carbon-900 border border-carbon-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-carbon-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <span>{isEditing ? 'Edit Customs Expense' : 'Record Customs & Clearing Expense'}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Shipment {shipment?.shipmentNo} • Import Landed Cost Entry
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expense Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
            >
              <option value="Customs Duty & CESS">Customs Import Duty, PAL & CESS</option>
              <option value="Port Clearing Charges">Port Clearing Agent & Wharfage Fees</option>
              <option value="Shipping & Ocean Freight">Ocean Container Freight (Ningbo - Colombo)</option>
              <option value="Marine Cargo Insurance">Marine Transit Cargo Insurance</option>
              <option value="Bank LC & TT Processing Fees">Bank Foreign Exchange / LC / TT Processing</option>
              <option value="Local Container Transport to Yard">Trailer Haulage / Transport to Yard</option>
              <option value="Other Import Expenses">Other Port Inspection / Demurrage</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Sri Lanka Customs entry tax settlement & release"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Actual Amount (LKR)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 3250000"
                value={formData.actualLkr}
                onChange={(e) => setFormData({ ...formData, actualLkr: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-purple-300 font-bold text-sm"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Date</label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Paid By</label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
              >
                <option value="Our Company">Our Company (Anujaya Enterprises)</option>
                <option value="Global Apparel">Global Apparel Solutions</option>
                <option value="Joint Partnership">Joint Partnership</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reference / Receipt #</label>
              <input
                type="text"
                placeholder="e.g. SLC-ENTRY-9823"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-carbon-800 text-slate-300 hover:bg-carbon-700 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-purple-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? (isEditing ? 'Updating...' : 'Recording...') : (isEditing ? 'Update Expense' : 'Record Expense')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
