import React, { useState, useEffect } from 'react';
import { X, Building2, Save, AlertCircle, Phone, Mail, MapPin, FileText, DollarSign, ShieldCheck } from 'lucide-react';

export function GlobalClientModal({
  isOpen,
  mode = 'ADD', // 'ADD' or 'EDIT'
  client = null,
  clients = [],
  onClose,
  onSave
}) {
  if (!isOpen) return null;

  const effectiveMode = client?.id ? 'EDIT' : mode;

  // Auto-generate code if adding
  const nextCode = React.useMemo(() => {
    if (client?.code) return client.code;
    const existingNums = (clients || []).map(c => {
      const match = String(c.code || '').match(/GC-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums, 0) : 0;
    return `GC-${String(maxNum + 1).padStart(2, '0')}`;
  }, [clients, client]);

  const [code, setCode] = useState(() => client?.code || nextCode);
  const [name, setName] = useState(() => client?.name || '');
  const [contactPerson, setContactPerson] = useState(() => client?.contactPerson || '');
  const [phone, setPhone] = useState(() => client?.phone || '');
  const [email, setEmail] = useState(() => client?.email || '');
  const [address, setAddress] = useState(() => client?.address || '');
  const [region, setRegion] = useState(() => client?.region || 'Colombo / Western Province');
  const [tinVat, setTinVat] = useState(() => client?.tinVat || '');
  const [creditLimit, setCreditLimit] = useState(() => client?.creditLimit || 5000000);
  const [notes, setNotes] = useState(() => client?.notes || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setCode(client.code || nextCode);
        setName(client.name || '');
        setContactPerson(client.contactPerson || '');
        setPhone(client.phone || '');
        setEmail(client.email || '');
        setAddress(client.address || '');
        setRegion(client.region || 'Colombo / Western Province');
        setTinVat(client.tinVat || '');
        setCreditLimit(client.creditLimit !== undefined ? client.creditLimit : 5000000);
        setNotes(client.notes || '');
      } else {
        setCode(nextCode);
        setName('');
        setContactPerson('');
        setPhone('');
        setEmail('');
        setAddress('');
        setRegion('Colombo / Western Province');
        setTinVat('');
        setCreditLimit(5000000);
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, client, nextCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Company / Client Name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Contact Phone Number is required.');
      return;
    }

    const payload = {
      id: client?.id || `gc_${Date.now()}`,
      code: code.trim() || nextCode,
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      region: region.trim() || 'Western Province',
      tinVat: tinVat.trim(),
      creditLimit: parseFloat(creditLimit) || 0,
      notes: notes.trim()
    };

    if (onSave) {
      onSave(payload, effectiveMode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto selection:bg-purple-500 selection:text-white">
      <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700/80">
          <div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span>{effectiveMode === 'ADD' ? 'Register Apparel Manufacturing Client' : `Edit Client: ${client?.name}`}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Consortium Commercial Buyer Account & Dispatch Profile
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          {/* Client Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono tracking-wider">
                Client Code
              </label>
              <input
                type="text"
                readOnly
                value={code}
                className="w-full p-2.5 rounded-xl bg-carbon-950 border border-carbon-800 text-purple-300 font-mono font-bold focus:outline-none cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono tracking-wider">
                Company / Factory Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MAS Holdings / Brandix Apparel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Contact Director / Officer</label>
              <input
                type="text"
                placeholder="e.g. Dinesh Perera"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Hotline / Mobile Phone *</label>
              <input
                type="text"
                required
                placeholder="e.g. 011-4727000 / 077-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-sky-300 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Email & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Official Email</label>
              <input
                type="email"
                placeholder="e.g. procurement@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Industrial Zone / Region</label>
              <input
                type="text"
                placeholder="e.g. Katunayake BOI / Biyagama / Horana"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Factory Plant Address */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Factory Plant Address</label>
            <input
              type="text"
              placeholder="e.g. Plot 45, Mirigama Export Processing Zone, Western Province"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* TIN / VAT & Credit Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">TIN / VAT Registration No</label>
              <input
                type="text"
                placeholder="e.g. VAT114002981-7000"
                value={tinVat}
                onChange={(e) => setTinVat(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-amber-300 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Credit Limit (LKR)</label>
              <input
                type="number"
                step="any"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Special Notes */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Operational Machinery Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Key client for Juki Lockstitch and Kansai Multi-needle lines..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-xl shadow-purple-950/60 transition flex items-center justify-center gap-2 mt-3"
          >
            <Save className="w-4 h-4" />
            <span>{effectiveMode === 'ADD' ? 'Save & Register Client' : 'Update Client Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
