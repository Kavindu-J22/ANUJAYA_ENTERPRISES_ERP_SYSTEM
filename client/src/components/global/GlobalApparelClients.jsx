import React, { useMemo, useState } from 'react';
import { Users, Search, Phone, MapPin, Receipt, ArrowUpRight } from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalApparelClients({ sales, onPrintInvoice }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate customer accounts from sales
  const customerDirectory = useMemo(() => {
    const map = {};

    (sales || []).filter(s => !s.cancelled).forEach(s => {
      const name = s.customer || "Apparel Manufacturer";
      if (!map[name]) {
        map[name] = {
          name,
          phone: s.phone || "N/A",
          region: s.region || "Colombo / Western Province",
          totalPurchased: 0,
          totalSets: 0,
          receivable: 0,
          invoices: []
        };
      }

      const rev = Number(s.qty || 1) * Number(s.unitPrice || 0);
      const paid = s.paymentStatus === 'PAID' ? rev : (Number(s.paidAmount) || 0);
      const rec = Math.max(0, rev - paid);

      map[name].totalPurchased += rev;
      map[name].totalSets += Number(s.qty || 1);
      map[name].receivable += rec;
      map[name].invoices.push({
        id: s.id,
        date: s.date,
        total: rev,
        status: s.paymentStatus || 'PAID',
        receivable: rec
      });
    });

    return Object.values(map);
  }, [sales]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customerDirectory;
    return customerDirectory.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
    );
  }, [customerDirectory, searchQuery]);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Apparel Manufacturing Clients</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Direct Commercial Buyers, Total Spend & Ledger Receivables
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Client or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Clients Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-mono glass-card rounded-3xl">
            No apparel client records found.
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.name} className="glass-card p-6 rounded-3xl border border-carbon-700/80 space-y-4 hover:border-purple-500/40 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">{client.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{client.region}</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Acquired</span>
                  <div className="text-base font-bold text-sky-300">{client.totalSets} Sets</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-carbon-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Total Expenditure:</span>
                  <div className="font-bold text-white text-sm mt-0.5">{formatLKR(client.totalPurchased)}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Outstanding:</span>
                  <div className={`font-bold text-sm mt-0.5 ${client.receivable > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatLKR(client.receivable)}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-mono font-bold block mb-2">Invoices ({client.invoices.length}):</span>
                <div className="flex flex-wrap gap-1.5">
                  {client.invoices.map(inv => (
                    <button
                      key={inv.id}
                      onClick={() => onPrintInvoice(inv.id)}
                      className="px-2.5 py-1 rounded-lg bg-carbon-900 hover:bg-sky-600/40 border border-carbon-700 text-[11px] font-mono text-slate-300 transition flex items-center gap-1.5"
                    >
                      <Receipt className="w-3 h-3 text-sky-400" />
                      <span>{inv.id}</span>
                      <span className={`text-[9px] px-1 rounded ${inv.receivable > 0 ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
                        {inv.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
