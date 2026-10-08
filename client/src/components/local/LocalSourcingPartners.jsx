import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  FileText, 
  RotateCcw, 
  CreditCard, 
  Printer, 
  Edit3, 
  Trash2, 
  Phone, 
  MapPin, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalSourcingPartners({
  partners,
  onOpenNewPartner,
  onOpenEditPartner,
  onDeletePartner,
  onOpenPurchaseModal,
  onOpenReturnModal,
  onOpenPaymentModal,
  onDeletePurchase,
  onDeleteReturn,
  onPrintDoc
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations for partners
  const enrichedPartners = useMemo(() => {
    return (partners || []).map(p => {
      const totalPurchased = (p.purchases || []).reduce((s, i) => s + (Number(i.qty || 1) * Number(i.unitPrice || 0)), 0);
      const totalReturned = (p.returns || []).reduce((s, i) => s + (Number(i.qty || 1) * Number(i.unitPrice || 0)), 0);
      const totalPaid = (p.payments || []).reduce((s, pay) => s + Number(pay.amount || 0), 0);
      const balancePayable = Number(p.baseOpeningBalance || 0) + totalPurchased - totalReturned - totalPaid;

      return {
        ...p,
        totalPurchased,
        totalReturned,
        totalPaid,
        balancePayable
      };
    });
  }, [partners]);

  const filteredPartners = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return enrichedPartners;
    return enrichedPartners.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      (p.contactPerson || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q)
    );
  }, [enrichedPartners, searchQuery]);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Local Machinery Sourcing & Spares Partners</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Third-Party Wholesale Sourcing, Yard Spare Parts Inward Ledger & Settlements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Partner, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={onOpenNewPartner}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Sourcing Partner</span>
          </button>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-6">
        {filteredPartners.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono glass-card rounded-3xl">
            No sourcing partner records found.
          </div>
        ) : (
          filteredPartners.map(partner => (
            <div key={partner.id} className="glass-card p-6 sm:p-7 rounded-3xl border border-carbon-700/80 space-y-5 shadow-xl">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-carbon-700/60">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-carbon-800 border border-carbon-700 text-amber-400 font-bold">
                      {partner.code}
                    </span>
                    <h3 className="font-display font-extrabold text-xl text-white">
                      {partner.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                    <span className="text-slate-300 font-bold">
                      Contact: {partner.contactPerson || 'Director'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      {partner.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {partner.address}
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="flex flex-wrap items-center gap-3 bg-carbon-900/90 p-3 rounded-2xl border border-carbon-700 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Purchased</span>
                    <span className="font-bold text-white">{formatLKR(partner.totalPurchased)}</span>
                  </div>
                  <div className="h-6 w-[1px] bg-carbon-700"></div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Returned</span>
                    <span className="font-bold text-rose-400">-{formatLKR(partner.totalReturned)}</span>
                  </div>
                  <div className="h-6 w-[1px] bg-carbon-700"></div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Settled Paid</span>
                    <span className="font-bold text-sky-400">{formatLKR(partner.totalPaid)}</span>
                  </div>
                  <div className="h-6 w-[1px] bg-carbon-700"></div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Balance Payable</span>
                    <span className={`font-black text-sm ${partner.balancePayable > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatLKR(partner.balancePayable)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions Tabs & Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                
                {/* Inward Purchases */}
                <div className="p-4 rounded-2xl bg-carbon-900/70 border border-carbon-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-carbon-800">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      Inward Purchases ({(partner.purchases || []).length})
                    </span>
                    <button
                      onClick={() => onOpenPurchaseModal(partner)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition"
                    >
                      + Add Sourced Item
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(partner.purchases || []).length === 0 ? (
                      <div className="text-center py-4 text-slate-500">No purchases recorded.</div>
                    ) : (
                      (partner.purchases || []).map(pur => (
                        <div key={pur.id} className="p-2.5 rounded-xl bg-carbon-850/60 border border-carbon-800/80 flex justify-between items-center">
                          <div>
                            <div className="font-sans font-bold text-white text-[11px]">{pur.itemDescription}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {pur.date} • {pur.qty} units @ {formatLKR(pur.unitPrice)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-300">{formatLKR(pur.total)}</div>
                            <div className="flex gap-1 justify-end mt-1">
                              <button
                                onClick={() => onPrintDoc({ type: 'PARTNER_INVOICE', partner, purchase: pur })}
                                className="text-[9px] text-slate-400 hover:text-white underline"
                              >
                                Slip
                              </button>
                              <button
                                onClick={() => onDeletePurchase(partner.id, pur.id)}
                                className="text-[9px] text-rose-400 hover:text-rose-300"
                              >
                                Del
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Returns & Payments */}
                <div className="p-4 rounded-2xl bg-carbon-900/70 border border-carbon-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-carbon-800">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      Payments & Returns
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpenReturnModal(partner)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold transition"
                      >
                        + Return Slip
                      </button>
                      <button
                        onClick={() => onOpenPaymentModal(partner)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold transition"
                      >
                        + Pay Voucher
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(partner.payments || []).map(pay => (
                      <div key={pay.id} className="p-2.5 rounded-xl bg-carbon-850/60 border border-emerald-900/40 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-emerald-300 text-[11px]">Payment Settled</div>
                          <div className="text-[10px] text-slate-400">{pay.date} • {pay.method} ({pay.refNo})</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">{formatLKR(pay.amount)}</div>
                          <button
                            onClick={() => onPrintDoc({ type: 'PARTNER_PAYMENT_VOUCHER', partner, payment: pay })}
                            className="text-[9px] text-slate-400 hover:text-white underline block mt-0.5"
                          >
                            Voucher
                          </button>
                        </div>
                      </div>
                    ))}

                    {(partner.returns || []).map(ret => (
                      <div key={ret.id} className="p-2.5 rounded-xl bg-carbon-850/60 border border-rose-900/40 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-rose-300 text-[11px]">Returned: {ret.itemDescription}</div>
                          <div className="text-[10px] text-slate-400">{ret.date} • {ret.reason}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-rose-400">-{formatLKR(ret.total)}</div>
                          <button
                            onClick={() => onPrintDoc({ type: 'PARTNER_RETURN', partner, returnItem: ret })}
                            className="text-[9px] text-slate-400 hover:text-white underline block mt-0.5"
                          >
                            Debit Note
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-carbon-700/60 text-xs">
                <button
                  onClick={() => onPrintDoc({
                    type: 'PARTNER_STATEMENT',
                    partner,
                    balanceDue: partner.balancePayable,
                    totalPurchased: partner.totalPurchased,
                    totalReturned: partner.totalReturned,
                    totalPaid: partner.totalPaid
                  })}
                  className="px-3 py-1.5 rounded-xl bg-carbon-850 hover:bg-amber-600 text-slate-200 hover:text-white border border-carbon-700 transition font-mono font-bold flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print Statement of Accounts</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenEditPartner(partner)}
                    className="p-1.5 rounded-lg bg-carbon-850 hover:bg-carbon-800 border border-carbon-700 text-slate-400 hover:text-white transition"
                    title="Edit Partner"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePartner(partner)}
                    className="p-1.5 rounded-lg bg-carbon-850 hover:bg-rose-900 border border-carbon-700 text-slate-400 hover:text-rose-300 transition"
                    title="Delete Partner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
