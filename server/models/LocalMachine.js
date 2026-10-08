const mongoose = require('mongoose');

const LocalMachineSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "LYM-01"
  machineCode: { type: String, required: true },       // e.g. "JK-8700"
  brand: { type: String, required: true },             // e.g. "JUKI"
  model: { type: String, required: true },             // e.g. "DDL-8700 High-Speed Lockstitch"
  category: { 
    type: String, 
    enum: ['Single Needle Lockstitch', 'Overlock', 'Flatbed / Coverstitch', 'Buttonhole & Specialty', 'Motors & Drives', 'Heavy Duty / Other'],
    default: 'Single Needle Lockstitch' 
  },
  serialNumbers: { type: String, default: "" },
  totalYardStock: { type: Number, default: 1 },
  standardMonthlyRent: { type: Number, default: 4500 },
  acquisitionCost: { type: Number, default: 35000 },
  motorSpec: { type: String, default: "550W Energy Saving Servo Motor" },
  accessories: { type: String, default: "Complete Stand, Table, Servo Motor" },
  condition: { type: String, enum: ['Brand New', 'Excellent', 'Operational', 'Under Repair'], default: 'Operational' },
  yardLocation: { type: String, default: "Kosgama Central Yard Bay 1" },
  notes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('LocalMachine', LocalMachineSchema);
