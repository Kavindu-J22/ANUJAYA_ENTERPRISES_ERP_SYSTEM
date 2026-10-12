import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  CreditCard, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Truck, 
  ArrowUpRight, 
  DollarSign, 
  X,
  Layers,
  Printer,
  FileText
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';
import { 
  MONTH_NAMES, 
  YEARS, 
  parseMonthYear, 
  getYearMonth, 
  getDateYearMonth, 
  compareYM, 
  isMachineRentedInMonth, 
  paymentBelongsToYM 
} from './LocalCustomerDirectory';

export function LocalRentalPartners({
  partners = [],
  customers = [],
  activeMonth,
  onSwitchMonth,
  onPrintDoc,
  onSavePartner,
  onDeletePartner,
  onRecordPartnerPayment,
  onDeletePartnerPayment
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeletePartnerId, setConfirmDeletePartnerId] = useState(null);
  const [confirmDeletePaymentKey, setConfirmDeletePaymentKey] = useState(null);
  const [expandedPayments, setExpandedPayments] = useState({});

  // Modals state
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [payingPartner, setPayingPartner] = useState(null);

  // Month & Year selection state
  const parsedActive = parseMonthYear(activeMonth);
  const [selectedMonth, setSelectedMonth] = useState(parsedActive.month);
  const [selectedYear, setSelectedYear] = useState(parsedActive.year);
  const [viewAllMonths, setViewAllMonths] = useState(false);

  useEffect(() => {
    const parsed = parseMonthYear(activeMonth);
    setSelectedMonth(parsed.month);
    setSelectedYear(parsed.year);
  }, [activeMonth]);

  const handleMonthYearChange = (newM, newY) => {
    setSelectedMonth(newM);
    setSelectedYear(newY);
    setViewAllMonths(false);
    const targetStr = `${newM} ${newY}`;
    if (onSwitchMonth) {
      onSwitchMonth(targetStr);
    }
  };

  const handleJumpCurrentMonth = () => {
    const now = new Date();
    const currM = MONTH_NAMES[now.getMonth()];
    const currY = now.getFullYear();
    handleMonthYearChange(currM, currY);
  };

  const currentYM = useMemo(() => ({
    year: selectedYear,
    month: MONTH_NAMES.indexOf(selectedMonth)
  }), [selectedMonth, selectedYear]);

  const realNow = useMemo(() => {
    const d = new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth()
    };
  }, []);

  // Compute sub-leased machines and financial monitoring for each partner company
  const enrichedPartners = useMemo(() => {
    return (partners || []).map(p => {
      // 1. Find all machines rented from this partner across all customers
      const sourcedMachines = [];
      (customers || []).forEach(c => {
        (c.rentals || []).forEach(r => {
          const matchId = r.partnerId && (r.partnerId === p.id || (p._id && r.partnerId === p._id));
          const matchName = r.isPartnerMachine && r.partnerName && p.name && (r.partnerName.trim().toLowerCase() === p.name.trim().toLowerCase());
          const matchCode = r.isPartnerMachine && r.partnerMachineCode && p.code && r.partnerMachineCode.includes(p.code);
          if (matchId || matchName || matchCode) {
            sourcedMachines.push({
              ...r,
              customerName: c.name,
              customerCode: c.code,
              customerId: c.id,
              customerArchived: c.isArchived
            });
          }
        });
      });

      const activeMachinesCount = sourcedMachines.filter(m => m.status === 'Active').length;
      const returnedMachinesCount = sourcedMachines.filter(m => m.status === 'Returned').length;

      // 2. Cycle-specific calculations for selectedMonth & selectedYear
      // Machines actively deployed during currentYM
      const cycleActiveMachines = sourcedMachines.filter(m => isMachineRentedInMonth(m, currentYM));
      const cyclePartnerRent = cycleActiveMachines.reduce((sum, m) => sum + (Number(m.partnerRentRate) || 0), 0);
      const cycleCustomerRent = cycleActiveMachines.reduce((sum, m) => sum + (Number(m.rentRate) || 0), 0);
      const cycleSpread = cycleCustomerRent - cyclePartnerRent;

      // Payments made to partner in this cycle
      const cyclePaid = (p.payments || []).filter(pay => paymentBelongsToYM(pay, currentYM))
        .reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);

      // Prior partner arrears breakdown calculation before currentYM
      let earliestYM = { ...currentYM };
      sourcedMachines.forEach(m => {
        if (m.startDate) {
          const ym = getDateYearMonth(m.startDate);
          if (compareYM(ym, earliestYM) < 0) earliestYM = ym;
        }
      });
      (p.payments || []).forEach(pay => {
        if (pay.date) {
          const ym = getDateYearMonth(pay.date);
          if (compareYM(ym, earliestYM) < 0) earliestYM = ym;
        }
      });

      let totalPriorPartnerRent = 0;
      let totalPriorPartnerPaid = 0;
      let curY = earliestYM.year;
      let curM = earliestYM.month;

      while (curY < currentYM.year || (curY === currentYM.year && curM < currentYM.month)) {
        const pastYM = { year: curY, month: curM };
        const pastRent = sourcedMachines.filter(m => isMachineRentedInMonth(m, pastYM))
          .reduce((sum, m) => sum + (Number(m.partnerRentRate) || 0), 0);
        const pastPaid = (p.payments || []).filter(pay => paymentBelongsToYM(pay, pastYM))
          .reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);

        totalPriorPartnerRent += pastRent;
        totalPriorPartnerPaid += pastPaid;

        curM++;
        if (curM > 11) {
          curM = 0;
          curY++;
        }
      }

      const carriedBase = Number(p.baseOpeningBalance || 0);
      const priorArrears = carriedBase + (totalPriorPartnerRent - totalPriorPartnerPaid);
      const cycleBalanceDue = priorArrears + cyclePartnerRent - cyclePaid;

      // 3. All-time Real-Time Standing (Live • Unaffected by month selection)
      const allTimePaid = (p.payments || []).reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);

      // Calculate real accrued up to realNow
      let allAccruedRentUpToNow = 0;
      let rCurY = earliestYM.year;
      let rCurM = earliestYM.month;
      while (rCurY < realNow.year || (rCurY === realNow.year && rCurM <= realNow.month)) {
        const ym = { year: rCurY, month: rCurM };
        const rent = sourcedMachines.filter(m => isMachineRentedInMonth(m, ym))
          .reduce((sum, m) => sum + (Number(m.partnerRentRate) || 0), 0);
        allAccruedRentUpToNow += rent;
        rCurM++;
        if (rCurM > 11) {
          rCurM = 0;
          rCurY++;
        }
      }
      const allTimeBalanceDue = (carriedBase + allAccruedRentUpToNow) - allTimePaid;

      return {
        ...p,
        sourcedMachines,
        activeMachinesCount,
        returnedMachinesCount,
        cycleActiveMachines,
        cyclePartnerRent,
        cycleCustomerRent,
        cycleSpread,
        cyclePaid,
        priorArrears,
        cycleBalanceDue,
        allTimePaid,
        allTimeBalanceDue
      };
    });
  }, [partners, customers, currentYM, realNow]);

  // Overall Global Sourcing Metrics
  const summaryMetrics = useMemo(() => {
    let totalSourced = 0;
    let totalActive = 0;
    let totalReturned = 0;
    let totalCyclePartnerRent = 0;
    let totalCycleCustomerRent = 0;
    let totalCyclePaid = 0;
    let totalAllTimePaid = 0;
    let totalAllTimeBalanceDue = 0;

    enrichedPartners.forEach(p => {
      totalSourced += p.sourcedMachines.length;
      totalActive += p.activeMachinesCount;
      totalReturned += p.returnedMachinesCount;
      totalCyclePartnerRent += p.cyclePartnerRent;
      totalCycleCustomerRent += p.cycleCustomerRent;
      totalCyclePaid += p.cyclePaid;
      totalAllTimePaid += p.allTimePaid;
      totalAllTimeBalanceDue += p.allTimeBalanceDue;
    });

    const netCycleSpread = totalCycleCustomerRent - totalCyclePartnerRent;

    return {
      partnerCount: enrichedPartners.length,
      totalSourced,
      totalActive,
      totalReturned,
      totalCyclePartnerRent,
      totalCycleCustomerRent,
      totalCyclePaid,
      totalAllTimePaid,
      totalAllTimeBalanceDue,
      netCycleSpread
    };
  }, [enrichedPartners]);

  // Filtered partners by search
  const filteredPartners = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return enrichedPartners;

    return enrichedPartners.filter(p => {
      const matchCompany = (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.contactPerson || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q)
      );

      const matchMachine = (p.sourcedMachines || []).some(m =>
        (m.model || '').toLowerCase().includes(q) ||
        (m.serialNumber || '').toLowerCase().includes(q) ||
        (m.machineCode || '').toLowerCase().includes(q) ||
        (m.customerName || '').toLowerCase().includes(q)
      );

      return matchCompany || matchMachine;
    });
  }, [enrichedPartners, searchQuery]);

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Top Header & Control Bar */}
      <div className="glass-card p-6 rounded-3xl border border-carbon-700/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shadow-xl">
        <div>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Renting Partnership Companies (Sub-Leased Fleets)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Third-Party Machinery Rental Partners, Sub-Leased Client Allocations & Monthly Partner Payables
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Enhanced Month & Year Selector */}
          <div className="flex items-center gap-1.5 p-1.5 bg-carbon-900 border border-carbon-700/80 rounded-2xl shadow-inner font-mono text-xs">
            <div className="flex items-center gap-1 px-2 py-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Month:</span>
            </div>
            
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthYearChange(e.target.value, selectedYear)}
              disabled={viewAllMonths}
              className="bg-carbon-800 text-emerald-300 font-bold px-2.5 py-1.5 rounded-xl border border-carbon-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs disabled:opacity-50"
            >
              {MONTH_NAMES.map(m => (
                <option key={m} value={m} className="bg-carbon-900 text-white font-bold">{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value))}
              disabled={viewAllMonths}
              className="bg-carbon-800 text-white font-bold px-2.5 py-1.5 rounded-xl border border-carbon-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs disabled:opacity-50"
            >
              {YEARS.map(y => (
                <option key={y} value={y} className="bg-carbon-900 text-white font-bold">{y}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleJumpCurrentMonth}
              className="px-2 py-1 text-[10px] font-bold bg-carbon-800 hover:bg-carbon-700 text-slate-300 hover:text-white rounded-xl transition border border-carbon-700/60"
              title="Jump to Current Real-time Month"
            >
              Current
            </button>

            <button
              type="button"
              onClick={() => setViewAllMonths(prev => !prev)}
              className={`px-2 py-1 text-[10px] font-bold rounded-xl transition border ${viewAllMonths ? 'bg-amber-600 text-white border-amber-500' : 'bg-carbon-800 hover:bg-carbon-700 text-slate-300 hover:text-white border-carbon-700/60'}`}
              title="Toggle View All Periods"
            >
              {viewAllMonths ? 'All' : 'All Periods'}
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Partner, Model, SN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-carbon-900 border border-carbon-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <button
            onClick={() => {
              setEditingPartner(null);
              setIsPartnerModalOpen(true);
            }}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Partner Company</span>
          </button>
        </div>
      </div>

      {/* Top Sourcing Overview KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="glass-card p-4 rounded-2xl border border-carbon-700/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Partner Companies</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-white">{summaryMetrics.partnerCount}</span>
            <span className="text-xs text-amber-400 font-bold">{summaryMetrics.totalSourced} Total Sourced</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-carbon-700/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Deployed in Clients ({selectedMonth} {selectedYear})</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-emerald-400">{summaryMetrics.totalActive} Active In-Use</span>
            <span className="text-xs text-slate-400">{summaryMetrics.totalReturned} De-Hired</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-carbon-700/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cycle Partner Rent We Owe ({selectedMonth})</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-amber-400">{formatLKR(summaryMetrics.totalCyclePartnerRent)}</span>
            <span className="text-[10px] text-sky-400 font-bold">Paid: {formatLKR(summaryMetrics.totalCyclePaid)}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-carbon-700/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sub-Lease Profit Spread (Net Margin)</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-teal-400">+{formatLKR(summaryMetrics.netCycleSpread)}</span>
            <span className="text-[10px] text-emerald-300 font-bold">Client Hire − Partner Cost</span>
          </div>
        </div>
      </div>

      {/* Partner Profiles & Machinery Fleet Directory */}
      <div className="space-y-6">
        {filteredPartners.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono glass-card rounded-3xl space-y-2">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No renting partnership companies registered or matching search criteria.</p>
            <button
              onClick={() => {
                setEditingPartner(null);
                setIsPartnerModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-amber-400 text-xs font-bold transition inline-flex items-center gap-1.5 mt-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register First Partner Company</span>
            </button>
          </div>
        ) : (
          filteredPartners.map(partner => (
            <div
              key={partner.id}
              className="glass-card p-6 sm:p-7 rounded-3xl border border-carbon-700/80 transition space-y-5 hover:border-amber-500/40 shadow-xl"
            >
              {/* Partner Header Row */}
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-carbon-700/60">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-carbon-800 border border-carbon-700 text-amber-400 font-bold">
                      {partner.code}
                    </span>
                    <h3 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
                      <span>{partner.name}</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                      RENTAL SOURCING PARTNER
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                    <span className="text-slate-300">
                      👤 {partner.contactPerson || 'Director / Fleet Manager'}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-sky-400" />
                      {partner.phone || 'No Contact'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {partner.address || 'Sri Lanka'}
                    </span>
                  </div>
                </div>

                {/* Financial Metrics Containers (Live Overall Standing + Selected Cycle Snapshot) */}
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
                  {/* 1. Real-Time Overall Standing (Live - Unaffected by Month Selection) */}
                  <div className="bg-gradient-to-br from-carbon-900 via-amber-950/40 to-carbon-900 p-3 rounded-2xl border border-amber-500/40 font-mono text-xs shadow-lg">
                    <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-amber-500/20">
                      <span className="text-[9px] uppercase font-black text-amber-400 flex items-center gap-1.5 tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Live Partner Standing</span>
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Month Select Unaffected
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Total Paid to Partner</span>
                        <span className="font-black text-sky-300 text-xs">{formatLKR(partner.allTimePaid)}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-amber-500/20"></div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Net Balance Due to Partner</span>
                        <span className={`font-black text-xs ${partner.allTimeBalanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatLKR(partner.allTimeBalanceDue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Billing Cycle Snapshot Pill */}
                  <div className="bg-carbon-900/90 p-3 rounded-2xl border border-carbon-700 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-carbon-800">
                      <span className="text-[9px] uppercase font-bold text-amber-400 flex items-center gap-1 tracking-wider">
                        <span>Partner Cycle Snapshot</span>
                      </span>
                      <span className="text-[9px] text-amber-300/80 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                        {selectedMonth} {selectedYear}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Prior Arrears</span>
                        <span className="font-bold text-amber-300 text-xs">{formatLKR(partner.priorArrears)}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-carbon-700"></div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Cycle Rent</span>
                        <span className="font-bold text-white text-xs">{formatLKR(partner.cyclePartnerRent)}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-carbon-700"></div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Paid</span>
                        <span className="font-bold text-sky-400 text-xs">{formatLKR(partner.cyclePaid)}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-carbon-700"></div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Cycle Due</span>
                        <span className={`font-black text-xs ${partner.cycleBalanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatLKR(partner.cycleBalanceDue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sourced Machinery Fleet Sub-Leased to Customers */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sourced Machinery Fleet ({partner.sourcedMachines.length} Total Units • {partner.activeMachinesCount} In-Use • {partner.returnedMachinesCount} Returned)</span>
                  </span>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Selected Month Net Spread:</span>
                    <span className="font-bold text-teal-400 font-mono">+{formatLKR(partner.cycleSpread)}</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-carbon-700/80 bg-carbon-900/60 shadow-inner">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-carbon-900 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-carbon-700">
                      <tr>
                        <th className="px-3.5 py-3">Machine Code</th>
                        <th className="px-3.5 py-3">Machinery Model Description</th>
                        <th className="px-3.5 py-3">Serial (SN)</th>
                        <th className="px-3.5 py-3">Currently Deployed Client</th>
                        <th className="px-3.5 py-3 text-center">Status</th>
                        <th className="px-3.5 py-3 text-right">Partner Cost (We Pay)</th>
                        <th className="px-3.5 py-3 text-right">Client Rent (We Get)</th>
                        <th className="px-3.5 py-3 text-right">Monthly Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-carbon-800 font-mono">
                      {partner.sourcedMachines.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-6 text-slate-500 font-sans text-xs">
                            No machinery units currently sub-leased from this partner company.
                          </td>
                        </tr>
                      ) : (
                        partner.sourcedMachines.map(m => {
                          const margin = (Number(m.rentRate) || 0) - (Number(m.partnerRentRate) || 0);

                          return (
                            <tr key={m.machineId} className="hover:bg-carbon-800/40 transition">
                              <td className="px-3.5 py-2.5 font-bold text-amber-400">{m.machineCode}</td>
                              <td className="px-3.5 py-2.5 font-sans font-bold text-white">
                                {m.model}
                                <span className="text-[10px] text-slate-500 block font-mono">{m.accessories}</span>
                              </td>
                              <td className="px-3.5 py-2.5 text-sky-400">{m.serialNumber}</td>
                              <td className="px-3.5 py-2.5 font-sans font-bold text-slate-200">
                                <div>{m.customerName}</div>
                                <span className="text-[10px] text-slate-500 font-mono">{m.customerCode} • Since {m.startDate}</span>
                              </td>
                              <td className="px-3.5 py-2.5 text-center">
                                {m.status === 'Returned' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                                    Returned ({m.returnDate || 'De-Hired'})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                                    In Use (Active)
                                  </span>
                                )}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-bold text-amber-300">
                                {formatLKR(m.partnerRentRate)}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-bold text-emerald-400">
                                {formatLKR(m.rentRate)}
                              </td>
                              <td className={`px-3.5 py-2.5 text-right font-bold ${margin >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                                {margin >= 0 ? `+${formatLKR(margin)}` : formatLKR(margin)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Partner Actions & Record Settlement Payment */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-carbon-700/60">
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <button
                    onClick={() => setPayingPartner(partner)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Partner ({selectedMonth})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onPrintDoc) {
                        onPrintDoc({
                          type: 'RENTAL_SETTLEMENT_INVOICE',
                          partner,
                          meta: {
                            cycleMonth: `${selectedMonth} ${selectedYear}`,
                            sourcedMachines: partner.sourcedMachines,
                            cyclePartnerRent: partner.cyclePartnerRent,
                            priorArrears: partner.priorArrears,
                            cyclePaid: partner.cyclePaid,
                            cycleBalanceDue: partner.cycleBalanceDue
                          }
                        });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 text-amber-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                    title={`Print Monthly Settlement Invoice for ${selectedMonth} ${selectedYear}`}
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Settlement Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onPrintDoc) {
                        onPrintDoc({
                          type: 'RENTAL_SETTLEMENT_STATEMENT',
                          partner,
                          meta: {
                            sourcedMachines: partner.sourcedMachines,
                            allTimeBalanceDue: partner.allTimeBalanceDue
                          }
                        });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/40 border border-sky-500/50 text-sky-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                    title="Print All-Time Partner Statement of Account"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Statement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedPayments(prev => ({ ...prev, [partner.id]: !prev[partner.id] }))}
                    className="px-3 py-1.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Payments History ({(partner.payments || []).length})</span>
                    <span className="text-[9px] text-slate-400">{expandedPayments[partner.id] ? "▲" : "▼"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingPartner(partner);
                      setIsPartnerModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-carbon-800 hover:bg-carbon-700 border border-carbon-700 text-slate-400 hover:text-white transition"
                    title="Edit Partner Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {confirmDeletePartnerId === partner.id ? (
                    <div className="flex items-center gap-1 animate-fadeIn">
                      <button
                        onClick={() => {
                          setConfirmDeletePartnerId(null);
                          onDeletePartner(partner.id);
                        }}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-mono text-[10px] font-bold"
                        title="Confirm Delete"
                      >
                        Confirm?
                      </button>
                      <button
                        onClick={() => setConfirmDeletePartnerId(null)}
                        className="px-1.5 py-1 bg-carbon-700 hover:bg-carbon-600 text-slate-300 rounded font-mono text-[10px]"
                        title="Cancel"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeletePartnerId(partner.id)}
                      className="p-1.5 rounded-lg bg-carbon-800 hover:bg-rose-900 border border-carbon-700 text-slate-400 hover:text-rose-300 transition"
                      title="Delete Partner Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Payments to Partner Drawer */}
              {expandedPayments[partner.id] && (
                <div className="mt-3 bg-carbon-950/90 rounded-2xl border border-carbon-700/60 p-4 space-y-3 font-mono text-xs animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-carbon-800">
                    <span className="text-[11px] font-bold uppercase text-slate-300">
                      Settlement Payments Paid to {partner.name}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Total Settled: {formatLKR(partner.allTimePaid)}
                    </span>
                  </div>

                  {(partner.payments || []).length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-xs">
                      No payments recorded to this partner company yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-carbon-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-carbon-900 text-slate-400 uppercase text-[10px] border-b border-carbon-800">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Cycle Month</th>
                            <th className="p-2.5">Method</th>
                            <th className="p-2.5">Ref No</th>
                            <th className="p-2.5 text-right">Amount (LKR)</th>
                            <th className="p-2.5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-carbon-850">
                          {partner.payments.map(pay => (
                            <tr key={pay.id} className="hover:bg-carbon-900/40">
                              <td className="p-2.5 text-slate-300">{pay.date}</td>
                              <td className="p-2.5 text-slate-300 font-bold">{pay.month || '-'}</td>
                              <td className="p-2.5 text-slate-400">{pay.method}</td>
                              <td className="p-2.5 text-sky-400">{pay.refNo || '-'}</td>
                              <td className="p-2.5 text-right font-bold text-emerald-400">
                                {formatLKR(pay.amount)}
                              </td>
                              <td className="p-2.5 text-center">
                                {confirmDeletePaymentKey === `${partner.id}_${pay.id}` ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => {
                                        setConfirmDeletePaymentKey(null);
                                        onDeletePartnerPayment(partner.id, pay.id);
                                      }}
                                      className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-bold"
                                    >
                                      Confirm?
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeletePaymentKey(null)}
                                      className="px-1 py-0.5 bg-carbon-700 text-slate-300 rounded text-[9px]"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onPrintDoc) {
                                          onPrintDoc({
                                            type: 'PARTNER_PAYMENT_VOUCHER',
                                            partner,
                                            payment: pay
                                          });
                                        }
                                      }}
                                      className="p-1 rounded bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-amber-300 transition"
                                      title="Print Settlement Payment Voucher"
                                    >
                                      <Printer className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeletePaymentKey(`${partner.id}_${pay.id}`)}
                                      className="p-1 rounded bg-carbon-800 hover:bg-rose-900 text-slate-400 hover:text-white"
                                      title="Delete Payment"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ================= REGISTER / EDIT PARTNER COMPANY MODAL ================= */}
      {isPartnerModalOpen && (
        <PartnerRegisterModal
          isOpen={isPartnerModalOpen}
          initialData={editingPartner}
          onClose={() => {
            setIsPartnerModalOpen(false);
            setEditingPartner(null);
          }}
          onSave={(data) => {
            onSavePartner(data, editingPartner ? 'EDIT' : 'ADD');
            setIsPartnerModalOpen(false);
            setEditingPartner(null);
          }}
        />
      )}

      {/* ================= RECORD PAYMENT TO PARTNER MODAL ================= */}
      {payingPartner && (
        <PayPartnerModal
          isOpen={!!payingPartner}
          partner={payingPartner}
          activeMonth={`${selectedMonth} ${selectedYear}`}
          onClose={() => setPayingPartner(null)}
          onSave={(paymentData) => {
            onRecordPartnerPayment(payingPartner.id, paymentData);
            setPayingPartner(null);
          }}
        />
      )}
    </section>
  );
}

// Sub-component: Register / Edit Partner Company Modal
function PartnerRegisterModal({ isOpen, initialData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    code: initialData?.code || 'PTR-' + Math.floor(100 + Math.random() * 900),
    name: initialData?.name || '',
    contactPerson: initialData?.contactPerson || 'Director / Fleet Manager',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    baseOpeningBalance: initialData?.baseOpeningBalance || 0
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Partner Company Name is required.");
    onSave({
      ...(initialData || {}),
      ...formData,
      id: initialData?.id || ("part_" + Date.now()),
      baseOpeningBalance: parseFloat(formData.baseOpeningBalance) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/90 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                {initialData ? "Edit Renting Partner Company" : "Register Renting Partner Company"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">External Machinery Sub-Leasing Partner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Company Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Starting Carried Payables (LKR)</label>
              <input
                type="number"
                step="any"
                value={formData.baseOpeningBalance}
                onChange={e => setFormData({ ...formData, baseOpeningBalance: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Company / Consortium Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Singer Industry Machinery Leasing PLC"
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Address / Yard Depot Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 45/A, High Level Road, Pannipitiya"
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? "Update Partner" : "Register Partner"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-component: Pay Partner Modal
function PayPartnerModal({ isOpen, partner, activeMonth, onClose, onSave }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    month: activeMonth || 'October 2026',
    amount: '',
    method: 'BOC Bank Transfer',
    refNo: 'BOC-TX-' + Math.floor(10000 + Math.random() * 90000),
    remarks: ''
  });

  if (!isOpen || !partner) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);
    if (!parsedAmount || parsedAmount <= 0) return alert("Please enter a valid payment amount.");

    onSave({
      id: "pay_prt_" + Date.now(),
      date: formData.date,
      month: formData.month,
      amount: parsedAmount,
      method: formData.method,
      refNo: formData.refNo.trim() || `TX-${Date.now().toString().slice(-5)}`,
      remarks: formData.remarks.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-700/90 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="p-6 bg-carbon-850 border-b border-carbon-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Record Payment to Partner</h3>
              <p className="text-xs text-amber-400 font-mono">{partner.name} ({partner.code})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Target Billing Cycle</label>
              <input
                type="text"
                required
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-sky-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Amount Settled (LKR) *</label>
            <input
              type="number"
              step="any"
              min={1}
              required
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 35000"
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Payment Method</label>
              <select
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="BOC Bank Transfer">BOC Bank Transfer</option>
                <option value="Direct Cash">Direct Cash</option>
                <option value="Cheque (PDC)">Cheque (PDC)</option>
                <option value="Commercial Bank SLIPS">Commercial Bank SLIPS</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Bank Reference / Ref #</label>
              <input
                type="text"
                value={formData.refNo}
                onChange={e => setFormData({ ...formData, refNo: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-sky-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Remarks / Settlement Notes</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. October monthly rent for 2x Juki DDL-8700 units"
              className="w-full px-3 py-2 bg-carbon-800 border border-carbon-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-carbon-700/60 flex justify-end gap-3 font-mono">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Payment to Partner</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
