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
  Scale,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function GlobalDashboard({
  metrics = {},
  recentSales = [],
  brandBreakdown = [],
  onResetBaseline,
  onOpenSaleModal,
  onOpenMachineModal,
  onPrintInvoice,
  currentUser,
  currentLang,
  usdRate = 330
}) {
  const isAdmin = currentUser?.role === 'ADMIN';

  const profitAnujaya = metrics.profitAnujaya !== undefined ? metrics.profitAnujaya : (metrics.partnerShare || 0);
  const profitGlobal = metrics.profitGlobal !== undefined ? metrics.profitGlobal : (metrics.partnerShare || 0);
  const profitShared5050 = metrics.profitShared5050 !== undefined ? metrics.profitShared5050 : (metrics.netProfit || 0);
  const profitGlobal100 = metrics.profitGlobal100 || 0;

  return (
    <section className="space-y-8 animate-fadeIn">
      {/* Consortium Executive Financial Card - MODERNIZED */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-carbon-700/80 relative overflow-hidden shadow-2xl space-y-6">
        
        {/* Background Decorative Glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-carbon-700/60">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-[10px] font-mono font-bold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AUDITED CONSORTIUM RECONCILIATION
              </span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-carbon-850 text-amber-300 border border-carbon-700">
                SPOT RATE: 1 USD = <strong className="text-white">{usdRate.toFixed(2)}</strong> LKR
              </span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Consortium Executive Financial & Capital Summary
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Consortium Fleet: <strong className="text-white">{metrics.skuCount || 26}</strong> SKU Models • <strong className="text-white">{metrics.totalFleetCapacity || 0}</strong> Sets Baseline Capacity • 50/50 Dual Entity Clearing
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && (
              <button
                onClick={onResetBaseline}
                className="text-xs bg-carbon-850 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-carbon-700 hover:border-rose-800 px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 font-mono shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            )}
            <button
              onClick={onOpenSaleModal}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>New Dispatch</span>
            </button>
          </div>
        </div>

        {/* 50/50 & Direct Allocation Partner Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Anujaya Enterprises (Partner X) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-carbon-900/95 to-carbon-850/90 border border-sky-500/40 relative shadow-xl hover:border-sky-400/60 transition space-y-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-sky-400 shadow-md shadow-sky-400/40 inline-block"></div>
                  <h3 className="font-display font-black text-xl text-white tracking-wide">
                    Anujaya Enterprises
                  </h3>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                    50% EQUITY CONSORTIUM
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Sri Lanka Operations</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[11px] text-slate-400 font-semibold block">Total Realized Net Profit</span>
                <div className="text-2xl sm:text-3xl font-black text-sky-300 mt-0.5">
                  {formatLKR(profitAnujaya)}
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-carbon-800/80 text-xs font-mono">
              <div className="p-3 rounded-xl bg-carbon-950/70 border border-carbon-800/80">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Capital Draws:</span>
                <span className="text-rose-400 font-bold text-sm mt-0.5 block">-{formatLKR(metrics.drawAnujaya || 0)}</span>
              </div>
              <div className="p-3 rounded-xl bg-carbon-950/70 border border-carbon-800/80 text-right">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Unsettled Balance:</span>
                <span className="text-sky-400 font-bold text-sm mt-0.5 block">{formatLKR(metrics.balAnujaya || 0)}</span>
              </div>
            </div>
          </div>

          {/* Global Enterprises (Partner Y) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-carbon-900/95 to-carbon-850/90 border border-emerald-500/40 relative shadow-xl hover:border-emerald-400/60 transition space-y-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-md bg-emerald-400 shadow-md shadow-emerald-400/40 inline-block"></div>
                  <h3 className="font-display font-black text-xl text-white tracking-wide">
                    Global Enterprises
                  </h3>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    50% EQUITY + 100% DIRECT
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">China Machinery Sourcing</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[11px] text-slate-400 font-semibold block">Total Realized Net Profit</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                  {formatLKR(profitGlobal)}
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-carbon-800/80 text-xs font-mono">
              <div className="p-3 rounded-xl bg-carbon-950/70 border border-carbon-800/80">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Capital Draws:</span>
                <span className="text-rose-400 font-bold text-sm mt-0.5 block">-{formatLKR(metrics.drawGlobal || 0)}</span>
              </div>
              <div className="p-3 rounded-xl bg-carbon-950/70 border border-carbon-800/80 text-right">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Unsettled Balance:</span>
                <span className="text-emerald-400 font-bold text-sm mt-0.5 block">{formatLKR(metrics.balGlobal || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equity Balance Ratio Gauge */}
        <div className="pt-2 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-sky-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Anujaya Equity Balance: {formatLKR(metrics.balAnujaya || 0)}
            </span>
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 hidden sm:flex">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Consortium Equity Ratio Indicator</span>
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              Global Equity Balance: {formatLKR(metrics.balGlobal || 0)}
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </span>
          </div>

          <div className="h-3.5 w-full bg-carbon-950 rounded-full overflow-hidden p-0.5 border border-carbon-700/80 flex shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-l-full transition-all duration-500" 
              style={{ width: `${metrics.balanceGaugeX || 50}%` }} 
            />
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-r-full transition-all duration-500" 
              style={{ width: `${metrics.balanceGaugeY || 50}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 6 High-Performance Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Gross Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Gross Revenue</span>
            <Coins className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            {formatLKR(metrics.grossRevenue || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Completed Dispatches</span>
            <span className="font-mono text-sky-300 font-bold">{metrics.salesCount || 0}</span>
          </div>
        </div>

        {/* COGS */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Total Cost (COGS)</span>
            <Boxes className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
            {formatLKR(metrics.totalCOGS || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Port & Customs Duty</span>
            <span className="font-mono text-slate-300">{formatLKR(metrics.totalTaxes || 0)}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Consortium Profit</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            {formatLKR(metrics.netProfit || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Net Profit Margin</span>
            <span className="font-mono text-emerald-300 font-bold">{metrics.marginPct || 0}%</span>
          </div>
        </div>

        {/* Fleet Volume */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Dispatched / Total</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            <span>{metrics.totalUnitsSold || 0}</span> <span className="text-slate-500 font-normal text-sm">/</span> <span>{metrics.totalFleetCapacity || 0}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Fleet Turnover</span>
            <span className="font-mono text-blue-300 font-bold">{metrics.soldPct || 0}%</span>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Stock Valuation</span>
            <Warehouse className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">
            {formatLKR(metrics.remainingStockValuation || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>In Warehouse</span>
            <span className="font-mono text-purple-200 font-bold">{metrics.totalAvailableUnits || 0} Sets</span>
          </div>
        </div>

        {/* Total Receivables */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Total Receivables</span>
            <FileText className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
            {formatLKR(metrics.totalReceivables || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Outstanding Due</span>
            <span className="font-mono text-rose-300 font-bold">{metrics.pendingInvoices || 0} Invoices</span>
          </div>
        </div>
      </div>

      {/* Visual Activity & Brand Allocation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Dispatches Log */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-carbon-700/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-carbon-700/60">
            <div>
              <h3 className="font-display font-extrabold text-base text-white">Recent Dispatches & Invoicing Log</h3>
              <p className="text-xs text-slate-400 font-mono">Verified factory dispatches and client tax invoices</p>
            </div>
            <button
              onClick={onOpenSaleModal}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition font-mono"
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
                          onClick={() => onPrintInvoice(sale)}
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
        <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 space-y-4 shadow-xl">
          <div className="pb-3 border-b border-carbon-700/60">
            <h3 className="font-display font-extrabold text-base text-white">Consortium Fleet Breakdown</h3>
            <p className="text-xs text-slate-400 font-mono">Inventory allocation by machinery brand</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {(brandBreakdown || []).map(item => (
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
