import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Download, 
  Send, 
  QrCode, 
  MessageSquare, 
  ExternalLink,
  Table,
  Sparkles,
  Smartphone,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product, Sale, Expense, Receivable, Payable, BusinessSettings } from '../types';

interface SpreadShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  receivables: Receivable[];
  payables: Payable[];
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
}

export default function SpreadShareModal({
  isOpen,
  onClose,
  products,
  sales,
  expenses,
  receivables,
  payables,
  settings,
  addToast,
}: SpreadShareModalProps) {
  const [activeTab, setActiveTab] = useState<'spread_app' | 'share_sheets' | 'text_summary'>('spread_app');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [selectedShareLanguage, setSelectedShareLanguage] = useState<'am' | 'en'>(settings.language === 'am' ? 'am' : 'en');

  if (!isOpen) return null;

  const isAmharic = settings.language === 'am';
  const appUrl = window.location.origin;

  // Pre-formatted messages for viral sharing
  const shareMessageAmharic = `👋 ሰላም! የንግድዎን ሽያጭ፣ ወጪ፣ ዱቤ እና የዕቃ ክምችት በስልክዎ ለመቆጣጠር ${settings.businessName || 'Habesha Tracker'} ይጠቀሙ። በቴሌብር፣ ንግድ ባንክ እና ጥሬ ገንዘብ የተደገፈ አስተማማኝ ሲስተም! 👇\n${appUrl}`;
  const shareMessageEnglish = `👋 Hello! Manage your daily sales, inventory, debts, and expenses with ${settings.businessName || 'Habesha Tracker'} — the complete Ethiopian SME business tracker. Try it here: 👇\n${appUrl}`;
  const currentShareMessage = selectedShareLanguage === 'am' ? shareMessageAmharic : shareMessageEnglish;

  // 1. Copy App Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    addToast(isAmharic ? 'የመተግበሪያው ሊንክ ተቀድቷል!' : 'App link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 2. Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: settings.businessName || 'Habesha Tracker',
          text: currentShareMessage,
          url: appUrl,
        });
        addToast(isAmharic ? 'በተሳካ ሁኔታ ተጋርቷል!' : 'Shared successfully!', 'success');
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  // 3. Social Channel Direct Share Links
  const shareViaTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(currentShareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareViaWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(currentShareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareViaSMS = () => {
    const url = `sms:?body=${encodeURIComponent(currentShareMessage)}`;
    window.location.href = url;
  };

  // 4. Financial Text Snapshot Generator (for Telegram/WhatsApp forward)
  const totalSales = sales.reduce((acc, curr) => acc + curr.grossSale, 0);
  const totalCost = sales.reduce((acc, curr) => acc + curr.cost, 0);
  const totalProfit = totalSales - totalCost;
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netIncome = totalProfit - totalExpenses;
  const totalPendingReceivables = receivables.filter(r => r.status !== 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPendingPayables = payables.filter(p => p.status !== 'Paid').reduce((acc, curr) => acc + curr.amount, 0);

  const financialTextSummaryAm = `📊 *${settings.businessName || 'የንግድ'} - የፋይናንስ ማጠቃለያ ሪፖርት*
📅 ቀን: ${new Date().toLocaleDateString()}
💰 ጠቅላላ ሽያጭ: ${totalSales.toLocaleString()} ETB
📈 ጠቅላላ ትርፍ: ${totalProfit.toLocaleString()} ETB
📉 አጠቃላይ ወጪ: ${totalExpenses.toLocaleString()} ETB
💵 የተጣራ ገቢ (Net Income): ${netIncome.toLocaleString()} ETB
----------------------------
👥 ያልተሰበሰበ ዱቤ (Receivables): ${totalPendingReceivables.toLocaleString()} ETB
🏢 ያልተከፈለ ዕዳ (Payables): ${totalPendingPayables.toLocaleString()} ETB
📦 የምርት ብዛት: ${products.length} ዓይነቶች
----------------------------
✨ የተዘጋጀው በ: Habesha Tracker ERP`;

  const financialTextSummaryEn = `📊 *${settings.businessName || 'Business'} - Financial Summary Report*
📅 Date: ${new Date().toLocaleDateString()}
💰 Gross Sales: ${totalSales.toLocaleString()} ETB
📈 Gross Profit: ${totalProfit.toLocaleString()} ETB
📉 Total Expenses: ${totalExpenses.toLocaleString()} ETB
💵 Net Income: ${netIncome.toLocaleString()} ETB
----------------------------
👥 Pending Receivables: ${totalPendingReceivables.toLocaleString()} ETB
🏢 Supplier Payables: ${totalPendingPayables.toLocaleString()} ETB
📦 Product Lines: ${products.length} items
----------------------------
✨ Generated via: Habesha Tracker ERP`;

  const currentFinancialSummary = selectedShareLanguage === 'am' ? financialTextSummaryAm : financialTextSummaryEn;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(currentFinancialSummary);
    setCopiedSummary(true);
    addToast(isAmharic ? 'ማጠቃለያው ተቀድቷል!' : 'Summary copied to clipboard!', 'success');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleShareSummaryTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(currentFinancialSummary)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareSummaryWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(currentFinancialSummary)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 5. Full Multi-Sheet Master Spreadsheet Export (.xlsx)
  const handleExportMasterSpreadsheet = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Sales
      const salesData = sales.map(s => ({
        'Date': new Date(s.date).toLocaleDateString(),
        'Customer': s.customerName || 'Walk-in',
        'Payment Method': s.paymentMethod,
        'Items': s.items.map(i => `${i.productNameEn} (x${i.quantity})`).join(', '),
        'Gross Total (ETB)': s.grossSale,
        'Cost (ETB)': s.cost,
        'Profit (ETB)': s.profit,
      }));
      const wsSales = XLSX.utils.json_to_sheet(salesData.length ? salesData : [{ 'Status': 'No sales recorded yet' }]);
      XLSX.utils.book_append_sheet(wb, wsSales, 'Sales (ሽያጭ)');

      // Sheet 2: Inventory
      const inventoryData = products.map(p => ({
        'SKU': p.sku,
        'Product Name': p.nameEn,
        'Amharic Name': p.nameAm,
        'Category': p.category,
        'Stock Quantity': p.currentStock,
        'Unit': p.unit,
        'Cost Price (ETB)': p.purchasePrice,
        'Selling Price (ETB)': p.sellingPrice,
        'Total Valuation (ETB)': p.purchasePrice * p.currentStock,
      }));
      const wsInventory = XLSX.utils.json_to_sheet(inventoryData.length ? inventoryData : [{ 'Status': 'No products added yet' }]);
      XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventory (ዕቃ)');

      // Sheet 3: Expenses
      const expensesData = expenses.map(e => ({
        'Date': e.date,
        'Expense Title': e.name,
        'Category': e.category,
        'Payment Method': e.paymentMethod,
        'Amount (ETB)': e.amount,
        'Description': e.description || '',
      }));
      const wsExpenses = XLSX.utils.json_to_sheet(expensesData.length ? expensesData : [{ 'Status': 'No expenses recorded yet' }]);
      XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses (ወጪ)');

      // Sheet 4: Debts & Credit
      const creditData = [
        ...receivables.map(r => ({
          'Type': 'Customer Credit (ዱቤ)',
          'Party Name': r.customer,
          'Phone': r.phone || '',
          'Amount (ETB)': r.amount,
          'Due Date': r.dueDate,
          'Status': r.status,
        })),
        ...payables.map(p => ({
          'Type': 'Supplier Payable (የአቅራቢ ዕዳ)',
          'Party Name': p.supplier,
          'Phone': '',
          'Amount (ETB)': p.amount,
          'Due Date': p.dueDate,
          'Status': p.status,
        }))
      ];
      const wsCredit = XLSX.utils.json_to_sheet(creditData.length ? creditData : [{ 'Status': 'No credit records' }]);
      XLSX.utils.book_append_sheet(wb, wsCredit, 'Credit & Debt (ዕዳና ዱቤ)');

      // Sheet 5: Financial Overview
      const summaryData = [
        { 'Metric': 'Business Name', 'Value': settings.businessName || 'Habesha SMB' },
        { 'Metric': 'Export Date', 'Value': new Date().toLocaleString() },
        { 'Metric': 'Total Gross Sales (ETB)', 'Value': totalSales },
        { 'Metric': 'Total Gross Profit (ETB)', 'Value': totalProfit },
        { 'Metric': 'Total Expenses (ETB)', 'Value': totalExpenses },
        { 'Metric': 'Net Income (ETB)', 'Value': netIncome },
        { 'Metric': 'Pending Receivables (ETB)', 'Value': totalPendingReceivables },
        { 'Metric': 'Pending Payables (ETB)', 'Value': totalPendingPayables },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary (ማጠቃለያ)');

      const filename = `${(settings.businessName || 'habesha').toLowerCase().replace(/\s+/g, '_')}_master_spreadsheet_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
      addToast(isAmharic ? 'ሙሉ የኤክሴል ሰንጠረዥ ተዘጋጅቶ ወርዷል!' : 'Master spreadsheet downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export spreadsheet.', 'warning');
    }
  };

  // 6. Copy Formatted TSV Table to Clipboard (For direct paste into Google Sheets/Excel)
  const handleCopyTsvToClipboard = () => {
    try {
      const headers = ['Date', 'Customer', 'Payment Method', 'Gross Sale (ETB)', 'Profit (ETB)'];
      const rows = sales.slice(0, 100).map(s => [
        new Date(s.date).toLocaleDateString(),
        s.customerName || 'Walk-in',
        s.paymentMethod,
        s.grossSale,
        s.profit
      ]);
      const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
      navigator.clipboard.writeText(tsvContent);
      setCopiedTable(true);
      addToast(isAmharic ? 'የሽያጭ ሰንጠረዥ ተቀድቷል! ኤክሴል ወይም ጎግል ሺት ላይ Paste ማድረግ ይችላሉ።' : 'Table data copied! You can now paste directly into Excel or Google Sheets.', 'success');
      setTimeout(() => setCopiedTable(false), 2500);
    } catch {
      addToast('Failed to copy table data.', 'warning');
    }
  };

  // QR Code generator URL using public SVG endpoint
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appUrl)}&margin=8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isAmharic ? 'አጋራ እና አስፋፋ (Spread & Share)' : 'Spread & Share Suite'}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
                  ERP Hub
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAmharic 
                  ? 'መተግበሪያውን እና የንግድ መረጃዎችን በቀላሉ ለደንበኞች፣ ለባልደረባዎች ወይም ለኦዲት ያጋሩ' 
                  : 'Share the application, generate spreadsheets, and send reports to partners'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            id="btn-close-spread-share"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('spread_app')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'spread_app'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="tab-spread-app"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isAmharic ? 'መተግበሪያውን አጋራ' : 'Spread the App'}</span>
          </button>
          <button
            onClick={() => setActiveTab('share_sheets')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'share_sheets'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="tab-share-sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isAmharic ? 'የኤክሴል ሰንጠረዥ አጋራ' : 'Spreadsheet Share'}</span>
          </button>
          <button
            onClick={() => setActiveTab('text_summary')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'text_summary'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="tab-text-summary"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isAmharic ? 'የፋይናንስ ማጠቃለያ' : 'Financial Snapshot'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: SPREAD THE APP */}
          {activeTab === 'spread_app' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Language Switch for Share Message */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {isAmharic ? 'የማጋሪያ መልእክት ቋንቋ:' : 'Message Language:'}
                </span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setSelectedShareLanguage('am')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      selectedShareLanguage === 'am'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    አማርኛ
                  </button>
                  <button
                    onClick={() => setSelectedShareLanguage('en')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      selectedShareLanguage === 'en'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Direct Social Channels */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={shareViaTelegram}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30 transition group shadow-xs"
                  id="btn-share-telegram"
                >
                  <Send className="w-6 h-6 mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-bold">Telegram</span>
                  <span className="text-[10px] opacity-75">{isAmharic ? 'በቴሌግራም' : 'Chat & Group'}</span>
                </button>

                <button
                  onClick={shareViaWhatsApp}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 transition group shadow-xs"
                  id="btn-share-whatsapp"
                >
                  <MessageSquare className="w-6 h-6 mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-bold">WhatsApp</span>
                  <span className="text-[10px] opacity-75">{isAmharic ? 'በዋትስአፕ' : 'Direct Message'}</span>
                </button>

                <button
                  onClick={shareViaSMS}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition group shadow-xs"
                  id="btn-share-sms"
                >
                  <Smartphone className="w-6 h-6 mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-bold">SMS</span>
                  <span className="text-[10px] opacity-75">{isAmharic ? 'በአጭር መልዕክት' : 'Text Message'}</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition group shadow-xs"
                  id="btn-share-native"
                >
                  <Share2 className="w-6 h-6 mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-bold">{isAmharic ? 'ሌሎች' : 'More'}</span>
                  <span className="text-[10px] opacity-75">{isAmharic ? 'ሁሉንም አማራጮች' : 'System Share'}</span>
                </button>
              </div>

              {/* Shareable Link Box & QR Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex flex-col items-center justify-center sm:border-r sm:border-slate-200 dark:sm:border-slate-700/60 pr-0 sm:pr-4">
                  <img
                    src={qrCodeUrl}
                    alt="App QR Code"
                    className="w-28 h-28 rounded-xl bg-white p-1.5 border border-slate-200 shadow-xs"
                  />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                    <QrCode className="w-3 h-3" />
                    {isAmharic ? 'ስካን ያድርጉ' : 'Scan to Open'}
                  </span>
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isAmharic ? 'የቀጥታ መተግበሪያ ሊንክ (Direct App Link)' : 'Direct Web Link'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={appUrl}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-hidden"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center gap-1.5 shrink-0"
                        id="btn-copy-app-link"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? (isAmharic ? 'ተቀድቷል' : 'Copied') : (isAmharic ? 'ቅዳ' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      {isAmharic 
                        ? 'መተግበሪያው በሞባይል ስልክ፣ ታብሌት እና ፒሲ ላይ ያለ ምንም ተጨማሪ መተግበሪያ ጭነት ወዲያውኑ ይከፈታል።'
                        : 'Instant browser access: works seamlessly on mobile browsers and desktop without installation.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPREADSHEET SHARE */}
          {activeTab === 'share_sheets' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    {isAmharic ? 'ሙሉ የቢዝነስ ማስተር ኤክሴል ፋይል (.xlsx)' : 'Full Multi-Tab Business Master Workbook'}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {isAmharic 
                      ? 'ሽያጭ፣ ዕቃ ካታሎግ፣ ወጪዎች፣ ዱቤ እና ዕዳ በአንድ ላይ የተደራጀ ሰንጠረዥ' 
                      : 'Includes 5 dedicated sheets: Sales, Inventory, Expenses, Credit/Debt, and Summary.'}
                  </p>
                </div>
                <button
                  onClick={handleExportMasterSpreadsheet}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 shrink-0"
                  id="btn-download-master-xlsx"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAmharic ? 'ኤክሴል አውርድ' : 'Download .xlsx'}</span>
                </button>
              </div>

              {/* Individual Spreadsheet Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-xs">
                    <Table className="w-4 h-4 text-emerald-500" />
                    <span>{isAmharic ? 'የሽያጭ ሰንጠረዥ ወደ ክሊፕቦርድ ቅዳ' : 'Copy Table to Google Sheets'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAmharic 
                      ? 'የቅርብ 100 ሽያጮችን በቀጥታ ኮፒ በማድረግ Google Sheets ወይም Excel ላይ መለጠፍ (Paste) ይችላሉ።' 
                      : 'Copy formatted TSV rows ready to paste directly into Google Sheets or Excel.'}
                  </p>
                  <button
                    onClick={handleCopyTsvToClipboard}
                    className="w-full py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                    id="btn-copy-tsv-table"
                  >
                    {copiedTable ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTable ? (isAmharic ? 'ተቀድቷል!' : 'Table Copied!') : (isAmharic ? 'ሰንጠረዡን ቅዳ (Copy Table)' : 'Copy Formatted Rows')}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-xs">
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                    <span>{isAmharic ? 'ለሂሳብ ባለሙያ ወይም ባልደረባ' : 'Send to Accountant / Partner'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAmharic 
                      ? 'የወሩን አጠቃላይ የፋይናንስ መግለጫ በዋትስአፕ ወይም ቴሌግራም ወዲያውኑ ይላኩ።' 
                      : 'Forward complete financial figures via messenger for auditing or bookkeeping.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShareSummaryTelegram}
                      className="flex-1 py-2 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </button>
                    <button
                      onClick={handleShareSummaryWhatsApp}
                      className="flex-1 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL SNAPSHOT TEXT */}
          {activeTab === 'text_summary' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isAmharic 
                    ? 'በቀጥታ ወደ ቴሌግራም፣ ዋትስአፕ ወይም ኤስኤምኤስ ለመላክ የተዘጋጀ ማጠቃለያ:' 
                    : 'Pre-formatted text snapshot ready to paste or send via messaging apps:'}
                </p>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setSelectedShareLanguage('am')}
                    className={`px-2 py-0.5 text-xs font-bold rounded-lg transition ${
                      selectedShareLanguage === 'am' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    አማርኛ
                  </button>
                  <button
                    onClick={() => setSelectedShareLanguage('en')}
                    className={`px-2 py-0.5 text-xs font-bold rounded-lg transition ${
                      selectedShareLanguage === 'en' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner max-h-60 overflow-y-auto">
                {currentFinancialSummary}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopySummary}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
                  id="btn-copy-financial-summary"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSummary ? (isAmharic ? 'ማጠቃለያው ተቀድቷል!' : 'Summary Copied!') : (isAmharic ? 'ማጠቃለያውን ቅዳ' : 'Copy Summary Text')}</span>
                </button>
                <button
                  onClick={handleShareSummaryTelegram}
                  className="px-4 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  id="btn-send-summary-telegram"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram</span>
                </button>
                <button
                  onClick={handleShareSummaryWhatsApp}
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  id="btn-send-summary-whatsapp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{isAmharic ? 'የተጠበቀ እና ፈጣን ማጋሪያ' : 'Encrypted & Instant Sharing'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition"
          >
            {isAmharic ? 'ዝጋ' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
