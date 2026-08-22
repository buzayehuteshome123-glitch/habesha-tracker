import * as XLSX from 'xlsx';
import { Sale, Expense, Receivable, Payable, Product, BusinessSettings } from '../types';

export interface UnifiedExcelReportOptions {
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate: string;
  sales: Sale[];
  expenses: Expense[];
  receivables?: Receivable[];
  payables?: Payable[];
  products?: Product[];
  settings: BusinessSettings;
}

/**
 * Generates an executive, publication-grade Excel workbook with multiple tabs
 * covering Executive Summary, Daily Breakdown, Sales, Expenses, Cash Movement, and Inventory.
 */
export function generateUnifiedExcelReport({
  period,
  startDate,
  endDate,
  sales,
  expenses,
  receivables = [],
  payables = [],
  products = [],
  settings
}: UnifiedExcelReportOptions) {
  const currency = settings.currency || 'ETB';
  const startStr = startDate || new Date().toISOString().slice(0, 10);
  const endStr = endDate || startStr;

  const periodSales = sales.filter(s => {
    const sDate = s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10);
    return sDate >= startStr && sDate <= endStr;
  });

  const periodExpenses = expenses.filter(e => {
    const eDate = e.date.includes('T') ? e.date.split('T')[0] : e.date.slice(0, 10);
    return eDate >= startStr && eDate <= endStr;
  });

  const totalSalesRevenue = periodSales.reduce((sum, s) => sum + (s.grossSale || 0), 0);
  const totalCOGS = periodSales.reduce((sum, s) => sum + (s.cost || 0), 0);
  const grossProfit = totalSalesRevenue - totalCOGS;
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = grossProfit - totalExpenses;
  const grossMargin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;
  const netMargin = totalSalesRevenue > 0 ? (netProfit / totalSalesRevenue) * 100 : 0;

  // Payment Breakdown
  let cashSales = 0, cbeSales = 0, telebirrSales = 0, ebirrSales = 0, sinqeeSales = 0, otherBankSales = 0, creditSales = 0;
  periodSales.forEach(s => {
    const pm = (s.paymentMethod || '').toLowerCase();
    const amt = s.grossSale || 0;
    if (pm.includes('credit')) creditSales += amt;
    else if (pm.includes('cbe') || pm.includes('commer')) cbeSales += amt;
    else if (pm.includes('tele') || pm.includes('tell')) telebirrSales += amt;
    else if (pm.includes('ebirr') || pm.includes('e-birr')) ebirrSales += amt;
    else if (pm.includes('sinq') || pm.includes('sinqe')) sinqeeSales += amt;
    else if (pm.includes('cash') || pm === '') cashSales += amt;
    else otherBankSales += amt;
  });

  // Expense breakdown
  let cashExpenses = 0, bankExpenses = 0;
  const expenseByCategory: Record<string, number> = {};
  periodExpenses.forEach(e => {
    expenseByCategory[e.category || 'General'] = (expenseByCategory[e.category || 'General'] || 0) + (e.amount || 0);
    const pm = (e.paymentMethod || '').toLowerCase();
    if (pm.includes('cash') || pm === '') cashExpenses += e.amount;
    else bankExpenses += e.amount;
  });

  // Receivables and Payables
  const periodReceivablesCollected = receivables
    .filter(r => r.status === 'Paid' && r.dueDate >= startStr && r.dueDate <= endStr)
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const totalOutstandingReceivables = receivables
    .filter(r => r.status === 'Pending' || r.status === 'Overdue')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const periodPayablesPaid = payables
    .filter(p => p.status === 'Paid' && p.dueDate >= startStr && p.dueDate <= endStr)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalOutstandingPayables = payables
    .filter(p => p.status === 'Pending' || p.status === 'Overdue')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Cash Calculation
  const priorSalesCash = sales
    .filter(s => {
      const sDate = s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10);
      const pm = (s.paymentMethod || '').toLowerCase();
      return sDate < startStr && (pm.includes('cash') || pm === '');
    })
    .reduce((sum, s) => sum + s.grossSale, 0);

  const priorExpensesCash = expenses
    .filter(e => {
      const eDate = e.date.includes('T') ? e.date.split('T')[0] : e.date.slice(0, 10);
      const pm = (e.paymentMethod || '').toLowerCase();
      return eDate < startStr && (pm.includes('cash') || pm === '');
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const startingCashBase = Number(settings.startingCash) || 0;
  const cashAdjustBase = Number(settings.cashAdjust) || 0;
  const openingCashBalance = startingCashBase + priorSalesCash - priorExpensesCash + cashAdjustBase;

  const totalCashReceived = cashSales + periodReceivablesCollected;
  const totalCashPaid = cashExpenses + periodPayablesPaid;
  const netCashMovement = totalCashReceived - totalCashPaid;
  const closingCashBalance = openingCashBalance + netCashMovement;

  const totalInventoryValuation = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
  const totalInventoryRetail = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);

  const wb = XLSX.utils.book_new();

  // 1. Sheet: Executive Summary
  const summaryData = [
    { 'Metric / KPI': 'Business Name', 'Value': settings.businessName || 'Habesha Tracker ERP' },
    { 'Metric / KPI': 'Report Type', 'Value': `Unified Business Report (${period.toUpperCase()})` },
    { 'Metric / KPI': 'Reporting Period', 'Value': `${startStr} to ${endStr}` },
    { 'Metric / KPI': 'Generated Date & Time', 'Value': new Date().toLocaleString() },
    { 'Metric / KPI': 'Currency Unit', 'Value': currency },
    { 'Metric / KPI': '', 'Value': '' },
    { 'Metric / KPI': '=== SALES PERFORMANCE ===', 'Value': '' },
    { 'Metric / KPI': 'Total Gross Sales Revenue', 'Value': totalSalesRevenue },
    { 'Metric / KPI': 'Cost of Goods Sold (COGS)', 'Value': totalCOGS },
    { 'Metric / KPI': 'Gross Business Profit', 'Value': grossProfit },
    { 'Metric / KPI': 'Gross Profit Margin (%)', 'Value': `${grossMargin.toFixed(2)}%` },
    { 'Metric / KPI': 'Total Sales Transactions', 'Value': periodSales.length },
    { 'Metric / KPI': '', 'Value': '' },
    { 'Metric / KPI': '=== SALES PAYMENT CHANNELS ===', 'Value': '' },
    { 'Metric / KPI': 'Physical Cash Sales', 'Value': cashSales },
    { 'Metric / KPI': 'CBE Mobile / Account Sales', 'Value': cbeSales },
    { 'Metric / KPI': 'Telebirr Digital Sales', 'Value': telebirrSales },
    { 'Metric / KPI': 'E-Birr / Coopay Sales', 'Value': ebirrSales },
    { 'Metric / KPI': 'Sinqee / Other Digital Sales', 'Value': sinqeeSales + otherBankSales },
    { 'Metric / KPI': 'Credit Sales (A/R)', 'Value': creditSales },
    { 'Metric / KPI': '', 'Value': '' },
    { 'Metric / KPI': '=== OPERATING EXPENSES ===', 'Value': '' },
    { 'Metric / KPI': 'Total Operating Expenses', 'Value': totalExpenses },
    { 'Metric / KPI': 'Number of Expense Entries', 'Value': periodExpenses.length },
    { 'Metric / KPI': 'Net Business Profit / Earnings', 'Value': netProfit },
    { 'Metric / KPI': 'Net Profit Margin (%)', 'Value': `${netMargin.toFixed(2)}%` },
    { 'Metric / KPI': '', 'Value': '' },
    { 'Metric / KPI': '=== CASH RECONCILIATION & WORKING CAPITAL ===', 'Value': '' },
    { 'Metric / KPI': 'Opening Cash Balance', 'Value': openingCashBalance },
    { 'Metric / KPI': 'Total Cash Inflows (Sales Cash + Receivables Collected)', 'Value': totalCashReceived },
    { 'Metric / KPI': 'Total Cash Outflows (Expenses Cash + Payables Paid)', 'Value': totalCashPaid },
    { 'Metric / KPI': 'Net Cash Movement', 'Value': netCashMovement },
    { 'Metric / KPI': 'Closing Cash Balance On Hand', 'Value': closingCashBalance },
    { 'Metric / KPI': 'Outstanding Accounts Receivable', 'Value': totalOutstandingReceivables },
    { 'Metric / KPI': 'Outstanding Accounts Payable', 'Value': totalOutstandingPayables },
    { 'Metric / KPI': 'Current Stock Valuation (At Cost)', 'Value': totalInventoryValuation },
    { 'Metric / KPI': 'Current Stock Valuation (Retail)', 'Value': totalInventoryRetail }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

  // 2. Sheet: Daily Comparison Breakdown
  const dayMap: Record<string, { sales: number; cost: number; expenses: number; grossProfit: number; netProfit: number }> = {};
  const startObj = new Date(startStr + 'T00:00:00');
  const endObj = new Date(endStr + 'T00:00:00');
  const diffDays = Math.min(Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1, 60);

  for (let i = 0; i < diffDays; i++) {
    const d = new Date(startObj);
    d.setDate(startObj.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    dayMap[dateKey] = { sales: 0, cost: 0, expenses: 0, grossProfit: 0, netProfit: 0 };
  }

  periodSales.forEach(s => {
    const d = s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10);
    if (!dayMap[d]) dayMap[d] = { sales: 0, cost: 0, expenses: 0, grossProfit: 0, netProfit: 0 };
    dayMap[d].sales += (s.grossSale || 0);
    dayMap[d].cost += (s.cost || 0);
  });

  periodExpenses.forEach(e => {
    const d = e.date.includes('T') ? e.date.split('T')[0] : e.date.slice(0, 10);
    if (!dayMap[d]) dayMap[d] = { sales: 0, cost: 0, expenses: 0, grossProfit: 0, netProfit: 0 };
    dayMap[d].expenses += (e.amount || 0);
  });

  const dailyRows = Object.keys(dayMap).sort().map(dKey => {
    const data = dayMap[dKey];
    const gp = data.sales - data.cost;
    const np = gp - data.expenses;
    const dayOfWeek = new Date(dKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    return {
      'Date': dKey,
      'Day of Week': dayOfWeek,
      [`Gross Sales (${currency})`]: data.sales,
      [`COGS (${currency})`]: data.cost,
      [`Expenses (${currency})`]: data.expenses,
      [`Gross Profit (${currency})`]: gp,
      [`Net Profit (${currency})`]: np,
      'Net Margin (%)': data.sales > 0 ? `${((np / data.sales) * 100).toFixed(1)}%` : '0%'
    };
  });

  const wsDaily = XLSX.utils.json_to_sheet(dailyRows);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Comparison');

  // 3. Sheet: Sales Transactions
  const salesRows = periodSales.map(s => ({
    'Receipt ID': s.id.slice(-8).toUpperCase(),
    'Date': s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10),
    'Time': s.date.includes('T') ? s.date.split('T')[1].slice(0, 5) : '--:--',
    'Customer Name': s.customerName || 'Walk-in Customer',
    'Payment Channel': s.paymentMethod || 'Cash',
    'Items Sold': s.items.map(i => `${i.productNameEn || i.productNameAm || 'Item'} (x${i.quantity})`).join(', '),
    [`Gross Sale (${currency})`]: s.grossSale,
    [`Cost Basis (${currency})`]: s.cost,
    [`Profit (${currency})`]: s.profit,
    'Notes': s.notes || ''
  }));

  const wsSales = XLSX.utils.json_to_sheet(salesRows.length > 0 ? salesRows : [{ 'Notice': 'No sales records in period' }]);
  XLSX.utils.book_append_sheet(wb, wsSales, 'Sales Ledger');

  // 4. Sheet: Expenses Ledger
  const expenseRows = periodExpenses.map(e => ({
    'Expense ID': e.id.slice(-8).toUpperCase(),
    'Date': e.date,
    'Expense Name': e.name,
    'Category': e.category,
    'Payment Method': e.paymentMethod || 'Cash',
    [`Amount (${currency})`]: e.amount,
    'Description': e.description || ''
  }));

  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows.length > 0 ? expenseRows : [{ 'Notice': 'No expense records in period' }]);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses Ledger');

  // 5. Sheet: Inventory Valuation
  const inventoryRows = products.map(p => ({
    'SKU': p.sku,
    'Product Name (EN)': p.nameEn,
    'Product Name (AM)': p.nameAm,
    'Category': p.category,
    'Stock Units': p.currentStock,
    'Unit Type': p.unit,
    [`Purchase Cost (${currency})`]: p.purchasePrice,
    [`Selling Price (${currency})`]: p.sellingPrice,
    [`Valuation at Cost (${currency})`]: p.purchasePrice * p.currentStock,
    [`Retail Value (${currency})`]: p.sellingPrice * p.currentStock,
    [`Potential Profit (${currency})`]: (p.sellingPrice - p.purchasePrice) * p.currentStock,
    'Supplier': p.supplier || 'N/A'
  }));

  const wsInventory = XLSX.utils.json_to_sheet(inventoryRows.length > 0 ? inventoryRows : [{ 'Notice': 'No inventory items registered' }]);
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventory Valuation');

  // Save Workbook
  const fileName = `unified-business-report-${period}-${startStr}-to-${endStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
