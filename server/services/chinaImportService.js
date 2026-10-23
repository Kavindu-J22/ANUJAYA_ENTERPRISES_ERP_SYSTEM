const { GLOBAL_MACHINES_BASELINE } = require('../data/seeds');

// Generate initial historical seed for Shipment 2025(SLLK)823 from China.xlsx
function getHistoricalChinaShipmentSeed() {
  // Map 26 baseline machines into shipment line items (totaling 472 units)
  const items = GLOBAL_MACHINES_BASELINE.map((m, idx) => {
    const qty = m.initialStock || 0;
    const unitFobUsd = m.usdPrice || 0;
    const totalFobUsd = Math.round(qty * unitFobUsd * 100) / 100;
    // Landed cost budget share per item
    const fobRatio = totalFobUsd / 206316.96;
    const allocatedLandedCostLkr = Math.round(73076096.80 * fobRatio * 100) / 100;

    return {
      id: `CSI-${String(idx + 1).padStart(3, '0')}`,
      sku: m.id,
      brand: m.brand,
      model: m.model,
      name: m.name,
      category: "Industrial Sewing Machines",
      unit: m.unit || "SETS",
      qtyOrdered: qty,
      qtyShipped: qty,
      qtyReceived: qty,
      unitFobUsd: unitFobUsd,
      totalFobUsd: totalFobUsd,
      allocatedLandedCostLkr: allocatedLandedCostLkr,
      globalMachineId: m.id,
      stockIntakeStatus: "received"
    };
  });

  return {
    id: "CS-2025-823",
    shipmentNo: "2025(SLLK)823",
    supplierName: "China Juki Industrial Machinery Export Corp.",
    supplierCountry: "China",
    invoiceNo: "2025(SLLK)823",
    purchaseReference: "PO-JUKI-CN-2025-08",
    shipmentDate: "2026-08-01",
    estimatedArrivalDate: "2026-09-15",
    actualArrivalDate: "2026-09-14",
    origin: "Ningbo / Taizhou Port, China",
    destination: "Colombo Port / Kosgama Central Yard, Sri Lanka",
    shippingCarrier: "Maersk Line (Vessel: MAERSK MC-KINNEY)",
    containerNo: "MSKU-9823410 / 40HC High Cube",
    blNumber: "MAEU-2025-SLLK823",
    status: "received",

    totalUnits: 472,
    fobUsd: 206316.96,
    budgetUsdRate: 330.00,
    budgetCustomsLkr: 4991500.00,
    budgetTotalLiabilityLkr: 73076096.80,

    items: items,

    // Workflow B: 50% / 50% Funding Partners
    partners: [
      {
        partnerId: "PTR-GLOBAL",
        name: "Global Apparel Solutions",
        role: "Joint Funding Partner (Inward Funds Contributor)",
        agreedRatio: 0.50,
        targetLiabilityLkr: 36538048.40,
        notes: "Co-funder responsible for 50% of Total China Liability (LKR 36,538,048.40)"
      },
      {
        partnerId: "PTR-OURCO",
        name: "Our Company (Anujaya Enterprises)",
        role: "Operational Lead & Direct Outflow Execution",
        agreedRatio: 0.50,
        targetLiabilityLkr: 36538048.40,
        notes: "Managing operational import execution, intermediary routing & yard receiving"
      }
    ],

    // Workflow B: Partner Inward Receipts Log (Global Inflow Log)
    partnerReceipts: [],

    // Workflow C: Intermediaries / Overseas Friends
    intermediaries: [
      {
        id: "INT-01",
        name: "Ashen",
        country: "China / Sri Lanka",
        operatingCurrency: "RMB",
        contact: "+86 138-0000-1122",
        notes: "Overseas trading liaison for RMB foreign wire settlements"
      },
      {
        id: "INT-02",
        name: "Friend 2 (Korea / Dubai)",
        country: "Korea / Dubai Route",
        operatingCurrency: "RMB",
        contact: "+82 10-5555-8899",
        notes: "Intermediary channel executing foreign RMB payments into China"
      },
      {
        id: "INT-03",
        name: "Direct Bank TT (Sri Lanka)",
        country: "Sri Lanka to China",
        operatingCurrency: "USD",
        contact: "Bank LC Desk",
        notes: "Official commercial banking channel (Commercial / BOC / Sampath)"
      }
    ],

    // Workflow C: Cash Given to Intermediaries by Us (LKR)
    intermediaryAdvances: [],

    // Workflow D: China Outflow Log (Payments to China Supplier)
    supplierPayments: [],

    // Workflow E: Customs, Tax & Clearing Expenses
    customsExpenses: [],

    goodsReceipts: [
      {
        id: "GR-001",
        receiptDate: "2026-09-14",
        receivedBy: "Kosgama Yard Operations Team",
        warehouseLocation: "Kosgama Central Machinery Fleet Yard Bays 1-6",
        totalUnitsReceived: 472,
        intakeConfirmed: true,
        notes: "Complete shipment 472 units unloaded, inspected, and verified against packing list"
      }
    ],

    auditLogs: [
      {
        id: "LOG-001",
        timestamp: "2026-08-01 10:00:00",
        action: "Shipment Created",
        user: "Consortium Admin",
        details: "Shipment 2025(SLLK)823 initiated with 472 units, FOB $206,316.96"
      },
      {
        id: "LOG-002",
        timestamp: "2026-09-14 16:30:00",
        action: "Physical Goods Received",
        user: "Yard Operations",
        details: "472 units received and synced to Global Machinery Warehouse"
      }
    ],

    isHistorical: true,
    historicalSourceWorkbook: "China.xlsx",
    historicalReviewFlags: [],
    notes: "Historical reference shipment imported from China.xlsx ready for fresh financial settlement entries."
  };
}

// Financial reconciliation calculator for any ChinaShipment object
function calculateShipmentFinancialSummary(shipment) {
  if (!shipment) return null;

  const fobUsd = Number(shipment.fobUsd) || 0;
  const budgetUsdRate = Number(shipment.budgetUsdRate) || 330;
  const budgetCustomsLkr = Number(shipment.budgetCustomsLkr) || 0;
  const totalBudgetLkr = Math.round(((fobUsd * budgetUsdRate) + budgetCustomsLkr) * 100) / 100;

  // 1. Inward Receipts from Partners
  const confirmedPartnerReceipts = (shipment.partnerReceipts || []).filter(r => r.status === 'Confirmed');
  const totalReceivedFromGlobal = confirmedPartnerReceipts.reduce((sum, r) => sum + (Number(r.amountLkr) || 0), 0);

  // 2. Confirmed Supplier Settlements to China
  const confirmedPayments = (shipment.supplierPayments || []).filter(p => p.status === 'Confirmed');
  const totalSettledToChinaLkr = confirmedPayments.reduce((sum, p) => sum + (Number(p.settledLkr) || 0), 0);

  // Foreign currencies breakdown
  const rmbSettledTotal = confirmedPayments
    .filter(p => (p.currency || '').toUpperCase() === 'RMB')
    .reduce((sum, p) => sum + (Number(p.foreignAmount) || 0), 0);
  const usdSettledTotal = confirmedPayments
    .filter(p => (p.currency || '').toUpperCase() === 'USD')
    .reduce((sum, p) => sum + (Number(p.foreignAmount) || 0), 0);

  // 3. Our Net Cash Contributed (Cash advanced + customs paid directly by Our Company, or net of inflows)
  // Total cash given to intermediaries by us
  const totalIntermediaryCashGiven = (shipment.intermediaryAdvances || []).reduce((sum, a) => sum + (Number(a.amountLkr) || 0), 0);
  const totalCustomsPaidByUs = (shipment.customsExpenses || [])
    .filter(c => c.status === 'Paid' && (c.paidBy === 'Our Company' || !c.paidBy))
    .reduce((sum, c) => sum + (Number(c.actualLkr || c.estimatedLkr) || 0), 0);

  // Our total direct cash outlays
  const ourTotalDirectCashOutlay = totalIntermediaryCashGiven + totalCustomsPaidByUs;

  // Our Net Cash Contributed towards China Liability
  // = Total Settled to China - Total Received from Global
  const ourNetCashContributedLkr = Math.max(0, totalSettledToChinaLkr - totalReceivedFromGlobal);

  // Remaining Due on Total Import Liability
  const remainingTotalLiabilityLkr = Math.round(Math.max(0, totalBudgetLkr - totalSettledToChinaLkr) * 100) / 100;

  // Supplier Payable in Original Currency (FOB USD remaining)
  // Approximate USD paid using applied rates
  const supplierPaidEquivalentUsd = confirmedPayments.reduce((sum, p) => {
    if ((p.currency || '').toUpperCase() === 'USD') return sum + (Number(p.foreignAmount) || 0);
    // Convert LKR settled back using budget FX rate
    return sum + ((Number(p.settledLkr) || 0) / budgetUsdRate);
  }, 0);
  const remainingSupplierFobUsd = Math.max(0, Math.round((fobUsd - supplierPaidEquivalentUsd) * 100) / 100);

  // 4. Partner 50/50 Breakdown
  const partnersSummary = (shipment.partners || []).map(p => {
    const ratio = Number(p.agreedRatio) || 0.50;
    const targetLkr = Math.round(totalBudgetLkr * ratio * 100) / 100;
    // Determine actual paid
    let actualPaidLkr = 0;
    if (p.name.includes("Global")) {
      actualPaidLkr = totalReceivedFromGlobal;
    } else {
      actualPaidLkr = ourNetCashContributedLkr;
    }
    const remainingLkr = Math.round(Math.max(0, targetLkr - actualPaidLkr) * 100) / 100;
    const progressPct = targetLkr > 0 ? Math.min(1, actualPaidLkr / targetLkr) : 0;
    const isFullySettled = remainingLkr <= 0;

    return {
      partnerId: p.partnerId,
      name: p.name,
      role: p.role,
      agreedRatio: ratio,
      targetLiabilityLkr: targetLkr,
      actualPaidLkr: actualPaidLkr,
      remainingDueLkr: remainingLkr,
      progressPct: progressPct,
      isFullySettled: isFullySettled,
      statusLabel: isFullySettled 
        ? "✓ Fully Settled" 
        : `Pending: ${remainingLkr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR`
    };
  });

  // 5. Intermediaries Reconciliation
  const intermediariesSummary = (shipment.intermediaries || []).map(inter => {
    const advances = (shipment.intermediaryAdvances || []).filter(a => a.intermediaryId === inter.id || a.intermediaryName.toLowerCase().includes(inter.name.toLowerCase()));
    const totalCashGivenLkr = advances.reduce((sum, a) => sum + (Number(a.amountLkr) || 0), 0);

    const payments = confirmedPayments.filter(p => p.intermediaryId === inter.id || (p.intermediaryName && p.intermediaryName.toLowerCase().includes(inter.name.toLowerCase())));
    const totalSettledLkr = payments.reduce((sum, p) => sum + (Number(p.settledLkr) || 0), 0);
    const foreignAmountSettled = payments.reduce((sum, p) => sum + (Number(p.foreignAmount) || 0), 0);

    // Rule: Net Balance = Total Cash Advanced - Total Confirmed Supplier Settlement LKR
    // Negative = We owe intermediary
    // Positive = Intermediary holds surplus on our behalf
    const netBalanceLkr = Math.round((totalCashGivenLkr - totalSettledLkr) * 100) / 100;

    let status = "Balanced";
    let actionInstruction = "Account is balanced and reconciled.";
    if (netBalanceLkr < -0.01) {
      status = "We Owe Intermediary";
      actionInstruction = `Company must pay outstanding balance of LKR ${Math.abs(netBalanceLkr).toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${inter.name}`;
    } else if (netBalanceLkr > 0.01) {
      status = "Intermediary Holds Surplus";
      actionInstruction = `Surplus of LKR ${netBalanceLkr.toLocaleString('en-US', { minimumFractionDigits: 2 })} held by ${inter.name} for upcoming tranches`;
    }

    return {
      id: inter.id,
      name: inter.name,
      country: inter.country,
      operatingCurrency: inter.operatingCurrency,
      totalCashGivenLkr: totalCashGivenLkr,
      foreignAmountSettled: foreignAmountSettled,
      totalSettledLkr: totalSettledLkr,
      netBalanceLkr: netBalanceLkr,
      status: status,
      actionInstruction: actionInstruction,
      advancesCount: advances.length,
      settlementsCount: payments.length
    };
  });

  // Total amount owed to intermediaries combined
  const totalOwedToIntermediariesLkr = intermediariesSummary.reduce((sum, i) => {
    return sum + (i.netBalanceLkr < 0 ? Math.abs(i.netBalanceLkr) : 0);
  }, 0);

  // 6. Customs & Actual Landed Cost
  const totalCustomsEstimated = (shipment.customsExpenses || []).reduce((sum, c) => sum + (Number(c.estimatedLkr) || 0), 0);
  const totalCustomsActual = (shipment.customsExpenses || []).reduce((sum, c) => sum + (Number(c.actualLkr || c.estimatedLkr) || 0), 0);
  const actualLandedCostTotalLkr = Math.round(((fobUsd * budgetUsdRate) + totalCustomsActual) * 100) / 100;
  const landedCostPerUnitAvgLkr = shipment.totalUnits > 0 ? Math.round(actualLandedCostTotalLkr / shipment.totalUnits) : 0;

  // 7. Inventory Stock Intake Progress
  const totalItemsOrdered = (shipment.items || []).reduce((sum, i) => sum + (Number(i.qtyOrdered) || 0), 0);
  const totalItemsReceived = (shipment.items || []).reduce((sum, i) => sum + (Number(i.qtyReceived) || 0), 0);
  const isInventoryFullySynced = totalItemsReceived >= totalItemsOrdered && totalItemsOrdered > 0;

  return {
    totalBudgetLkr,
    fobUsd,
    budgetUsdRate,
    budgetCustomsLkr,
    totalReceivedFromGlobal,
    totalSettledToChinaLkr,
    rmbSettledTotal,
    usdSettledTotal,
    ourNetCashContributedLkr,
    ourTotalDirectCashOutlay,
    remainingTotalLiabilityLkr,
    remainingSupplierFobUsd,
    partnersSummary,
    intermediariesSummary,
    totalOwedToIntermediariesLkr,
    totalCustomsEstimated,
    totalCustomsActual,
    actualLandedCostTotalLkr,
    landedCostPerUnitAvgLkr,
    totalItemsOrdered,
    totalItemsReceived,
    isInventoryFullySynced,
    reviewFlagsCount: (shipment.historicalReviewFlags || []).filter(f => f.status === 'Open').length
  };
}

module.exports = {
  getHistoricalChinaShipmentSeed,
  calculateShipmentFinancialSummary
};
