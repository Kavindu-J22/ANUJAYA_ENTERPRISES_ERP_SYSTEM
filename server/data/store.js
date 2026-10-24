const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const {
  GLOBAL_MACHINES_BASELINE,
  GLOBAL_CLIENTS_BASELINE,
} = require('./seeds');

const GlobalMachine = require('../models/GlobalMachine');
const GlobalClient = require('../models/GlobalClient');
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
const ChinaShipment = require('../models/ChinaShipment');
const { calculateShipmentFinancialSummary } = require('../services/chinaImportService');

const STORE_FILE = path.join(__dirname, 'persistent-store.json');

// ─────────────────────────────────────────────────────────────
// IMPORTANT DESIGN NOTE:
// When MongoDB Atlas is CONNECTED (isDbActive() === true) every
// operation goes DIRECTLY to MongoDB. The local persistent-store
// is NEVER read or written. This prevents "ghost" data from a
// stale JSON file overriding Atlas, and prevents deleted records
// from reappearing.
//
// The local store is a pure emergency fallback used ONLY when
// MongoDB is unreachable (e.g. network outage). In production
// on Render, MongoDB Atlas is always connected.
// ─────────────────────────────────────────────────────────────

function isDbActive() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

function toIdQuery(id) {
  if (!id) return { id };
  const strId = String(id);
  if (mongoose.Types.ObjectId.isValid(strId)) {
    return { $or: [{ id: strId }, { _id: strId }] };
  }
  return { id: strId };
}

// ── Emergency Fallback Local Store (only used when MongoDB is DOWN) ──

function getEmptyFallbackStore() {
  return {
    globalMachines: JSON.parse(JSON.stringify(GLOBAL_MACHINES_BASELINE)),
    globalClients: JSON.parse(JSON.stringify(GLOBAL_CLIENTS_BASELINE)),
    globalSales: [],
    globalDisbursements: [],
    globalConfig: { usdRate: 330.00, lang: 'en' },
    chinaShipments: [],
    localMachines: [],
    localCustomers: [],
    localPayments: [],
    localPartners: [],
    localExpenses: [],
    localConfig: {
      activeMonth: "2026-10",
      allMonths: ["2026-10"],
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

let inMemoryFallback = null;

function loadFallbackStore() {
  if (inMemoryFallback) return inMemoryFallback;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Only use the fallback store if it has the right shape; otherwise reset
      if (parsed && typeof parsed === 'object') {
        inMemoryFallback = parsed;
        // Ensure required keys exist
        if (!inMemoryFallback.localConfig) inMemoryFallback.localConfig = getEmptyFallbackStore().localConfig;
        if (!inMemoryFallback.globalConfig) inMemoryFallback.globalConfig = { usdRate: 330.00, lang: 'en' };
        return inMemoryFallback;
      }
    }
  } catch (err) {
    console.warn('[FallbackStore] Read error:', err.message);
  }
  inMemoryFallback = getEmptyFallbackStore();
  saveFallbackStore();
  return inMemoryFallback;
}

function saveFallbackStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryFallback, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[FallbackStore] Write error:', err.message);
  }
}

// Seed MongoDB only if a collection is completely empty (first-ever startup)
async function seedMongoIfEmpty() {
  if (!isDbActive()) return;
  try {
    const gCount = await GlobalMachine.countDocuments();
    if (gCount === 0) {
      console.log('[Seed] Seeding GlobalMachines baseline...');
      await GlobalMachine.insertMany(GLOBAL_MACHINES_BASELINE);
    }

    const gcCount = await GlobalClient.countDocuments();
    if (gcCount === 0) {
      console.log('[Seed] Seeding GlobalClients baseline...');
      await GlobalClient.insertMany(GLOBAL_CLIENTS_BASELINE);
    }

    const cfgCount = await GlobalConfig.countDocuments();
    if (cfgCount === 0) {
      await GlobalConfig.create({ usdRate: 330.00, lang: 'en' });
    }

    const lcfgCount = await LocalConfig.countDocuments();
    if (lcfgCount === 0) {
      await LocalConfig.create(getEmptyFallbackStore().localConfig);
    }

    // DO NOT seed LocalMachines, LocalCustomers, LocalPayments, LocalPartners,
    // LocalExpenses, or ChinaShipments — these must be entered by the user.
    console.log('[Seed] MongoDB verification completed. Fresh system ready.');
  } catch (err) {
    console.warn('[Seed] Warning:', err.message);
  }
}

// Trigger seed check when Mongoose first connects
mongoose.connection.on('connected', () => {
  seedMongoIfEmpty();
});

// ===============================================================
// STORE METHODS
// Rule: when isDbActive() === true  →  MongoDB ONLY (no local store)
//       when isDbActive() === false →  local fallback store ONLY
// ===============================================================
const store = {

  // ═══════════════ GLOBAL MACHINES ═══════════════
  async getGlobalMachines() {
    if (isDbActive()) {
      try { return await GlobalMachine.find().sort({ id: 1 }).lean(); }
      catch (err) { console.warn('[Store] getGlobalMachines DB error:', err.message); throw err; }
    }
    return loadFallbackStore().globalMachines || [];
  },

  async addGlobalMachine(data) {
    if (!data.id) {
      const machines = await this.getGlobalMachines();
      const maxNum = machines.reduce((max, m) => {
        const match = String(m.id || '').match(/M-(\d+)/i);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      data.id = `M-${String(maxNum + 1).padStart(2, '0')}`;
    }
    if (isDbActive()) {
      try { return (await GlobalMachine.create(data)).toObject(); }
      catch (err) { console.warn('[Store] addGlobalMachine DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalMachines = s.globalMachines || [];
    const idx = s.globalMachines.findIndex(x => x.id === data.id);
    if (idx !== -1) s.globalMachines[idx] = { ...s.globalMachines[idx], ...data };
    else s.globalMachines.push(data);
    saveFallbackStore();
    return data;
  },

  async updateGlobalMachine(id, data) {
    if (isDbActive()) {
      try {
        const updated = await GlobalMachine.findOneAndUpdate(toIdQuery(id), data, { new: true, runValidators: false }).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateGlobalMachine DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    const idx = (s.globalMachines || []).findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.globalMachines[idx] = { ...s.globalMachines[idx], ...data, id }; saveFallbackStore(); return s.globalMachines[idx]; }
    return null;
  },

  async deleteGlobalMachine(id) {
    if (isDbActive()) {
      try { await GlobalMachine.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteGlobalMachine DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalMachines = (s.globalMachines || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
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
        return true;
      } catch (err) { console.warn('[Store] resetGlobalBaseline DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalMachines = JSON.parse(JSON.stringify(GLOBAL_MACHINES_BASELINE));
    s.globalClients = JSON.parse(JSON.stringify(GLOBAL_CLIENTS_BASELINE));
    s.globalSales = [];
    s.globalDisbursements = [];
    s.globalConfig = { usdRate: 330.00, lang: 'en' };
    saveFallbackStore();
    return true;
  },

  // ═══════════════ GLOBAL CLIENTS ═══════════════
  async getGlobalClients() {
    if (isDbActive()) {
      try { return await GlobalClient.find().sort({ code: 1 }).lean(); }
      catch (err) { console.warn('[Store] getGlobalClients DB error:', err.message); throw err; }
    }
    return loadFallbackStore().globalClients || [];
  },

  async addGlobalClient(data) {
    if (!data.id) data.id = `gc_${Date.now()}`;
    if (!data.code) {
      const clients = await this.getGlobalClients();
      const maxNum = clients.reduce((max, c) => {
        const match = String(c.code || '').match(/GC-(\d+)/i);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      data.code = `GC-${String(maxNum + 1).padStart(2, '0')}`;
    }
    if (isDbActive()) {
      try { return (await GlobalClient.create(data)).toObject(); }
      catch (err) { console.warn('[Store] addGlobalClient DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalClients = s.globalClients || [];
    s.globalClients.push(data);
    saveFallbackStore();
    return data;
  },

  async updateGlobalClient(id, data) {
    if (isDbActive()) {
      try {
        const updated = await GlobalClient.findOneAndUpdate(toIdQuery(id), data, { new: true, runValidators: false }).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateGlobalClient DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalClients = s.globalClients || [];
    const idx = s.globalClients.findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.globalClients[idx] = { ...s.globalClients[idx], ...data, id }; saveFallbackStore(); return s.globalClients[idx]; }
    return null;
  },

  async deleteGlobalClient(id) {
    if (isDbActive()) {
      try { await GlobalClient.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteGlobalClient DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalClients = (s.globalClients || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
    return true;
  },

  // ═══════════════ GLOBAL SALES ═══════════════
  async getGlobalSales() {
    if (isDbActive()) {
      try { return await GlobalSale.find().sort({ createdAt: -1 }).lean(); }
      catch (err) { console.warn('[Store] getGlobalSales DB error:', err.message); throw err; }
    }
    return loadFallbackStore().globalSales || [];
  },

  async addGlobalSale(sale) {
    if (!sale.id) sale.id = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    if (isDbActive()) {
      try { return (await GlobalSale.create(sale)).toObject(); }
      catch (err) { console.warn('[Store] addGlobalSale DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalSales = s.globalSales || [];
    s.globalSales.unshift(sale);
    saveFallbackStore();
    return sale;
  },

  async updateGlobalSale(id, data) {
    if (isDbActive()) {
      try {
        const updated = await GlobalSale.findOneAndUpdate(toIdQuery(id), data, { new: true, runValidators: false }).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateGlobalSale DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    const idx = (s.globalSales || []).findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.globalSales[idx] = { ...s.globalSales[idx], ...data, id }; saveFallbackStore(); return s.globalSales[idx]; }
    return null;
  },

  async deleteGlobalSale(id) {
    if (isDbActive()) {
      try { await GlobalSale.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteGlobalSale DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalSales = (s.globalSales || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
    return true;
  },

  // ═══════════════ GLOBAL DISBURSEMENTS ═══════════════
  async getGlobalDisbursements() {
    if (isDbActive()) {
      try { return await GlobalDisbursement.find().sort({ createdAt: -1 }).lean(); }
      catch (err) { console.warn('[Store] getGlobalDisbursements DB error:', err.message); throw err; }
    }
    return loadFallbackStore().globalDisbursements || [];
  },

  async addGlobalDisbursement(disb) {
    if (!disb.id) disb.id = `DIS-${Date.now()}`;
    if (isDbActive()) {
      try { return (await GlobalDisbursement.create(disb)).toObject(); }
      catch (err) { console.warn('[Store] addGlobalDisbursement DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalDisbursements = s.globalDisbursements || [];
    s.globalDisbursements.unshift(disb);
    saveFallbackStore();
    return disb;
  },

  async updateGlobalDisbursement(id, data) {
    if (isDbActive()) {
      try {
        const updated = await GlobalDisbursement.findOneAndUpdate(toIdQuery(id), data, { new: true, runValidators: false }).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateGlobalDisbursement DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    const idx = (s.globalDisbursements || []).findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.globalDisbursements[idx] = { ...s.globalDisbursements[idx], ...data, id }; saveFallbackStore(); return s.globalDisbursements[idx]; }
    return null;
  },

  async deleteGlobalDisbursement(id) {
    if (isDbActive()) {
      try { await GlobalDisbursement.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteGlobalDisbursement DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalDisbursements = (s.globalDisbursements || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
    return true;
  },

  // ═══════════════ GLOBAL CONFIG ═══════════════
  async getGlobalConfig() {
    if (isDbActive()) {
      try {
        let cfg = await GlobalConfig.findOne().lean();
        if (!cfg) cfg = (await GlobalConfig.create({ usdRate: 330.00, lang: 'en' })).toObject();
        return cfg;
      } catch (err) { console.warn('[Store] getGlobalConfig DB error:', err.message); }
    }
    return loadFallbackStore().globalConfig || { usdRate: 330.00, lang: 'en' };
  },

  async updateGlobalConfig(data) {
    if (isDbActive()) {
      try {
        return await GlobalConfig.findOneAndUpdate({}, data, { new: true, upsert: true, runValidators: false }).lean();
      } catch (err) { console.warn('[Store] updateGlobalConfig DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.globalConfig = { ...s.globalConfig, ...data };
    saveFallbackStore();
    return s.globalConfig;
  },

  // ═══════════════ LOCAL MACHINES ═══════════════
  async getLocalMachines() {
    if (isDbActive()) {
      try { return await LocalMachine.find().sort({ id: 1 }).lean(); }
      catch (err) { console.warn('[Store] getLocalMachines DB error:', err.message); throw err; }
    }
    return loadFallbackStore().localMachines || [];
  },

  async addLocalMachine(data) {
    if (!data.id) {
      const machines = await this.getLocalMachines();
      const maxNum = machines.reduce((max, m) => {
        const match = String(m.id || '').match(/LYM-(\d+)/i);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      data.id = `LYM-${String(maxNum + 1).padStart(2, '0')}`;
    }
    if (!data.machineCode) data.machineCode = `YRD-${Date.now().toString().slice(-4)}`;
    if (isDbActive()) {
      try { return (await LocalMachine.create(data)).toObject(); }
      catch (err) { console.warn('[Store] addLocalMachine DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localMachines = s.localMachines || [];
    s.localMachines.unshift(data);
    saveFallbackStore();
    return data;
  },

  async updateLocalMachine(id, data) {
    if (isDbActive()) {
      try {
        const updated = await LocalMachine.findOneAndUpdate(
          toIdQuery(id), { $set: data }, { new: true, runValidators: false }
        ).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateLocalMachine DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    const idx = (s.localMachines || []).findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.localMachines[idx] = { ...s.localMachines[idx], ...data, id }; saveFallbackStore(); return s.localMachines[idx]; }
    return data;
  },

  async deleteLocalMachine(id) {
    if (isDbActive()) {
      try { await LocalMachine.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteLocalMachine DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localMachines = (s.localMachines || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
    return true;
  },

  // ═══════════════ LOCAL CUSTOMERS ═══════════════
  async getLocalCustomers() {
    if (isDbActive()) {
      try { return await LocalCustomer.find().sort({ createdAt: 1 }).lean(); }
      catch (err) { console.warn('[Store] getLocalCustomers DB error:', err.message); throw err; }
    }
    return loadFallbackStore().localCustomers || [];
  },

  async addLocalCustomer(cust) {
    if (!cust.id) cust.id = 'c_' + Date.now();
    if (!cust.code) {
      const customers = await this.getLocalCustomers();
      cust.code = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    }
    if (!Array.isArray(cust.rentals)) cust.rentals = [];
    if (isDbActive()) {
      try { return (await LocalCustomer.create(cust)).toObject(); }
      catch (err) { console.warn('[Store] addLocalCustomer DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localCustomers = s.localCustomers || [];
    s.localCustomers.unshift(cust);
    saveFallbackStore();
    return cust;
  },

  async updateLocalCustomer(id, data) {
    if (isDbActive()) {
      try {
        const updated = await LocalCustomer.findOneAndUpdate(
          toIdQuery(id), { $set: data }, { new: true, runValidators: false }
        ).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateLocalCustomer DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    const idx = (s.localCustomers || []).findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.localCustomers[idx] = { ...s.localCustomers[idx], ...data, id }; saveFallbackStore(); return s.localCustomers[idx]; }
    return data;
  },

  async deleteLocalCustomer(id) {
    if (isDbActive()) {
      try { await LocalCustomer.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteLocalCustomer DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localCustomers = (s.localCustomers || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
    return true;
  },

  // ═══════════════ LOCAL PAYMENTS ═══════════════
  async getLocalPayments() {
    if (isDbActive()) {
      try { return await LocalPayment.find().sort({ createdAt: -1 }).lean(); }
      catch (err) { console.warn('[Store] getLocalPayments DB error:', err.message); throw err; }
    }
    return loadFallbackStore().localPayments || [];
  },

  async addLocalPayment(pay) {
    if (!pay.id) pay.id = 'pay_' + Date.now();
    if (isDbActive()) {
      try { return (await LocalPayment.create(pay)).toObject(); }
      catch (err) { console.warn('[Store] addLocalPayment DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localPayments = s.localPayments || [];
    s.localPayments.unshift(pay);
    saveFallbackStore();
    return pay;
  },

  async updateLocalPayment(id, data) {
    if (isDbActive()) {
      try {
        const updated = await LocalPayment.findOneAndUpdate(
          toIdQuery(id), { $set: data }, { new: true, runValidators: false }
        ).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateLocalPayment DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    const idx = (s.localPayments || []).findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.localPayments[idx] = { ...s.localPayments[idx], ...data, id }; saveFallbackStore(); return s.localPayments[idx]; }
    return data;
  },

  async deleteLocalPayment(id) {
    if (isDbActive()) {
      try { await LocalPayment.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteLocalPayment DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localPayments = (s.localPayments || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
    return true;
  },

  // ═══════════════ LOCAL PARTNERS ═══════════════
  async getLocalPartners() {
    if (isDbActive()) {
      try { return await LocalPartner.find().sort({ createdAt: 1 }).lean(); }
      catch (err) { console.warn('[Store] getLocalPartners DB error:', err.message); throw err; }
    }
    return loadFallbackStore().localPartners || [];
  },

  async addLocalPartner(partner) {
    if (!partner.id) partner.id = 'part_' + Date.now();
    if (!partner.code) partner.code = `PTR-${Date.now().toString().slice(-4)}`;
    if (isDbActive()) {
      try { return (await LocalPartner.create(partner)).toObject(); }
      catch (err) { console.warn('[Store] addLocalPartner DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localPartners = s.localPartners || [];
    s.localPartners.unshift(partner);
    saveFallbackStore();
    return partner;
  },

  async updateLocalPartner(id, data) {
    if (isDbActive()) {
      try {
        const updated = await LocalPartner.findOneAndUpdate(
          toIdQuery(id), { $set: data }, { new: true, runValidators: false }
        ).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateLocalPartner DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    const idx = (s.localPartners || []).findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.localPartners[idx] = { ...s.localPartners[idx], ...data, id }; saveFallbackStore(); return s.localPartners[idx]; }
    return data;
  },

  async deleteLocalPartner(id) {
    if (isDbActive()) {
      try { await LocalPartner.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteLocalPartner DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localPartners = (s.localPartners || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
    return true;
  },

  // ═══════════════ LOCAL EXPENSES ═══════════════
  async getLocalExpenses() {
    if (isDbActive()) {
      try { return await LocalExpense.find().sort({ createdAt: -1 }).lean(); }
      catch (err) { console.warn('[Store] getLocalExpenses DB error:', err.message); throw err; }
    }
    return loadFallbackStore().localExpenses || [];
  },

  async addLocalExpense(exp) {
    if (!exp.id) exp.id = 'e_' + Date.now();
    if (isDbActive()) {
      try { return (await LocalExpense.create(exp)).toObject(); }
      catch (err) { console.warn('[Store] addLocalExpense DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localExpenses = s.localExpenses || [];
    s.localExpenses.unshift(exp);
    saveFallbackStore();
    return exp;
  },

  async updateLocalExpense(id, data) {
    if (isDbActive()) {
      try {
        const updated = await LocalExpense.findOneAndUpdate(
          toIdQuery(id), { $set: data }, { new: true, runValidators: false }
        ).lean();
        return updated;
      } catch (err) { console.warn('[Store] updateLocalExpense DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    const idx = (s.localExpenses || []).findIndex(x => x.id === id || String(x._id) === String(id));
    if (idx !== -1) { s.localExpenses[idx] = { ...s.localExpenses[idx], ...data, id }; saveFallbackStore(); return s.localExpenses[idx]; }
    return data;
  },

  async deleteLocalExpense(id) {
    if (isDbActive()) {
      try { await LocalExpense.findOneAndDelete(toIdQuery(id)); return true; }
      catch (err) { console.warn('[Store] deleteLocalExpense DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localExpenses = (s.localExpenses || []).filter(x => x.id !== id && String(x._id) !== String(id));
    saveFallbackStore();
    return true;
  },

  // ═══════════════ LOCAL CONFIG ═══════════════
  async getLocalConfig() {
    if (isDbActive()) {
      try {
        let cfg = await LocalConfig.findOne().lean();
        if (!cfg) cfg = (await LocalConfig.create(getEmptyFallbackStore().localConfig)).toObject();
        return cfg;
      } catch (err) { console.warn('[Store] getLocalConfig DB error:', err.message); }
    }
    return loadFallbackStore().localConfig;
  },

  async updateLocalConfig(data) {
    if (isDbActive()) {
      try {
        return await LocalConfig.findOneAndUpdate(
          {}, { $set: data }, { new: true, upsert: true, runValidators: false }
        ).lean();
      } catch (err) { console.warn('[Store] updateLocalConfig DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    s.localConfig = { ...s.localConfig, ...data };
    saveFallbackStore();
    return s.localConfig;
  },

  // ═══════════════ ALERT LOGS ═══════════════
  async getAlertLogs(limit = 50) {
    if (isDbActive()) {
      try { return await AlertLog.find().sort({ sentAt: -1 }).limit(limit).lean(); }
      catch (err) { console.warn('[Store] getAlertLogs DB error:', err.message); return []; }
    }
    return (loadFallbackStore().alertLogs || []).slice(0, limit);
  },

  async addAlertLog(log) {
    if (isDbActive()) {
      try { return (await AlertLog.create(log)).toObject(); }
      catch (err) { console.warn('[Store] addAlertLog DB error:', err.message); }
    }
    const s = loadFallbackStore();
    if (!s.alertLogs) s.alertLogs = [];
    s.alertLogs.unshift(log);
    saveFallbackStore();
    return log;
  },

  // ═══════════════ CHINA IMPORT SHIPMENTS ═══════════════
  async getChinaShipments() {
    if (isDbActive()) {
      try {
        const list = await ChinaShipment.find().sort({ createdAt: -1 }).lean();
        return (list || []).map(s => ({
          ...s,
          financialSummary: calculateShipmentFinancialSummary(s)
        }));
      } catch (err) { console.warn('[Store] getChinaShipments DB error:', err.message); throw err; }
    }
    return (loadFallbackStore().chinaShipments || []).map(s => ({
      ...s,
      financialSummary: calculateShipmentFinancialSummary(s)
    }));
  },

  async getChinaShipment(id) {
    if (isDbActive()) {
      try {
        let item = await ChinaShipment.findOne({ id }).lean();
        if (!item) item = await ChinaShipment.findOne({ shipmentNo: id }).lean();
        if (item) item.financialSummary = calculateShipmentFinancialSummary(item);
        return item;
      } catch (err) { console.warn('[Store] getChinaShipment DB error:', err.message); throw err; }
    }
    const storeData = loadFallbackStore();
    const item = (storeData.chinaShipments || []).find(s => s.id === id || s.shipmentNo === id) || null;
    if (item) return { ...item, financialSummary: calculateShipmentFinancialSummary(item) };
    return null;
  },

  async addChinaShipment(data) {
    if (!data.id) data.id = `CS-${Date.now().toString().slice(-6)}`;
    if (isDbActive()) {
      try {
        const created = (await ChinaShipment.create(data)).toObject();
        created.financialSummary = calculateShipmentFinancialSummary(created);
        return created;
      } catch (err) { console.warn('[Store] addChinaShipment DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    if (!s.chinaShipments) s.chinaShipments = [];
    s.chinaShipments.unshift(data);
    saveFallbackStore();
    return { ...data, financialSummary: calculateShipmentFinancialSummary(data) };
  },

  async updateChinaShipment(id, data) {
    if (isDbActive()) {
      try {
        const updated = await ChinaShipment.findOneAndUpdate(
          toIdQuery(id), { $set: data }, { new: true, runValidators: false }
        ).lean();
        if (updated) updated.financialSummary = calculateShipmentFinancialSummary(updated);
        return updated;
      } catch (err) { console.warn('[Store] updateChinaShipment DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    if (!s.chinaShipments) s.chinaShipments = [];
    const idx = s.chinaShipments.findIndex(item => item.id === id || String(item._id) === String(id));
    if (idx !== -1) {
      s.chinaShipments[idx] = { ...s.chinaShipments[idx], ...data };
      saveFallbackStore();
      return { ...s.chinaShipments[idx], financialSummary: calculateShipmentFinancialSummary(s.chinaShipments[idx]) };
    }
    return null;
  },

  async deleteChinaShipment(id) {
    if (isDbActive()) {
      try { await ChinaShipment.deleteOne(toIdQuery(id)); return { success: true, id }; }
      catch (err) { console.warn('[Store] deleteChinaShipment DB error:', err.message); throw err; }
    }
    const s = loadFallbackStore();
    if (s.chinaShipments) {
      s.chinaShipments = s.chinaShipments.filter(item => item.id !== id && String(item._id) !== String(id));
      saveFallbackStore();
    }
    return { success: true, id };
  },

  async receiveChinaShipmentStock(shipmentId, receiptPayload) {
    const shipment = await this.getChinaShipment(shipmentId);
    if (!shipment) throw new Error('Shipment not found');

    const receivedItems = receiptPayload.items || [];
    const updatedShipmentItems = (shipment.items || []).map(item => {
      const rec = receivedItems.find(r => r.sku === item.sku || r.id === item.id);
      if (rec) {
        const newQtyReceived = (item.qtyReceived || 0) + (Number(rec.qtyReceived) || 0);
        return {
          ...item,
          qtyReceived: newQtyReceived,
          stockIntakeStatus: newQtyReceived >= item.qtyOrdered ? 'received' : 'partially_received'
        };
      }
      return item;
    });

    for (const rec of receivedItems) {
      const qtyToAdd = Number(rec.qtyReceived) || 0;
      if (qtyToAdd <= 0) continue;
      const targetSku = rec.sku || rec.globalMachineId;
      if (targetSku) {
        const globalMachines = await this.getGlobalMachines();
        const existingGlobalMachine = globalMachines.find(m => m.id === targetSku || m.model === rec.model);
        if (existingGlobalMachine) {
          const newStock = (existingGlobalMachine.initialStock || 0) + qtyToAdd;
          await this.updateGlobalMachine(existingGlobalMachine.id, { initialStock: newStock });
        } else {
          await this.addGlobalMachine({
            id: targetSku,
            brand: rec.brand || 'JUKI',
            model: rec.model,
            name: rec.name || rec.model,
            unit: rec.unit || 'SETS',
            initialStock: qtyToAdd,
            usdPrice: rec.unitFobUsd || 0,
            taxLKR: 5000,
            wholesalePrice: Math.round((rec.unitFobUsd || 100) * 330 * 1.15),
            retailPrice: Math.round((rec.unitFobUsd || 100) * 330 * 1.25)
          });
        }
      }
    }

    const goodsReceipt = {
      id: `GR-${Date.now().toString().slice(-6)}`,
      receiptDate: receiptPayload.receiptDate || new Date().toISOString().slice(0, 10),
      receivedBy: receiptPayload.receivedBy || 'Yard Operations',
      warehouseLocation: receiptPayload.warehouseLocation || 'Kosgama Central Machinery Fleet Yard',
      totalUnitsReceived: receivedItems.reduce((sum, r) => sum + (Number(r.qtyReceived) || 0), 0),
      itemsReceived: receivedItems,
      intakeConfirmed: true,
      notes: receiptPayload.notes || 'Physical stock received and synced to Global Machinery Warehouse'
    };

    const newAuditLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: 'Goods Receipt & Stock Intake',
      user: receiptPayload.receivedBy || 'Admin',
      details: `Received ${goodsReceipt.totalUnitsReceived} units into Global Warehouse`
    };

    return await this.updateChinaShipment(shipmentId, {
      items: updatedShipmentItems,
      status: 'received',
      goodsReceipts: [...(shipment.goodsReceipts || []), goodsReceipt],
      auditLogs: [...(shipment.auditLogs || []), newAuditLog]
    });
  }
};

module.exports = store;
