const API_BASE = '/api';

// Normalises ALL backend responses into { success: bool, data: any }
// so App.jsx can safely do `if (res.success) setState(res.data)`.
async function req(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    if (json && typeof json.success === 'boolean') return json;
    if (!response.ok) {
      return { success: false, error: json.error || json.message || `HTTP ${response.status}` };
    }
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function ensureArray(res) {
  if (res.success && !Array.isArray(res.data)) res.data = [];
  return res;
}

function ensureObject(res, fallback = {}) {
  if (res.success && (res.data === null || typeof res.data !== 'object' || Array.isArray(res.data))) {
    res.data = fallback;
  }
  return res;
}

const J = { 'Content-Type': 'application/json' };

export const api = {
  async getSystemStatus() { return req(`${API_BASE}/system/status`); },

  async login(path, role, pin) {
    return req(`${API_BASE}/auth/login`, { method: 'POST', headers: J, body: JSON.stringify({ path, role, pin }) });
  },

  // Global: Machines
  async getGlobalMachines() { return ensureArray(await req(`${API_BASE}/global/machines`)); },
  async addGlobalMachine(data) { return req(`${API_BASE}/global/machines`, { method: 'POST', headers: J, body: JSON.stringify(data) }); },
  async updateGlobalMachine(id, data) { return req(`${API_BASE}/global/machines/${id}`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },
  async deleteGlobalMachine(id) { return req(`${API_BASE}/global/machines/${id}`, { method: 'DELETE' }); },
  async resetGlobalBaseline() { return ensureArray(await req(`${API_BASE}/global/reset-baseline`, { method: 'POST' })); },

  // Global: Clients (Apparel Manufacturers)
  async getGlobalClients() { return ensureArray(await req(`${API_BASE}/global/clients`)); },
  async addGlobalClient(data) { return req(`${API_BASE}/global/clients`, { method: 'POST', headers: J, body: JSON.stringify(data) }); },
  async updateGlobalClient(id, data) { return req(`${API_BASE}/global/clients/${id}`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },
  async deleteGlobalClient(id) { return req(`${API_BASE}/global/clients/${id}`, { method: 'DELETE' }); },

  // Global: Sales
  async getGlobalSales() { return ensureArray(await req(`${API_BASE}/global/sales`)); },
  async addGlobalSale(sale) { return req(`${API_BASE}/global/sales`, { method: 'POST', headers: J, body: JSON.stringify(sale) }); },
  async updateGlobalSale(id, data) { return req(`${API_BASE}/global/sales/${id}`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },

  // Global: Disbursements
  async getGlobalDisbursements() { return ensureArray(await req(`${API_BASE}/global/disbursements`)); },
  async addGlobalDisbursement(data) { return req(`${API_BASE}/global/disbursements`, { method: 'POST', headers: J, body: JSON.stringify(data) }); },

  // Global: Config
  async getGlobalConfig() { return ensureObject(await req(`${API_BASE}/global/config`), { usdRate: 330, openingCapitalReserve: 15000000 }); },
  async updateGlobalConfig(data) { return req(`${API_BASE}/global/config`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },

  // Local: Machines
  async getLocalMachines() { return ensureArray(await req(`${API_BASE}/local/machines`)); },
  async addLocalMachine(data) { return req(`${API_BASE}/local/machines`, { method: 'POST', headers: J, body: JSON.stringify(data) }); },
  async updateLocalMachine(id, data) { return req(`${API_BASE}/local/machines/${id}`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },
  async deleteLocalMachine(id) { return req(`${API_BASE}/local/machines/${id}`, { method: 'DELETE' }); },

  // Local: Customers
  async getLocalCustomers() { return ensureArray(await req(`${API_BASE}/local/customers`)); },
  async addLocalCustomer(data) { return req(`${API_BASE}/local/customers`, { method: 'POST', headers: J, body: JSON.stringify(data) }); },
  async updateLocalCustomer(id, data) { return req(`${API_BASE}/local/customers/${id}`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },
  async deleteLocalCustomer(id) { return req(`${API_BASE}/local/customers/${id}`, { method: 'DELETE' }); },

  // Local: Payments
  async getLocalPayments() { return ensureArray(await req(`${API_BASE}/local/payments`)); },
  async addLocalPayment(data) { return req(`${API_BASE}/local/payments`, { method: 'POST', headers: J, body: JSON.stringify(data) }); },
  async updateLocalPayment(id, data) { return req(`${API_BASE}/local/payments/${id}`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },
  async deleteLocalPayment(id) { return req(`${API_BASE}/local/payments/${id}`, { method: 'DELETE' }); },

  // Local: Partners
  async getLocalPartners() { return ensureArray(await req(`${API_BASE}/local/partners`)); },
  async addLocalPartner(data) { return req(`${API_BASE}/local/partners`, { method: 'POST', headers: J, body: JSON.stringify(data) }); },
  async updateLocalPartner(id, data) { return req(`${API_BASE}/local/partners/${id}`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },
  async deleteLocalPartner(id) { return req(`${API_BASE}/local/partners/${id}`, { method: 'DELETE' }); },

  // Local: Expenses
  async getLocalExpenses() { return ensureArray(await req(`${API_BASE}/local/expenses`)); },
  async addLocalExpense(data) { return req(`${API_BASE}/local/expenses`, { method: 'POST', headers: J, body: JSON.stringify(data) }); },
  async updateLocalExpense(id, data) { return req(`${API_BASE}/local/expenses/${id}`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },
  async deleteLocalExpense(id) { return req(`${API_BASE}/local/expenses/${id}`, { method: 'DELETE' }); },

  // Local: Config
  async getLocalConfig() {
    return ensureObject(await req(`${API_BASE}/local/config`), {
      activeMonth: '2026-03', allMonths: ['2026-01', '2026-02', '2026-03'],
    });
  },
  async updateLocalConfig(data) { return req(`${API_BASE}/local/config`, { method: 'PUT', headers: J, body: JSON.stringify(data) }); },

  // Alerts
  async getAlertsOverview() {
    return ensureObject(await req(`${API_BASE}/alerts/overview`), {
      activeAlerts: [], counts: { total: 0, sevenDays: 0, threeDays: 0, dueToday: 0, overdue: 0 },
    });
  },
  async sendCustomerAlert(customerId) { return req(`${API_BASE}/alerts/send/${customerId}`, { method: 'POST' }); },
  async sendBatchAlerts() { return req(`${API_BASE}/alerts/send-batch`, { method: 'POST' }); },
  async getAlertLogs() { return ensureArray(await req(`${API_BASE}/alerts/logs`)); },

  // Audit Export
  async exportFullAudit() { return req(`${API_BASE}/system/export-audit`); },
};
