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
    partnerReceipts: [
      {
        id: "PR-001",
        receiptId: "GLB-001",
        date: "2026-08-09",
        partnerName: "Global Apparel Solutions",
        paymentMethod: "Bank Transfer",
        reference: "Commercial Bank Inward Remittance - Tranche 1",
        amountLkr: 15917478.10,
        allocationStatus: "Allocated",
        notes: "First major funding tranche received into corporate account",
        status: "Confirmed"
      }
    ],

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
    intermediaryAdvances: [
      // Ashen Advances
      {
        id: "ADV-001",
        intermediaryId: "INT-01",
        intermediaryName: "Ashen",
        date: "2026-02-10",
        description: "Advance for foreign supplier remittance",
        bankReference: "BOC - Commercial Bank",
        amountLkr: 4300000.00,
        notes: "Initial advance handed over to Ashen"
      },

      // Friend 2 Advances
      {
        id: "ADV-002",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        date: "2026-01-10",
        description: "Advance tranche 1",
        bankReference: "DFCC - BOC",
        amountLkr: 2500000.00,
        notes: "Bank transfer advance"
      },
      {
        id: "ADV-003",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        date: "2026-01-10",
        description: "Advance tranche 2",
        bankReference: "BOC - HNB",
        amountLkr: 2450000.00,
        notes: "Bank transfer advance"
      },
      {
        id: "ADV-004",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        date: "2026-02-10",
        description: "Advance tranche 3",
        bankReference: "BOC - HNB",
        amountLkr: 40000.00,
        notes: "Supplemental transfer"
      },
      {
        id: "ADV-005",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        date: "2026-02-10",
        description: "Cash advance (Cash Only)",
        bankReference: "Direct Cash Handover",
        amountLkr: 10000.00,
        notes: "Cash handover without immediate foreign wire"
      },
      {
        id: "ADV-006",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        date: "2026-03-10",
        description: "Advance tranche 4",
        bankReference: "BOC - Seylan",
        amountLkr: 1000000.00,
        notes: "Bank transfer"
      },
      {
        id: "ADV-007",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        date: "2026-04-10",
        description: "Advance tranche 5",
        bankReference: "BOC - Sampath",
        amountLkr: 3919330.00,
        notes: "Major remittance advance"
      },
      {
        id: "ADV-008",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        date: "2026-04-10",
        description: "Cash advance (Cash Only)",
        bankReference: "Direct Cash Settlement",
        amountLkr: 190000.00,
        notes: "Supplementary cash advance to intermediary"
      }
    ],

    // Workflow D: China Outflow Log (Payments to China Supplier)
    supplierPayments: [
      {
        id: "SP-001",
        trxId: "TRX-001",
        paymentDate: "2026-02-10",
        channel: "Intermediary Remittance",
        intermediaryId: "INT-01",
        intermediaryName: "Ashen",
        currency: "RMB",
        foreignAmount: 86000.00,
        appliedFxRate: 51.80,
        settledLkr: 4454800.00,
        sourceOfFunds: "Our Company",
        reference: "Ashen Wire Slip Ref #ASH-86K",
        status: "Confirmed",
        isNeedsReview: false,
        notes: "86,000 RMB settled @ 51.80 FX rate"
      },
      {
        id: "SP-002",
        trxId: "TRX-002",
        paymentDate: "2026-01-10",
        channel: "Intermediary Remittance",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        currency: "RMB",
        foreignAmount: 60000.00,
        appliedFxRate: 51.90,
        settledLkr: 3114000.00,
        sourceOfFunds: "Joint Partnership",
        reference: "Korea Remittance 60K RMB",
        status: "Confirmed",
        isNeedsReview: false,
        notes: "60,000 RMB settled @ 51.90"
      },
      {
        id: "SP-003",
        trxId: "TRX-003",
        paymentDate: "2026-01-10",
        channel: "Intermediary Remittance",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        currency: "RMB",
        foreignAmount: 15000.00,
        appliedFxRate: 51.90,
        settledLkr: 778500.00,
        sourceOfFunds: "Joint Partnership",
        reference: "Korea Remittance 15K RMB",
        status: "Confirmed",
        isNeedsReview: false,
        notes: "15,000 RMB settled @ 51.90"
      },
      {
        id: "SP-004",
        trxId: "TRX-004",
        paymentDate: "2026-01-10",
        channel: "Intermediary Remittance",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        currency: "RMB",
        foreignAmount: 25000.00,
        appliedFxRate: 51.90,
        settledLkr: 1297500.00,
        sourceOfFunds: "Joint Partnership",
        reference: "Korea Remittance 25K RMB",
        status: "Confirmed",
        isNeedsReview: false,
        notes: "25,000 RMB settled @ 51.90"
      },
      {
        id: "SP-005",
        trxId: "TRX-005",
        paymentDate: "2026-08-10",
        channel: "Direct Bank TT",
        intermediaryId: "INT-03",
        intermediaryName: "Direct Bank TT (Sri Lanka)",
        currency: "USD",
        foreignAmount: 48234.78, // Converted equivalent @ 330.00 USD
        appliedFxRate: 330.00,
        settledLkr: 15917478.10,
        sourceOfFunds: "Global Apparel Inflow",
        reference: "Direct Commercial Bank Telegraphic Transfer",
        status: "Confirmed",
        isNeedsReview: true,
        reviewNote: "Historically recorded direct TT funded from Global Inflow. Verification advised.",
        notes: "Direct supplier wire recorded in workbook"
      },
      {
        id: "SP-006",
        trxId: "TRX-006",
        paymentDate: "2026-03-10",
        channel: "Intermediary Remittance",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        currency: "RMB",
        foreignAmount: 19800.00,
        appliedFxRate: 51.90,
        settledLkr: 1027620.00,
        sourceOfFunds: "Joint Partnership",
        reference: "Korea Wire 19,800 RMB",
        status: "Confirmed",
        isNeedsReview: false,
        notes: "19,800 RMB settled @ 51.90"
      },
      {
        id: "SP-007",
        trxId: "TRX-007",
        paymentDate: "2026-04-10",
        channel: "Intermediary Remittance",
        intermediaryId: "INT-02",
        intermediaryName: "Friend 2 (Korea / Dubai)",
        currency: "RMB",
        foreignAmount: 76000.00,
        appliedFxRate: 51.90,
        settledLkr: 3944400.00,
        sourceOfFunds: "Joint Partnership",
        reference: "Korea Wire 76,000 RMB",
        status: "Confirmed",
        isNeedsReview: false,
        notes: "76,000 RMB settled @ 51.90"
      }
    ],

    // Workflow E: Customs, Tax & Clearing Expenses
    customsExpenses: [
      {
        id: "CE-001",
        category: "Customs Duty & CESS",
        description: "Sri Lanka Customs Import Tariff, PAL & CESS",
        estimatedLkr: 3250000.00,
        actualLkr: 3250000.00,
        paymentDate: "2026-09-10",
        paidBy: "Our Company",
        reference: "SLC-ENTRY-2025/823",
        status: "Paid"
      },
      {
        id: "CE-002",
        category: "Port Clearing Charges",
        description: "Clearing Agent handling fees, wharfage & terminal handling (THC)",
        estimatedLkr: 741500.00,
        actualLkr: 741500.00,
        paymentDate: "2026-09-12",
        paidBy: "Our Company",
        reference: "AGT-CLR-4491",
        status: "Paid"
      },
      {
        id: "CE-003",
        category: "Shipping & Ocean Freight",
        description: "Ocean freight 40HC container from Ningbo to Colombo",
        estimatedLkr: 500000.00,
        actualLkr: 500000.00,
        paymentDate: "2026-08-15",
        paidBy: "Our Company",
        reference: "MAERSK-FRT-9823",
        status: "Paid"
      },
      {
        id: "CE-004",
        category: "Marine Cargo Insurance",
        description: "Comprehensive marine transit cargo insurance policy",
        estimatedLkr: 250000.00,
        actualLkr: 250000.00,
        paymentDate: "2026-08-05",
        paidBy: "Our Company",
        reference: "INS-MAR-7841",
        status: "Paid"
      },
      {
        id: "CE-005",
        category: "Local Container Transport to Yard",
        description: "Trailer haulage from Colombo Port to Kosgama Central Yard",
        estimatedLkr: 250000.00,
        actualLkr: 250000.00,
        paymentDate: "2026-09-14",
        paidBy: "Our Company",
        reference: "TRP-HAUL-92",
        status: "Paid"
      }
    ],

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
    historicalReviewFlags: [
      {
        recordId: "TRX-005",
        entityType: "SupplierPayment",
        warning: "Direct TT LKR 15,917,478.10 matches Global Inflow GLB-001 exactly. Bank debit proof verification advised.",
        status: "Open"
      },
      {
        recordId: "ADV-005",
        entityType: "IntermediaryAdvance",
        warning: "Friend 2 advance LKR 10,000 has no matching foreign settlement row (Cash-only advance).",
        status: "Open"
      },
      {
        recordId: "ADV-008",
        entityType: "IntermediaryAdvance",
        warning: "Friend 2 advance LKR 190,000 has no matching foreign settlement row (Cash-only advance).",
        status: "Open"
      }
    ],
    notes: "Historical reference shipment imported from China.xlsx with verified multi-currency ledger reconciliations."
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
