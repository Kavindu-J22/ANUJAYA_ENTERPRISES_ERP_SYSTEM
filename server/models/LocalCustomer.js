const mongoose = require('mongoose');

const RentalItemSchema = new mongoose.Schema({
  machineId: { type: String, required: true },
  machineCode: { type: String, default: "" },
  model: { type: String, required: true },
  serialNumber: { type: String, default: "" },
  rentRate: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Returned'], default: 'Active' },
  accessories: { type: String, default: "Complete Set" },
  startDate: { type: String, default: "2026-08-01" },
  isProratedFirstMonth: { type: Boolean, default: false },
  returnDetails: {
    slipNo: String,
    returnDate: String,
    condition: String,
    remarks: String,
    inspector: String,
    deductAmount: Number
  }
}, { _id: false });

const LocalCustomerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "c_1"
  code: { type: String, required: true },             // e.g. "CUST-001"
  name: { type: String, required: true },
  nic: { type: String, default: "REG-001" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },               // Customer email for automated payment alerts
  address: { type: String, default: "" },
  baseOpeningBalance: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
  billingCycleDay: { type: Number, default: 5 },       // 5th of each month is rental payment due day
  rentals: [RentalItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('LocalCustomer', LocalCustomerSchema);
