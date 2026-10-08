export function formatLKR(val) {
  return "Rs. " + Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function numberToWordsLKR(amount) {
  const num = Math.round(amount || 0);
  if (num === 0) return "Zero Rupees Only";

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return '';
    let str = '';
    str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
    str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
    str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
    str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
    str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
    return str.trim();
  }

  return inWords(num) + " Rupees Only";
}

export const I18N = {
  en: {
    global_title: "Anujaya & Global Enterprises Consortium ERP",
    nav_dashboard: "Executive Dashboard",
    nav_inventory: "Machinery Master (Global)",
    nav_ledger: "Sales & Audit Ledger",
    nav_customers: "Apparel Clients",
    nav_settlement: "Partner Accounts",
    btn_record_sale: "New Dispatch",
    btn_add_machine: "Add SKU",
    game_title: "Consortium Executive Financial & Capital Summary",
    btn_reset_defaults: "Reset Baseline",
    lbl_realized_share: "Total Realized Net Profit",
    lbl_balance_gauge: "Consortium Equity Balance Indicator",
    kpi_gross_rev: "Gross Revenue",
    lbl_dispatches: "Completed Dispatches",
    kpi_total_cogs: "Total Cost of Goods",
    lbl_customs_taxes: "Port & Customs Duty",
    kpi_net_profit: "Consortium Net Profit",
    lbl_margin: "Net Margin",
    kpi_fleet_volume: "Dispatched / Total Fleet",
    lbl_stock_rate: "Fleet Turnover",
    kpi_inventory_value: "Current Stock Valuation",
    lbl_remaining_units: "In Port & Warehouses",
    kpi_receivables: "Total Receivables",
    sec_recent_activity: "Recent Dispatches & Invoicing Log",
    sec_brand_allocation: "Consortium Fleet Breakdown",
    sec_inventory_title: "Machinery Master Fleet (Landed Costing & Benchmarks)",
    sec_ledger_title: "Sales Ledger & Asset Audit Log",
    sec_customer_title: "Apparel Manufacturing Clients",
    sec_settlement_title: "Consortium Capital & Retained Earnings Reconciliation"
  },
  si: {
    global_title: "අනුජය සහ ග්ලෝබල් එන්ටර්ප්‍රයිසස් හවුල්කාර ERP පද්ධතිය",
    nav_dashboard: "ප්‍රධාන පුවරුව",
    nav_inventory: "මැෂින් තොගය (ග්ලෝබල්)",
    nav_ledger: "අලෙවි සහ විගණන ලෙජරය",
    nav_customers: "පාරිභෝගිකයින්",
    nav_settlement: "හවුල්කාර ගිණුම්",
    btn_record_sale: "නව නිකුතුවක්",
    btn_add_machine: "නව SKU එක් කරන්න",
    game_title: "හවුල්කාර ව්‍යාපාරික මූල්‍ය හා ප්‍රාග්ධන සාරාංශය",
    btn_reset_defaults: "මුල් තත්වයට පත් කරන්න",
    lbl_realized_share: "උපයාගත් මුළු ශුද්ධ ලාභය",
    lbl_balance_gauge: "හවුල්කාර ගිණුම් ශේෂ සමතුලිතතාව",
    kpi_gross_rev: "මුළු ආදායම",
    lbl_dispatches: "නිකුත් කළ වාර ගණන",
    kpi_total_cogs: "මුළු පිරිවැය (COGS)",
    lbl_customs_taxes: "රේගු සහ වරාය ගාස්තු",
    kpi_net_profit: "ශුද්ධ ලාභය",
    lbl_margin: "ලාභ ප්‍රතිශතය",
    kpi_fleet_volume: "නිකුත් කළ / මුළු මැෂින්",
    lbl_stock_rate: "තොග පිරිවැටුම",
    kpi_inventory_value: "ඉතිරි තොගයේ වටිනාකම",
    lbl_remaining_units: "ගබඩාවේ ඇති ප්‍රමාණය",
    kpi_receivables: "ලැබිය යුතු මුදල්",
    sec_recent_activity: "නවතම නිකුතු සහ බිල්පත් වාර්තාව",
    sec_brand_allocation: "යන්ත්‍ර සන්නාම ව්‍යාප්තිය",
    sec_inventory_title: "මැෂින් තොග කළමනාකරණය (වියදම් සහ මිල තීරණය)",
    sec_ledger_title: "අලෙවි ලෙජරය සහ වත්කම් විගණන වාර්තාව",
    sec_customer_title: "ඇඟලුම් පාරිභෝගික නාමාවලිය",
    sec_settlement_title: "හවුල්කාර ප්‍රාග්ධන සහ ලාභ ගිණුම් බේරුම්කරණය"
  }
};
