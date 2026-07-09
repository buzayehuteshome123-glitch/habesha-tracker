import React, { useState, useEffect } from 'react';
import HeaderNav from './components/HeaderNav';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SalesTracker from './components/SalesTracker';
import Expenses from './components/Expenses';
import LoansCredit from './components/LoansCredit';
import PersonalTasks from './components/PersonalTasks';
import Reports from './components/Reports';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ProfileSetup from './components/ProfileSetup';
import DatabaseSetupGuide from './components/DatabaseSetupGuide';
import ResetPassword from './components/ResetPassword';
import { supabase } from './lib/supabase';

import { 
  Product, 
  Sale, 
  Expense, 
  Receivable, 
  Payable, 
  Task, 
  Memo, 
  DailyGoal, 
  BusinessSettings,
  AppNotification
} from './types';

import { 
  INITIAL_PRODUCTS, 
  INITIAL_SALES, 
  INITIAL_EXPENSES, 
  INITIAL_RECEIVABLES, 
  INITIAL_PAYABLES, 
  INITIAL_TASKS, 
  INITIAL_MEMOS, 
  INITIAL_GOALS, 
  TRANSLATIONS 
} from './sampleData';

interface Toast {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success';
}

export default function App() {
  // 1. Initial States without prefilled demo/sample data
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: 'My Habesha Business',
    address: 'Addis Ababa, Ethiopia',
    phone: '',
    email: '',
    currency: 'ETB',
    language: 'en',
    theme: 'dark',
    bankAdjust: 0,
    cashAdjust: 0,
    preferCBE: true,
    preferTelebirr: true,
    preferEBirr: true,
    preferSinqee: false,
    preferOther: false,
    startingCBE: 0,
    startingTelebirr: 0,
    startingEBirr: 0,
    startingSinqee: 0,
    startingOther: 0,
    startingCash: 0
  });

  // Track database loading and user identification
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [setupRequired, setSetupRequired] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  // Notifications bell array
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const initialNotif: AppNotification = {
      id: 'welcome-notif',
      text: 'HT ERP Suite initialized successfully. Ready for operations!',
      time: new Date().toLocaleTimeString(),
      type: 'info'
    };
    return [initialNotif];
  });

  const clearNotifications = () => setNotifications([]);

  // Navigation routing tab
  const [currentTab, setCurrentTab] = useState<any>('dashboard');
  const [authScreen, setAuthScreen] = useState<'landing' | 'signin' | 'signup' | 'app' | 'reset-password'>(() => {
    try {
      if (
        window.location.pathname === '/reset-password' || 
        window.location.hash.includes('type=recovery') || 
        window.location.search.includes('type=recovery') ||
        (window.location.hash.includes('access_token=') && window.location.hash.includes('type=recovery'))
      ) {
        return 'reset-password';
      }
    } catch (e) {
      // ignore
    }
    return 'landing';
  });
  const [signupPrefillEmail, setSignupPrefillEmail] = useState<string>('');
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);

  // Helper to seed a new user's Supabase database with sample data
  const seedDatabase = async (uid: string) => {
    try {
      const initialSettings = {
        userId: uid,
        businessName: 'Habesha Grains & Tech ERP',
        address: 'Merkato Ward 3, Addis Ababa, Ethiopia',
        phone: '+251 911 234567',
        email: 'contact@habeshagrains.et',
        currency: 'ETB',
        language: 'en',
        theme: 'dark',
        bankAdjust: 0,
        cashAdjust: 0
      };
      await supabase.from('business_settings').upsert(initialSettings);

      await Promise.all([
        supabase.from('products').upsert(INITIAL_PRODUCTS.map(p => ({ ...p, userId: uid }))),
        supabase.from('sales').upsert(INITIAL_SALES.map(s => ({ ...s, userId: uid }))),
        supabase.from('expenses').upsert(INITIAL_EXPENSES.map(e => ({ ...e, userId: uid }))),
        supabase.from('receivables').upsert(INITIAL_RECEIVABLES.map(r => ({ ...r, userId: uid }))),
        supabase.from('payables').upsert(INITIAL_PAYABLES.map(p => ({ ...p, userId: uid }))),
        supabase.from('tasks').upsert(INITIAL_TASKS.map(t => ({ ...t, userId: uid }))),
        supabase.from('memos').upsert(INITIAL_MEMOS.map(m => ({ ...m, userId: uid }))),
        supabase.from('goals').upsert(INITIAL_GOALS.map(g => ({ ...g, userId: uid })))
      ]);
    } catch (error) {
      console.error('Failed to seed database:', error);
    }
  };

  // Supabase Auth Session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isRecovery = window.location.pathname === '/reset-password' || 
                         window.location.hash.includes('type=recovery') || 
                         window.location.search.includes('type=recovery') ||
                         (window.location.hash.includes('access_token=') && window.location.hash.includes('type=recovery'));

      if (isRecovery) {
        setAuthScreen('reset-password');
        setOfflineMode(false);
      } else if (session) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        setAuthScreen('app');
        setOfflineMode(false);
      } else {
        setUserId(null);
        setUserEmail('');
        setSetupRequired(false);
        setAuthScreen(current => {
          if (current === 'signin' || current === 'signup' || current === 'reset-password') {
            return current;
          }
          return 'landing';
        });
        setOfflineMode(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthScreen('reset-password');
        setOfflineMode(false);
      } else if (session) {
        setAuthScreen(current => {
          if (current !== 'reset-password') {
            setUserId(session.user.id);
            setUserEmail(session.user.email || '');
            setOfflineMode(false);
            return 'app';
          }
          return current;
        });
      } else {
        setUserId(null);
        setUserEmail('');
        setSetupRequired(false);
        setOfflineMode(false);
        setAuthScreen(current => {
          if (current === 'app') {
            return 'landing';
          }
          return current;
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dynamic SEO Metatags & Indexability Control based on Auth Screen & App State
  useEffect(() => {
    const isAmharic = settings.language === 'am';
    let title = 'Habesha Tracker - All-in-One ERP & Finance Suite';
    let description = 'Optimized business management ERP for Ethiopian enterprises. Track sales, inventory, expenses, CBE bank records, telebirr transactions, and customer loans in English and Amharic.';
    let robots = 'index, follow';
    let canonical = 'https://habeshatracker.com';

    // Configure SEO values based on active screen
    if (authScreen === 'landing') {
      title = isAmharic 
        ? 'ሀበሻ ትራከር - ለኢትዮጵያ ንግዶች የተዘጋጀ የሂሳብና ንግድ ማስተዳደሪያ' 
        : 'Habesha Tracker - ERP & Financial Management for Ethiopian Businesses';
      description = isAmharic 
        ? 'የኢትዮጵያ ንግድዎን በሀበሻ ትራከር ያሳድጉ። ሽያጭን፣ ወጪን፣ ክምችትን፣ CBEን፣ ቴሌቢርን እና የብድር ግብይቶችን በእንግሊዝኛ እና በአማርኛ ይከታተሉ።' 
        : 'Optimize your Ethiopian business with Habesha Tracker. Track sales, expenses, inventory, telebirr, CBE, and credit transactions in English and Amharic.';
      robots = 'index, follow';
      canonical = 'https://habeshatracker.com/';
    } else if (authScreen === 'signin') {
      title = isAmharic ? 'ግባ - ሀበሻ ትራከር' : 'Login - Habesha Tracker';
      description = isAmharic 
        ? 'ሽያጮችን፣ ወጪዎችን፣ ክምችቶችን እና ብድሮችን ለመቆጣጠር ወደ ሀበሻ ትራከር አካውንትዎ ይግቡ።' 
        : 'Sign in to your Habesha Tracker account to manage your sales, expenses, inventory, and loans.';
      robots = 'index, follow';
      canonical = 'https://habeshatracker.com/login';
    } else if (authScreen === 'signup') {
      title = isAmharic ? 'ተመዝገብ - ሀበሻ ትራከር' : 'Sign Up - Habesha Tracker';
      description = isAmharic 
        ? 'ነፃ የሀበሻ ትራከር አካውንት ይፍጠሩ እና የንግድዎን የፋይናንስ እንቅስቃሴዎች መከታተል ይጀምሩ።' 
        : 'Create your free Habesha Tracker account and start tracking your business financial operations.';
      robots = 'index, follow';
      canonical = 'https://habeshatracker.com/signup';
    } else if (authScreen === 'reset-password') {
      title = isAmharic ? 'የይለፍ ቃል መቀየር - ሀበሻ ትራከር' : 'Reset Password - Habesha Tracker';
      description = isAmharic 
        ? 'ለሀበሻ ትራከር አካውንትዎ አዲስ አስተማማኝ የይለፍ ቃል ያስቀምጡ።' 
        : 'Set a new secure password for your Habesha Tracker account.';
      robots = 'noindex, nofollow'; // Security boundary: avoid indexing recovery token pages
      canonical = 'https://habeshatracker.com/reset-password';
    } else if (authScreen === 'app') {
      title = isAmharic ? 'ዳሽቦርድ - ሀበሻ ትራከር ERP' : 'Dashboard - Habesha Tracker ERP';
      description = 'Habesha Tracker authenticated merchant portal.';
      robots = 'noindex, nofollow'; // Privacy/Security boundary: strictly exclude authenticated business dashboard from crawling
      canonical = 'https://habeshatracker.com/dashboard';
    }

    // Apply SEO update to head elements dynamically
    document.title = title;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    const metaRobots = document.getElementById('meta-robots') || document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', robots);
    } else {
      const meta = document.createElement('meta');
      meta.id = 'meta-robots';
      meta.name = 'robots';
      meta.content = robots;
      document.head.appendChild(meta);
    }

    const linkCanonical = document.getElementById('meta-canonical') || document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
      linkCanonical.setAttribute('href', canonical);
    } else {
      const link = document.createElement('link');
      link.id = 'meta-canonical';
      link.rel = 'canonical';
      link.href = canonical;
      document.head.appendChild(link);
    }

    // Set og:url and og:title as well to keep them in perfect sync
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonical);

    // Update html lang attribute
    document.documentElement.lang = isAmharic ? 'am' : 'en';

  }, [authScreen, settings.language]);

  // Automatic inactivity logout mechanism (15 minutes default)
  useEffect(() => {
    if (!userId || offlineMode) return;

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
    let timeoutId: any;

    const handleInactivityLogout = async () => {
      import('./lib/logger').then(({ logger }) => {
        logger.warn('security', 'User session terminated automatically due to inactivity', { userId, userEmail });
      });
      
      addToast(
        settings.language === 'am'
          ? 'ለደህንነት ሲባል ምንም እንቅስቃሴ ባለመኖሩ ምክንያት አካውንትዎ በራስ-ሰር ወጥቷል።'
          : 'Your session has been automatically logged out due to inactivity for security reasons.',
        'warning'
      );
      
      await supabase.auth.signOut();
    };

    const resetInactivityTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivityLogout, INACTIVITY_TIMEOUT);
    };

    // Events to watch for activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Start initial timer
    resetInactivityTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [userId, settings.language, userEmail]);

  // Fetch all user data when authenticated user is set
  useEffect(() => {
    if (!userId) {
      setIsLoaded(false);
      return;
    }

    const loadAllUserData = async () => {
      if (offlineMode) {
        setDbLoading(false);
        setIsLoaded(true);
        setSetupRequired(false);
        setDbError(null);
        return;
      }
      setDbLoading(true);
      setDbError(null);
      try {
        const [pRes, sRes, eRes, rRes, payRes, tRes, mRes, gRes, setRes] = await Promise.all([
          supabase.from('products').select('*').eq('userId', userId),
          supabase.from('sales').select('*').eq('userId', userId),
          supabase.from('expenses').select('*').eq('userId', userId),
          supabase.from('receivables').select('*').eq('userId', userId),
          supabase.from('payables').select('*').eq('userId', userId),
          supabase.from('tasks').select('*').eq('userId', userId),
          supabase.from('memos').select('*').eq('userId', userId),
          supabase.from('goals').select('*').eq('userId', userId),
          supabase.from('business_settings').select('*').eq('userId', userId).maybeSingle()
        ]);

        const errors = [pRes.error, sRes.error, eRes.error, rRes.error, payRes.error, tRes.error, mRes.error, gRes.error, setRes.error].filter(Boolean);
        const missingTableError = errors.find(e => 
          e.code === '42P01' || 
          e.message?.includes('relation') || 
          e.message?.includes('schema cache') || 
          e.message?.includes('Could not find the table') ||
          e.message?.includes('does not exist')
        );

        if (missingTableError) {
          setDbError(missingTableError.message || 'Database tables are missing.');
          setSetupRequired(false);
          setDbLoading(false);
          setIsLoaded(true);
          return;
        }

        if (!setRes.data) {
          // New user setup required - do not seed any demo data
          setSetupRequired(true);
          setProducts([]);
          setSales([]);
          setExpenses([]);
          setReceivables([]);
          setPayables([]);
          setTasks([]);
          setMemos([]);
          setGoals([]);
        } else {
          setSetupRequired(false);
          setProducts(pRes.data || []);
          setSales(sRes.data || []);
          setExpenses(eRes.data || []);
          setReceivables(rRes.data || []);
          setPayables(payRes.data || []);
          setTasks(tRes.data || []);
          setMemos(mRes.data || []);
          setGoals(gRes.data || []);
          const dbSettings = setRes.data || {};
          const storageKey = userId 
            ? `habesha_tracker_preferred_accounts_${userId}` 
            : 'habesha_tracker_preferred_accounts_default';
          const localPrefsRaw = localStorage.getItem(storageKey);
          let mergedSettings = { ...dbSettings };
          if (localPrefsRaw) {
            try {
              const localPrefs = JSON.parse(localPrefsRaw);
              mergedSettings = { ...mergedSettings, ...localPrefs };
            } catch (e) {
              console.error('Error parsing local storage preferences', e);
            }
          }
          setSettings(mergedSettings as any);
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
        addToast('Error synchronizing with Supabase database. Operating in local mode.', 'warning');
      } finally {
        setDbLoading(false);
        setIsLoaded(true);
      }
    };

    loadAllUserData();
  }, [userId, offlineMode]);

  // QuickAction bridge
  const [quickActionState, setQuickActionState] = useState<{ type: string; itemId?: string } | null>(null);

  // Custom Toast notification state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Bank modal state
  const [bankModalState, setBankModalState] = useState<{ isOpen: boolean; type: 'deposit' | 'withdraw' }>({ isOpen: false, type: 'deposit' });
  const [bankModalAmount, setBankModalAmount] = useState('');

  // Confirmation warning dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleBankModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(bankModalAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast(settings.language === 'am' ? 'እባክዎ ትክክለኛ የብር መጠን ያስገቡ' : 'Invalid numerical amount.', 'warning');
      return;
    }

    if (bankModalState.type === 'deposit') {
      if (amt > cashOnHand) {
        addToast(settings.language === 'am' ? 'በእጅዎ ላይ በቂ ጥሬ ገንዘብ የለም!' : 'Insufficient cash on hand!', 'warning');
      } else {
        adjustBalances(amt, -amt);
        addToast(
          settings.language === 'am' 
            ? `${amt} ብር በእጅ ላይ ተነስቶ ባንክ ገብቷል!` 
            : `Deposited ${amt} ETB from Cash into Bank.`, 
          'success'
        );
        setBankModalState({ isOpen: false, type: 'deposit' });
        setBankModalAmount('');
      }
    } else {
      if (amt > bankBalance) {
        addToast(settings.language === 'am' ? 'በባንክዎ በቂ ገንዘብ የለም!' : 'Insufficient bank balance!', 'warning');
      } else {
        adjustBalances(-amt, amt);
        addToast(
          settings.language === 'am' 
            ? `${amt} ብር ከባንክ ተነስቶ በእጅ ላይ ገብቷል!` 
            : `Withdrew ${amt} ETB from Bank to Cash.`, 
          'success'
        );
        setBankModalState({ isOpen: false, type: 'withdraw' });
        setBankModalAmount('');
      }
    }
  };

  // Bank & Cash calculations (dynamic base ledger)
  const [bankBalance, setBankBalance] = useState(0);
  const [cashOnHand, setCashOnHand] = useState(0);

  // Synchronize dynamic balances on any transactions ledger change
  useEffect(() => {
    let salesBank = 0;
    let salesCash = 0;
    sales.forEach(s => {
      if (s.paymentMethod === 'Cash') {
        salesCash += s.grossSale;
      } else {
        salesBank += s.grossSale;
      }
    });

    let expensesBank = 0;
    let expensesCash = 0;
    expenses.forEach(e => {
      if (e.paymentMethod === 'Cash') {
        expensesCash += e.amount;
      } else {
        expensesBank += e.amount;
      }
    });

    const bankAdjust = settings.bankAdjust || 0;
    const cashAdjust = settings.cashAdjust || 0;

    const startingCBE = settings.startingCBE ?? 0;
    const startingTelebirr = settings.startingTelebirr ?? 0;
    const startingEBirr = settings.startingEBirr ?? 0;
    const startingSinqee = settings.startingSinqee ?? 0;
    const startingOther = settings.startingOther ?? 0;
    const startingCash = settings.startingCash ?? 0;

    const totalStartingBank = 
      (settings.preferCBE ? startingCBE : 0) +
      (settings.preferTelebirr ? startingTelebirr : 0) +
      (settings.preferEBirr ? startingEBirr : 0) +
      (settings.preferSinqee ? startingSinqee : 0) +
      (settings.preferOther ? startingOther : 0);

    setBankBalance(totalStartingBank + salesBank - expensesBank + bankAdjust);
    setCashOnHand(startingCash + salesCash - expensesCash + cashAdjust);
  }, [sales, expenses, settings]);

  // Handle bank/cash adjustments (manual transfers)
  const adjustBalances = (bankAmt: number, cashAmt: number) => {
    setSettings(prev => ({
      ...prev,
      bankAdjust: (prev.bankAdjust || 0) + bankAmt,
      cashAdjust: (prev.cashAdjust || 0) + cashAmt
    }));
  };

  // Synchronize lists to Supabase
  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('products').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map(d => d.id);
          const currentIds = products.map(c => c.id);
          const toDelete = dbIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('products').delete().in('id', toDelete);
          }
        }
        if (products.length > 0) {
          await supabase.from('products').upsert(
            products.map(p => ({
              id: p.id,
              userId,
              nameEn: p.nameEn,
              nameAm: p.nameAm,
              category: p.category,
              sku: p.sku,
              unit: p.unit,
              purchasePrice: p.purchasePrice,
              sellingPrice: p.sellingPrice,
              currentStock: p.currentStock,
              minStock: p.minStock,
              supplier: p.supplier,
              description: p.description
            }))
          );
        }
      } catch (err) {
        console.error('Failed to sync products:', err);
      }
    };
    sync();

    // Proactively generate notifications for low stock alert
    const criticalStock = products.filter(p => p.currentStock === 0);
    if (criticalStock.length > 0) {
      const exists = notifications.some(n => n.id === 'low-stock-alert');
      if (!exists) {
        setNotifications(prev => [
          {
            id: 'low-stock-alert',
            text: `Critical Warning: ${criticalStock.length} items are out of stock!`,
            time: new Date().toLocaleTimeString(),
            type: 'warning'
          },
          ...prev
        ]);
      }
    }
  }, [products]);

  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('sales').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map(d => d.id);
          const currentIds = sales.map(c => c.id);
          const toDelete = dbIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('sales').delete().in('id', toDelete);
          }
        }
        if (sales.length > 0) {
          await supabase.from('sales').upsert(
            sales.map(s => ({
              id: s.id,
              userId,
              customerName: s.customerName,
              paymentMethod: s.paymentMethod,
              date: s.date,
              notes: s.notes,
              grossSale: s.grossSale,
              cost: s.cost,
              profit: s.profit,
              items: s.items
            }))
          );
        }
      } catch (err) {
        console.error('Failed to sync sales:', err);
      }
    };
    sync();
  }, [sales]);

  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('expenses').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map(d => d.id);
          const currentIds = expenses.map(c => c.id);
          const toDelete = dbIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('expenses').delete().in('id', toDelete);
          }
        }
        if (expenses.length > 0) {
          await supabase.from('expenses').upsert(
            expenses.map(e => ({
              id: e.id,
              userId,
              name: e.name,
              category: e.category,
              amount: e.amount,
              paymentMethod: e.paymentMethod,
              date: e.date,
              description: e.description
            }))
          );
        }
      } catch (err) {
        console.error('Failed to sync expenses:', err);
      }
    };
    sync();
  }, [expenses]);

  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('receivables').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map(d => d.id);
          const currentIds = receivables.map(c => c.id);
          const toDelete = dbIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('receivables').delete().in('id', toDelete);
          }
        }
        if (receivables.length > 0) {
          await supabase.from('receivables').upsert(
            receivables.map(r => ({
              id: r.id,
              userId,
              customer: r.customer,
              phone: r.phone,
              amount: r.amount,
              dueDate: r.dueDate,
              status: r.status
            }))
          );
        }
      } catch (err) {
        console.error('Failed to sync receivables:', err);
      }
    };
    sync();
  }, [receivables]);

  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('payables').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map(d => d.id);
          const currentIds = payables.map(c => c.id);
          const toDelete = dbIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('payables').delete().in('id', toDelete);
          }
        }
        if (payables.length > 0) {
          await supabase.from('payables').upsert(
            payables.map(p => ({
              id: p.id,
              userId,
              supplier: p.supplier,
              amount: p.amount,
              dueDate: p.dueDate,
              status: p.status
            }))
          );
        }
      } catch (err) {
        console.error('Failed to sync payables:', err);
      }
    };
    sync();
  }, [payables]);

  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('tasks').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map(d => d.id);
          const currentIds = tasks.map(c => c.id);
          const toDelete = dbIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('tasks').delete().in('id', toDelete);
          }
        }
        if (tasks.length > 0) {
          await supabase.from('tasks').upsert(
            tasks.map(t => ({
              id: t.id,
              userId,
              text: t.text,
              completed: t.completed
            }))
          );
        }
      } catch (err) {
        console.error('Failed to sync tasks:', err);
      }
    };
    sync();
  }, [tasks]);

  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('memos').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map(d => d.id);
          const currentIds = memos.map(c => c.id);
          const toDelete = dbIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('memos').delete().in('id', toDelete);
          }
        }
        if (memos.length > 0) {
          await supabase.from('memos').upsert(
            memos.map(m => ({
              id: m.id,
              userId,
              title: m.title,
              content: m.content,
              isPinned: m.isPinned,
              date: m.date
            }))
          );
        }
      } catch (err) {
        console.error('Failed to sync memos:', err);
      }
    };
    sync();
  }, [memos]);

  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('goals').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map(d => d.id);
          const currentIds = goals.map(c => c.id);
          const toDelete = dbIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('goals').delete().in('id', toDelete);
          }
        }
        if (goals.length > 0) {
          await supabase.from('goals').upsert(
            goals.map(g => ({
              id: g.id,
              userId,
              text: g.text,
              completed: g.completed
            }))
          );
        }
      } catch (err) {
        console.error('Failed to sync goals:', err);
      }
    };
    sync();
  }, [goals]);

  useEffect(() => {
    if (!isLoaded || !userId || offlineMode) return;
    const sync = async () => {
      try {
        await supabase.from('business_settings').upsert({
          userId,
          businessName: settings.businessName,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          currency: settings.currency,
          language: settings.language,
          theme: settings.theme,
          bankAdjust: settings.bankAdjust || 0,
          cashAdjust: settings.cashAdjust || 0
        });
      } catch (err) {
        console.error('Failed to sync settings:', err);
      }
    };
    sync();

    // Manage dark vs light stylesheet class
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  // Toast adder helper
  const addToast = (text: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, text, type }]);
    
    // Add same log to real-time notifications bell
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        text,
        time: new Date().toLocaleTimeString(),
        type: type === 'info' ? 'info' : type === 'warning' ? 'warning' : 'success'
      },
      ...prev
    ]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Quick Action Routing Manager
  const handleQuickAction = (action: string) => {
    if (action === 'recordSale') {
      setCurrentTab('sales');
      setQuickActionState({ type: 'recordSale' });
    } else if (action === 'restock') {
      setCurrentTab('inventory');
      setQuickActionState({ type: 'restock' });
    } else if (action === 'recordExpense') {
      setCurrentTab('expenses');
      setQuickActionState({ type: 'recordExpense' });
    } else if (action === 'addProduct') {
      setCurrentTab('inventory');
      setQuickActionState({ type: 'addProduct' });
    } else if (action === 'deposit') {
      setBankModalState({ isOpen: true, type: 'deposit' });
      setBankModalAmount('');
    } else if (action === 'withdraw') {
      setBankModalState({ isOpen: true, type: 'withdraw' });
      setBankModalAmount('');
    }
  };

  // Backups and restoration
  const handleBackup = () => {
    const fullState = {
      products,
      sales,
      expenses,
      receivables,
      payables,
      tasks,
      memos,
      goals,
      settings
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullState, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `habesha_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    addToast('Backup JSON spreadsheet generated successfully!', 'success');
  };

  const handleRestore = (dataStr: string) => {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.sales) setSales(parsed.sales);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.receivables) setReceivables(parsed.receivables);
      if (parsed.payables) setPayables(parsed.payables);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.memos) setMemos(parsed.memos);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.settings) setSettings(parsed.settings);
    } catch (err) {
      throw new Error('Malformed backup object');
    }
  };

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">
            {settings.language === 'am' ? 'ከሱፓቤዝ ዳታቤዝ ጋር በመገናኘት ላይ...' : 'Connecting to Supabase Database...'}
          </p>
        </div>
      </div>
    );
  }

  if (authScreen === 'landing') {
    return (
      <LandingPage 
        onEnterApp={() => {
          setOfflineMode(true);
          setUserId('demo-offline-user');
          setAuthScreen('app');
          setCurrentTab('dashboard');
        }} 
        onLoginClick={() => {
          setSignupPrefillEmail('');
          setSignupSuccess(false);
          setAuthScreen('signin');
        }}
        onSignUpClick={() => {
          setSignupPrefillEmail('');
          setSignupSuccess(false);
          setAuthScreen('signup');
        }}
        settings={settings} 
        setSettings={setSettings} 
      />
    );
  }

  if (authScreen === 'signin') {
    return (
      <SignIn 
        onSuccess={() => {
          setSignupPrefillEmail('');
          setSignupSuccess(false);
          setAuthScreen('app');
          setCurrentTab('dashboard');
        }}
        onSwitchToSignUp={() => {
          setSignupPrefillEmail('');
          setSignupSuccess(false);
          setAuthScreen('signup');
        }}
        onBack={() => {
          setSignupPrefillEmail('');
          setSignupSuccess(false);
          setAuthScreen('landing');
        }}
        settings={settings}
        prefillEmail={signupPrefillEmail}
        showSuccess={signupSuccess}
      />
    );
  }

  if (authScreen === 'signup') {
    return (
      <SignUp 
        onSuccess={() => {
          setAuthScreen('app');
          setCurrentTab('dashboard');
        }}
        onSwitchToSignIn={(email, success) => {
          if (email) setSignupPrefillEmail(email);
          if (success !== undefined) setSignupSuccess(success);
          setAuthScreen('signin');
        }}
        onBack={() => setAuthScreen('landing')}
        settings={settings}
      />
    );
  }

  if (authScreen === 'reset-password') {
    return (
      <ResetPassword 
        onSuccess={() => {
          setAuthScreen('signin');
        }}
        onBackToLogin={() => {
          setAuthScreen('signin');
        }}
        settings={settings}
        addToast={addToast}
      />
    );
  }

  if (authScreen === 'app' && dbError && !offlineMode) {
    return (
      <DatabaseSetupGuide 
        errorMessage={dbError}
        onRefresh={async () => {
          setDbLoading(true);
          try {
            const [pRes, sRes, eRes, rRes, payRes, tRes, mRes, gRes, setRes] = await Promise.all([
              supabase.from('products').select('*'),
              supabase.from('sales').select('*'),
              supabase.from('expenses').select('*'),
              supabase.from('receivables').select('*'),
              supabase.from('payables').select('*'),
              supabase.from('tasks').select('*'),
              supabase.from('memos').select('*'),
              supabase.from('goals').select('*'),
              supabase.from('business_settings').select('*').maybeSingle()
            ]);

            const errors = [pRes.error, sRes.error, eRes.error, rRes.error, payRes.error, tRes.error, mRes.error, gRes.error, setRes.error].filter(Boolean);
            const missingTableError = errors.find(e => 
              e.code === '42P01' || 
              e.message?.includes('relation') || 
              e.message?.includes('schema cache') || 
              e.message?.includes('Could not find the table') ||
              e.message?.includes('does not exist')
            );

            if (missingTableError) {
              setDbError(missingTableError.message || 'Database tables are missing.');
            } else {
              setDbError(null);
              if (!setRes.data) {
                setSetupRequired(true);
                setProducts([]);
                setSales([]);
                setExpenses([]);
                setReceivables([]);
                setPayables([]);
                setTasks([]);
                setMemos([]);
                setGoals([]);
              } else {
                setSetupRequired(false);
                setProducts(pRes.data || []);
                setSales(sRes.data || []);
                setExpenses(eRes.data || []);
                setReceivables(rRes.data || []);
                setPayables(payRes.data || []);
                setTasks(tRes.data || []);
                setMemos(mRes.data || []);
                setGoals(gRes.data || []);
                const dbSettings = setRes.data || {};
                const storageKey = userId 
                  ? `habesha_tracker_preferred_accounts_${userId}` 
                  : 'habesha_tracker_preferred_accounts_default';
                const localPrefsRaw = localStorage.getItem(storageKey);
                let mergedSettings = { ...dbSettings };
                if (localPrefsRaw) {
                  try {
                    const localPrefs = JSON.parse(localPrefsRaw);
                    mergedSettings = { ...mergedSettings, ...localPrefs };
                  } catch (e) {
                    console.error('Error parsing local storage preferences', e);
                  }
                }
                setSettings(mergedSettings as any);
              }
            }
          } catch (err) {
            console.error('Refresh error:', err);
          } finally {
            setDbLoading(false);
            setIsLoaded(true);
          }
        }}
        onContinueOffline={() => {
          setOfflineMode(true);
          setDbError(null);
        }}
      />
    );
  }

  if (authScreen === 'app' && setupRequired) {
    return (
      <ProfileSetup 
        userId={userId || ''} 
        userEmail={userEmail}
        onComplete={(newSettings) => {
          setSettings(newSettings);
          setSetupRequired(false);
          addToast(newSettings.language === 'am' ? 'መገለጫዎ በተሳካ ሁኔታ ተዋቅሯል!' : 'Profile setup completed successfully!', 'success');
        }}
        onLogout={async () => {
          await supabase.auth.signOut();
          setAuthScreen('landing');
          setSetupRequired(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-150">
      
      {/* Sidebar navigation element */}
      <HeaderNav 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        notifications={notifications}
        clearNotifications={clearNotifications}
        settings={settings}
        setSettings={setSettings}
        onLogout={async () => {
          await supabase.auth.signOut();
          setAuthScreen('landing');
          addToast(settings.language === 'am' ? 'በሰላም ወጥተዋል!' : 'Logged out successfully!', 'info');
        }}
      />
        
      {/* Scrollable workspace next to fixed sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          
          {currentTab === 'dashboard' && (
            <Dashboard 
              products={products}
              sales={sales}
              expenses={expenses}
              receivables={receivables}
              payables={payables}
              bankBalance={bankBalance}
              cashOnHand={cashOnHand}
              settings={settings}
              setCurrentTab={setCurrentTab}
              onQuickAction={handleQuickAction}
              setSettings={setSettings}
            />
          )}

          {currentTab === 'inventory' && (
            <Inventory 
              products={products}
              setProducts={setProducts}
              setPayables={setPayables}
              settings={settings}
              addToast={addToast}
              quickActionState={quickActionState}
              setQuickActionState={setQuickActionState}
              showConfirm={showConfirm}
            />
          )}

          {currentTab === 'sales' && (
            <SalesTracker 
              products={products}
              setProducts={setProducts}
              sales={sales}
              setSales={setSales}
              setReceivables={setReceivables}
              settings={settings}
              addToast={addToast}
              quickActionState={quickActionState}
              setQuickActionState={setQuickActionState}
              showConfirm={showConfirm}
            />
          )}

          {currentTab === 'expenses' && (
            <Expenses 
              expenses={expenses}
              setExpenses={setExpenses}
              settings={settings}
              addToast={addToast}
              quickActionState={quickActionState}
              setQuickActionState={setQuickActionState}
              showConfirm={showConfirm}
            />
          )}

          {currentTab === 'loans' && (
            <LoansCredit 
              receivables={receivables}
              setReceivables={setReceivables}
              payables={payables}
              setPayables={setPayables}
              settings={settings}
              addToast={addToast}
              showConfirm={showConfirm}
              sales={sales}
              setSales={setSales}
              expenses={expenses}
              setExpenses={setExpenses}
            />
          )}

          {currentTab === 'tasks' && (
            <PersonalTasks 
              tasks={tasks}
              setTasks={setTasks}
              memos={memos}
              setMemos={setMemos}
              goals={goals}
              setGoals={setGoals}
              settings={settings}
              addToast={addToast}
              showConfirm={showConfirm}
            />
          )}

          {currentTab === 'reports' && (
            <Reports 
              products={products}
              sales={sales}
              expenses={expenses}
              receivables={receivables}
              payables={payables}
              settings={settings}
              addToast={addToast}
            />
          )}

          {currentTab === 'settings' && (
            <Settings 
              settings={settings}
              setSettings={setSettings}
              onBackup={handleBackup}
              onRestore={handleRestore}
              addToast={addToast}
              onLogout={async () => {
                await supabase.auth.signOut();
                setAuthScreen('landing');
                addToast(settings.language === 'am' ? 'በሰላም ወጥተዋል!' : 'Logged out successfully!', 'info');
              }}
            />
          )}

        </main>
      </div>

      {/* Custom Confirmation Dialog */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              ⚠️ {confirmModal.title}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {settings.language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 transition"
              >
                {settings.language === 'am' ? 'አረጋግጥ' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Deposit / Withdrawal Bank Dialog */}
      {bankModalState.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleBankModalSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              🏛️ {bankModalState.type === 'deposit' 
                ? (settings.language === 'am' ? 'ወደ ባንክ ማስገቢያ (Deposit)' : 'Deposit to Bank')
                : (settings.language === 'am' ? 'ከባንክ ማውጫ (Withdraw)' : 'Withdraw from Bank')
              }
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {bankModalState.type === 'deposit'
                ? (settings.language === 'am' 
                    ? `ከእጅ ጥሬ ገንዘብ ወደ CBE / Awash / Telebirr ባንክ ያስገቡ።` 
                    : `Transfer cash on hand to your Bank ledger.`)
                : (settings.language === 'am'
                    ? `ከባንክ ወደ እጅ ጥሬ ገንዘብ ያውጡ።`
                    : `Withdraw funds from Bank ledger into Cash on hand.`)
              }
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex justify-between text-xs font-semibold">
              <div>
                <p className="text-slate-400 text-[10px] uppercase">{settings.language === 'am' ? 'በእጅ ያለ ጥሬ ገንዘብ' : 'Cash On Hand'}</p>
                <p className="text-slate-800 dark:text-slate-200 mt-1 font-mono">{cashOnHand.toLocaleString()} {settings.currency}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase">{settings.language === 'am' ? 'የባንክ ሒሳብ' : 'Bank Balance'}</p>
                <p className="text-slate-800 dark:text-slate-200 mt-1 font-mono">{bankBalance.toLocaleString()} {settings.currency}</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {settings.language === 'am' ? 'የብር መጠን' : 'Amount (ETB)'}
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 5000"
                value={bankModalAmount}
                onChange={(e) => setBankModalAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBankModalState(prev => ({ ...prev, isOpen: false }));
                  setBankModalAmount('');
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {settings.language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition"
              >
                {settings.language === 'am' ? 'አረጋግጥ' : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating sliding notification custom Toasts drawer */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border pointer-events-auto transition-all animate-in slide-in-from-right duration-200 ${
              toast.type === 'success' 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/10' 
                : toast.type === 'warning'
                ? 'bg-amber-500 border-amber-400 text-white shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-white shadow-slate-950/20'
            }`}
            id={`toast-msg-${toast.id}`}
          >
            {toast.type === 'success' && '✓'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
