import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Briefcase, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  FileSpreadsheet,
  Download,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import jsPDF from 'jspdf';
import { Product, Sale, Expense, Receivable, Payable, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../sampleData';
import { BANK_LOGOS } from '../bankLogos';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  receivables: Receivable[];
  payables: Payable[];
  bankBalance: number;
  cashOnHand: number;
  settings: BusinessSettings;
  setCurrentTab: (tab: any) => void;
  onQuickAction: (action: string) => void;
  setSettings?: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function Dashboard({
  products,
  sales,
  expenses,
  receivables,
  payables,
  bankBalance,
  cashOnHand,
  settings,
  setCurrentTab,
  onQuickAction,
  setSettings,
}: DashboardProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';

  // Calculate individual account balances dynamically
  const preferCBE = settings.preferCBE !== false;
  const preferTelebirr = settings.preferTelebirr !== false;
  const preferEBirr = settings.preferEBirr !== false;
  const preferSinqee = settings.preferSinqee !== false;
  const preferOther = settings.preferOther === true;

  const startingCBE = settings.startingCBE ?? 0;
  const startingTelebirr = settings.startingTelebirr ?? 0;
  const startingEBirr = settings.startingEBirr ?? 0;
  const startingSinqee = settings.startingSinqee ?? 0;
  const startingOther = settings.startingOther ?? 0;
  const startingCash = settings.startingCash ?? 0;

  // Aggregate transaction additions and subtractions per account
  let cbeSales = 0, cbeExp = 0;
  let telebirrSales = 0, telebirrExp = 0;
  let ebirrSales = 0, ebirrExp = 0;
  let sinqeeSales = 0, sinqeeExp = 0;
  let otherSales = 0, otherExp = 0;
  let cashSales = 0, cashExp = 0;

  sales.forEach(s => {
    const pm = s.paymentMethod?.toLowerCase() || '';
    if (pm.includes('cbe') || pm.includes('commer')) {
      cbeSales += s.grossSale;
    } else if (pm.includes('tele') || pm.includes('tell')) {
      telebirrSales += s.grossSale;
    } else if (pm.includes('ebirr') || pm.includes('e-birr')) {
      ebirrSales += s.grossSale;
    } else if (pm.includes('sinqa') || pm.includes('sinqee') || pm.includes('sinqe')) {
      sinqeeSales += s.grossSale;
    } else if (pm.includes('cash') || pm === '') {
      cashSales += s.grossSale;
    } else {
      otherSales += s.grossSale;
    }
  });

  expenses.forEach(e => {
    const pm = e.paymentMethod?.toLowerCase() || '';
    if (pm.includes('cbe') || pm.includes('commer')) {
      cbeExp += e.amount;
    } else if (pm.includes('tele') || pm.includes('tell')) {
      telebirrExp += e.amount;
    } else if (pm.includes('ebirr') || pm.includes('e-birr')) {
      ebirrExp += e.amount;
    } else if (pm.includes('sinqa') || pm.includes('sinqee') || pm.includes('sinqe')) {
      sinqeeExp += e.amount;
    } else if (pm.includes('cash') || pm === '') {
      cashExp += e.amount;
    } else {
      otherExp += e.amount;
    }
  });

  const cbeCurrent = startingCBE + cbeSales - cbeExp;
  const telebirrCurrent = startingTelebirr + telebirrSales - telebirrExp;
  const ebirrCurrent = startingEBirr + ebirrSales - ebirrExp;
  const sinqeeCurrent = startingSinqee + sinqeeSales - sinqeeExp;
  const otherCurrent = startingOther + otherSales - otherExp;
  const cashCurrent = startingCash + cashSales - cashExp;

  const handleRemoveAccount = (key: 'preferCBE' | 'preferTelebirr' | 'preferEBirr' | 'preferSinqee' | 'preferOther') => {
    if (!setSettings) return;
    const updatedSettings = {
      ...settings,
      [key]: false
    };
    const storageKey = settings.userId 
      ? `habesha_tracker_preferred_accounts_${settings.userId}` 
      : 'habesha_tracker_preferred_accounts_default';
    try {
      const currentLocalRaw = localStorage.getItem(storageKey);
      let localObj = {};
      if (currentLocalRaw) {
        localObj = JSON.parse(currentLocalRaw);
      }
      localStorage.setItem(storageKey, JSON.stringify({
        ...localObj,
        [key]: false
      }));
    } catch (e) {
      console.error('Failed to update local storage preferred accounts', e);
    }
    setSettings(updatedSettings);
  };

  // 1. Calculations
  const stockValuation = products.reduce((acc, curr) => acc + (curr.purchasePrice * curr.currentStock), 0);
  
  const totalReceivables = receivables
    .filter(r => r.status !== 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPayables = payables
    .filter(p => p.status !== 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Filter today's sales and expenses
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySalesList = sales.filter(s => {
    const saleDateStr = new Date(s.date).toISOString().split('T')[0];
    return saleDateStr === todayStr;
  });

  const todaySalesTotal = todaySalesList.reduce((acc, curr) => acc + curr.grossSale, 0);
  const todayProfitTotal = todaySalesList.reduce((acc, curr) => acc + curr.profit, 0);

  const todayExpensesTotal = expenses
    .filter(e => e.date === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayNetProfit = todayProfitTotal - todayExpensesTotal;

  // 2. Real-time Stock Alerts
  const outOfStockItems = products.filter(p => p.currentStock === 0);
  const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock);

  // 3. Weekly Sales Performance Calculations (Bar Chart Data)
  const daysOfWeek = [
    { en: 'Sunday', am: 'እሁድ', sales: 0 },
    { en: 'Monday', am: 'ሰኞ', sales: 0 },
    { en: 'Tuesday', am: 'ማክሰኞ', sales: 0 },
    { en: 'Wednesday', am: 'ረቡዕ', sales: 0 },
    { en: 'Thursday', am: 'ሐሙስ', sales: 0 },
    { en: 'Friday', am: 'አርብ', sales: 0 },
    { en: 'Saturday', am: 'ቅዳሜ', sales: 0 },
  ];

  // Map actual sales to days of the week (last 7 days)
  sales.forEach(sale => {
    const dayIndex = new Date(sale.date).getDay();
    daysOfWeek[dayIndex].sales += sale.grossSale;
  });

  const barChartData = daysOfWeek.map(d => ({
    name: isAmharic ? d.am : d.en,
    sales: d.sales, // Reflect precise actual sales
  }));

  // 4. Revenue Distribution (Pie Chart Data)
  const categorySalesMap: { [key: string]: number } = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod ? prod.category : 'General Grains';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.sellingPrice * item.quantity);
    });
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  const pieChartData = Object.keys(categorySalesMap).map((cat, index) => ({
    name: cat,
    value: categorySalesMap[cat],
  }));

  // 5. Payment Distribution Calculations
  let cashTotal = 0;
  let bankTotal = 0;
  sales.forEach(s => {
    if (s.paymentMethod === 'Cash') {
      cashTotal += s.grossSale;
    } else {
      bankTotal += s.grossSale;
    }
  });

  const paymentTotal = cashTotal + bankTotal;
  const cashPercent = paymentTotal > 0 ? Math.round((cashTotal / paymentTotal) * 100) : 0;
  const bankPercent = paymentTotal > 0 ? Math.round((bankTotal / paymentTotal) * 100) : 0;

  const paymentPieData = paymentTotal > 0 ? [
    { name: isAmharic ? 'ጥሬ ገንዘብ (Cash)' : 'Cash', value: cashTotal, color: '#f59e0b' },
    { name: isAmharic ? 'በባንክ/ዲጂታል (Bank/Digital)' : 'Bank & Digital', value: bankTotal, color: '#10b981' },
  ] : [];

  // 6. Generate Weekly Sales Report PDF
  const downloadWeeklyReportPdf = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(16, 185, 129); // Emerald Theme
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(settings.businessName || 'Habesha Tracker ERP', 15, 25);
    doc.setFontSize(10);
    doc.text('WEEKLY BUSINESS PERFORMANCE REPORT', 15, 33);
    
    // Metadata
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 130, 50);
    doc.text(`Address: ${settings.address || 'Addis Ababa, Ethiopia'}`, 130, 55);
    doc.text(`Currency: ${settings.currency || 'ETB'}`, 130, 60);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 65, 195, 65);

    // Executive Summary
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text('1. Executive Financial Summary', 15, 75);
    
    doc.setFontSize(11);
    doc.text(`- Bank Balance: ${bankBalance.toLocaleString()} ${settings.currency}`, 20, 85);
    doc.text(`- Cash Balance: ${cashOnHand.toLocaleString()} ${settings.currency}`, 20, 92);
    doc.text(`- Total Inventory Valuation: ${stockValuation.toLocaleString()} ${settings.currency}`, 20, 99);
    doc.text(`- Outstanding Receivables: ${totalReceivables.toLocaleString()} ${settings.currency}`, 20, 106);
    doc.text(`- Outstanding Payables: ${totalPayables.toLocaleString()} ${settings.currency}`, 20, 113);

    // Weekly Chart Data Grid
    doc.setFontSize(14);
    doc.text('2. Daily Sales Performance (This Week)', 15, 130);
    
    // Grid Header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 137, 180, 8, 'F');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text('Day of Week', 20, 142);
    doc.text('Total Sales Amount', 120, 142);

    let currentY = 150;
    daysOfWeek.forEach(d => {
      doc.text(d.en, 20, currentY);
      doc.text(`${(d.sales || 0).toLocaleString()} ${settings.currency}`, 120, currentY);
      doc.line(15, currentY + 3, 195, currentY + 3);
      currentY += 10;
    });

    // Sign off
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.text('Authorized by Habesha Tracker ERP Cloud System.', 15, 270);

    doc.save('weekly-sales-report.pdf');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">

      {/* Financial Status Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Bank Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.totalBank}</p>
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans">
              {bankBalance.toLocaleString()} <span className="text-xs text-slate-400 dark:text-slate-500">{settings.currency}</span>
            </h3>
            <p className="text-emerald-500 dark:text-emerald-400 text-xs mt-2 flex items-center font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              CBE / Awash / Telebirr
            </p>
          </div>
        </div>

        {/* Cash Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.cashOnHand}</p>
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans">
              {cashOnHand.toLocaleString()} <span className="text-xs text-slate-400 dark:text-slate-500">{settings.currency}</span>
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
              Updated just now
            </p>
          </div>
        </div>

        {/* Receivables (Collect) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.receivables}</p>
            <div className="w-9 h-9 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-orange-600 dark:text-orange-500 font-sans">
              {totalReceivables.toLocaleString()} <span className="text-xs text-slate-400 dark:text-slate-500">{settings.currency}</span>
            </h3>
            <p className="text-red-500 text-xs mt-2 font-bold">
              Outstanding customer credits
            </p>
          </div>
        </div>

        {/* Today's Net Profit Card (Stunning Indigo Accent) */}
        <div className="bg-indigo-600 dark:bg-indigo-700 p-5 rounded-2xl shadow-lg border border-indigo-700 transition hover:shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">{t.todayProfit}</p>
            <div className="w-9 h-9 bg-indigo-500/20 text-white rounded-xl flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-sans">
              {todayNetProfit.toLocaleString()} <span className="text-xs text-indigo-200">{settings.currency}</span>
            </h3>
            <p className="text-indigo-200 text-xs mt-2 italic">
              Sales: {todaySalesTotal.toLocaleString()} {settings.currency}
            </p>
          </div>
        </div>

        {/* Stock Valuation Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.stockValuation}</p>
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans">
              {stockValuation.toLocaleString()} <span className="text-xs text-slate-400 dark:text-slate-500">{settings.currency}</span>
            </h3>
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
              {products.length} registered products
            </p>
          </div>
        </div>

        {/* Payables (Owe) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.payables}</p>
            <div className="w-9 h-9 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 font-sans">
              {totalPayables.toLocaleString()} <span className="text-xs text-slate-400 dark:text-slate-500">{settings.currency}</span>
            </h3>
            <p className="text-purple-600 dark:text-purple-400 text-xs mt-2 font-medium">
              Outstanding supplier debt
            </p>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t.todaySales}</p>
            <div className="w-9 h-9 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans">
              {todaySalesTotal.toLocaleString()} <span className="text-xs text-slate-400 dark:text-slate-500">{settings.currency}</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
              {todaySalesList.length} transactions processed
            </p>
          </div>
        </div>

        {/* Quick Date Display */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden flex flex-col justify-center">
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">
              {isAmharic ? 'የዛሬ ቀን' : 'Today\'s Date'}
            </p>
            <span className="text-base font-bold text-slate-100 leading-snug block">
              {new Date().toLocaleDateString(settings.language === 'en' ? 'en-US' : 'am-ET', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

      </div>

      {/* Preferred Ethiopian Accounts & Mobile Wallets Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {isAmharic ? 'የክፍያ አካውንቶች እና ሞባይል ዋሌቶች' : 'Ethiopian Banking & Wallet Summary'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isAmharic 
                ? 'የተመረጡ ባንኮች እና ዲጂታል ክፍያዎችን የቀጥታ መነሻ ቀሪ እና የአሁኑ የሂሳብ መጠን ማጠቃለያ።' 
                : 'Real-time ledger overview for your active Ethiopian financial channels.'}
            </p>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold">
            Live Ledger
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {preferCBE && (
            <div className="relative group bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 p-3.5 rounded-xl text-center">
              <button 
                onClick={() => handleRemoveAccount('preferCBE')}
                className="absolute top-1.5 right-1.5 p-1 rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title={isAmharic ? 'አካውንቱን አጥፋ' : 'Remove account'}
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex justify-center mb-1.5">
                <img 
                  src={BANK_LOGOS.CBE} 
                  alt="CBE" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate">CBE (ንግድ ባንክ)</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                {cbeCurrent.toLocaleString()} ETB
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Start: {startingCBE.toLocaleString()}
              </span>
            </div>
          )}

          {preferTelebirr && (
            <div className="relative group bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 p-3.5 rounded-xl text-center">
              <button 
                onClick={() => handleRemoveAccount('preferTelebirr')}
                className="absolute top-1.5 right-1.5 p-1 rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title={isAmharic ? 'አካውንቱን አጥፋ' : 'Remove account'}
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex justify-center mb-1.5">
                <img 
                  src={BANK_LOGOS.Telebirr} 
                  alt="Telebirr" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate">Telebirr (ቴሌብር)</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                {telebirrCurrent.toLocaleString()} ETB
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Start: {startingTelebirr.toLocaleString()}
              </span>
            </div>
          )}

          {preferSinqee && (
            <div className="relative group bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 p-3.5 rounded-xl text-center">
              <button 
                onClick={() => handleRemoveAccount('preferSinqee')}
                className="absolute top-1.5 right-1.5 p-1 rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title={isAmharic ? 'አካውንቱን አጥፋ' : 'Remove account'}
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex justify-center mb-1.5">
                <img 
                  src={BANK_LOGOS.Sinqee} 
                  alt="Sinqee" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate">Sinqee (ሲንቄ)</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                {sinqeeCurrent.toLocaleString()} ETB
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Start: {startingSinqee.toLocaleString()}
              </span>
            </div>
          )}

          {/* Cash is always shown */}
          <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 p-3.5 rounded-xl text-center">
            <span className="text-lg block mb-1">💵</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate">{isAmharic ? 'ጥሬ ገንዘብ' : 'Cash on Hand'}</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
              {cashCurrent.toLocaleString()} ETB
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Start: {startingCash.toLocaleString()}
            </span>
          </div>

          {preferOther && (
            <div className="relative group bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 p-3.5 rounded-xl text-center">
              <button 
                onClick={() => handleRemoveAccount('preferOther')}
                className="absolute top-1.5 right-1.5 p-1 rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title={isAmharic ? 'አካውንቱን አጥፋ' : 'Remove account'}
              >
                <X className="w-3 h-3" />
              </button>
              <span className="text-lg block mb-1">💸</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate">{isAmharic ? 'ሌላ' : 'Other Bank/Wallet'}</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                {otherCurrent.toLocaleString()} ETB
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Start: {startingOther.toLocaleString()}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Quick Actions Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-4 border-l-3 border-emerald-500 pl-3">
          {t.quickActions}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <button
            onClick={() => onQuickAction('recordSale')}
            className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 rounded-xl text-emerald-700 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/50 transition duration-150 group"
            id="btn-qa-record-sale"
          >
            <ArrowUpRight className="w-5 h-5 mb-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            <span className="text-xs font-semibold text-center leading-tight">{t.recordSale}</span>
          </button>

          <button
            onClick={() => onQuickAction('restock')}
            className="flex flex-col items-center justify-center p-4 bg-sky-50 hover:bg-sky-100/80 dark:bg-sky-950/30 dark:hover:bg-sky-950/60 rounded-xl text-sky-700 dark:text-sky-300 border border-sky-200/40 dark:border-sky-800/50 transition duration-150 group"
            id="btn-qa-restock"
          >
            <Package className="w-5 h-5 mb-2 group-hover:scale-105 transition" />
            <span className="text-xs font-semibold text-center leading-tight">{t.restockInv}</span>
          </button>

          <button
            onClick={() => onQuickAction('recordExpense')}
            className="flex flex-col items-center justify-center p-4 bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 rounded-xl text-rose-700 dark:text-rose-300 border border-rose-200/40 dark:border-rose-800/50 transition duration-150 group"
            id="btn-qa-record-expense"
          >
            <ArrowDownRight className="w-5 h-5 mb-2 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition" />
            <span className="text-xs font-semibold text-center leading-tight">{t.recordExpense}</span>
          </button>

          <button
            onClick={() => onQuickAction('deposit')}
            className="flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-950/60 rounded-xl text-amber-700 dark:text-amber-300 border border-amber-200/40 dark:border-amber-800/50 transition duration-150 group"
            id="btn-qa-deposit"
          >
            <DollarSign className="w-5 h-5 mb-2 group-hover:translate-y-[-2px] transition" />
            <span className="text-xs font-semibold text-center leading-tight">{t.depositBank}</span>
          </button>

          <button
            onClick={() => onQuickAction('withdraw')}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100/80 dark:bg-purple-950/30 dark:hover:bg-purple-950/60 rounded-xl text-purple-700 dark:text-purple-300 border border-purple-200/40 dark:border-purple-800/50 transition duration-150 group"
            id="btn-qa-withdraw"
          >
            <DollarSign className="w-5 h-5 mb-2 group-hover:translate-y-[2px] transition" />
            <span className="text-xs font-semibold text-center leading-tight">{t.withdrawBank}</span>
          </button>

          <button
            onClick={() => onQuickAction('addProduct')}
            className="flex flex-col items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 rounded-xl text-indigo-700 dark:text-indigo-300 border border-indigo-200/40 dark:border-indigo-800/50 transition duration-150 group"
            id="btn-qa-add-product"
          >
            <PlusIcon className="w-5 h-5 mb-2 group-hover:rotate-95 transition" />
            <span className="text-xs font-semibold text-center leading-tight">{t.addProduct}</span>
          </button>

        </div>
      </div>

      {/* Analytics & Distribution Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider border-l-3 border-emerald-500 pl-3">
              {t.weeklyPerformance}
            </h3>
            <button
              onClick={downloadWeeklyReportPdf}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition"
              id="btn-weekly-pdf"
            >
              <Download className="w-3.5 h-3.5" />
              PDF Report
            </button>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif'
                  }} 
                />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Distribution Category Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col h-[380px]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-4 border-l-3 border-emerald-500 pl-3">
            {t.revenueDist}
          </h3>
          <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center">
            {pieChartData.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-500 py-12">
                <p className="text-xs font-semibold leading-relaxed">
                  {isAmharic ? 'እስካሁን የተመዘገበ የገቢ ማከፋፈል መረጃ የለም።' : 'No revenue distribution data available yet.'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAmharic ? 'የገቢ ማከፋፈልን ለማየት መጀመሪያ ሽያጭ ይመዝግቡ።' : 'Log a sales transaction to visualize product category performance.'}
                </p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                        border: 'none', 
                        borderRadius: '8px', 
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Embedded custom color legends to be visually crisp */}
                <div className="absolute bottom-0 inset-x-0 max-h-24 overflow-y-auto grid grid-cols-2 gap-1.5 text-[10px] font-sans">
                  {pieChartData.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-500 dark:text-slate-400 truncate">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-4 border-l-3 border-emerald-500 pl-3">
            {t.paymentDist}
          </h3>
          <div className="flex-1 flex flex-col justify-center items-center">
            {paymentPieData.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-500 py-12">
                <p className="text-xs font-semibold leading-relaxed">
                  {isAmharic ? 'የመክፈያ ዘዴ ማከፋፈል አልተገኘም።' : 'No payment channel data yet.'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAmharic ? 'የሽያጭ መክፈያ ዘዴዎችን እዚህ ለመተንተን ሽያጭ ይመዝግቡ።' : 'Record cash or digital bank transactions to analyze ratios.'}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full max-w-[200px] h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                      >
                        {paymentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Structured details & percentages */}
                <div className="w-full mt-4 space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-slate-600 dark:text-slate-400">{isAmharic ? 'ጥሬ ገንዘብ' : 'Cash Collected'}</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                      {cashTotal.toLocaleString()} {t.currencySymbol} ({cashPercent}%)
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-600 dark:text-slate-400">{isAmharic ? 'በባንክ / ዲጂታል' : 'Bank & Digital'}</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                      {bankTotal.toLocaleString()} {t.currencySymbol} ({bankPercent}%)
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Real-time Stock Alerts Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider border-l-3 border-rose-500 pl-3">
              {t.stockAlerts}
            </h3>
          </div>

          <div className="flex-1 space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {outOfStockItems.length === 0 && lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
                <AlertCircle className="w-10 h-10 text-emerald-500/60 mb-2" />
                <p className="text-xs font-semibold">{t.noAlerts}</p>
              </div>
            ) : (
              <>
                {/* Out Of Stock Alerts */}
                {outOfStockItems.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 rounded-xl animate-shake">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          ⚠️ {isAmharic ? p.nameAm : p.nameEn} - <span className="text-rose-600 uppercase font-mono text-[10px]">{t.outOfStock}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          SKU: {p.sku} | Supplier: {p.supplier || t.notAvailable}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onQuickAction('restockItem-' + p.id)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition"
                      id={`btn-restock-out-${p.id}`}
                    >
                      Restock
                    </button>
                  </div>
                ))}

                {/* Low Stock Alerts */}
                {lowStockItems.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          ⚠️ {isAmharic ? p.nameAm : p.nameEn} only has <span className="text-amber-600 font-mono font-bold">{p.currentStock} {p.unit}s</span> left.
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Minimum level: {p.minStock} {p.unit}s | SKU: {p.sku}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onQuickAction('restockItem-' + p.id)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition"
                      id={`btn-restock-low-${p.id}`}
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// Simple internal icon replacement component to bypass unnecessary package imports
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
