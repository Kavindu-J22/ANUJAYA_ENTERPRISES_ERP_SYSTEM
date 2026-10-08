const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const {
  GLOBAL_MACHINES_BASELINE,
  LOCAL_MACHINES_BASELINE,
  LOCAL_CUSTOMERS_BASELINE,
  LOCAL_PARTNERS_BASELINE,
  LOCAL_EXPENSES_BASELINE,
  LOCAL_PAYMENTS_BASELINE
} = require('./seeds');

const GlobalMachine = require('../models/GlobalMachine');
const GlobalSale = require('../models/GlobalSale');
const GlobalDisbursement = require('../models/GlobalDisbursement');
const GlobalConfig = require('../models/GlobalConfig');

const LocalMachine = require('../models/LocalMachine');
const LocalCustomer = require('../models/LocalCustomer');
const LocalPayment = require('../models/LocalPayment');
const LocalPartner = require('../models/LocalPartner');
const LocalExpense = require('../models/LocalExpense');
const LocalConfig = require('../models/LocalConfig');
const AlertLog = require('../models/AlertLog');

const STORE_FILE = path.join(__dirname, 'persistent-store.json');

// Initialize local persistent fallback structure
function getInitialStore() {
  return {
    globalMachines: JSON.parse(JSON.stringify(GLOBAL_MACHINES_BASELINE)),
    globalSales: [],
    globalDisbursements: [],
    globalConfig: { usdRate: 330.00, lang: 'en' },
    localMachines: JSON.parse(JSON.stringify(LOCAL_MACHINES_BASELINE)),
    localCustomers: JSON.parse(JSON.stringify(LOCAL_CUSTOMERS_BASELINE)),
    localPayments: JSON.parse(JSON.stringify(LOCAL_PAYMENTS_BASELINE)),
    localPartners: JSON.parse(JSON.stringify(LOCAL_PARTNERS_BASELINE)),
    localExpenses: JSON.parse(JSON.stringify(LOCAL_EXPENSES_BASELINE)),
    localConfig: {
      activeMonth: "August 2026",
      allMonths: ["August 2026", "September 2026", "October 2026", "November 2026"],
      company: {
        name: "ANUJAYA ENTERPRISES",
        regNo: "PV/WP/78412",
        taglineEn: "INDUSTRIAL SEWING MACHINERY FLEET, AUTOMATION & MAINTENANCE",
        taglineSi: "කාර්මික මහන මැෂින් කුලියට දීම, නඩත්තුව සහ අලෙවිය",
        addressEn: "200/2B/1, Pahala Kosgama, Kosgama, Sri Lanka",
        addressSi: "200/2බී/1, පහළ කොස්ගම, කොස්ගම, ශ්‍රී ලංකාව",
        hotline: "077 412 7702",
        email: "anujayaenterprises.info@gmail.com"
      },
      bank: {
        bankNameEn: "Bank Of Ceylon",
        accountName: "Anujaya Enterprises",
        accountNo: "94459826",
        branchEn: "Ruwanwella Branch"
      },
      alertSettings: {
        enabled: true,
        dueDayOfMonth: 5,
        senderEmail: "anujayaenterprises.info@gmail.com",
        adminNotificationEmail: "anujayaenterprises.info@gmail.com",
        cronHour: 8
      }
    },
    alertLogs: []
  };
}

let inMemoryStore = null;

function loadLocalStore() {
  if (inMemoryStore) return inMemoryStore;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      inMemoryStore = JSON.parse(raw);
    } else {
      inMemoryStore = getInitialStore();
      saveLocalStore();
    }
  } catch (err) {
    console.error("Store read error, initializing default:", err.message);
    inMemoryStore = getInitialStore();
    saveLocalStore();
  }
  return inMemoryStore;
}

function saveLocalStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error("Store save error:", err.message);
  }
}

function isDbActive() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// Seed MongoDB if connected and empty
async function seedMongoIfEmpty() {
  if (!isDbActive()) return;
  try {
    const gCount = await GlobalMachine.countDocuments();
    if (gCount === 0) {
      console.log("Seeding MongoDB with Global Machines...");
      await GlobalMachine.insertMany(GLOBAL_MACHINES_BASELINE);
    }

    const lmCount = await LocalMachine.countDocuments();
    if (lmCount === 0) {
      console.log("Seeding MongoDB with Local Yard Machinery Master...");
      await LocalMachine.insertMany(LOCAL_MACHINES_BASELINE);
    }

    const cCount = await LocalCustomer.countDocuments();
    if (cCount === 0) {
      console.log("Seeding MongoDB with Local Customers...");
      await LocalCustomer.insertMany(LOCAL_CUSTOMERS_BASELINE);
    }

    const pCount = await LocalPartner.countDocuments();
    if (pCount === 0) {
      console.log("Seeding MongoDB with Local Partners...");
      await LocalPartner.insertMany(LOCAL_PARTNERS_BASELINE);
    }

    const eCount = await LocalExpense.countDocuments();
    if (eCount === 0) {
      console.log("Seeding MongoDB with Local Expenses...");
      await LocalExpense.insertMany(LOCAL_EXPENSES_BASELINE);
    }

    const payCount = await LocalPayment.countDocuments();
    if (payCount === 0) {
      console.log("Seeding MongoDB with Local Payments...");
      await LocalPayment.insertMany(LOCAL_PAYMENTS_BASELINE);
    }

    const cfgCount = await GlobalConfig.countDocuments();
    if (cfgCount === 0) {
      await GlobalConfig.create({ usdRate: 330.00, lang: 'en' });
    }

    const lcfgCount = await LocalConfig.countDocuments();
    if (lcfgCount === 0) {
      await LocalConfig.create(getInitialStore().localConfig);
    }
    console.log("MongoDB verification/seeding completed.");
  } catch (err) {
    console.warn("MongoDB seed warning:", err.message);
  }
}

// Call seed check whenever Mongoose connects
mongoose.connection.on('connected', () => {
  seedMongoIfEmpty();
});

// ================= GLOBAL REPOSITORY =================
const store = {
  // Global Machines
  async getGlobalMachines() {
    if (isDbActive()) {
      return await GlobalMachine.find().sort({ id: 1 }).lean();
    }
    return loadLocalStore().globalMachines;
  },

  async addGlobalMachine(data) {
    if (!data.id) {
      const s = loadLocalStore();
      const existingNums = (s.globalMachines || []).map(m => {
        const match = String(m.id || '').match(/M-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxNum = existingNums.length > 0 ? Math.max(...existingNums, 0) : 0;
      data.id = `M-${String(maxNum + 1).padStart(2, '0')}`;
    }
    if (isDbActive()) {
      try {
        const created = await GlobalMachine.create(data);
        const s = loadLocalStore();
        s.globalMachines.push(created.toObject());
        saveLocalStore();
        return created;
      } catch (err) {
        console.warn("Mongo addGlobalMachine failed, using local store:", err.message);
      }
    }
    const s = loadLocalStore();
    // Prevent duplicate SKU
    const existingIdx = s.globalMachines.findIndex(x => x.id === data.id);
    if (existingIdx !== -1) {
      s.globalMachines[existingIdx] = { ...s.globalMachines[existingIdx], ...data };
    } else {
      s.globalMachines.push(data);
    }
    saveLocalStore();
    return data;
  },

  async updateGlobalMachine(id, data) {
    if (isDbActive()) {
      try {
        const updated = await GlobalMachine.findOneAndUpdate({ id }, data, { returnDocument: 'after', new: true }).lean();
        const s = loadLocalStore();
        const idx = s.globalMachines.findIndex(x => x.id === id);
        if (idx !== -1) s.globalMachines[idx] = { ...s.globalMachines[idx], ...data, id };
        saveLocalStore();
        if (updated) return updated;
      } catch (err) {
        console.warn("Mongo updateGlobalMachine failed, using local store:", err.message);
      }
    }
    const s = loadLocalStore();
    const idx = s.globalMachines.findIndex(x => x.id === id);
    if (idx !== -1) {
      s.globalMachines[idx] = { ...s.globalMachines[idx], ...data, id };
      saveLocalStore();
      return s.globalMachines[idx];
    }
    return null;
  },

  async deleteGlobalMachine(id) {
    if (isDbActive()) {
      try {
        await GlobalMachine.findOneAndDelete({ id });
      } catch (err) {
        console.warn("Mongo deleteGlobalMachine failed:", err.message);
      }
    }
    const s = loadLocalStore();
    s.globalMachines = s.globalMachines.filter(x => x.id !== id);
    saveLocalStore();
    return true;
  },

  async resetGlobalBaseline() {
    if (isDbActive()) {
      try {
        await GlobalMachine.deleteMany({});
        await GlobalMachine.insertMany(GLOBAL_MACHINES_BASELINE);
        await GlobalSale.deleteMany({});
        await GlobalDisbursement.deleteMany({});
        await GlobalConfig.findOneAndUpdate({}, { usdRate: 330.00, lang: 'en' }, { upsert: true });
      } catch (err) {
        console.warn("Mongo resetGlobalBaseline failed:", err.message);
      }
    }
    const s = loadLocalStore();
    s.globalMachines = JSON.parse(JSON.stringify(GLOBAL_MACHINES_BASELINE));
    s.globalSales = [];
    s.globalDisbursements = [];
    s.globalConfig = { usdRate: 330.00, lang: 'en' };
    saveLocalStore();
    return true;
  },

  // Global Sales
  async getGlobalSales() {
    if (isDbActive()) {
      try {
        return await GlobalSale.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.warn("Mongo getGlobalSales failed, falling back:", err.message);
      }
    }
    return loadLocalStore().globalSales;
  },

  async addGlobalSale(sale) {
    if (!sale.id) {
      sale.id = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    if (isDbActive()) {
      try {
        const created = await GlobalSale.create(sale);
        const s = loadLocalStore();
        s.globalSales.unshift(created.toObject());
        saveLocalStore();
        return created;
      } catch (err) {
        console.warn("Mongo addGlobalSale failed, using local store:", err.message);
      }
    }
    const s = loadLocalStore();
    s.globalSales.unshift(sale);
    saveLocalStore();
    return sale;
  },

  async updateGlobalSale(id, data) {
    if (isDbActive()) {
      try {
        const updated = await GlobalSale.findOneAndUpdate({ id }, data, { returnDocument: 'after', new: true }).lean();
        const s = loadLocalStore();
        const idx = s.globalSales.findIndex(x => x.id === id);
        if (idx !== -1) s.globalSales[idx] = { ...s.globalSales[idx], ...data, id };
        saveLocalStore();
        if (updated) return updated;
      } catch (err) {
        console.warn("Mongo updateGlobalSale failed, using local store:", err.message);
      }
    }
    const s = loadLocalStore();
    const idx = s.globalSales.findIndex(x => x.id === id);
    if (idx !== -1) {
      s.globalSales[idx] = { ...s.globalSales[idx], ...data, id };
      saveLocalStore();
      return s.globalSales[idx];
    }
    return null;
  },

  // Global Disbursements
  async getGlobalDisbursements() {
    if (isDbActive()) {
      return await GlobalDisbursement.find().sort({ createdAt: -1 }).lean();
    }
    return loadLocalStore().globalDisbursements;
  },

  async addGlobalDisbursement(disb) {
    if (isDbActive()) {
      const created = await GlobalDisbursement.create(disb);
      const s = loadLocalStore();
      s.globalDisbursements.unshift(created.toObject());
      saveLocalStore();
      return created;
    }
    const s = loadLocalStore();
    s.globalDisbursements.unshift(disb);
    saveLocalStore();
    return disb;
  },

  // Global Config
  async getGlobalConfig() {
    if (isDbActive()) {
      let cfg = await GlobalConfig.findOne().lean();
      if (!cfg) {
        cfg = await GlobalConfig.create({ usdRate: 330.00, lang: 'en' });
      }
      return cfg;
    }
    return loadLocalStore().globalConfig;
  },

  async updateGlobalConfig(data) {
    if (isDbActive()) {
      const updated = await GlobalConfig.findOneAndUpdate({}, data, { new: true, upsert: true }).lean();
      const s = loadLocalStore();
      s.globalConfig = { ...s.globalConfig, ...data };
      saveLocalStore();
      return updated;
    }
    const s = loadLocalStore();
    s.globalConfig = { ...s.globalConfig, ...data };
    saveLocalStore();
    return s.globalConfig;
  },

  // ================= LOCAL RENTAL WAREHOUSE =================
  async getLocalMachines() {
    if (isDbActive()) {
      return await LocalMachine.find().sort({ id: 1 }).lean();
    }
    return loadLocalStore().localMachines;
  },

  async addLocalMachine(data) {
    if (isDbActive()) {
      const created = await LocalMachine.create(data);
      const s = loadLocalStore();
      s.localMachines.push(created.toObject());
      saveLocalStore();
      return created;
    }
    const s = loadLocalStore();
    s.localMachines.push(data);
    saveLocalStore();
    return data;
  },

  async updateLocalMachine(id, data) {
    if (isDbActive()) {
      const updated = await LocalMachine.findOneAndUpdate({ id }, data, { new: true }).lean();
      const s = loadLocalStore();
      const idx = s.localMachines.findIndex(x => x.id === id);
      if (idx !== -1) s.localMachines[idx] = { ...s.localMachines[idx], ...data };
      saveLocalStore();
      return updated;
    }
    const s = loadLocalStore();
    const idx = s.localMachines.findIndex(x => x.id === id);
    if (idx !== -1) {
      s.localMachines[idx] = { ...s.localMachines[idx], ...data };
      saveLocalStore();
      return s.localMachines[idx];
    }
    return null;
  },

  async deleteLocalMachine(id) {
    if (isDbActive()) {
      await LocalMachine.findOneAndDelete({ id });
    }
    const s = loadLocalStore();
    s.localMachines = s.localMachines.filter(x => x.id !== id);
    saveLocalStore();
    return true;
  },

  // ================= LOCAL CUSTOMERS =================
  async getLocalCustomers() {
    if (isDbActive()) {
      return await LocalCustomer.find().sort({ createdAt: 1 }).lean();
    }
    return loadLocalStore().localCustomers;
  },

  async addLocalCustomer(cust) {
    if (isDbActive()) {
      const created = await LocalCustomer.create(cust);
      const s = loadLocalStore();
      s.localCustomers.unshift(created.toObject());
      saveLocalStore();
      return created;
    }
    const s = loadLocalStore();
    s.localCustomers.unshift(cust);
    saveLocalStore();
    return cust;
  },

  async updateLocalCustomer(id, data) {
    if (isDbActive()) {
      const updated = await LocalCustomer.findOneAndUpdate({ id }, data, { new: true }).lean();
      const s = loadLocalStore();
      const idx = s.localCustomers.findIndex(x => x.id === id);
      if (idx !== -1) s.localCustomers[idx] = { ...s.localCustomers[idx], ...data };
      saveLocalStore();
      return updated;
    }
    const s = loadLocalStore();
    const idx = s.localCustomers.findIndex(x => x.id === id);
    if (idx !== -1) {
      s.localCustomers[idx] = { ...s.localCustomers[idx], ...data };
      saveLocalStore();
      return s.localCustomers[idx];
    }
    return null;
  },

  async deleteLocalCustomer(id) {
    if (isDbActive()) {
      await LocalCustomer.findOneAndDelete({ id });
    }
    const s = loadLocalStore();
    s.localCustomers = s.localCustomers.filter(x => x.id !== id);
    saveLocalStore();
    return true;
  },

  // ================= LOCAL PAYMENTS =================
  async getLocalPayments() {
    if (isDbActive()) {
      return await LocalPayment.find().sort({ createdAt: -1 }).lean();
    }
    return loadLocalStore().localPayments;
  },

  async addLocalPayment(pay) {
    if (isDbActive()) {
      const created = await LocalPayment.create(pay);
      const s = loadLocalStore();
      s.localPayments.unshift(created.toObject());
      saveLocalStore();
      return created;
    }
    const s = loadLocalStore();
    s.localPayments.unshift(pay);
    saveLocalStore();
    return pay;
  },

  async updateLocalPayment(id, data) {
    if (isDbActive()) {
      const updated = await LocalPayment.findOneAndUpdate({ id }, data, { new: true }).lean();
      const s = loadLocalStore();
      const idx = s.localPayments.findIndex(x => x.id === id);
      if (idx !== -1) s.localPayments[idx] = { ...s.localPayments[idx], ...data };
      saveLocalStore();
      return updated;
    }
    const s = loadLocalStore();
    const idx = s.localPayments.findIndex(x => x.id === id);
    if (idx !== -1) {
      s.localPayments[idx] = { ...s.localPayments[idx], ...data };
      saveLocalStore();
      return s.localPayments[idx];
    }
    return null;
  },

  async deleteLocalPayment(id) {
    if (isDbActive()) {
      await LocalPayment.findOneAndDelete({ id });
    }
    const s = loadLocalStore();
    s.localPayments = s.localPayments.filter(x => x.id !== id);
    saveLocalStore();
    return true;
  },

  // ================= LOCAL PARTNERS =================
  async getLocalPartners() {
    if (isDbActive()) {
      return await LocalPartner.find().sort({ createdAt: 1 }).lean();
    }
    return loadLocalStore().localPartners;
  },

  async addLocalPartner(partner) {
    if (isDbActive()) {
      const created = await LocalPartner.create(partner);
      const s = loadLocalStore();
      s.localPartners.unshift(created.toObject());
      saveLocalStore();
      return created;
    }
    const s = loadLocalStore();
    s.localPartners.unshift(partner);
    saveLocalStore();
    return partner;
  },

  async updateLocalPartner(id, data) {
    if (isDbActive()) {
      const updated = await LocalPartner.findOneAndUpdate({ id }, data, { new: true }).lean();
      const s = loadLocalStore();
      const idx = s.localPartners.findIndex(x => x.id === id);
      if (idx !== -1) s.localPartners[idx] = { ...s.localPartners[idx], ...data };
      saveLocalStore();
      return updated;
    }
    const s = loadLocalStore();
    const idx = s.localPartners.findIndex(x => x.id === id);
    if (idx !== -1) {
      s.localPartners[idx] = { ...s.localPartners[idx], ...data };
      saveLocalStore();
      return s.localPartners[idx];
    }
    return null;
  },

  async deleteLocalPartner(id) {
    if (isDbActive()) {
      await LocalPartner.findOneAndDelete({ id });
    }
    const s = loadLocalStore();
    s.localPartners = s.localPartners.filter(x => x.id !== id);
    saveLocalStore();
    return true;
  },

  // ================= LOCAL EXPENSES =================
  async getLocalExpenses() {
    if (isDbActive()) {
      return await LocalExpense.find().sort({ createdAt: -1 }).lean();
    }
    return loadLocalStore().localExpenses;
  },

  async addLocalExpense(exp) {
    if (isDbActive()) {
      const created = await LocalExpense.create(exp);
      const s = loadLocalStore();
      s.localExpenses.unshift(created.toObject());
      saveLocalStore();
      return created;
    }
    const s = loadLocalStore();
    s.localExpenses.unshift(exp);
    saveLocalStore();
    return exp;
  },

  async updateLocalExpense(id, data) {
    if (isDbActive()) {
      const updated = await LocalExpense.findOneAndUpdate({ id }, data, { new: true }).lean();
      const s = loadLocalStore();
      const idx = s.localExpenses.findIndex(x => x.id === id);
      if (idx !== -1) s.localExpenses[idx] = { ...s.localExpenses[idx], ...data };
      saveLocalStore();
      return updated;
    }
    const s = loadLocalStore();
    const idx = s.localExpenses.findIndex(x => x.id === id);
    if (idx !== -1) {
      s.localExpenses[idx] = { ...s.localExpenses[idx], ...data };
      saveLocalStore();
      return s.localExpenses[idx];
    }
    return null;
  },

  async deleteLocalExpense(id) {
    if (isDbActive()) {
      await LocalExpense.findOneAndDelete({ id });
    }
    const s = loadLocalStore();
    s.localExpenses = s.localExpenses.filter(x => x.id !== id);
    saveLocalStore();
    return true;
  },

  // ================= LOCAL CONFIG =================
  async getLocalConfig() {
    if (isDbActive()) {
      let cfg = await LocalConfig.findOne().lean();
      if (!cfg) {
        cfg = await LocalConfig.create(getInitialStore().localConfig);
      }
      return cfg;
    }
    return loadLocalStore().localConfig;
  },

  async updateLocalConfig(data) {
    if (isDbActive()) {
      const updated = await LocalConfig.findOneAndUpdate({}, data, { new: true, upsert: true }).lean();
      const s = loadLocalStore();
      s.localConfig = { ...s.localConfig, ...data };
      saveLocalStore();
      return updated;
    }
    const s = loadLocalStore();
    s.localConfig = { ...s.localConfig, ...data };
    saveLocalStore();
    return s.localConfig;
  },

  // ================= ALERT LOGS =================
  async getAlertLogs(limit = 50) {
    if (isDbActive()) {
      return await AlertLog.find().sort({ sentAt: -1 }).limit(limit).lean();
    }
    return (loadLocalStore().alertLogs || []).slice(0, limit);
  },

  async addAlertLog(log) {
    if (isDbActive()) {
      const created = await AlertLog.create(log);
      const s = loadLocalStore();
      if (!s.alertLogs) s.alertLogs = [];
      s.alertLogs.unshift(created.toObject());
      saveLocalStore();
      return created;
    }
    const s = loadLocalStore();
    if (!s.alertLogs) s.alertLogs = [];
    s.alertLogs.unshift(log);
    saveLocalStore();
    return log;
  }
};

module.exports = store;
