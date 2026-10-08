import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalPaymentModal({
  isOpen,
  customers,
  prefilledCustomer = null,
  activeMonth,
  initialData = null,
  mode = 'ADD',
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  const [customerId, setCustomerId] = useState(initialData?.customerId || prefilledCustomer?.id || (customers[0]?.id || ''));
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [method, setMethod] = useState(initialData?.method || 'BOC Ruwanwella Transfer');
  const [refNo, setRefNo] = useState(initialData?.refNo || "REC-" + Date.now().toString().slice(-6));
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10));
  const [paymentMonth, setPaymentMonth] = useState(initialData?.month || activeMonth || 'August 2026');

  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customerId || '');
      setAmount(initialData.amount || '');
      setMethod(initialData.method || 'BOC Ruwanwella Transfer');
      setRefNo(initialData.refNo || "REC-" + Date.now().toString().slice(-6));
      setDate(initialData.date || new Date().toISOString().slice(0, 10));
      setPaymentMonth(initialData.month || activeMonth || 'August 2026');
    } else if (prefilledCustomer) {
      setCustomerId(prefilledCustomer.id || '');
      setAmount('');
      setMethod('BOC Ruwanwella Transfer');
      setRefNo("REC-" + Date.now().toString().slice(-6));
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMonth(activeMonth || 'August 2026');
    } else {
      setCustomerId(customers[0]?.id || '');
      setAmount('');
      setMethod('BOC Ruwanwella Transfer');
      setRefNo("REC-" + Date.now().toString().slice(-6));
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMonth(activeMonth || 'August 2026');
    }
  }, [isOpen, initialData, prefilledCustomer, activeMonth]);

  const selectedCustomer = customers.find(c => c.id === customerId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    const targetMonth = (paymentMonth || activeMonth || 'August 2026').trim();

    const payload = {
      customerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'Garment Client',
      amount: parsedAmount,
      method,
      refNo: refNo.trim() || `REC-${Date.now().toString().slice(-6)}`,
      date,
      month: targetMonth
    };

    if (mode === 'EDIT' && initialData) {
      payload.id = initialData.id;
    } else {
      payload.id = "pay_" + Date.now();
    }

    onSubmit(payload, mode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>{mode === 'ADD' ? 'Record Rent Payment Collection' : 'Edit Payment Details'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Target Month: <span className="text-emerald-400 font-bold">{paymentMonth}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Select Apparel Client</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-bold focus:outline-none focus:border-sky-500"
            >
              {(customers || []).map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} | {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono flex justify-between">
              <span>Target Billing Cycle / Month</span>
              <span className="text-emerald-400 font-normal">Applies exclusively to this month</span>
            </label>
            <input
              type="text"
              required
              value={paymentMonth}
              onChange={(e) => setPaymentMonth(e.target.value)}
              placeholder="e.g. June 2026"
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-sky-400 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Amount Paid (LKR)</label>
            <input
              type="number"
              step="any"
              min={1}
              required
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-emerald-400 font-mono font-bold text-base focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="BOC Ruwanwella Transfer">BOC Ruwanwella Transfer</option>
              <option value="Direct Cash Payment">Direct Cash Payment</option>
              <option value="Cheque (PDC)">Cheque (PDC)</option>
              <option value="Commercial Bank SLIPS">Commercial Bank SLIPS</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Payment Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Receipt / Ref #</label>
              <input
                type="text"
                required
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-lg transition flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Issue Official Receipt</span>
          </button>
        </form>
      </div>
    </div>
  );
}
