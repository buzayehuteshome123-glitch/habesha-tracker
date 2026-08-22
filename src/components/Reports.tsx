import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign, 
  Building2,
  FileText,
  Share2,
  RefreshCw,
  Eye,
  PieChart as PieIcon,
  Layers,
  Wallet,
  CheckCircle2,
  ChevronDown,
  Filter,
  Check,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import * as XLSX from 'xlsx';
import { Product, Sale, Expense, Receivable, Payable, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../sampleData';
import { generateDailySalesPDF } from '../utils/pdfExport';
import { generateUnifiedBusinessReportPDF, generateExpenseReportPDF } from '../utils/unifiedPdfExport';
import { generateUnifiedExcelReport } from '../utils/excelExport';

interface ReportsProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  receivables: Receivable[];
  payables: Payable[];
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
  onOpenSpreadShare?: () => void;
}

type ReportType = 
  | 'daily_report'
  | 'weekly_report'
  | 'monthly_report'
  | 'custom_range'
  | 'sales_summary' 
  | 'expenses_breakdown'
  | 'inventory_valuation' 
  | 'profit_loss' 
  | 'cash_flow';

type PreviewTab = 'executive' | 'daily_comparison' | 'charts' | 'cash_audit' | 'ledger';

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#64748B'];

export default function Reports({
  products,
  sales,
  expenses,
  receivables,
  payables,
  settings,
  addToast,
  onOpenSpreadShare,
}: ReportsProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';
  const currency = settings.currency || 'ETB';

  // Helper date generators
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  
  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  };

  const getStartOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  };

  // 1. Report Center Navigation & Filter States
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily_report');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<PreviewTab>('executive');
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Handle Preset Switching
  const handleReportTypeChange = (type: ReportType) => {
    setSelectedReport(type);
    if (type === 'daily_report') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'weekly_report') {
      setStartDate(getStartOfWeek());
      setEndDate(todayStr);
    } else if (type === 'monthly_report') {
      setStartDate(getStartOfMonth());
      setEndDate(todayStr);
    } else if (type === 'custom_range') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setStartDate(thirtyDaysAgo.toISOString().slice(0, 10));
      setEndDate(todayStr);
    }
  };

  // Quick Date Presets
  const applyPreset = (preset: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'last_30_days') => {
    const now = new Date();
    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'this_week') {
      setStartDate(getStartOfWeek());
      setEndDate(todayStr);
    } else if (preset === 'last_week') {
      const lastMon = new Date();
      lastMon.setDate(lastMon.getDate() - lastMon.getDay() - 6);
      const lastSun = new Date();
      lastSun.setDate(lastSun.getDate() - lastSun.getDay());
      setStartDate(lastMon.toISOString().slice(0, 10));
      setEndDate(lastSun.toISOString().slice(0, 10));
    } else if (preset === 'this_month') {
      setStartDate(getStartOfMonth());
      setEndDate(todayStr);
    } else if (preset === 'last_month') {
      const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstLastMonth.toISOString().slice(0, 10));
      setEndDate(lastDayLastMonth.toISOString().slice(0, 10));
    } else if (preset === 'last_30_days') {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 29);
      setStartDate(past30.toISOString().slice(0, 10));
      setEndDate(todayStr);
    }
    addToast(isAmharic ? 'የቀን ወሰን ተቀይሯል!' : 'Date range updated!', 'info');
  };

  // 2. Filtered Dataset Computations based on [startDate, endDate]
  const periodSales = useMemo(() => {
    return sales.filter(s => {
      const sDate = s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10);
      return sDate >= startDate && sDate <= endDate;
    });
  }, [sales, startDate, endDate]);

  const periodExpenses = useMemo(() => {
    return expenses.filter(e => {
      const eDate = e.date.includes('T') ? e.date.split('T')[0] : e.date.slice(0, 10);
      return eDate >= startDate && eDate <= endDate;
    });
  }, [expenses, startDate, endDate]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalRevenue = periodSales.reduce((sum, s) => sum + (s.grossSale || 0), 0);
    const totalCOGS = periodSales.reduce((sum, s) => sum + (s.cost || 0), 0);
    const grossProfit = totalRevenue - totalCOGS;
    const totalExpensesAmt = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = grossProfit - totalExpensesAmt;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    let totalUnitsSold = 0;
    periodSales.forEach(s => {
      s.items?.forEach(item => {
        totalUnitsSold += (item.quantity || 0);
      });
    });

    // Payment Channel breakdowns
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

    // Expense breakdowns
    let cashExpenses = 0, bankExpenses = 0;
    const expenseByCategory: Record<string, number> = {};
    periodExpenses.forEach(e => {
      expenseByCategory[e.category || 'General'] = (expenseByCategory[e.category || 'General'] || 0) + (e.amount || 0);
      const pm = (e.paymentMethod || '').toLowerCase();
      if (pm.includes('cash') || pm === '') cashExpenses += e.amount;
      else bankExpenses += e.amount;
    });

    // Receivables & Payables
    const periodReceivablesCollected = receivables
      .filter(r => r.status === 'Paid' && r.dueDate >= startDate && r.dueDate <= endDate)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const totalOutstandingReceivables = receivables
      .filter(r => r.status === 'Pending' || r.status === 'Overdue')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const periodPayablesPaid = payables
      .filter(p => p.status === 'Paid' && p.dueDate >= startDate && p.dueDate <= endDate)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalOutstandingPayables = payables
      .filter(p => p.status === 'Pending' || p.status === 'Overdue')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Cash Reconciliation
    const priorSalesCash = sales
      .filter(s => {
        const sDate = s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10);
        const pm = (s.paymentMethod || '').toLowerCase();
        return sDate < startDate && (pm.includes('cash') || pm === '');
      })
      .reduce((sum, s) => sum + s.grossSale, 0);

    const priorExpensesCash = expenses
      .filter(e => {
        const eDate = e.date.includes('T') ? e.date.split('T')[0] : e.date.slice(0, 10);
        const pm = (e.paymentMethod || '').toLowerCase();
        return eDate < startDate && (pm.includes('cash') || pm === '');
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const startingCashBase = Number(settings.startingCash) || 0;
    const cashAdjustBase = Number(settings.cashAdjust) || 0;
    const openingCashBalance = startingCashBase + priorSalesCash - priorExpensesCash + cashAdjustBase;

    const totalCashReceived = cashSales + periodReceivablesCollected;
    const totalCashPaid = cashExpenses + periodPayablesPaid;
    const netCashMovement = totalCashReceived - totalCashPaid;
    const closingCashBalance = openingCashBalance + netCashMovement;

    // Inventory status
    const totalInventoryValuation = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
    const totalInventoryRetail = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);

    return {
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpensesAmt,
      netProfit,
      grossMargin,
      netMargin,
      totalUnitsSold,
      cashSales,
      cbeSales,
      telebirrSales,
      ebirrSales,
      sinqeeSales,
      otherBankSales,
      creditSales,
      cashExpenses,
      bankExpenses,
      expenseByCategory,
      periodReceivablesCollected,
      totalOutstandingReceivables,
      periodPayablesPaid,
      totalOutstandingPayables,
      openingCashBalance,
      totalCashReceived,
      totalCashPaid,
      netCashMovement,
      closingCashBalance,
      totalInventoryValuation,
      totalInventoryRetail
    };
  }, [periodSales, periodExpenses, receivables, payables, products, sales, expenses, startDate, endDate, settings]);

  // Daily Comparison Rows (for Table & Chart)
  const dailyComparisonData = useMemo(() => {
    const dayMap: Record<string, { date: string; day: string; sales: number; cogs: number; expenses: number; grossProfit: number; netProfit: number }> = {};
    const startObj = new Date(startDate + 'T00:00:00');
    const endObj = new Date(endDate + 'T00:00:00');
    const diffDays = Math.min(Math.max(Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1), 60);

    for (let i = 0; i < diffDays; i++) {
      const d = new Date(startObj);
      d.setDate(startObj.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayMap[dateKey] = { date: dateKey, day: dayName, sales: 0, cogs: 0, expenses: 0, grossProfit: 0, netProfit: 0 };
    }

    periodSales.forEach(s => {
      const d = s.date.includes('T') ? s.date.split('T')[0] : s.date.slice(0, 10);
      if (!dayMap[d]) {
        const dayName = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
        dayMap[d] = { date: d, day: dayName, sales: 0, cogs: 0, expenses: 0, grossProfit: 0, netProfit: 0 };
      }
      dayMap[d].sales += (s.grossSale || 0);
      dayMap[d].cogs += (s.cost || 0);
    });

    periodExpenses.forEach(e => {
      const d = e.date.includes('T') ? e.date.split('T')[0] : e.date.slice(0, 10);
      if (!dayMap[d]) {
        const dayName = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
        dayMap[d] = { date: d, day: dayName, sales: 0, cogs: 0, expenses: 0, grossProfit: 0, netProfit: 0 };
      }
      dayMap[d].expenses += (e.amount || 0);
    });

    return Object.keys(dayMap).sort().map(dKey => {
      const item = dayMap[dKey];
      const gp = item.sales - item.cogs;
      const np = gp - item.expenses;
      return {
        ...item,
        grossProfit: gp,
        netProfit: np
      };
    });
  }, [periodSales, periodExpenses, startDate, endDate]);

  // Top Selling Products in Range
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};
    periodSales.forEach(s => {
      s.items?.forEach(i => {
        const name = i.productNameEn || i.productNameAm || 'Product';
        if (!map[name]) {
          map[name] = { name, quantity: 0, revenue: 0, profit: 0 };
        }
        map[name].quantity += (i.quantity || 0);
        map[name].revenue += (i.sellingPrice * i.quantity);
        map[name].profit += ((i.sellingPrice - i.purchasePrice) * i.quantity);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [periodSales]);

  // Payment Channels Chart Data
  const paymentChannelData = useMemo(() => {
    return [
      { name: 'Cash (ጥሬ ገንዘብ)', value: metrics.cashSales },
      { name: 'CBE (ንግድ ባንክ)', value: metrics.cbeSales },
      { name: 'Telebirr (ቴሌብር)', value: metrics.telebirrSales },
      { name: 'E-Birr (ኢ-ብር)', value: metrics.ebirrSales },
      { name: 'Sinqee / Other', value: metrics.sinqeeSales + metrics.otherBankSales },
      { name: 'Credit (ብድር)', value: metrics.creditSales }
    ].filter(item => item.value > 0);
  }, [metrics]);

  // Expense Categories Chart Data
  const expenseCategoryData = useMemo(() => {
    return Object.entries(metrics.expenseByCategory).map(([name, value]) => ({
      name,
      value
    }));
  }, [metrics.expenseByCategory]);

  // Export Handlers
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      addToast(
        isAmharic 
          ? `የ ${startDate} እስከ ${endDate} ሪፖርት በተሳካ ሁኔታ ተዘጋጅቷል!` 
          : `Business report for ${startDate} to ${endDate} compiled successfully!`, 
        'success'
      );
    }, 300);
  };

  const handleExportUnifiedPDF = () => {
    try {
      let p: 'daily' | 'weekly' | 'monthly' | 'custom' = 'custom';
      if (startDate === endDate) p = 'daily';
      else if (selectedReport === 'weekly_report') p = 'weekly';
      else if (selectedReport === 'monthly_report') p = 'monthly';

      generateUnifiedBusinessReportPDF({
        period: p,
        startDate,
        endDate,
        sales,
        expenses,
        receivables,
        payables,
        products,
        settings
      });

      addToast(
        isAmharic 
          ? 'አጠቃላይ የንግድ ሪፖርት (Unified PDF) በተሳካ ሁኔታ ወርዷል!' 
          : 'Unified Business Report PDF generated and downloaded successfully!', 
        'success'
      );
      setIsPdfDropdownOpen(false);
    } catch (e) {
      console.error(e);
      addToast('Failed to export Unified PDF report', 'warning');
    }
  };

  const handleExportSalesPDF = () => {
    try {
      generateDailySalesPDF({
        dateStr: startDate,
        sales,
        products,
        settings,
        customTitle: startDate === endDate 
          ? `DAILY SALES AUDIT REPORT (${startDate})` 
          : `SALES AUDIT REPORT (${startDate} to ${endDate})`
      });
      addToast(isAmharic ? 'የሽያጭ ሪፖርት PDF ወርዷል!' : 'Sales Report PDF downloaded!', 'success');
      setIsPdfDropdownOpen(false);
    } catch (e) {
      console.error(e);
      addToast('Failed to generate Sales PDF', 'warning');
    }
  };

  const handleExportExpensesPDF = () => {
    try {
      generateExpenseReportPDF({
        startDate,
        endDate,
        expenses,
        settings
      });
      addToast(isAmharic ? 'የወጪ ሪፖርት PDF ወርዷል!' : 'Expense Report PDF downloaded!', 'success');
      setIsPdfDropdownOpen(false);
    } catch (e) {
      console.error(e);
      addToast('Failed to generate Expense PDF', 'warning');
    }
  };

  const handleExportExcel = () => {
    try {
      let p: 'daily' | 'weekly' | 'monthly' | 'custom' = 'custom';
      if (startDate === endDate) p = 'daily';
      else if (selectedReport === 'weekly_report') p = 'weekly';
      else if (selectedReport === 'monthly_report') p = 'monthly';

      generateUnifiedExcelReport({
        period: p,
        startDate,
        endDate,
        sales,
        expenses,
        receivables,
        payables,
        products,
        settings
      });

      addToast(
        isAmharic 
          ? 'አጠቃላይ የንግድ ሪፖርት ወደ ኤክሴል (Excel) በተሳካ ሁኔታ ተልኳል!' 
          : 'Unified Business Report exported to Excel (.xlsx) successfully!', 
        'success'
      );
    } catch (e) {
      console.error(e);
      addToast('Failed to export Excel report', 'warning');
    }
  };

  const handleExportCSV = () => {
    try {
      const rows = dailyComparisonData.map(r => ({
        Date: r.date,
        Day: r.day,
        SalesRevenue: r.sales,
        COGS: r.cogs,
        Expenses: r.expenses,
        GrossProfit: r.grossProfit,
        NetProfit: r.netProfit,
        NetMargin: r.sales > 0 ? `${((r.netProfit / r.sales) * 100).toFixed(1)}%` : '0%'
      }));

      if (rows.length === 0) {
        addToast('No data to export', 'warning');
        return;
      }

      const headers = Object.keys(rows[0]).join(',') + '\n';
      const content = rows.map(r => Object.values(r).join(',')).join('\n');
      const blob = new Blob([headers + content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `business-report-${startDate}-to-${endDate}.csv`);
      link.click();
      addToast('CSV export downloaded!', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to export CSV', 'warning');
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
                {isAmharic ? 'የንግድ ሪፖርቶች ማዕከል (Report Center)' : 'Business Report Center & PDF Export'}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5 font-sans">
                {isAmharic 
                  ? 'የተሟላ የቀን፣ የሳምንት እና የወር የንግድ እንቅስቃሴ ሪፖርቶችን በአንድ ላይ ይመልከቱ እና ያውርዱ።' 
                  : 'Compile unified executive business reports, daily performance matrices, cash reconciliations, and publication-ready PDFs.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenSpreadShare && (
            <button
              onClick={onOpenSpreadShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              id="btn-report-spread-share"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'አጋራ (Spread & Share)' : 'Spread & Share'}</span>
            </button>
          )}

          {/* Unified PDF Export Dropdown */}
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs shadow-rose-600/20 transition cursor-pointer"
              id="btn-report-export-pdf-menu"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'PDF ሪፖርት አውርድ' : 'Export PDF'}</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {isPdfDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-2xl shadow-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 ring-1 ring-black/5 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={handleExportUnifiedPDF}
                  className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-100 transition group cursor-pointer"
                  id="btn-pdf-unified"
                >
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {isAmharic ? 'አጠቃላይ የንግድ ሪፖርት (Unified PDF)' : 'Unified Business Report PDF'}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {isAmharic ? 'ሽያጭ፣ ወጪ፣ ጥሬ ገንዘብ፣ ትርፍ እና ኦዲት በአንድ ላይ' : 'All-in-one Sales, Expenses, Cash, Profit, & Audit'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleExportSalesPDF}
                  className="w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  id="btn-pdf-sales"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold">{isAmharic ? 'የሽያጭ ሪፖርት (Sales PDF)' : 'Sales Audit Report PDF'}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">Detailed channel & itemized sales</p>
                  </div>
                </button>

                <button
                  onClick={handleExportExpensesPDF}
                  className="w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  id="btn-pdf-expenses"
                >
                  <TrendingDown className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold">{isAmharic ? 'የወጪ ሪፖርት (Expense PDF)' : 'Expense Audit Report PDF'}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">Operating expense categories & vouchers</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 transition cursor-pointer"
            id="btn-report-export-excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'ወደ Excel ላክ' : 'Export Excel'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            id="btn-report-export-csv"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 1. REPORT CENTER CONFIGURATION & DATE PICKER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Top Selectors: Daily, Weekly, Monthly, Custom Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleReportTypeChange('daily_report')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedReport === 'daily_report'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              id="btn-tab-daily"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የዕለት ሪፖርት (Daily)' : 'Daily Report'}</span>
            </button>

            <button
              onClick={() => handleReportTypeChange('weekly_report')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedReport === 'weekly_report'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              id="btn-tab-weekly"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ሳምንታዊ ሪፖርት (Weekly)' : 'Weekly Report'}</span>
            </button>

            <button
              onClick={() => handleReportTypeChange('monthly_report')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedReport === 'monthly_report'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              id="btn-tab-monthly"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ወርሃዊ ሪፖርት (Monthly)' : 'Monthly Report'}</span>
            </button>

            <button
              onClick={() => handleReportTypeChange('custom_range')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedReport === 'custom_range'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              id="btn-tab-custom"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የተመረጠ ቀን ወሰን (Custom Range)' : 'Custom Range'}</span>
            </button>
          </div>

          {/* Quick Presets Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-semibold mr-1">{isAmharic ? 'ፈጣን ምርጫ:' : 'Presets:'}</span>
            <button 
              onClick={() => applyPreset('today')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
            >
              {isAmharic ? 'ዛሬ' : 'Today'}
            </button>
            <button 
              onClick={() => applyPreset('yesterday')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
            >
              {isAmharic ? 'ትናንት' : 'Yesterday'}
            </button>
            <button 
              onClick={() => applyPreset('this_week')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
            >
              {isAmharic ? 'ይህ ሳምንት' : 'This Week'}
            </button>
            <button 
              onClick={() => applyPreset('this_month')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
            >
              {isAmharic ? 'ይህ ወር' : 'This Month'}
            </button>
            <button 
              onClick={() => applyPreset('last_30_days')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
            >
              {isAmharic ? 'ባለፉት 30 ቀናት' : 'Last 30 Days'}
            </button>
          </div>
        </div>

        {/* Date Pickers Form & Generate Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
          
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              {isAmharic ? 'የመጀመሪያ ቀን (Start Date)' : 'Start Date'}
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-white font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                id="input-report-start-date"
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              {isAmharic ? 'የመጨረሻ ቀን (End Date)' : 'End Date'}
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-white font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                id="input-report-end-date"
              />
            </div>
          </div>

          <div className="md:col-span-4 flex gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              id="btn-generate-report"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isAmharic ? 'ሪፖርት አመንጭ (Generate)' : 'Generate Report'}</span>
            </button>

            <button
              onClick={() => setActiveTab('executive')}
              className="flex items-center justify-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              title="Preview Summary"
              id="btn-preview-report"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>{isAmharic ? 'ዕይታ' : 'Preview'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 2. EXECUTIVE SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Sales Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAmharic ? 'ጠቅላላ ሽያጭ (Revenue)' : 'Total Gross Sales'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-white">
            {metrics.totalRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{currency}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50 dark:border-slate-800/60 font-sans">
            <span>{periodSales.length} {isAmharic ? 'ግብይቶች' : 'Orders'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{metrics.totalUnitsSold} {isAmharic ? 'ዕቃዎች ተሽጠዋል' : 'units sold'}</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAmharic ? 'ጠቅላላ ወጪዎች (Expenses)' : 'Total Operating Expenses'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-white">
            {metrics.totalExpensesAmt.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{currency}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50 dark:border-slate-800/60 font-sans">
            <span>{periodExpenses.length} {isAmharic ? 'የወጪ ሰነዶች' : 'Records'}</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">COGS: {metrics.totalCOGS.toLocaleString()} {currency}</span>
          </div>
        </div>

        {/* Net Profit & Margins */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAmharic ? 'የተጣራ ትርፍ (Net Profit)' : 'Net Business Profit'}
            </span>
            <div className={`w-8 h-8 rounded-lg ${metrics.netProfit >= 0 ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600'} flex items-center justify-center font-bold`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-bold font-mono ${metrics.netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
            {metrics.netProfit.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{currency}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50 dark:border-slate-800/60 font-sans">
            <span>Gross: {metrics.grossMargin.toFixed(1)}%</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Net Margin: {metrics.netMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Closing Cash & Net Cash Movement */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAmharic ? 'በእጅ የቀረ ጥሬ ገንዘብ' : 'Closing Cash on Hand'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-white">
            {metrics.closingCashBalance.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{currency}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50 dark:border-slate-800/60 font-sans">
            <span>{isAmharic ? 'የቀን እንቅስቃሴ:' : 'Net Movement:'}</span>
            <span className={`font-semibold ${metrics.netCashMovement >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {metrics.netCashMovement >= 0 ? '+' : ''}{metrics.netCashMovement.toLocaleString()} {currency}
            </span>
          </div>
        </div>

      </div>

      {/* 3. INTERACTIVE PREVIEW TABS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('executive')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'executive'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-executive"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'አጠቃላይ ማጠቃለያ' : 'Executive Overview'}</span>
            </button>

            <button
              onClick={() => setActiveTab('daily_comparison')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'daily_comparison'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-daily-comp"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የዕለት ንጽጽር ሠንጠረዥ' : 'Daily Comparison Table'}</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-charts"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ቻርቶች እና ትንተናዎች' : 'Charts & Visual Trends'}</span>
            </button>

            <button
              onClick={() => setActiveTab('cash_audit')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'cash_audit'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-cash-audit"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የጥሬ ገንዘብ ኦዲት' : 'Cash & Audit Reconciliation'}</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-ledger"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የግብይት ዝርዝር መዝገብ' : 'Itemized Ledger'}</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            {startDate} ~ {endDate}
          </span>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'executive' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Sales & Payment Channels vs Expenses Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sales Channels Breakdown */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    {isAmharic ? 'የሽያጭ ክፍያ መንገዶች (Sales Channels)' : 'Sales & Payment Channels'}
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {metrics.totalRevenue.toLocaleString()} {currency}
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Physical Cash (ጥሬ ገንዘብ)', val: metrics.cashSales, color: 'bg-emerald-500' },
                    { label: 'CBE Bank / Mobile Banking (ንግድ ባንክ)', val: metrics.cbeSales, color: 'bg-purple-600' },
                    { label: 'Telebirr Wallet (ቴሌብር)', val: metrics.telebirrSales, color: 'bg-blue-500' },
                    { label: 'E-Birr / Coopay (ኢ-ብር)', val: metrics.ebirrSales, color: 'bg-amber-500' },
                    { label: 'Sinqee / Other Bank (ሲንቄ)', val: metrics.sinqeeSales + metrics.otherBankSales, color: 'bg-indigo-500' },
                    { label: 'Credit Sales (ብድር / Receivables)', val: metrics.creditSales, color: 'bg-rose-500' }
                  ].map((ch, idx) => {
                    const pct = metrics.totalRevenue > 0 ? (ch.val / metrics.totalRevenue) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-300">{ch.label}</span>
                          <span className="font-mono text-slate-800 dark:text-slate-100 font-bold">
                            {ch.val.toLocaleString()} {currency} <span className="text-[10px] text-slate-400 font-normal">({pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${ch.color}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operating Expenses Categories */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                    {isAmharic ? 'የወጪ ዘርፎች (Expense Categories)' : 'Operating Expenses Breakdown'}
                  </h4>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {metrics.totalExpensesAmt.toLocaleString()} {currency}
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(metrics.expenseByCategory).length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-6 text-center">No operating expenses recorded in this period.</p>
                  ) : (
                    Object.entries(metrics.expenseByCategory).map(([cat, val], idx) => {
                      const numVal = Number(val) || 0;
                      const pct = metrics.totalExpensesAmt > 0 ? (numVal / metrics.totalExpensesAmt) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-600 dark:text-slate-300">{cat}</span>
                            <span className="font-mono text-slate-800 dark:text-slate-100 font-bold">
                              {numVal.toLocaleString()} {currency} <span className="text-[10px] text-slate-400 font-normal">({pct.toFixed(1)}%)</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Financial Health Summary Matrix */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {isAmharic ? 'የፋይናንስ እና የሀብት ማጠቃለያ (Working Capital & Asset Valuation)' : 'Financial Health & Working Capital Position'}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Accounts Receivable (A/R)</span>
                  <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                    {metrics.totalOutstandingReceivables.toLocaleString()} {currency}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Owed by customers</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Accounts Payable (A/P)</span>
                  <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
                    {metrics.totalOutstandingPayables.toLocaleString()} {currency}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Owed to suppliers</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Stock Value (Cost Basis)</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {metrics.totalInventoryValuation.toLocaleString()} {currency}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{products.length} catalog items</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Retail Potential Value</span>
                  <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {metrics.totalInventoryRetail.toLocaleString()} {currency}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Est. sales yield</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DAILY COMPARISON TABLE */}
        {activeTab === 'daily_comparison' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAmharic ? 'የቀን በዕለት ንጽጽር ዝርዝር' : 'Day-by-Day Financial Comparison Breakdown'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Compare Gross Sales, Expenses, and Net Profits for each calendar day in the selected range.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {dailyComparisonData.length} Days Compiled
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3">Day / Date</th>
                    <th className="px-4 py-3 text-right">Gross Sales ({currency})</th>
                    <th className="px-4 py-3 text-right">COGS Cost ({currency})</th>
                    <th className="px-4 py-3 text-right">Expenses ({currency})</th>
                    <th className="px-4 py-3 text-right">Gross Profit</th>
                    <th className="px-4 py-3 text-right">Net Profit</th>
                    <th className="px-4 py-3 text-right">Net Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {dailyComparisonData.map((row, idx) => {
                    const margin = row.sales > 0 ? (row.netProfit / row.sales) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-medium">
                          <span className="font-mono">{row.date}</span> <span className="text-[10px] text-slate-400 ml-1">({row.day})</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                          {row.sales.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                          {row.cogs.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-rose-600 dark:text-rose-400">
                          {row.expenses.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {row.grossProfit.toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${row.netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                          {row.netProfit.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-400 text-[11px]">
                          {margin.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/70 dark:bg-slate-950/80 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <td className="px-4 py-3 uppercase">Total / Summary</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">{metrics.totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">{metrics.totalCOGS.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-rose-600">{metrics.totalExpensesAmt.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">{metrics.grossProfit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-indigo-600">{metrics.netProfit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">{metrics.netMargin.toFixed(1)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CHARTS & VISUAL TRENDS */}
        {activeTab === 'charts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Sales vs Expenses vs Net Profit Daily Trend Chart */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 bg-slate-50/40 dark:bg-slate-950/40 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span>{isAmharic ? 'የሽያጭ፣ የወጪ እና የተጣራ ትርፍ ሂደት' : 'Daily Sales, Expenses, & Profit Trajectory'}</span>
                <span className="text-[10px] text-slate-400 font-normal">Recharts Live Visualizer</span>
              </h4>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(5)} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', color: '#FFF' }}
                      formatter={(value: any) => [`${Number(value).toLocaleString()} ${currency}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                    <Area type="monotone" dataKey="netProfit" name="Net Profit" stroke="#6366F1" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grid of Two Visual Charts: Payment Channels & Top Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Payment Channel Share Donut Chart */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 bg-slate-50/40 dark:bg-slate-950/40 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAmharic ? 'የክፍያ መንገዶች ስርጭት (Payment Distribution)' : 'Payment Channel Revenue Distribution'}
                </h4>
                <div className="h-56 w-full flex items-center justify-center">
                  {paymentChannelData.length === 0 ? (
                    <p className="text-xs text-slate-400">No revenue data available for pie rendering.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentChannelData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {paymentChannelData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', color: '#FFF' }}
                          formatter={(value: any) => [`${Number(value).toLocaleString()} ${currency}`, '']}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Top Selling Products Bar Chart */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 bg-slate-50/40 dark:bg-slate-950/40 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAmharic ? 'ተወዳጅ እና ከፍተኛ ሽያጭ ያስመዘገቡ ዕቃዎች' : 'Top-Selling Products by Revenue'}
                </h4>
                <div className="h-56 w-full">
                  {topProducts.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No sales item records found in period.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <XAxis type="number" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} stroke="#94A3B8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', color: '#FFF' }}
                          formatter={(value: any) => [`${Number(value).toLocaleString()} ${currency}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#10B981" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: CASH & AUDIT RECONCILIATION */}
        {activeTab === 'cash_audit' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAmharic ? 'የጥሬ ገንዘብ ፍሰት እና የሳጥን ሒሳብ ማስታረቂያ (Cash Reconciliation)' : 'Cash on Hand & Drawer Cash Reconciliation'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Detailed reconciliation of physical cash received, cash expenses, debt settlements, and closing balance.
                </p>
              </div>
            </div>

            {/* Reconciliation Steps Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Cash Inflows Box */}
              <div className="border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2.5">
                <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Cash Inflows (ገቢ ጥሬ ገንዘብ)</span>
                  <span className="font-mono">+{metrics.totalCashReceived.toLocaleString()} {currency}</span>
                </h5>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/30">
                    <span>Cash Sales Revenue:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">+{metrics.cashSales.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/30">
                    <span>Customer Receivables Collected:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">+{metrics.periodReceivablesCollected.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400 text-[11px]">
                    <span>Other Inflows:</span>
                    <span className="font-mono">0 {currency}</span>
                  </div>
                </div>
              </div>

              {/* Cash Outflows Box */}
              <div className="border border-rose-100 dark:border-rose-900/40 rounded-xl p-4 bg-rose-50/30 dark:bg-rose-950/20 space-y-2.5">
                <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Cash Outflows (ወጪ ጥሬ ገንዘብ)</span>
                  <span className="font-mono">-{metrics.totalCashPaid.toLocaleString()} {currency}</span>
                </h5>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-rose-100 dark:border-rose-900/30">
                    <span>Cash Operating Expenses:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">-{metrics.cashExpenses.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-rose-100 dark:border-rose-900/30">
                    <span>Supplier Payables Settled:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">-{metrics.periodPayablesPaid.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400 text-[11px]">
                    <span>Other Payments:</span>
                    <span className="font-mono">0 {currency}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Reconciliation Equation Table */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Accounting Flow Step</th>
                    <th className="px-4 py-2.5">Equation / Component</th>
                    <th className="px-4 py-2.5 text-right">Amount ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="px-4 py-2.5 font-bold">1. Opening Cash Balance</td>
                    <td className="px-4 py-2.5 text-slate-400 text-[11px]">Physical cash on hand at start of period</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold">{metrics.openingCashBalance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-emerald-600 font-semibold">(+) Total Cash Received</td>
                    <td className="px-4 py-2.5 text-slate-400 text-[11px]">Sales cash + debt collections</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">+{metrics.totalCashReceived.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-rose-600 font-semibold">(-) Total Cash Paid Out</td>
                    <td className="px-4 py-2.5 text-slate-400 text-[11px]">Cash expenses + supplier debt payments</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-rose-600">-{metrics.totalCashPaid.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50/60 dark:bg-slate-950/60 font-bold">
                    <td className="px-4 py-3 text-slate-900 dark:text-white uppercase font-bold">(=) CLOSING CASH BALANCE</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">Estimated physical drawer count at end of period</td>
                    <td className="px-4 py-3 text-right font-mono text-base font-bold text-amber-600 dark:text-amber-400">
                      {metrics.closingCashBalance.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Audit Verification Sign-off Box */}
            <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {isAmharic ? 'የማረጋገጫ እና የኦዲት ፊርማ' : 'End-of-Day Audit Verification Ready'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The generated Unified PDF includes official sign-off lines for Cashier and Store Manager endorsement.
                </p>
              </div>
              <button
                onClick={handleExportUnifiedPDF}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition cursor-pointer text-xs shrink-0"
              >
                {isAmharic ? 'ኦዲት የተደረገውን PDF አውርድ' : 'Download Verified PDF'}
              </button>
            </div>

          </div>
        )}

        {/* TAB 5: ITEMIZED LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAmharic ? 'የተመዘገቡ ግብይቶች ዝርዝር (Sales & Expenses)' : 'Itemized Transaction Ledger'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Showing {periodSales.length} sales orders and {periodExpenses.length} expense records.
                </p>
              </div>
              <input
                type="text"
                placeholder={isAmharic ? 'በደንበኛ፣ በክፍያ መንገድ ወይም በዕቃ ስም ፈልግ...' : 'Search by customer, payment, item...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] font-bold sticky top-0 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Ref ID</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Party / Customer</th>
                    <th className="px-4 py-2.5">Channel</th>
                    <th className="px-4 py-2.5">Description / Items</th>
                    <th className="px-4 py-2.5 text-right">Amount ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {/* Sales Entries */}
                  {periodSales
                    .filter(s => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return (
                        s.customerName?.toLowerCase().includes(q) ||
                        s.paymentMethod?.toLowerCase().includes(q) ||
                        s.items?.some(i => i.productNameEn?.toLowerCase().includes(q) || i.productNameAm?.toLowerCase().includes(q))
                      );
                    })
                    .map((s, idx) => (
                      <tr key={`sale-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                            SALE
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {s.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">
                          {s.date.slice(0, 10)}
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {s.customerName || 'Walk-in'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {s.paymentMethod || 'Cash'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">
                          {s.items.map(i => `${i.productNameEn || i.productNameAm} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{s.grossSale.toLocaleString()}
                        </td>
                      </tr>
                    ))}

                  {/* Expense Entries */}
                  {periodExpenses
                    .filter(e => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return (
                        e.name?.toLowerCase().includes(q) ||
                        e.category?.toLowerCase().includes(q) ||
                        e.paymentMethod?.toLowerCase().includes(q)
                      );
                    })
                    .map((e, idx) => (
                      <tr key={`exp-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                            EXPENSE
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-800 dark:text-slate-200">
                          {e.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">
                          {e.date.slice(0, 10)}
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {e.name}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {e.paymentMethod || 'Cash'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">
                          {e.category} {e.description ? `• ${e.description}` : ''}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          -{e.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}

                  {periodSales.length === 0 && periodExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No transaction records found for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
