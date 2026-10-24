import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  LayoutDashboard, 
  Boxes, 
  Users, 
  Send, 
  Handshake, 
  ShieldAlert, 
  Warehouse, 
  Printer, 
  PlusCircle, 
  FileSpreadsheet, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Trash2
} from 'lucide-react';
import { api } from '../../../services/api';

// Subcomponents
import { ChinaDashboardTab } from './ChinaDashboardTab';
import { ChinaShipmentItemsTab } from './ChinaShipmentItemsTab';
import { ChinaPartnerFundingTab } from './ChinaPartnerFundingTab';
import { ChinaSupplierPaymentsTab } from './ChinaSupplierPaymentsTab';
import { ChinaIntermediariesTab } from './ChinaIntermediariesTab';
import { ChinaCustomsExpensesTab } from './ChinaCustomsExpensesTab';
import { ChinaInventoryIntakeTab } from './ChinaInventoryIntakeTab';
import { ChinaReviewQueueTab } from './ChinaReviewQueueTab';

// Modals
import { RecordPartnerReceiptModal } from './RecordPartnerReceiptModal';
import { RecordSupplierPaymentModal } from './RecordSupplierPaymentModal';
import { RecordIntermediaryAdvanceModal } from './RecordIntermediaryAdvanceModal';
import { RecordCustomsExpenseModal } from './RecordCustomsExpenseModal';
import { NewShipmentModal } from './NewShipmentModal';
import { ChinaPrintableReportModal } from './ChinaPrintableReportModal';

export function ChinaImportModule({ currentUser, addToast, onRefreshGlobalMachines }) {
  const [shipments, setShipments] = useState([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  // Modal Open States
  const [isNewShipmentModalOpen, setIsNewShipmentModalOpen] = useState(false);
  const [isPartnerReceiptModalOpen, setIsPartnerReceiptModalOpen] = useState(false);
  const [editingPartnerReceipt, setEditingPartnerReceipt] = useState(null);
  const [isSupplierPaymentModalOpen, setIsSupplierPaymentModalOpen] = useState(false);
  const [editingSupplierPayment, setEditingSupplierPayment] = useState(null);
  const [isIntermediaryAdvanceModalOpen, setIsIntermediaryAdvanceModalOpen] = useState(false);
  const [editingIntermediaryAdvance, setEditingIntermediaryAdvance] = useState(null);
  const [targetIntermediaryId, setTargetIntermediaryId] = useState('');
  const [isCustomsExpenseModalOpen, setIsCustomsExpenseModalOpen] = useState(false);
  const [editingCustomsExpense, setEditingCustomsExpense] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch all shipments on load
  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await api.getChinaShipments();
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        setShipments(list);
        if (list.length > 0) {
          if (!selectedShipmentId || !list.find(s => s.id === selectedShipmentId)) {
            setSelectedShipmentId(list[0].id);
          }
        } else {
          setSelectedShipmentId('');
        }
      }
    } catch (err) {
      if (addToast) addToast("Failed to load China import shipments: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const activeShipment = shipments.find(s => s.id === selectedShipmentId) || shipments[0] || null;

  // Handlers
  const handleSavePartnerReceipt = async (receiptData) => {
    if (!activeShipment) return;
    try {
      const res = await api.addPartnerReceipt(activeShipment.id, {
        ...receiptData,
        recordedBy: currentUser?.title || "Admin"
      });
      if (res.success) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast(`Partner receipt ${receiptData.receiptId} recorded successfully!`, "success");
      } else throw new Error(res.error);
    } catch (err) {
      if (addToast) addToast("Failed to record partner receipt: " + err.message, "error");
    }
  };

  const handleSaveSupplierPayment = async (paymentData) => {
    if (!activeShipment) return;
    try {
      const res = await api.addSupplierPayment(activeShipment.id, {
        ...paymentData,
        recordedBy: currentUser?.title || "Admin"
      });
      if (res.success) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast(`China payment ${paymentData.trxId} recorded successfully!`, "success");
      } else throw new Error(res.error);
    } catch (err) {
      if (addToast) addToast("Failed to record China payment: " + err.message, "error");
    }
  };

  const handleSaveIntermediaryAdvance = async (advanceData) => {
    if (!activeShipment) return;
    try {
      const res = await api.addIntermediaryAdvance(activeShipment.id, {
        ...advanceData,
        recordedBy: currentUser?.title || "Admin"
      });
      if (res.success) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast(`Cash advance to ${advanceData.intermediaryName} recorded!`, "success");
      } else throw new Error(res.error);
    } catch (err) {
      if (addToast) addToast("Failed to record cash advance: " + err.message, "error");
    }
  };

  const handleSaveCustomsExpense = async (expenseData) => {
    if (!activeShipment) return;
    try {
      const res = await api.addCustomsExpense(activeShipment.id, expenseData);
      if (res.success) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast("Customs / clearing fee recorded!", "success");
      } else throw new Error(res.error);
    } catch (err) {
      if (addToast) addToast("Failed to record customs expense: " + err.message, "error");
    }
  };

  const handleCreateShipment = async (newShipmentData) => {
    try {
      const res = await api.addChinaShipment(newShipmentData);
      if (res.success) {
        setShipments(prev => [res.data, ...prev]);
        setSelectedShipmentId(res.data.id);
        if (addToast) addToast(`New shipment ${newShipmentData.shipmentNo} initialized!`, "success");
      } else throw new Error(res.error);
    } catch (err) {
      if (addToast) addToast("Failed to create shipment: " + err.message, "error");
    }
  };

  const handleExecuteGoodsReceipt = async (receiptPayload) => {
    if (!activeShipment) return;
    try {
      const res = await api.receiveChinaShipmentStock(activeShipment.id, receiptPayload);
      if (res.success) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (onRefreshGlobalMachines) onRefreshGlobalMachines();
        if (addToast) addToast("Physical stock intake successfully executed and synced to Warehouse!", "success");
      } else throw new Error(res.error);
    } catch (err) {
      if (addToast) addToast("Failed to execute stock intake: " + err.message, "error");
    }
  };

  const handleUpdateShipmentStatus = async (newStatus) => {
    if (!activeShipment) return;
    try {
      const res = await api.updateChinaShipment(activeShipment.id, { status: newStatus });
      if (res.success) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast(`Shipment status updated to: ${newStatus.toUpperCase()}`, "info");
      }
    } catch (err) {
      if (addToast) addToast("Failed to update shipment status: " + err.message, "error");
    }
  };

  const handleResolveFlag = async (recordId, targetStatus) => {
    if (!activeShipment) return;
    try {
      const updatedFlags = (activeShipment.historicalReviewFlags || []).map(f => {
        if (f.recordId === recordId) {
          return { ...f, status: targetStatus };
        }
        return f;
      });
      const res = await api.updateChinaShipment(activeShipment.id, { historicalReviewFlags: updatedFlags });
      if (res.success) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast(`Audit flag for ${recordId} updated to ${targetStatus}`, "info");
      }
    } catch (err) {
      if (addToast) addToast("Failed to update flag: " + err.message, "error");
    }
  };

  // ─── Sub-record delete handlers ─────────────────────────────────────────────
  const handleDeletePartnerReceipt = async (recordId) => {
    if (!activeShipment || !window.confirm('Delete this partner receipt record?')) return;
    try {
      const res = await api.deletePartnerReceipt(activeShipment.id, recordId);
      if (res.success !== false) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast('Partner receipt deleted.', 'success');
      } else throw new Error(res.error);
    } catch (err) { if (addToast) addToast('Delete failed: ' + err.message, 'error'); }
  };

  const handleDeleteSupplierPayment = async (recordId) => {
    if (!activeShipment || !window.confirm('Delete this supplier payment record?')) return;
    try {
      const res = await api.deleteSupplierPayment(activeShipment.id, recordId);
      if (res.success !== false) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast('Supplier payment deleted.', 'success');
      } else throw new Error(res.error);
    } catch (err) { if (addToast) addToast('Delete failed: ' + err.message, 'error'); }
  };

  const handleDeleteIntermediaryAdvance = async (recordId) => {
    if (!activeShipment || !window.confirm('Delete this cash advance record?')) return;
    try {
      const res = await api.deleteIntermediaryAdvance(activeShipment.id, recordId);
      if (res.success !== false) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast('Cash advance record deleted.', 'success');
      } else throw new Error(res.error);
    } catch (err) { if (addToast) addToast('Delete failed: ' + err.message, 'error'); }
  };

  const handleDeleteCustomsExpense = async (recordId) => {
    if (!activeShipment || !window.confirm('Delete this customs expense record?')) return;
    try {
      const res = await api.deleteCustomsExpense(activeShipment.id, recordId);
      if (res.success !== false) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast('Customs expense deleted.', 'success');
      } else throw new Error(res.error);
    } catch (err) { if (addToast) addToast('Delete failed: ' + err.message, 'error'); }
  };

  const handleDeleteActiveShipment = async () => {
    if (!activeShipment) return;
    if (!window.confirm(`Are you sure you want to permanently delete Shipment ${activeShipment.shipmentNo || activeShipment.id}? All its linked records will be deleted.`)) return;
    try {
      const res = await api.deleteChinaShipment(activeShipment.id);
      if (res.success !== false) {
        setShipments(prev => {
          const next = prev.filter(s => s.id !== activeShipment.id);
          setSelectedShipmentId(next.length > 0 ? next[0].id : '');
          return next;
        });
        if (addToast) addToast(`Shipment ${activeShipment.shipmentNo || activeShipment.id} deleted.`, 'info');
      } else throw new Error(res.error);
    } catch (err) {
      if (addToast) addToast('Failed to delete shipment: ' + err.message, 'error');
    }
  };

  // ─── Sub-record edit handlers (open modal pre-filled) ───────────────────────
  const handleEditPartnerReceipt = (record) => {
    setEditingPartnerReceipt(record);
    setIsPartnerReceiptModalOpen(true);
  };

  const handleSaveEditedPartnerReceipt = async (formData) => {
    if (!activeShipment || !editingPartnerReceipt) return;
    try {
      const res = await api.updatePartnerReceipt(activeShipment.id, editingPartnerReceipt.id, formData);
      if (res.success !== false) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast('Partner receipt updated!', 'success');
        setEditingPartnerReceipt(null);
      } else throw new Error(res.error);
    } catch (err) { if (addToast) addToast('Update failed: ' + err.message, 'error'); }
  };

  const handleEditSupplierPayment = (record) => {
    setEditingSupplierPayment(record);
    setIsSupplierPaymentModalOpen(true);
  };

  const handleSaveEditedSupplierPayment = async (formData) => {
    if (!activeShipment || !editingSupplierPayment) return;
    try {
      const res = await api.updateSupplierPayment(activeShipment.id, editingSupplierPayment.id, formData);
      if (res.success !== false) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast('Supplier payment updated!', 'success');
        setEditingSupplierPayment(null);
      } else throw new Error(res.error);
    } catch (err) { if (addToast) addToast('Update failed: ' + err.message, 'error'); }
  };

  const handleEditIntermediaryAdvance = (record) => {
    setEditingIntermediaryAdvance(record);
    setTargetIntermediaryId(record.intermediaryId || '');
    setIsIntermediaryAdvanceModalOpen(true);
  };

  const handleSaveEditedIntermediaryAdvance = async (formData) => {
    if (!activeShipment || !editingIntermediaryAdvance) return;
    try {
      const res = await api.updateIntermediaryAdvance(activeShipment.id, editingIntermediaryAdvance.id, formData);
      if (res.success !== false) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast('Cash advance updated!', 'success');
        setEditingIntermediaryAdvance(null);
      } else throw new Error(res.error);
    } catch (err) { if (addToast) addToast('Update failed: ' + err.message, 'error'); }
  };

  const handleEditCustomsExpense = (record) => {
    setEditingCustomsExpense(record);
    setIsCustomsExpenseModalOpen(true);
  };

  const handleSaveEditedCustomsExpense = async (formData) => {
    if (!activeShipment || !editingCustomsExpense) return;
    try {
      const res = await api.updateCustomsExpense(activeShipment.id, editingCustomsExpense.id, formData);
      if (res.success !== false) {
        setShipments(prev => prev.map(s => s.id === activeShipment.id ? res.data : s));
        if (addToast) addToast('Customs expense updated!', 'success');
        setEditingCustomsExpense(null);
      } else throw new Error(res.error);
    } catch (err) { if (addToast) addToast('Update failed: ' + err.message, 'error'); }
  };

  if (loading && shipments.length === 0) {
    return (
      <div className="p-12 text-center font-mono space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <span className="text-sm text-slate-400 block font-bold">
          Loading China Import & Financial Settlement Engine...
        </span>
      </div>
    );
  }

  const reviewFlagsCount = (activeShipment?.historicalReviewFlags || []).filter(f => f.status === 'Open').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Deck */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-carbon-900 via-carbon-900 to-indigo-950/40 border border-carbon-700/80 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 p-[2px] shadow-xl shadow-indigo-950/60">
            <div className="p-2.5 bg-carbon-950 rounded-[14px]">
              <Ship className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">
                China Import & Financial Settlement
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-indigo-950 border border-indigo-700/80 text-indigo-300">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Multi-shipment funding, overseas friend settlements, customs landed costing, and warehouse integration
            </p>
          </div>
        </div>

        {/* Shipment Selector & Quick Global Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Shipment Switcher */}
          <div className="flex items-center gap-2 bg-carbon-950 px-3 py-1.5 rounded-2xl border border-carbon-800 font-mono text-xs">
            <span className="text-slate-500 font-bold">Active Shipment:</span>
            <select
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {shipments.length === 0 ? (
                <option value="" className="bg-carbon-900 text-slate-400">No Shipments Available</option>
              ) : (
                shipments.map(s => (
                  <option key={s.id} value={s.id} className="bg-carbon-900 text-white">
                    {s.shipmentNo} ({s.status.toUpperCase()})
                  </option>
                ))
              )}
            </select>
            {activeShipment && (
              <button
                onClick={handleDeleteActiveShipment}
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition ml-1"
                title={`Delete Shipment ${activeShipment.shipmentNo || activeShipment.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsNewShipmentModalOpen(true)}
            className="px-3.5 py-2.5 bg-carbon-800 hover:bg-carbon-700 text-slate-200 border border-carbon-700 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>New Shipment</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 shadow-lg shadow-indigo-950/40"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Audit Statement</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-carbon-950/90 rounded-2xl border border-carbon-800/80 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeSubTab === 'dashboard'
              ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-950/50'
              : 'text-slate-400 hover:text-white hover:bg-carbon-900'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>1. Master Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('shipment_items')}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeSubTab === 'shipment_items'
              ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-950/50'
              : 'text-slate-400 hover:text-white hover:bg-carbon-900'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>2. Shipment & Items ({activeShipment?.totalUnits || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('partner_funding')}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeSubTab === 'partner_funding'
              ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-950/50'
              : 'text-slate-400 hover:text-white hover:bg-carbon-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>3. Global Inflow Log</span>
        </button>

        <button
          onClick={() => setActiveSubTab('supplier_payments')}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeSubTab === 'supplier_payments'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
              : 'text-slate-400 hover:text-white hover:bg-carbon-900'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          <span>4. China Outflow Log</span>
        </button>

        <button
          onClick={() => setActiveSubTab('intermediaries')}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeSubTab === 'intermediaries'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-950/50'
              : 'text-slate-400 hover:text-white hover:bg-carbon-900'
          }`}
        >
          <Handshake className="w-3.5 h-3.5 text-amber-400" />
          <span>5. Overseas Friends Ledger</span>
        </button>

        <button
          onClick={() => setActiveSubTab('customs_charges')}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeSubTab === 'customs_charges'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
              : 'text-slate-400 hover:text-white hover:bg-carbon-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span>6. Customs & Landed Costs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory_intake')}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeSubTab === 'inventory_intake'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-950/50'
              : 'text-slate-400 hover:text-white hover:bg-carbon-900'
          }`}
        >
          <Warehouse className="w-3.5 h-3.5 text-teal-400" />
          <span>7. Stock Intake</span>
        </button>

        <button
          onClick={() => setActiveSubTab('review')}
          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 ml-auto ${
            activeSubTab === 'review'
              ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-md shadow-amber-950/50'
              : 'text-slate-400 hover:text-white hover:bg-carbon-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Audit Queue</span>
          {reviewFlagsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {reviewFlagsCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Render Area */}
      {activeShipment ? (
        <div>
          {activeSubTab === 'dashboard' && (
            <ChinaDashboardTab
              shipment={activeShipment}
              onOpenPartnerReceiptModal={() => setIsPartnerReceiptModalOpen(true)}
              onOpenSupplierPaymentModal={() => setIsSupplierPaymentModalOpen(true)}
              onOpenIntermediaryAdvanceModal={(id) => {
                setTargetIntermediaryId(id || '');
                setIsIntermediaryAdvanceModalOpen(true);
              }}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              setActiveSubTab={setActiveSubTab}
            />
          )}

          {activeSubTab === 'shipment_items' && (
            <ChinaShipmentItemsTab
              shipment={activeShipment}
              onUpdateShipmentStatus={handleUpdateShipmentStatus}
              onOpenIntakeTab={() => setActiveSubTab('inventory_intake')}
            />
          )}

          {activeSubTab === 'partner_funding' && (
            <ChinaPartnerFundingTab
              shipment={activeShipment}
              onOpenPartnerReceiptModal={() => { setEditingPartnerReceipt(null); setIsPartnerReceiptModalOpen(true); }}
              onEditPartnerReceipt={handleEditPartnerReceipt}
              onDeletePartnerReceipt={handleDeletePartnerReceipt}
            />
          )}

          {activeSubTab === 'supplier_payments' && (
            <ChinaSupplierPaymentsTab
              shipment={activeShipment}
              onOpenSupplierPaymentModal={() => { setEditingSupplierPayment(null); setIsSupplierPaymentModalOpen(true); }}
              onEditSupplierPayment={handleEditSupplierPayment}
              onDeleteSupplierPayment={handleDeleteSupplierPayment}
            />
          )}

          {activeSubTab === 'intermediaries' && (
            <ChinaIntermediariesTab
              shipment={activeShipment}
              onOpenIntermediaryAdvanceModal={(id) => {
                setEditingIntermediaryAdvance(null);
                setTargetIntermediaryId(id || '');
                setIsIntermediaryAdvanceModalOpen(true);
              }}
              onOpenSupplierPaymentModal={() => { setEditingSupplierPayment(null); setIsSupplierPaymentModalOpen(true); }}
              onEditIntermediaryAdvance={handleEditIntermediaryAdvance}
              onDeleteIntermediaryAdvance={handleDeleteIntermediaryAdvance}
            />
          )}

          {activeSubTab === 'customs_charges' && (
            <ChinaCustomsExpensesTab
              shipment={activeShipment}
              onOpenCustomsExpenseModal={() => { setEditingCustomsExpense(null); setIsCustomsExpenseModalOpen(true); }}
              onEditCustomsExpense={handleEditCustomsExpense}
              onDeleteCustomsExpense={handleDeleteCustomsExpense}
            />
          )}

          {activeSubTab === 'inventory_intake' && (
            <ChinaInventoryIntakeTab
              shipment={activeShipment}
              onExecuteGoodsReceipt={handleExecuteGoodsReceipt}
            />
          )}

          {activeSubTab === 'review' && (
            <ChinaReviewQueueTab
              shipment={activeShipment}
              onResolveFlag={handleResolveFlag}
            />
          )}
        </div>
      ) : (
        <div className="p-12 text-center glass-card rounded-3xl border border-carbon-800 space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Ship className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-white text-lg">No Active Import Shipment Selected</h3>
            <p className="text-xs text-slate-400 font-mono">
              Initialize a fresh import shipment with full CIF/FOB costing, supplier settlement routing, and landed expense logs.
            </p>
          </div>
          <button
            onClick={() => setIsNewShipmentModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs transition inline-flex items-center gap-2 shadow-lg shadow-indigo-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Import Shipment</span>
          </button>
        </div>
      )}

      {/* ================= MODAL DIALOGS ================= */}
      <NewShipmentModal
        isOpen={isNewShipmentModalOpen}
        onClose={() => setIsNewShipmentModalOpen(false)}
        onSave={handleCreateShipment}
      />

      <RecordPartnerReceiptModal
        shipment={activeShipment}
        isOpen={isPartnerReceiptModalOpen}
        editingRecord={editingPartnerReceipt}
        onClose={() => { setIsPartnerReceiptModalOpen(false); setEditingPartnerReceipt(null); }}
        onSave={editingPartnerReceipt ? handleSaveEditedPartnerReceipt : handleSavePartnerReceipt}
      />

      <RecordSupplierPaymentModal
        shipment={activeShipment}
        isOpen={isSupplierPaymentModalOpen}
        editingRecord={editingSupplierPayment}
        onClose={() => { setIsSupplierPaymentModalOpen(false); setEditingSupplierPayment(null); }}
        onSave={editingSupplierPayment ? handleSaveEditedSupplierPayment : handleSaveSupplierPayment}
      />

      <RecordIntermediaryAdvanceModal
        shipment={activeShipment}
        defaultIntermediaryId={targetIntermediaryId}
        isOpen={isIntermediaryAdvanceModalOpen}
        editingRecord={editingIntermediaryAdvance}
        onClose={() => { setIsIntermediaryAdvanceModalOpen(false); setEditingIntermediaryAdvance(null); }}
        onSave={editingIntermediaryAdvance ? handleSaveEditedIntermediaryAdvance : handleSaveIntermediaryAdvance}
      />

      <RecordCustomsExpenseModal
        shipment={activeShipment}
        isOpen={isCustomsExpenseModalOpen}
        editingRecord={editingCustomsExpense}
        onClose={() => { setIsCustomsExpenseModalOpen(false); setEditingCustomsExpense(null); }}
        onSave={editingCustomsExpense ? handleSaveEditedCustomsExpense : handleSaveCustomsExpense}
      />

      <ChinaPrintableReportModal
        isOpen={isPrintModalOpen}
        shipment={activeShipment}
        onClose={() => setIsPrintModalOpen(false)}
      />

    </div>
  );
}
