import React, { useMemo, useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  Receipt, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Building2,
  DollarSign
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalApparelClients({ 
  clients = [], 
  sales = [], 
  onOpenAddClient, 
  onOpenEditClient, 
  onDeleteClient, 
  onPrintInvoice,
  currentUser 
}) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const [searchQuery, setSearchQuery] = useState('');

  // Map sales aggregated metrics per client
  const clientAccounts = useMemo(() => {
    // Map of sales aggregated by customer name/id
    const salesMap = {};

    (sales || []).filter(s => !s.cancelled).forEach(s => {
      const key = (s.clientId || s.customer || "Apparel Manufacturer").trim().toLowerCase();
      if (!salesMap[key]) {
        salesMap[key] = {
          totalPurchased: 0,
          totalSets: 0,
          receivable: 0,
          invoices: []
        };
      }

      const rev = Number(s.qty || 1) * Number(s.unitPrice || 0);
      const paid = s.paymentStatus === 'PAID' ? rev : (Number(s.paidAmount) || 0);
      const rec = Math.max(0, rev - paid);

      salesMap[key].totalPurchased += rev;
      salesMap[key].totalSets += Number(s.qty || 1);
      salesMap[key].receivable += rec;
      salesMap[key].invoices.push({
        id: s.id,
        date: s.date,
        total: rev,
        status: s.paymentStatus || 'PAID',
        receivable: rec
      });
    });

    // Merge registered clients with aggregated sales metrics
    const list = (clients || []).map(c => {
      const matchKeyName = (c.name || '').trim().toLowerCase();
      const matchKeyId = (c.id || '').trim().toLowerCase();
      const metrics = salesMap[matchKeyId] || salesMap[matchKeyName] || {
        totalPurchased: 0,
        totalSets: 0,
        receivable: 0,
        invoices: []
      };

      return {
        ...c,
        totalPurchased: metrics.totalPurchased,
        totalSets: metrics.totalSets,
        receivable: metrics.receivable,
        invoices: metrics.invoices
      };
    });

    return list;
  }, [clients, sales]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return clientAccounts;
    return clientAccounts.filter(c => 
      (c.name || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q) ||
      (c.contactPerson || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.region || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.tinVat || '').toLowerCase().includes(q)
    );
  }, [clientAccounts, searchQuery]);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white tracking-tight">
                Apparel Manufacturing Clients Directory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Direct Commercial Buyers, Total Spend & Ledger Receivables ({clientAccounts.length} Verified Accounts)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Client, Code, Phone, Region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-carbon-900 border border-carbon-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono shadow-inner"
            />
          </div>

          {/* Add Client Button */}
          {isAdmin && (
            <button
              onClick={onOpenAddClient}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-950/60 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Apparel Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500 font-mono glass-card rounded-3xl border border-carbon-800 space-y-3">
            <Building2 className="w-10 h-10 mx-auto text-slate-600" />
            <div className="text-sm font-bold text-slate-400">No apparel client records match your search.</div>
            {isAdmin && (
              <button
                onClick={onOpenAddClient}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold underline"
              >
                Click here to register your first apparel client
              </button>
            )}
          </div>
        ) : (
          filteredClients.map(client => (
            <div 
              key={client.id || client.name} 
              className="glass-card p-6 sm:p-7 rounded-3xl border border-carbon-700/80 space-y-4 hover:border-purple-500/40 transition shadow-xl relative group flex flex-col justify-between"
            >
              <div>
                {/* Header with Code & Actions */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
                        {client.code || 'GC-CLIENT'}
                      </span>
                      {client.tinVat && (
                        <span className="text-[9px] font-mono text-slate-400 bg-carbon-800 px-1.5 py-0.5 rounded border border-carbon-700">
                          {client.tinVat}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-black text-lg text-white group-hover:text-purple-300 transition">
                      {client.name}
                    </h3>
                  </div>

                  {/* Edit / Delete Buttons */}
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditClient(client)}
                        title="Edit Client Details"
                        className="p-1.5 rounded-lg bg-carbon-850 hover:bg-purple-950 hover:text-purple-300 border border-carbon-700 text-slate-400 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteClient(client.id)}
                        title="Delete Client"
                        className="p-1.5 rounded-lg bg-carbon-850 hover:bg-rose-950 hover:text-rose-300 border border-carbon-700 text-slate-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact & Address Details */}
                <div className="space-y-1.5 pt-3 text-xs text-slate-300 font-sans">
                  {client.contactPerson && (
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <span className="text-slate-500 text-[11px] font-mono">Contact:</span>
                      <span>{client.contactPerson}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="font-mono text-sky-300">{client.phone || 'No phone'}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="font-mono text-slate-400 text-[11px]">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 text-[11px] line-clamp-1">{client.address || client.region || 'Western Province'}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-carbon-800 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-carbon-950/60 border border-carbon-800">
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Total Acquired</span>
                    <div className="font-bold text-white text-sm mt-0.5">{client.totalSets} Sets</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{formatLKR(client.totalPurchased)}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-carbon-950/60 border border-carbon-800 text-right">
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Outstanding Due</span>
                    <div className={`font-bold text-sm mt-0.5 ${client.receivable > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {formatLKR(client.receivable)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {client.receivable > 0 ? 'Pending Settlement' : 'Clear Balance'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="pt-2 border-t border-carbon-800/80">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    Dispatched Invoices ({(client.invoices || []).length}):
                  </span>
                </div>
                {(client.invoices || []).length === 0 ? (
                  <span className="text-[10px] font-mono text-slate-500 italic block">
                    No dispatch invoices issued yet.
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {client.invoices.map(inv => (
                      <button
                        key={inv.id}
                        onClick={() => onPrintInvoice(inv.id)}
                        className="px-2.5 py-1 rounded-lg bg-carbon-900 hover:bg-sky-600/30 border border-carbon-700 text-[11px] font-mono text-slate-300 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                        title={`View & Print Tax Invoice ${inv.id}`}
                      >
                        <Receipt className="w-3 h-3 text-sky-400" />
                        <span>{inv.id}</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          inv.receivable > 0 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {inv.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
