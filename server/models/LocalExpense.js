const mongoose = require('mongoose');

const LocalExpenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "e1"
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Salary', 'Operations', 'Maintenance', 'Transport', 'Other'], default: 'Operations' }
}, { timestamps: true });

module.exports = mongoose.model('LocalExpense', LocalExpenseSchema);
