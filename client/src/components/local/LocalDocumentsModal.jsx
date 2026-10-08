import React, { useState } from 'react';
import { Printer, X, Languages } from 'lucide-react';
import { formatLKR, numberToWordsLKR } from '../../utils/formatters';
import { CompanyLogo, OfficialSealStamp, MockBarcode } from '../common/BrandAssets';

export function LocalDocumentsModal({
  docData,
  companyInfo,
  bankInfo,
  onClose
}) {
  if (!docData) return null;

  const [docLang, setDocLang] = useState('en'); // 'en' or 'si'

  const handlePrint = () => {
    window.print();
  };

  const { type, customer, payment, returnedMachines, meta, quotation, partner, purchase, returnItem, balanceDue, totalPurchased, totalReturned, totalPaid } = docData;

  const cInfo = companyInfo || {
    name: "ANUJAYA ENTERPRISES",
    regNo: "PV/WP/78412",
    taglineEn: "INDUSTRIAL SEWING MACHINERY FLEET, AUTOMATION & MAINTENANCE",
    taglineSi: "කාර්මික මහන මැෂින් කුලියට දීම, නඩත්තුව සහ අලෙවිය",
    addressEn: "200/2B/1, Pahala Kosgama, Kosgama, Sri Lanka",
    addressSi: "200/2බී/1, පහළ කොස්ගම, කොස්ගම, ශ්‍රී ලංකාව",
    hotline: "077 412 7702",
    email: "anujayaenterprises.info@gmail.com"
  };

  const bInfo = bankInfo || {
    bankNameEn: "Bank Of Ceylon",
    accountName: "Anujaya Enterprises",
    accountNo: "94459826",
    branchEn: "Ruwanwella Branch"
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        
        {/* Controls (No-Print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="font-bold text-sky-400">Document Type:</span>
            <span className="font-black text-white">{type}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDocLang(docLang === 'en' ? 'si' : 'en')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 transition flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{docLang === 'en' ? 'Switch to Sinhala' : 'Switch to English'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Document</span>
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
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <CompanyLogo className="w-16 h-16" />
              <div>
                <h1 className="font-display font-black text-2xl uppercase tracking-tight text-slate-900">
                  {cInfo.name}
                </h1>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {docLang === 'si' ? cInfo.taglineSi : cInfo.taglineEn}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  {docLang === 'si' ? cInfo.addressSi : cInfo.addressEn}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Reg No: {cInfo.regNo} • Hotline: {cInfo.hotline} • Email: {cInfo.email}
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                {type.replace(/_/g, ' ')}
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {type === 'RECEIPT' ? (payment?.refNo || payment?.id) :
                 type === 'QUOTATION' ? quotation?.quoteNo :
                 type === 'RETURN' ? (meta?.slipNo || 'RET-YARD') :
                 type === 'PARTNER_INVOICE' ? purchase?.invoiceNo :
                 type === 'PARTNER_RETURN' ? returnItem?.slipNo :
                 type === 'PARTNER_PAYMENT_VOUCHER' ? (payment?.refNo || 'VOUCH') :
                 `${customer?.code || 'DOC'}-${Date.now().toString().slice(-5)}`}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Date: {payment?.date || meta?.returnDate || quotation?.date || new Date().toISOString().slice(0, 10)}
              </div>
              <div className="mt-2">
                <MockBarcode code={customer?.code || "AE-2026"} />
              </div>
            </div>
          </div>

          {/* ================= 1. MONTHLY RENT INVOICE ================= */}
          {type === 'INVOICE' && customer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Client Account:</span>
                  <div className="font-extrabold text-sm text-slate-900">{customer.name}</div>
                  <div className="text-slate-600 font-mono">Code: {customer.code} • Contact: {customer.phone}</div>
                  <div className="text-slate-600">{customer.address}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Billing Notice:</span>
                  <div className="font-bold text-slate-800">Monthly Fleet Hire Settlement</div>
                  <div className="text-[11px] text-slate-600">Cycle: Scheduled Due by 5th</div>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-300">
                  <tr>
                    <th className="p-3">Machinery Fleet Description</th>
                    <th className="p-3">Tracked Serial (SN)</th>
                    <th className="p-3 text-right">Agreed Monthly Hire (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {(customer.rentals || []).filter(r => r.status === 'Active').map(r => (
                    <tr key={r.machineId}>
                      <td className="p-3 font-sans font-bold text-slate-900">{r.model}</td>
                      <td className="p-3 text-slate-700">{r.serialNumber || 'Yard Tracked'}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatLKR(r.rentRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-start pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 font-mono flex-1 mr-6">
                  <div className="font-bold text-slate-900 uppercase">Bank Remittance Instructions:</div>
                  <div className="text-slate-700">{bInfo.bankNameEn} — {bInfo.accountName}</div>
                  <div className="font-bold text-blue-700">Account No: {bInfo.accountNo} ({bInfo.branchEn})</div>
                </div>
                <div className="w-64 space-y-1 text-right font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Carried Arrears:</span>
                    <span className="font-bold text-slate-900">{formatLKR(customer.arrears || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Current Rent:</span>
                    <span className="font-bold text-slate-900">
                      {formatLKR((customer.rentals || []).filter(r => r.status === 'Active').reduce((s, r) => s + (Number(r.rentRate) || 0), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 text-sm font-black border-b-2 border-slate-900 text-emerald-700">
                    <span>Total Balance Due:</span>
                    <span>{formatLKR(customer.currentBalance || (customer.arrears || 0) + (customer.rentals || []).filter(r => r.status === 'Active').reduce((s, r) => s + (Number(r.rentRate) || 0), 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. FORMAL RENTAL AGREEMENT ================= */}
          {type === 'AGREEMENT' && customer && (
            <div className="space-y-4 text-xs">
              <div className="text-center pb-2 border-b border-slate-200 font-bold uppercase text-slate-700">
                INDUSTRIAL SEWING MACHINERY HIRING & LEASE AGREEMENT
              </div>
              <p className="leading-relaxed text-slate-800">
                This Agreement is entered into between <strong>ANUJAYA ENTERPRISES</strong> (Kosgama Central Base) as the Lessor, and <strong>{customer.name}</strong> (NIC/Reg: {customer.nic || 'REG-CLIENT'}) situated at {customer.address} as the Lessee.
              </p>

              <div className="border border-slate-300 rounded-xl overflow-hidden my-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">Model Description</th>
                      <th className="p-2.5">Serial #</th>
                      <th className="p-2.5 text-right">Monthly Hire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {(customer.rentals || []).filter(r => r.status === 'Active').map(r => (
                      <tr key={r.machineId}>
                        <td className="p-2.5 font-bold font-sans text-slate-900">{r.model}</td>
                        <td className="p-2.5">{r.serialNumber}</td>
                        <td className="p-2.5 text-right font-bold">{formatLKR(r.rentRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 uppercase">Key Legal Clauses & Service Covenants:</div>
                <div>1. The Lessee agrees to pay rent on or before the 5th day of every calendar month.</div>
                <div>2. Machinery remains the absolute property of Anujaya Enterprises. No subletting allowed.</div>
                <div>3. Lessor guarantees 4-hour breakdown replacement technical support across Western Province.</div>
                <div>4. Lessee is responsible for routine machine oiling and daily operator care.</div>
              </div>
            </div>
          )}

          {/* ================= 3. EQUIPMENT DELIVERY NOTE ================= */}
          {type === 'DELIVERY' && customer && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Delivery Destination:</span>
                  <div className="font-bold text-slate-900 text-sm font-sans">{customer.name}</div>
                  <div className="text-slate-600">{customer.address} • Contact: {customer.phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Transport Logistics:</span>
                  <div className="font-bold text-slate-900">Vehicle: WP-ND-4521 (Isuzu Lorry)</div>
                  <div className="text-slate-600">Yard Dispatch: Kosgama Central Bay 1</div>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Machinery Description</th>
                    <th className="p-2.5">Asset Serial Number</th>
                    <th className="p-2.5">Included Attachments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {(customer.rentals || []).filter(r => r.status === 'Active').map(r => (
                    <tr key={r.machineId}>
                      <td className="p-2.5 font-bold text-sky-700">{r.machineCode}</td>
                      <td className="p-2.5 font-sans font-bold text-slate-900">{r.model}</td>
                      <td className="p-2.5">{r.serialNumber}</td>
                      <td className="p-2.5 text-slate-600 font-sans">{r.accessories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= 4. OFFICIAL PAYMENT RECEIPT ================= */}
          {type === 'RECEIPT' && payment && (
            <div className="space-y-4 text-xs">
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-2">
                <div className="text-xs uppercase font-bold text-emerald-800 font-mono tracking-wider">
                  Amount Received with Thanks
                </div>
                <div className="text-3xl font-black font-mono text-emerald-700">
                  {formatLKR(payment.amount)}
                </div>
                <div className="text-xs italic text-emerald-900 font-serif">
                  ({numberToWordsLKR(payment.amount)})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Received From:</span>
                  <span className="font-bold text-slate-900 font-sans text-sm">{payment.customerName || customer?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Payment Method:</span>
                  <span className="font-bold text-slate-900">{payment.method} ({payment.refNo})</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. YARD RETURN NOTE ================= */}
          {type === 'RETURN' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 font-mono text-xs">
                <div className="font-bold text-amber-900 uppercase">Machinery Return & Fleet De-Hire Authorization</div>
                <div className="text-amber-800 mt-1">
                  Client: <strong>{customer?.name}</strong> • Return Slip: <strong>{meta?.slipNo}</strong>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Model Description</th>
                    <th className="p-2.5">Serial (SN)</th>
                    <th className="p-2.5 text-right">Relieved Monthly Hire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {(returnedMachines || []).map((m, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold font-sans text-slate-900">{m.model}</td>
                      <td className="p-2.5">{m.serialNumber}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{formatLKR(m.rentRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                <div>Inspection Yard Condition: <strong className="text-slate-900">{meta?.condition || 'Operational'}</strong></div>
                <div>Inspector Notes: <span className="text-slate-700">{meta?.remarks || 'Motor, table and stand verified intact'}</span></div>
              </div>
            </div>
          )}

          {/* ================= 6. INDUSTRIAL RENTAL QUOTATION ================= */}
          {type === 'QUOTATION' && quotation && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Quotation For:</span>
                  <div className="font-bold text-slate-900 text-sm font-sans">{quotation.customerName || "Garment Manufacturer"}</div>
                  <div className="text-slate-600">{quotation.address} • {quotation.phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Quote Validity:</span>
                  <div className="font-bold text-slate-900">{quotation.validDays || 14} Days</div>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-300">
                  <tr>
                    <th className="p-3">Model Description</th>
                    <th className="p-3">Motor Spec</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rent / Unit</th>
                    <th className="p-3 text-right">Monthly Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {(quotation.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold font-sans text-slate-900">{it.description}</td>
                      <td className="p-3 text-slate-600">{it.motorSpec}</td>
                      <td className="p-3 text-center font-bold">{it.qty}</td>
                      <td className="p-3 text-right">{formatLKR(it.rate)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatLKR(it.qty * it.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= 7. PARTNER STATEMENT ================= */}
          {type === 'PARTNER_STATEMENT' && partner && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Partner Entity:</span>
                  <div className="font-bold text-slate-900 text-sm font-sans">{partner.name}</div>
                  <div className="text-slate-600">{partner.address} • Contact: {partner.contactPerson}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Balance Payable:</span>
                  <div className="text-lg font-black text-amber-700">{formatLKR(balanceDue)}</div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 8, 9, 10. PARTNER INVOICE / RETURN / VOUCHER ================= */}
          {(type === 'PARTNER_INVOICE' || type === 'PARTNER_RETURN' || type === 'PARTNER_PAYMENT_VOUCHER') && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Partner Account:</span>
                  <div className="font-bold text-slate-900 text-sm font-sans">{partner?.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Amount:</span>
                  <div className="text-xl font-black text-slate-900">
                    {formatLKR(purchase?.total || returnItem?.total || payment?.amount)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Signatures & Seal Footer (Common across all 10 documents) */}
          <div className="pt-10 flex justify-between items-end border-t border-slate-200">
            <div className="text-center w-48 space-y-2">
              <div className="h-10 border-b border-slate-400"></div>
              <div className="text-[10px] font-mono text-slate-600 uppercase font-bold">
                {type === 'AGREEMENT' ? 'Lessee Acceptance' : 'Client Signature'}
              </div>
            </div>

            <div className="text-center">
              <OfficialSealStamp />
            </div>

            <div className="text-center w-56 space-y-2">
              <div className="h-10 border-b border-slate-400"></div>
              <div className="text-[10px] font-mono text-slate-600 uppercase font-bold">
                Kosgama Central Base Authorization
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
