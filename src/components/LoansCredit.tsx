import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  X,
  Clock,
  Briefcase
} from 'lucide-react';
import { Receivable, Payable, BusinessSettings, Sale, Expense } from '../types';
import { TRANSLATIONS } from '../sampleData';

interface LoansCreditProps {
  receivables: Receivable[];
  setReceivables: React.Dispatch<React.SetStateAction<Receivable[]>>;
  payables: Payable[];
  setPayables: React.Dispatch<React.SetStateAction<Payable[]>>;
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  sales?: Sale[];
  setSales?: React.Dispatch<React.SetStateAction<Sale[]>>;
  expenses?: Expense[];
  setExpenses?: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export default function LoansCredit({
  receivables,
  setReceivables,
  payables,
  setPayables,
  settings,
  addToast,
  showConfirm,
  sales,
  setSales,
  expenses,
  setExpenses,
}: LoansCreditProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';

  // 1. States
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Settlement selection modal state
  const [settlementRecord, setSettlementRecord] = useState<{
    id: string;
    type: 'receivable' | 'payable';
    name: string;
    amount: number;
  } | null>(null);
  const [settlementMethod, setSettlementMethod] = useState<string>('Cash');

  // Form Fields
  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [entityName, setEntityName] = useState(''); // Customer or Supplier
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Overdue' | 'Paid'>('Pending');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Overdue' | 'Paid'>('All');

  // 2. Calculations & Metrics
  const todayStr = new Date().toISOString().slice(0, 10);

  // Receivables (to collect) totals
  const totalReceivablePending = receivables
    .filter(r => r.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalReceivableOverdue = receivables
    .filter(r => r.status === 'Overdue' || (r.status === 'Pending' && r.dueDate < todayStr))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Payables (we owe) totals
  const totalPayablePending = payables
    .filter(p => p.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPayableOverdue = payables
    .filter(p => p.status === 'Overdue' || (p.status === 'Pending' && p.dueDate < todayStr))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const overallReceivables = totalReceivablePending + totalReceivableOverdue;
  const overallPayables = totalPayablePending + totalPayableOverdue;

  // 3. Form Submit
  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName || amount <= 0 || !dueDate) {
      addToast('Please complete all fields.', 'warning');
      return;
    }

    const newId = 'credit-' + Date.now();

    if (type === 'receivable') {
      const newRec: Receivable = {
        id: newId,
        customer: entityName,
        phone: phone || 'N/A',
        amount,
        dueDate,
        status
      };
      setReceivables([newRec, ...receivables]);
      addToast(isAmharic ? 'የደንበኛ ብድር በተሳካ ሁኔታ ተመዝግቧል!' : 'Customer credit receivable registered!', 'success');
    } else {
      const newPay: Payable = {
        id: newId,
        supplier: entityName,
        amount,
        dueDate,
        status
      };
      setPayables([newPay, ...payables]);
      addToast(isAmharic ? 'የአቅራቢ ዕዳ በተሳካ ሁኔታ ተመዝግቧል!' : 'Supplier payable logged successfully!', 'success');
    }

    setIsModalOpen(false);
  };

  // Status Toggles
  const handleToggleReceivableStatus = (id: string, nextStatus: 'Pending' | 'Overdue' | 'Paid') => {
    if (nextStatus === 'Paid') {
      const rec = receivables.find(r => r.id === id);
      if (rec) {
        setSettlementRecord({
          id: rec.id,
          type: 'receivable',
          name: rec.customer,
          amount: rec.amount
        });
        setSettlementMethod('Cash');
        return;
      }
    }
    const updated = receivables.map(r => r.id === id ? { ...r, status: nextStatus } : r);
    setReceivables(updated);
    addToast(isAmharic ? 'የብድሩ ሁኔታ ተቀይሯል!' : 'Credit status updated!', 'success');
  };

  const handleTogglePayableStatus = (id: string, nextStatus: 'Pending' | 'Overdue' | 'Paid') => {
    if (nextStatus === 'Paid') {
      const pay = payables.find(p => p.id === id);
      if (pay) {
        setSettlementRecord({
          id: pay.id,
          type: 'payable',
          name: pay.supplier,
          amount: pay.amount
        });
        setSettlementMethod('Cash');
        return;
      }
    }
    const updated = payables.map(p => p.id === id ? { ...p, status: nextStatus } : p);
    setPayables(updated);
    addToast(isAmharic ? 'የዕዳው ሁኔታ ተቀይሯል!' : 'Payable status updated!', 'success');
  };

  const handleConfirmSettlement = () => {
    if (!settlementRecord) return;
    const { id, type, name, amount } = settlementRecord;

    if (type === 'receivable') {
      // 1. Mark receivable as Paid
      const updated = receivables.map(r => r.id === id ? { ...r, status: 'Paid' as const } : r);
      setReceivables(updated);

      // 2. Automatically record a Sale (Income) to link with cash/bank
      const newSale: Sale = {
        id: 'sale-' + Date.now(),
        items: [{
          productId: 'custom-receivable',
          productNameEn: `Receivable Payment: ${name}`,
          productNameAm: `የተሰበሰበ ብድር፦ ${name}`,
          quantity: 1,
          purchasePrice: 0,
          sellingPrice: amount
        }],
        customerName: name,
        paymentMethod: settlementMethod,
        date: new Date().toISOString().slice(0, 10),
        notes: `Automatically generated from settling Receivable ID: ${id}`,
        grossSale: amount,
        cost: 0,
        profit: amount
      };

      if (setSales && sales) {
        setSales([newSale, ...sales]);
      }

      addToast(
        isAmharic 
          ? `የብድር ክፍያ በተሳካ ሁኔታ ተሰብስቧል! (${settlementMethod} ውስጥ ተጨምሯል)` 
          : `Receivable payment collected successfully! (Added to ${settlementMethod})`, 
        'success'
      );
    } else {
      // 1. Mark payable as Paid
      const updated = payables.map(p => p.id === id ? { ...p, status: 'Paid' as const } : p);
      setPayables(updated);

      // 2. Automatically record an Expense to link with cash/bank
      const newExpense: Expense = {
        id: 'expense-' + Date.now(),
        name: `Payable Settle: ${name}`,
        category: 'Debt Repayment',
        amount: amount,
        paymentMethod: settlementMethod,
        date: new Date().toISOString().slice(0, 10),
        description: `Automatically generated from settling Payable ID: ${id}`
      };

      if (setExpenses && expenses) {
        setExpenses([newExpense, ...expenses]);
      }

      addToast(
        isAmharic 
          ? `የዕዳ ክፍያ በተሳካ ሁኔታ ተፈጽሟል! (${settlementMethod} ላይ ተቀንሷል)` 
          : `Payable settled successfully! (Deducted from ${settlementMethod})`, 
        'success'
      );
    }

    setSettlementRecord(null);
  };

  // Delete Record
  const handleDeleteReceivable = (id: string) => {
    showConfirm(
      isAmharic ? 'የብድር መዝገብ መሰረዝ' : 'Delete Receivable Record',
      isAmharic 
        ? 'እርግጠኛ ነዎት ይህንን የብድር መዝገብ መሰረዝ ይፈልጋሉ? ይህ ሊመለስ የማይችል እርምጃ ነው።' 
        : 'Are you sure you want to delete this receivable record? This action cannot be undone.',
      () => {
        setReceivables(receivables.filter(r => r.id !== id));
        addToast(isAmharic ? 'የብድር መዝገቡ ተሰርዟል!' : 'Credit entry removed.', 'info');
      }
    );
  };

  const handleDeletePayable = (id: string) => {
    showConfirm(
      isAmharic ? 'የዕዳ መዝገብ መሰረዝ' : 'Delete Payable Record',
      isAmharic 
        ? 'እርግጠኛ ነዎት ይህንን የዕዳ መዝገብ መሰረዝ ይፈልጋሉ? ይህ ሊመለስ የማይችል እርምጃ ነው።' 
        : 'Are you sure you want to delete this payable record? This action cannot be undone.',
      () => {
        setPayables(payables.filter(p => p.id !== id));
        addToast(isAmharic ? 'የዕዳ መዝገቡ ተሰርዟል!' : 'Payable entry removed.', 'info');
      }
    );
  };

  // Filter lists
  const filteredReceivables = receivables.filter(r => {
    const query = searchQuery.toLowerCase();
    const matchSearch = r.customer.toLowerCase().includes(query) || r.phone.includes(query);
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPayables = payables.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchSearch = p.supplier.toLowerCase().includes(query);
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            {t.creditLoans}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Oversee outstanding client credits (money to receive) and raw-supplier purchases (money we owe).
          </p>
        </div>

        <button
          onClick={() => {
            setType(activeTab === 'receivables' ? 'receivable' : 'payable');
            setEntityName('');
            setPhone('');
            setAmount(0);
            setDueDate(new Date().toISOString().slice(0, 10));
            setStatus('Pending');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/10 transition self-start sm:self-auto"
          id="btn-credit-add"
        >
          <Plus className="w-4 h-4" />
          {t.addLoan}
        </button>
      </div>

      {/* Credit & Loans Split Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Receivables */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.receivables}</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 block mt-1 font-mono">
            {overallReceivables.toLocaleString()} {t.currencySymbol}
          </span>
          <span className="text-[10px] text-slate-400 block mt-2 font-sans">
            Pending: {totalReceivablePending.toLocaleString()} | Overdue: {totalReceivableOverdue.toLocaleString()}
          </span>
        </div>

        {/* Total Payables */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.payables}</span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 block mt-1 font-mono">
            {overallPayables.toLocaleString()} {t.currencySymbol}
          </span>
          <span className="text-[10px] text-slate-400 block mt-2 font-sans">
            Pending: {totalPayablePending.toLocaleString()} | Overdue: {totalPayableOverdue.toLocaleString()}
          </span>
        </div>

        {/* Upcoming Due Payments summary card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.upcomingDue}</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 block">
              {(receivables.filter(r => r.status === 'Pending' && r.dueDate >= todayStr).length +
                payables.filter(p => p.status === 'Pending' && p.dueDate >= todayStr).length)} Accounts
            </span>
          </div>
        </div>

        {/* Overdue Accounts list card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.overdueAccounts}</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-1 block">
              {(receivables.filter(r => r.status === 'Overdue' || (r.status === 'Pending' && r.dueDate < todayStr)).length +
                payables.filter(p => p.status === 'Overdue' || (p.status === 'Pending' && p.dueDate < todayStr)).length)} Accounts
            </span>
          </div>
        </div>

      </div>

      {/* Primary Split View (Receivables vs Payables) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Tab Selector & Filters Bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Split Buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('receivables'); setStatusFilter('All'); }}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'receivables' 
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              id="btn-credit-tab-rec"
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              {isAmharic ? 'የደንበኛ የሚሰበሰብ (Receivables)' : 'Receivables'}
            </button>
            <button
              onClick={() => { setActiveTab('payables'); setStatusFilter('All'); }}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'payables' 
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              id="btn-credit-tab-pay"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-500" />
              {isAmharic ? 'ለአቅራቢ የሚከፈል (Payables)' : 'Payables'}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name/phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
              id="input-credit-search"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
              id="select-credit-status-filter"
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending (ያልተከፈለ)</option>
              <option value="Overdue">Overdue (ቀን ያለፈበት)</option>
              <option value="Paid">Paid (የተከፈለ)</option>
            </select>
          </div>

        </div>

        {/* Tab Contents: Receivables Table */}
        {activeTab === 'receivables' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact Phone</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5 text-right">Amount Owed</th>
                  <th className="px-5 py-3.5 text-center">Payment Status</th>
                  <th className="px-5 py-3.5 text-center">Toggle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-sans text-slate-700 dark:text-slate-300">
                {filteredReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 animate-pulse">
                      No customer credit records found.
                    </td>
                  </tr>
                ) : (
                  filteredReceivables.map(rec => {
                    const isOverdueReal = rec.status === 'Overdue' || (rec.status === 'Pending' && rec.dueDate < todayStr);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                        
                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">{rec.customer}</td>
                        
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {rec.phone}
                        </td>
                        
                        <td className={`px-5 py-4 font-mono font-medium ${isOverdueReal ? 'text-rose-600' : 'text-slate-400'}`}>
                          {rec.dueDate} {isOverdueReal && <span className="text-[9px] font-bold font-sans uppercase bg-rose-100 dark:bg-rose-950 px-1 py-0.5 rounded">Overdue</span>}
                        </td>
                        
                        <td className="px-5 py-4 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                          {rec.amount.toLocaleString()} Br
                        </td>
                        
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                            isOverdueReal ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 animate-pulse' :
                            'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          }`}>
                            {rec.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {rec.status !== 'Paid' && (
                              <button
                                onClick={() => handleToggleReceivableStatus(rec.id, 'Paid')}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px] font-bold rounded-md transition"
                                id={`btn-credit-mark-paid-${rec.id}`}
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReceivable(rec.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 rounded transition"
                              id={`btn-credit-delete-${rec.id}`}
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
        ) : (
          /* Tab Contents: Payables Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Supplier Name</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5 text-right">Amount We Owe</th>
                  <th className="px-5 py-3.5 text-center">Payment Status</th>
                  <th className="px-5 py-3.5 text-center">Toggle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-sans text-slate-700 dark:text-slate-300">
                {filteredPayables.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 animate-pulse">
                      No supplier payable records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayables.map(pay => {
                    const isOverdueReal = pay.status === 'Overdue' || (pay.status === 'Pending' && pay.dueDate < todayStr);
                    return (
                      <tr key={pay.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                        
                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">{pay.supplier}</td>
                        
                        <td className={`px-5 py-4 font-mono font-medium ${isOverdueReal ? 'text-rose-600' : 'text-slate-400'}`}>
                          {pay.dueDate} {isOverdueReal && <span className="text-[9px] font-bold font-sans uppercase bg-rose-100 dark:bg-rose-950 px-1 py-0.5 rounded">Overdue</span>}
                        </td>
                        
                        <td className="px-5 py-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          {pay.amount.toLocaleString()} Br
                        </td>
                        
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            pay.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                            isOverdueReal ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 animate-pulse' :
                            'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          }`}>
                            {pay.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {pay.status !== 'Paid' && (
                              <button
                                onClick={() => handleTogglePayableStatus(pay.id, 'Paid')}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px] font-bold rounded-md transition"
                                id={`btn-pay-mark-paid-${pay.id}`}
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePayable(pay.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 rounded transition"
                              id={`btn-pay-delete-${pay.id}`}
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
        )}

      </div>

      {/* Record Loan / Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                Record Credit Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddCredit} className="p-6 space-y-4">
              
              {/* Type Switcher */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Type
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setType('receivable')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      type === 'receivable' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    Customer Receivable (ብድር)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('payable')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      type === 'payable' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    Supplier Payable (ዕዳ)
                  </button>
                </div>
              </div>

              {/* Entity Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {type === 'receivable' ? 'Customer Name' : 'Supplier / Wholesaler Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === 'receivable' ? "e.g. Girma Wolde" : "e.g. Almaz Wholesalers"}
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Contact Phone (for customer) */}
              {type === 'receivable' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Customer Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+251-911-000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                  />
                </div>
              )}

              {/* Amount and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Credit Amount (ETB) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden font-sans"
                  />
                </div>

              </div>

              {/* Initial Status Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Credit Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                >
                  <option value="Pending">Pending (ቀሪ ያለበት)</option>
                  <option value="Overdue">Overdue (ቀን ያለፈበት)</option>
                  <option value="Paid">Paid (የተከፈለ)</option>
                </select>
              </div>

              {/* Submit Buttons */}
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
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition"
                  id="btn-credit-modal-submit"
                >
                  {t.save}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Settle Payment Modal */}
      {settlementRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {settlementRecord.type === 'receivable' 
                  ? (isAmharic ? 'የብድር መሰብሰቢያ' : 'Collect Receivable Payment')
                  : (isAmharic ? 'የዕዳ መክፈያ' : 'Settle Supplier Payable')
                }
              </h3>
              <button
                onClick={() => setSettlementRecord(null)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500">
                    {settlementRecord.type === 'receivable' ? (isAmharic ? 'የደንበኛ ስም' : 'Customer Name') : (isAmharic ? 'የአቅራቢ ስም' : 'Supplier Name')}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{settlementRecord.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500">{isAmharic ? 'የክፍያ መጠን' : 'Amount'}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {settlementRecord.amount.toLocaleString()} {settings.currency || 'ETB'}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isAmharic ? 'ክፍያው የሚፈጸምበት አካውንት' : 'Payment Destination/Source Account'} *
                </label>
                <select
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                >
                  <option value="Cash">{isAmharic ? 'Cash (ጥሬ ገንዘብ)' : 'Cash (ጥሬ ገንዘብ)'}</option>
                  {settings.preferCBE !== false && <option value="CBE">CBE (ንግድ ባንክ)</option>}
                  {settings.preferTelebirr !== false && <option value="Telebirr">Telebirr (ቴሌብር)</option>}
                  {settings.preferEBirr !== false && <option value="E-Birr">E-Birr (ኢ-ብር)</option>}
                  {settings.preferSinqee !== false && <option value="Sinqee Bank">Sinqee Bank (ሲንቄ ባንክ)</option>}
                  {settings.preferOther === true && <option value="Other">Other Wallet (ሌላ ክፍያ)</option>}
                  <option value="Bank">{isAmharic ? 'Bank Transfer (ባንክ)' : 'Bank Transfer (ባንክ)'}</option>
                </select>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed italic">
                {settlementRecord.type === 'receivable' 
                  ? (isAmharic 
                      ? '* ይህንን ክፍያ ማረጋገጥ በራስ-ሰር በገቢ ዝርዝር (Sales) ውስጥ እንዲመዘገብ ያደርጋል እንዲሁም የባንክ/የጥሬ ገንዘብ መጠንዎን ይጨምራል' 
                      : '* Confirming this payment will automatically record a Sale and increase your selected Cash / Bank balance.')
                  : (isAmharic 
                      ? '* ይህንን ክፍያ ማረጋገጥ በራስ-ሰር በወጪ ዝርዝር (Expenses) ውስጥ እንዲመዘገብ ያደርጋል እንዲሁም የባንክ/የጥሬ ገንዘብ መጠንዎን ይቀንሳል' 
                      : '* Confirming this payment will automatically log an Expense and deduct from your selected Cash / Bank balance.')
                }
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setSettlementRecord(null)}
                  className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmSettlement}
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition"
                  id="btn-confirm-settlement"
                >
                  {isAmharic ? 'አረጋግጥ (Confirm)' : 'Confirm Settlement'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
