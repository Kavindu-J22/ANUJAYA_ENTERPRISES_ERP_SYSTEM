import React, { useState, useMemo } from 'react';
import { 
  Warehouse, 
  Search, 
  PlusCircle, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Wrench,
  Tag,
  ArrowRight
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalMachineryMaster({
  machines,
  customers,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteMachine,
  onQuickAssignCustomer
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Count how many of each model are currently active on rent across customers
  const rentCountMap = useMemo(() => {
    const map = {};
    (customers || []).filter(c => !c.isArchived).forEach(c => {
      (c.rentals || []).filter(r => r.status === 'Active').forEach(r => {
        const key = (r.model || '').toLowerCase();
        map[key] = (map[key] || 0) + 1;
      });
    });
    return map;
  }, [customers]);

  // Compute live yard availability
  const enrichedYardMachines = useMemo(() => {
    return (machines || []).map(m => {
      const modelKey = m.model.toLowerCase();
      // Match count by model substring or exact
      let onRentCount = 0;
      Object.keys(rentCountMap).forEach(k => {
        if (k.includes(modelKey) || modelKey.includes(k) || (m.brand && k.includes(m.brand.toLowerCase()))) {
          onRentCount = Math.max(onRentCount, rentCountMap[k] || 0);
        }
      });

      const totalStock = parseInt(m.totalYardStock) || 1;
      const availableInYard = Math.max(0, totalStock - onRentCount);

      return {
        ...m,
        onRentCount,
        availableInYard
      };
    });
  }, [machines, rentCountMap]);

  // Categories
  const categories = [
    'ALL',
    'Single Needle Lockstitch',
    'Overlock',
    'Flatbed / Coverstitch',
    'Buttonhole & Specialty',
    'Motors & Drives',
    'Heavy Duty / Other'
  ];

  const filteredMachines = useMemo(() => {
    return enrichedYardMachines.filter(m => {
      const matchCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        m.machineCode.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q) ||
        (m.yardLocation || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [enrichedYardMachines, selectedCategory, searchQuery]);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-emerald-400" />
            <span>Kosgama Central Yard — Rental Machinery Master</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Local Warehouse Fleet Management • Standard Hire Benchmarks & Live Fleet Allocation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Yard SKU, Model, Bay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={onOpenAddModal}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Yard Machine</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Category:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
              selectedCategory === cat
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                : 'bg-carbon-900 text-slate-400 border-carbon-700 hover:border-carbon-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Yard Fleet Table */}
      <div className="glass-card rounded-3xl border border-carbon-700/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-carbon-900/90 text-slate-300 font-mono uppercase text-[11px] tracking-wider border-b border-carbon-700">
              <tr>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Brand</th>
                <th className="px-4 py-3.5">Machinery Model Description</th>
                <th className="px-4 py-3.5">Category & Drive</th>
                <th className="px-4 py-3.5 text-center">Yard Stock</th>
                <th className="px-4 py-3.5 text-center">On-Rent</th>
                <th className="px-4 py-3.5 text-center">Available</th>
                <th className="px-4 py-3.5 text-right">Standard Rent / Mo</th>
                <th className="px-4 py-3.5 text-right">Acquisition Cost</th>
                <th className="px-4 py-3.5 text-center">Condition</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60">
              {filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-500 font-mono">
                    No matching yard machinery models found.
                  </td>
                </tr>
              ) : (
                filteredMachines.map(m => (
                  <tr key={m.id} className="hover:bg-carbon-900/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{m.machineCode}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-carbon-800 text-slate-300 border border-carbon-700">
                        {m.brand}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{m.model}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{m.yardLocation} • {m.serialNumbers}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      <div className="text-slate-300 font-bold">{m.category}</div>
                      <div className="text-slate-400 text-[10px]">{m.motorSpec}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-white">
                      {m.totalYardStock}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-amber-400">
                      {m.onRentCount}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded-md ${
                        m.availableInYard > 0 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {m.availableInYard} Sets
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      {formatLKR(m.standardMonthlyRent)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {formatLKR(m.acquisitionCost)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                        m.condition === 'Brand New'
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : m.condition === 'Excellent'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : m.condition === 'Operational'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {m.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenEditModal(m)}
                          title="Edit Yard Machinery Specs"
                          className="p-1.5 rounded-lg bg-carbon-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMachine(m.id)}
                          title="Remove from Yard Fleet"
                          className="p-1.5 rounded-lg bg-carbon-800 hover:bg-rose-700 text-slate-400 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
