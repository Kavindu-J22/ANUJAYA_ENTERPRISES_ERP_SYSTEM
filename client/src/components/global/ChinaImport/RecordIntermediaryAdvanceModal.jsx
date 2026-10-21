import React, { useState } from 'react';
import { X, HandCoins, Building2, CheckCircle2 } from 'lucide-react';

export function RecordIntermediaryAdvanceModal({ shipment, isOpen, onClose, onSave, defaultIntermediaryId = "", editingRecord }) {
  const isEditing = !!editingRecord;
  const intermediaries = shipment?.intermediaries || [
    { id: "INT-01", name: "Ashen", country: "China / Sri Lanka" },
    { id: "INT-02", name: "Friend 2 (Korea / Dubai)", country: "Korea / Dubai Route" },
    { id: "INT-03", name: "Direct Bank TT (Sri Lanka)", country: "Sri Lanka to China" }
  ];

  const initialIntermediary = intermediaries.find(i => i.id === (editingRecord?.intermediaryId || defaultIntermediaryId)) || intermediaries[0];

  const [formData, setFormData] = useState(
    isEditing ? {
      intermediaryId: editingRecord.intermediaryId || initialIntermediary?.id || 'INT-01',
      intermediaryName: editingRecord.intermediaryName || initialIntermediary?.name || 'Ashen',
      date: editingRecord.date || new Date().toISOString().slice(0, 10),
      description: editingRecord.description || '',
      bankReference: editingRecord.bankReference || '',
      amountLkr: String(editingRecord.amountLkr || ''),
      notes: editingRecord.notes || ''
    } : {
      intermediaryId: initialIntermediary?.id || "INT-01",
      intermediaryName: initialIntermediary?.name || "Ashen",
      date: new Date().toISOString().slice(0, 10),
      description: "Advance for foreign supplier remittance",
      bankReference: "BOC - Commercial Bank",
      amountLkr: "",
      notes: ""
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleIntermediaryChange = (id) => {
    const found = intermediaries.find(i => i.id === id);
    if (found) {
      setFormData(prev => ({
        ...prev,
        intermediaryId: found.id,
        intermediaryName: found.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amountLkr || Number(formData.amountLkr) <= 0) {
      setError("Please specify a valid cash advance amount in LKR.");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        amountLkr: Number(formData.amountLkr)
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to record cash advance");
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
              <HandCoins className="w-5 h-5 text-amber-400" />
              <span>{isEditing ? 'Edit Cash Advance' : 'Record Cash Advance to Intermediary'}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Shipment {shipment?.shipmentNo} • Overseas Friend & Agent Ledger
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
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Select Overseas Friend / Intermediary
            </label>
            <select
              value={formData.intermediaryId}
              onChange={(e) => handleIntermediaryChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
            >
              {intermediaries.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.country})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Advance Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cash Given (LKR)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 4300000"
                value={formData.amountLkr}
                onChange={(e) => setFormData({ ...formData, amountLkr: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-amber-300 font-bold text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Bank Reference / Cheque / Channel
            </label>
            <input
              type="text"
              placeholder="e.g. BOC - Commercial Bank / DFCC - BOC / Direct Cash"
              value={formData.bankReference}
              onChange={(e) => setFormData({ ...formData, bankReference: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description / Notes</label>
            <input
              type="text"
              placeholder="e.g. Advance for RMB wire to China Juki export account"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
            />
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-amber-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? (isEditing ? 'Updating...' : 'Recording...') : (isEditing ? 'Update Advance' : 'Record Advance')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
