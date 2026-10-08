import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  PlusCircle, 
  Download, 
  Edit3, 
  Trash2, 
  ShoppingCart,
  Filter,
  DollarSign
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalMachineryMaster({
  machines,
  sales,
  usdRate,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteMachine,
  onPrefillSale,
  currentUser
}) {
  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'PARTNER' || true;
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute live metrics for each machine
  const computedList = useMemo(() => {
    return machines.map(m => {
      const baseCostLKR = (parseFloat(m.usdPrice) || 0) * usdRate;
      const totalCostLKR = baseCostLKR + (parseFloat(m.taxLKR) || 0);
      const wholesaleProfit = (parseFloat(m.wholesalePrice) || 0) - totalCostLKR;
      const retailProfit = (parseFloat(m.retailPrice) || 0) - totalCostLKR;

      const totalSold = (sales || [])
        .filter(s => !s.cancelled && s.machineId === m.id)
        .reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

      const availableStock = Math.max(0, (parseInt(m.initialStock) || 0) - totalSold);
      const wsMarginPct = totalCostLKR > 0 ? ((wholesaleProfit / totalCostLKR) * 100).toFixed(1) : "0.0";
      const rtMarginPct = totalCostLKR > 0 ? ((retailProfit / totalCostLKR) * 100).toFixed(1) : "0.0";

      return {
        ...m,
        baseCostLKR,
        totalCostLKR,
        wholesaleProfit,
        retailProfit,
        totalSold,
        availableStock,
        wsMarginPct,
        rtMarginPct
      };
    });
  }, [machines, sales, usdRate]);

  // Filtered machines
  const filteredMachines = useMemo(() => {
    return computedList.filter(m => {
      const matchBrand = selectedBrand === 'ALL' || m.brand.toUpperCase() === selectedBrand;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        m.id.toLowerCase().includes(q) || 
        m.model.toLowerCase().includes(q) || 
        (m.name || '').toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q);
      return matchBrand && matchSearch;
    });
  }, [computedList, selectedBrand, searchQuery]);

  const brands = ['ALL', 'JUKI', 'KANSAI', 'PEGASUS', 'SIRUBA', 'OTHER'];

  const exportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "SKU,Brand,Model,Description,Batch Sets,Sold,In Stock,USD FOB,Base LKR,Duty LKR,Landed Cost LKR,Wholesale LKR,Retail LKR\r\n";

    computedList.forEach(m => {
      const row = [
        m.id,
        m.brand,
        `"${m.model}"`,
        `"${m.name || ''}"`,
        m.initialStock,
        m.totalSold,
        m.availableStock,
        m.usdPrice,
        m.baseCostLKR,
        m.taxLKR,
        m.totalCostLKR,
        m.wholesalePrice,
        m.retailPrice
      ].join(",");
      csv += row + "\r\n";
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Consortium_Machinery_Fleet_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="space-y-6 animate-fadeIn">
      
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>Machinery Master Fleet (Global Warehouse)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Direct China Imports • Landed Costing & Wholesale / Retail Benchmarks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SKU or Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="p-2.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-700 text-slate-300 hover:text-white transition"
            title="Export CSV Audit"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Add SKU */}
          {canManage && (
            <button
              onClick={onOpenAddModal}
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add SKU</span>
            </button>
          )}
        </div>
      </div>

      {/* Brand Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Brand:
        </span>
        {brands.map(b => (
          <button
            key={b}
            onClick={() => setSelectedBrand(b)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
              selectedBrand === b
                ? 'bg-sky-600/30 text-sky-300 border-sky-500 shadow-sm'
                : 'bg-carbon-900 text-slate-400 border-carbon-700 hover:border-carbon-600'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Machinery Table */}
      <div className="glass-card rounded-3xl border border-carbon-700/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-carbon-900/90 text-slate-300 font-mono uppercase text-[11px] tracking-wider border-b border-carbon-700">
              <tr>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5">Brand</th>
                <th className="px-4 py-3.5">Model / Specifications</th>
                <th className="px-4 py-3.5 text-center">Batch</th>
                <th className="px-4 py-3.5 text-center">Sold</th>
                <th className="px-4 py-3.5 text-center">Available</th>
                <th className="px-4 py-3.5 text-right">USD FOB</th>
                <th className="px-4 py-3.5 text-right">Duty (LKR)</th>
                <th className="px-4 py-3.5 text-right">Landed Cost</th>
                <th className="px-4 py-3.5 text-right">Wholesale (Profit)</th>
                <th className="px-4 py-3.5 text-right">Retail (Profit)</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60">
              {filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-slate-500 font-mono">
                    No matching machinery models found.
                  </td>
                </tr>
              ) : (
                filteredMachines.map(m => (
                  <tr key={m.id} className="hover:bg-carbon-900/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-sky-400">{m.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-carbon-800 text-slate-300 border border-carbon-700">
                        {m.brand}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{m.model}</div>
                      <div className="text-[11px] text-slate-400">{m.name}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-300">{m.initialStock}</td>
                    <td className="px-4 py-3 text-center font-mono text-amber-400 font-bold">{m.totalSold}</td>
                    <td className="px-4 py-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        m.availableStock > 0 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {m.availableStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-300 font-bold">
                      ${m.usdPrice.toLocaleString('en-US')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {formatLKR(m.taxLKR)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">
                      {formatLKR(m.totalCostLKR)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <div className="font-bold text-white">{formatLKR(m.wholesalePrice)}</div>
                      <div className="text-[10px] text-emerald-400">+{formatLKR(m.wholesaleProfit)} ({m.wsMarginPct}%)</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <div className="font-bold text-white">{formatLKR(m.retailPrice)}</div>
                      <div className="text-[10px] text-emerald-400">+{formatLKR(m.retailProfit)} ({m.rtMarginPct}%)</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrefillSale(m)}
                          disabled={m.availableStock <= 0}
                          title="Record Dispatch with this SKU"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-700 text-emerald-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => onOpenEditModal(m)}
                              title="Edit SKU Specs & Pricing"
                              className="p-1.5 rounded-lg bg-carbon-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteMachine(m.id)}
                              title="Delete SKU"
                              className="p-1.5 rounded-lg bg-carbon-800 hover:bg-rose-700 text-slate-400 hover:text-white transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
