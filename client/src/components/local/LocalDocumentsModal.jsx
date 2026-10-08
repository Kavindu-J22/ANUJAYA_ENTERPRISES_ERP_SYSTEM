import React, { useState, useEffect, useMemo } from 'react';
import { Printer, X, Languages, Edit3, CheckCircle2, Truck, FileText, Clock, AlertCircle } from 'lucide-react';
import { formatLKR, numberToWordsLKR } from '../../utils/formatters';
import { CompanyLogo, OfficialSealStamp, MockBarcode } from '../common/BrandAssets';
import { 
  MONTH_NAMES, 
  getYearMonth, 
  getDateYearMonth, 
  compareYM, 
  paymentBelongsToYM,
  calculateCustomerArrearsBreakdown,
  isMachineRentedInMonth
} from './LocalCustomerDirectory';

export function LocalDocumentsModal({
  docData,
  companyInfo,
  bankInfo,
  onClose
}) {
  if (!docData) return null;

  const [docLang, setDocLang] = useState('en'); // 'en' or 'si'
  const [isEditingAgreement, setIsEditingAgreement] = useState(false);

  const { 
    type, 
    customer, 
    payment, 
    returnedMachines, 
    meta, 
    quotation, 
    partner, 
    purchase, 
    returnItem, 
    balanceDue, 
    month, 
    payments = [], 
    arrearsData: passedArrearsData, 
    singleRental, 
    handoveredOnly 
  } = docData;

  const handlePrint = () => {
    window.print();
  };

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

  // Editable Agreement State
  const [agreementData, setAgreementData] = useState({
    lessorName: cInfo.name,
    lessorAddress: cInfo.addressEn,
    lesseeName: customer?.name || '',
    lesseeNic: customer?.nic || 'REG-CLIENT',
    lesseeAddress: customer?.address || 'Sri Lanka',
    lesseePhone: customer?.phone || '',
    commenceDate: new Date().toISOString().slice(0, 10),
    period: '6 Months (Renewable upon Mutual Consent)',
    paymentTerms: 'Payable in advance on or before the 5th day of every calendar month',
    securityDeposit: 'Refundable Security Deposit equivalent to 2 Months Hire',
    clauses: `1. The Lessee agrees to pay rent on or before the 5th day of every calendar month via bank remittance or authorized receipt.
2. Machinery remains the absolute property of Anujaya Enterprises. Subletting, relocation or assignment without written consent is strictly prohibited.
3. Lessor guarantees 4-hour breakdown response & replacement support across Western Province industrial apparel clusters.
4. Lessee is strictly responsible for routine lubrication, proper operator handling, and returning equipment in verified operational order.`
  });

  useEffect(() => {
    if (customer) {
      setAgreementData(prev => ({
        ...prev,
        lesseeName: customer.name || prev.lesseeName,
        lesseeNic: customer.nic || prev.lesseeNic,
        lesseeAddress: customer.address || prev.lesseeAddress,
        lesseePhone: customer.phone || prev.lesseePhone
      }));
    }
  }, [customer]);

  // Arrears Data calculation for Invoice & Statement
  const activeInvoiceMonth = month || "August 2026";
  const activeInvoiceYM = useMemo(() => getYearMonth(activeInvoiceMonth), [activeInvoiceMonth]);

  const arrearsData = useMemo(() => {
    if (passedArrearsData) return passedArrearsData;
    if (customer) {
      return calculateCustomerArrearsBreakdown(customer, payments, activeInvoiceMonth);
    }
    return { breakdown: [], carriedBase: 0, totalPreviousRent: 0, totalPreviousPaid: 0, netPreviousArrears: 0 };
  }, [passedArrearsData, customer, payments, activeInvoiceMonth]);

  // Filter rentals for Invoice: machines rented during activeInvoiceYM (excludes only if returned before this month)
  const invoiceRentals = useMemo(() => {
    if (!customer?.rentals) return [];
    return customer.rentals.filter(r => isMachineRentedInMonth(r, activeInvoiceYM));
  }, [customer, activeInvoiceYM]);

  const currentMonthRent = useMemo(() => {
    return invoiceRentals.reduce((sum, r) => sum + (Number(r.rentRate) || 0), 0);
  }, [invoiceRentals]);

  const currentMonthPaid = useMemo(() => {
    if (!customer) return 0;
    return (payments || []).filter(p => p.customerId === customer.id && paymentBelongsToYM(p, activeInvoiceYM))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [customer, payments, activeInvoiceYM]);

  const carriedBase = Number(arrearsData.carriedBase || 0);
  const totalPrevRent = Number(arrearsData.totalPreviousRent || 0);
  const totalPrevPaid = Number(arrearsData.totalPreviousPaid || 0);
  const netCycles = totalPrevRent - totalPrevPaid;
  const netPriorArrears = Number(arrearsData.netPreviousArrears ?? (carriedBase + netCycles));
  const totalBalanceDue = netPriorArrears + currentMonthRent - currentMonthPaid;

  // Delivery Note items
  const deliveryRentals = useMemo(() => {
    if (singleRental) return [singleRental];
    if (handoveredOnly) {
      return (customer?.rentals || []).filter(r => r.deliveryStatus === 'Handovered');
    }
    return (customer?.rentals || []).filter(r => r.status === 'Active');
  }, [customer, singleRental, handoveredOnly]);

  // Customer payments for Statement
  const customerPayments = useMemo(() => {
    if (!customer) return [];
    return (payments || []).filter(p => p.customerId === customer.id);
  }, [customer, payments]);

  const totalPaymentsReceivedAllTime = useMemo(() => {
    return customerPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [customerPayments]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 sm:my-8">
        
        {/* Controls Bar (No-Print) */}
        <div className="no-print bg-slate-900 text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="font-bold text-sky-400">Document Type:</span>
            <span className="font-black text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {type}
            </span>
            {customer && (
              <span className="text-slate-400">
                • {customer.name} ({customer.code})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {type === 'AGREEMENT' && (
              <button
                type="button"
                onClick={() => setIsEditingAgreement(!isEditingAgreement)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isEditingAgreement 
                    ? 'bg-amber-500 text-slate-950 font-black' 
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingAgreement ? 'Done Editing' : 'Edit Agreement Terms'}</span>
              </button>
            )}

            <button
              onClick={() => setDocLang(docLang === 'en' ? 'si' : 'en')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 transition flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{docLang === 'en' ? 'Switch to Sinhala' : 'Switch to English'}</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg"
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
        <div id="printable-document" className="p-4 sm:p-8 lg:p-12 space-y-6 text-slate-900 bg-white overflow-x-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <CompanyLogo className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
              <div>
                <h1 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-slate-900">
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

            <div className="text-left sm:text-right font-mono sm:ml-auto">
              <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                {type === 'STATEMENT' ? 'STATEMENT OF ACCOUNT' :
                 type === 'AGREEMENT' ? 'RENTAL LEASE AGREEMENT' :
                 type === 'DELIVERY' ? (singleRental ? 'INDIVIDUAL DELIVERY NOTE' : 'MASTER DELIVERY NOTE') :
                 type.replace(/_/g, ' ')}
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {type === 'RECEIPT' ? (payment?.refNo || payment?.id) :
                 type === 'QUOTATION' ? quotation?.quoteNo :
                 type === 'RETURN' ? (meta?.slipNo || 'RET-YARD') :
                 type === 'STATEMENT' ? `STMT-${customer?.code || 'CL'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}` :
                 type === 'AGREEMENT' ? `AGR-${customer?.code || 'CL'}-2026` :
                 type === 'DELIVERY' ? (singleRental ? `DN-${singleRental.machineCode}-${Date.now().toString().slice(-4)}` : `DN-${customer?.code || 'CL'}-${Date.now().toString().slice(-4)}`) :
                 type === 'INVOICE' ? `INV-${customer?.code || 'CL'}-${activeInvoiceMonth.replace(/\s+/g, '').toUpperCase()}` :
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Invoiced To:</span>
                  <div className="font-extrabold text-sm text-slate-900 font-sans">{customer.name}</div>
                  <div className="text-slate-600 font-mono">Code: {customer.code} • Contact: {customer.phone || 'No Phone'}</div>
                  <div className="text-slate-600">{customer.address || 'Sri Lanka'}</div>
                </div>
                <div className="sm:text-right font-mono">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Billing Period & Cycle:</span>
                  <div className="font-black text-sm text-sky-800">{activeInvoiceMonth}</div>
                  <div className="text-[11px] text-slate-600">Standard Payment Terms: Due by 5th</div>
                  <div className="text-[10px] text-emerald-700 font-bold">Western Province Fleet Consortium</div>
                </div>
              </div>

              {/* Machinery Fleet Table with Start Date */}
              <div>
                <div className="text-xs font-bold uppercase font-mono text-slate-700 mb-2">
                  Active Machinery Fleet Charges for {activeInvoiceMonth} ({invoiceRentals.length} Machines Invoiced)
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-300">
                    <tr>
                      <th className="p-3">Code</th>
                      <th className="p-3">Machinery Fleet Description</th>
                      <th className="p-3">Tracked Serial (SN)</th>
                      <th className="p-3">Rental Start Date</th>
                      <th className="p-3 text-right">Agreed Monthly Hire (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {invoiceRentals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-slate-500 font-sans">
                          No active machinery deployed for this billing cycle.
                        </td>
                      </tr>
                    ) : (
                      invoiceRentals.map(r => (
                        <tr key={r.machineId}>
                          <td className="p-3 font-bold text-sky-700">{r.machineCode || 'MCH'}</td>
                          <td className="p-3 font-sans font-bold text-slate-900">
                            {r.model}
                            <span className="text-[10px] text-slate-500 font-mono block">{r.accessories}</span>
                          </td>
                          <td className="p-3 text-slate-700">{r.serialNumber || 'Yard Batch'}</td>
                          <td className="p-3 text-slate-800 font-bold">{r.startDate || '2026-08-01'}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{formatLKR(r.rentRate)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>{/* overflow-x-auto */}
              </div>

              {/* Previous Months Arrears Breakdown Box (if any) */}
              {arrearsData.breakdown && arrearsData.breakdown.length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-amber-900 uppercase flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Previous Months Arrears Breakdown (Prior Billing Cycles)</span>
                    </span>
                    <span className="font-black text-amber-900">
                      Total Prior Arrears: {formatLKR(netPriorArrears)}
                    </span>
                  </div>
                  <table className="w-full text-left text-[11px] font-mono border-t border-amber-200">
                    <thead>
                      <tr className="text-amber-800 border-b border-amber-200 text-[10px] uppercase">
                        <th className="py-1">Cycle Month</th>
                        <th className="py-1 text-center">Active Machines</th>
                        <th className="py-1 text-right">Rent Accrued</th>
                        <th className="py-1 text-right">Paid</th>
                        <th className="py-1 text-right">Month Arrears</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {arrearsData.breakdown.map((b, idx) => (
                        <tr key={idx}>
                          <td className="py-1 font-bold text-amber-950">{b.monthLabel}</td>
                          <td className="py-1 text-center text-slate-600">{b.machineCount}</td>
                          <td className="py-1 text-right">{formatLKR(b.monthRent)}</td>
                          <td className="py-1 text-right text-sky-800">{formatLKR(b.monthPaid)}</td>
                          <td className={`py-1 text-right font-bold ${b.netArrears > 0 ? 'text-amber-900' : 'text-emerald-700'}`}>
                            {formatLKR(b.netArrears)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Instructions and Full Financial Calculation */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 font-mono flex-1 w-full sm:w-auto">
                  <div className="font-bold text-slate-900 uppercase">Bank Remittance Instructions:</div>
                  <div className="text-slate-700">{bInfo.bankNameEn} — {bInfo.accountName}</div>
                  <div className="font-bold text-blue-700">Account No: {bInfo.accountNo} ({bInfo.branchEn})</div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    * Please notify remittance via WhatsApp / SMS with Client Code {customer.code}
                  </div>
                </div>

                <div className="w-full sm:w-80 space-y-1.5 text-right font-mono text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {carriedBase > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                      <span>Carried Arrears (Base):</span>
                      <span className="font-bold text-slate-900">{formatLKR(carriedBase)}</span>
                    </div>
                  )}
                  {arrearsData.breakdown?.length > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                      <span>Prior Billing Cycles (Rent - Paid):</span>
                      <span className={`font-bold ${netCycles < 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {netCycles < 0 ? `- ${formatLKR(Math.abs(netCycles))}` : formatLKR(netCycles)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-200 font-bold bg-amber-50/70 px-1 rounded">
                    <span className="text-amber-900">Total Prior Arrears (Balance B/F):</span>
                    <span className={`${netPriorArrears > 0 ? 'text-amber-800' : netPriorArrears < 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {formatLKR(netPriorArrears)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Current Rent ({activeInvoiceMonth}):</span>
                    <span className="font-bold text-slate-900">{formatLKR(currentMonthRent)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-sky-700">
                    <span>Total Paid ({activeInvoiceMonth}):</span>
                    <span className="font-bold">- {formatLKR(currentMonthPaid)}</span>
                  </div>
                  <div className={`flex justify-between py-2 text-base font-black border-t-2 border-slate-900 ${totalBalanceDue > 0 ? 'text-rose-700' : totalBalanceDue < 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                    <span>{totalBalanceDue < 0 ? 'Advance / Excess Paid:' : 'Total Balance Due:'}</span>
                    <span>{totalBalanceDue < 0 ? `- ${formatLKR(Math.abs(totalBalanceDue))}` : formatLKR(totalBalanceDue)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. FULL FORMAL RENTAL AGREEMENT (EDITABLE) ================= */}
          {type === 'AGREEMENT' && customer && (
            <div className="space-y-5 text-xs">
              <div className="text-center pb-2 border-b border-slate-200 font-bold uppercase text-slate-800 tracking-wider">
                COMMERCIAL INDUSTRIAL MACHINERY HIRING & LEASE AGREEMENT
              </div>

              {isEditingAgreement && (
                <div className="no-print p-3 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-800 font-mono">
                  ℹ️ <strong>Agreement Edit Mode Active:</strong> You can edit any field, legal covenant, or term below. Changes reflect immediately in this document and when printed.
                </div>
              )}

              {/* Parties to Agreement */}
              <div className="leading-relaxed text-slate-800 space-y-2">
                <p>
                  This Commercial Lease Agreement is executed on <strong>{agreementData.commenceDate}</strong> by and between:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block">Lessor (Machinery Provider):</span>
                    {isEditingAgreement ? (
                      <input
                        type="text"
                        value={agreementData.lessorName}
                        onChange={(e) => setAgreementData({ ...agreementData, lessorName: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded font-bold text-slate-900 text-xs"
                      />
                    ) : (
                      <div className="font-bold text-slate-900">{agreementData.lessorName}</div>
                    )}
                    <div className="text-slate-600 text-[11px] mt-0.5">{agreementData.lessorAddress}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block">Lessee (Apparel Manufacturer):</span>
                    {isEditingAgreement ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={agreementData.lesseeName}
                          onChange={(e) => setAgreementData({ ...agreementData, lesseeName: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded font-bold text-slate-900 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="NIC / Reg #"
                          value={agreementData.lesseeNic}
                          onChange={(e) => setAgreementData({ ...agreementData, lesseeNic: e.target.value })}
                          className="w-full p-1 border border-slate-300 rounded text-slate-700 text-[11px]"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900">{agreementData.lesseeName}</div>
                        <div className="text-slate-600 text-[11px]">NIC / Factory Reg: {agreementData.lesseeNic}</div>
                      </div>
                    )}
                    <div className="text-slate-600 text-[11px] mt-0.5">{agreementData.lesseeAddress}</div>
                  </div>
                </div>
              </div>

              {/* Machinery Schedule Table */}
              <div>
                <span className="text-[11px] font-bold uppercase font-mono text-slate-700 block mb-1">
                  Schedule A: Machinery Fleet Allocation & Monthly Hire
                </span>
                <table className="w-full text-left text-xs border border-slate-300 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Model Description</th>
                      <th className="p-2.5">Serial # (SN)</th>
                      <th className="p-2.5">Commence Date</th>
                      <th className="p-2.5 text-right">Agreed Monthly Hire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {(customer.rentals || []).filter(r => r.status === 'Active').map(r => (
                      <tr key={r.machineId}>
                        <td className="p-2.5 font-bold text-sky-700">{r.machineCode}</td>
                        <td className="p-2.5 font-bold font-sans text-slate-900">{r.model}</td>
                        <td className="p-2.5">{r.serialNumber}</td>
                        <td className="p-2.5">{r.startDate || '2026-08-01'}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatLKR(r.rentRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-mono text-xs border-t border-slate-300">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right font-bold text-slate-700">Total Monthly Hire Commitment:</td>
                      <td className="p-2.5 text-right font-black text-emerald-800">
                        {formatLKR((customer.rentals || []).filter(r => r.status === 'Active').reduce((s, r) => s + (Number(r.rentRate) || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Agreement Duration & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[11px] p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-slate-500 uppercase font-bold block text-[10px]">Agreement Period:</span>
                  {isEditingAgreement ? (
                    <input
                      type="text"
                      value={agreementData.period}
                      onChange={(e) => setAgreementData({ ...agreementData, period: e.target.value })}
                      className="w-full p-1 border border-slate-300 rounded font-bold text-slate-900"
                    />
                  ) : (
                    <span className="font-bold text-slate-900">{agreementData.period}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold block text-[10px]">Payment Terms:</span>
                  {isEditingAgreement ? (
                    <input
                      type="text"
                      value={agreementData.paymentTerms}
                      onChange={(e) => setAgreementData({ ...agreementData, paymentTerms: e.target.value })}
                      className="w-full p-1 border border-slate-300 rounded font-bold text-slate-900"
                    />
                  ) : (
                    <span className="font-bold text-slate-900">{agreementData.paymentTerms}</span>
                  )}
                </div>
              </div>

              {/* Legal Clauses & Covenants */}
              <div className="space-y-1.5 text-[11px] text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans leading-relaxed">
                <div className="font-bold text-slate-900 uppercase font-mono text-xs mb-1">
                  Key Legal Clauses & Service Covenants:
                </div>
                {isEditingAgreement ? (
                  <textarea
                    rows={6}
                    value={agreementData.clauses}
                    onChange={(e) => setAgreementData({ ...agreementData, clauses: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 font-mono leading-normal"
                  />
                ) : (
                  <div className="whitespace-pre-line text-slate-800">
                    {agreementData.clauses}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= 3. EQUIPMENT DELIVERY NOTE ================= */}
          {type === 'DELIVERY' && customer && (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Delivery Destination (Lessee):</span>
                  <div className="font-bold text-slate-900 text-sm font-sans">{customer.name}</div>
                  <div className="text-slate-600">{customer.address} • Contact: {customer.phone}</div>
                  <div className="text-[10px] text-sky-700 font-bold mt-1">Client Code: {customer.code}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Transport & Dispatch Logistics:</span>
                  <div className="font-bold text-slate-900">Vehicle: WP-ND-4521 (Isuzu Lorry)</div>
                  <div className="text-slate-600">Origin: Kosgama Central Yard Fleet Hub</div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">
                    {singleRental ? 'Single Machine Dedicated Handover' : `Consortium Dispatch (${deliveryRentals.length} Units)`}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Machinery Description</th>
                    <th className="p-2.5">Asset Serial Number (SN)</th>
                    <th className="p-2.5">Delivered Date</th>
                    <th className="p-2.5">Delivery Status</th>
                    <th className="p-2.5">Included Attachments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {deliveryRentals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500 font-sans">
                        No handovered machinery records found for this delivery note.
                      </td>
                    </tr>
                  ) : (
                    deliveryRentals.map(r => (
                      <tr key={r.machineId}>
                        <td className="p-2.5 font-bold text-sky-700">{r.machineCode || 'MCH'}</td>
                        <td className="p-2.5 font-sans font-bold text-slate-900">{r.model}</td>
                        <td className="p-2.5 text-slate-800 font-bold">{r.serialNumber || 'Yard Batch'}</td>
                        <td className="p-2.5 text-emerald-700 font-bold">{r.deliveredDate || r.startDate || new Date().toISOString().slice(0, 10)}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase border border-emerald-300">
                            {r.deliveryStatus || 'Handovered'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 font-sans">{r.accessories || 'Complete Set'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>{/* overflow-x-auto */}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px] leading-relaxed">
                <strong>Handover Acknowledgment:</strong> All machinery units listed above have been inspected on-site by the Lessee's technical representative, tested for correct stitch execution, and accepted in fully operational condition together with stand, table, and specified drive systems.
              </div>
            </div>
          )}

          {/* ================= 4. COMPREHENSIVE RENTAL STATEMENT OF ACCOUNT ================= */}
          {type === 'STATEMENT' && customer && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Client Account:</span>
                  <div className="font-extrabold text-sm text-slate-900 font-sans">{customer.name}</div>
                  <div className="text-slate-600">Code: {customer.code} • Contact: {customer.phone}</div>
                  <div className="text-slate-600">{customer.address}</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Account Status:</span>
                  <div className="font-black text-sm text-emerald-700">
                    {customer.isArchived ? 'Closed Account' : 'Active Leasing Partner'}
                  </div>
                  <div className="text-slate-600 text-[11px]">As of: {new Date().toISOString().slice(0, 10)}</div>
                </div>
              </div>

              {/* Financial Position Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 font-mono text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block">Opening Balance</span>
                  <span className="font-bold text-amber-700 text-sm">{formatLKR(customer.baseOpeningBalance || 0)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block">Active Fleet</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {(customer.rentals || []).filter(r => r.status === 'Active').length} Units
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Payments Received</span>
                  <span className="font-bold text-sky-700 text-sm">{formatLKR(totalPaymentsReceivedAllTime)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block">Net Balance Due</span>
                  <span className="font-black text-rose-700 text-sm">{formatLKR(customer.currentBalance || 0)}</span>
                </div>
              </div>

              {/* Allocated Machinery Fleet */}
              <div>
                <span className="text-[11px] font-bold uppercase font-mono text-slate-700 block mb-1">
                  1. Current Machinery Fleet Allocation
                </span>
                <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Model Description</th>
                      <th className="p-2.5">Serial #</th>
                      <th className="p-2.5">Start Date</th>
                      <th className="p-2.5 text-center">Delivery Status</th>
                      <th className="p-2.5 text-right">Monthly Hire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {(customer.rentals || []).map(r => (
                      <tr key={r.machineId}>
                        <td className="p-2.5 font-bold text-sky-700">{r.machineCode}</td>
                        <td className="p-2.5 font-sans font-bold text-slate-900">{r.model}</td>
                        <td className="p-2.5">{r.serialNumber}</td>
                        <td className="p-2.5">{r.startDate || '2026-08-01'}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.deliveryStatus === 'Handovered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.deliveryStatus || 'Ongoing'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatLKR(r.rentRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>{/* overflow-x-auto fleet */}
              </div>

              {/* Payment Remittance History */}
              <div>
                <span className="text-[11px] font-bold uppercase font-mono text-slate-700 block mb-1">
                  2. Payment & Remittance Receipts Ledger
                </span>
                <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">Payment Date</th>
                      <th className="p-2.5">Receipt #</th>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Target Month</th>
                      <th className="p-2.5 text-right">Amount Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {customerPayments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-slate-500 font-sans">
                          No payment receipts recorded yet for this client.
                        </td>
                      </tr>
                    ) : (
                      customerPayments.map(p => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-bold text-slate-900">{p.date}</td>
                          <td className="p-2.5 text-sky-700">{p.refNo || p.id}</td>
                          <td className="p-2.5 text-slate-600">{p.method}</td>
                          <td className="p-2.5 text-slate-800">{p.month}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-700">{formatLKR(p.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>{/* overflow-x-auto payments */}
              </div>

              {/* Bank Remittance Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-xs">
                <div>
                  <span className="font-bold text-slate-800 uppercase block text-[10px]">Bank Remittance Account:</span>
                  <span className="text-slate-700">{bInfo.bankNameEn} — A/C: {bInfo.accountNo} ({bInfo.branchEn})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Net Balance Due:</span>
                  <span className="font-black text-rose-700 text-base">{formatLKR(customer.currentBalance || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. OFFICIAL PAYMENT RECEIPT ================= */}
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

          {/* ================= 6. YARD RETURN NOTE ================= */}
          {type === 'RETURN' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 font-mono text-xs">
                <div className="font-bold text-amber-900 uppercase">Machinery Return & Fleet De-Hire Authorization</div>
                <div className="text-amber-800 mt-1">
                  Client: <strong>{customer?.name}</strong> • Return Slip: <strong>{meta?.slipNo}</strong>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-left text-xs">
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
              </div>{/* overflow-x-auto return */}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                <div>Inspection Yard Condition: <strong className="text-slate-900">{meta?.condition || 'Operational'}</strong></div>
                <div>Inspector Notes: <span className="text-slate-700">{meta?.remarks || 'Motor, table and stand verified intact'}</span></div>
              </div>
            </div>
          )}

          {/* ================= 7. INDUSTRIAL RENTAL QUOTATION ================= */}
          {type === 'QUOTATION' && quotation && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex flex-col sm:flex-row justify-between gap-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Quotation For:</span>
                  <div className="font-bold text-slate-900 text-sm font-sans">{quotation.customerName || "Garment Manufacturer"}</div>
                  <div className="text-slate-600">{quotation.address} • {quotation.phone}</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Quote Validity:</span>
                  <div className="font-bold text-slate-900">{quotation.validDays || 14} Days</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-left text-xs">
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
              </div>{/* overflow-x-auto quotation */}
            </div>
          )}

          {/* ================= 8. PARTNER STATEMENT ================= */}
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

          {/* ================= 9, 10. PARTNER INVOICE / RETURN / VOUCHER ================= */}
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

          {/* Signatures & Seal Footer (Common across all documents) */}
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
