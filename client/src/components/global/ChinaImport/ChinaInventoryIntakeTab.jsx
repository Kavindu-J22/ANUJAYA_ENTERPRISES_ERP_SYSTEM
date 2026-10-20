import React, { useState } from 'react';
import { 
  Warehouse, 
  Boxes, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Truck,
  ArrowRight
} from 'lucide-react';
import { formatLKR } from '../../../utils/formatters';

export function ChinaInventoryIntakeTab({ shipment, onExecuteGoodsReceipt }) {
  if (!shipment) return null;

  const items = shipment.items || [];
  const goodsReceipts = shipment.goodsReceipts || [];
  const isAlreadyIntaked = goodsReceipts.length > 0 && goodsReceipts.some(g => g.intakeConfirmed);

  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));
  const [receivedBy, setReceivedBy] = useState('Kosgama Yard Operations Team');
  const [warehouseLocation, setWarehouseLocation] = useState('Kosgama Central Machinery Fleet Yard Bays 1-6');
  const [notes, setNotes] = useState('Complete shipment 472 units unloaded, inspected, and verified against packing list');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleConfirmIntake = async () => {
    setLoading(true);
    setMessage('');
    try {
      const receiptPayload = {
        receiptDate,
        receivedBy,
        warehouseLocation,
        notes,
        items: items.map(item => ({
          id: item.id,
          sku: item.sku,
          brand: item.brand,
          model: item.model,
          name: item.name,
          unit: item.unit,
          qtyReceived: item.qtyOrdered,
          unitFobUsd: item.unitFobUsd,
          globalMachineId: item.globalMachineId
        }))
      };

      await onExecuteGoodsReceipt(receiptPayload);
      setMessage('Physical goods receipt successfully executed and synced to Global Machinery Warehouse!');
    } catch (err) {
      setMessage(`Error: ${err.message || 'Failed to complete stock intake'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Goods Receipt Header */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                <span>Physical Goods Receipt & Warehouse Stock Intake</span>
                {isAlreadyIntaked && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-950 border border-emerald-800 text-emerald-300">
                    ✓ Stock Intake Completed
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Connecting China Import Shipment {shipment.shipmentNo} to Central Fleet Warehouse (Global Machinery Master)
              </p>
            </div>
          </div>

          {!isAlreadyIntaked ? (
            <button
              onClick={handleConfirmIntake}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Processing Intake..." : "Execute Physical Stock Intake"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-4 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span>472 Units Synced to Warehouse</span>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-xl border text-xs font-mono ${
            message.startsWith('Error') 
              ? 'bg-rose-950 border-rose-800 text-rose-300' 
              : 'bg-emerald-950 border-emerald-800 text-emerald-300'
          }`}>
            {message}
          </div>
        )}

        {/* Goods Receipt Details Form / Review */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-carbon-950 rounded-2xl border border-carbon-800 font-mono text-xs">
          <div>
            <label className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Receipt Date</label>
            <input
              type="date"
              disabled={isAlreadyIntaked}
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-white font-bold disabled:opacity-75"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Received & Verified By</label>
            <input
              type="text"
              disabled={isAlreadyIntaked}
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-white disabled:opacity-75"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Target Warehouse Location</label>
            <input
              type="text"
              disabled={isAlreadyIntaked}
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-white disabled:opacity-75"
            />
          </div>
        </div>

        {/* Verification Rules Warning */}
        <div className="p-3 bg-carbon-950 border border-carbon-800 rounded-xl text-xs font-mono text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong>Inventory Integration Safeguard:</strong> Recording a supplier payment does <em>not</em> automatically increase stock. Physical inventory units are only credited to the Global Machinery Warehouse upon authorized physical goods receipt confirmation.
          </span>
        </div>
      </div>

      {/* Line Items Stock Intake Status Table */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
          <Boxes className="w-4 h-4 text-emerald-400" />
          <span>Machinery Physical Intake Status ({items.length} SKUs • {shipment.totalUnits} Units)</span>
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-carbon-800 bg-carbon-950 font-mono text-xs">
          <table className="w-full text-left divide-y divide-carbon-800">
            <thead className="bg-carbon-900/90 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Brand</th>
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-3 text-right">Qty Ordered</th>
                <th className="py-3 px-3 text-right">Qty Received</th>
                <th className="py-3 px-3 text-center">Unit</th>
                <th className="py-3 px-4 text-center">Warehouse Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800 text-slate-300">
              {items.map((item, idx) => {
                const isItemReceived = item.stockIntakeStatus === 'received' || isAlreadyIntaked;

                return (
                  <tr key={idx} className="hover:bg-carbon-900/50 transition">
                    <td className="py-2.5 px-3 font-bold text-sky-400">{item.sku}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{item.brand}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-200">{item.model}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{item.qtyOrdered}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {isItemReceived ? item.qtyOrdered : item.qtyReceived || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400 text-[10px]">{item.unit || 'SETS'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isItemReceived
                          ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                          : 'bg-amber-950/80 border-amber-800 text-amber-300'
                      }`}>
                        {isItemReceived ? '✓ Synced to Warehouse Stock' : '⏳ Pending Physical Intake'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
