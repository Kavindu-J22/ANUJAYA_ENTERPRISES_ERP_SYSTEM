const mongoose = require('mongoose');

const PartnerPurchaseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  invoiceNo: { type: String, default: "" },
  date: { type: String, required: true },
  itemDescription: { type: String, required: true },
  category: { type: String, enum: ['Machine', 'Parts', 'Service'], default: 'Parts' },
  qty: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  remarks: { type: String, default: "" }
}, { _id: false });

const PartnerReturnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  slipNo: { type: String, default: "" },
  date: { type: String, required: true },
  itemDescription: { type: String, required: true },
  qty: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  reason: { type: String, default: "" }
}, { _id: false });

const PartnerPaymentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: "BOC Bank Transfer" },
  refNo: { type: String, default: "" }
}, { _id: false });

const LocalPartnerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "part_1"
  code: { type: String, required: true },             // e.g. "PTR-001"
  name: { type: String, required: true },
  contactPerson: { type: String, default: "Director" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  baseOpeningBalance: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
  purchases: [PartnerPurchaseSchema],
  returns: [PartnerReturnSchema],
  payments: [PartnerPaymentSchema]
}, { timestamps: true });

module.exports = mongoose.model('LocalPartner', LocalPartnerSchema);
