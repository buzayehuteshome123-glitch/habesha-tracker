import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, Expense, Receivable, Payable, Product, BusinessSettings } from '../types';
import { generateDailySalesPDF } from './pdfExport';

export { generateDailySalesPDF };

export type UnifiedReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface UnifiedReportOptions {
  period: UnifiedReportPeriod;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  sales: Sale[];
  expenses: Expense[];
  receivables?: Receivable[];
  payables?: Payable[];
  products?: Product[];
  settings: BusinessSettings;
  customTitle?: string;
}

export interface ExpenseReportOptions {
  startDate?: string;
  endDate?: string;
  expenses: Expense[];
  settings: BusinessSettings;
  customTitle?: string;
}

/**
 * Generates an executive, publication-grade Unified Business Report PDF
 * combining Sales, Expenses, Cash Reconciliation, Profitability, and Itemized Records.
 */
export function generateUnifiedBusinessReportPDF({
  period,
  startDate,
  endDate,
  sales,
  expenses,
  receivables = [],
  payables = [],
  products = [],
  settings,
  customTitle
}: UnifiedReportOptions) {
  const currency = settings.currency || 'ETB';
  const startStr = startDate || new Date().toISOString().slice(0, 10);
  const endStr = endDate || startStr;

  // Filter records within [startStr, endStr]
  const periodSales = sales.filter(s => {
    const sDate = s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10);
    return sDate >= startStr && sDate <= endStr;
  });

  const periodExpenses = expenses.filter(e => {
    const eDate = e.date.includes('T') ? e.date.split('T')[0] : e.date.slice(0, 10);
    return eDate >= startStr && eDate <= endStr;
  });

  // Calculate Sales Summary
  const totalSalesRevenue = periodSales.reduce((sum, s) => sum + (s.grossSale || 0), 0);
  const totalCOGS = periodSales.reduce((sum, s) => sum + (s.cost || 0), 0);
  const grossProfit = totalSalesRevenue - totalCOGS;
  const totalSalesProfit = periodSales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const totalSalesTransactions = periodSales.length;

  let totalUnitsSold = 0;
  periodSales.forEach(s => {
    s.items?.forEach(item => {
      totalUnitsSold += (item.quantity || 0);
    });
  });

  // Payment Channels Breakdown for Sales
  let cashSales = 0;
  let cbeSales = 0;
  let telebirrSales = 0;
  let ebirrSales = 0;
  let sinqeeSales = 0;
  let otherBankSales = 0;
  let creditSales = 0;

  periodSales.forEach(s => {
    const pm = (s.paymentMethod || '').toLowerCase();
    const amt = s.grossSale || 0;
    if (pm.includes('credit')) {
      creditSales += amt;
    } else if (pm.includes('cbe') || pm.includes('commer')) {
      cbeSales += amt;
    } else if (pm.includes('tele') || pm.includes('tell')) {
      telebirrSales += amt;
    } else if (pm.includes('ebirr') || pm.includes('e-birr')) {
      ebirrSales += amt;
    } else if (pm.includes('sinq') || pm.includes('sinqe')) {
      sinqeeSales += amt;
    } else if (pm.includes('cash') || pm === '') {
      cashSales += amt;
    } else {
      otherBankSales += amt;
    }
  });

  const totalBankSales = cbeSales + telebirrSales + ebirrSales + sinqeeSales + otherBankSales;

  // Calculate Expense Summary
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpenseTransactions = periodExpenses.length;
  const netProfit = grossProfit - totalExpenses;
  const grossMargin = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100) : 0;
  const netMargin = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100) : 0;

  // Expense by Category
  const expenseByCategory: Record<string, number> = {};
  let cashExpenses = 0;
  let bankExpenses = 0;

  periodExpenses.forEach(e => {
    const cat = e.category || 'General Operating';
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + (e.amount || 0);
    
    const pm = (e.paymentMethod || '').toLowerCase();
    if (pm.includes('cash') || pm === '') {
      cashExpenses += (e.amount || 0);
    } else {
      bankExpenses += (e.amount || 0);
    }
  });

  // Calculate Receivables and Payables in range
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

  // Cash Reconciliation
  // Prior Cash Calculation up to startStr
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

  // Inventory Valuation
  const totalInventoryValuation = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
  const totalInventoryRetail = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);

  // Generate jsPDF Document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper for Section Titles
  const drawSectionHeader = (title: string, yPos: number, accentColor: number[] = [16, 185, 129]) => {
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(14, yPos, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 19, yPos + 4.5);
    return yPos + 8;
  };

  // 1. BRAND & REPORT HEADER BANNER
  doc.setFillColor(15, 23, 42); // Slate 900 Executive Header
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Emerald Top Accent Line
  doc.setFillColor(16, 185, 129); // #10B981
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Business Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(settings.businessName || 'Habesha Tracker ERP', 14, 15);

  // Report Title Badge
  let periodTitle = 'UNIFIED BUSINESS REPORT';
  if (period === 'daily') periodTitle = 'DAILY BUSINESS REPORT';
  if (period === 'weekly') periodTitle = 'WEEKLY BUSINESS REPORT';
  if (period === 'monthly') periodTitle = 'MONTHLY BUSINESS REPORT';
  if (period === 'custom') periodTitle = 'CUSTOM PERIOD BUSINESS REPORT';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(customTitle || periodTitle, 14, 23);

  // Date Range Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const dateRangeText = startStr === endStr 
    ? `Reporting Date: ${startStr}`
    : `Period Scope: ${startStr} to ${endStr}`;
  doc.text(dateRangeText, 14, 30);

  // Company Contact Details on the Right
  const rightMargin = pageWidth - 14;
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  if (settings.phone) {
    doc.text(`Tel: ${settings.phone}`, rightMargin, 13, { align: 'right' });
  }
  if (settings.email) {
    doc.text(`Email: ${settings.email}`, rightMargin, 18, { align: 'right' });
  }
  if (settings.address) {
    doc.text(`Location: ${settings.address}`, rightMargin, 23, { align: 'right' });
  }
  doc.text(`Generated: ${new Date().toLocaleString()} (EAT)`, rightMargin, 28, { align: 'right' });

  // 2. EXECUTIVE METRIC TILES (4 CARDS)
  let curY = 44;
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 19;

  const topCards = [
    { label: 'TOTAL REVENUE', value: `${totalSalesRevenue.toLocaleString()} ${currency}`, sub: `${totalSalesTransactions} Sales Orders`, color: [16, 185, 129], bg: [240, 253, 244] },
    { label: 'TOTAL EXPENSES', value: `${totalExpenses.toLocaleString()} ${currency}`, sub: `${totalExpenseTransactions} Records`, color: [225, 29, 72], bg: [255, 241, 242] },
    { label: 'NET PROFIT', value: `${netProfit.toLocaleString()} ${currency}`, sub: `Margin: ${netMargin.toFixed(1)}%`, color: netProfit >= 0 ? [99, 102, 241] : [225, 29, 72], bg: [238, 242, 255] },
    { label: 'CLOSING CASH', value: `${closingCashBalance.toLocaleString()} ${currency}`, sub: `Net Flow: ${netCashMovement >= 0 ? '+' : ''}${netCashMovement.toLocaleString()}`, color: [217, 119, 6], bg: [254, 243, 199] }
  ];

  topCards.forEach((card, index) => {
    const x = 14 + index * (cardWidth + 3);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, curY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 2.5, curY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, x + 2.5, curY + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text(card.sub, x + 2.5, curY + 16);
  });

  curY += cardHeight + 6;

  // 3. COMBINED TWO-COLUMN SECTION: SALES SUMMARY & EXPENSE SUMMARY
  const colW = (pageWidth - 28 - 6) / 2;

  // Section A: Sales Summary & Payment Channels (Left Column)
  curY = drawSectionHeader('I. SALES & REVENUE CHANNELS', curY, [16, 185, 129]);

  const salesBreakdownRows = [
    ['Physical Cash Sales (ጥሬ ገንዘብ)', `${cashSales.toLocaleString()} ${currency}`, totalSalesRevenue > 0 ? `${((cashSales / totalSalesRevenue) * 100).toFixed(1)}%` : '0%'],
    ['CBE / Commercial Bank of Ethiopia', `${cbeSales.toLocaleString()} ${currency}`, totalSalesRevenue > 0 ? `${((cbeSales / totalSalesRevenue) * 100).toFixed(1)}%` : '0%'],
    ['Telebirr Digital Wallet (ቴሌብር)', `${telebirrSales.toLocaleString()} ${currency}`, totalSalesRevenue > 0 ? `${((telebirrSales / totalSalesRevenue) * 100).toFixed(1)}%` : '0%'],
    ['E-Birr / Coopay Wallet', `${ebirrSales.toLocaleString()} ${currency}`, totalSalesRevenue > 0 ? `${((ebirrSales / totalSalesRevenue) * 100).toFixed(1)}%` : '0%'],
    ['Sinqee Bank / Other Digital', `${(sinqeeSales + otherBankSales).toLocaleString()} ${currency}`, totalSalesRevenue > 0 ? `${(((sinqeeSales + otherBankSales) / totalSalesRevenue) * 100).toFixed(1)}%` : '0%'],
    ['Credit Sales (On Account)', `${creditSales.toLocaleString()} ${currency}`, totalSalesRevenue > 0 ? `${((creditSales / totalSalesRevenue) * 100).toFixed(1)}%` : '0%'],
    ['TOTAL SALES REVENUE', `${totalSalesRevenue.toLocaleString()} ${currency}`, '100%']
  ].filter((r, i) => i === 6 || !r[1].startsWith('0 '));

  autoTable(doc, {
    startY: curY,
    head: [['Sales Payment Channel', 'Amount', '% Share']],
    body: salesBreakdownRows,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [51, 65, 85],
      cellPadding: 1.8
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 32, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  curY = doc.lastAutoTable.finalY + 6;

  // Section B: Expense Summary & Category Breakdown
  curY = drawSectionHeader('II. OPERATING EXPENSES SUMMARY', curY, [225, 29, 72]);

  const expenseCategoryEntries = Object.entries(expenseByCategory);
  const expenseBreakdownRows = expenseCategoryEntries.map(([cat, amt]) => [
    cat,
    `${amt.toLocaleString()} ${currency}`,
    totalExpenses > 0 ? `${((amt / totalExpenses) * 100).toFixed(1)}%` : '0%'
  ]);

  if (expenseBreakdownRows.length === 0) {
    expenseBreakdownRows.push(['No Expenses Logged In Period', `0 ${currency}`, '0%']);
  }
  expenseBreakdownRows.push(['TOTAL OPERATING EXPENSES', `${totalExpenses.toLocaleString()} ${currency}`, '100%']);

  autoTable(doc, {
    startY: curY,
    head: [['Expense Category', 'Amount', '% of OpEx']],
    body: expenseBreakdownRows,
    theme: 'grid',
    headStyles: {
      fillColor: [225, 29, 72],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [51, 65, 85],
      cellPadding: 1.8
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 32, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  curY = doc.lastAutoTable.finalY + 6;

  // Section C: Cash Reconciliation & Working Capital Summary
  if (curY > 210) {
    doc.addPage();
    curY = 16;
  }

  curY = drawSectionHeader('III. CASH ON HAND & WORKING CAPITAL RECONCILIATION', curY, [217, 119, 6]);

  const cashReconRows = [
    ['Opening Cash Balance (ጅምር ጥሬ ገንዘብ)', `${openingCashBalance.toLocaleString()} ${currency}`, 'Starting physical cash at beginning of period'],
    ['(+) Cash Received from Sales', `+${cashSales.toLocaleString()} ${currency}`, 'Direct physical cash customer inflows'],
    ['(+) Receivables Collected', `+${periodReceivablesCollected.toLocaleString()} ${currency}`, 'Cash settled from credit customers'],
    ['(-) Cash Expenses Paid Out', `-${cashExpenses.toLocaleString()} ${currency}`, 'Direct physical cash operating overheads'],
    ['(-) Payables Settled to Suppliers', `-${periodPayablesPaid.toLocaleString()} ${currency}`, 'Cash supplier debt liquidations'],
    ['(=) Net Period Cash Movement', `${netCashMovement >= 0 ? '+' : ''}${netCashMovement.toLocaleString()} ${currency}`, 'Net change in physical cash position'],
    ['(=) CLOSING CASH BALANCE (የቀረ ጥሬ ገንዘብ)', `${closingCashBalance.toLocaleString()} ${currency}`, 'Estimated actual physical drawer count'],
    ['Outstanding Accounts Receivable (A/R)', `${totalOutstandingReceivables.toLocaleString()} ${currency}`, 'Total money owed to us by customers'],
    ['Outstanding Accounts Payable (A/P)', `${totalOutstandingPayables.toLocaleString()} ${currency}`, 'Total money we owe to suppliers'],
    ['Total Inventory Stock Valuation (At Cost)', `${totalInventoryValuation.toLocaleString()} ${currency}`, `Retail Value: ${totalInventoryRetail.toLocaleString()} ${currency}`]
  ];

  autoTable(doc, {
    startY: curY,
    head: [['Reconciliation Activity / Asset Metric', 'Amount', 'Accounting Description & Context']],
    body: cashReconRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [51, 65, 85],
      cellPadding: 1.8
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 77 }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  curY = doc.lastAutoTable.finalY + 6;

  // 4. DAILY COMPARISON TABLE (FOR WEEKLY, MONTHLY, OR CUSTOM PERIODS)
  if (period !== 'daily') {
    if (curY > 210) {
      doc.addPage();
      curY = 16;
    }

    curY = drawSectionHeader('IV. DAILY PERFORMANCE COMPARISON BREAKDOWN', curY, [99, 102, 241]);

    // Build map of days in range
    const dayMap: Record<string, { sales: number; cost: number; expenses: number; grossProfit: number; netProfit: number }> = {};
    
    // Populate all days from start to end if span is <= 31 days, otherwise group by day with records
    const startObj = new Date(startStr + 'T00:00:00');
    const endObj = new Date(endStr + 'T00:00:00');
    const diffDays = Math.min(Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1, 31);

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

    const dayRows = Object.keys(dayMap).sort().map(dKey => {
      const data = dayMap[dKey];
      const gp = data.sales - data.cost;
      const np = gp - data.expenses;
      const dayName = new Date(dKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      return [
        `${dKey} (${dayName})`,
        `${data.sales.toLocaleString()} ${currency}`,
        `${data.expenses.toLocaleString()} ${currency}`,
        `${gp.toLocaleString()} ${currency}`,
        `${np.toLocaleString()} ${currency}`,
        data.sales > 0 ? `${((np / data.sales) * 100).toFixed(1)}%` : '0%'
      ];
    });

    autoTable(doc, {
      startY: curY,
      head: [['Day / Date', 'Sales Revenue', 'Expenses', 'Gross Profit', 'Net Profit', 'Net Margin']],
      body: dayRows,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        cellPadding: 1.8
      },
      bodyStyles: {
        fontSize: 6.5,
        textColor: [51, 65, 85],
        cellPadding: 1.8
      },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 32, halign: 'right' },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 24, halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    // @ts-ignore
    curY = doc.lastAutoTable.finalY + 6;
  }

  // 5. ITEMIZED LEDGER SECTION (Top Sales & Expenses)
  if (curY > 210) {
    doc.addPage();
    curY = 16;
  }

  curY = drawSectionHeader('V. ITEMIZED TRANSACTION LEDGER HIGHLIGHTS', curY, [15, 23, 42]);

  // Combined Highlights
  const ledgerRows = periodSales.slice(0, 15).map((s, idx) => {
    const time = s.date.includes('T') ? s.date.split('T')[1].slice(0, 5) : '--:--';
    const sDate = s.date.slice(0, 10);
    const itemsSummary = s.items.map(i => `${i.productNameEn || i.productNameAm || 'Item'} (x${i.quantity})`).join(', ');
    return [
      `SALE-${s.id.slice(-5).toUpperCase()}`,
      `${sDate} ${time}`,
      s.customerName || 'Walk-in Customer',
      s.paymentMethod || 'Cash',
      itemsSummary,
      `${s.grossSale.toLocaleString()} ${currency}`,
      `${s.profit.toLocaleString()} ${currency}`
    ];
  });

  if (ledgerRows.length > 0) {
    autoTable(doc, {
      startY: curY,
      head: [['Ref ID', 'Date/Time', 'Customer Name', 'Channel', 'Items Sold Summary', 'Gross Total', 'Profit']],
      body: ledgerRows,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 6.8,
        fontStyle: 'bold',
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 6.2,
        textColor: [51, 65, 85],
        cellPadding: 1.8
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' },
        1: { cellWidth: 24 },
        2: { cellWidth: 32 },
        3: { cellWidth: 22 },
        4: { cellWidth: 46 },
        5: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 18, halign: 'right', textColor: [16, 185, 129] }
      },
      margin: { left: 14, right: 14 }
    });

    // @ts-ignore
    curY = doc.lastAutoTable.finalY + 8;
  }

  // 6. SIGN-OFF & VERIFICATION AUDIT BOX
  if (pageHeight - curY < 35) {
    doc.addPage();
    curY = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('CORPORATE AUDIT & BUSINESS VERIFICATION ENDORSEMENT', 18, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Physical Cash Verified In Drawer: __________________________ ETB', 18, curY + 12);
  doc.text('Bank & Digital Ledger Balances Matched: [  ] Yes   [  ] Discrepancy Noted', 18, curY + 18);

  doc.text('Prepared By (Accountant / Cashier): ___________________________', pageWidth / 2 + 5, curY + 12);
  doc.text('Authorized Signature & Stamp: _______________________________', pageWidth / 2 + 5, curY + 18);

  // Footers on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Habesha Tracker ERP • Unified Business Report • Scope: ${startStr} - ${endStr} • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Save PDF
  const fileName = `unified-business-report-${period}-${startStr}-to-${endStr}.pdf`;
  doc.save(fileName);
  return fileName;
}

/**
 * Generates an executive Expense PDF Report
 */
export function generateExpenseReportPDF({
  startDate,
  endDate,
  expenses,
  settings,
  customTitle
}: ExpenseReportOptions) {
  const currency = settings.currency || 'ETB';
  const startStr = startDate || new Date().toISOString().slice(0, 10);
  const endStr = endDate || startStr;

  const periodExpenses = expenses.filter(e => {
    const eDate = e.date.includes('T') ? e.date.split('T')[0] : e.date.slice(0, 10);
    return eDate >= startStr && eDate <= endStr;
  });

  const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner
  doc.setFillColor(225, 29, 72); // Rose 600
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(settings.businessName || 'Habesha Tracker ERP', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(customTitle || 'OPERATING EXPENSES AUDIT REPORT', 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(254, 205, 211);
  doc.text(`Period Scope: ${startStr} to ${endStr} • Total Logged: ${periodExpenses.length} Records`, 14, 30);

  const rightMargin = pageWidth - 14;
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  if (settings.phone) doc.text(`Tel: ${settings.phone}`, rightMargin, 14, { align: 'right' });
  if (settings.email) doc.text(`Email: ${settings.email}`, rightMargin, 19, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleTimeString()} EAT`, rightMargin, 24, { align: 'right' });

  // Summary Card
  let curY = 43;
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(14, curY, pageWidth - 28, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(159, 18, 57);
  doc.text('TOTAL OPERATING EXPENSES INCURRED', 18, curY + 6);

  doc.setFontSize(12);
  doc.text(`${totalExpenses.toLocaleString()} ${currency}`, 18, curY + 13.5);

  curY += 24;

  // Category Breakdown Table
  const categoryMap: Record<string, number> = {};
  periodExpenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const categoryRows = Object.entries(categoryMap).map(([cat, amt]) => [
    cat,
    `${amt.toLocaleString()} ${currency}`,
    totalExpenses > 0 ? `${((amt / totalExpenses) * 100).toFixed(1)}%` : '0%'
  ]);

  autoTable(doc, {
    startY: curY,
    head: [['Expense Category', 'Total Incurred', '% of Total']],
    body: categoryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 1.8
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 37, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  curY = doc.lastAutoTable.finalY + 8;

  // Detailed Expense Items Table
  const expenseTableRows = periodExpenses.map((e, idx) => [
    (idx + 1).toString(),
    e.date,
    e.name,
    e.category,
    e.paymentMethod || 'Cash',
    e.description || 'N/A',
    `${e.amount.toLocaleString()} ${currency}`
  ]);

  autoTable(doc, {
    startY: curY,
    head: [['#', 'Date', 'Expense Title', 'Category', 'Payment', 'Description / Voucher', 'Amount']],
    body: expenseTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [225, 29, 72],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 1.8
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 36, fontStyle: 'bold' },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 44 },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold', textColor: [225, 29, 72] }
    },
    margin: { left: 14, right: 14 }
  });

  // Footer on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Habesha Tracker ERP • Expense Report • Scope: ${startStr} - ${endStr} • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const fileName = `expense-report-${startStr}-to-${endStr}.pdf`;
  doc.save(fileName);
  return fileName;
}
