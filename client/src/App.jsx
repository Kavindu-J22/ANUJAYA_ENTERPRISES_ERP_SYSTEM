import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Globe, 
  Warehouse, 
  LayoutDashboard, 
  Boxes, 
  Receipt, 
  Users, 
  Scale, 
  CreditCard, 
  RotateCcw, 
  TrendingUp, 
  Building2,
  Bell,
  RefreshCw,
  PlusCircle,
  FileText
} from 'lucide-react';

import { api } from './services/api';
import { Navbar } from './components/common/Navbar';
import { LoginModal } from './components/common/LoginModal';
import { ToastContainer } from './components/common/ToastContainer';

// Global Components & Modals
import { GlobalDashboard } from './components/global/GlobalDashboard';
import { GlobalMachineryMaster } from './components/global/GlobalMachineryMaster';
import { GlobalSalesLedger } from './components/global/GlobalSalesLedger';
import { GlobalApparelClients } from './components/global/GlobalApparelClients';
import { GlobalPartnerSettlement } from './components/global/GlobalPartnerSettlement';
import { GlobalTaxInvoiceModal } from './components/global/GlobalTaxInvoiceModal';
import { GlobalSaleModal } from './components/global/GlobalSaleModal';
import { GlobalMachineModal } from './components/global/GlobalMachineModal';
import { GlobalDisburseModal } from './components/global/GlobalDisburseModal';
import { GlobalClientModal } from './components/global/GlobalClientModal';

// Local Components & Modals
import { LocalDashboard } from './components/local/LocalDashboard';
import { LocalMachineryMaster } from './components/local/LocalMachineryMaster';
import { LocalCustomerDirectory } from './components/local/LocalCustomerDirectory';
import { LocalPaymentsLedger } from './components/local/LocalPaymentsLedger';
import { LocalReturnsWorkflow } from './components/local/LocalReturnsWorkflow';
import { LocalExpensesLedger } from './components/local/LocalExpensesLedger';
import { LocalDocumentsModal } from './components/local/LocalDocumentsModal';
import { LocalCustomerModal } from './components/local/LocalCustomerModal';
import { LocalPaymentModal } from './components/local/LocalPaymentModal';
import { LocalReturnModal } from './components/local/LocalReturnModal';
import { LocalYardMachineModal } from './components/local/LocalYardMachineModal';
import { 
  LocalPartnerModal, 
  LocalPartnerPurchaseModal, 
  LocalPartnerReturnModal, 
  LocalPartnerPaymentModal 
} from './components/local/LocalPartnerModals';
import { LocalExpenseModal } from './components/local/LocalExpenseModal';
import { LocalAlertLogsModal } from './components/local/LocalAlertLogsModal';
import { LocalQuotationModal } from './components/local/LocalQuotationModal';

export default function App() {
  // Navigation & Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('consortium_erp_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentPath, setCurrentPath] = useState(() => {
    try {
      const savedUser = localStorage.getItem('consortium_erp_user');
      if (savedUser && JSON.parse(savedUser)?.role === 'PARTNER') {
        return 'global';
      }
      return localStorage.getItem('consortium_erp_path') || 'global';
    } catch {
      return 'global';
    }
  });
  const [currentLang, setCurrentLang] = useState('en');
  const [activeGlobalTab, setActiveGlobalTab] = useState('dashboard');
  const [activeLocalTab, setActiveLocalTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toast Helper
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Global Path State
  const [globalMachines, setGlobalMachines] = useState([]);
  const [globalClients, setGlobalClients] = useState([]);
  const [globalSales, setGlobalSales] = useState([]);
  const [globalDisbursements, setGlobalDisbursements] = useState([]);
  const [globalConfig, setGlobalConfig] = useState({ usdRate: 330, openingCapitalReserve: 15000000 });

  // Local Path State
  const [localMachines, setLocalMachines] = useState([]);
  const [localCustomers, setLocalCustomers] = useState([]);
  const [localPayments, setLocalPayments] = useState([]);
  const [localPartners, setLocalPartners] = useState([]);
  const [localExpenses, setLocalExpenses] = useState([]);
  const [localConfig, setLocalConfig] = useState({
    activeMonth: '2026-03',
    allMonths: ['2026-01', '2026-02', '2026-03'],
    companyInfo: {
      name: "ANUJAYA ENTERPRISES",
      regNo: "PV/WP/78412",
      taglineEn: "INDUSTRIAL SEWING MACHINERY FLEET, AUTOMATION & MAINTENANCE",
      taglineSi: "කාර්මික මහන මැෂින් කුලියට දීම, නඩත්තුව සහ අලෙවිය",
      addressEn: "200/2B/1, Pahala Kosgama, Kosgama, Sri Lanka",
      addressSi: "200/2බී/1, පහළ කොස්ගම, කොස්ගම, ශ්‍රී ලංකාව",
      hotline: "077 412 7702",
      email: "anujayaenterprises.info@gmail.com"
    },
    bankInfo: {
      bankNameEn: "Bank Of Ceylon",
      accountName: "Anujaya Enterprises",
      accountNo: "94459826",
      branchEn: "Ruwanwella Branch"
    }
  });
  const [alertsData, setAlertsData] = useState({ activeAlerts: [], counts: { total: 0, sevenDays: 0, threeDays: 0, dueToday: 0, overdue: 0 } });
  const [alertLogs, setAlertLogs] = useState([]);

  // ================= MODAL STATES =================
  // Global Modals
  const [isGlobalSaleModalOpen, setIsGlobalSaleModalOpen] = useState(false);
  const [selectedGlobalSale, setSelectedGlobalSale] = useState(null);
  const [isGlobalMachineModalOpen, setIsGlobalMachineModalOpen] = useState(false);
  const [selectedGlobalMachine, setSelectedGlobalMachine] = useState(null);
  const [isGlobalClientModalOpen, setIsGlobalClientModalOpen] = useState(false);
  const [selectedGlobalClient, setSelectedGlobalClient] = useState(null);
  const [globalClientModalMode, setGlobalClientModalMode] = useState('ADD');
  const [isGlobalDisburseModalOpen, setIsGlobalDisburseModalOpen] = useState(false);
  const [selectedGlobalDisbursement, setSelectedGlobalDisbursement] = useState(null);
  const [globalDisburseModalMode, setGlobalDisburseModalMode] = useState('ADD');
  const [globalTaxInvoiceData, setGlobalTaxInvoiceData] = useState(null);

  // Local Modals
  const [isLocalYardMachineModalOpen, setIsLocalYardMachineModalOpen] = useState(false);
  const [selectedLocalYardMachine, setSelectedLocalYardMachine] = useState(null);

  const [isLocalCustomerModalOpen, setIsLocalCustomerModalOpen] = useState(false);
  const [localCustomerModalMode, setLocalCustomerModalMode] = useState('ADD');
  const [selectedLocalCustomer, setSelectedLocalCustomer] = useState(null);

  const [isLocalPaymentModalOpen, setIsLocalPaymentModalOpen] = useState(false);
  const [localPaymentModalMode, setLocalPaymentModalMode] = useState('ADD');
  const [selectedLocalPayment, setSelectedLocalPayment] = useState(null);
  const [prefilledPaymentCustomer, setPrefilledPaymentCustomer] = useState(null);

  const [isLocalReturnModalOpen, setIsLocalReturnModalOpen] = useState(false);
  const [selectedReturnCustomer, setSelectedReturnCustomer] = useState(null);
  const [prefilledReturnRental, setPrefilledReturnRental] = useState(null);

  const [isLocalPartnerModalOpen, setIsLocalPartnerModalOpen] = useState(false);
  const [selectedLocalPartner, setSelectedLocalPartner] = useState(null);

  const [isLocalPurchaseModalOpen, setIsLocalPurchaseModalOpen] = useState(false);
  const [selectedPartnerForPurchase, setSelectedPartnerForPurchase] = useState(null);

  const [isLocalPartnerReturnModalOpen, setIsLocalPartnerReturnModalOpen] = useState(false);
  const [selectedPartnerForReturn, setSelectedPartnerForReturn] = useState(null);

  const [isLocalPartnerPaymentModalOpen, setIsLocalPartnerPaymentModalOpen] = useState(false);
  const [selectedPartnerForPayment, setSelectedPartnerForPayment] = useState(null);

  const [isLocalExpenseModalOpen, setIsLocalExpenseModalOpen] = useState(false);
  const [selectedLocalExpense, setSelectedLocalExpense] = useState(null);

  const [isLocalAlertLogsModalOpen, setIsLocalAlertLogsModalOpen] = useState(false);
  const [isLocalQuotationModalOpen, setIsLocalQuotationModalOpen] = useState(false);

  // All 10 Documents Modal State
  const [localDocModalData, setLocalDocModalData] = useState(null);

  // Initial Data Fetch
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        statusRes,
        gMachinesRes,
        gSalesRes,
        gDisburseRes,
        gConfigRes,
        gClientsRes,
        lMachinesRes,
        lCustRes,
        lPayRes,
        lPartRes,
        lExpRes,
        lConfigRes,
        alertsRes,
        logsRes
      ] = await Promise.all([
        api.getSystemStatus(),
        api.getGlobalMachines(),
        api.getGlobalSales(),
        api.getGlobalDisbursements(),
        api.getGlobalConfig(),
        api.getGlobalClients(),
        api.getLocalMachines(),
        api.getLocalCustomers(),
        api.getLocalPayments(),
        api.getLocalPartners(),
        api.getLocalExpenses(),
        api.getLocalConfig(),
        api.getAlertsOverview(),
        api.getAlertLogs()
      ]);

      if (statusRes.success) setDbStatus(statusRes);
      if (gMachinesRes.success) setGlobalMachines(gMachinesRes.data);
      if (gSalesRes.success) setGlobalSales(gSalesRes.data);
      if (gDisburseRes.success) setGlobalDisbursements(gDisburseRes.data);
      if (gConfigRes.success) setGlobalConfig(gConfigRes.data);
      if (gClientsRes && gClientsRes.success) setGlobalClients(gClientsRes.data);
      if (lMachinesRes.success) setLocalMachines(lMachinesRes.data);
      if (lCustRes.success) setLocalCustomers(lCustRes.data);
      if (lPayRes.success) setLocalPayments(lPayRes.data);
      if (lPartRes.success) setLocalPartners(lPartRes.data);
      if (lExpRes.success) setLocalExpenses(lExpRes.data);
      if (lConfigRes.success) setLocalConfig(lConfigRes.data);
      if (alertsRes.success) setAlertsData(alertsRes.data);
      if (logsRes.success) setAlertLogs(logsRes.data);
    } catch (err) {
      console.error("Data fetch error:", err);
      addToast("Failed to connect to backend server.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Enforce partner role strictly to global path
  useEffect(() => {
    if (currentUser?.role === 'PARTNER' && currentPath !== 'global') {
      setCurrentPath('global');
      localStorage.setItem('consortium_erp_path', 'global');
    }
  }, [currentUser, currentPath]);

  // Handle Path Switching
  const handlePathChange = (newPath) => {
    if (currentUser?.role === 'PARTNER') {
      return; // Partner is strictly restricted to global path
    }
    setCurrentPath(newPath);
    localStorage.setItem('consortium_erp_path', newPath);
  };

  // Login handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'PARTNER') {
      setCurrentPath('global');
      localStorage.setItem('consortium_erp_path', 'global');
    }
    localStorage.setItem('consortium_erp_user', JSON.stringify(user));
    addToast(`Authenticated as ${user.title} (${user.role})`, "success");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('consortium_erp_user');
    addToast("Logged out successfully.", "info");
  };

  // ================= GLOBAL METRICS CALCULATIONS =================
  const globalMetrics = useMemo(() => {
    const usdRate = globalConfig.usdRate || 330;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalTaxes = 0;
    let totalPaidRevenue = 0;
    let pendingReceivables = 0;
    let pendingInvoices = 0;
    let totalUnitsSold = 0;

    let profitAnujaya = 0;
    let profitGlobal = 0;
    let profitShared5050 = 0;
    let profitGlobal100 = 0;
    let profitAnujaya100 = 0;

    const validSales = (globalSales || []).filter(s => !s.cancelled);
    const salesCount = validSales.length;

    validSales.forEach(s => {
      const machine = (globalMachines || []).find(m => m.id === s.machineId) || {};
      let unitCost = s.frozenUnitCost;
      if (unitCost === undefined || unitCost === null) {
        const baseCost = (parseFloat(machine.usdPrice) || 0) * (s.frozenExchangeRate || usdRate);
        unitCost = baseCost + (parseFloat(machine.taxLKR) || 0);
      }
      const qty = parseInt(s.qty) || 1;
      const unitPrice = parseFloat(s.unitPrice) || 0;
      const rev = qty * unitPrice;
      const cost = qty * unitCost;
      const saleNetProfit = rev - cost;

      totalRevenue += rev;
      totalCost += cost;
      totalTaxes += qty * (parseFloat(machine.taxLKR) || 0);
      totalUnitsSold += qty;

      // Profit sharing allocation per transaction
      if (s.profitAllocation === 'GLOBAL_100') {
        profitGlobal += saleNetProfit;
        profitGlobal100 += saleNetProfit;
      } else if (s.profitAllocation === 'ANUJAYA_100') {
        profitAnujaya += saleNetProfit;
        profitAnujaya100 += saleNetProfit;
      } else {
        // Standard 50/50 Consortium split
        profitAnujaya += saleNetProfit * 0.5;
        profitGlobal += saleNetProfit * 0.5;
        profitShared5050 += saleNetProfit;
      }

      const rawPaid = s.paidAmount !== undefined && s.paidAmount !== null ? s.paidAmount : s.amountPaid;
      const paid = s.paymentStatus === 'PAID' ? rev : (parseFloat(rawPaid) || 0);
      totalPaidRevenue += paid;
      const due = Math.max(0, rev - paid);
      pendingReceivables += due;
      if (s.paymentStatus !== 'PAID' || due > 0) {
        pendingInvoices += 1;
      }
    });

    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit;
    const partnerShare = netProfit * 0.5;

    // Disbursements by partner (X = Anujaya, Y = Global)
    const drawAnujaya = (globalDisbursements || [])
      .filter(d => d.partner === 'X' || d.partner === 'ANUJAYA')
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const drawGlobal = (globalDisbursements || [])
      .filter(d => d.partner === 'Y' || d.partner === 'GLOBAL')
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const totalDisbursed = drawAnujaya + drawGlobal;

    const balAnujaya = profitAnujaya - drawAnujaya;
    const balGlobal = profitGlobal - drawGlobal;

    const totalBal = Math.max(0, balAnujaya) + Math.max(0, balGlobal);
    const balanceGaugeX = totalBal > 0 ? Math.round((Math.max(0, balAnujaya) / totalBal) * 100) : 50;
    const balanceGaugeY = 100 - balanceGaugeX;

    const retainedConsortiumCapital = netProfit - totalDisbursed;

    // Inventory Valuation & Capacity
    let remainingStockValuation = 0;
    let totalFleetCapacity = 0;
    let totalAvailableUnits = 0;

    (globalMachines || []).forEach(m => {
      const cost = ((parseFloat(m.usdPrice) || 0) * usdRate) + (parseFloat(m.taxLKR) || 0);
      const initialCapacity = parseInt(m.initialStock !== undefined ? m.initialStock : m.stock) || 0;
      totalFleetCapacity += initialCapacity;

      const soldForThisMachine = validSales
        .filter(s => s.machineId === m.id)
        .reduce((sum, s) => sum + (parseInt(s.qty) || 1), 0);

      const available = Math.max(0, initialCapacity - soldForThisMachine);
      totalAvailableUnits += available;
      remainingStockValuation += available * cost;
    });

    const inventoryValuation = remainingStockValuation;
    const marginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";
    const soldPct = totalFleetCapacity > 0 ? ((totalUnitsSold / totalFleetCapacity) * 100).toFixed(1) : "0.0";
    const cashReserve = (globalConfig.openingCapitalReserve || 15000000) + totalPaidRevenue - totalDisbursed;

    return {
      grossRevenue: totalRevenue,
      totalRevenue,
      totalCOGS: totalCost,
      totalCost,
      totalTaxes,
      grossProfit,
      netProfit,
      partnerShare,
      profitAnujaya,
      profitGlobal,
      profitShared5050,
      profitGlobal100,
      profitAnujaya100,
      salesCount,
      totalUnitsSold,
      marginPct,
      totalFleetCapacity,
      totalAvailableUnits,
      soldPct,
      remainingStockValuation,
      inventoryValuation,
      totalReceivables: pendingReceivables,
      pendingReceivables,
      pendingInvoices,
      drawAnujaya,
      drawGlobal,
      totalDisbursed,
      balAnujaya,
      balGlobal,
      balanceGaugeX,
      balanceGaugeY,
      retainedConsortiumCapital,
      skuCount: (globalMachines || []).length,
      cashReserve,
      totalPaidRevenue
    };
  }, [globalSales, globalMachines, globalConfig, globalDisbursements]);

  const globalBrandBreakdown = useMemo(() => {
    const brandTotals = {};
    const brandSold = {};

    (globalMachines || []).forEach(m => {
      const b = (m.brand || 'Other').toUpperCase();
      const initial = parseInt(m.initialStock !== undefined ? m.initialStock : m.stock) || 0;
      brandTotals[b] = (brandTotals[b] || 0) + initial;
    });

    // Count units sold (non-cancelled) per brand to compute available
    (globalSales || []).filter(s => !s.cancelled).forEach(s => {
      const machine = (globalMachines || []).find(m => m.id === s.machineId);
      if (machine) {
        const b = (machine.brand || 'Other').toUpperCase();
        brandSold[b] = (brandSold[b] || 0) + (parseInt(s.qty) || 1);
      }
    });

    return Object.entries(brandTotals).map(([brand, total]) => {
      const sold = brandSold[brand] || 0;
      const available = Math.max(0, total - sold);
      const pct = Math.round((available / Math.max(total, 1)) * 100);
      return { brand, total, available, pct };
    }).sort((a, b) => b.total - a.total);
  }, [globalMachines, globalSales]);

  const enrichedRecentSales = useMemo(() => {
    return (globalSales || [])
      .filter(s => !s.cancelled)
      .slice(0, 8)
      .map(sale => {
        const machine = (globalMachines || []).find(m => m.id === sale.machineId);
        const qty = parseInt(sale.qty) || 1;
        const unitPrice = parseFloat(sale.unitPrice) || 0;
        return {
          ...sale,
          machineBrand: machine?.brand || 'JUKI',
          machineModel: machine?.model || sale.machineId,
          totalRevenue: qty * unitPrice
        };
      });
  }, [globalSales, globalMachines]);

  // ================= LOCAL METRICS CALCULATIONS =================
  const localMetrics = useMemo(() => {
    const activeMonth = localConfig.activeMonth || '2026-03';
    const allMonths = localConfig.allMonths || ['2026-01', '2026-02', '2026-03'];
    const mIdx = allMonths.indexOf(activeMonth);

    let totalActiveMachines = 0;
    let activeClients = 0;
    let totalMonthlyIncome = 0;
    let totalArrears = 0;

    (localCustomers || []).filter(c => !c.isArchived).forEach(c => {
      const activeRentals = (c.rentals || []).filter(r => r.status === 'Active');
      if (activeRentals.length > 0) {
        activeClients += 1;
        totalActiveMachines += activeRentals.length;
      }

      const clientMonthlyRent = activeRentals.reduce((s, r) => s + (Number(r.rentRate) || 0), 0);
      totalMonthlyIncome += clientMonthlyRent;

      // Calculate past arrears
      let prevBal = Number(c.baseOpeningBalance || 0);
      if (mIdx > 0) {
        for (let i = 0; i < mIdx; i++) {
          const prevMonth = allMonths[i];
          const prevRent = (c.rentals || []).filter(r => r.status === 'Active').reduce((s, r) => s + (Number(r.rentRate) || 0), 0);
          const prevPaid = (localPayments || []).filter(p => p.customerId === c.id && p.month === prevMonth)
            .reduce((s, p) => s + (Number(p.amount) || 0), 0);
          prevBal = Math.max(0, prevBal + prevRent - prevPaid);
        }
      }
      totalArrears += prevBal;
    });

    const totalPaid = (localPayments || []).filter(p => p.month === activeMonth)
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const totalReceivables = Math.max(0, totalMonthlyIncome + totalArrears - totalPaid);
    const totalExpenses = (localExpenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const netProfit = totalPaid - totalExpenses;

    const totalPartnerPayables = (localPartners || []).reduce((s, p) => {
      const pur = (p.purchases || []).reduce((sum, i) => sum + (Number(i.qty || 1) * Number(i.unitPrice || 0)), 0);
      const ret = (p.returns || []).reduce((sum, i) => sum + (Number(i.qty || 1) * Number(i.unitPrice || 0)), 0);
      const paid = (p.payments || []).reduce((sum, pay) => sum + Number(pay.amount || 0), 0);
      return s + (Number(p.baseOpeningBalance || 0) + pur - ret - paid);
    }, 0);

    const totalDemand = totalMonthlyIncome + totalArrears;
    const collectionRate = totalDemand > 0 ? Math.round((totalPaid / totalDemand) * 100) : 0;

    return {
      totalActiveMachines,
      activeClients,
      totalMonthlyIncome,
      totalArrears,
      totalPaid,
      totalReceivables,
      totalExpenses,
      netProfit,
      totalPartnerPayables,
      collectionRate
    };
  }, [localCustomers, localPayments, localExpenses, localPartners, localConfig]);

  // ================= ACTION HANDLERS =================
  // Global: Change USD Rate
  const handleUsdRateChange = async (newRate) => {
    try {
      const res = await api.updateGlobalConfig({ usdRate: newRate });
      if (res.success) {
        setGlobalConfig(prev => ({ ...prev, usdRate: newRate }));
        addToast(`USD Spot Rate updated to ${newRate} LKR`, "success");
      }
    } catch {
      addToast("Failed to update USD rate", "error");
    }
  };

  // Global: Reset Baseline
  const handleResetGlobalBaseline = async () => {
    if (!window.confirm("Restore factory 26 baseline machinery models from warehouse seeds?")) return;
    try {
      const res = await api.resetGlobalBaseline();
      if (res.success) {
        setGlobalMachines(res.data);
        addToast("Baseline machinery warehouse restored (26 models)!", "success");
      }
    } catch {
      addToast("Failed to reset baseline", "error");
    }
  };

  // Global: Add/Edit Machine
  const handleSaveGlobalMachine = async (machineData) => {
    try {
      if (selectedGlobalMachine && selectedGlobalMachine.id) {
        const res = await api.updateGlobalMachine(selectedGlobalMachine.id, machineData);
        if (res.success) {
          setGlobalMachines(prev => prev.map(m => m.id === selectedGlobalMachine.id ? res.data : m));
          addToast(`Machinery SKU ${res.data.id || selectedGlobalMachine.id} specs updated!`, "success");
        }
      } else {
        const res = await api.addGlobalMachine(machineData);
        if (res.success) {
          setGlobalMachines(prev => {
            const exists = prev.some(m => m.id === res.data.id);
            if (exists) {
              return prev.map(m => m.id === res.data.id ? res.data : m);
            }
            return [res.data, ...prev];
          });
          addToast(`New machinery SKU ${res.data.id} registered into Global fleet!`, "success");
        }
      }
      setIsGlobalMachineModalOpen(false);
      setSelectedGlobalMachine(null);
    } catch {
      addToast("Failed to save machine", "error");
    }
  };

  const handleDeleteGlobalMachine = async (id) => {
    if (!window.confirm("Are you sure you want to remove this model from the global inventory?")) return;
    try {
      const res = await api.deleteGlobalMachine(id);
      if (res.success) {
        setGlobalMachines(prev => prev.filter(m => m.id !== id));
        addToast("Machinery model removed from fleet.", "info");
      }
    } catch {
      addToast("Failed to delete machine", "error");
    }
  };

  // Global: Add/Edit Sale
  const handleSaveGlobalSale = async (saleData) => {
    try {
      if (selectedGlobalSale && selectedGlobalSale.id) {
        const res = await api.updateGlobalSale(selectedGlobalSale.id, saleData);
        if (res.success) {
          setGlobalSales(prev => prev.map(s => s.id === selectedGlobalSale.id ? res.data : s));
          addToast("Sale invoice updated successfully!", "success");
        }
      } else {
        const res = await api.addGlobalSale(saleData);
        if (res.success) {
          setGlobalSales(prev => [res.data, ...prev]);
          // Decrement stock in machines
          setGlobalMachines(prev => prev.map(m => {
            if (m.id === saleData.machineId) {
              const currentStock = parseInt(m.initialStock !== undefined ? m.initialStock : m.stock) || 0;
              const newStock = Math.max(0, currentStock - (parseInt(saleData.qty) || 1));
              return { ...m, stock: newStock, initialStock: newStock };
            }
            return m;
          }));
          addToast(`Sale recorded! Invoice #${res.data.id || res.data.invoiceNo} generated.`, "success");

          // Preview generated Official Tax Invoice
          const machine = globalMachines.find(m => m.id === saleData.machineId);
          setGlobalTaxInvoiceData({ sale: res.data, machine });
        }
      }
      setIsGlobalSaleModalOpen(false);
      setSelectedGlobalSale(null);
    } catch {
      addToast("Failed to save sale", "error");
    }
  };

  const handleDeleteGlobalSale = async (id) => {
    try {
      const res = await api.updateGlobalSale(id, { cancelled: true });
      if (res.success) {
        setGlobalSales(prev => prev.map(s => s.id === id ? { ...s, cancelled: true } : s));
        addToast(`Sale #${id} cancelled and inventory restored to warehouse!`, "info");
      } else {
        addToast(res.error || "Failed to cancel sale", "error");
      }
    } catch {
      addToast("Failed to cancel sale", "error");
    }
  };

  const handleRestoreGlobalSale = async (id) => {
    try {
      const res = await api.updateGlobalSale(id, { cancelled: false });
      if (res.success) {
        setGlobalSales(prev => prev.map(s => s.id === id ? { ...s, cancelled: false } : s));
        addToast(`Sale #${id} restored to active sales ledger!`, "success");
      } else {
        addToast(res.error || "Failed to restore sale", "error");
      }
    } catch {
      addToast("Failed to restore sale", "error");
    }
  };

  const handlePermanentDeleteGlobalSale = async (id) => {
    try {
      const res = await api.deleteGlobalSale(id);
      if (res.success) {
        setGlobalSales(prev => prev.filter(s => s.id !== id));
        addToast(`Sale #${id} permanently purged from system.`, "info");
      } else {
        addToast(res.error || "Failed to delete sale", "error");
      }
    } catch {
      addToast("Failed to delete sale", "error");
    }
  };

  // Global: Settle / Mark Sale as Fully Paid
  const handleMarkGlobalSaleFullyPaid = async (sale) => {
    try {
      const qty = parseInt(sale.qty) || 1;
      const unitPrice = parseFloat(sale.unitPrice) || 0;
      const totalRevenue = qty * unitPrice;
      const updatedData = {
        ...sale,
        paymentStatus: 'PAID',
        paidAmount: totalRevenue
      };
      const res = await api.updateGlobalSale(sale.id, updatedData);
      if (res.success) {
        setGlobalSales(prev => prev.map(s => s.id === sale.id ? res.data : s));
        addToast(`Invoice #${sale.id} marked as fully settled / paid!`, "success");
      }
    } catch {
      addToast("Failed to update payment status", "error");
    }
  };

  // Global: Add/Edit/Delete Apparel Client
  const handleSaveGlobalClient = async (clientData, mode) => {
    try {
      if (mode === 'EDIT' || (selectedGlobalClient && selectedGlobalClient.id)) {
        const targetId = selectedGlobalClient?.id || clientData.id;
        const res = await api.updateGlobalClient(targetId, clientData);
        if (res.success) {
          setGlobalClients(prev => prev.map(c => c.id === targetId ? res.data : c));
          addToast(`Client profile for ${res.data.name || clientData.name} updated!`, "success");
        }
      } else {
        const res = await api.addGlobalClient(clientData);
        if (res.success) {
          setGlobalClients(prev => [res.data, ...prev]);
          addToast(`Apparel client ${res.data.name} (${res.data.code}) registered!`, "success");
        }
      }
      setIsGlobalClientModalOpen(false);
      setSelectedGlobalClient(null);
    } catch {
      addToast("Failed to save apparel client", "error");
    }
  };

  const handleDeleteGlobalClient = async (id) => {
    if (!window.confirm("Are you sure you want to remove this apparel client from master directory?")) return;
    try {
      const res = await api.deleteGlobalClient(id);
      if (res.success) {
        setGlobalClients(prev => prev.filter(c => c.id !== id));
        addToast("Client profile removed from master directory.", "info");
      }
    } catch {
      addToast("Failed to delete client", "error");
    }
  };

  // Global: Add/Edit/Delete Disburse Funds
  const handleSaveGlobalDisbursement = async (data, mode) => {
    try {
      if (mode === 'EDIT' || (selectedGlobalDisbursement && selectedGlobalDisbursement.id)) {
        const targetId = selectedGlobalDisbursement?.id || data.id;
        const res = await api.updateGlobalDisbursement(targetId, data);
        if (res.success) {
          setGlobalDisbursements(prev => prev.map(d => d.id === targetId ? res.data : d));
          addToast(`Capital Draw #${targetId} updated successfully!`, "success");
        } else {
          addToast(res.error || "Failed to update disbursement", "error");
        }
      } else {
        const res = await api.addGlobalDisbursement(data);
        if (res.success) {
          setGlobalDisbursements(prev => [res.data, ...prev]);
          addToast(`Disbursement of LKR ${data.amount} recorded for ${data.partner === 'X' ? 'Anujaya' : 'Global'}!`, "success");
        } else {
          addToast(res.error || "Failed to record disbursement", "error");
        }
      }
      setIsGlobalDisburseModalOpen(false);
      setSelectedGlobalDisbursement(null);
    } catch {
      addToast("Failed to process disbursement", "error");
    }
  };

  const handleDeleteGlobalDisbursement = async (id) => {
    try {
      const res = await api.deleteGlobalDisbursement(id);
      if (res.success) {
        setGlobalDisbursements(prev => prev.filter(d => d.id !== id));
        addToast(`Capital draw #${id} deleted and partner balance restored.`, "info");
      } else {
        addToast(res.error || "Failed to delete disbursement", "error");
      }
    } catch {
      addToast("Failed to delete disbursement", "error");
    }
  };

  // ================= LOCAL ACTION HANDLERS =================
  // Local: Month Switch & Creation
  const handleSwitchLocalMonth = (newMonth) => {
    setLocalConfig(prev => ({ ...prev, activeMonth: newMonth }));
    api.updateLocalConfig({ activeMonth: newMonth });
    addToast(`Switched active billing cycle to ${newMonth}`, "info");
  };

  const handleCreateNewLocalMonth = async () => {
    const current = localConfig.activeMonth || '2026-03';
    const [y, m] = current.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (localConfig.allMonths.includes(nextStr)) {
      handleSwitchLocalMonth(nextStr);
      return;
    }

    const updatedMonths = [...localConfig.allMonths, nextStr];
    try {
      const res = await api.updateLocalConfig({ activeMonth: nextStr, allMonths: updatedMonths });
      if (res.success) {
        setLocalConfig(prev => ({ ...prev, activeMonth: nextStr, allMonths: updatedMonths }));
        addToast(`Created and transitioned to billing cycle: ${nextStr}`, "success");
      }
    } catch {
      addToast("Failed to initialize new billing cycle", "error");
    }
  };

  // Local: Alerts & Emails
  const handleSendSingleAlert = async (customerId) => {
    try {
      const res = await api.sendCustomerAlert(customerId);
      if (res.success) {
        addToast(`Automated alert email dispatched to ${res.data.customerName}!`, "success");
        // Refresh alerts and logs
        const [alertsRes, logsRes] = await Promise.all([api.getAlertsOverview(), api.getAlertLogs()]);
        if (alertsRes.success) setAlertsData(alertsRes.data);
        if (logsRes.success) setAlertLogs(logsRes.data);
      } else {
        addToast(res.error || "Failed to send alert email", "error");
      }
    } catch {
      addToast("SMTP delivery error while sending alert", "error");
    }
  };

  const handleSendBatchAlerts = async () => {
    try {
      const res = await api.sendBatchAlerts();
      if (res.success) {
        addToast(`Batch complete: Dispatched ${res.sentCount} alert emails!`, "success");
        const [alertsRes, logsRes] = await Promise.all([api.getAlertsOverview(), api.getAlertLogs()]);
        if (alertsRes.success) setAlertsData(alertsRes.data);
        if (logsRes.success) setAlertLogs(logsRes.data);
      } else {
        addToast(res.error || "Failed to send batch alerts", "error");
      }
    } catch {
      addToast("Batch alert delivery failed", "error");
    }
  };

  // Local: Yard Machine
  const handleSaveLocalYardMachine = async (machineData) => {
    try {
      if (selectedLocalYardMachine) {
        const res = await api.updateLocalMachine(selectedLocalYardMachine.id, machineData);
        if (res.success) {
          setLocalMachines(prev => prev.map(m => m.id === selectedLocalYardMachine.id ? res.data : m));
          addToast("Yard machinery unit updated successfully!", "success");
        }
      } else {
        const res = await api.addLocalMachine(machineData);
        if (res.success) {
          setLocalMachines(prev => [res.data, ...prev]);
          addToast("New machine registered into Kosgama Yard Fleet!", "success");
        }
      }
      setIsLocalYardMachineModalOpen(false);
      setSelectedLocalYardMachine(null);
    } catch {
      addToast("Failed to save yard machine", "error");
    }
  };

  const handleDeleteLocalYardMachine = async (id) => {
    try {
      const res = await api.deleteLocalMachine(id);
      if (res.success) {
        setLocalMachines(prev => prev.filter(m => m.id !== id));
        addToast("Machine removed from yard fleet.", "info");
      }
    } catch {
      addToast("Failed to delete machine", "error");
    }
  };

  // Local: Customer Add/Edit
  const handleSaveLocalCustomer = async (custData) => {
    try {
      if (localCustomerModalMode === 'EDIT' && selectedLocalCustomer) {
        const res = await api.updateLocalCustomer(selectedLocalCustomer.id, custData);
        if (res.success) {
          setLocalCustomers(prev => prev.map(c => c.id === selectedLocalCustomer.id ? res.data : c));
          addToast("Client account & machinery allocations updated!", "success");
        }
      } else {
        const res = await api.addLocalCustomer(custData);
        if (res.success) {
          setLocalCustomers(prev => [res.data, ...prev]);
          addToast("New Garment Manufacturer registered!", "success");
        }
      }
      setIsLocalCustomerModalOpen(false);
      setSelectedLocalCustomer(null);
      // Refresh alerts
      api.getAlertsOverview().then(r => r.success && setAlertsData(r.data));
    } catch {
      addToast("Failed to save customer", "error");
    }
  };

  const handleToggleArchiveLocalCustomer = async (cust) => {
    try {
      const updated = { ...cust, isArchived: !cust.isArchived };
      const res = await api.updateLocalCustomer(cust.id, updated);
      if (res.success) {
        setLocalCustomers(prev => prev.map(c => c.id === cust.id ? res.data : c));
        addToast(cust.isArchived ? "Customer unarchived!" : "Customer archived.", "info");
      }
    } catch {
      addToast("Failed to archive customer", "error");
    }
  };

  const handleDeleteLocalCustomer = async (id) => {
    try {
      const res = await api.deleteLocalCustomer(id);
      if (res.success) {
        setLocalCustomers(prev => prev.filter(c => c.id !== id));
        addToast("Customer deleted from database.", "info");
      }
    } catch {
      addToast("Failed to delete customer", "error");
    }
  };

  const handleAssignCustomerMachine = async (customerId, newRental) => {
    try {
      const customer = localCustomers.find(c => c.id === customerId);
      if (!customer) return;
      const updatedRentals = [...(customer.rentals || []), newRental];
      const res = await api.updateLocalCustomer(customerId, { rentals: updatedRentals });
      if (res.success) {
        setLocalCustomers(prev => prev.map(c => c.id === customerId ? res.data : c));
        addToast(`Assigned ${newRental.model} (${newRental.serialNumber}) to ${customer.name}!`, "success");
        // refresh alerts
        api.getAlertsOverview().then(r => r.success && setAlertsData(r.data));
      }
    } catch {
      addToast("Failed to assign machine to client", "error");
    }
  };

  // Local: Payments
  const handleSaveLocalPayment = async (payData) => {
    try {
      if (localPaymentModalMode === 'EDIT' && selectedLocalPayment) {
        const res = await api.updateLocalPayment(selectedLocalPayment.id, payData);
        if (res.success) {
          setLocalPayments(prev => prev.map(p => p.id === selectedLocalPayment.id ? res.data : p));
          addToast("Payment record updated!", "success");
        }
      } else {
        const res = await api.addLocalPayment(payData);
        if (res.success) {
          setLocalPayments(prev => [res.data, ...prev]);
          addToast(`Rent payment of LKR ${payData.amount} recorded!`, "success");
        }
      }
      setIsLocalPaymentModalOpen(false);
      setSelectedLocalPayment(null);
      setPrefilledPaymentCustomer(null);
      // Refresh alerts
      api.getAlertsOverview().then(r => r.success && setAlertsData(r.data));
    } catch {
      addToast("Failed to save payment", "error");
    }
  };

  const handleDeleteLocalPayment = async (id) => {
    if (!window.confirm("Rollback and delete this payment record?")) return;
    try {
      const res = await api.deleteLocalPayment(id);
      if (res.success) {
        setLocalPayments(prev => prev.filter(p => p.id !== id));
        addToast("Payment rolled back.", "info");
        api.getAlertsOverview().then(r => r.success && setAlertsData(r.data));
      }
    } catch {
      addToast("Failed to delete payment", "error");
    }
  };

  // Local: Machine Returns
  const handleConfirmMachineReturn = async (returnData) => {
    try {
      const customer = localCustomers.find(c => c.id === returnData.customerId);
      if (!customer) return;

      const updatedRentals = (customer.rentals || []).map(r => {
        if (r.machineId === returnData.machineId) {
          return {
            ...r,
            status: 'Returned',
            returnDate: returnData.returnDate,
            returnDetails: returnData
          };
        }
        return r;
      });

      const res = await api.updateLocalCustomer(customer.id, { rentals: updatedRentals });
      if (res.success) {
        setLocalCustomers(prev => prev.map(c => c.id === customer.id ? res.data : c));
        setIsLocalReturnModalOpen(false);
        setSelectedReturnCustomer(null);
        setPrefilledReturnRental(null);

        // Open official Return Note print modal automatically
        setLocalDocModalData({
          type: 'RETURN_NOTE',
          customer,
          returnedMachines: [{
            model: returnData.model,
            serialNumber: returnData.serialNumber,
            rentRate: returnData.deductAmount
          }],
          meta: returnData
        });

        addToast("Machine returned to Kosgama Central Yard. Return Note generated!", "success");
      }
    } catch {
      addToast("Failed to process machine return", "error");
    }
  };

  const handleRollbackMachineReturn = async (customerId, machineId) => {
    if (!window.confirm("Rollback this returned machine and reactivate its monthly hire?")) return;
    try {
      const customer = localCustomers.find(c => c.id === customerId);
      if (!customer) return;

      const updatedRentals = (customer.rentals || []).map(r => {
        if (r.machineId === machineId) {
          return {
            ...r,
            status: 'Active',
            returnDate: null,
            returnDetails: null
          };
        }
        return r;
      });

      const res = await api.updateLocalCustomer(customer.id, { rentals: updatedRentals });
      if (res.success) {
        setLocalCustomers(prev => prev.map(c => c.id === customer.id ? res.data : c));
        addToast("Return rolled back! Machine is now Active on hire.", "info");
      }
    } catch {
      addToast("Failed to rollback return", "error");
    }
  };

  // Local: Partners
  const handleSaveLocalPartner = async (partnerData) => {
    try {
      if (selectedLocalPartner) {
        const res = await api.updateLocalPartner(selectedLocalPartner.id, partnerData);
        if (res.success) {
          setLocalPartners(prev => prev.map(p => p.id === selectedLocalPartner.id ? res.data : p));
          addToast("Partner account updated!", "success");
        }
      } else {
        const res = await api.addLocalPartner(partnerData);
        if (res.success) {
          setLocalPartners(prev => [res.data, ...prev]);
          addToast("New sourcing partner registered!", "success");
        }
      }
      setIsLocalPartnerModalOpen(false);
      setSelectedLocalPartner(null);
    } catch {
      addToast("Failed to save partner", "error");
    }
  };

  const handleDeleteLocalPartner = async (partner) => {
    if (!window.confirm(`Delete partner ${partner.name}?`)) return;
    try {
      const res = await api.deleteLocalPartner(partner.id);
      if (res.success) {
        setLocalPartners(prev => prev.filter(p => p.id !== partner.id));
        addToast("Partner deleted.", "info");
      }
    } catch {
      addToast("Failed to delete partner", "error");
    }
  };

  // Local Partner Sub-Actions
  const handleSavePartnerPurchase = async (partnerId, purchaseData) => {
    try {
      const partner = localPartners.find(p => p.id === partnerId);
      if (!partner) return;
      const updatedPurchases = [
        ...(partner.purchases || []),
        { id: 'pur_' + Date.now(), ...purchaseData }
      ];
      const res = await api.updateLocalPartner(partnerId, { purchases: updatedPurchases });
      if (res.success) {
        setLocalPartners(prev => prev.map(p => p.id === partnerId ? res.data : p));
        setIsLocalPurchaseModalOpen(false);
        addToast("Inward sourced purchase recorded!", "success");
      }
    } catch {
      addToast("Failed to record purchase", "error");
    }
  };

  const handleSavePartnerReturn = async (partnerId, returnData) => {
    try {
      const partner = localPartners.find(p => p.id === partnerId);
      if (!partner) return;
      const updatedReturns = [
        ...(partner.returns || []),
        { id: 'ret_' + Date.now(), ...returnData }
      ];
      const res = await api.updateLocalPartner(partnerId, { returns: updatedReturns });
      if (res.success) {
        setLocalPartners(prev => prev.map(p => p.id === partnerId ? res.data : p));
        setIsLocalPartnerReturnModalOpen(false);
        addToast("Debit note return recorded!", "success");
      }
    } catch {
      addToast("Failed to record return", "error");
    }
  };

  const handleSavePartnerPayment = async (partnerId, paymentData) => {
    try {
      const partner = localPartners.find(p => p.id === partnerId);
      if (!partner) return;
      const updatedPayments = [
        ...(partner.payments || []),
        { id: 'pay_' + Date.now(), ...paymentData }
      ];
      const res = await api.updateLocalPartner(partnerId, { payments: updatedPayments });
      if (res.success) {
        setLocalPartners(prev => prev.map(p => p.id === partnerId ? res.data : p));
        setIsLocalPartnerPaymentModalOpen(false);
        addToast("Partner payment voucher recorded!", "success");
      }
    } catch {
      addToast("Failed to record partner payment", "error");
    }
  };

  const handleDeletePartnerPurchase = async (partnerId, purId) => {
    try {
      const partner = localPartners.find(p => p.id === partnerId);
      if (!partner) return;
      const updatedPurchases = (partner.purchases || []).filter(p => p.id !== purId);
      const res = await api.updateLocalPartner(partnerId, { purchases: updatedPurchases });
      if (res.success) {
        setLocalPartners(prev => prev.map(p => p.id === partnerId ? res.data : p));
        addToast("Purchase removed.", "info");
      }
    } catch {
      addToast("Failed to remove purchase", "error");
    }
  };

  const handleDeletePartnerReturn = async (partnerId, retId) => {
    try {
      const partner = localPartners.find(p => p.id === partnerId);
      if (!partner) return;
      const updatedReturns = (partner.returns || []).filter(r => r.id !== retId);
      const res = await api.updateLocalPartner(partnerId, { returns: updatedReturns });
      if (res.success) {
        setLocalPartners(prev => prev.map(p => p.id === partnerId ? res.data : p));
        addToast("Return removed.", "info");
      }
    } catch {
      addToast("Failed to remove return", "error");
    }
  };

  // Local: Expenses
  const handleSaveLocalExpense = async (expData) => {
    try {
      if (selectedLocalExpense) {
        const res = await api.updateLocalExpense(selectedLocalExpense.id, expData);
        if (res.success) {
          setLocalExpenses(prev => prev.map(e => e.id === selectedLocalExpense.id ? res.data : e));
          addToast("Expense record updated!", "success");
        }
      } else {
        const res = await api.addLocalExpense(expData);
        if (res.success) {
          setLocalExpenses(prev => [res.data, ...prev]);
          addToast("Yard expense recorded!", "success");
        }
      }
      setIsLocalExpenseModalOpen(false);
      setSelectedLocalExpense(null);
    } catch {
      addToast("Failed to save expense", "error");
    }
  };

  const handleDeleteLocalExpense = async (id) => {
    if (!window.confirm("Delete this expense item?")) return;
    try {
      const res = await api.deleteLocalExpense(id);
      if (res.success) {
        setLocalExpenses(prev => prev.filter(e => e.id !== id));
        addToast("Expense deleted.", "info");
      }
    } catch {
      addToast("Failed to delete expense", "error");
    }
  };

  // Master Audit Export
  const handleExportAudit = async () => {
    try {
      const res = await api.exportFullAudit();
      if (res.success) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ANUJAYA_CONSORTIUM_FULL_AUDIT_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addToast("Master system audit export package downloaded!", "success");
      }
    } catch {
      addToast("Failed to export system audit", "error");
    }
  };

  // If user is not logged in, enforce LoginModal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-carbon-950 text-white flex items-center justify-center p-4">
        <LoginModal currentPath={currentPath} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const isGlobal = currentPath === 'global';

  return (
    <div className="min-h-screen bg-carbon-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />

      {/* Top Consortium Header & Portal Switcher */}
      <Navbar
        currentPath={currentPath}
        onPathChange={handlePathChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentLang={currentLang}
        onToggleLang={() => setCurrentLang(l => l === 'en' ? 'si' : 'en')}
        usdRate={globalConfig.usdRate || 330}
        onUsdRateChange={handleUsdRateChange}
        dbStatus={dbStatus}
        onExportAudit={handleExportAudit}
        onTriggerImport={() => addToast("Use server dual-persistence sync", "info")}
        onRecalculateStock={() => addToast("Stock valuation automatically refreshed against spot rate.", "info")}
      />

      {/* Main Container with Vertical Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1920px] mx-auto min-h-[calc(100vh-73px)]">
        
        {/* ================= VERTICAL SIDEBAR ================= */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-carbon-900/90 backdrop-blur-2xl border-r border-b md:border-b-0 border-carbon-800/80 p-4 lg:p-5 flex flex-col justify-between md:sticky md:top-[73px] md:h-[calc(100vh-73px)] overflow-y-auto no-print z-20 space-y-6">
          <div className="space-y-6">
            
            {/* Sidebar Header Section */}
            <div className="px-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider pb-2 border-b border-carbon-800/80">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isGlobal ? 'Consortium Fleet' : 'Central Rental Yard'}
                </span>
                <button
                  onClick={fetchAllData}
                  title="Refresh All Database Records"
                  className="p-1 rounded-lg hover:bg-carbon-800 text-slate-400 hover:text-sky-400 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs - VERTICAL SIDEBAR */}
            <nav className="space-y-1 font-mono text-xs">
              {isGlobal ? (
                // ================= GLOBAL PATH VERTICAL SIDEBAR ITEMS =================
                <>
                  <button
                    onClick={() => setActiveGlobalTab('dashboard')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeGlobalTab === 'dashboard'
                        ? 'bg-gradient-to-r from-sky-600/30 to-emerald-600/20 text-white border-l-4 border-sky-400 shadow-md shadow-sky-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className={`w-4 h-4 ${activeGlobalTab === 'dashboard' ? 'text-sky-400' : 'text-slate-400 group-hover:text-sky-400'}`} />
                      <span>Executive Dashboard</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveGlobalTab('inventory')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeGlobalTab === 'inventory'
                        ? 'bg-gradient-to-r from-sky-600/30 to-emerald-600/20 text-white border-l-4 border-sky-400 shadow-md shadow-sky-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Boxes className={`w-4 h-4 ${activeGlobalTab === 'inventory' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                      <span>Fleet Warehouse</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-carbon-800 border border-carbon-700 text-emerald-300 font-bold">
                      {globalMachines.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveGlobalTab('ledger')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeGlobalTab === 'ledger'
                        ? 'bg-gradient-to-r from-sky-600/30 to-emerald-600/20 text-white border-l-4 border-sky-400 shadow-md shadow-sky-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className={`w-4 h-4 ${activeGlobalTab === 'ledger' ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`} />
                      <span>Sales & Invoices</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-carbon-800 border border-carbon-700 text-amber-300 font-bold">
                      {(globalSales || []).filter(s => !s.cancelled).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveGlobalTab('customers')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeGlobalTab === 'customers'
                        ? 'bg-gradient-to-r from-sky-600/30 to-emerald-600/20 text-white border-l-4 border-sky-400 shadow-md shadow-sky-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className={`w-4 h-4 ${activeGlobalTab === 'customers' ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'}`} />
                      <span>Apparel Clients</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveGlobalTab('settlement')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeGlobalTab === 'settlement'
                        ? 'bg-gradient-to-r from-sky-600/30 to-emerald-600/20 text-white border-l-4 border-sky-400 shadow-md shadow-sky-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Scale className={`w-4 h-4 ${activeGlobalTab === 'settlement' ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400'}`} />
                      <span>50/50 Equity Audit</span>
                    </div>
                  </button>
                </>
              ) : (
                // ================= LOCAL RENTAL VERTICAL SIDEBAR ITEMS =================
                <>
                  <button
                    onClick={() => setActiveLocalTab('dashboard')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeLocalTab === 'dashboard'
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-white border-l-4 border-emerald-400 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className={`w-4 h-4 ${activeLocalTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>Rental Operations</span>
                    </div>
                    {alertsData?.counts?.total > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveLocalTab('yard_warehouse')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeLocalTab === 'yard_warehouse'
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-white border-l-4 border-emerald-400 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Warehouse className={`w-4 h-4 ${activeLocalTab === 'yard_warehouse' ? 'text-teal-400' : 'text-slate-400'}`} />
                      <span>Kosgama Fleet</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-carbon-800 border border-carbon-700 text-teal-300 font-bold">
                      {localMachines.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveLocalTab('customers')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeLocalTab === 'customers'
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-white border-l-4 border-emerald-400 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className={`w-4 h-4 ${activeLocalTab === 'customers' ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>Garment Clients</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-carbon-800 border border-carbon-700 text-sky-300 font-bold">
                      {localCustomers.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveLocalTab('payments')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeLocalTab === 'payments'
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-white border-l-4 border-emerald-400 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-4 h-4 ${activeLocalTab === 'payments' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>Collections Ledger</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveLocalTab('yard_returns')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeLocalTab === 'yard_returns'
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-white border-l-4 border-emerald-400 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className={`w-4 h-4 ${activeLocalTab === 'yard_returns' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Equipment Returns</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveLocalTab('expenses')}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold transition flex items-center justify-between text-left group ${
                      activeLocalTab === 'expenses'
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-white border-l-4 border-emerald-400 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-carbon-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className={`w-4 h-4 ${activeLocalTab === 'expenses' ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span>Operating Expenses</span>
                    </div>
                  </button>
                </>
              )}
            </nav>

            {/* Quick Live Snapshot Widget in Sidebar */}
            <div className="p-3.5 rounded-2xl bg-carbon-950/80 border border-carbon-800/80 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                {isGlobal ? 'Consortium Quick Status' : 'Yard Active Month'}
              </span>
              {isGlobal ? (
                <>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-[11px] text-slate-400">Total Models:</span>
                    <span className="font-bold text-white">{globalMachines.length} SKU</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-[11px] text-slate-400">Spot USD Rate:</span>
                    <span className="font-bold text-amber-300">{globalConfig.usdRate || 330} LKR</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-[11px] text-slate-400">Total Sold:</span>
                    <span className="font-bold text-emerald-400">{globalMetrics.totalUnitsSold || 0} Sets</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-[11px] text-slate-400">Billing Cycle:</span>
                    <span className="font-bold text-white">{localConfig.activeMonth || '2026-03'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-[11px] text-slate-400">Active Rentals:</span>
                    <span className="font-bold text-emerald-400">{localMetrics.totalActiveMachines || 0} Sets</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-carbon-800/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Terminal: {currentUser?.role || 'Guest'}</span>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>
        </aside>

        {/* ================= MAIN CONTENT VIEWPORT ================= */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {isGlobal ? (
            // ================= GLOBAL PATH VIEWS =================
            <div>
              {activeGlobalTab === 'dashboard' && (
                <GlobalDashboard
                  metrics={globalMetrics}
                  recentSales={enrichedRecentSales}
                  brandBreakdown={globalBrandBreakdown}
                  onResetBaseline={handleResetGlobalBaseline}
                  onOpenSaleModal={() => { setSelectedGlobalSale(null); setIsGlobalSaleModalOpen(true); }}
                  onOpenMachineModal={() => { setSelectedGlobalMachine(null); setIsGlobalMachineModalOpen(true); }}
                  onPrintInvoice={(saleItem) => {
                    const saleObj = typeof saleItem === 'string'
                      ? globalSales.find(s => s.id === saleItem)
                      : saleItem;
                    if (saleObj) {
                      const machine = globalMachines.find(m => m.id === saleObj.machineId);
                      setGlobalTaxInvoiceData({ sale: saleObj, machine });
                    }
                  }}
                  currentUser={currentUser}
                  currentLang={currentLang}
                  usdRate={globalConfig.usdRate || 330}
                />
              )}

              {activeGlobalTab === 'inventory' && (
                <GlobalMachineryMaster
                  machines={globalMachines}
                  sales={globalSales}
                  usdRate={globalConfig.usdRate || 330}
                  onOpenAddModal={() => { setSelectedGlobalMachine(null); setIsGlobalMachineModalOpen(true); }}
                  onOpenEditModal={(m) => { setSelectedGlobalMachine(m); setIsGlobalMachineModalOpen(true); }}
                  onDeleteMachine={handleDeleteGlobalMachine}
                  onPrefillSale={(m) => {
                    setSelectedGlobalSale({ machineId: m.id, unitPrice: m.wholesalePrice || m.retailPrice });
                    setIsGlobalSaleModalOpen(true);
                  }}
                  currentUser={currentUser}
                />
              )}

              {activeGlobalTab === 'ledger' && (
                <GlobalSalesLedger
                  sales={globalSales}
                  machines={globalMachines}
                  usdRate={globalConfig.usdRate || 330}
                  onOpenSaleModal={() => { setSelectedGlobalSale(null); setIsGlobalSaleModalOpen(true); }}
                  onOpenEditSaleModal={(s) => { setSelectedGlobalSale(s); setIsGlobalSaleModalOpen(true); }}
                  onDeleteSale={handleDeleteGlobalSale}
                  onRestoreSale={handleRestoreGlobalSale}
                  onPermanentDeleteSale={handlePermanentDeleteGlobalSale}
                  onMarkFullyPaid={handleMarkGlobalSaleFullyPaid}
                  onPrintInvoice={(saleItem) => {
                    const saleObj = typeof saleItem === 'string'
                      ? globalSales.find(s => s.id === saleItem)
                      : saleItem;
                    if (saleObj) {
                      const machine = globalMachines.find(m => m.id === saleObj.machineId);
                      setGlobalTaxInvoiceData({ sale: saleObj, machine });
                    }
                  }}
                  currentUser={currentUser}
                />
              )}

              {activeGlobalTab === 'customers' && (
                <GlobalApparelClients
                  clients={globalClients}
                  sales={globalSales}
                  onOpenAddClient={() => {
                    setSelectedGlobalClient(null);
                    setGlobalClientModalMode('ADD');
                    setIsGlobalClientModalOpen(true);
                  }}
                  onOpenEditClient={(c) => {
                    setSelectedGlobalClient(c);
                    setGlobalClientModalMode('EDIT');
                    setIsGlobalClientModalOpen(true);
                  }}
                  onDeleteClient={handleDeleteGlobalClient}
                  currentUser={currentUser}
                  onPrintInvoice={(saleItem) => {
                    const saleObj = typeof saleItem === 'string'
                      ? globalSales.find(s => s.id === saleItem)
                      : saleItem;
                    if (saleObj) {
                      const machine = globalMachines.find(m => m.id === saleObj.machineId);
                      setGlobalTaxInvoiceData({ sale: saleObj, machine });
                    }
                  }}
                />
              )}

              {activeGlobalTab === 'settlement' && (
                <GlobalPartnerSettlement
                  metrics={globalMetrics}
                  disbursements={globalDisbursements}
                  onOpenDisburseModal={() => {
                    setSelectedGlobalDisbursement(null);
                    setGlobalDisburseModalMode('ADD');
                    setIsGlobalDisburseModalOpen(true);
                  }}
                  onEditDisbursement={(d) => {
                    setSelectedGlobalDisbursement(d);
                    setGlobalDisburseModalMode('EDIT');
                    setIsGlobalDisburseModalOpen(true);
                  }}
                  onDeleteDisbursement={handleDeleteGlobalDisbursement}
                  currentUser={currentUser}
                  usdRate={globalConfig.usdRate || 330}
                />
              )}
            </div>
          ) : (
            // ================= LOCAL RENTAL PATH VIEWS =================
            <div>
              {activeLocalTab === 'dashboard' && (
                <LocalDashboard
                  metrics={localMetrics}
                  alertsData={alertsData}
                  onSendAlert={handleSendSingleAlert}
                  onSendBatchAlerts={handleSendBatchAlerts}
                  onOpenAlertLogs={() => setIsLocalAlertLogsModalOpen(true)}
                  activeMonth={localConfig.activeMonth || '2026-03'}
                  allMonths={localConfig.allMonths || ['2026-01', '2026-02', '2026-03']}
                  onSwitchMonth={handleSwitchLocalMonth}
                  onCreateNewMonth={handleCreateNewLocalMonth}
                  onOpenNewCustomerModal={() => {
                    setLocalCustomerModalMode('ADD');
                    setSelectedLocalCustomer(null);
                    setIsLocalCustomerModalOpen(true);
                  }}
                  onOpenNewPaymentModal={() => {
                    setLocalPaymentModalMode('ADD');
                    setSelectedLocalPayment(null);
                    setPrefilledPaymentCustomer(null);
                    setIsLocalPaymentModalOpen(true);
                  }}
                  onOpenQuotationModal={() => setIsLocalQuotationModalOpen(true)}
                  systemLang={currentLang}
                />
              )}

              {activeLocalTab === 'yard_warehouse' && (
                <LocalMachineryMaster
                  machines={localMachines}
                  customers={localCustomers}
                  onOpenAddModal={() => { setSelectedLocalYardMachine(null); setIsLocalYardMachineModalOpen(true); }}
                  onOpenEditModal={(m) => { setSelectedLocalYardMachine(m); setIsLocalYardMachineModalOpen(true); }}
                  onDeleteMachine={handleDeleteLocalYardMachine}
                  onQuickAssignCustomer={() => {
                    setLocalCustomerModalMode('ADD');
                    setIsLocalCustomerModalOpen(true);
                  }}
                />
              )}

              {activeLocalTab === 'customers' && (
                <LocalCustomerDirectory
                  customers={localCustomers}
                  payments={localPayments}
                  machines={localMachines}
                  activeMonth={localConfig.activeMonth || 'August 2026'}
                  allMonths={localConfig.allMonths || ['August 2026', 'September 2026', 'October 2026', 'November 2026']}
                  onSwitchMonth={handleSwitchLocalMonth}
                  onAssignMachine={handleAssignCustomerMachine}
                  onOpenNewCustomer={() => {
                    setLocalCustomerModalMode('ADD');
                    setSelectedLocalCustomer(null);
                    setIsLocalCustomerModalOpen(true);
                  }}
                  onOpenEditCustomer={(c) => {
                    setLocalCustomerModalMode('EDIT');
                    setSelectedLocalCustomer(c);
                    setIsLocalCustomerModalOpen(true);
                  }}
                  onOpenPaymentModal={(c) => {
                    setLocalPaymentModalMode('ADD');
                    setPrefilledPaymentCustomer(c);
                    setSelectedLocalPayment(null);
                    setIsLocalPaymentModalOpen(true);
                  }}
                  onOpenReturnModal={(c) => {
                    setSelectedReturnCustomer(c);
                    setPrefilledReturnRental(null);
                    setIsLocalReturnModalOpen(true);
                  }}
                  onRollbackReturn={handleRollbackMachineReturn}
                  onToggleArchive={handleToggleArchiveLocalCustomer}
                  onDeleteCustomer={handleDeleteLocalCustomer}
                  onPrintDoc={(docData) => setLocalDocModalData(docData)}
                />
              )}

              {activeLocalTab === 'payments' && (
                <LocalPaymentsLedger
                  payments={localPayments}
                  customers={localCustomers}
                  activeMonth={localConfig.activeMonth || '2026-03'}
                  onOpenNewPayment={() => {
                    setLocalPaymentModalMode('ADD');
                    setSelectedLocalPayment(null);
                    setPrefilledPaymentCustomer(null);
                    setIsLocalPaymentModalOpen(true);
                  }}
                  onOpenEditPayment={(pay) => {
                    setLocalPaymentModalMode('EDIT');
                    setSelectedLocalPayment(pay);
                    setIsLocalPaymentModalOpen(true);
                  }}
                  onDeletePayment={handleDeleteLocalPayment}
                  onPrintReceipt={(docData) => setLocalDocModalData(docData)}
                />
              )}

              {activeLocalTab === 'yard_returns' && (
                <LocalReturnsWorkflow
                  customers={localCustomers}
                  onRollbackReturn={handleRollbackMachineReturn}
                  onPrintReturnNote={(docData) => setLocalDocModalData(docData)}
                />
              )}

              {activeLocalTab === 'expenses' && (
                <LocalExpensesLedger
                  expenses={localExpenses}
                  onOpenNewExpense={() => { setSelectedLocalExpense(null); setIsLocalExpenseModalOpen(true); }}
                  onOpenEditExpense={(e) => { setSelectedLocalExpense(e); setIsLocalExpenseModalOpen(true); }}
                  onDeleteExpense={handleDeleteLocalExpense}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL CONTAINERS ================= */}
      {/* Global Modals */}
      <GlobalSaleModal
        isOpen={isGlobalSaleModalOpen}
        initialData={selectedGlobalSale}
        sale={selectedGlobalSale}
        machines={globalMachines}
        clients={globalClients}
        usdRate={globalConfig.usdRate || 330}
        currentUser={currentUser}
        onClose={() => setIsGlobalSaleModalOpen(false)}
        onSave={handleSaveGlobalSale}
        onSubmit={handleSaveGlobalSale}
        onOpenAddClientModal={() => {
          setSelectedGlobalClient(null);
          setGlobalClientModalMode('ADD');
          setIsGlobalClientModalOpen(true);
        }}
      />

      <GlobalMachineModal
        isOpen={isGlobalMachineModalOpen}
        initialData={selectedGlobalMachine}
        machine={selectedGlobalMachine}
        machines={globalMachines}
        usdRate={globalConfig.usdRate || 330}
        onClose={() => setIsGlobalMachineModalOpen(false)}
        onSave={handleSaveGlobalMachine}
        onSubmit={handleSaveGlobalMachine}
      />

      <GlobalClientModal
        isOpen={isGlobalClientModalOpen}
        mode={globalClientModalMode}
        client={selectedGlobalClient}
        clients={globalClients}
        onClose={() => setIsGlobalClientModalOpen(false)}
        onSave={handleSaveGlobalClient}
      />

      <GlobalDisburseModal
        isOpen={isGlobalDisburseModalOpen}
        mode={globalDisburseModalMode}
        initialData={selectedGlobalDisbursement}
        disbursement={selectedGlobalDisbursement}
        metrics={globalMetrics}
        onClose={() => setIsGlobalDisburseModalOpen(false)}
        onSave={handleSaveGlobalDisbursement}
        onSubmit={handleSaveGlobalDisbursement}
      />

      {globalTaxInvoiceData && (
        <GlobalTaxInvoiceModal
          sale={globalTaxInvoiceData.sale}
          machine={globalTaxInvoiceData.machine}
          usdRate={globalConfig.usdRate || 330}
          onClose={() => setGlobalTaxInvoiceData(null)}
        />
      )}

      {/* Local Modals */}
      <LocalYardMachineModal
        isOpen={isLocalYardMachineModalOpen}
        machine={selectedLocalYardMachine}
        onClose={() => setIsLocalYardMachineModalOpen(false)}
        onSave={handleSaveLocalYardMachine}
      />

      <LocalCustomerModal
        isOpen={isLocalCustomerModalOpen}
        mode={localCustomerModalMode}
        initialData={selectedLocalCustomer}
        onClose={() => setIsLocalCustomerModalOpen(false)}
        onSubmit={handleSaveLocalCustomer}
      />

      <LocalPaymentModal
        isOpen={isLocalPaymentModalOpen}
        customers={localCustomers}
        prefilledCustomer={prefilledPaymentCustomer}
        activeMonth={localConfig.activeMonth || '2026-03'}
        initialData={selectedLocalPayment}
        mode={localPaymentModalMode}
        onClose={() => setIsLocalPaymentModalOpen(false)}
        onSubmit={handleSaveLocalPayment}
      />

      <LocalReturnModal
        isOpen={isLocalReturnModalOpen}
        customer={selectedReturnCustomer}
        prefilledRental={prefilledReturnRental}
        onClose={() => setIsLocalReturnModalOpen(false)}
        onSubmit={handleConfirmMachineReturn}
      />

      <LocalPartnerModal
        isOpen={isLocalPartnerModalOpen}
        partner={selectedLocalPartner}
        onClose={() => setIsLocalPartnerModalOpen(false)}
        onSave={handleSaveLocalPartner}
      />

      <LocalPartnerPurchaseModal
        isOpen={isLocalPurchaseModalOpen}
        partner={selectedPartnerForPurchase}
        onClose={() => setIsLocalPurchaseModalOpen(false)}
        onSave={handleSavePartnerPurchase}
      />

      <LocalPartnerReturnModal
        isOpen={isLocalPartnerReturnModalOpen}
        partner={selectedPartnerForReturn}
        onClose={() => setIsLocalPartnerReturnModalOpen(false)}
        onSave={handleSavePartnerReturn}
      />

      <LocalPartnerPaymentModal
        isOpen={isLocalPartnerPaymentModalOpen}
        partner={selectedPartnerForPayment}
        onClose={() => setIsLocalPartnerPaymentModalOpen(false)}
        onSave={handleSavePartnerPayment}
      />

      <LocalExpenseModal
        isOpen={isLocalExpenseModalOpen}
        expense={selectedLocalExpense}
        onClose={() => setIsLocalExpenseModalOpen(false)}
        onSave={handleSaveLocalExpense}
      />

      <LocalAlertLogsModal
        isOpen={isLocalAlertLogsModalOpen}
        logs={alertLogs}
        onClose={() => setIsLocalAlertLogsModalOpen(false)}
      />

      <LocalQuotationModal
        isOpen={isLocalQuotationModalOpen}
        onClose={() => setIsLocalQuotationModalOpen(false)}
        onGenerateQuotation={(quotation) => {
          setIsLocalQuotationModalOpen(false);
          setLocalDocModalData({
            type: 'QUOTATION',
            quotation
          });
        }}
      />

      {/* 10 Documents Modal (Print Engine) */}
      <LocalDocumentsModal
        docData={localDocModalData}
        companyInfo={localConfig.companyInfo}
        bankInfo={localConfig.bankInfo}
        onClose={() => setLocalDocModalData(null)}
      />
    </div>
  );
}
