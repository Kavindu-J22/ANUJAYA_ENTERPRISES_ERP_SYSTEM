const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { getDbStatus } = require('../config/db');
const {
  getAlertsOverview,
  triggerAlertEmailForCustomer,
  triggerBatchAlerts
} = require('../services/alertService');

// ================= AUTHENTICATION =================
router.post('/auth/login', (req, res) => {
  const { path, role, pin } = req.body; // path: 'global' or 'local'
  
  if (path === 'global') {
    if (role === 'ADMIN' && pin === '9900') {
      return res.json({ success: true, user: { role: 'ADMIN', title: 'Consortium Admin', path: 'global' } });
    }
    if (role === 'PARTNER' && pin === '1234') {
      return res.json({ success: true, user: { role: 'PARTNER', title: 'Consortium Partner (Global Enterprises)', path: 'global' } });
    }
    return res.status(401).json({ success: false, message: 'Invalid Access PIN for Consortium role.' });
  }

  if (path === 'local') {
    if (pin === '9900' || pin === '1234') {
      return res.json({ success: true, user: { role: 'ADMIN', title: 'Kosgama Yard Administrator', path: 'local' } });
    }
    return res.status(401).json({ success: false, message: 'Invalid PIN for Local Yard System.' });
  }

  res.status(400).json({ success: false, message: 'Unknown authentication path.' });
});

// ================= SYSTEM / DB STATUS =================
router.get('/system/status', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    db: getDbStatus()
  });
});

// ================= GLOBAL PATH: MACHINERY MASTER (GLOBAL WAREHOUSE) =================
router.get('/global/machines', async (req, res) => {
  try {
    const machines = await store.getGlobalMachines();
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/global/machines', async (req, res) => {
  try {
    const created = await store.addGlobalMachine(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/global/machines/:id', async (req, res) => {
  try {
    const updated = await store.updateGlobalMachine(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/global/machines/:id', async (req, res) => {
  try {
    await store.deleteGlobalMachine(req.params.id);
    res.json({ success: true, message: `SKU ${req.params.id} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/global/reset-baseline', async (req, res) => {
  try {
    await store.resetGlobalBaseline();
    res.json({ success: true, message: 'System restored to 26-model baseline fleet.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GLOBAL PATH: APPAREL CLIENTS =================
router.get('/global/clients', async (req, res) => {
  try {
    const clients = await store.getGlobalClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/global/clients', async (req, res) => {
  try {
    const created = await store.addGlobalClient(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/global/clients/:id', async (req, res) => {
  try {
    const updated = await store.updateGlobalClient(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/global/clients/:id', async (req, res) => {
  try {
    await store.deleteGlobalClient(req.params.id);
    res.json({ success: true, message: `Client ${req.params.id} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GLOBAL PATH: SALES & AUDIT LEDGER =================
router.get('/global/sales', async (req, res) => {
  try {
    const sales = await store.getGlobalSales();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/global/sales', async (req, res) => {
  try {
    const created = await store.addGlobalSale(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/global/sales/:id', async (req, res) => {
  try {
    const updated = await store.updateGlobalSale(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/global/sales/:id', async (req, res) => {
  try {
    await store.deleteGlobalSale(req.params.id);
    res.json({ success: true, message: `Sale #${req.params.id} permanently removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GLOBAL PATH: PARTNER DISBURSEMENTS & SETTLEMENT =================
router.get('/global/disbursements', async (req, res) => {
  try {
    const disbs = await store.getGlobalDisbursements();
    res.json(disbs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/global/disbursements', async (req, res) => {
  try {
    const created = await store.addGlobalDisbursement(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/global/disbursements/:id', async (req, res) => {
  try {
    const updated = await store.updateGlobalDisbursement(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/global/disbursements/:id', async (req, res) => {
  try {
    await store.deleteGlobalDisbursement(req.params.id);
    res.json({ success: true, message: `Disbursement #${req.params.id} deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GLOBAL PATH: CONFIG (USD RATE & LANGUAGE) =================
router.get('/global/config', async (req, res) => {
  try {
    const cfg = await store.getGlobalConfig();
    res.json(cfg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/global/config', async (req, res) => {
  try {
    const updated = await store.updateGlobalConfig(req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= LOCAL PATH: MACHINERY MASTER (LOCAL YARD WAREHOUSE) =================
router.get('/local/machines', async (req, res) => {
  try {
    const machines = await store.getLocalMachines();
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/local/machines', async (req, res) => {
  try {
    const created = await store.addLocalMachine(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/local/machines/:id', async (req, res) => {
  try {
    const updated = await store.updateLocalMachine(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/local/machines/:id', async (req, res) => {
  try {
    await store.deleteLocalMachine(req.params.id);
    res.json({ success: true, message: `Local machine ${req.params.id} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LOCAL PATH: MASTER CUSTOMERS & FLEET AGREEMENTS =================
router.get('/local/customers', async (req, res) => {
  try {
    const customers = await store.getLocalCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/local/customers', async (req, res) => {
  try {
    const created = await store.addLocalCustomer(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/local/customers/:id', async (req, res) => {
  try {
    const updated = await store.updateLocalCustomer(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/local/customers/:id', async (req, res) => {
  try {
    await store.deleteLocalCustomer(req.params.id);
    res.json({ success: true, message: `Customer ${req.params.id} deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LOCAL PATH: PAYMENTS =================
router.get('/local/payments', async (req, res) => {
  try {
    const payments = await store.getLocalPayments();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/local/payments', async (req, res) => {
  try {
    const created = await store.addLocalPayment(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/local/payments/:id', async (req, res) => {
  try {
    const updated = await store.updateLocalPayment(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/local/payments/:id', async (req, res) => {
  try {
    await store.deleteLocalPayment(req.params.id);
    res.json({ success: true, message: `Payment ${req.params.id} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LOCAL PATH: SOURCING PARTNERS =================
router.get('/local/partners', async (req, res) => {
  try {
    const partners = await store.getLocalPartners();
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/local/partners', async (req, res) => {
  try {
    const created = await store.addLocalPartner(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/local/partners/:id', async (req, res) => {
  try {
    const updated = await store.updateLocalPartner(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/local/partners/:id', async (req, res) => {
  try {
    await store.deleteLocalPartner(req.params.id);
    res.json({ success: true, message: `Partner ${req.params.id} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LOCAL PATH: EXPENSES =================
router.get('/local/expenses', async (req, res) => {
  try {
    const expenses = await store.getLocalExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/local/expenses', async (req, res) => {
  try {
    const created = await store.addLocalExpense(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/local/expenses/:id', async (req, res) => {
  try {
    const updated = await store.updateLocalExpense(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/local/expenses/:id', async (req, res) => {
  try {
    await store.deleteLocalExpense(req.params.id);
    res.json({ success: true, message: `Expense ${req.params.id} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LOCAL PATH: CONFIG =================
router.get('/local/config', async (req, res) => {
  try {
    const cfg = await store.getLocalConfig();
    res.json(cfg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/local/config', async (req, res) => {
  try {
    const updated = await store.updateLocalConfig(req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= AUTOMATED DUE DATES & ALERTS ENGINE =================
router.get('/alerts/overview', async (req, res) => {
  try {
    const overview = await getAlertsOverview();
    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/alerts/send/:customerId', async (req, res) => {
  try {
    const result = await triggerAlertEmailForCustomer(req.params.customerId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/alerts/send-batch', async (req, res) => {
  try {
    const result = await triggerBatchAlerts();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/alerts/logs', async (req, res) => {
  try {
    const logs = await store.getAlertLogs(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export Master Audit Data
router.get('/system/export-audit', async (req, res) => {
  try {
    const [
      globalMachines, globalSales, globalDisbursements, globalConfig,
      localMachines, localCustomers, localPayments, localPartners, localExpenses, localConfig
    ] = await Promise.all([
      store.getGlobalMachines(), store.getGlobalSales(), store.getGlobalDisbursements(), store.getGlobalConfig(),
      store.getLocalMachines(), store.getLocalCustomers(), store.getLocalPayments(), store.getLocalPartners(),
      store.getLocalExpenses(), store.getLocalConfig()
    ]);

    res.json({
      application: "ANUJAYA & GLOBAL ENTERPRISES ERP",
      version: "8.0-ENTERPRISE",
      exportTimestamp: new Date().toISOString(),
      globalModule: {
        machines: globalMachines,
        sales: globalSales,
        disbursements: globalDisbursements,
        config: globalConfig
      },
      localRentalModule: {
        machines: localMachines,
        customers: localCustomers,
        payments: localPayments,
        partners: localPartners,
        expenses: localExpenses,
        config: localConfig
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
