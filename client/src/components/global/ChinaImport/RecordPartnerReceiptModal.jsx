import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export function RecordPartnerReceiptModal({ shipment, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    receiptId: `GLB-${String(((shipment?.partnerReceipts || []).length || 0) + 1).padStart(3, '0')}`,
    date: new Date().toISOString().slice(0, 10),
    partnerName: "Global Apparel Solutions",
    paymentMethod: "Bank Transfer",
    reference: "",
    amountLkr: "",
    allocationStatus: "Allocated",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amountLkr || Number(formData.amountLkr) <= 0) {
      setError("Please enter a valid receipt amount in LKR.");
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
      setError(err.message || "Failed to record partner receipt");
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
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Record Inward Partner Funding</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Shipment {shipment?.shipmentNo} • Global Inflow Log
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Receipt ID</label>
              <input
                type="text"
                value={formData.receiptId}
                onChange={(e) => setFormData({ ...formData, receiptId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Receipt Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Partner Entity</label>
            <select
              value={formData.partnerName}
              onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
            >
              <option value="Global Apparel Solutions">Global Apparel Solutions (50% Funding Co-Lead)</option>
              <option value="Our Company (Anujaya Enterprises)">Our Company (Anujaya Enterprises)</option>
              <option value="Special Consortium Investor">Special Consortium Investor</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
              >
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="Cheque">Corporate Cheque</option>
                <option value="Cash">Direct Cash Handover</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Amount in LKR</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 15917478.10"
                value={formData.amountLkr}
                onChange={(e) => setFormData({ ...formData, amountLkr: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-emerald-300 font-bold text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Bank Reference / Cheque No / Account Details
            </label>
            <input
              type="text"
              placeholder="e.g. Commercial Bank Remittance Ref #COMM-98124"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Special Notes / Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Tranche 1 joint funding contribution towards China shipment"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Recording..." : "Record Inward Receipt"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
