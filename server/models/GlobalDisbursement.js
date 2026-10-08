const mongoose = require('mongoose');

const GlobalDisbursementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "DIS-1"
  date: { type: String, required: true },
  partner: { type: String, enum: ['X', 'Y'], required: true }, // 'X' for Anujaya, 'Y' for Global Enterprises
  amount: { type: Number, required: true },
  memo: { type: String, default: "Capital Draw" }
}, { timestamps: true });

module.exports = mongoose.model('GlobalDisbursement', GlobalDisbursementSchema);
