import React from 'react';
import { Printer, X } from 'lucide-react';
import { formatLKR, numberToWordsLKR } from '../../utils/formatters';
import { CompanyLogo, OfficialSealStamp, MockBarcode } from '../common/BrandAssets';

export function GlobalTaxInvoiceModal({ sale, machine, onClose }) {
  if (!sale) return null;

  const m = machine || {};
  const qty = parseInt(sale.qty) || 1;
  const unitPrice = parseFloat(sale.unitPrice) || 0;
  const totalRevenue = qty * unitPrice;

  const rawPaid = sale.paidAmount !== undefined && sale.paidAmount !== null 
    ? sale.paidAmount 
    : sale.amountPaid;

  const paidAmount = sale.paymentStatus === 'PAID'
    ? totalRevenue
    : sale.paymentStatus === 'PARTIAL'
    ? (rawPaid !== undefined && rawPaid !== null ? parseFloat(rawPaid) : (totalRevenue * 0.5))
    : (parseFloat(rawPaid) || 0);

  const dueAmount = sale.dueAmount !== undefined && sale.dueAmount !== null
    ? parseFloat(sale.dueAmount)
    : Math.max(0, totalRevenue - paidAmount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Controls (No print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-sky-400">Official Tax Invoice & Dispatch Slip:</span>
            <span className="text-white font-bold">{sale.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-document" className="p-8 sm:p-12 space-y-6 text-slate-900 bg-white">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div className="flex items-center gap-4">
              <CompanyLogo className="w-16 h-16" />
              <div>
                <h1 className="font-display font-black text-2xl uppercase tracking-tight text-slate-900">
                  ANUJAYA ENTERPRISES
                </h1>
                <div className="text-xs font-bold text-sky-700 uppercase tracking-widest">
                  & GLOBAL ENTERPRISES (CHINA) CONSORTIUM
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Apparel Machinery Logistics, High-Speed Sewing Systems & Automated Equipment
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Kosgama Central Yard • Hotline: 077 412 7702 • Email: anujayaenterprises.info@gmail.com
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">Commercial Tax Invoice</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{sale.id}</div>
              <div className="text-xs text-slate-600 mt-1">Date: {sale.date}</div>
              <div className="mt-2">
                <MockBarcode code={sale.id} />
              </div>
            </div>
          </div>

          {/* Client & Dispatch Information */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                Bill To / Apparel Client:
              </span>
              <div className="font-extrabold text-sm text-slate-900">{sale.customer}</div>
              <div className="text-slate-600 font-mono">{sale.phone ? `Phone: ${sale.phone}` : "Verified Client"}</div>
              <div className="text-slate-600">{sale.region || "Western Province, Sri Lanka"}</div>
              <div className="text-[11px] text-slate-700 font-mono font-semibold pt-1">
                Payment Terms: <span className="font-bold text-slate-900">{sale.payment || 'Bank Wire / SLIPS'}</span> ({sale.paymentStatus})
              </div>
            </div>

            <div className="space-y-1 text-right font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Warranty & Logistics Dispatch:
              </span>
              <div className="text-xs font-bold text-slate-800">{sale.warranty || "1-Year Comprehensive Warranty"}</div>
              <div className="text-[11px] text-sky-900 font-bold">
                {sale.serialNumbers ? `Asset Serials: ${sale.serialNumbers}` : "Serials: Tracked in Batch"}
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Dispatch Origin: Central Port & Kosgama Machinery Hub
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Machinery Specifications & Model</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price (LKR)</th>
                  <th className="px-4 py-3 text-right">Total Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-4 font-mono font-bold text-slate-900">{m.id || sale.machineId}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-sm text-slate-900">{m.brand} {m.model}</div>
                    <div className="text-xs text-slate-600">{m.name || "Industrial Sewing Machine Workstation"}</div>
                    {sale.serialNumbers && (
                      <div className="text-[11px] text-sky-900 font-mono font-semibold mt-1">
                        Tracked Serials: {sale.serialNumbers}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-sm font-mono">{qty} {m.unit || 'SETS'}</td>
                  <td className="px-4 py-4 text-right font-mono text-slate-800">{formatLKR(unitPrice)}</td>
                  <td className="px-4 py-4 text-right font-mono font-black text-sm text-slate-900">
                    {formatLKR(totalRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Words */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block mb-1">Amount in Words:</span>
                <div className="text-xs font-bold text-slate-800 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {numberToWordsLKR(totalRevenue)}
                </div>
              </div>

              {/* Payment Summary Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Settlement Terms & Status</div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                    sale.paymentStatus === 'PAID' || dueAmount === 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : sale.paymentStatus === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {sale.paymentStatus === 'PAID' || dueAmount === 0 
                      ? 'PAID IN FULL - SETTLED' 
                      : sale.paymentStatus === 'PARTIAL' 
                      ? 'ADVANCE / PARTIAL PAYMENT' 
                      : 'COMMERCIAL CREDIT'}
                  </span>
                  <span className="text-slate-600 text-[11px]">Via {sale.payment || 'Bank Wire / SLIPS'}</span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 font-mono text-xs text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-bold text-slate-900">{formatLKR(totalRevenue)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm border-b-2 border-slate-900 font-black">
                <span className="text-slate-900">Total Invoice Amount:</span>
                <span className="text-slate-900">{formatLKR(totalRevenue)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-700">
                <span className="text-slate-600 font-semibold">Advance / Paid Amount:</span>
                <span className="font-bold text-emerald-700">{formatLKR(paidAmount)}</span>
              </div>
              <div className={`flex justify-between py-1.5 text-sm font-black border-t border-slate-300 pt-1.5 ${dueAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                <span>{dueAmount > 0 ? 'Balance Due Payable:' : 'Net Balance Payable:'}</span>
                <span>{formatLKR(dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Seal & Signatures */}
          <div className="pt-10 flex justify-between items-end border-t border-slate-200">
            <div className="text-center w-48 space-y-2">
              <div className="h-10 border-b border-slate-400"></div>
              <div className="text-[10px] font-mono text-slate-600 uppercase font-bold">Client Acceptance / Stamp</div>
            </div>

            <div className="text-center">
              <OfficialSealStamp />
            </div>

            <div className="text-center w-56 space-y-2">
              <div className="h-10 border-b border-slate-400"></div>
              <div className="text-[10px] font-mono text-slate-600 uppercase font-bold">Authorized Consortium Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
