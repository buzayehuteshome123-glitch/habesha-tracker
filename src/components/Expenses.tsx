import React, { useState } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  PieChart as PieIcon, 
  TrendingUp, 
  X,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Expense, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../sampleData';

interface ExpensesProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
  // Triggered by quick actions
  quickActionState: { type: string; itemId?: string } | null;
  setQuickActionState: React.Dispatch<React.SetStateAction<{ type: string; itemId?: string } | null>>;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export default function Expenses({
  expenses,
  setExpenses,
  settings,
  addToast,
  quickActionState,
  setQuickActionState,
  showConfirm,
}: ExpensesProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';

  // 1. States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Rent & Utilities');
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  // Search/Filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Handle Quick Actions from dashboard
  React.useEffect(() => {
    if (quickActionState && quickActionState.type === 'recordExpense') {
      openAddModal();
      setQuickActionState(null);
    }
  }, [quickActionState]);

  // Unique categories list for filters
  const categoriesList = ['All', ...Array.from(new Set(expenses.map(e => e.category)))];

  // Open modals
  const openAddModal = () => {
    setEditingExpense(null);
    setName('');
    setCategory('Rent & Utilities');
    setAmount(0);
    setPaymentMethod('Cash');
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setName(exp.name);
    setCategory(exp.category);
    setAmount(exp.amount);
    setPaymentMethod(exp.paymentMethod);
    setDate(exp.date);
    setDescription(exp.description);
    setIsModalOpen(true);
  };

  // Submit Expense Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0) {
      addToast('Please input a valid name and amount.', 'warning');
      return;
    }

    if (editingExpense) {
      // Edit
      const updated = expenses.map(exp => {
        if (exp.id === editingExpense.id) {
          return { ...exp, name, category, amount, paymentMethod, date, description };
        }
        return exp;
      });
      setExpenses(updated);
      addToast(isAmharic ? 'ወጪው በተሳካ ሁኔታ ተስተካክሏል!' : 'Expense updated successfully!', 'success');
    } else {
      // Add
      const newExp: Expense = {
        id: 'exp-' + Date.now(),
        name,
        category,
        amount,
        paymentMethod,
        date,
        description
      };
      setExpenses([newExp, ...expenses]);
      addToast(isAmharic ? 'ወጪ በተሳካ ሁኔታ ተመዝግቧል!' : 'Expense logged successfully!', 'success');
    }
    setIsModalOpen(false);
  };

  // Delete Expense
  const handleDelete = (id: string) => {
    showConfirm(
      isAmharic ? 'የወጪ መዝገብ መሰረዝ' : 'Delete Expense Record',
      isAmharic 
        ? 'እርግጠኛ ነዎት ይህንን የወጪ መዝገብ መሰረዝ ይፈልጋሉ? ይህ ሊመለስ የማይችል እርምጃ ነው።' 
        : 'Are you sure you want to delete this expense record? This action cannot be undone.',
      () => {
        setExpenses(expenses.filter(e => e.id !== id));
        addToast(isAmharic ? 'የወጪ መዝገቡ ተሰርዟል!' : 'Expense record deleted!', 'success');
      }
    );
  };

  // 2. Calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM

  const todayExpensesSum = expenses
    .filter(e => e.date === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyExpensesSum = expenses
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Filtered list
  const filteredExpenses = expenses.filter(exp => {
    const query = filterSearch.toLowerCase();
    const matchSearch = 
      exp.name.toLowerCase().includes(query) || 
      exp.description.toLowerCase().includes(query);

    const matchCategory = filterCategory === 'All' || exp.category === filterCategory;

    return matchSearch && matchCategory;
  });

  // 3. Analytics Chart Mapping
  // A. Breakdown of Categories (Pie Chart)
  const categoryAmounts: { [key: string]: number } = {};
  expenses.forEach(exp => {
    categoryAmounts[exp.category] = (categoryAmounts[exp.category] || 0) + exp.amount;
  });

  // fallback data for chart styling if empty
  if (Object.keys(categoryAmounts).length === 0) {
    categoryAmounts['Rent & Utilities'] = 15000;
    categoryAmounts['Labor'] = 3000;
    categoryAmounts['Logistics'] = 4500;
  }

  const PIE_COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const pieChartData = Object.keys(categoryAmounts).map(cat => ({
    name: cat,
    value: categoryAmounts[cat]
  }));

  // B. Trend of Expenses (Bar Chart across months)
  const monthlyTrendMap: { [key: string]: number } = {};
  expenses.forEach(exp => {
    const monthLabel = exp.date.slice(0, 7); // e.g., '2026-06'
    monthlyTrendMap[monthLabel] = (monthlyTrendMap[monthLabel] || 0) + exp.amount;
  });

  // Populate last 3 months if empty
  if (Object.keys(monthlyTrendMap).length === 0) {
    monthlyTrendMap['2026-04'] = 18000;
    monthlyTrendMap['2026-05'] = 22000;
    monthlyTrendMap['2026-06'] = 19250;
  }

  const barChartData = Object.keys(monthlyTrendMap).sort().map(m => ({
    month: m,
    amount: monthlyTrendMap[m]
  }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            {t.expenses}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Track overhead costs, labor rates, rentals, and utility charges to maintain correct profitability reports.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/10 transition self-start sm:self-auto"
          id="btn-exp-add"
        >
          <Plus className="w-4 h-4" />
          {t.recordExpense}
        </button>
      </div>

      {/* Top Cards (Metrics Panel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        
        {/* Today's Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t.todayExpenses}
            </span>
            <span className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1 block">
              {todayExpensesSum.toLocaleString()} <span className="text-xs text-slate-400">{settings.currency}</span>
            </span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t.monthlyExpenses}
            </span>
            <span className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1 block">
              {monthlyExpensesSum.toLocaleString()} <span className="text-xs text-slate-400">{settings.currency}</span>
            </span>
          </div>
        </div>

        {/* Unique Categories Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Expense Streams
            </span>
            <span className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1 block">
              {Object.keys(categoryAmounts).length} <span className="text-xs text-slate-400">active channels</span>
            </span>
          </div>
        </div>

      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Breakdown of Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-4 border-l-3 border-rose-500 pl-3">
            {t.expenseBreakdown}
          </h3>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
            
            {/* Color Grid Legend */}
            <div className="absolute bottom-0 inset-x-0 max-h-20 overflow-y-auto grid grid-cols-3 gap-1.5 text-[9px] font-sans">
              {pieChartData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-slate-500 dark:text-slate-400 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Expense Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-4 border-l-3 border-rose-500 pl-3">
            {t.expenseTrend}
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="amount" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Expenses List & Filtering Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Filters Panel */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-sans self-start sm:self-auto">
            {t.expenseList}
          </h4>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search expenses..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
              id="input-exp-search"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
              id="select-exp-filter"
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? `Category: ${t.all}` : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expenses List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Expense Details</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Payment Method</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-sans text-slate-700 dark:text-slate-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                    
                    {/* Expense Details (name & desc) */}
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{exp.name}</p>
                        {exp.description && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed font-sans">{exp.description}</p>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        {exp.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {exp.paymentMethod}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-slate-400 font-mono">
                      {exp.date}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      -{exp.amount.toLocaleString()} Br
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/10 rounded-lg transition"
                          title="Edit expense record"
                          id={`btn-exp-edit-${exp.id}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/10 rounded-lg transition"
                          title="Delete expense record"
                          id={`btn-exp-delete-${exp.id}`}
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

      {/* Add / Edit Expense Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                {editingExpense ? 'Modify Expense Record' : 'Record Business Expense'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                id="btn-exp-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Expense Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t.expenseName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Merkato Office Rent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.amount} (ETB) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500 font-mono"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.dueDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500 font-sans"
                  />
                </div>

              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.expenseCategory}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                  >
                    <option value="Rent & Utilities">Rent & Utilities (ኪራይና መገልገያዎች)</option>
                    <option value="Labor">Labor & Salaries (የሠራተኛ ደሞዝ)</option>
                    <option value="Logistics">Logistics & Fuel (ማመላለሻና ነዳጅ)</option>
                    <option value="Taxes">Taxes & Fees (ግብርና ክፍያዎች)</option>
                    <option value="Restock Purchases">Restock Grains Purchases (ለዕቃ ግዢ)</option>
                    <option value="Marketing">Marketing & Comm (ማስተዋወቂያ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.paymentMethod}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
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

              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t.description}
                </label>
                <textarea
                  rows={2}
                  placeholder="Memo details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Modal Buttons */}
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
                  className="px-5 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md transition"
                  id="btn-exp-modal-submit"
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

// Simple internal edit icon replacement component to bypass unnecessary package imports
function Edit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
