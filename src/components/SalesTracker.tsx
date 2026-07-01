import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  User, 
  CreditCard,
  X,
  PlusCircle,
  TrendingUp,
  Coins,
  Building,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Product, Sale, SaleItem, BusinessSettings, Receivable } from '../types';
import { TRANSLATIONS } from '../sampleData';

interface SalesTrackerProps {
  products: Product[];
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setReceivables: React.Dispatch<React.SetStateAction<Receivable[]>>;
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
  // Triggered by quick actions
  quickActionState: { type: string; itemId?: string } | null;
  setQuickActionState: React.Dispatch<React.SetStateAction<{ type: string; itemId?: string } | null>>;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export default function SalesTracker({
  products,
  sales,
  setSales,
  setProducts,
  setReceivables,
  settings,
  addToast,
  quickActionState,
  setQuickActionState,
  showConfirm,
}: SalesTrackerProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';

  // 1. States
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm
  const [notes, setNotes] = useState('');

  // Credit sale state
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [creditPhone, setCreditPhone] = useState('');
  const [creditDueDate, setCreditDueDate] = useState('');
  
  // Basket list for the active new sale
  const [basket, setBasket] = useState<{ productId: string; quantity: number; sellingPrice: number }[]>([]);

  // Filters state
  const [filterSearch, setFilterSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Handle Quick Actions from dashboard
  React.useEffect(() => {
    if (quickActionState && quickActionState.type === 'recordSale') {
      openSaleModal();
      setQuickActionState(null);
    }
  }, [quickActionState]);

  // Open / Close record modal
  const openSaleModal = () => {
    setCustomerName('');
    setPaymentMethod('Cash');
    setSaleDate(new Date().toISOString().slice(0, 16));
    setNotes('');
    setBasket([{ productId: products[0]?.id || '', quantity: 1, sellingPrice: products[0]?.sellingPrice || 0 }]);
    setIsCreditSale(false);
    setCreditPhone('');
    setCreditDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)); // Default 30 days
    setIsSaleModalOpen(true);
  };

  // Add item to basket in modal
  const handleAddBasketItem = () => {
    if (products.length === 0) {
      addToast('No products available. Please register products first.', 'warning');
      return;
    }
    setBasket([...basket, { productId: products[0].id, quantity: 1, sellingPrice: products[0].sellingPrice }]);
  };

  // Remove basket item
  const handleRemoveBasketItem = (index: number) => {
    if (basket.length <= 1) {
      addToast('A sale must have at least one product item.', 'warning');
      return;
    }
    const updated = basket.filter((_, idx) => idx !== index);
    setBasket(updated);
  };

  // Handle product select change
  const handleBasketProdChange = (index: number, prodId: string) => {
    const selectedProd = products.find(p => p.id === prodId);
    if (!selectedProd) return;

    const updated = [...basket];
    updated[index] = {
      ...updated[index],
      productId: prodId,
      sellingPrice: selectedProd.sellingPrice
    };
    setBasket(updated);
  };

  // Update basket item values
  const handleBasketValueChange = (index: number, field: 'quantity' | 'sellingPrice', value: number) => {
    const updated = [...basket];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setBasket(updated);
  };

  // Check out and deduct stock
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (basket.length === 0) {
      addToast('Your basket is empty.', 'warning');
      return;
    }

    // Validation & Stock availability check
    let valid = true;
    const finalItems: SaleItem[] = [];

    // Temporary copy of products to check and deduct stock
    const productsCopy = [...products];

    for (let i = 0; i < basket.length; i++) {
      const item = basket[i];
      const prod = productsCopy.find(p => p.id === item.productId);
      if (!prod) {
        addToast('Invalid product selected in basket row ' + (i + 1), 'warning');
        valid = false;
        break;
      }

      if (item.quantity <= 0) {
        addToast(`Quantity for ${prod.nameEn} must be greater than zero.`, 'warning');
        valid = false;
        break;
      }

      if (prod.currentStock < item.quantity) {
        // Log warning but allow proceeding (bypass blocking window.confirm inside iframe for a smoother POS experience)
        addToast(
          isAmharic 
            ? `ክምችት ዝቅተኛ ነው፡ ${prod.nameAm} (ቀሪ፡ ${prod.currentStock})`
            : `Low stock alert: ${prod.nameEn} (Stock: ${prod.currentStock})`,
          'warning'
        );
      }

      // Deduct stock
      prod.currentStock = Math.max(0, prod.currentStock - item.quantity);

      finalItems.push({
        productId: prod.id,
        productNameEn: prod.nameEn,
        productNameAm: prod.nameAm,
        quantity: item.quantity,
        purchasePrice: prod.purchasePrice,
        sellingPrice: item.sellingPrice
      });
    }

    if (!valid) return;

    // Financial totals
    const grossSale = finalItems.reduce((acc, curr) => acc + (curr.sellingPrice * curr.quantity), 0);
    const cost = finalItems.reduce((acc, curr) => acc + (curr.purchasePrice * curr.quantity), 0);
    const profit = grossSale - cost;

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      items: finalItems,
      customerName: customerName || 'Walk-in Customer',
      paymentMethod,
      date: new Date(saleDate).toISOString(),
      notes,
      grossSale,
      cost,
      profit
    };

    // Update States
    setSales([newSale, ...sales]);
    setProducts(productsCopy); // Commit stock deductions

    // If credit sale checked, append automatically to Receivables
    if (isCreditSale) {
      const newReceivable: Receivable = {
        id: 'receivable-' + Date.now(),
        customer: customerName || (isAmharic ? 'የብድር ደንበኛ' : 'Credit Customer'),
        phone: creditPhone || 'N/A',
        amount: grossSale,
        dueDate: creditDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'Pending'
      };
      setReceivables(prev => [newReceivable, ...prev]);
      addToast(
        isAmharic 
          ? `የብድር ሽያጭ ወደ ብድር መዝገብ ተጨምሯል፡ ${grossSale} ብር ለ ${customerName || 'ደንበኛ'}!` 
          : `Credit sale recorded: ${grossSale} ETB added to receivables for ${customerName || 'Customer'}!`,
        'info'
      );
    }

    setIsSaleModalOpen(false);

    addToast(
      isAmharic 
        ? 'ሽያጩ በተሳካ ሁኔታ ተመዝግቧል፤ ክምችት ተቀንሷል!' 
        : 'Sale successfully logged! Inventory stock decremented.', 
      'success'
    );
  };

  // Delete sales record (restores stock)
  const handleDeleteSale = (sale: Sale) => {
    showConfirm(
      isAmharic ? 'የሽያጭ መዝገብ መሰረዝ' : 'Delete Sale Record',
      isAmharic 
        ? 'እርግጠኛ ነዎት ይህንን የሽያጭ መዝገብ መሰረዝ ይፈልጋሉ? ይህ ክምችትን ይመልሳል።' 
        : 'Are you sure you want to delete this sale record? This will restore stock levels.',
      () => {
        // Restore products stock
        const updatedProducts = products.map(p => {
          const soldItem = sale.items.find(item => item.productId === p.id);
          if (soldItem) {
            return {
              ...p,
              currentStock: p.currentStock + soldItem.quantity
            };
          }
          return p;
        });

        setProducts(updatedProducts);
        setSales(sales.filter(s => s.id !== sale.id));
        addToast(isAmharic ? 'የሽያጭ መዝገብ ተሰርዟል፤ ክምችት ተመልሷል!' : 'Sale deleted. Stock level restored.', 'success');
      }
    );
  };

  // 2. Filter Logic
  const filteredSales = sales.filter(sale => {
    // Text search (customer name, notes, or product names)
    const query = filterSearch.toLowerCase();
    const matchSearch = 
      sale.customerName.toLowerCase().includes(query) ||
      sale.notes.toLowerCase().includes(query) ||
      sale.items.some(item => 
        item.productNameEn.toLowerCase().includes(query) || 
        item.productNameAm.includes(query)
      );

    // Payment method
    const matchPayment = filterPayment === 'All' || sale.paymentMethod === filterPayment;

    // Particular product filter
    const matchProduct = filterProduct === 'All' || sale.items.some(i => i.productId === filterProduct);

    // Date range
    let matchDate = true;
    if (filterStartDate) {
      matchDate = matchDate && new Date(sale.date) >= new Date(filterStartDate);
    }
    if (filterEndDate) {
      // Add end of day buffer to search
      const endLimit = new Date(filterEndDate);
      endLimit.setHours(23, 59, 59, 999);
      matchDate = matchDate && new Date(sale.date) <= endLimit;
    }

    return matchSearch && matchPayment && matchProduct && matchDate;
  });

  // Unique list of products for filter
  const filterProductsList = Array.from(new Set(sales.flatMap(s => s.items.map(i => i.productId))))
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as Product[];

  // 3. Statistics Calculation on Filtered Sales
  const statGrossRevenue = filteredSales.reduce((acc, curr) => acc + curr.grossSale, 0);
  const statProfit = filteredSales.reduce((acc, curr) => acc + curr.profit, 0);
  const statTransactionsCount = filteredSales.length;
  const statAverageSale = statTransactionsCount > 0 ? Math.round(statGrossRevenue / statTransactionsCount) : 0;

  const statCashCollected = filteredSales
    .filter(s => s.paymentMethod === 'Cash')
    .reduce((acc, curr) => acc + curr.grossSale, 0);

  const statBankCollected = statGrossRevenue - statCashCollected;

  // 4. Exports (CSV / SheetJS Excel / PDF Receipt)
  const exportCsv = () => {
    let headers = 'ID,Date,Customer,Payment Method,Items,Gross Sale (ETB),Profit (ETB),Notes\n';
    const rows = filteredSales.map(s => {
      const itemSummary = s.items.map(i => `${i.productNameEn} (x${i.quantity})`).join(' | ');
      return `"${s.id}","${new Date(s.date).toLocaleDateString()}","${s.customerName}","${s.paymentMethod}","${itemSummary}",${s.grossSale},${s.profit},"${s.notes.replace(/"/g, '""')}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'habesha_sales_ledger.csv');
    link.click();
    addToast('Sales ledger downloaded as CSV.', 'success');
  };

  const exportExcel = () => {
    const excelRows = filteredSales.map(s => ({
      'Sale ID': s.id,
      'Date': new Date(s.date).toLocaleDateString(),
      'Customer Name': s.customerName,
      'Payment Method': s.paymentMethod,
      'Items Sold': s.items.map(i => `${i.productNameEn} (${i.quantity} ${products.find(p => p.id === i.productId)?.unit || 'units'})`).join(', '),
      'Gross Amount (ETB)': s.grossSale,
      'Cost Basis (ETB)': s.cost,
      'Net Profit (ETB)': s.profit,
      'Internal Notes': s.notes
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Ledger');
    XLSX.writeFile(wb, 'habesha-tracker-sales.xlsx');
    addToast('Sales ledger exported to Excel successfully!', 'success');
  };

  const downloadReceiptPdf = (sale: Sale) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 150] // POS thermal receipt dimensions
    });

    // POS Receipt Header
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(settings.businessName || 'Habesha Tracker ERP', 40, 10, { align: 'center' });
    doc.setFontSize(6.5);
    doc.text(settings.address || 'Addis Ababa, Ethiopia', 40, 14, { align: 'center' });
    doc.text(`Phone: ${settings.phone || '+251-900-000000'}`, 40, 17, { align: 'center' });
    doc.text(`Email: ${settings.email || 'admin@habesha.et'}`, 40, 20, { align: 'center' });
    
    doc.line(5, 23, 75, 23); // Divider

    // Sale Details
    doc.text(`Receipt ID: ${sale.id.slice(-8).toUpperCase()}`, 5, 28);
    doc.text(`Date: ${new Date(sale.date).toLocaleString()}`, 5, 32);
    doc.text(`Customer: ${sale.customerName}`, 5, 36);
    doc.text(`Payment: ${sale.paymentMethod}`, 5, 40);

    doc.line(5, 43, 75, 43); // Divider

    // Items Column Headers
    doc.text('Item Description', 5, 47);
    doc.text('Qty', 48, 47);
    doc.text('Price', 56, 47);
    doc.text('Total', 68, 47);
    doc.line(5, 49, 75, 49);

    let currentY = 53;
    sale.items.forEach(item => {
      // Substring to prevent overlapping columns
      const label = item.productNameEn.length > 20 ? item.productNameEn.slice(0, 18) + '..' : item.productNameEn;
      doc.text(label, 5, currentY);
      doc.text(item.quantity.toString(), 50, currentY, { align: 'right' });
      doc.text(item.sellingPrice.toString(), 61, currentY, { align: 'right' });
      doc.text((item.sellingPrice * item.quantity).toString(), 74, currentY, { align: 'right' });
      currentY += 5;
    });

    doc.line(5, currentY, 75, currentY);
    currentY += 5;

    // Totals
    doc.setFontSize(8);
    doc.text('GRAND TOTAL:', 5, currentY);
    doc.text(`${sale.grossSale.toLocaleString()} Br`, 74, currentY, { align: 'right' });

    currentY += 6;
    doc.setFontSize(6);
    doc.text('Thank you for your business! / አመሰግናለሁ!', 40, currentY, { align: 'center' });

    doc.save(`receipt-${sale.id.slice(-6)}.pdf`);
    addToast('POS thermal receipt generated successfully.', 'success');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-500" />
            {t.sales}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Log raw customer orders, calculate profits, print dynamic POS receipts, and track checkout channels.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={openSaleModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/10 transition self-start sm:self-auto"
          id="btn-sales-add"
        >
          <Plus className="w-4 h-4" />
          {t.recordNewSale}
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
          {t.filters}
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Keyword Search */}
          <div className="relative md:col-span-1.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Customer / Note..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden text-slate-800 dark:text-white"
              id="input-sales-filter-search"
            />
          </div>

          {/* Product Filter */}
          <div>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden text-slate-800 dark:text-white"
              id="select-sales-filter-prod"
            >
              <option value="All">Product: {t.all}</option>
              {filterProductsList.map(p => (
                <option key={p.id} value={p.id}>{isAmharic ? p.nameAm : p.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden text-slate-800 dark:text-white"
              id="select-sales-filter-payment"
            >
              <option value="All">Payment: {t.all}</option>
              <option value="Cash">Cash (ጥሬ ገንዘብ)</option>
              {settings.preferCBE !== false && <option value="CBE">CBE (ንግድ ባንክ)</option>}
              {settings.preferTelebirr !== false && <option value="Telebirr">Telebirr (ቴሌብር)</option>}
              {settings.preferEBirr !== false && <option value="E-Birr">E-Birr (ኢ-ብር)</option>}
              {settings.preferSinqee !== false && <option value="Sinqee Bank">Sinqee Bank (ሲንቄ ባንክ)</option>}
              {settings.preferOther === true && <option value="Other">Other Wallet (ሌላ)</option>}
              <option value="Bank">Bank Transfer (ባንክ)</option>
            </select>
          </div>

          {/* Date Picker Range */}
          <div className="flex gap-2 sm:col-span-2">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden text-slate-800 dark:text-white font-sans"
              id="input-sales-filter-start"
            />
            <span className="self-center text-slate-400 text-xs font-bold">to</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden text-slate-800 dark:text-white font-sans"
              id="input-sales-filter-end"
            />
          </div>

        </div>
      </div>

      {/* Filter Statistics Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.filteredGross}</span>
          <span className="block text-base font-bold text-slate-800 dark:text-white mt-1.5 font-mono">
            {statGrossRevenue.toLocaleString()} Br
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.cashCollected}</span>
          <span className="block text-base font-bold text-amber-600 dark:text-amber-400 mt-1.5 font-mono">
            {statCashCollected.toLocaleString()} Br
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.bankCollected}</span>
          <span className="block text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono">
            {statBankCollected.toLocaleString()} Br
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.profit}</span>
          <span className="block text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 font-mono">
            {statProfit.toLocaleString()} Br
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.avgSale}</span>
          <span className="block text-base font-bold text-slate-700 dark:text-slate-200 mt-1.5 font-mono">
            {statAverageSale.toLocaleString()} Br
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.transactionsCount}</span>
          <span className="block text-base font-bold text-slate-700 dark:text-slate-200 mt-1.5 font-mono">
            {statTransactionsCount}
          </span>
        </div>

      </div>

      {/* Sales Records Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Export Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20 dark:bg-slate-950/20">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {t.salesTable}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-lg transition"
              id="btn-sales-export-csv"
            >
              <Download className="w-3 h-3" />
              {t.exportCsv}
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-lg transition"
              id="btn-sales-export-excel"
            >
              <FileSpreadsheet className="w-3 h-3" />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Sale Item(s)</th>
                <th className="px-5 py-3 text-center">Qty</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Gross Sale</th>
                <th className="px-5 py-3 text-right">Profit</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-sans text-slate-700 dark:text-slate-300">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    No checkout transactions found.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition">
                    
                    {/* Sale Items list column */}
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <div className="space-y-0.5">
                        {sale.items.map((i, idx) => (
                          <p key={idx} className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {isAmharic ? i.productNameAm : i.productNameEn}
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* Quantity Sold */}
                    <td className="px-5 py-3.5 text-center font-mono text-slate-500 font-semibold">
                      {sale.items.map((i, idx) => (
                        <p key={idx}>{i.quantity}</p>
                      ))}
                    </td>

                    {/* Payment Method badge */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sale.paymentMethod === 'Cash' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                        sale.paymentMethod === 'Bank' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' :
                        'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                      {sale.customerName}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-slate-500 font-mono">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>

                    {/* Gross */}
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {sale.grossSale.toLocaleString()} Br
                    </td>

                    {/* Profit */}
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{sale.profit.toLocaleString()} Br
                    </td>

                    {/* Actions: PDF Receipt / Delete */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Receipt PDF */}
                        <button
                          onClick={() => downloadReceiptPdf(sale)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition"
                          title="Generate Receipt PDF"
                          id={`btn-sales-pdf-${sale.id}`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Sale */}
                        <button
                          onClick={() => handleDeleteSale(sale)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                          title="Delete sale record"
                          id={`btn-sales-delete-${sale.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS New Sale Modal Form */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                {t.recordNewSale}
              </h3>
              <button
                onClick={() => setIsSaleModalOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                id="btn-sales-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Customer and Payment Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.customerName}
                  </label>
                  <input
                    type="text"
                    placeholder="Kebede / Walk-in"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.paymentMethod}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Cash">Cash (ጥሬ ገንዘብ)</option>
                    {settings.preferCBE !== false && <option value="CBE">CBE (ንግድ ባንክ)</option>}
                    {settings.preferTelebirr !== false && <option value="Telebirr">Telebirr (ቴሌብር)</option>}
                    {settings.preferEBirr !== false && <option value="E-Birr">E-Birr (ኢ-ብር)</option>}
                    {settings.preferSinqee !== false && <option value="Sinqee Bank">Sinqee Bank (ሲንቄ ባንክ)</option>}
                    {settings.preferOther === true && <option value="Other">Other Wallet (ሌላ ክፍያ)</option>}
                    {/* Fallback to Bank if none of them are active */}
                    {!(settings.preferCBE !== false || settings.preferTelebirr !== false || settings.preferEBirr !== false || settings.preferSinqee !== false) && (
                      <option value="Bank">Bank Transfer (ባንክ)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.saleDate}
                  </label>
                  <input
                    type="datetime-local"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-sans"
                  />
                </div>

                {/* Sell on Credit / Receivables Option */}
                <div className="col-span-2 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCreditSale}
                      onChange={(e) => setIsCreditSale(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isAmharic ? 'በብድር የተሸጠ (ወደ ብድር መዝገብ አስገባ)' : 'Sell on Credit (Add to Receivables)'}
                    </span>
                  </label>
                  {isCreditSale && (
                    <div className="mt-2 grid grid-cols-2 gap-4 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {isAmharic ? 'የብድር መክፈያ ቀን' : 'Credit Due Date'}
                        </label>
                        <input
                          type="date"
                          required
                          value={creditDueDate}
                          onChange={(e) => setCreditDueDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {isAmharic ? 'የደንበኛ ስልክ ቁጥር' : 'Customer Phone Number'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. +251..."
                          value={creditPhone}
                          onChange={(e) => setCreditPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Basket Row Items */}
              <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800/80 py-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans uppercase tracking-wider">
                    Basket Checkout Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBasketItem}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 rounded-lg transition"
                    id="btn-sales-add-basket-row"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {t.addItem}
                  </button>
                </div>

                {products.length === 0 ? (
                  <p className="text-xs text-rose-500 text-center py-4">
                    Register products in the inventory tab first before you can checkout!
                  </p>
                ) : (
                  basket.map((item, index) => {
                    const currentProdDetails = products.find(p => p.id === item.productId);
                    return (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                        
                        {/* Product Picker */}
                        <div className="col-span-5">
                          <select
                            value={item.productId}
                            onChange={(e) => handleBasketProdChange(index, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {isAmharic ? p.nameAm : p.nameEn} ({p.currentStock} in stock)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Input */}
                        <div className="col-span-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => handleBasketValueChange(index, 'quantity', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                            />
                            {currentProdDetails && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                                {currentProdDetails.unit}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Custom Selling Price */}
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Price"
                            value={item.sellingPrice}
                            onChange={(e) => handleBasketValueChange(index, 'sellingPrice', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                          />
                        </div>

                        {/* Remove Row */}
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveBasketItem(index)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t.notes}
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter reference codes, bank receipts, delivery guidelines..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Real-time Order Summary Indicators */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-xs font-sans">
                <div>
                  <span className="text-slate-500 font-medium block">ESTIMATED PROFITABILITY:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    {basket.reduce((acc, curr) => {
                      const costVal = products.find(p => p.id === curr.productId)?.purchasePrice || 0;
                      return acc + ((curr.sellingPrice - costVal) * curr.quantity);
                    }, 0).toLocaleString()} Br
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="text-slate-500 font-medium block">GRAND TOTAL AMOUNT:</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-white font-mono">
                    {basket.reduce((acc, curr) => acc + (curr.sellingPrice * curr.quantity), 0).toLocaleString()} Br
                  </span>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={products.length === 0}
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-sales-modal-submit"
                >
                  Confirm Checkout
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
