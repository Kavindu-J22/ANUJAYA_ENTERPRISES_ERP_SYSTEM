const mongoose = require('mongoose');

const AlertLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  alertType: { 
    type: String, 
    enum: ['7_DAYS', '3_DAYS', 'DUE_TODAY', 'OVERDUE'], 
    required: true 
  },
  daysDiff: { type: Number, required: true },
  dueDate: { type: String, required: true },
  amountDue: { type: Number, default: 0 },
  recipientEmail: { type: String, required: true },
  status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
  error: { type: String, default: null },
  sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AlertLog', AlertLogSchema);
