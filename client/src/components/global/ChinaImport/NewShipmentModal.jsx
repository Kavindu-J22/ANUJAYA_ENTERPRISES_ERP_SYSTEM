import React, { useState } from 'react';
import { X, Ship, Plus, CheckCircle2 } from 'lucide-react';

export function NewShipmentModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    shipmentNo: `2026(SLLK)${Math.floor(100 + Math.random() * 900)}`,
    supplierName: "China Juki Industrial Machinery Export Corp.",
    invoiceNo: `INV-CN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    purchaseReference: `PO-${new Date().getFullYear()}-IMPORT`,
    shipmentDate: new Date().toISOString().slice(0, 10),
    estimatedArrivalDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    origin: "Ningbo / Taizhou Port, China",
    destination: "Colombo Port / Kosgama Central Yard, Sri Lanka",
    shippingCarrier: "Maersk Line",
    containerNo: "MSKU-40HC",
    blNumber: `BL-CN-${Math.floor(100000 + Math.random() * 900000)}`,
    totalUnits: 150,
    fobUsd: 65000,
    budgetUsdRate: 330,
    budgetCustomsLkr: 2500000,
    partnerRatio: 0.50
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const totalBudgetLkr = Math.round(((Number(formData.fobUsd) * Number(formData.budgetUsdRate)) + Number(formData.budgetCustomsLkr)) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newShipment = {
        ...formData,
        totalUnits: Number(formData.totalUnits) || 0,
        fobUsd: Number(formData.fobUsd) || 0,
        budgetUsdRate: Number(formData.budgetUsdRate) || 330,
        budgetCustomsLkr: Number(formData.budgetCustomsLkr) || 0,
        budgetTotalLiabilityLkr: totalBudgetLkr,
        status: "in_transit",
        items: [
          {
            id: "CSI-NEW-01",
            sku: "M-01",
            brand: "JUKI",
            model: "DDL-8700-7 Lockstitch",
            name: "High Speed 1-Needle Lockstitch Workstation",
            category: "Industrial Sewing Machines",
            unit: "SETS",
            qtyOrdered: Number(formData.totalUnits),
            qtyShipped: Number(formData.totalUnits),
            qtyReceived: 0,
            unitFobUsd: Math.round(Number(formData.fobUsd) / Number(formData.totalUnits)),
            totalFobUsd: Number(formData.fobUsd),
            allocatedLandedCostLkr: totalBudgetLkr,
            stockIntakeStatus: "pending"
          }
        ],
        partners: [
          {
            partnerId: "PTR-GLOBAL",
            name: "Global Apparel Solutions",
            role: "Joint Funding Partner",
            agreedRatio: Number(formData.partnerRatio),
            targetLiabilityLkr: Math.round(totalBudgetLkr * Number(formData.partnerRatio)),
            notes: "Funding commitment agreement"
          },
          {
            partnerId: "PTR-OURCO",
            name: "Our Company (Anujaya Enterprises)",
            role: "Operational Lead & Fleet Management",
            agreedRatio: 1 - Number(formData.partnerRatio),
            targetLiabilityLkr: Math.round(totalBudgetLkr * (1 - Number(formData.partnerRatio))),
            notes: "Direct execution and clearance"
          }
        ],
        partnerReceipts: [],
        intermediaries: [
          { id: "INT-01", name: "Ashen", country: "China / Sri Lanka", operatingCurrency: "RMB" },
          { id: "INT-02", name: "Friend 2 (Korea / Dubai)", country: "Korea / Dubai Route", operatingCurrency: "RMB" },
          { id: "INT-03", name: "Direct Bank TT (Sri Lanka)", country: "Sri Lanka to China", operatingCurrency: "USD" }
        ],
        intermediaryAdvances: [],
        supplierPayments: [],
        customsExpenses: [],
        goodsReceipts: [],
        auditLogs: [
          {
            id: `LOG-${Date.now().toString().slice(-6)}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            action: "Shipment Created",
            user: "Admin",
            details: `Created shipment ${formData.shipmentNo} with budget LKR ${totalBudgetLkr.toLocaleString()}`
          }
        ]
      };

      await onSave(newShipment);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-carbon-900 border border-carbon-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-carbon-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Ship className="w-5 h-5 text-indigo-400" />
              <span>Initialize New China Import Shipment</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Multi-Shipment Budgeting & Settlement Configuration
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Shipment / Invoice No</label>
              <input
                type="text"
                value={formData.shipmentNo}
                onChange={(e) => setFormData({ ...formData, shipmentNo: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">China Supplier Name</label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Shipment Date</label>
              <input
                type="date"
                value={formData.shipmentDate}
                onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Est. Arrival Date</label>
              <input
                type="date"
                value={formData.estimatedArrivalDate}
                onChange={(e) => setFormData({ ...formData, estimatedArrivalDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Machine Units</label>
              <input
                type="number"
                value={formData.totalUnits}
                onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-teal-300 font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total FOB Value (USD)</label>
              <input
                type="number"
                step="any"
                value={formData.fobUsd}
                onChange={(e) => setFormData({ ...formData, fobUsd: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-emerald-300 font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Budget FX Rate (LKR)</label>
              <input
                type="number"
                step="any"
                value={formData.budgetUsdRate}
                onChange={(e) => setFormData({ ...formData, budgetUsdRate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-amber-300 font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Customs Budget (LKR)</label>
              <input
                type="number"
                step="any"
                value={formData.budgetCustomsLkr}
                onChange={(e) => setFormData({ ...formData, budgetCustomsLkr: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-purple-300 font-bold"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-carbon-950 border border-carbon-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Calculated Total Import Liability</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                LKR {totalBudgetLkr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Global Partner Funding Share</span>
              <span className="text-xs font-bold text-sky-400 font-mono">
                {(formData.partnerRatio * 100).toFixed(0)}% (LKR {(totalBudgetLkr * formData.partnerRatio).toLocaleString('en-US')})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Container & Carrier</label>
              <input
                type="text"
                placeholder="e.g. MSKU-9823410 / Maersk Line"
                value={formData.containerNo}
                onChange={(e) => setFormData({ ...formData, containerNo: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Bill of Lading (BL) #</label>
              <input
                type="text"
                placeholder="e.g. MAEU-2026-SLLK"
                value={formData.blNumber}
                onChange={(e) => setFormData({ ...formData, blNumber: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-950 border border-carbon-700 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-carbon-800 text-slate-300 hover:bg-carbon-700 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Creating..." : "Initialize Shipment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
