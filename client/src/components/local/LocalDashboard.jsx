import React, { useState } from 'react';
import { 
  Coins, 
  Warehouse, 
  FileText, 
  CreditCard, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  PlusCircle, 
  Bell, 
  Send, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Mail,
  History
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';

export function LocalDashboard({
  metrics,
  alertsData,
  onSendAlert,
  onSendBatchAlerts,
  onOpenAlertLogs,
  activeMonth,
  allMonths,
  onSwitchMonth,
  onCreateNewMonth,
  onOpenNewCustomerModal,
  onOpenNewPaymentModal,
  onOpenQuotationModal,
  systemLang
}) {
  const [sendingAlertId, setSendingAlertId] = useState(null);
  const [batchSending, setBatchSending] = useState(false);

  const handleSendSingleAlert = async (customerId) => {
    setSendingAlertId(customerId);
    try {
      await onSendAlert(customerId);
    } finally {
      setSendingAlertId(null);
    }
  };

  const handleSendBatch = async () => {
    if (!window.confirm("Trigger automated alert emails to all due/overdue clients via Nodemailer?")) return;
    setBatchSending(true);
    try {
      await onSendBatchAlerts();
    } finally {
      setBatchSending(false);
    }
  };

  const alertCounts = alertsData?.counts || { total: 0, sevenDays: 0, threeDays: 0, dueToday: 0, overdue: 0 };
  const activeAlerts = alertsData?.activeAlerts || [];

  return (
    <section className="space-y-8 animate-fadeIn">
      
      {/* Top Banner: Month Selector & Automated Alerts Trigger Bar */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-carbon-700/80 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-carbon-700/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Kosgama Central Yard — Rental Operations & Fleets
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Active Fleet: {metrics.totalActiveMachines} On-Rent • {metrics.activeClients} Active Clients • Active Billing Cycle: <span className="text-emerald-400 font-bold">{activeMonth}</span>
            </p>
          </div>

          {/* Month Switcher & Quick Triggers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-carbon-900 border border-carbon-700 font-mono text-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <select
                value={activeMonth}
                onChange={(e) => onSwitchMonth(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none"
              >
                {(allMonths || []).map(m => (
                  <option key={m} value={m} className="bg-carbon-900 text-white">{m}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onCreateNewMonth}
              className="text-xs bg-carbon-850 hover:bg-carbon-800 text-slate-300 hover:text-white border border-carbon-700 px-3.5 py-2 rounded-xl transition flex items-center gap-2 font-mono"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Create New Month</span>
            </button>

            <button
              onClick={onOpenNewPaymentModal}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Rent Payment</span>
            </button>
          </div>
        </div>

        {/* ================= AUTOMATED DUE DATES & ALERTS HUB ================= */}
        <div className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
                  <span>Automated Rental Due Dates & Email Alert Engine</span>
                  {alertCounts.total > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-600 text-white animate-pulse">
                      {alertCounts.total} ATTENTION REQUIRED
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Real-time alerts triggered on Dashboard & Automated Email via Nodemailer (JukiAppV2)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendBatch}
                disabled={batchSending || alertCounts.total === 0}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{batchSending ? "Dispatching..." : "Send Alert Emails Now"}</span>
              </button>
              <button
                onClick={onOpenAlertLogs}
                className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-700 text-slate-300 hover:text-white transition"
                title="View Sent Alert History"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Alert Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            {/* 7 Days Remaining */}
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold block">7 DAYS REMAINING</span>
                <span className="text-lg font-black text-amber-300">{alertCounts.sevenDays}</span>
              </div>
              <Clock className="w-5 h-5 text-amber-400/60" />
            </div>

            {/* 3 Days Remaining */}
            <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-600/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-orange-400 font-bold block">3 DAYS REMAINING</span>
                <span className="text-lg font-black text-orange-300">{alertCounts.threeDays}</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-orange-400/60" />
            </div>

            {/* Due Today */}
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-600/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-300 font-bold block">DUE TODAY</span>
                <span className="text-lg font-black text-rose-200">{alertCounts.dueToday}</span>
              </div>
              <AlertCircle className="w-5 h-5 text-rose-400/80" />
            </div>

            {/* Overdue */}
            <div className="p-3.5 rounded-2xl bg-pink-950/60 border border-pink-600/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-pink-300 font-bold block">OVERDUE</span>
                <span className="text-lg font-black text-pink-200">{alertCounts.overdue}</span>
              </div>
              <AlertCircle className="w-5 h-5 text-pink-400 animate-pulse" />
            </div>
          </div>

          {/* Active Alerts List Drawer */}
          {activeAlerts.length > 0 && (
            <div className="pt-2">
              <div className="bg-carbon-900/90 rounded-2xl border border-carbon-700/80 overflow-hidden divide-y divide-carbon-800">
                {activeAlerts.slice(0, 5).map(alert => (
                  <div key={alert.customerId} className="p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase mt-0.5 ${
                        alert.alertType === 'OVERDUE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                          : alert.alertType === 'DUE_TODAY'
                          ? 'bg-red-950 text-red-300 border border-red-700'
                          : alert.alertType === '3_DAYS'
                          ? 'bg-orange-950 text-orange-300 border border-orange-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        {alert.alertType.replace('_', ' ')}
                      </span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{alert.customerName}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({alert.customer.code})</span>
                          <span className="text-sky-400 font-mono text-[11px]">• {alert.activeRentCount} Machines</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Scheduled Due Date: <span className="text-slate-200 font-bold">{alert.dueDate}</span> • Balance: <span className="text-rose-400 font-bold">{formatLKR(alert.totalBalanceDue)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSendSingleAlert(alert.customerId)}
                        disabled={sendingAlertId === alert.customerId}
                        className="px-3 py-1.5 rounded-xl bg-carbon-800 hover:bg-sky-600 text-slate-200 hover:text-white transition font-mono font-bold flex items-center gap-1.5 text-[11px]"
                      >
                        <Send className="w-3 h-3 text-sky-400" />
                        <span>{sendingAlertId === alert.customerId ? "Sending..." : "Send Email Alert"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6 Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Monthly Rental Income */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Monthly Rent Demand</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            {formatLKR(metrics.totalMonthlyIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>On-Rent Machinery</span>
            <span className="font-mono text-emerald-300 font-bold">{metrics.totalActiveMachines} Units</span>
          </div>
        </div>

        {/* Arrears */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Opening Arrears</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
            {formatLKR(metrics.totalArrears)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Past Cycle Balance</span>
            <span className="font-mono text-slate-300">Carried Forward</span>
          </div>
        </div>

        {/* Collected Paid */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Collected This Month</span>
            <CreditCard className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-sky-300">
            {formatLKR(metrics.totalPaid)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Collection Rate</span>
            <span className="font-mono text-sky-300 font-bold">{metrics.collectionRate}%</span>
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
            <span>Active Client Base</span>
            <span className="font-mono text-rose-300 font-bold">{metrics.activeClients} Garments</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Yard Expenses</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">
            {formatLKR(metrics.totalExpenses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Technicians & Power</span>
            <span className="font-mono text-purple-200 font-bold">Kosgama Yard</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-card p-5 rounded-2xl border border-carbon-700/70">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Yard Net Profit</span>
            <Coins className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-teal-300">
            {formatLKR(metrics.netProfit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Partner Payables</span>
            <span className="font-mono text-amber-300 font-bold">{formatLKR(metrics.totalPartnerPayables)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
