import React, { useState, useRef } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  AlertTriangle,
  X,
  RefreshCw,
  Tag
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product, BusinessSettings, Payable } from '../types';
import { TRANSLATIONS } from '../sampleData';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setPayables: React.Dispatch<React.SetStateAction<Payable[]>>;
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
  // Triggered by quick actions
  quickActionState: { type: string; itemId?: string } | null;
  setQuickActionState: React.Dispatch<React.SetStateAction<{ type: string; itemId?: string } | null>>;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export default function Inventory({
  products,
  setProducts,
  setPayables,
  settings,
  addToast,
  quickActionState,
  setQuickActionState,
  showConfirm,
}: InventoryProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';

  // 1. Local States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low Stock' | 'Out of Stock'>('All');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [category, setCategory] = useState('Grains & Cereals');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('kg');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [minStock, setMinStock] = useState(5);
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');

  // Purchase debt state
  const [purchaseOnDebt, setPurchaseOnDebt] = useState(false);
  const [debtDueDate, setDebtDueDate] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Quick Actions from dashboard (e.g. Add product or Restock item)
  React.useEffect(() => {
    if (quickActionState) {
      if (quickActionState.type === 'addProduct') {
        openAddModal();
      } else if (quickActionState.type === 'restock' || quickActionState.type.startsWith('restockItem-')) {
        const prodId = quickActionState.itemId || quickActionState.type.split('-')[1];
        if (prodId) {
          const prod = products.find(p => p.id === prodId);
          if (prod) {
            openEditModal(prod);
          }
        } else {
          addToast('Please select a product from the list to restock.', 'info');
        }
      }
      setQuickActionState(null);
    }
  }, [quickActionState]);

  // Unique categories lists
  const categoriesList = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Search and Filters mapping
  const filteredProducts = products.filter(prod => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      prod.nameEn.toLowerCase().includes(query) ||
      prod.nameAm.includes(query) ||
      prod.sku.toLowerCase().includes(query) ||
      (prod.supplier && prod.supplier.toLowerCase().includes(query));

    const matchCategory = selectedCategory === 'All' || prod.category === selectedCategory;

    let matchStock = true;
    if (stockFilter === 'Low Stock') {
      matchStock = prod.currentStock > 0 && prod.currentStock <= prod.minStock;
    } else if (stockFilter === 'Out of Stock') {
      matchStock = prod.currentStock === 0;
    }

    return matchSearch && matchCategory && matchStock;
  });

  // Open modals
  const openAddModal = () => {
    setEditingProduct(null);
    setNameEn('');
    setNameAm('');
    setCategory('Grains & Cereals');
    setSku('SKU-' + Math.floor(Math.random() * 900000 + 100000));
    setUnit('kg');
    setPurchasePrice(0);
    setSellingPrice(0);
    setCurrentStock(0);
    setMinStock(5);
    setSupplier('');
    setDescription('');
    setPurchaseOnDebt(false);
    setDebtDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)); // default 30 days
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setNameEn(prod.nameEn);
    setNameAm(prod.nameAm);
    setCategory(prod.category);
    setSku(prod.sku);
    setUnit(prod.unit);
    setPurchasePrice(prod.purchasePrice);
    setSellingPrice(prod.sellingPrice);
    setCurrentStock(prod.currentStock);
    setMinStock(prod.minStock);
    setSupplier(prod.supplier);
    setDescription(prod.description);
    setPurchaseOnDebt(false);
    setDebtDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)); // default 30 days
    setIsModalOpen(true);
  };

  // Delete Action
  const handleDelete = (id: string) => {
    showConfirm(
      isAmharic ? 'ዕቃ መሰረዝ' : 'Delete Product',
      isAmharic 
        ? 'እርግጠኛ ነዎት ይህንን ዕቃ መሰረዝ ይፈልጋሉ? ይህ ሊመለስ የማይችል እርምጃ ነው።' 
        : 'Are you sure you want to delete this product? This action cannot be undone.',
      () => {
        const remaining = products.filter(p => p.id !== id);
        setProducts(remaining);
        addToast(isAmharic ? 'ዕቃው በተሳካ ሁኔታ ተሰርዟል!' : 'Product deleted successfully!', 'success');
      }
    );
  };

  // Form Submit (Save / Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !sku || purchasePrice <= 0 || sellingPrice <= 0) {
      addToast(isAmharic ? 'እባክዎን ሁሉንም አስፈላጊ መረጃዎች ያስገቡ!' : 'Please fill all required fields correctly!', 'warning');
      return;
    }

    if (editingProduct) {
      // Edit
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            nameEn,
            nameAm: nameAm || nameEn,
            category,
            sku,
            unit,
            purchasePrice,
            sellingPrice,
            currentStock,
            minStock,
            supplier,
            description
          };
        }
        return p;
      });
      setProducts(updated);
      addToast(isAmharic ? 'የዕቃው መረጃ በተሳካ ሁኔታ ተስተካክሏል!' : 'Product updated successfully!', 'success');
    } else {
      // Add
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        nameEn,
        nameAm: nameAm || nameEn,
        category,
        sku,
        unit,
        purchasePrice,
        sellingPrice,
        currentStock,
        minStock,
        supplier,
        description
      };
      setProducts([newProd, ...products]);
      addToast(isAmharic ? 'አዲስ ዕቃ በተሳካ ሁኔታ ተመዝግቧል!' : 'New product registered successfully!', 'success');
    }

    // Auto record purchase on debt
    if (purchaseOnDebt) {
      const debtAmount = purchasePrice * currentStock;
      if (debtAmount > 0) {
        const newPayable: Payable = {
          id: 'payable-' + Date.now(),
          supplier: supplier || (isAmharic ? 'ያልታወቀ አቅራቢ' : 'Unknown Supplier'),
          amount: debtAmount,
          dueDate: debtDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: 'Pending'
        };
        setPayables(prev => [newPayable, ...prev]);
        addToast(
          isAmharic 
            ? `የዕዳ መዝገብ ተፈጥሯል፡ ${debtAmount} ብር ዕዳ ለአቅራቢ ${supplier || 'ያልታወቀ'}!` 
            : `Purchase debt recorded: ${debtAmount} ETB payable to supplier ${supplier || 'Unknown'}!`,
          'info'
        );
      }
    }

    setIsModalOpen(false);
  };

  // SheetJS Excel Export
  const exportToExcel = () => {
    const dataToExport = products.map(p => ({
      'SKU': p.sku,
      'Product Name (English)': p.nameEn,
      'Product Name (Amharic)': p.nameAm,
      'Category': p.category,
      'Unit': p.unit,
      'Purchase Price (ETB)': p.purchasePrice,
      'Selling Price (ETB)': p.sellingPrice,
      'Current Stock': p.currentStock,
      'Minimum Level': p.minStock,
      'Total Valuation (ETB)': p.purchasePrice * p.currentStock,
      'Supplier': p.supplier || 'N/A',
      'Description': p.description || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'habesha-tracker-inventory.xlsx');
    addToast(isAmharic ? 'የክምችት ዝርዝር ወደ ኤክሴል ተልኳል!' : 'Inventory exported to Excel successfully!', 'success');
  };

  // SheetJS Excel Import
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          addToast('The uploaded Excel file is empty.', 'warning');
          return;
        }

        const importedProducts: Product[] = jsonData.map((row, idx) => {
          const skuVal = row['SKU'] || row['sku'] || 'SKU-IMP-' + Math.floor(Math.random() * 80000 + 10000 + idx);
          const nameEnVal = row['Product Name (English)'] || row['nameEn'] || row['Product Name'] || 'Imported ' + idx;
          const nameAmVal = row['Product Name (Amharic)'] || row['nameAm'] || nameEnVal;
          const catVal = row['Category'] || row['category'] || 'Uncategorized';
          const unitVal = row['Unit'] || row['unit'] || 'Pcs';
          const purPrice = Number(row['Purchase Price (ETB)'] || row['purchasePrice'] || row['Purchase Price'] || 0);
          const selPrice = Number(row['Selling Price (ETB)'] || row['sellingPrice'] || row['Selling Price'] || 0);
          const stockVal = Number(row['Current Stock'] || row['currentStock'] || 0);
          const minLvl = Number(row['Minimum Level'] || row['minStock'] || 5);
          const sup = row['Supplier'] || row['supplier'] || '';
          const desc = row['Description'] || row['description'] || '';

          return {
            id: 'prod-imp-' + Date.now() + '-' + idx,
            nameEn: nameEnVal,
            nameAm: nameAmVal,
            category: catVal,
            sku: skuVal,
            unit: unitVal,
            purchasePrice: purPrice,
            sellingPrice: selPrice,
            currentStock: stockVal,
            minStock: minLvl,
            supplier: sup,
            description: desc
          };
        });

        // Merge imports avoiding SKU duplicates, prioritizing imported files
        const existingSkus = new Set(products.map(p => p.sku));
        const finalProducts = [...products];

        importedProducts.forEach(imp => {
          if (!existingSkus.has(imp.sku)) {
            finalProducts.push(imp);
          } else {
            // Update the existing product's stock and details
            const idxOfExisting = finalProducts.findIndex(p => p.sku === imp.sku);
            if (idxOfExisting !== -1) {
              finalProducts[idxOfExisting] = {
                ...finalProducts[idxOfExisting],
                currentStock: imp.currentStock,
                purchasePrice: imp.purchasePrice,
                sellingPrice: imp.sellingPrice
              };
            }
          }
        });

        setProducts(finalProducts);
        addToast(
          isAmharic 
            ? `${importedProducts.length} ዕቃዎች በተሳካ ሁኔታ ከኤክሴል ገብተዋል!` 
            : `${importedProducts.length} items successfully imported/merged from Excel!`, 
          'success'
        );
      } catch (err) {
        console.error(err);
        addToast('Failed to parse Excel file. Ensure headers are correct.', 'warning');
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            {t.inventory}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Manage your physical warehouse stock levels, purchase rates, and retail/wholesale prices easily.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap gap-2">
          
          {/* Export Excel */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 transition"
            id="btn-inv-export"
          >
            <Download className="w-3.5 h-3.5" />
            {t.exportExcel}
          </button>

          {/* Import Excel */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            {t.importExcel}
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleExcelImport}
              id="input-inv-import"
            />
          </label>

          {/* Add Product Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/10 transition"
            id="btn-inv-add"
          >
            <Plus className="w-4 h-4" />
            {t.addProduct}
          </button>

        </div>
      </div>

      {/* Search & Filtering Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchProdPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 font-sans text-slate-800 dark:text-slate-100 transition"
            id="input-inv-search"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 font-sans text-slate-800 dark:text-slate-100 transition"
            id="select-inv-cat-filter"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? `${t.category}: ${t.all}` : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="flex gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {(['All', 'Low Stock', 'Out of Stock'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStockFilter(status)}
              className={`flex-1 text-[10px] py-1.5 font-semibold rounded-lg transition-all ${
                stockFilter === status 
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              id={`btn-inv-filter-${status.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {status === 'All' ? t.all : status === 'Low Stock' ? t.lowStock : t.outOfStock}
            </button>
          ))}
        </div>

      </div>

      {/* Spreadsheet Stock Grid Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">SKU</th>
                <th className="px-5 py-3.5">{isAmharic ? 'የዕቃው ስም (English / አማርኛ)' : 'Product Name'}</th>
                <th className="px-5 py-3.5">{t.category}</th>
                <th className="px-5 py-3.5 text-right">{t.purchasePrice}</th>
                <th className="px-5 py-3.5 text-right">{t.sellingPrice}</th>
                <th className="px-5 py-3.5 text-center">{t.currentStock}</th>
                <th className="px-5 py-3.5 text-right">{isAmharic ? 'አጠቃላይ ግምት' : 'Total Valuation'}</th>
                <th className="px-5 py-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-sans text-slate-700 dark:text-slate-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    No matching products found in stock.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const valuation = prod.purchasePrice * prod.currentStock;
                  const isOutOfStock = prod.currentStock === 0;
                  const isLowStock = prod.currentStock > 0 && prod.currentStock <= prod.minStock;

                  return (
                    <tr 
                      key={prod.id} 
                      className={`hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors ${
                        isOutOfStock ? 'bg-rose-50/20 dark:bg-rose-950/5' : 
                        isLowStock ? 'bg-amber-50/15 dark:bg-amber-950/5' : ''
                      }`}
                    >
                      {/* SKU */}
                      <td className="px-5 py-4 font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {prod.sku}
                      </td>

                      {/* Product Name */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                            {prod.nameEn}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                            {prod.nameAm}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">
                          <Tag className="w-2.5 h-2.5" />
                          {prod.category}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="px-5 py-4 text-right font-mono font-medium">
                        {prod.purchasePrice.toLocaleString()} Br
                      </td>

                      {/* Selling Price */}
                      <td className="px-5 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {prod.sellingPrice.toLocaleString()} Br
                      </td>

                      {/* Current Stock */}
                      <td className="px-5 py-4 text-center">
                        <div>
                          <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            isOutOfStock ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400' :
                            isLowStock ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' :
                            'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {prod.currentStock}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans ml-1 block mt-0.5">
                            {prod.unit}
                          </span>
                        </div>
                      </td>

                      {/* Valuation */}
                      <td className="px-5 py-4 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                        {valuation.toLocaleString()} Br
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition"
                            title={t.editProdTitle}
                            id={`btn-inv-edit-${prod.id}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                            title="Delete"
                            id={`btn-inv-delete-${prod.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Add/Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-500" />
                {editingProduct ? t.editProdTitle : t.addProdTitle}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                id="btn-inv-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Name English */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.prodNameEn} *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Name Amharic */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.prodNameAm}
                  </label>
                  <input
                    type="text"
                    value={nameAm}
                    onChange={(e) => setNameAm(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.category}
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.sku} *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white font-mono"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.unit}
                  </label>
                  <select
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="pce">pce (Piece)</option>
                    <option value="karton">karton (Carton)</option>
                    <option value="liter">liter (Liter)</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Sachet">Sachet</option>
                  </select>
                </div>

                {/* Minimum Stock Alert Level */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.minStock}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.purchasePrice} (ETB) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white font-mono"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.sellingPrice} (ETB) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white font-mono"
                  />
                </div>

                {/* Current Stock */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.currentStock} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white font-mono"
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.supplier}
                  </label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Purchase on Credit / Debt Option */}
                <div className="col-span-2 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={purchaseOnDebt}
                      onChange={(e) => setPurchaseOnDebt(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isAmharic ? 'በዕዳ የተገዛ (ወደ ዕዳ መዝገብ አስገባ)' : 'Purchase on Credit / Debt (Add to Payables)'}
                    </span>
                  </label>
                  {purchaseOnDebt && (
                    <div className="mt-2 grid grid-cols-2 gap-4 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {isAmharic ? 'የዕዳ መክፈያ ቀን' : 'Debt Due Date'}
                        </label>
                        <input
                          type="date"
                          required
                          value={debtDueDate}
                          onChange={(e) => setDebtDueDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {isAmharic ? 'የዕዳ መጠን (የግዢ ዋጋ × ብዛት)' : 'Debt Amount (Purchase Price × Stock)'}
                        </label>
                        <div className="px-3 py-2 text-xs border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-100/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-mono">
                          {(purchasePrice * currentStock).toLocaleString()} {settings.currency}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.description}
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition animate-pulse-once"
                  id="btn-inv-modal-submit"
                >
                  {t.save}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
