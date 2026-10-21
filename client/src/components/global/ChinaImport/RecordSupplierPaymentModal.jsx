import React, { useState, useEffect } from 'react';
import { X, Send, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatLKR } from '../../../utils/formatters';

export function RecordSupplierPaymentModal({ shipment, isOpen, onClose, onSave, editingRecord }) {
  const isEditing = !!editingRecord;
  const [formData, setFormData] = useState(
    isEditing ? {
      trxId: editingRecord.trxId || '',
      paymentDate: editingRecord.paymentDate || new Date().toISOString().slice(0, 10),
      channel: editingRecord.channel || 'Intermediary Remittance',
      intermediaryId: editingRecord.intermediaryId || 'INT-02',
      intermediaryName: editingRecord.intermediaryName || '',
      currency: editingRecord.currency || 'RMB',
      foreignAmount: String(editingRecord.foreignAmount || ''),
      appliedFxRate: String(editingRecord.appliedFxRate || ''),
      settledLkr: String(editingRecord.settledLkr || ''),
      sourceOfFunds: editingRecord.sourceOfFunds || 'Joint Partnership',
      reference: editingRecord.reference || '',
      status: editingRecord.status || 'Confirmed',
      isNeedsReview: !!editingRecord.isNeedsReview,
      reviewNote: editingRecord.reviewNote || '',
      notes: editingRecord.notes || ''
    } : {
      trxId: `TRX-${String(((shipment?.supplierPayments || []).length || 0) + 1).padStart(3, '0')}`,
      paymentDate: new Date().toISOString().slice(0, 10),
      channel: "Intermediary Remittance",
      intermediaryId: "INT-02",
      intermediaryName: "Friend 2 (Korea / Dubai)",
      currency: "RMB",
      foreignAmount: "",
      appliedFxRate: "51.90",
      settledLkr: "",
      sourceOfFunds: "Joint Partnership",
      reference: "",
      status: "Confirmed",
      isNeedsReview: false,
      reviewNote: "",
      notes: ""
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto calculate Settled LKR
  useEffect(() => {
    const fAmt = Number(formData.foreignAmount) || 0;
    const rate = Number(formData.appliedFxRate) || 0;
    if (fAmt > 0 && rate > 0) {
      setFormData(prev => ({
        ...prev,
        settledLkr: (Math.round(fAmt * rate * 100) / 100).toString()
      }));
    }
  }, [formData.foreignAmount, formData.appliedFxRate]);

  if (!isOpen) return null;

  const intermediaries = shipment?.intermediaries || [
    { id: "INT-01", name: "Ashen", operatingCurrency: "RMB" },
    { id: "INT-02", name: "Friend 2 (Korea / Dubai)", operatingCurrency: "RMB" },
    { id: "INT-03", name: "Direct Bank TT (Sri Lanka)", operatingCurrency: "USD" }
  ];

  const handleIntermediaryChange = (id) => {
    const found = intermediaries.find(i => i.id === id);
    if (found) {
      setFormData(prev => ({
        ...prev,
        intermediaryId: found.id,
        intermediaryName: found.name,
        currency: found.operatingCurrency || "RMB",
        appliedFxRate: found.operatingCurrency === "USD" ? (shipment?.budgetUsdRate || 330).toString() : "51.90"
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.settledLkr || Number(formData.settledLkr) <= 0) {
      setError("Please specify a valid foreign amount and FX rate or settled LKR value.");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        foreignAmount: Number(formData.foreignAmount) || 0,
        appliedFxRate: Number(formData.appliedFxRate) || 0,
        settledLkr: Number(formData.settledLkr) || 0
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to record China payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-carbon-900 border border-carbon-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-carbon-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              <span>{isEditing ? 'Edit China Outflow Settlement' : 'Record China Outflow Settlement'}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Shipment {shipment?.shipmentNo} • Outward Supplier Settlement Log
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
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Transaction ID</label>
              <input
                type="text"
                value={formData.trxId}
                onChange={(e) => setFormData({ ...formData, trxId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
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
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Channel</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
              >
                <option value="Intermediary Remittance">Overseas Intermediary Remittance</option>
                <option value="Direct Bank TT">Direct Bank Telegraphic Transfer (TT)</option>
                <option value="Other Channel">Other Configured Channel</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Intermediary / Bank</label>
              <select
                value={formData.intermediaryId}
                onChange={(e) => handleIntermediaryChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
              >
                {intermediaries.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.operatingCurrency})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Foreign Currency & Live FX Calculator Card */}
          <div className="p-4 rounded-2xl bg-carbon-950 border border-carbon-800 space-y-3">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-bold flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Multi-Currency FX Settlement Engine</span>
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-bold"
                >
                  <option value="RMB">RMB (Chinese Yuan)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Foreign Amount Sent</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 86000"
                  value={formData.foreignAmount}
                  onChange={(e) => setFormData({ ...formData, foreignAmount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Applied FX Rate</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 51.90"
                  value={formData.appliedFxRate}
                  onChange={(e) => setFormData({ ...formData, appliedFxRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-amber-300 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Calculated Settled LKR Equivalent</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={formData.settledLkr}
                  onChange={(e) => setFormData({ ...formData, settledLkr: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-carbon-900 border border-emerald-600/60 text-emerald-300 font-bold text-sm tracking-wide"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">LKR</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Source of Funds</label>
              <select
                value={formData.sourceOfFunds}
                onChange={(e) => setFormData({ ...formData, sourceOfFunds: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
              >
                <option value="Joint Partnership">Joint Partnership Account</option>
                <option value="Global Apparel Inflow">Global Apparel Inflow (Receipt Allocation)</option>
                <option value="Our Company Direct">Our Company Direct Outlay</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
              >
                <option value="Confirmed">Confirmed (Officially Settled)</option>
                <option value="Initiated">Initiated (In Process)</option>
                <option value="Pending Confirmation">Pending Supplier Confirmation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Transaction Reference / Remittance Slip #
            </label>
            <input
              type="text"
              placeholder="e.g. Ashen Remittance Slip #ASH-86K / Swift MT103 Ref"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
            />
          </div>

          {/* Audit Review Checkbox */}
          <div className="p-3 bg-carbon-950/80 rounded-xl border border-carbon-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNeedsReview}
                onChange={(e) => setFormData({ ...formData, isNeedsReview: e.target.checked })}
                className="rounded border-carbon-700 text-amber-500 focus:ring-0"
              />
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Flag for Accounting Review / Historical Verification</span>
              </span>
            </label>
            {formData.isNeedsReview && (
              <input
                type="text"
                placeholder="Reason for review (e.g. Bank debit slip pending or FX rate variance)"
                value={formData.reviewNote}
                onChange={(e) => setFormData({ ...formData, reviewNote: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-carbon-900 border border-amber-700/60 text-amber-300 text-xs"
              />
            )}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? (isEditing ? 'Updating...' : 'Recording...') : (isEditing ? 'Update Payment' : 'Record China Outflow')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
