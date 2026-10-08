import React from 'react';
import { 
  Coins, 
  Boxes, 
  Wallet, 
  TrendingUp, 
  Warehouse, 
  FileText, 
  RotateCcw, 
  PlusCircle, 
  ShoppingCart,
  Printer,
  Scale
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalDashboard({
  metrics,
  recentSales,
  brandBreakdown,
  onResetBaseline,
  onOpenSaleModal,
  onOpenMachineModal,
  onPrintInvoice,
  currentUser,
  currentLang,
  usdRate
}) {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <section className="space-y-8 animate-fadeIn">
      {/* Consortium Executive Financial Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-carbon-700/80 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-carbon-700/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Consortium Executive Financial & Capital Summary
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Consortium Fleet: {metrics.skuCount} Models • {metrics.totalFleetCapacity} Sets Baseline • Spot Rate: 1 USD = <span className="text-amber-400 font-bold">{usdRate.toFixed(2)}</span> LKR
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && (
              <button
                onClick={onResetBaseline}
                className="text-xs bg-carbon-850 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-carbon-700 hover:border-rose-800 px-3.5 py-2 rounded-xl transition flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            )}
            <button
              onClick={onOpenSaleModal}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>New Dispatch</span>
            </button>
          </div>
        </div>

        {/* 50/50 Partnership Capital & Equity Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          
          {/* Anujaya Enterprises (Partner X) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-carbon-900 to-carbon-850 border border-sky-500/40 relative shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-sky-400 inline-block"></span>
                  <span className="font-display font-extrabold text-xl text-white tracking-wide">
                    Anujaya Enterprises
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                    50% EQUITY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Partner Net Realized Earnings & Advance Audit
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Total Realized Net Profit</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-sky-300">
                  {formatLKR(metrics.partnerShare)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-carbon-700/60 text-xs font-mono">
              <div>
                <span className="text-slate-500">Capital Draws:</span>
                <span className="text-slate-300 font-bold ml-1.5">{formatLKR(metrics.drawAnujaya)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Unsettled Balance:</span>
                <span className="text-sky-400 font-bold ml-1.5">{formatLKR(metrics.balAnujaya)}</span>
              </div>
            </div>
          </div>

          {/* Global Enterprises (Partner Y) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-carbon-900 to-carbon-850 border border-emerald-500/40 relative shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-400 inline-block"></span>
                  <span className="font-display font-extrabold text-xl text-white tracking-wide">
                    Global Enterprises
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    50% EQUITY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  China Machinery Sourcing & Logistics Partner
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Total Realized Net Profit</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {formatLKR(metrics.partnerShare)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-carbon-700/60 text-xs font-mono">
              <div>
                <span className="text-slate-500">Capital Draws:</span>
                <span className="text-slate-300 font-bold ml-1.5">{formatLKR(metrics.drawGlobal)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Unsettled Balance:</span>
                <span className="text-emerald-400 font-bold ml-1.5">{formatLKR(metrics.balGlobal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equity Balance Gauge */}
        <div className="mt-6 pt-2 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-sky-400 font-bold flex items-center gap-1">
              Anujaya Balance: {formatLKR(metrics.balAnujaya)}
            </span>
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              Consortium Equity Balance Indicator
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              Global Balance: {formatLKR(metrics.balGlobal)}
            </span>
          </div>
          <div className="h-3 w-full bg-carbon-900 rounded-full overflow-hidden p-0.5 border border-carbon-700 flex">
            <div 
              className="h-full bg-sky-500 rounded-l-full transition-all duration-500" 
              style={{ width: `${metrics.balanceGaugeX}%` }} 
            />
            <div 
              className="h-full bg-emerald-500 rounded-r-full transition-all duration-500" 
              style={{ width: `${metrics.balanceGaugeY}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 6 High-Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Gross Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Gross Revenue</span>
            <Coins className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            {formatLKR(metrics.grossRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Completed Dispatches</span>
            <span className="font-mono text-sky-300 font-bold">{metrics.salesCount}</span>
          </div>
        </div>

        {/* COGS */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Total Cost (COGS)</span>
            <Boxes className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
            {formatLKR(metrics.totalCOGS)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Port & Customs Duty</span>
            <span className="font-mono text-slate-300">{formatLKR(metrics.totalTaxes)}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Consortium Net Profit</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            {formatLKR(metrics.netProfit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Net Profit Margin</span>
            <span className="font-mono text-emerald-300 font-bold">{metrics.marginPct}%</span>
          </div>
        </div>

        {/* Fleet Volume */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Dispatched / Total</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            <span>{metrics.totalUnitsSold}</span> <span className="text-slate-500 font-normal text-sm">/</span> <span>{metrics.totalFleetCapacity}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Fleet Turnover</span>
            <span className="font-mono text-blue-300 font-bold">{metrics.soldPct}%</span>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Stock Valuation</span>
            <Warehouse className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">
            {formatLKR(metrics.remainingStockValuation)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Available In Warehouse</span>
            <span className="font-mono text-purple-200 font-bold">{metrics.totalAvailableUnits} Sets</span>
          </div>
        </div>

        {/* Total Receivables */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Total Receivables</span>
            <FileText className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
            {formatLKR(metrics.totalReceivables)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Outstanding Credit</span>
            <span className="font-mono text-rose-300 font-bold">{metrics.pendingInvoices} Invoices</span>
          </div>
        </div>
      </div>

      {/* Visual Activity & Brand Allocation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Dispatches Log */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-carbon-700/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-carbon-700/60">
            <div>
              <h3 className="font-display font-extrabold text-base text-white">Recent Dispatches & Invoicing Log</h3>
              <p className="text-xs text-slate-400">Verified factory dispatches and client tax invoices</p>
            </div>
            <button
              onClick={onOpenSaleModal}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Dispatch</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-mono bg-carbon-900/60">
                <tr>
                  <th className="px-3.5 py-2.5 rounded-l-xl">Invoice #</th>
                  <th className="px-3.5 py-2.5">Date</th>
                  <th className="px-3.5 py-2.5">Client & Model</th>
                  <th className="px-3.5 py-2.5 text-center">Qty</th>
                  <th className="px-3.5 py-2.5 text-right">Revenue</th>
                  <th className="px-3.5 py-2.5 text-center">Status</th>
                  <th className="px-3.5 py-2.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800/60">
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 font-mono">
                      No sales dispatches recorded yet. Click "New Dispatch" to generate the first invoice.
                    </td>
                  </tr>
                ) : (
                  recentSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-carbon-900/40 transition">
                      <td className="px-3.5 py-3 font-mono font-bold text-sky-400">{sale.id}</td>
                      <td className="px-3.5 py-3 font-mono text-slate-400">{sale.date}</td>
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-white">{sale.customer}</div>
                        <div className="text-[11px] text-slate-400">{sale.machineBrand} {sale.machineModel}</div>
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold">{sale.qty}</td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-emerald-400">
                        {formatLKR(sale.totalRevenue)}
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                          sale.paymentStatus === 'PAID'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : sale.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {sale.paymentStatus || 'PAID'}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <button
                          onClick={() => onPrintInvoice(sale.id)}
                          className="px-2 py-1 rounded-lg bg-carbon-850 hover:bg-sky-600 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 ml-auto"
                          title="Print Commercial Tax Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Brand Allocation Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 space-y-4">
          <div className="pb-3 border-b border-carbon-700/60">
            <h3 className="font-display font-extrabold text-base text-white">Consortium Fleet Breakdown</h3>
            <p className="text-xs text-slate-400">Inventory allocation by machinery brand</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {brandBreakdown.map(item => (
              <div key={item.brand} className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{item.brand}</span>
                  <span className="text-slate-400">
                    <span className="text-white font-bold">{item.available}</span> / {item.total} Sets ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-carbon-900 rounded-full overflow-hidden border border-carbon-750">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.brand === 'JUKI'
                        ? 'bg-sky-400'
                        : item.brand === 'KANSAI'
                        ? 'bg-amber-400'
                        : item.brand === 'PEGASUS'
                        ? 'bg-emerald-400'
                        : item.brand === 'SIRUBA'
                        ? 'bg-purple-400'
                        : 'bg-teal-400'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Total Fleet Models:</span>
            <span className="font-bold text-white">{metrics.skuCount} SKU Models</span>
          </div>
        </div>
      </div>
    </section>
  );
}
