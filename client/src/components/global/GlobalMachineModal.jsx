import React, { useState, useEffect } from 'react';
import { X, Boxes, CheckCircle2, DollarSign } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalMachineModal({
  isOpen,
  mode = 'ADD', // 'ADD' or 'EDIT'
  initialData = null,
  usdRate,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  const [sku, setSku] = useState(initialData?.id || '');
  const [brand, setBrand] = useState(initialData?.brand || 'JUKI');
  const [model, setModel] = useState(initialData?.model || '');
  const [name, setName] = useState(initialData?.name || '');
  const [unit, setUnit] = useState(initialData?.unit || 'SETS');
  const [initialStock, setInitialStock] = useState(initialData?.initialStock || 10);
  const [usdPrice, setUsdPrice] = useState(initialData?.usdPrice || 150);
  const [taxLKR, setTaxLKR] = useState(initialData?.taxLKR || 5000);
  const [wholesalePrice, setWholesalePrice] = useState(initialData?.wholesalePrice || 60000);
  const [retailPrice, setRetailPrice] = useState(initialData?.retailPrice || 70000);
  const [error, setError] = useState('');

  const baseCostLKR = (parseFloat(usdPrice) || 0) * usdRate;
  const totalCostLKR = baseCostLKR + (parseFloat(taxLKR) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!sku.trim() || !model.trim()) {
      setError('SKU code and Model are required.');
      return;
    }

    const payload = {
      id: sku.trim().toUpperCase(),
      brand: brand.trim().toUpperCase(),
      model: model.trim(),
      name: name.trim() || `${brand} ${model}`,
      unit: unit.trim().toUpperCase() || 'SETS',
      initialStock: parseInt(initialStock) || 0,
      usdPrice: parseFloat(usdPrice) || 0,
      taxLKR: parseFloat(taxLKR) || 0,
      wholesalePrice: parseFloat(wholesalePrice) || 0,
      retailPrice: parseFloat(retailPrice) || 0
    };

    onSubmit(payload, mode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-sky-400" />
              <span>{mode === 'ADD' ? 'Add Machinery SKU (Global Warehouse)' : `Edit SKU Specs: ${initialData?.id}`}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              FOB Costing, Port Duties & Price Benchmarks
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-300 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">SKU Code</label>
              <input
                type="text"
                required
                disabled={mode === 'EDIT'}
                placeholder="e.g. M-27"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono uppercase font-bold focus:outline-none focus:border-sky-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Machinery Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              >
                <option value="JUKI">JUKI</option>
                <option value="KANSAI">KANSAI</option>
                <option value="PEGASUS">PEGASUS</option>
                <option value="SIRUBA">SIRUBA</option>
                <option value="BROTHER">BROTHER</option>
                <option value="JACK">JACK</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Model Code</label>
            <input
              type="text"
              required
              placeholder="e.g. DDL-8700-7/SC500"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Description / Name</label>
            <input
              type="text"
              placeholder="e.g. High Speed 1-Needle Lockstitch with Trimmer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Batch Fleet Sets</label>
              <input
                type="number"
                min={0}
                required
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Unit Type</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Pricing & Costing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">FOB Price (USD $)</label>
              <input
                type="number"
                step="any"
                min={0}
                required
                value={usdPrice}
                onChange={(e) => setUsdPrice(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-amber-400 font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Port & Customs Duty (LKR)</label>
              <input
                type="number"
                step="any"
                min={0}
                required
                value={taxLKR}
                onChange={(e) => setTaxLKR(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Computed Landed Cost Banner */}
          <div className="p-3 bg-carbon-900/90 rounded-xl border border-carbon-700 flex justify-between items-center font-mono text-xs">
            <span className="text-slate-400">Computed Landed Cost (at 1 USD = {usdRate.toFixed(2)} LKR):</span>
            <span className="font-bold text-sky-300 text-sm">{formatLKR(totalCostLKR)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Wholesale Price (LKR)</label>
              <input
                type="number"
                step="any"
                min={0}
                required
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Retail Price (LKR)</label>
              <input
                type="number"
                step="any"
                min={0}
                required
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-lg transition flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{mode === 'ADD' ? 'Save Machinery SKU' : 'Update SKU Specifications'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
