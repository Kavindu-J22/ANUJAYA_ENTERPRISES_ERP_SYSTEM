import React, { useState } from 'react';
import { X, FileText, PlusCircle, Trash2, Printer } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalQuotationModal({ isOpen, onClose, onGenerateQuotation }) {
  const [quotation, setQuotation] = useState({
    customerName: '',
    address: 'Biyagama EPZ / Katunayake BOI',
    phone: '077 000 0000',
    validDays: 14,
    items: [
      {
        model: 'JUKI DDL-8700 High-Speed Lockstitch',
        motorSpec: '550W Servo Motor + Complete Table & Stand',
        qty: 10,
        rentRate: 4500
      }
    ],
    terms: 'Rent payable on or before 5th of each month. Includes 4-hour breakdown replacement guarantee.'
  });

  if (!isOpen) return null;

  const handleAddItem = () => {
    setQuotation({
      ...quotation,
      items: [
        ...quotation.items,
        {
          model: 'JUKI MO-6814S 4-Thread Super High-Speed Overlock',
          motorSpec: '550W Energy Saving Servo Motor',
          qty: 2,
          rentRate: 6500
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    setQuotation({
      ...quotation,
      items: quotation.items.filter((_, idx) => idx !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...quotation.items];
    updated[index][field] = value;
    setQuotation({ ...quotation, items: updated });
  };

  const calculatedItems = (quotation.items || []).map(item => ({
    ...item,
    qty: parseInt(item.qty) || 1,
    rentRate: parseFloat(item.rentRate) || 0,
    total: (parseInt(item.qty) || 1) * (parseFloat(item.rentRate) || 0)
  }));

  const grandTotal = calculatedItems.reduce((s, i) => s + i.total, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quotation.customerName.trim()) return alert("Client name is required.");
    if (calculatedItems.length === 0) return alert("At least one quotation item is required.");

    onGenerateQuotation({
      ...quotation,
      items: calculatedItems,
      grandTotal
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                Generate Industrial Rental Quotation
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Official Commercial Machinery Hire Proposal
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-mono mb-1">Target Garment Client / Enterprise *</label>
              <input
                type="text"
                required
                value={quotation.customerName}
                onChange={e => setQuotation({ ...quotation, customerName: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-bold focus:outline-none focus:border-sky-500"
                placeholder="e.g. Brandix Apparel Solutions Ltd"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Validity (Days)</label>
              <input
                type="number"
                min="1"
                value={quotation.validDays}
                onChange={e => setQuotation({ ...quotation, validDays: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Address / Factory Location</label>
              <input
                type="text"
                value={quotation.address}
                onChange={e => setQuotation({ ...quotation, address: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Phone / Contact</label>
              <input
                type="text"
                value={quotation.phone}
                onChange={e => setQuotation({ ...quotation, phone: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Quotation Line Items */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-300 font-mono uppercase text-[11px]">
                Machinery Models & Rates ({quotation.items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-mono font-bold flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Model Row</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {(quotation.items || []).map((item, idx) => {
                const rowTotal = (parseInt(item.qty) || 1) * (parseFloat(item.rentRate) || 0);
                return (
                  <div key={idx} className="p-3 rounded-2xl bg-carbon-850/80 border border-carbon-800 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <label className="block text-[10px] text-slate-500 font-mono">Model Description</label>
                      <input
                        type="text"
                        required
                        value={item.model}
                        onChange={e => handleItemChange(idx, 'model', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-carbon-900 border border-carbon-750 rounded-lg text-white font-bold"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 font-mono">Motor / Drive</label>
                      <input
                        type="text"
                        value={item.motorSpec}
                        onChange={e => handleItemChange(idx, 'motorSpec', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-carbon-900 border border-carbon-750 rounded-lg text-slate-300 text-[11px]"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] text-slate-500 font-mono text-center">Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.qty}
                        onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-full px-2 py-1.5 bg-carbon-900 border border-carbon-750 rounded-lg text-white font-mono text-center font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-500 font-mono text-right">Rent/Unit</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.rentRate}
                        onChange={e => handleItemChange(idx, 'rentRate', e.target.value)}
                        className="w-full px-2 py-1.5 bg-carbon-900 border border-carbon-750 rounded-lg text-emerald-400 font-mono font-bold text-right"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end items-end pt-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={quotation.items.length <= 1}
                        className="p-1.5 rounded-lg bg-carbon-800 hover:bg-rose-900 text-slate-400 hover:text-rose-300 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grand Total Bar */}
          <div className="p-3 bg-carbon-850 rounded-2xl border border-carbon-800 flex justify-between items-center font-mono">
            <span className="text-slate-400 text-xs uppercase font-bold">Estimated Monthly Hire Total:</span>
            <span className="text-base font-black text-emerald-400">{formatLKR(grandTotal)}</span>
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold shadow-lg transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Generate & Print Quotation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
