const mongoose = require('mongoose');

const GlobalMachineSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "M-01"
  brand: { type: String, required: true },
  model: { type: String, required: true },
  name: { type: String, default: "" },
  unit: { type: String, default: "SETS" },
  initialStock: { type: Number, default: 0 },
  usdPrice: { type: Number, default: 0 },
  taxLKR: { type: Number, default: 0 },
  wholesalePrice: { type: Number, default: 0 },
  retailPrice: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('GlobalMachine', GlobalMachineSchema);
