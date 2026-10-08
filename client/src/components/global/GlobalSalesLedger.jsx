import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  PlusCircle, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  RotateCcw,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalSalesLedger({
  sales,
  machines,
  usdRate,
  onOpenSaleModal,
  onOpenEditSaleModal,
  onDeleteSale,
  onPrintInvoice,
  currentUser
}) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Compute sale metrics for each transaction
  const enrichedSales = useMemo(() => {
    return sales.map(s => {
      const machine = machines.find(m => m.id === s.machineId) || {};
      
      let unitCost = s.frozenUnitCost;
      if (unitCost === undefined || unitCost === null) {
        const baseCost = (parseFloat(machine.usdPrice) || 0) * (s.frozenExchangeRate || usdRate);
        unitCost = baseCost + (parseFloat(machine.taxLKR) || 0);
      }

      const qty = parseInt(s.qty) || 1;
      const unitPrice = parseFloat(s.unitPrice) || 0;
      const totalRevenue = qty * unitPrice;
      const totalCost = qty * unitCost;
      const netProfit = totalRevenue - totalCost;

      const paidAmount = s.paymentStatus === 'PAID' 
        ? totalRevenue 
        : (parseFloat(s.paidAmount) || 0);
      const receivable = Math.max(0, totalRevenue - paidAmount);

      return {
        ...s,
        machine,
        unitCost,
        totalRevenue,
        totalCost,
        netProfit,
        paidAmount,
        receivable
      };
    });
  }, [sales, machines, usdRate]);

  // Filtered list
  const filteredSales = useMemo(() => {
    return enrichedSales.filter(s => {
      if (statusFilter === 'CANCELLED') {
        if (!s.cancelled) return false;
      } else if (statusFilter !== 'ALL') {
        if (s.cancelled || s.paymentStatus !== statusFilter) return false;
      } else {
        if (s.cancelled) return false; // Default view excludes cancelled
      }

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        s.id.toLowerCase().includes(q) ||
        (s.customer || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        (s.machineId || '').toLowerCase().includes(q) ||
        (s.machine.model || '').toLowerCase().includes(q) ||
        (s.serialNumbers || '').toLowerCase().includes(q)
      );
    });
  }, [enrichedSales, statusFilter, searchQuery]);

  const exportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Invoice ID,Date,SKU,Brand,Model,Serials,Customer,Phone,Region,Payment,Status,Paid Amount,Receivable,Qty,Unit Price,Gross Revenue,Cost LKR,Net Profit\r\n";

    enrichedSales.forEach(s => {
      const row = [
        s.id,
        s.date,
        s.machineId,
        s.machine.brand || '',
        `"${s.machine.model || ''}"`,
        `"${(s.serialNumbers || '').replace(/"/g, '""')}"`,
        `"${(s.customer || '').replace(/"/g, '""')}"`,
        `"${s.phone || ''}"`,
        `"${s.region || ''}"`,
        `"${s.payment || ''}"`,
        `"${s.paymentStatus || 'PAID'}"`,
        s.paidAmount,
        s.receivable,
        s.qty,
        s.unitPrice,
        s.totalRevenue,
        s.totalCost,
        s.netProfit
      ].join(",");
      csv += row + "\r\n";
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Consortium_Sales_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="space-y-6 animate-fadeIn">
      
      {/* Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            <span>Sales & Audit Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Machinery Dispatches, Payment Reconciliations & Asset Warranty Registry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Invoice, Client, SN..."
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

          {/* New Dispatch */}
          <button
            onClick={onOpenSaleModal}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center text-xs font-mono">
        {['ALL', 'PAID', 'PARTIAL', 'CREDIT', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-xl font-bold transition border ${
              statusFilter === status
                ? 'bg-sky-600/30 text-sky-300 border-sky-500'
                : 'bg-carbon-900 text-slate-400 border-carbon-700 hover:border-carbon-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-3xl border border-carbon-700/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-carbon-900/90 text-slate-300 font-mono uppercase text-[11px] tracking-wider border-b border-carbon-700">
              <tr>
                <th className="px-4 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Apparel Client & Contact</th>
                <th className="px-4 py-3.5">Machinery SKU & Model</th>
                <th className="px-4 py-3.5">Asset Serials</th>
                <th className="px-4 py-3.5 text-center">Qty</th>
                <th className="px-4 py-3.5 text-right">Unit Price</th>
                <th className="px-4 py-3.5 text-right">Total Revenue</th>
                <th className="px-4 py-3.5 text-right">Net Profit</th>
                <th className="px-4 py-3.5 text-center">Payment Status</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-500 font-mono">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr 
                    key={sale.id} 
                    className={`hover:bg-carbon-900/40 transition ${sale.cancelled ? 'opacity-50 line-through' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-sky-400">{sale.id}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">{sale.date}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{sale.customer}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{sale.phone || 'No phone'} • {sale.region}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{sale.machine.brand} {sale.machine.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {sale.machineId}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">
                      {sale.serialNumbers || 'Tracked in Batch'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-white">{sale.qty}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">{formatLKR(sale.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      {formatLKR(sale.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-teal-300">
                      {formatLKR(sale.netProfit)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {sale.cancelled ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                          CANCELLED
                        </span>
                      ) : (
                        <div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            sale.paymentStatus === 'PAID'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : sale.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {sale.paymentStatus}
                          </span>
                          {sale.receivable > 0 && (
                            <div className="text-[10px] font-mono text-rose-400 mt-0.5">
                              Due: {formatLKR(sale.receivable)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintInvoice(sale.id)}
                          title="Print Commercial Tax Invoice"
                          className="p-1.5 rounded-lg bg-carbon-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && !sale.cancelled && (
                          <>
                            <button
                              onClick={() => onOpenEditSaleModal(sale)}
                              title="Edit Transaction"
                              className="p-1.5 rounded-lg bg-carbon-800 hover:bg-amber-600 text-slate-300 hover:text-white transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteSale(sale.id)}
                              title="Cancel Dispatch (Return stock)"
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
