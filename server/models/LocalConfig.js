const mongoose = require('mongoose');

const LocalConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'local_config', unique: true },
  activeMonth: { type: String, default: "August 2026" },
  allMonths: { 
    type: [String], 
    default: ["August 2026", "September 2026", "October 2026", "November 2026"] 
  },
  company: {
    name: { type: String, default: "ANUJAYA ENTERPRISES" },
    regNo: { type: String, default: "PV/WP/78412" },
    taglineEn: { type: String, default: "INDUSTRIAL SEWING MACHINERY FLEET, AUTOMATION & MAINTENANCE" },
    taglineSi: { type: String, default: "කාර්මික මහන මැෂින් කුලියට දීම, නඩත්තුව සහ අලෙවිය" },
    addressEn: { type: String, default: "200/2B/1, Pahala Kosgama, Kosgama, Sri Lanka" },
    addressSi: { type: String, default: "200/2බී/1, පහළ කොස්ගම, කොස්ගම, ශ්‍රී ලංකාව" },
    hotline: { type: String, default: "077 412 7702" },
    email: { type: String, default: "anujayaenterprises.info@gmail.com" }
  },
  bank: {
    bankNameEn: { type: String, default: "Bank Of Ceylon" },
    accountName: { type: String, default: "Anujaya Enterprises" },
    accountNo: { type: String, default: "94459826" },
    branchEn: { type: String, default: "Ruwanwella Branch" }
  },
  alertSettings: {
    enabled: { type: Boolean, default: true },
    dueDayOfMonth: { type: Number, default: 5 },
    senderEmail: { type: String, default: "anujayaenterprises.info@gmail.com" },
    adminNotificationEmail: { type: String, default: "anujayaenterprises.info@gmail.com" },
    cronHour: { type: Number, default: 8 } // 08:00 AM daily
  }
}, { timestamps: true });

module.exports = mongoose.model('LocalConfig', LocalConfigSchema);
