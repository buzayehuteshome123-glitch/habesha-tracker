import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, Product, BusinessSettings } from '../types';

export interface DailySalesReportOptions {
  dateStr: string; // YYYY-MM-DD
  sales: Sale[];
  products?: Product[];
  settings: BusinessSettings;
  customTitle?: string;
}

/**
 * Generates an executive, publication-grade Daily Sales PDF Report
 * with Ethiopian currency (ETB), channel breakdown, summary KPIs, and items table.
 */
export function generateDailySalesPDF({
  dateStr,
  sales,
  products = [],
  settings,
  customTitle
}: DailySalesReportOptions) {
  // Filter sales for the specific date
  const targetDate = dateStr || new Date().toISOString().slice(0, 10);
  const daySales = sales.filter(s => {
    const sDate = s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10);
    return sDate === targetDate;
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const currency = settings.currency || 'ETB';

  // Calculate day metrics
  const totalRevenue = daySales.reduce((acc, curr) => acc + (curr.grossSale || 0), 0);
  const totalCost = daySales.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const totalProfit = daySales.reduce((acc, curr) => acc + (curr.profit || 0), 0);
  const totalOrders = daySales.length;
  
  let totalItemsSold = 0;
  daySales.forEach(s => {
    s.items?.forEach(i => {
      totalItemsSold += (i.quantity || 0);
    });
  });

  // Calculate payment method breakdown
  let cashTotal = 0;
  let cbeTotal = 0;
  let telebirrTotal = 0;
  let ebirrTotal = 0;
  let sinqeeTotal = 0;
  let bankOtherTotal = 0;

  daySales.forEach(s => {
    const pm = (s.paymentMethod || '').toLowerCase();
    const amt = s.grossSale || 0;
    if (pm.includes('cbe') || pm.includes('commer')) {
      cbeTotal += amt;
    } else if (pm.includes('tele') || pm.includes('tell')) {
      telebirrTotal += amt;
    } else if (pm.includes('ebirr') || pm.includes('e-birr')) {
      ebirrTotal += amt;
    } else if (pm.includes('sinq') || pm.includes('sinqe')) {
      sinqeeTotal += amt;
    } else if (pm.includes('cash') || pm === '') {
      cashTotal += amt;
    } else {
      bankOtherTotal += amt;
    }
  });

  // 1. BRAND HEADER (Emerald Banner)
  doc.setFillColor(16, 185, 129); // #10B981 Emerald
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Business Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(settings.businessName || 'Habesha Tracker ERP', 14, 16);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const titleText = customTitle || `DAILY SALES AUDIT & SETTLEMENT REPORT`;
  doc.text(titleText, 14, 24);
  
  doc.setFontSize(8.5);
  doc.setTextColor(220, 252, 231);
  const formattedDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Audit Date: ${formattedDate} (${targetDate})`, 14, 31);

  // Business Contacts on the right
  doc.setFontSize(8);
  doc.setTextColor(240, 253, 244);
  const rightMargin = pageWidth - 14;
  if (settings.phone) {
    doc.text(`Tel: ${settings.phone}`, rightMargin, 14, { align: 'right' });
  }
  if (settings.email) {
    doc.text(`Email: ${settings.email}`, rightMargin, 19, { align: 'right' });
  }
  if (settings.address) {
    doc.text(`Location: ${settings.address}`, rightMargin, 24, { align: 'right' });
  }
  doc.text(`Generated: ${new Date().toLocaleTimeString()} EAT`, rightMargin, 29, { align: 'right' });

  // 2. METRIC SUMMARY CARDS (Top 4 Boxes)
  let curY = 46;
  const cardWidth = (pageWidth - 28 - 9) / 4; // 4 cards with 3mm gap
  const cardHeight = 20;

  const kpis = [
    { label: 'GROSS REVENUE', value: `${totalRevenue.toLocaleString()} ${currency}`, color: [16, 185, 129], bg: [240, 253, 244] },
    { label: 'EST. NET PROFIT', value: `${totalProfit.toLocaleString()} ${currency}`, color: [99, 102, 241], bg: [238, 242, 255] },
    { label: 'ORDERS / TRANSACTIONS', value: `${totalOrders} orders`, color: [14, 165, 233], bg: [240, 249, 255] },
    { label: 'TOTAL UNITS SOLD', value: `${totalItemsSold} items`, color: [245, 158, 11], bg: [254, 243, 199] }
  ];

  kpis.forEach((kpi, index) => {
    const x = 14 + index * (cardWidth + 3);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, curY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, curY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 3, curY + 14);
  });

  curY += cardHeight + 7;

  // 3. PAYMENT CHANNEL SETTLEMENT BREAKDOWN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('I. PAYMENT CHANNELS & CASH ON HAND SETTLEMENT', 14, curY);

  curY += 3;

  const paymentChannels = [
    { name: 'Physical Cash (ጥሬ ገንዘብ)', amount: cashTotal },
    { name: 'CBE Birr / CBE Account (ንግድ ባንክ)', amount: cbeTotal },
    { name: 'Telebirr Wallet (ቴሌብር)', amount: telebirrTotal },
    { name: 'E-Birr / Coopay (ኢ-ብር)', amount: ebirrTotal },
    { name: 'Sinqee Bank (ሲንቄ)', amount: sinqeeTotal },
    { name: 'Other Bank / Digital Wallets', amount: bankOtherTotal }
  ].filter(c => c.amount > 0 || c.name.includes('Cash') || c.name.includes('CBE') || c.name.includes('Telebirr'));

  const paymentData = paymentChannels.map(c => [
    c.name,
    `${c.amount.toLocaleString()} ${currency}`,
    totalRevenue > 0 ? `${((c.amount / totalRevenue) * 100).toFixed(1)}%` : '0%'
  ]);

  autoTable(doc, {
    startY: curY,
    head: [['Payment Channel / Account', 'Total Settled Amount', '% of Day Revenue']],
    body: paymentData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  curY = doc.lastAutoTable.finalY + 8;

  // 4. ITEMISED TRANSACTION LEDGER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`II. ITEMIZED SALES TRANSACTIONS (${daySales.length} Records)`, 14, curY);

  curY += 3;

  if (daySales.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`No sales transactions were logged on ${targetDate}.`, 14, curY + 6);
    curY += 16;
  } else {
    const tableRows = daySales.map((s, idx) => {
      const time = s.date.includes('T') ? s.date.split('T')[1].slice(0, 5) : '--:--';
      const itemsList = s.items.map(i => `${i.productNameEn || i.productNameAm || 'Item'} (x${i.quantity})`).join(', ');
      
      return [
        (idx + 1).toString(),
        s.id.slice(-6).toUpperCase(),
        time,
        s.customerName || 'Walk-in Customer',
        s.paymentMethod || 'Cash',
        itemsList,
        `${s.grossSale.toLocaleString()} ${currency}`,
        `${s.profit.toLocaleString()} ${currency}`
      ];
    });

    autoTable(doc, {
      startY: curY,
      head: [['#', 'Receipt', 'Time', 'Customer', 'Payment', 'Items Description', 'Gross Total', 'Profit']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        cellPadding: 2.5
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [51, 65, 85],
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 16, fontStyle: 'bold' },
        2: { cellWidth: 12, halign: 'center' },
        3: { cellWidth: 32 },
        4: { cellWidth: 22 },
        5: { cellWidth: 50 },
        6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
        7: { cellWidth: 18, halign: 'right', textColor: [16, 185, 129] }
      },
      margin: { left: 14, right: 14 }
    });

    // @ts-ignore
    curY = doc.lastAutoTable.finalY + 8;
  }

  // 5. SIGN-OFF & AUDIT VERIFICATION BOX
  const remainingSpace = doc.internal.pageSize.getHeight() - curY;
  if (remainingSpace < 35) {
    doc.addPage();
    curY = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, pageWidth - 28, 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DAILY END-OF-DAY AUDIT & CASH DRAWER VERIFICATION', 18, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Physical Cash Counted: _____________________ ETB', 18, curY + 13);
  doc.text('Digital Inflows Verified (Telebirr/CBE): [  ] Yes   [  ] No', 18, curY + 19);

  doc.text('Prepared By (Cashier/Storekeeper): ___________________________', pageWidth / 2 + 5, curY + 13);
  doc.text('Approved By (Manager/Owner): _______________________________', pageWidth / 2 + 5, curY + 19);

  // Footer on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Habesha Tracker ERP • Daily Sales Report • ${targetDate} • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // Download the file
  const fileName = `daily-sales-${targetDate}.pdf`;
  doc.save(fileName);
  return fileName;
}
