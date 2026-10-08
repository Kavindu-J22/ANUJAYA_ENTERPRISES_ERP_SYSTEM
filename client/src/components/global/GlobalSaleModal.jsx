import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Calculator, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalSaleModal({
  isOpen,
  mode = 'ADD', // 'ADD' or 'EDIT'
  initialData = null,
  sale = null, // alternate prop name from App.jsx
  prefilledMachineId = null,
  machines = [],
  usdRate = 330,
  onClose,
  onSubmit,
  onSave // alternate callback prop name from App.jsx
}) {
  if (!isOpen) return null;

  const activeData = initialData || sale;
  const effectiveMode = (activeData && activeData.id) ? 'EDIT' : (mode || 'ADD');

  const [machineId, setMachineId] = useState(() => activeData?.machineId || prefilledMachineId || (machines[0]?.id || ''));
  const [qty, setQty] = useState(() => activeData?.qty || 1);
  const [unitPrice, setUnitPrice] = useState(() => activeData?.unitPrice || 0);
  const [customer, setCustomer] = useState(() => activeData?.customer || '');
  const [phone, setPhone] = useState(() => activeData?.phone || '');
  const [region, setRegion] = useState(() => activeData?.region || 'Colombo / Western Province');
  const [payment, setPayment] = useState(() => activeData?.payment || 'Bank Wire / SLIPS');
  const [paymentStatus, setPaymentStatus] = useState(() => activeData?.paymentStatus || 'PAID');
  const [paidAmount, setPaidAmount] = useState(() => activeData?.paidAmount || 0);
  const [serialNumbers, setSerialNumbers] = useState(() => activeData?.serialNumbers || '');
  const [date, setDate] = useState(() => activeData?.date || new Date().toISOString().slice(0, 10));
  const [warranty, setWarranty] = useState(() => activeData?.warranty || '1-Year Comprehensive Warranty (Motor & PCB)');
  const [error, setError] = useState('');

  // Sync state whenever activeData or prefilledMachineId changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const targetMachineId = activeData?.machineId || prefilledMachineId || (machines[0]?.id || '');
      setMachineId(targetMachineId);
      setQty(activeData?.qty || 1);
      
      const targetMachine = machines.find(m => m.id === targetMachineId);
      setUnitPrice(activeData?.unitPrice || targetMachine?.wholesalePrice || targetMachine?.retailPrice || 0);
      setCustomer(activeData?.customer || '');
      setPhone(activeData?.phone || '');
      setRegion(activeData?.region || 'Colombo / Western Province');
      setPayment(activeData?.payment || 'Bank Wire / SLIPS');
      setPaymentStatus(activeData?.paymentStatus || 'PAID');
      setPaidAmount(activeData?.paidAmount || 0);
      setSerialNumbers(activeData?.serialNumbers || '');
      setDate(activeData?.date || new Date().toISOString().slice(0, 10));
      setWarranty(activeData?.warranty || '1-Year Comprehensive Warranty (Motor & PCB)');
      setError('');
    }
  }, [isOpen, activeData, prefilledMachineId, machines]);

  const selectedMachine = machines.find(m => m.id === machineId);

  // Compute selected machine metrics
  const machineMetrics = React.useMemo(() => {
    if (!selectedMachine) return { totalCostLKR: 0, wholesalePrice: 0, retailPrice: 0, availableStock: 0 };
    const baseCost = (parseFloat(selectedMachine.usdPrice) || 0) * usdRate;
    const totalCostLKR = baseCost + (parseFloat(selectedMachine.taxLKR) || 0);
    return {
      totalCostLKR,
      wholesalePrice: selectedMachine.wholesalePrice || 0,
      retailPrice: selectedMachine.retailPrice || 0,
      availableStock: selectedMachine.initialStock || 0
    };
  }, [selectedMachine, usdRate]);

  // Set default price when machine changes if unitPrice is zero
  useEffect(() => {
    if (selectedMachine && (!unitPrice || unitPrice === 0)) {
      setUnitPrice(selectedMachine.wholesalePrice || selectedMachine.retailPrice || 0);
    }
  }, [machineId, selectedMachine]);

  // Calculations
  const totalRevenue = (parseInt(qty) || 0) * (parseFloat(unitPrice) || 0);
  const totalCost = (parseInt(qty) || 0) * machineMetrics.totalCostLKR;
  const netProfit = totalRevenue - totalCost;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!machineId) {
      setError('Please select a machinery model.');
      return;
    }
    if (qty <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (unitPrice <= 0) {
      setError('Unit price must be greater than zero.');
      return;
    }

    const assignedId = activeData?.id || `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      id: assignedId,
      date,
      machineId,
      qty: parseInt(qty),
      unitPrice: parseFloat(unitPrice),
      frozenExchangeRate: usdRate,
      frozenUnitCost: machineMetrics.totalCostLKR,
      serialNumbers: serialNumbers.trim(),
      customer: customer.trim() || 'Apparel Manufacturer',
      phone: phone.trim(),
      region,
      payment,
      paymentStatus,
      paidAmount: paymentStatus === 'PAID' ? totalRevenue : (parseFloat(paidAmount) || 0),
      warranty,
      cancelled: false
    };

    const submitFn = onSubmit || onSave;
    if (submitFn) {
      submitFn(payload, effectiveMode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-carbon-700/80 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-carbon-700">
          <div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <span>{effectiveMode === 'ADD' ? 'Process Machinery Dispatch & Invoice' : `Edit Dispatch: ${activeData?.id}`}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Factory Dispatch, Inventory Deduction & Tax Accounting
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
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
          
          {/* Machine Selection & Live Specs */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block uppercase text-[10px] tracking-wider font-mono">
              Machinery Model (SKU)
            </label>
            <select
              value={machineId}
              onChange={(e) => {
                setMachineId(e.target.value);
                const m = machines.find(x => x.id === e.target.value);
                if (m) setUnitPrice(m.wholesalePrice || 0);
              }}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="">-- Choose Machinery SKU --</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.id} | {m.brand} {m.model} (Initial: {m.initialStock} | FOB: ${m.usdPrice})
                </option>
              ))}
            </select>

            {selectedMachine && (
              <div className="p-3.5 bg-carbon-900/90 rounded-xl border border-carbon-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block">Brand & Unit:</span>
                  <span className="text-white font-bold">{selectedMachine.brand} ({selectedMachine.unit || 'SETS'})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Landed Cost:</span>
                  <span className="text-sky-300 font-bold">{formatLKR(machineMetrics.totalCostLKR)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Wholesale Price:</span>
                  <span className="text-amber-300 font-bold">{formatLKR(selectedMachine.wholesalePrice)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Retail Price:</span>
                  <span className="text-emerald-400 font-bold">{formatLKR(selectedMachine.retailPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Quantity (Sets)</label>
              <input
                type="number"
                min={1}
                required
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Unit Sale Price (LKR)</label>
                {selectedMachine && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setUnitPrice(selectedMachine.wholesalePrice || 0)}
                      className="px-2 py-0.5 rounded bg-carbon-800 hover:bg-amber-600/40 text-[10px] font-mono text-amber-300 transition"
                    >
                      Wholesale
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitPrice(selectedMachine.retailPrice || 0)}
                      className="px-2 py-0.5 rounded bg-carbon-800 hover:bg-emerald-600/40 text-[10px] font-mono text-emerald-300 transition"
                    >
                      Retail
                    </button>
                  </div>
                )}
              </div>
              <input
                type="number"
                step="any"
                min={1}
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-4 rounded-xl bg-carbon-900/90 border border-carbon-700/80 grid grid-cols-3 gap-2 text-center font-mono">
            <div>
              <span className="text-slate-400 text-[11px] block">Gross Revenue:</span>
              <span className="text-sm font-bold text-white">{formatLKR(totalRevenue)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Landed Cost:</span>
              <span className="text-sm font-bold text-amber-300">{formatLKR(totalCost)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Consortium Profit:</span>
              <span className="text-sm font-bold text-emerald-400">{formatLKR(netProfit)}</span>
            </div>
          </div>

          {/* Serial Numbers */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">
              Asset Serial Numbers (SN)
            </label>
            <input
              type="text"
              placeholder="e.g. SN-88214, SN-88215, SN-88216"
              value={serialNumbers}
              onChange={(e) => setSerialNumbers(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-sky-300 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Apparel Client Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Brandix / MAS / Serandib"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Phone / Contact</label>
              <input
                type="text"
                placeholder="e.g. 077 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Factory Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Payment Method</label>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
              >
                <option value="Bank Wire / SLIPS">Bank Wire / SLIPS</option>
                <option value="Direct Cash Payment">Direct Cash Payment</option>
                <option value="Cheque (PDC)">Cheque (PDC)</option>
                <option value="LC / TT">LC / TT</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
              >
                <option value="PAID">Full Payment Settled (PAID)</option>
                <option value="PARTIAL">Partial Payment / Advance</option>
                <option value="CREDIT">30-Day Commercial Credit</option>
              </select>
            </div>

            {paymentStatus === 'PARTIAL' ? (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Amount Paid (LKR)</label>
                <input
                  type="number"
                  step="any"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-emerald-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Invoice Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            )}
          </div>

          {/* Warranty Terms */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Warranty & Support Terms</label>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{effectiveMode === 'ADD' ? 'Confirm & Generate Official Tax Invoice' : 'Update Transaction & Reconcile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
