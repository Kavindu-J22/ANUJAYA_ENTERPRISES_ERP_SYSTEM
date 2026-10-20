import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  Ship, 
  Calendar, 
  MapPin, 
  Truck, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Warehouse
} from 'lucide-react';
import { formatLKR, formatUSD } from '../../../utils/formatters';

export function ChinaShipmentItemsTab({ shipment, onUpdateShipmentStatus, onOpenIntakeTab }) {
  if (!shipment) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('ALL');

  const items = shipment.items || [];
  const statusList = ['draft', 'approved', 'in_transit', 'arrived', 'customs_clearing', 'received', 'closed'];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === 'ALL' || item.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const brands = ['ALL', ...new Set(items.map(i => i.brand).filter(Boolean))];

  return (
    <div className="space-y-6">
      
      {/* Shipment Master Dossier Card */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white">
                  Shipment {shipment.shipmentNo}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-indigo-950 border border-indigo-800 text-indigo-300">
                  Status: {shipment.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Supplier: <strong className="text-white">{shipment.supplierName}</strong> ({shipment.supplierCountry || 'China'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenIntakeTab}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Warehouse className="w-4 h-4" />
              <span>Physical Stock Intake</span>
            </button>
          </div>
        </div>

        {/* Status Lifecycle Transition Stepper */}
        <div className="pt-2 border-t border-carbon-800/80">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold font-mono mb-2">
            Shipment Operational Workflow Lifecycle
          </span>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            {statusList.map((st, idx) => {
              const isCurrent = shipment.status === st;
              const isPast = statusList.indexOf(shipment.status) >= idx;

              return (
                <button
                  key={st}
                  onClick={() => onUpdateShipmentStatus(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-950'
                      : (isPast 
                          ? 'bg-carbon-950 text-emerald-400 border border-emerald-900/60' 
                          : 'bg-carbon-950 text-slate-500 border border-carbon-800 hover:text-slate-300')
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                  <span className="capitalize">{st.replace('_', ' ')}</span>
                  {idx < statusList.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shipment Details Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-carbon-950 rounded-2xl border border-carbon-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Origin Port</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>{shipment.origin || 'Ningbo Port, China'}</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Destination</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{shipment.destination || 'Kosgama Central Yard'}</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Shipping Carrier</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3 text-sky-400" />
              <span>{shipment.shippingCarrier || 'Maersk Line'}</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Container & BL #</span>
            <span className="font-bold text-amber-300 truncate block mt-0.5">
              {shipment.containerNo || 'MSKU-9823410'} / {shipment.blNumber || 'MAEU-823'}
            </span>
          </div>
        </div>
      </div>

      {/* Machinery Packing List Section */}
      <div className="p-6 rounded-3xl bg-carbon-900/90 border border-carbon-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <span>Itemized Machinery Packing List & Landed Cost Budget</span>
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Total {shipment.totalUnits} Units • Total FOB USD {formatUSD(shipment.fobUsd)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search model / SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl bg-carbon-950 border border-carbon-700 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-3 py-2 rounded-xl bg-carbon-950 border border-carbon-700 text-xs text-slate-300 font-mono font-bold"
            >
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Machinery Table */}
        <div className="overflow-x-auto rounded-2xl border border-carbon-800 bg-carbon-950 font-mono text-xs">
          <table className="w-full text-left divide-y divide-carbon-800">
            <thead className="bg-carbon-900/90 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Brand</th>
                <th className="py-3 px-4">Model & Description</th>
                <th className="py-3 px-3 text-center">Unit</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3 text-right">FOB Price</th>
                <th className="py-3 px-3 text-right">Total FOB</th>
                <th className="py-3 px-3 text-right">Landed Cost</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800 text-slate-300">
              {filteredItems.map((item, idx) => {
                const isReceived = item.stockIntakeStatus === 'received';

                return (
                  <tr key={idx} className="hover:bg-carbon-900/50 transition">
                    <td className="py-2.5 px-3 font-bold text-sky-400">{item.sku}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{item.brand}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-bold text-slate-200 block">{item.model}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-xs">{item.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400 text-[10px]">{item.unit || 'SETS'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{item.qtyOrdered}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      ${(item.unitFobUsd || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      ${(item.totalFobUsd || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-indigo-300">
                      {formatLKR(item.allocatedLandedCostLkr)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isReceived 
                          ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
                          : 'bg-amber-950/80 border-amber-800 text-amber-300'
                      }`}>
                        {isReceived ? 'Received into Yard' : 'Pending Intake'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Totals Bar */}
        <div className="p-3 bg-carbon-950 border border-carbon-800 rounded-2xl flex flex-wrap items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span>Showing {filteredItems.length} of {items.length} Machinery SKUs</span>
            <span>Total Units: <strong className="text-white">{shipment.totalUnits} Sets</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Total FOB: <strong className="text-emerald-400 font-bold">${formatUSD(shipment.fobUsd)} USD</strong></span>
            <span className="text-slate-400">Total Landed Budget: <strong className="text-indigo-300 font-bold">{formatLKR(shipment.budgetTotalLiabilityLkr)} LKR</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
}
