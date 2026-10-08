import React, { useState, useEffect, useMemo } from 'react';
import { X, RotateCcw, CheckCircle2 } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalReturnModal({
  isOpen,
  customers = [],
  customer = null,
  prefilledRental = null,
  onClose,
  onSubmit
}) {
  // Determine available customers
  const customersWithRentals = useMemo(() => {
    return (customers || []).filter(c => (c.rentals || []).some(r => r.status === 'Active'));
  }, [customers]);

  const [selectedCustomerId, setSelectedCustomerId] = useState(() => {
    if (customer?.id) return customer.id;
    return customersWithRentals[0]?.id || customers?.[0]?.id || '';
  });

  const activeCustomer = useMemo(() => {
    if (customer) return customer;
    return (customers || []).find(c => c.id === selectedCustomerId) || null;
  }, [customer, customers, selectedCustomerId]);

  const activeRentals = useMemo(() => {
    if (!activeCustomer) return [];
    return (activeCustomer.rentals || []).filter(r => r.status === 'Active');
  }, [activeCustomer]);

  const [selectedMachineId, setSelectedMachineId] = useState('CUSTOM');
  const [customModel, setCustomModel] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customSerial, setCustomSerial] = useState('');
  const [deductAmount, setDeductAmount] = useState(4500);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [slipNo, setSlipNo] = useState("RET-" + Date.now().toString().slice(-5));
  const [condition, setCondition] = useState("Good / Operational");
  const [remarks, setRemarks] = useState("Motor, Table & Stand verified intact at Kosgama Central Yard.");
  const [inspector, setInspector] = useState("Kosgama Yard Head");

  // Synchronize when activeCustomer or prefilledRental changes
  useEffect(() => {
    if (!isOpen) return;
    if (customer?.id) {
      setSelectedCustomerId(customer.id);
    } else if (!selectedCustomerId && customersWithRentals.length > 0) {
      setSelectedCustomerId(customersWithRentals[0].id);
    }
  }, [isOpen, customer, customersWithRentals]);

  useEffect(() => {
    if (!isOpen) return;
    const targetRental = prefilledRental || activeRentals[0];
    if (targetRental) {
      setSelectedMachineId(targetRental.machineId);
      setCustomModel(targetRental.model || '');
      setCustomCode(targetRental.machineCode || '');
      setCustomSerial(targetRental.serialNumber || '');
      setDeductAmount(targetRental.rentRate || 4500);
    } else {
      setSelectedMachineId('CUSTOM');
      setCustomModel('Industrial Sewing Machine');
      setCustomCode('MCH-01');
      setCustomSerial('SN-RET-01');
      setDeductAmount(4500);
    }
    setSlipNo("RET-" + Date.now().toString().slice(-5));
    setReturnDate(new Date().toISOString().slice(0, 10));
  }, [isOpen, activeCustomer?.id, prefilledRental, activeRentals.length]);

  if (!isOpen) return null;

  const handleCustomerChange = (cId) => {
    setSelectedCustomerId(cId);
    const newCust = (customers || []).find(c => c.id === cId);
    const newActiveRentals = (newCust?.rentals || []).filter(r => r.status === 'Active');
    const firstM = newActiveRentals[0];
    if (firstM) {
      setSelectedMachineId(firstM.machineId);
      setCustomModel(firstM.model);
      setCustomCode(firstM.machineCode);
      setCustomSerial(firstM.serialNumber);
      setDeductAmount(firstM.rentRate);
    } else {
      setSelectedMachineId('CUSTOM');
      setCustomModel('Industrial Sewing Machine');
      setCustomCode('MCH-01');
      setCustomSerial('SN-RET-01');
      setDeductAmount(4500);
    }
  };

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
    if (!activeCustomer) {
      alert("Please select a customer account first.");
      return;
    }
    onSubmit({
      customer: activeCustomer,
      customerId: activeCustomer.id,
      machineId: selectedMachineId,
      selectedMachineId,
      model: customModel,
      machineCode: customCode,
      serialNumber: customSerial,
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>Yard Machinery Return Workflow</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Process Central Kosgama Fleet De-Hire & Return Slip
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          {/* Customer Selection if opened generally */}
          {!customer && (
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Select Client Account *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-sky-400 font-bold focus:outline-none focus:border-amber-500 font-mono"
              >
                {customersWithRentals.map(c => {
                  const actCount = (c.rentals || []).filter(r => r.status === 'Active').length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) — {actCount} Active Machine(s)
                    </option>
                  );
                })}
                {customersWithRentals.length === 0 && (
                  <option value="">No clients with active machinery</option>
                )}
              </select>
            </div>
          )}

          {customer && (
            <div className="p-3 bg-carbon-900/80 rounded-xl border border-carbon-700/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Client Account</span>
                <span className="text-sm font-bold text-white">{customer.name}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-carbon-800 text-sky-400 font-mono text-xs font-bold border border-carbon-700">
                {customer.code}
              </span>
            </div>
          )}
          
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
