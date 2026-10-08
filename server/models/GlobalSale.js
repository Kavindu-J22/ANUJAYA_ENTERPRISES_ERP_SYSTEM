const mongoose = require('mongoose');

const GlobalSaleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "INV-1001"
  date: { type: String, required: true },
  machineId: { type: String, required: true },
  qty: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  frozenExchangeRate: { type: Number, default: 330 },
  frozenUnitCost: { type: Number, default: 0 },
  serialNumbers: { type: String, default: "" },
  customer: { type: String, default: "Apparel Manufacturer" },
  phone: { type: String, default: "" },
  region: { type: String, default: "Colombo / Western Province" },
  clientId: { type: String, default: "" },
  profitAllocation: { type: String, default: "CONSORTIUM_50_50" },
  payment: { type: String, default: "Bank Wire / SLIPS" },
  paymentStatus: { type: String, enum: ['PAID', 'PARTIAL', 'CREDIT'], default: 'PAID' },
  paidAmount: { type: Number, default: 0 },
  warranty: { type: String, default: "1-Year Comprehensive Warranty (Motor & PCB)" },
  cancelled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSale', GlobalSaleSchema);
