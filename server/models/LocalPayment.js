const mongoose = require('mongoose');

const LocalPaymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "pay_1"
  month: { type: String, required: true },            // e.g. "August 2026"
  customerId: { type: String, required: true },
  customerName: { type: String, default: "" },
  amount: { type: Number, required: true },
  date: { type: String, required: true },             // "YYYY-MM-DD"
  method: { type: String, default: "BOC Ruwanwella Transfer" },
  refNo: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('LocalPayment', LocalPaymentSchema);
