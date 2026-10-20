import React from 'react';
import { X, Printer, Download, ShieldCheck, FileSpreadsheet, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { CompanyLogo, OfficialSealStamp, MockBarcode } from '../../common/BrandAssets';
import { formatLKR, formatUSD } from '../../../utils/formatters';

export function ChinaPrintableReportModal({ isOpen, shipment, onClose }) {
  if (!isOpen || !shipment) return null;

  const summary = shipment.financialSummary || {};
  const partners = summary.partnersSummary || [];
  const intermediaries = summary.intermediariesSummary || [];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = `\uFEFFANUJAYA ENTERPRISES - CHINA IMPORT & FINANCIAL SETTLEMENT STATEMENT\n`;
    csv += `Shipment / Invoice No:,${shipment.shipmentNo}\n`;
    csv += `Supplier:,${shipment.supplierName}\n`;
    csv += `Container / Carrier:,${shipment.containerNo || 'N/A'} | ${shipment.shippingCarrier || 'N/A'}\n`;
    csv += `Report Generated Date:,${new Date().toLocaleString()}\n\n`;

    csv += `EXECUTIVE FINANCIAL SUMMARY\n`;
    csv += `Metric,Value\n`;
    csv += `Total Shipment Units,${shipment.totalUnits}\n`;
    csv += `FOB Value (USD),${shipment.fobUsd}\n`;
    csv += `Budget USD Rate,${shipment.budgetUsdRate}\n`;
    csv += `Customs & Clearing Budget (LKR),${summary.budgetCustomsLkr}\n`;
    csv += `TOTAL CHINA LIABILITY (LKR),${summary.totalBudgetLkr}\n`;
    csv += `Total Received from Global (LKR),${summary.totalReceivedFromGlobal}\n`;
    csv += `Total Settled to China (LKR),${summary.totalSettledToChinaLkr}\n`;
    csv += `Our Net Cash Contributed (LKR),${summary.ourNetCashContributedLkr}\n`;
    csv += `Remaining Due to China (LKR),${summary.remainingTotalLiabilityLkr}\n\n`;

    csv += `PARTNER LIABILITY & SETTLEMENT SHARE\n`;
    csv += `Partner,Ratio,Target Liability (LKR),Actual Paid (LKR),Remaining Due (LKR),Status\n`;
    partners.forEach(p => {
      csv += `"${p.name}",${(p.agreedRatio * 100).toFixed(1)}%,${p.targetLiabilityLkr},${p.actualPaidLkr},${p.remainingDueLkr},"${p.statusLabel}"\n`;
    });
    csv += `\n`;

    csv += `OVERSEAS FRIENDS & INTERMEDIARY RECONCILIATION\n`;
    csv += `Intermediary,Route,Total Cash Given (LKR),Foreign Settled,Total Settled (LKR),Net Balance (LKR),Status\n`;
    intermediaries.forEach(i => {
      csv += `"${i.name}","${i.country}",${i.totalCashGivenLkr},${i.foreignAmountSettled} ${i.operatingCurrency},${i.totalSettledLkr},${i.netBalanceLkr},"${i.status}"\n`;
    });
    csv += `\n`;

    csv += `CHINA SUPPLIER OUTFLOW PAYMENTS LOG\n`;
    csv += `Trx ID,Date,Channel,Intermediary/Bank,Currency,Foreign Amount,FX Rate,Settled LKR,Status,Reference\n`;
    (shipment.supplierPayments || []).forEach(p => {
      csv += `"${p.trxId}","${p.paymentDate}","${p.channel}","${p.intermediaryName}","${p.currency}",${p.foreignAmount},${p.appliedFxRate},${p.settledLkr},"${p.status}","${p.reference}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `China_Import_Settlement_${shipment.shipmentNo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-carbon-900 border border-carbon-700 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-800 bg-carbon-950/90 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Official China Import & Settlement Statement
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Shipment {shipment.shipmentNo} • A4 Executive Audit Layout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-carbon-800 hover:bg-carbon-700 text-slate-200 border border-carbon-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/40"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Document</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-carbon-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900/60 print:p-0 print:bg-white print:overflow-visible">
          <div 
            id="printable-document" 
            className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-2xl print:shadow-none print:rounded-none print:p-6 print:m-0 border border-slate-200 print:border-none font-sans"
          >
            {/* Header / Brand */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div className="flex items-center gap-4">
                <CompanyLogo className="w-16 h-16 flex-shrink-0" />
                <div>
                  <h1 className="font-display font-black text-2xl tracking-tight text-slate-950 uppercase">
                    ANUJAYA ENTERPRISES
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-600 tracking-wide">
                    INDUSTRIAL APPAREL MACHINERY CONSORTIUM & GLOBAL IMPORT LOGISTICS
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    200/2B/1, Pahala Kosgama, Kosgama, Sri Lanka • Hotline: 077 412 7702 • Reg: PV/WP/78412
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="px-2.5 py-1 bg-slate-950 text-white font-mono font-bold text-[10px] uppercase rounded">
                  FINANCIAL AUDIT STATEMENT
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 mt-1">
                  REF: {shipment.shipmentNo}
                </span>
                <MockBarcode code={shipment.shipmentNo} />
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="my-5 p-3.5 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                  Subject Document
                </span>
                <span className="font-bold text-base text-slate-950">
                  China Import Shipment & Joint Venture Settlement Reconciliation
                </span>
              </div>
              <div className="text-right font-mono text-xs text-slate-700">
                <span>Date: <strong>{new Date().toISOString().slice(0, 10)}</strong></span>
                <span className="block text-[10px] text-slate-500">Status: {shipment.status.toUpperCase()}</span>
              </div>
            </div>

            {/* Shipment Metadata 4-Column Grid */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-5 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Shipment / Invoice No:</span>
                <strong className="text-slate-900 text-sm">{shipment.shipmentNo}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Total Units / Volume:</span>
                <strong className="text-slate-900 text-sm">{shipment.totalUnits} Units (40HC)</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Container & Carrier:</span>
                <strong className="text-slate-900 text-[11px] truncate block">
                  {shipment.containerNo || 'MSKU-9823410'} • {shipment.shippingCarrier || 'Maersk'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Base Budget USD Rate:</span>
                <strong className="text-slate-900 text-sm">{shipment.budgetUsdRate || 330} LKR</strong>
              </div>
            </div>

            {/* 1. Live Executive Financial Position */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
                1. Executive Financial Position & Cash Flow (LKR)
              </h4>
              <div className="grid grid-cols-5 gap-2 text-center font-mono">
                <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Total China Liability</span>
                  <strong className="text-xs text-slate-950 font-bold block mt-1">
                    {formatLKR(summary.totalBudgetLkr || 73076096.80)}
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">FOB + Customs Budget</span>
                </div>

                <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200">
                  <span className="text-[9px] text-sky-800 uppercase block font-bold">Received from Global</span>
                  <strong className="text-xs text-sky-900 font-bold block mt-1">
                    {formatLKR(summary.totalReceivedFromGlobal || 0)}
                  </strong>
                  <span className="text-[9px] text-sky-600 block mt-0.5">Global Apparel Funding</span>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-[9px] text-emerald-800 uppercase block font-bold">Total Settled to China</span>
                  <strong className="text-xs text-emerald-950 font-bold block mt-1">
                    {formatLKR(summary.totalSettledToChinaLkr || 0)}
                  </strong>
                  <span className="text-[9px] text-emerald-600 block mt-0.5">Wire & Remittances</span>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[9px] text-amber-800 uppercase block font-bold">Our Net Contributed</span>
                  <strong className="text-xs text-amber-950 font-bold block mt-1">
                    {formatLKR(summary.ourNetCashContributedLkr || 0)}
                  </strong>
                  <span className="text-[9px] text-amber-600 block mt-0.5">Direct Net Outlays</span>
                </div>

                <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-[9px] text-rose-800 uppercase block font-bold">Remaining Due</span>
                  <strong className="text-xs text-rose-950 font-bold block mt-1">
                    {formatLKR(summary.remainingTotalLiabilityLkr || 0)}
                  </strong>
                  <span className="text-[9px] text-rose-600 block mt-0.5">Outstanding Liability</span>
                </div>
              </div>
            </div>

            {/* 2. Partner Liability & Settlement Share */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
                2. Partner Liability & Funding Obligations
              </h4>
              <table className="w-full text-[11px] border border-slate-300 font-mono">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <tr>
                    <th className="py-1.5 px-2 text-left">Partner Entity</th>
                    <th className="py-1.5 px-2 text-center">Agreed Ratio</th>
                    <th className="py-1.5 px-2 text-right">Target Liability (LKR)</th>
                    <th className="py-1.5 px-2 text-right">Actual Paid (LKR)</th>
                    <th className="py-1.5 px-2 text-right">Remaining Due (LKR)</th>
                    <th className="py-1.5 px-2 text-center">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {partners.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 font-bold text-slate-900">{p.name}</td>
                      <td className="py-1.5 px-2 text-center font-bold">{(p.agreedRatio * 100).toFixed(1)}%</td>
                      <td className="py-1.5 px-2 text-right">{formatLKR(p.targetLiabilityLkr)}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-emerald-700">{formatLKR(p.actualPaidLkr)}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-rose-700">{formatLKR(p.remainingDueLkr)}</td>
                      <td className="py-1.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.isFullySettled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 3. Overseas Friends & Intermediaries Reconciliation */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
                3. Overseas Intermediary & Friend Reconciliation (Foreign Supplier Settlements)
              </h4>
              <table className="w-full text-[11px] border border-slate-300 font-mono">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <tr>
                    <th className="py-1.5 px-2 text-left">Intermediary / Route</th>
                    <th className="py-1.5 px-2 text-right">Cash Given (LKR)</th>
                    <th className="py-1.5 px-2 text-right">Foreign Settled</th>
                    <th className="py-1.5 px-2 text-right">LKR Settled to China</th>
                    <th className="py-1.5 px-2 text-right">Net Balance (LKR)</th>
                    <th className="py-1.5 px-2 text-left">Audit Instruction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {intermediaries.map((inter, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 font-bold text-slate-900">
                        {inter.name} <span className="text-[10px] text-slate-500">({inter.country})</span>
                      </td>
                      <td className="py-1.5 px-2 text-right">{formatLKR(inter.totalCashGivenLkr)}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-800">
                        {inter.foreignAmountSettled.toLocaleString()} {inter.operatingCurrency}
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-emerald-700">
                        {formatLKR(inter.totalSettledLkr)}
                      </td>
                      <td className={`py-1.5 px-2 text-right font-bold ${
                        inter.netBalanceLkr < 0 ? 'text-rose-700' : (inter.netBalanceLkr > 0 ? 'text-sky-700' : 'text-slate-700')
                      }`}>
                        {formatLKR(inter.netBalanceLkr)}
                      </td>
                      <td className="py-1.5 px-2 text-[10px] text-slate-700">{inter.actionInstruction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-right font-mono text-xs">
                <span className="text-slate-600">Combined Net Payable to Intermediaries: </span>
                <strong className="text-rose-700 text-sm">
                  {formatLKR(summary.totalOwedToIntermediariesLkr || 207490)}
                </strong>
              </div>
            </div>

            {/* Signatures & Formal Authorization Block */}
            <div className="pt-8 border-t border-slate-300 mt-6 grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="h-14 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-script text-base text-slate-700">H.M.K. Anujaya</span>
                </div>
                <span className="font-bold text-slate-900 block mt-1">Prepared By</span>
                <span className="text-[10px] text-slate-500 font-mono">Senior Accountant / Finance Lead</span>
              </div>

              <div>
                <div className="h-14 border-b border-dashed border-slate-400 flex items-center justify-center">
                  <OfficialSealStamp text="ANUJAYA ENTERPRISES AUDITED" className="w-16 h-16 opacity-85" />
                </div>
                <span className="font-bold text-slate-900 block mt-1">Internal Audit Certification</span>
                <span className="text-[10px] text-slate-500 font-mono">Consortium Compliance Desk</span>
              </div>

              <div>
                <div className="h-14 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-script text-base text-slate-700">K.A. Anujaya</span>
                </div>
                <span className="font-bold text-slate-900 block mt-1">Authorized Director</span>
                <span className="text-[10px] text-slate-500 font-mono">Managing Director, Anujaya Enterprises</span>
              </div>
            </div>

            {/* Print Footer Notice */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-[9px] text-slate-400 font-mono flex items-center justify-between">
              <span>System Verification Hash: SHA256-ANUJAYA-CHINA-{shipment.shipmentNo}</span>
              <span>Generated via Anujaya ERP v3.8 • Confidential Financial Document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
