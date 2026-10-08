import React, { useState } from 'react';
import { X, RotateCcw, CheckCircle2 } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalReturnModal({
  isOpen,
  customer,
  prefilledRental = null,
  onClose,
  onSubmit
}) {
  if (!isOpen || !customer) return null;

  const activeRentals = (customer.rentals || []).filter(r => r.status === 'Active');
  const defaultMachine = prefilledRental || activeRentals[0];

  const [selectedMachineId, setSelectedMachineId] = useState(defaultMachine ? defaultMachine.machineId : 'CUSTOM');
  const [customModel, setCustomModel] = useState(defaultMachine ? defaultMachine.model : 'Industrial Sewing Machine');
  const [customCode, setCustomCode] = useState(defaultMachine ? defaultMachine.machineCode : 'MCH-01');
  const [customSerial, setCustomSerial] = useState(defaultMachine ? defaultMachine.serialNumber : 'SN-RET-01');
  const [deductAmount, setDeductAmount] = useState(defaultMachine ? defaultMachine.rentRate : 4500);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [slipNo, setSlipNo] = useState("RET-" + Date.now().toString().slice(-5));
  const [condition, setCondition] = useState("Good / Operational");
  const [remarks, setRemarks] = useState("Motor, Table & Stand verified intact at Kosgama Central Yard.");
  const [inspector, setInspector] = useState("Kosgama Yard Head");

  const handleMachineChange = (mId) => {
    setSelectedMachineId(mId);
    if (mId === 'CUSTOM') return;
    const r = activeRentals.find(x => x.machineId === mId);
    if (r) {
      setCustomModel(r.model);
      setCustomCode(r.machineCode);
      setCustomSerial(r.serialNumber);
      setDeductAmount(r.rentRate);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      customer,
      selectedMachineId,
      customModel,
      customCode,
      customSerial,
      deductAmount: parseFloat(deductAmount) || 0,
      returnDate,
      slipNo,
      condition,
      remarks,
      inspector
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>Yard Machinery Return Workflow</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Client: <span className="text-white font-bold">{customer.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Select Machine Being Returned</label>
            <select
              value={selectedMachineId}
              onChange={(e) => handleMachineChange(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-bold focus:outline-none focus:border-amber-500"
            >
              {activeRentals.map(r => (
                <option key={r.machineId} value={r.machineId}>
                  {r.machineCode} | {r.model} (SN: {r.serialNumber} — Rent: Rs. {r.rentRate})
                </option>
              ))}
              <option value="CUSTOM">-- Manual / Partial Unit Return --</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Machine Model</label>
              <input
                type="text"
                required
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Serial Number (SN)</label>
              <input
                type="text"
                value={customSerial}
                onChange={(e) => setCustomSerial(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Monthly Rent Deducted (LKR)</label>
              <input
                type="number"
                step="any"
                min={0}
                required
                value={deductAmount}
                onChange={(e) => setDeductAmount(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Return Date</label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Return Slip #</label>
              <input
                type="text"
                value={slipNo}
                onChange={(e) => setSlipNo(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Yard Inspection Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="Good / Operational">Good / Operational</option>
                <option value="Complete Handed Over">Complete Handed Over</option>
                <option value="Minor Wear / Needs Servicing">Minor Wear / Needs Servicing</option>
                <option value="Defective Motor / Parts Missing">Defective Motor / Parts Missing</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Inspector Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-lg transition flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Return & Issue Official Return Note</span>
          </button>
        </form>
      </div>
    </div>
  );
}
