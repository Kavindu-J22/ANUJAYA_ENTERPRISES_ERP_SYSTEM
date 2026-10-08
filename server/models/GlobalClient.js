const mongoose = require('mongoose');

const GlobalClientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  contactPerson: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  region: { type: String, default: 'Colombo / Western Province' },
  tinVat: { type: String, default: '' },
  creditLimit: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('GlobalClient', GlobalClientSchema);
