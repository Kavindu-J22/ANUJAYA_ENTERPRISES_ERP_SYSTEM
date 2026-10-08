import React, { useState } from 'react';
import { X, Users, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function LocalCustomerModal({
  isOpen,
  mode = 'ADD', // 'ADD' or 'EDIT'
  initialData = null,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [nic, setNic] = useState(initialData?.nic || 'REG-CLIENT');
  const [previousBalance, setPreviousBalance] = useState(initialData?.baseOpeningBalance || 0);
  const [machines, setMachines] = useState(initialData?.rentals || [
    {
      machineId: "m_" + Date.now(),
      machineCode: "JK-01",
      model: "Juki DDL-8700 High-Speed Lockstitch",
      serialNumber: "SN-001",
      rentRate: 4500,
      accessories: "Complete Stand, Table, Servo Motor",
      startDate: new Date().toISOString().slice(0, 10),
      isProratedFirstMonth: false,
      status: "Active"
    }
  ]);

  const addMachineRow = () => {
    setMachines([
      ...machines,
      {
        machineId: "m_" + Date.now() + "_" + machines.length,
        machineCode: `MCH-${machines.length + 1}`,
        model: "Industrial Sewing Unit",
        serialNumber: `SN-00${machines.length + 1}`,
        rentRate: 4500,
        accessories: "Complete Stand, Table, Motor",
        startDate: new Date().toISOString().slice(0, 10),
        isProratedFirstMonth: false,
        status: "Active"
      }
    ]);
  };

  const updateMachineRow = (idx, field, val) => {
    setMachines(machines.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };

  const removeMachineRow = (idx) => {
    setMachines(machines.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      code: code.trim() || undefined,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      nic: nic.trim(),
      baseOpeningBalance: parseFloat(previousBalance) || 0,
      rentals: (machines || []).map(m => ({
        ...m,
        rentRate: parseFloat(m.rentRate) || 0
      }))
    };

    if (mode === 'EDIT' && initialData) {
      payload.id = initialData.id;
    }

    onSubmit(payload, mode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-3xl w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>{mode === 'ADD' ? 'Register New Apparel Client' : `Edit Client: ${initialData?.name}`}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Garment Factory Profile, Opening Arrears & Rented Fleet Allocation
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Factory / Client Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Serandib Fashion Garments"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Telephone / Contact</label>
              <input
                type="text"
                placeholder="e.g. 077 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Client Email (Alerts)</label>
              <input
                type="email"
                placeholder="e.g. factory@apparel.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">NIC / Factory Reg #</label>
              <input
                type="text"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Opening Arrears (LKR)</label>
              <input
                type="number"
                step="any"
                value={previousBalance}
                onChange={(e) => setPreviousBalance(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Factory Location / Address</label>
            <input
              type="text"
              placeholder="e.g. Kosgama Industrial Zone"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Assigned Machinery Fleet Rows */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center pb-2 border-b border-carbon-700">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                Assigned Fleet Machinery ({machines.length} Units)
              </span>
              <button
                type="button"
                onClick={addMachineRow}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Machine</span>
              </button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {(machines || []).map((m, idx) => (
                <div key={idx} className="p-3 bg-carbon-900 rounded-xl border border-carbon-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      placeholder="Code (e.g. JK-01)"
                      value={m.machineCode}
                      onChange={(e) => updateMachineRow(idx, 'machineCode', e.target.value)}
                      className="p-2 bg-carbon-950 border border-carbon-700 rounded-lg text-white font-mono text-xs"
                    />
                    <input
                      placeholder="Model Description"
                      value={m.model}
                      onChange={(e) => updateMachineRow(idx, 'model', e.target.value)}
                      className="p-2 bg-carbon-950 border border-carbon-700 rounded-lg text-white text-xs sm:col-span-2"
                    />
                    <input
                      type="number"
                      placeholder="Monthly Rent"
                      value={m.rentRate}
                      onChange={(e) => updateMachineRow(idx, 'rentRate', e.target.value)}
                      className="p-2 bg-carbon-950 border border-carbon-700 rounded-lg text-emerald-400 font-mono font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <input
                      placeholder="Serial Number (SN)"
                      value={m.serialNumber}
                      onChange={(e) => updateMachineRow(idx, 'serialNumber', e.target.value)}
                      className="p-2 bg-carbon-950 border border-carbon-700 rounded-lg text-slate-300 font-mono text-xs"
                    />
                    <input
                      placeholder="Accessories / Stand / Motor"
                      value={m.accessories}
                      onChange={(e) => updateMachineRow(idx, 'accessories', e.target.value)}
                      className="p-2 bg-carbon-950 border border-carbon-700 rounded-lg text-slate-300 text-xs"
                    />
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <input
                          type="checkbox"
                          checked={m.isProratedFirstMonth}
                          onChange={(e) => updateMachineRow(idx, 'isProratedFirstMonth', e.target.checked)}
                          className="rounded bg-carbon-950 border-carbon-700"
                        />
                        <span>Prorated Days</span>
                      </label>
                      {machines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMachineRow(idx)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-xl transition flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{mode === 'ADD' ? 'Register Client & Issue Agreement' : 'Save Updated Customer Details'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
