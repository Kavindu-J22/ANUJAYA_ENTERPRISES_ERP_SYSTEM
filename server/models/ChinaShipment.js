const mongoose = require('mongoose');

const ChinaShipmentItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sku: { type: String, required: true },
  brand: { type: String, default: "JUKI" },
  model: { type: String, required: true },
  name: { type: String, default: "" },
  category: { type: String, default: "Sewing Machinery" },
  unit: { type: String, default: "SETS" },
  qtyOrdered: { type: Number, required: true, default: 0 },
  qtyShipped: { type: Number, default: 0 },
  qtyReceived: { type: Number, default: 0 },
  unitFobUsd: { type: Number, default: 0 },
  totalFobUsd: { type: Number, default: 0 },
  allocatedLandedCostLkr: { type: Number, default: 0 },
  globalMachineId: { type: String, default: "" }, // Link to GlobalMachine id (e.g. M-01)
  stockIntakeStatus: { 
    type: String, 
    enum: ['pending', 'partially_received', 'received'], 
    default: 'pending' 
  }
}, { _id: false });

const PartnerAgreementSchema = new mongoose.Schema({
  partnerId: { type: String, required: true },
  name: { type: String, required: true }, // e.g. "Global Apparel Solutions" or "Our Company"
  role: { type: String, default: "Joint Funding Partner" },
  agreedRatio: { type: Number, required: true, default: 0.50 }, // 0.50 = 50%
  targetLiabilityLkr: { type: Number, default: 0 },
  notes: { type: String, default: "" }
}, { _id: false });

const PartnerReceiptSchema = new mongoose.Schema({
  id: { type: String, required: true },
  receiptId: { type: String, required: true }, // e.g. "GLB-001"
  date: { type: String, required: true }, // YYYY-MM-DD
  partnerName: { type: String, required: true },
  paymentMethod: { type: String, default: "Bank Transfer" }, // Bank Transfer / Cheque / Cash
  reference: { type: String, default: "" },
  amountLkr: { type: Number, required: true, default: 0 },
  allocationStatus: { type: String, default: "Allocated" }, // Allocated / Unallocated / Partial
  notes: { type: String, default: "" },
  status: { type: String, enum: ['Confirmed', 'Pending', 'Needs Review'], default: 'Confirmed' }
}, { _id: false, timestamps: true });

const IntermediarySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }, // e.g. "Ashen", "Friend 2 (Korea)"
  country: { type: String, default: "Overseas" },
  operatingCurrency: { type: String, default: "RMB" }, // RMB / USD / AED
  contact: { type: String, default: "" },
  notes: { type: String, default: "" }
}, { _id: false });

const IntermediaryAdvanceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  intermediaryId: { type: String, required: true },
  intermediaryName: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  description: { type: String, default: "Cash advance for foreign supplier settlement" },
  bankReference: { type: String, default: "" }, // e.g. "BOC - Commercial Bank"
  amountLkr: { type: Number, required: true, default: 0 },
  notes: { type: String, default: "" }
}, { _id: false, timestamps: true });

const SupplierPaymentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  trxId: { type: String, required: true }, // e.g. "TRX-001"
  paymentDate: { type: String, required: true }, // YYYY-MM-DD
  channel: { 
    type: String, 
    enum: ['Intermediary Remittance', 'Direct Bank TT', 'Other Channel'], 
    default: 'Intermediary Remittance' 
  },
  intermediaryId: { type: String, default: "" },
  intermediaryName: { type: String, default: "" }, // e.g. "Ashen", "Korea", "Direct TT"
  currency: { type: String, default: "RMB" }, // RMB / USD / AED
  foreignAmount: { type: Number, default: 0 },
  appliedFxRate: { type: Number, default: 0 },
  settledLkr: { type: Number, required: true, default: 0 }, // foreignAmount * appliedFxRate or fixed LKR
  sourceOfFunds: { type: String, default: "Joint Partnership" }, // Global Apparel / Our Company / Joint
  reference: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ['Draft', 'Initiated', 'Pending Confirmation', 'Confirmed', 'Reversed'], 
    default: 'Confirmed' 
  },
  isNeedsReview: { type: Boolean, default: false },
  reviewNote: { type: String, default: "" },
  notes: { type: String, default: "" }
}, { _id: false, timestamps: true });

const CustomsExpenseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'Customs Duty & CESS',
      'Port Clearing Charges',
      'Shipping & Ocean Freight',
      'Marine Cargo Insurance',
      'Bank LC & TT Processing Fees',
      'Local Container Transport to Yard',
      'Inspection & Demurrage Fees',
      'Other Import Expenses'
    ],
    default: 'Customs Duty & CESS' 
  },
  description: { type: String, default: "" },
  estimatedLkr: { type: Number, default: 0 },
  actualLkr: { type: Number, default: 0 },
  paymentDate: { type: String, default: "" },
  paidBy: { type: String, default: "Our Company" }, // Our Company / Global Apparel / Joint
  reference: { type: String, default: "" },
  status: { type: String, enum: ['Estimated', 'Paid', 'Pending'], default: 'Estimated' }
}, { _id: false, timestamps: true });

const GoodsReceiptSchema = new mongoose.Schema({
  id: { type: String, required: true },
  receiptDate: { type: String, required: true },
  receivedBy: { type: String, default: "Yard Manager" },
  warehouseLocation: { type: String, default: "Kosgama Central Bay 1-6" },
  totalUnitsReceived: { type: Number, default: 0 },
  itemsReceived: [{
    sku: String,
    model: String,
    qty: Number,
    globalMachineId: String
  }],
  intakeConfirmed: { type: Boolean, default: true },
  notes: { type: String, default: "" }
}, { _id: false, timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: String, required: true },
  action: { type: String, required: true },
  user: { type: String, default: "Admin" },
  details: { type: String, default: "" }
}, { _id: false });

const ChinaShipmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "CS-001"
  shipmentNo: { type: String, required: true }, // e.g. "2025(SLLK)823"
  supplierName: { type: String, default: "China Juki Industrial Machinery Export Corp." },
  supplierCountry: { type: String, default: "China" },
  invoiceNo: { type: String, required: true },
  purchaseReference: { type: String, default: "" },
  shipmentDate: { type: String, default: "" },
  estimatedArrivalDate: { type: String, default: "" },
  actualArrivalDate: { type: String, default: "" },
  origin: { type: String, default: "Ningbo / Taizhou Port, China" },
  destination: { type: String, default: "Colombo Port / Kosgama Central Yard, Sri Lanka" },
  shippingCarrier: { type: String, default: "Maersk / CMA CGM" },
  containerNo: { type: String, default: "" },
  blNumber: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ['draft', 'approved', 'in_transit', 'arrived', 'customs_clearing', 'received', 'closed'], 
    default: 'received' 
  },
  
  // Financial Budgeting & FOB
  totalUnits: { type: Number, default: 472 },
  fobUsd: { type: Number, default: 206316.96 },
  budgetUsdRate: { type: Number, default: 330.00 },
  budgetCustomsLkr: { type: Number, default: 4991500.00 },
  budgetTotalLiabilityLkr: { type: Number, default: 73076096.80 },
  
  // Workflows A to F Embedded Collections
  items: [ChinaShipmentItemSchema],
  partners: [PartnerAgreementSchema],
  partnerReceipts: [PartnerReceiptSchema],
  intermediaries: [IntermediarySchema],
  intermediaryAdvances: [IntermediaryAdvanceSchema],
  supplierPayments: [SupplierPaymentSchema],
  customsExpenses: [CustomsExpenseSchema],
  goodsReceipts: [GoodsReceiptSchema],
  auditLogs: [AuditLogSchema],

  // Flags & Metadata
  isHistorical: { type: Boolean, default: false },
  historicalSourceWorkbook: { type: String, default: "China.xlsx" },
  historicalReviewFlags: [{
    recordId: String,
    entityType: String,
    warning: String,
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' }
  }],
  notes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('ChinaShipment', ChinaShipmentSchema);
