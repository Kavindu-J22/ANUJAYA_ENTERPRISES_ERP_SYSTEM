import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShoppingCart, 
  Calculator, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  PlusCircle, 
  Lock, 
  Unlock, 
  Scale, 
  Sparkles,
  Search
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalSaleModal({
  isOpen,
  mode = 'ADD', // 'ADD' or 'EDIT'
  initialData = null,
  sale = null, // alternate prop name from App.jsx
  prefilledMachineId = null,
  machines = [],
  clients = [],
  usdRate = 330,
  onClose,
  onSubmit,
  onSave, // alternate callback prop name from App.jsx
  onOpenAddClientModal
}) {
  if (!isOpen) return null;

  const activeData = initialData || sale;
  const effectiveMode = (activeData && activeData.id) ? 'EDIT' : (mode || 'ADD');

  const [machineId, setMachineId] = useState(() => activeData?.machineId || prefilledMachineId || (machines[0]?.id || ''));
  const [qty, setQty] = useState(() => activeData?.qty || 1);
  const [unitPrice, setUnitPrice] = useState(() => activeData?.unitPrice || 0);
  
  // Client selection state
  const [clientId, setClientId] = useState(() => activeData?.clientId || '');
  const [customer, setCustomer] = useState(() => activeData?.customer || '');
  const [phone, setPhone] = useState(() => activeData?.phone || '');
  const [region, setRegion] = useState(() => activeData?.region || 'Colombo / Western Province');
  const [isClientLocked, setIsClientLocked] = useState(true);

  // Profit sharing allocation state
  const [profitAllocation, setProfitAllocation] = useState(() => activeData?.profitAllocation || 'CONSORTIUM_50_50');

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
      
      const targetClientId = activeData?.clientId || '';
      setClientId(targetClientId);
      setCustomer(activeData?.customer || '');
      setPhone(activeData?.phone || '');
      setRegion(activeData?.region || 'Colombo / Western Province');
      setIsClientLocked(Boolean(targetClientId || activeData?.customer));

      setProfitAllocation(activeData?.profitAllocation || 'CONSORTIUM_50_50');
      setPayment(activeData?.payment || 'Bank Wire / SLIPS');
      setPaymentStatus(activeData?.paymentStatus || 'PAID');
      setPaidAmount(activeData?.paidAmount || 0);
      setSerialNumbers(activeData?.serialNumbers || '');
      setDate(activeData?.date || new Date().toISOString().slice(0, 10));
      setWarranty(activeData?.warranty || '1-Year Comprehensive Warranty (Motor & PCB)');
      setError('');
    }
  }, [isOpen, activeData, prefilledMachineId, machines]);

  // Handle client selection from registered clients
  const handleClientSelect = (selectedId) => {
    setClientId(selectedId);
    if (!selectedId) {
      setIsClientLocked(false);
      return;
    }
    const found = clients.find(c => c.id === selectedId);
    if (found) {
      setCustomer(found.name);
      setPhone(found.phone || '');
      setRegion(found.address || found.region || 'Western Province');
      setIsClientLocked(true);
    }
  };

  const selectedMachine = machines.find(m => m.id === machineId);

  // Compute selected machine landed cost metrics
  const machineMetrics = useMemo(() => {
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

  // Realized profit breakdown based on profit allocation
  const { shareAnujaya, shareGlobal } = useMemo(() => {
    if (profitAllocation === 'GLOBAL_100') {
      return { shareAnujaya: 0, shareGlobal: netProfit };
    }
    if (profitAllocation === 'ANUJAYA_100') {
      return { shareAnujaya: netProfit, shareGlobal: 0 };
    }
    // Default 50/50
    return { shareAnujaya: netProfit * 0.5, shareGlobal: netProfit * 0.5 };
  }, [profitAllocation, netProfit]);

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
    if (!customer.trim()) {
      setError('Please select or specify an Apparel Client.');
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
      clientId: clientId || '',
      customer: customer.trim(),
      phone: phone.trim(),
      region,
      profitAllocation,
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto selection:bg-emerald-500 selection:text-white">
      <div className="glass-card max-w-3xl w-full max-h-[92vh] flex flex-col rounded-3xl border border-carbon-700/80 shadow-2xl overflow-hidden my-auto">
        
        {/* Header (Pinned) */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-carbon-700/80 bg-carbon-900/80 shrink-0">
          <div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <span>{effectiveMode === 'ADD' ? 'Process Machinery Dispatch & Invoice' : `Edit Dispatch: ${activeData?.id}`}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Factory Dispatch, Inventory Allocation & Profit Accounting
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-mono shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-7 overflow-y-auto space-y-4 text-xs font-sans flex-1">
          
          {/* Machine Selection & Live Specs */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block uppercase text-[10px] tracking-wider font-mono">
              Machinery Model (SKU) *
            </label>
            <select
              value={machineId}
              onChange={(e) => {
                setMachineId(e.target.value);
                const m = machines.find(x => x.id === e.target.value);
                if (m) setUnitPrice(m.wholesalePrice || m.retailPrice || 0);
              }}
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
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
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Quantity (Sets) *</label>
              <input
                type="number"
                min={1}
                required
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Unit Sale Price (LKR) *</label>
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
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Profit Sharing Allocation Selector (Requirement #4) */}
          <div className="space-y-2 p-3.5 bg-carbon-900/90 rounded-2xl border border-carbon-700/80">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Profit Sharing Allocation</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Determines consortium ledger reconciliation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProfitAllocation('CONSORTIUM_50_50')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                  profitAllocation === 'CONSORTIUM_50_50'
                    ? 'bg-sky-950/80 border-sky-500 text-white shadow-md'
                    : 'bg-carbon-950 border-carbon-800 text-slate-400 hover:border-carbon-700'
                }`}
              >
                <div>
                  <span className="font-bold text-xs block text-white">50/50 Consortium Split</span>
                  <span className="text-[10px] text-slate-400 font-mono">Standard 50% Anujaya / 50% Global</span>
                </div>
                {profitAllocation === 'CONSORTIUM_50_50' && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setProfitAllocation('GLOBAL_100')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                  profitAllocation === 'GLOBAL_100'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                    : 'bg-carbon-950 border-carbon-800 text-slate-400 hover:border-carbon-700'
                }`}
              >
                <div>
                  <span className="font-bold text-xs block text-emerald-300">100% Global Enterprises</span>
                  <span className="text-[10px] text-slate-400 font-mono">100% Full Profit to Global (China)</span>
                </div>
                {profitAllocation === 'GLOBAL_100' && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-4 rounded-xl bg-carbon-900/90 border border-carbon-700/80 space-y-2 font-mono">
            <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-carbon-800">
              <div>
                <span className="text-slate-400 text-[10px] block">Gross Revenue:</span>
                <span className="text-xs sm:text-sm font-bold text-white">{formatLKR(totalRevenue)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Landed Cost:</span>
                <span className="text-xs sm:text-sm font-bold text-amber-300">{formatLKR(totalCost)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Profit:</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400">{formatLKR(netProfit)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex justify-between bg-carbon-950/60 p-2 rounded-lg border border-carbon-800">
                <span className="text-sky-300">Anujaya Share:</span>
                <span className="font-bold text-white">{formatLKR(shareAnujaya)}</span>
              </div>
              <div className="flex justify-between bg-carbon-950/60 p-2 rounded-lg border border-carbon-800">
                <span className="text-emerald-300">Global Share:</span>
                <span className="font-bold text-emerald-300">{formatLKR(shareGlobal)}</span>
              </div>
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
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-sky-300 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Apparel Client Selection (Requirement #3) */}
          <div className="space-y-3 p-4 bg-carbon-900/90 rounded-2xl border border-carbon-700/80">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Select Apparel Manufacturing Client *</span>
              </label>

              <div className="flex items-center gap-2">
                {onOpenAddClientModal && (
                  <button
                    type="button"
                    onClick={onOpenAddClientModal}
                    className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-950/60 hover:bg-purple-900/80 px-2 py-0.5 rounded-md border border-purple-800 transition"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Add New Client</span>
                  </button>
                )}
                {clientId && (
                  <button
                    type="button"
                    onClick={() => setIsClientLocked(!isClientLocked)}
                    className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-carbon-800 px-2 py-0.5 rounded-md transition"
                  >
                    {isClientLocked ? <Lock className="w-3 h-3 text-emerald-400" /> : <Unlock className="w-3 h-3 text-amber-400" />}
                    <span>{isClientLocked ? 'Locked' : 'Unlocked'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Client Picker Dropdown */}
            <select
              value={clientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-mono focus:outline-none focus:border-purple-500 shadow-inner"
            >
              <option value="">-- Choose from Registered Apparel Clients --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} | {c.name} ({c.region || 'Western'}) - {c.phone}
                </option>
              ))}
            </select>

            {/* Auto-filled details (Readonly when locked) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] font-mono uppercase">Client Company Name</label>
                <input
                  type="text"
                  required
                  readOnly={isClientLocked && Boolean(clientId)}
                  placeholder="e.g. Brandix Apparel Solutions"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-white font-bold focus:outline-none ${
                    isClientLocked && Boolean(clientId)
                      ? 'bg-carbon-950 border-carbon-800 text-purple-300 cursor-not-allowed'
                      : 'bg-carbon-900 border-carbon-700 focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] font-mono uppercase">Phone / Contact</label>
                <input
                  type="text"
                  readOnly={isClientLocked && Boolean(clientId)}
                  placeholder="e.g. 011-4727000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:outline-none ${
                    isClientLocked && Boolean(clientId)
                      ? 'bg-carbon-950 border-carbon-800 text-sky-300 cursor-not-allowed'
                      : 'bg-carbon-900 border-carbon-700 text-white focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] font-mono uppercase">Factory Plant / Zone</label>
                <input
                  type="text"
                  readOnly={isClientLocked && Boolean(clientId)}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isClientLocked && Boolean(clientId)
                      ? 'bg-carbon-950 border-carbon-800 text-slate-300 cursor-not-allowed'
                      : 'bg-carbon-900 border-carbon-700 text-white focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
            {isClientLocked && Boolean(clientId) && (
              <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Client verified & auto-filled from Master Directory</span>
              </div>
            )}
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Payment Method</label>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-emerald-500"
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
                className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="PAID">Full Payment Settled (PAID)</option>
                <option value="PARTIAL">Partial Payment / Advance</option>
                <option value="CREDIT">30-Day Commercial Credit</option>
              </select>
            </div>

            {paymentStatus === 'PARTIAL' ? (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Advance Paid (LKR) *</label>
                <input
                  type="number"
                  step="any"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold uppercase text-[10px] font-mono">Invoice Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-mono focus:outline-none focus:border-emerald-500"
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
              className="w-full p-3 rounded-xl bg-carbon-900 border border-carbon-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button (Sticky Bottom Action Bar) */}
          <div className="pt-3 sticky bottom-0 bg-carbon-950/95 backdrop-blur-md -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 md:-mx-7 md:-mb-7 p-4 sm:p-5 border-t border-carbon-800/80 mt-6 z-10">
            <button
              type="submit"
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-xs uppercase tracking-wider rounded-xl text-white shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{effectiveMode === 'ADD' ? 'Confirm & Generate Official Tax Invoice' : 'Update Transaction & Reconcile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
