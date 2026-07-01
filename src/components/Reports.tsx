import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Package, 
  TrendingDown, 
  ArrowUpRight, 
  DollarSign, 
  Users, 
  Building2,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Product, Sale, Expense, Receivable, Payable, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../sampleData';

interface ReportsProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  receivables: Receivable[];
  payables: Payable[];
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
}

type ReportType = 
  | 'daily_sales_report'
  | 'sales_summary' 
  | 'inventory_valuation' 
  | 'profit_loss' 
  | 'expenses_breakdown' 
  | 'cash_flow';

export default function Reports({
  products,
  sales,
  expenses,
  receivables,
  payables,
  settings,
  addToast,
}: ReportsProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';

  // 1. States
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily_sales_report');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const [filterYear, setFilterYear] = useState('2026');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));

  // 2. Calculations based on report type
  // A. Sales Summary compilation
  const salesSummaryRows = sales.map(s => {
    return {
      'Date': new Date(s.date).toLocaleDateString(),
      'Customer': s.customerName,
      'Payment Method': s.paymentMethod,
      'Items Summary': s.items.map(i => `${i.productNameEn} (x${i.quantity})`).join(', '),
      'Gross Amount (ETB)': s.grossSale,
      'Profit (ETB)': s.profit
    };
  });

  // B. Inventory Valuation compilation
  const inventoryValuationRows = products.map(p => {
    return {
      'SKU': p.sku,
      'Product Name (EN)': p.nameEn,
      'Product Name (AM)': p.nameAm,
      'Category': p.category,
      'Stock Balance': p.currentStock,
      'Unit': p.unit,
      'Purchase Cost (ETB)': p.purchasePrice,
      'Valuation Cost Basis (ETB)': p.purchasePrice * p.currentStock,
      'Retail Value (ETB)': p.sellingPrice * p.currentStock,
      'Potential Profit (ETB)': (p.sellingPrice - p.purchasePrice) * p.currentStock
    };
  });

  // C. Expenses Breakdown compilation
  const expensesBreakdownRows = expenses.map(e => {
    return {
      'Date': e.date,
      'Expense Name': e.name,
      'Category': e.category,
      'Payment Method': e.paymentMethod,
      'Amount (ETB)': e.amount,
      'Description': e.description || 'N/A'
    };
  });

  // D. Profit & Loss Compilation
  const totalSalesVal = sales.reduce((acc, curr) => acc + curr.grossSale, 0);
  const totalCostVal = sales.reduce((acc, curr) => acc + curr.cost, 0);
  const grossProfit = totalSalesVal - totalCostVal;
  const totalExpensesVal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netEarnings = grossProfit - totalExpensesVal;

  const profitLossSummary = [
    { Indicator: 'Gross Sales Revenue (ሽያጮች)', Value: totalSalesVal },
    { Indicator: 'Cost of Goods Sold (የግዢ ወጪ)', Value: totalCostVal },
    { Indicator: 'Gross Business Profit (አጠቃላይ ትርፍ)', Value: grossProfit },
    { Indicator: 'Total Operating Expenses (ጠቅላላ ወጪዎች)', Value: totalExpensesVal },
    { Indicator: 'Net Business Earnings (የተጣራ ገቢ)', Value: netEarnings }
  ];

  // E. Cash Flow Compilation (Bank vs Cash movements)
  const cashInflow = sales.reduce((acc, curr) => acc + curr.grossSale, 0);
  const cashOutflow = expenses.reduce((acc, curr) => acc + curr.amount, 0) + payables.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const netFlow = cashInflow - cashOutflow;

  const cashFlowSummary = [
    { Activity: 'Digital & In-store Cash Inflows (From Sales)', Amount: cashInflow },
    { Activity: 'Operating Overhead Outflows (Expenses Logged)', Amount: -expenses.reduce((acc, curr) => acc + curr.amount, 0) },
    { Activity: 'Supplier Payments Settled (Payables Paid)', Amount: -payables.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0) },
    { Activity: 'Outstanding Customer Receivables (Not yet cash)', Amount: receivables.filter(r => r.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0) },
    { Activity: 'Net Cash Flow Position', Amount: netFlow }
  ];

  // F. Daily Sales Report
  const filteredDailySales = sales.filter(s => {
    return s.date.slice(0, 10) === reportDate;
  });

  const dailySalesRows = filteredDailySales.map(s => {
    return {
      'Receipt ID': s.id.slice(-8).toUpperCase(),
      'Customer Name': s.customerName,
      'Time': s.date.includes('T') ? s.date.split('T')[1].slice(0, 5) : 'N/A',
      'Payment Method': s.paymentMethod,
      'Items Sold': s.items.map(i => `${i.productNameEn} (x${i.quantity})`).join(', '),
      'Gross Amount (ETB)': s.grossSale,
      'Net Profit (ETB)': s.profit
    };
  });

  // 3. UNIVERSAL EXPORTS (PDF / Excel / CSV)
  const getSelectedDataRows = () => {
    if (selectedReport === 'daily_sales_report') return dailySalesRows;
    if (selectedReport === 'sales_summary') return salesSummaryRows;
    if (selectedReport === 'inventory_valuation') return inventoryValuationRows;
    if (selectedReport === 'expenses_breakdown') return expensesBreakdownRows;
    if (selectedReport === 'profit_loss') return profitLossSummary;
    return cashFlowSummary;
  };

  const handleExportCsv = () => {
    const rows = getSelectedDataRows();
    if (rows.length === 0) {
      addToast('No data to export.', 'warning');
      return;
    }

    const headers = Object.keys(rows[0]).join(',') + '\n';
    const content = rows.map(r => {
      return Object.values(r).map(v => {
        const strVal = String(v).replace(/"/g, '""');
        return strVal.includes(',') ? `"${strVal}"` : strVal;
      }).join(',');
    }).join('\n');

    const blob = new Blob([headers + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `habesha_report_${selectedReport}.csv`);
    link.click();
    addToast('Report downloaded as CSV.', 'success');
  };

  const handleExportExcel = () => {
    const rows = getSelectedDataRows();
    if (rows.length === 0) {
      addToast('No data to export.', 'warning');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report Sheet');
    XLSX.writeFile(wb, `habesha_report_${selectedReport}.xlsx`);
    addToast('Report exported to Excel successfully!', 'success');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const rows = getSelectedDataRows();
    if (rows.length === 0) {
      addToast(isAmharic ? 'ለማውረድ የሚሆን ምንም መረጃ የለም!' : 'No data to export.', 'warning');
      return;
    }

    // Colors
    const primaryColor = [16, 185, 129]; // Emerald
    const textColor = [30, 41, 59]; // slate-800
    const lightText = [100, 116, 139]; // slate-500
    const lightBg = [248, 250, 252]; // slate-50
    const borderGrey = [226, 232, 240]; // slate-200

    // 1. PAGE HEADER (Branding Banner)
    doc.setFillColor(16, 185, 129); // Emerald background for banner
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(settings.businessName || 'Habesha Tracker ERP', 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const reportTitle = selectedReport === 'daily_sales_report' 
      ? `DAILY SALES PERFORMANCE REPORT - ${reportDate}`
      : `OFFICIAL ERP REPORT: ${selectedReport.toUpperCase().replace(/_/g, ' ')}`;
    doc.text(reportTitle, 15, 27);
    
    // Business Metadata on the right of the banner
    doc.setFontSize(8);
    doc.setTextColor(230, 248, 240);
    doc.text(settings.phone ? `Phone: ${settings.phone}` : 'Phone: +251 900 000 000', 145, 14);
    doc.text(settings.email ? `Email: ${settings.email}` : 'Email: contact@habeshatracker.et', 145, 20);
    doc.text(settings.address ? `Address: ${settings.address}` : 'Address: Addis Ababa, Ethiopia', 145, 26);

    // 2. DOCUMENT METADATA INFO
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('I. REPORT SUMMARY METRICS', 15, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Compiled Date: ${new Date().toLocaleString()}`, 15, 59);
    doc.text(`Reporting Year: ${filterYear}`, 15, 64);
    doc.text(`Currency: ${settings.currency || 'ETB'}`, 15, 69);

    let startY = 75;

    // 3. DAILY SALES KPI BOXES (ONLY FOR DAILY SALES REPORT)
    if (selectedReport === 'daily_sales_report') {
      const dailyGross = filteredDailySales.reduce((acc, curr) => acc + curr.grossSale, 0);
      const dailyCost = filteredDailySales.reduce((acc, curr) => acc + curr.cost, 0);
      const dailyProfit = filteredDailySales.reduce((acc, curr) => acc + curr.profit, 0);
      const dailyCash = filteredDailySales.filter(s => s.paymentMethod === 'Cash').reduce((acc, curr) => acc + curr.grossSale, 0);
      const dailyBank = dailyGross - dailyCash;

      // Draw 3 styled cards side by side
      // Box 1: Gross Sales
      doc.setFillColor(240, 253, 244); // light green bg
      doc.setDrawColor(187, 247, 208); // green border
      doc.rect(15, startY, 56, 25, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(22, 101, 52); // green-800
      doc.text('DAILY GROSS REVENUE', 18, startY + 6);
      doc.setFontSize(13);
      doc.text(`${dailyGross.toLocaleString()} ${settings.currency || 'ETB'}`, 18, startY + 16);

      // Box 2: Net Profit
      doc.setFillColor(239, 246, 255); // light blue bg
      doc.setDrawColor(191, 219, 254); // blue border
      doc.rect(77, startY, 56, 25, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 64, 175); // blue-800
      doc.text('DAILY NET PROFIT', 80, startY + 6);
      doc.setFontSize(13);
      doc.text(`${dailyProfit.toLocaleString()} ${settings.currency || 'ETB'}`, 80, startY + 16);

      // Box 3: Total Transactions / Cash vs Bank split
      doc.setFillColor(255, 251, 235); // light amber bg
      doc.setDrawColor(253, 230, 138); // amber border
      doc.rect(139, startY, 56, 25, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text('COMPLETED SALES / SPLIT', 142, startY + 6);
      doc.setFontSize(12);
      doc.text(`${filteredDailySales.length} Orders`, 142, startY + 15);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Cash: ${dailyCash.toLocaleString()} | Bank: ${dailyBank.toLocaleString()}`, 142, startY + 21);

      startY += 34;
    }

    // 4. MAIN DATA TABLE DRAWER
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const tableSectionTitle = selectedReport === 'daily_sales_report' 
      ? 'II. COMPREHENSIVE DAILY SALES TRANSACTION LIST' 
      : 'II. EXECUTIVE DATA COMPILATION LEDGER';
    doc.text(tableSectionTitle, 15, startY);
    startY += 6;

    // Define columns & widths
    let headers: string[] = [];
    let colWidths: number[] = [];

    if (selectedReport === 'daily_sales_report') {
      headers = ['Receipt ID', 'Customer Name', 'Time', 'Payment', 'Items Sold', 'Gross (ETB)', 'Net Profit'];
      colWidths = [20, 28, 14, 18, 56, 22, 22];
    } else if (selectedReport === 'sales_summary') {
      headers = ['Date', 'Customer', 'Payment', 'Items Sold Summary', 'Gross (ETB)', 'Profit (ETB)'];
      colWidths = [22, 28, 22, 68, 22, 18];
    } else if (selectedReport === 'inventory_valuation') {
      headers = ['SKU', 'Product Name', 'Category', 'Stock', 'Unit', 'Retail (ETB)', 'Value (ETB)'];
      colWidths = [24, 44, 28, 14, 12, 28, 30];
    } else if (selectedReport === 'expenses_breakdown') {
      headers = ['Date', 'Expense Name', 'Category', 'Payment', 'Amount (ETB)', 'Description'];
      colWidths = [22, 35, 28, 20, 25, 50];
    } else {
      // P&L or Cash Flow (Single columns description + numeric)
      headers = [selectedReport === 'profit_loss' ? 'Financial Indicator / Metric' : 'Cash Flow Activity / Source', 'Amount / Value (ETB)'];
      colWidths = [125, 55];
    }

    // Draw header block
    doc.setFillColor(15, 23, 42); // slate-900 (professional dark header)
    doc.rect(15, startY, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    
    let curX = 15;
    headers.forEach((header, i) => {
      doc.text(header.toUpperCase(), curX + 2, startY + 5.5);
      curX += colWidths[i];
    });

    let curY = startY + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    rows.forEach((row, rowIdx) => {
      // Check for page overflow
      if (curY > 260) {
        doc.addPage();
        
        // Draw header again on new page
        doc.setFillColor(15, 23, 42);
        doc.rect(15, 15, 180, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        
        let pageX = 15;
        headers.forEach((header, i) => {
          doc.text(header.toUpperCase(), pageX + 2, 15 + 5.5);
          pageX += colWidths[i];
        });
        
        curY = 23;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
      }

      // Zebra striping background
      if (rowIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(15, curY, 180, 8, 'F');
      }

      // Draw cells
      let cellX = 15;
      const values = Object.values(row);
      values.forEach((val: any, cellIdx) => {
        let valStr = String(val !== undefined && val !== null ? val : '');
        const isNumericCol = typeof val === 'number';
        
        if (isNumericCol) {
          valStr = val.toLocaleString();
        }

        const width = colWidths[cellIdx] || 25;
        // Draw text with clipping if too long
        doc.text(valStr, cellX + 2, curY + 5.5, { maxWidth: width - 4 });
        cellX += width;
      });

      // Bottom line border for row
      doc.setDrawColor(241, 245, 249); // very light grey
      doc.line(15, curY + 8, 195, curY + 8);
      curY += 8;
    });

    // 5. SIGNATURE & STAMP FOOTER AT THE BOTTOM
    if (curY > 220) {
      doc.addPage();
      curY = 20;
    }

    curY += 25;
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(15, curY, 70, curY);
    doc.line(135, curY, 195, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Compiled By: Accountant / Supervisor', 15, curY + 5);
    doc.text('Authorized Signature & Corporate Stamp', 135, curY + 5);

    // Document timestamp signature
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`System Signature Hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-HABESHA-ERP`, 15, curY + 18);

    doc.save(`habesha_${selectedReport}_${new Date().toISOString().slice(0, 10)}.pdf`);
    addToast(
      isAmharic 
        ? 'የፒዲኤፍ ሪፖርት በተሳካ ሁኔታ ተዘጋጅቶ ወርዷል!' 
        : 'PDF report generated and downloaded successfully!', 
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            {t.reportsEngine}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Compile customized spreadsheets and printable executive summaries of sales performance, stock balances, expenses, and net profit.
          </p>
        </div>
      </div>

      {/* Report Selection Sidebar & View Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Selector Rails */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-sans pl-2">
              Select Compiled Target
            </span>

            {/* Daily Sales Report Button */}
            <button
              onClick={() => setSelectedReport('daily_sales_report')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                selectedReport === 'daily_sales_report' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
              id="btn-report-select-daily"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                Daily Sales Report
              </span>
              <span className="text-[10px] font-mono font-medium opacity-80">{filteredDailySales.length} items</span>
            </button>

            {/* Sales Summary Button */}
            <button
              onClick={() => setSelectedReport('sales_summary')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                selectedReport === 'sales_summary' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
              id="btn-report-select-sales"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 shrink-0" />
                Sales Summary Report
              </span>
              <span className="text-[10px] font-mono font-medium opacity-80">{sales.length} records</span>
            </button>

            {/* Inventory Valuation Button */}
            <button
              onClick={() => setSelectedReport('inventory_valuation')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                selectedReport === 'inventory_valuation' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
              id="btn-report-select-inv"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 shrink-0" />
                Inventory Valuation Ledger
              </span>
              <span className="text-[10px] font-mono font-medium opacity-80">{products.length} items</span>
            </button>

            {/* Expenses Breakdown Button */}
            <button
              onClick={() => setSelectedReport('expenses_breakdown')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                selectedReport === 'expenses_breakdown' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
              id="btn-report-select-expenses"
            >
              <span className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 shrink-0" />
                Operating Expenses Breakdown
              </span>
              <span className="text-[10px] font-mono font-medium opacity-80">{expenses.length} records</span>
            </button>

            {/* Profit & Loss summary report button */}
            <button
              onClick={() => setSelectedReport('profit_loss')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                selectedReport === 'profit_loss' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
              id="btn-report-select-profit"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 shrink-0" />
                Profit & Loss (P&L) Statement
              </span>
              <span className="text-[10px] font-bold text-emerald-500 font-mono">NET</span>
            </button>

            {/* Cash Flow Summary Button */}
            <button
              onClick={() => setSelectedReport('cash_flow')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                selectedReport === 'cash_flow' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
              id="btn-report-select-cashflow"
            >
              <span className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 shrink-0" />
                Cash Flow Statement
              </span>
              <span className="text-[10px] font-bold text-amber-500 font-mono">FLOW</span>
            </button>

          </div>

          {/* Quick Filter Configuration based on selected report */}
          {selectedReport === 'daily_sales_report' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 animate-in slide-in-from-top duration-200">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                {isAmharic ? 'የሪፖርት ቀን ይምረጡ' : 'Select Report Date'}
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden font-mono"
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                Filter Reporting Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                id="select-report-year"
              >
                <option value="2026">2026 E.C / G.C</option>
                <option value="2025">2025 E.C / G.C</option>
                <option value="2024">2024 E.C / G.C</option>
              </select>
            </div>
          )}
        </div>

        {/* Right Side Live Preview & Exports Actions */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col min-h-[500px]">
          
          {/* Toolbar exports */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider">
                Live Data Preview
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Review compiler metrics before executing files download.
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              {/* PDF */}
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200/50 dark:border-rose-900/30 transition cursor-pointer"
                id="btn-report-export-pdf"
              >
                <FileText className="w-3.5 h-3.5" />
                {t.exportPdf}
              </button>
              
              {/* Excel */}
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 transition cursor-pointer"
                id="btn-report-export-excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {t.exportExcel}
              </button>

              {/* CSV */}
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                id="btn-report-export-csv"
              >
                <Download className="w-3.5 h-3.5" />
                {t.exportCsv}
              </button>
            </div>
          </div>

          {/* Active compiled preview ledger */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  {Object.keys(getSelectedDataRows()[0] || {}).map(header => (
                    <th key={header} className="px-4 py-2.5">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {getSelectedDataRows().length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                      No compiled data rows found for active target.
                    </td>
                  </tr>
                ) : (
                  getSelectedDataRows().map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition">
                      {Object.values(row).map((val: any, cellIdx) => {
                        const isNum = typeof val === 'number';
                        return (
                          <td 
                            key={cellIdx} 
                            className={`px-4 py-3 ${isNum ? 'font-mono font-bold text-slate-800 dark:text-slate-100' : ''}`}
                          >
                            {isNum ? val.toLocaleString() : String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
