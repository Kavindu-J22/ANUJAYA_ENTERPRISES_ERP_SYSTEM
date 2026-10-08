import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle2 } from 'lucide-react';

export function LocalCustomerModal({
  isOpen,
  mode = 'ADD', // 'ADD' or 'EDIT'
  initialData = null,
  onClose,
  onSubmit
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nic, setNic] = useState('REG-CLIENT');
  const [previousBalance, setPreviousBalance] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setCode(initialData?.code || ('CUST-' + Math.floor(100 + Math.random() * 900)));
      setPhone(initialData?.phone || '');
      setEmail(initialData?.email || '');
      setAddress(initialData?.address || '');
      setNic(initialData?.nic || 'REG-CLIENT');
      setPreviousBalance(initialData?.baseOpeningBalance || 0);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      id: initialData?.id || ("c_" + Date.now()),
      code: (code.trim() || ('CUST-' + Math.floor(100 + Math.random() * 900))),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      nic: nic.trim(),
      baseOpeningBalance: parseFloat(previousBalance) || 0,
      rentals: initialData?.rentals || []
    };

    onSubmit(payload, mode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>{mode === 'ADD' ? 'Register New Apparel Client' : `Edit Client: ${initialData?.name}`}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Garment Factory Profile, Opening Arrears & Fleet Details
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Client Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CUST-024"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500 uppercase"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Factory / Client Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Serandib Fashion Garments"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Factory Location / Address</label>
              <input
                type="text"
                placeholder="e.g. Kosgama Industrial Zone"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-sky-500"
              />
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
