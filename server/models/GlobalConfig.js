const mongoose = require('mongoose');

const GlobalConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'global_config', unique: true },
  usdRate: { type: Number, default: 330.00 },
  lang: { type: String, default: 'en' }
}, { timestamps: true });

module.exports = mongoose.model('GlobalConfig', GlobalConfigSchema);
