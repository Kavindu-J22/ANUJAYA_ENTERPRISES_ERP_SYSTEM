import React, { useState, useEffect } from 'react';
import { X, Warehouse, CheckCircle2, AlertCircle } from 'lucide-react';

const BRANDS = ['JUKI', 'KANSAI', 'PEGASUS', 'SIRUBA', 'BROTHER', 'JACK', 'EASTMAN', 'YAMATO', 'TYPICAL', 'ZOJE', 'OTHER'];

function generateSkuForBrand(brandName) {
  const brandPrefixMap = {
    'JUKI': 'JUK',
    'KANSAI': 'KAN',
    'PEGASUS': 'PEG',
    'SIRUBA': 'SIR',
    'BROTHER': 'BRO',
    'JACK': 'JCK',
    'EASTMAN': 'EAS',
    'YAMATO': 'YAM',
    'TYPICAL': 'TYP',
    'ZOJE': 'ZOJ',
    'OTHER': 'YRD'
  };
  const prefix = brandPrefixMap[brandName] || (brandName ? brandName.slice(0, 3).toUpperCase() : 'YRD');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-YRD-${rand}`;
}

export function LocalYardMachineModal({
  isOpen,
  machine,
  onClose,
  onSave
}) {
  const [formData, setFormData] = useState({
    machineCode: '',
    brand: 'JUKI',
    model: '',
    category: 'Single Needle Lockstitch',
    serialNumbers: '',
    totalYardStock: 1,
    standardMonthlyRent: 4500,
    acquisitionCost: 35000,
    motorSpec: '550W Energy Saving Servo Motor',
    accessories: 'Complete Stand, Table, Servo Motor',
    condition: 'Operational',
    yardLocation: 'Kosgama Central Yard Bay 1',
    notes: ''
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        machineCode: machine.machineCode || '',
        brand: machine.brand || 'JUKI',
        model: machine.model || '',
        category: machine.category || 'Single Needle Lockstitch',
        serialNumbers: machine.serialNumbers || '',
        totalYardStock: machine.totalYardStock || 1,
        standardMonthlyRent: machine.standardMonthlyRent || 4500,
        acquisitionCost: machine.acquisitionCost || 35000,
        motorSpec: machine.motorSpec || '550W Energy Saving Servo Motor',
        accessories: machine.accessories || 'Complete Stand, Table, Servo Motor',
        condition: machine.condition || 'Operational',
        yardLocation: machine.yardLocation || 'Kosgama Central Yard Bay 1',
        notes: machine.notes || ''
      });
    } else {
      const defaultBrand = 'JUKI';
      setFormData({
        machineCode: generateSkuForBrand(defaultBrand),
        brand: defaultBrand,
        model: '',
        category: 'Single Needle Lockstitch',
        serialNumbers: '',
        totalYardStock: 1,
        standardMonthlyRent: 4500,
        acquisitionCost: 35000,
        motorSpec: '550W Energy Saving Servo Motor',
        accessories: 'Complete Stand, Table, Servo Motor',
        condition: 'Operational',
        yardLocation: 'Kosgama Central Yard Bay 1',
        notes: ''
      });
    }
  }, [machine, isOpen]);

  const handleBrandChange = (newBrand) => {
    setFormData(prev => ({
      ...prev,
      brand: newBrand,
      machineCode: !machine ? generateSkuForBrand(newBrand) : prev.machineCode
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.model.trim()) {
      alert("Model title / description is required.");
      return;
    }
    onSave({
      ...formData,
      totalYardStock: parseInt(formData.totalYardStock) || 1,
      standardMonthlyRent: parseFloat(formData.standardMonthlyRent) || 0,
      acquisitionCost: parseFloat(formData.acquisitionCost) || 0
    });
  };

  const categories = [
    'Single Needle Lockstitch',
    'Overlock',
    'Flatbed / Coverstitch',
    'Buttonhole & Specialty',
    'Motors & Drives',
    'Heavy Duty / Other'
  ];

  const conditions = ['Brand New', 'Excellent', 'Operational', 'Under Repair'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {machine ? "Edit Yard Fleet Machine" : "Add Yard Machinery Fleet Unit"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Kosgama Central Yard • Separate Rental Machinery Warehouse
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
            <div>
              <label className="block text-slate-400 font-mono mb-1">Yard SKU / Code *</label>
              <input
                type="text"
                required
                value={formData.machineCode}
                onChange={e => setFormData({ ...formData, machineCode: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                placeholder="e.g. JK-8700"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Brand *</label>
              <select
                required
                value={formData.brand}
                onChange={e => handleBrandChange(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
              >
                {BRANDS.map(b => (
                  <option key={b} value={b} className="bg-carbon-900 text-white font-bold">{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Model Name & Specification Description *</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
              placeholder="e.g. DDL-8700 High-Speed Lockstitch Machine"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Total Yard Stock Units</label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalYardStock}
                onChange={e => setFormData({ ...formData, totalYardStock: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Standard Rent / Month (LKR)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.standardMonthlyRent}
                onChange={e => setFormData({ ...formData, standardMonthlyRent: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Acquisition Cost (LKR)</label>
              <input
                type="number"
                min="0"
                value={formData.acquisitionCost}
                onChange={e => setFormData({ ...formData, acquisitionCost: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Motor / Drive Specification</label>
              <input
                type="text"
                value={formData.motorSpec}
                onChange={e => setFormData({ ...formData, motorSpec: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                placeholder="550W Direct Drive Servo"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Included Table & Accessories</label>
              <input
                type="text"
                value={formData.accessories}
                onChange={e => setFormData({ ...formData, accessories: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                placeholder="Table, Stand, Thread Stand"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Yard Bay Location</label>
              <input
                type="text"
                value={formData.yardLocation}
                onChange={e => setFormData({ ...formData, yardLocation: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                placeholder="Kosgama Bay 1"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Condition Status</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                {conditions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Serial Numbers</label>
              <input
                type="text"
                value={formData.serialNumbers}
                onChange={e => setFormData({ ...formData, serialNumbers: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                placeholder="SN-10293, SN-10294"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Operational Yard Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              placeholder="Maintenance history, clutch servicing, oil changes..."
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-300 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{machine ? "Update Machinery Specs" : "Add to Yard Fleet"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
