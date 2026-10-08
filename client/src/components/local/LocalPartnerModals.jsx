import React, { useState, useEffect } from 'react';
import { X, Building2, ShoppingBag, RotateCcw, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

// 1. ADD / EDIT PARTNER MODAL
export function LocalPartnerModal({ isOpen, partner, onClose, onSave }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: 'Director',
    phone: '',
    address: '',
    baseOpeningBalance: 0
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        code: partner.code || '',
        name: partner.name || '',
        contactPerson: partner.contactPerson || 'Director',
        phone: partner.phone || '',
        address: partner.address || '',
        baseOpeningBalance: partner.baseOpeningBalance || 0
      });
    } else {
      setFormData({
        code: 'PTR-' + Math.floor(100 + Math.random() * 900),
        name: '',
        contactPerson: 'Director',
        phone: '',
        address: '',
        baseOpeningBalance: 0
      });
    }
  }, [partner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Partner name is required.");
    onSave({
      ...formData,
      baseOpeningBalance: parseFloat(formData.baseOpeningBalance) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {partner ? "Edit Sourcing Partner" : "Register Sourcing Partner"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Wholesale Machinery & Spare Parts Vendor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Partner Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Opening Balance (LKR)</label>
              <input
                type="number"
                value={formData.baseOpeningBalance}
                onChange={e => setFormData({ ...formData, baseOpeningBalance: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Company / Partner Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
              placeholder="e.g. Lanka Juki Spares & Motors Ltd"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Phone / Mobile</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                placeholder="077 123 4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Address / Yard Location</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              placeholder="Colombo 11 / Pettah Sourcing Depot"
            />
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{partner ? "Update Partner" : "Save Partner"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. RECORD INWARD SOURCED PURCHASE MODAL
export function LocalPartnerPurchaseModal({ isOpen, partner, onClose, onSave }) {
  const [formData, setFormData] = useState({
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    itemDescription: '',
    category: 'Parts',
    qty: 1,
    unitPrice: 0,
    remarks: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        invoiceNo: 'PUR-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().split('T')[0],
        itemDescription: '',
        category: 'Parts',
        qty: 1,
        unitPrice: 0,
        remarks: ''
      });
    }
  }, [isOpen]);

  if (!isOpen || !partner) return null;

  const total = (parseInt(formData.qty) || 0) * (parseFloat(formData.unitPrice) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemDescription.trim()) return alert("Item description is required.");
    onSave(partner.id, {
      ...formData,
      qty: parseInt(formData.qty) || 1,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      total
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Record Inward Sourced Purchase</h3>
              <p className="text-xs text-slate-400 font-mono">Vendor: {partner.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Invoice / Reference No</label>
              <input
                type="text"
                value={formData.invoiceNo}
                onChange={e => setFormData({ ...formData, invoiceNo: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Item Description / Machinery Specs *</label>
            <input
              type="text"
              required
              value={formData.itemDescription}
              onChange={e => setFormData({ ...formData, itemDescription: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
              placeholder="e.g. 5x Juki Needle Clamps & Bobbin Cases"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Machine">Machine</option>
                <option value="Parts">Parts</option>
                <option value="Service">Service</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Qty</label>
              <input
                type="number"
                min="1"
                required
                value={formData.qty}
                onChange={e => setFormData({ ...formData, qty: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Unit Price (LKR)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-carbon-850 rounded-xl border border-carbon-800 flex justify-between items-center font-mono">
            <span className="text-slate-400">Total Purchase Value:</span>
            <span className="text-sm font-black text-amber-400">{formatLKR(total)}</span>
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Purchase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. RECORD PARTNER RETURN / DEBIT NOTE MODAL
export function LocalPartnerReturnModal({ isOpen, partner, onClose, onSave }) {
  const [formData, setFormData] = useState({
    slipNo: '',
    date: new Date().toISOString().split('T')[0],
    itemDescription: '',
    qty: 1,
    unitPrice: 0,
    reason: 'Defective / Incompatible'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        slipNo: 'RET-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().split('T')[0],
        itemDescription: '',
        qty: 1,
        unitPrice: 0,
        reason: 'Defective / Incompatible'
      });
    }
  }, [isOpen]);

  if (!isOpen || !partner) return null;

  const total = (parseInt(formData.qty) || 0) * (parseFloat(formData.unitPrice) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemDescription.trim()) return alert("Item description is required.");
    onSave(partner.id, {
      ...formData,
      qty: parseInt(formData.qty) || 1,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      total
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Record Outward Return / Debit Note</h3>
              <p className="text-xs text-slate-400 font-mono">Vendor: {partner.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Debit Slip No</label>
              <input
                type="text"
                value={formData.slipNo}
                onChange={e => setFormData({ ...formData, slipNo: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Returned Item Description *</label>
            <input
              type="text"
              required
              value={formData.itemDescription}
              onChange={e => setFormData({ ...formData, itemDescription: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-bold focus:outline-none focus:border-rose-500"
              placeholder="e.g. 2x Defective Juki Rotary Hooks"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Qty</label>
              <input
                type="number"
                min="1"
                required
                value={formData.qty}
                onChange={e => setFormData({ ...formData, qty: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Unit Price (LKR)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Reason for Return</label>
            <input
              type="text"
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-3 bg-carbon-850 rounded-xl border border-carbon-800 flex justify-between items-center font-mono">
            <span className="text-slate-400">Total Debit / Return:</span>
            <span className="text-sm font-black text-rose-400">-{formatLKR(total)}</span>
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Return Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. RECORD PARTNER PAYMENT VOUCHER MODAL
export function LocalPartnerPaymentModal({ isOpen, partner, onClose, onSave }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'BOC Bank Transfer',
    refNo: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        method: 'BOC Bank Transfer',
        refNo: 'BOC-TX-' + Math.floor(10000 + Math.random() * 90000)
      });
    }
  }, [isOpen]);

  if (!isOpen || !partner) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return alert("Please enter a valid payment amount.");
    }
    onSave(partner.id, {
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Record Partner Settlement Payment</h3>
              <p className="text-xs text-slate-400 font-mono">Vendor: {partner.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Payment Method</label>
              <select
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="BOC Bank Transfer">BOC Bank Transfer</option>
                <option value="Cash Settlement">Cash Settlement</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Settlement Amount (LKR) *</label>
            <input
              type="number"
              min="1"
              required
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 50000"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Reference / Cheque No</label>
            <input
              type="text"
              value={formData.refNo}
              onChange={e => setFormData({ ...formData, refNo: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Voucher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
