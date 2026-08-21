import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import HeaderNav from './components/HeaderNav';
import { supabase } from './lib/supabase';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Inventory = React.lazy(() => import('./components/Inventory'));
const SalesTracker = React.lazy(() => import('./components/SalesTracker'));
const Expenses = React.lazy(() => import('./components/Expenses'));
const LoansCredit = React.lazy(() => import('./components/LoansCredit'));
const PersonalTasks = React.lazy(() => import('./components/PersonalTasks'));
const Reports = React.lazy(() => import('./components/Reports'));
const Settings = React.lazy(() => import('./components/Settings'));
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const SignIn = React.lazy(() => import('./components/SignIn'));
const SignUp = React.lazy(() => import('./components/SignUp'));
const ProfileSetup = React.lazy(() => import('./components/ProfileSetup'));
const DatabaseSetupGuide = React.lazy(() => import('./components/DatabaseSetupGuide'));
const ResetPassword = React.lazy(() => import('./components/ResetPassword'));
const FeaturesPage = React.lazy(() => import('./components/FeaturesPage'));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const ContactPage = React.lazy(() => import('./components/ContactPage'));
const FAQPage = React.lazy(() => import('./components/FAQPage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('./components/TermsOfServicePage'));
const RefundPolicyPage = React.lazy(() => import('./components/RefundPolicyPage'));
const SpreadShareModal = React.lazy(() => import('./components/SpreadShareModal'));
const TelegramBotGuideModal = React.lazy(() => import('./components/TelegramBotGuideModal'));

import { 
  initTelegramMiniApp, 
  isTelegramMiniApp, 
  getTelegramUser, 
  getTelegramWebApp, 
  tgHaptics 
} from './utils/telegram';


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

const DEFAULT_SETTINGS: BusinessSettings = {
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
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export function AppContent() {
  // 1. Initial States without prefilled demo/sample data
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const cached = localStorage.getItem('ht_cached_settings_default');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  // Track database loading and user identification
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [setupRequired, setSetupRequired] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const dataLoadedUserIdRef = useRef<string | null>(null);

  // Helper to purge all local in-memory records to prevent cross-account data bleed
  const clearAllLocalState = useCallback(() => {
    dataLoadedUserIdRef.current = null;
    setProducts([]);
    setSales([]);
    setExpenses([]);
    setReceivables([]);
    setPayables([]);
    setTasks([]);
    setMemos([]);
    setGoals([]);
    setNotifications([]);
    setSetupRequired(false);
    setIsLoaded(false);
    setSecondaryLoaded(false);
    setDbLoading(false);
    setDbError(null);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Sync settings changes to local cache for instant reload capability
  useEffect(() => {
    try {
      localStorage.setItem('ht_cached_settings_default', JSON.stringify(settings));
      if (userId) {
        localStorage.setItem(`ht_cached_settings_${userId}`, JSON.stringify(settings));
      }
    } catch (e) {}
  }, [settings, userId]);

  // Robust local store cache per-user for instant load and offline resilience
  useEffect(() => {
    if (!isLoaded || isResetting || (userId && dataLoadedUserIdRef.current !== userId)) return;
    try {
      const activeKey = userId ? `ht_offline_store_${userId}` : 'ht_offline_store_guest';
      const store = {
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
      localStorage.setItem(activeKey, JSON.stringify(store));
    } catch (e) {}
  }, [products, sales, expenses, receivables, payables, tasks, memos, goals, settings, userId, isLoaded, isResetting]);

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
  const [isSpreadShareOpen, setIsSpreadShareOpen] = useState(false);
  const [isTelegramGuideOpen, setIsTelegramGuideOpen] = useState(false);
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

  // Dedicated Logout Handler that completely purges state and caches
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    clearAllLocalState();
    setUserId(null);
    setUserEmail('');
    setOfflineMode(false);
    setAuthScreen('landing');
    addToast(settings.language === 'am' ? 'በሰላም ወጥተዋል!' : 'Logged out successfully!', 'info');
    navigate('/');
  };

  // Erase All User Data / Start New Clean Slate Handler
  const handleEraseAllUserData = async (loadDemoSample = false) => {
    if (!userId) return;
    
    setIsResetting(true);
    try {
      if (!offlineMode) {
        // 1. Delete all user data from Supabase
        await Promise.all([
          supabase.from('products').delete().eq('userId', userId),
          supabase.from('sales').delete().eq('userId', userId),
          supabase.from('expenses').delete().eq('userId', userId),
          supabase.from('receivables').delete().eq('userId', userId),
          supabase.from('payables').delete().eq('userId', userId),
          supabase.from('tasks').delete().eq('userId', userId),
          supabase.from('memos').delete().eq('userId', userId),
          supabase.from('goals').delete().eq('userId', userId),
        ]);
      }

      // 2. Clear all local storage caches for this user
      localStorage.removeItem(`ht_offline_store_${userId}`);
      localStorage.removeItem(`ht_cached_settings_${userId}`);
      localStorage.removeItem(`habesha_tracker_preferred_accounts_${userId}`);

      if (loadDemoSample) {
        // Reload sample demo grains & coffee data
        const demoProducts = INITIAL_PRODUCTS.map(p => ({ ...p, id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
        const demoSales = INITIAL_SALES.map(s => ({ ...s, id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
        const demoExpenses = INITIAL_EXPENSES.map(e => ({ ...e, id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
        const demoReceivables = INITIAL_RECEIVABLES.map(r => ({ ...r, id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
        const demoPayables = INITIAL_PAYABLES.map(p => ({ ...p, id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
        const demoTasks = INITIAL_TASKS.map(t => ({ ...t, id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
        const demoMemos = INITIAL_MEMOS.map(m => ({ ...m, id: `memo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
        const demoGoals = INITIAL_GOALS.map(g => ({ ...g, id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));

        setProducts(demoProducts);
        setSales(demoSales);
        setExpenses(demoExpenses);
        setReceivables(demoReceivables);
        setPayables(demoPayables);
        setTasks(demoTasks);
        setMemos(demoMemos);
        setGoals(demoGoals);

        if (!offlineMode) {
          await Promise.all([
            supabase.from('products').upsert(demoProducts.map(p => ({ ...p, userId }))),
            supabase.from('sales').upsert(demoSales.map(s => ({ ...s, userId }))),
            supabase.from('expenses').upsert(demoExpenses.map(e => ({ ...e, userId }))),
            supabase.from('receivables').upsert(demoReceivables.map(r => ({ ...r, userId }))),
            supabase.from('payables').upsert(demoPayables.map(p => ({ ...p, userId }))),
            supabase.from('tasks').upsert(demoTasks.map(t => ({ ...t, userId }))),
            supabase.from('memos').upsert(demoMemos.map(m => ({ ...m, userId }))),
            supabase.from('goals').upsert(demoGoals.map(g => ({ ...g, userId }))),
          ]);
        }

        addToast(
          settings.language === 'am' 
            ? 'የናሙና መረጃዎች በተሳካ ሁኔታ ተጭነዋል!' 
            : 'Ethiopian demo sample data loaded successfully!', 
          'success'
        );
      } else {
        // Complete Wipe / Clean Slate
        setProducts([]);
        setSales([]);
        setExpenses([]);
        setReceivables([]);
        setPayables([]);
        setTasks([]);
        setMemos([]);
        setGoals([]);

        const cleanSettings: BusinessSettings = {
          ...settings,
          businessName: settings.businessName || 'My Habesha Business',
          bankAdjust: 0,
          cashAdjust: 0,
          startingCBE: 0,
          startingTelebirr: 0,
          startingEBirr: 0,
          startingSinqee: 0,
          startingOther: 0,
          startingCash: 0,
        };
        setSettings(cleanSettings);

        if (!offlineMode) {
          await supabase.from('business_settings').upsert({
            userId,
            businessName: cleanSettings.businessName,
            ownerName: cleanSettings.ownerName || '',
            address: cleanSettings.address || '',
            phone: cleanSettings.phone || '',
            email: cleanSettings.email || '',
            currency: cleanSettings.currency || 'ETB',
            language: cleanSettings.language || 'en',
            theme: cleanSettings.theme || 'dark',
            bankAdjust: 0,
            cashAdjust: 0,
            startingCBE: 0,
            startingTelebirr: 0,
            startingEBirr: 0,
            startingSinqee: 0,
            startingOther: 0,
            startingCash: 0,
          });
        }

        addToast(
          settings.language === 'am' 
            ? 'ሁሉም መረጃዎች በሙሉ ተሰርዘዋል! አዲስ ንጹህ ጅምር ዝግጁ ነው።' 
            : 'All user data erased successfully! Your workspace is fresh and clean.', 
          'success'
        );
      }
    } catch (err: any) {
      console.error('Error erasing user data:', err);
      addToast(
        settings.language === 'am' ? 'መረጃዎችን በማጥፋት ላይ ስህተት አጋጥሟል' : 'Error erasing data. Please try again.',
        'warning'
      );
    } finally {
      setIsResetting(false);
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
        clearAllLocalState();
        setUserId(null);
        setUserEmail('');
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
        clearAllLocalState();
        setUserId(null);
        setUserEmail('');
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
  }, [clearAllLocalState]);

  // Telegram Mini App (TMA) Lifecycle & Hardware BackButton integration
  useEffect(() => {
    const { isTMA, user: tgUser } = initTelegramMiniApp();
    if (isTMA) {
      // Auto-enter app if not authenticated yet so Telegram users have zero-friction instant access
      setOfflineMode(true);
      setUserId(tgUser ? `tg_${tgUser.id}` : 'tg_user');
      setAuthScreen('app');
      
      // Personalize business profile with Telegram user info if default
      if (tgUser?.first_name) {
        setSettings(prev => ({
          ...prev,
          ownerName: prev.ownerName || `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`,
          language: tgUser.language_code === 'am' ? 'am' : prev.language,
        }));
      }
    }
  }, []);

  // Telegram native BackButton state sync
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg || !tg.BackButton) return;

    const isSubView = (authScreen === 'app' && currentTab !== 'dashboard') || isSpreadShareOpen || isTelegramGuideOpen;
    
    if (isSubView) {
      tg.BackButton.show();
      const handleBack = () => {
        tgHaptics.impact('light');
        if (isTelegramGuideOpen) {
          setIsTelegramGuideOpen(false);
        } else if (isSpreadShareOpen) {
          setIsSpreadShareOpen(false);
        } else if (currentTab !== 'dashboard') {
          setCurrentTab('dashboard');
        }
      };
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
      };
    } else {
      tg.BackButton.hide();
    }
  }, [authScreen, currentTab, isSpreadShareOpen, isTelegramGuideOpen]);

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

  // Fetch all user data when authenticated user is set (SWR + Atomic Load)
  useEffect(() => {
    if (!userId) {
      dataLoadedUserIdRef.current = null;
      setIsLoaded(false);
      return;
    }

    const loadUserData = async () => {
      // 1. Check local offline cache first to populate immediately
      try {
        const activeKey = `ht_offline_store_${userId}`;
        const savedStoreRaw = localStorage.getItem(activeKey);
        if (savedStoreRaw) {
          const parsed = JSON.parse(savedStoreRaw);
          if (Array.isArray(parsed.products) && parsed.products.length > 0) setProducts(parsed.products);
          if (Array.isArray(parsed.sales) && parsed.sales.length > 0) setSales(parsed.sales);
          if (Array.isArray(parsed.expenses) && parsed.expenses.length > 0) setExpenses(parsed.expenses);
          if (Array.isArray(parsed.receivables) && parsed.receivables.length > 0) setReceivables(parsed.receivables);
          if (Array.isArray(parsed.payables) && parsed.payables.length > 0) setPayables(parsed.payables);
          if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) setTasks(parsed.tasks);
          if (Array.isArray(parsed.memos) && parsed.memos.length > 0) setMemos(parsed.memos);
          if (Array.isArray(parsed.goals) && parsed.goals.length > 0) setGoals(parsed.goals);
          if (parsed.settings) setSettings(parsed.settings);
        }
      } catch (e) {
        console.error('Error loading offline store:', e);
      }

      if (offlineMode) {
        dataLoadedUserIdRef.current = userId;
        setDbLoading(false);
        setIsLoaded(true);
        setSecondaryLoaded(true);
        setSetupRequired(false);
        setDbError(null);
        return;
      }

      // SWR (Stale-While-Revalidate) Cache retrieval for settings
      const cachedSettingsRaw = localStorage.getItem(`ht_cached_settings_${userId}`);
      if (cachedSettingsRaw) {
        try {
          const cachedSettings = JSON.parse(cachedSettingsRaw);
          setSettings(cachedSettings);
        } catch (e) {}
      }

      setDbLoading(true);
      setDbError(null);
      try {
        // Query all user tables atomically
        const [pRes, sRes, eRes, rRes, payRes, tRes, mRes, gRes, setRes] = await Promise.all([
          supabase.from('products').select('*').eq('userId', userId).limit(500),
          supabase.from('sales').select('*').eq('userId', userId).order('date', { ascending: false }).limit(500),
          supabase.from('expenses').select('*').eq('userId', userId).order('date', { ascending: false }).limit(500),
          supabase.from('receivables').select('*').eq('userId', userId).limit(500),
          supabase.from('payables').select('*').eq('userId', userId).limit(500),
          supabase.from('tasks').select('*').eq('userId', userId).limit(500),
          supabase.from('memos').select('*').eq('userId', userId).limit(500),
          supabase.from('goals').select('*').eq('userId', userId).limit(500),
          supabase.from('business_settings').select('*').eq('userId', userId).maybeSingle()
        ]);

        const errors = [pRes.error, sRes.error, eRes.error, rRes.error, payRes.error, tRes.error, mRes.error, gRes.error, setRes.error].filter(Boolean);
        const missingTableError = errors.find((e: any) => 
          e.code === '42P01' || 
          e.message?.includes('relation') || 
          e.message?.includes('schema cache') || 
          e.message?.includes('Could not find the table') ||
          (e.message?.includes('does not exist') && !e.message?.includes('column'))
        );

        if (missingTableError) {
          setDbError(missingTableError.message || 'Database tables are missing.');
          setSetupRequired(false);
          setDbLoading(false);
          setIsLoaded(true);
          return;
        }

        const hasAnyData = (pRes.data && pRes.data.length > 0) || 
                           (sRes.data && sRes.data.length > 0) || 
                           (eRes.data && eRes.data.length > 0) || 
                           setRes.data;

        if (!hasAnyData && !localStorage.getItem(`ht_offline_store_${userId}`)) {
          // Completely new account
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
          if (pRes.data) setProducts(pRes.data);
          if (sRes.data) setSales(sRes.data);
          if (eRes.data) setExpenses(eRes.data);
          if (rRes.data) setReceivables(rRes.data);
          if (payRes.data) setPayables(payRes.data);
          if (tRes.data) setTasks(tRes.data);
          if (mRes.data) setMemos(mRes.data);
          if (gRes.data) setGoals(gRes.data);

          if (setRes.data) {
            const dbSettings = setRes.data || {};
            const storageKey = `habesha_tracker_preferred_accounts_${userId}`;
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
            localStorage.setItem(`ht_cached_settings_${userId}`, JSON.stringify(mergedSettings));
          }
        }
        dataLoadedUserIdRef.current = userId;
        setSecondaryLoaded(true);
      } catch (err) {
        console.error('Error loading core data from Supabase:', err);
        dataLoadedUserIdRef.current = userId;
      } finally {
        setDbLoading(false);
        setIsLoaded(true);
      }
    };

    loadUserData();
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

  // Bank & Cash calculations (dynamic base ledger computed via useMemo to prevent redundant state re-renders)
  const bankBalance = useMemo(() => {
    let salesBank = 0;
    sales.forEach(s => {
      const pm = (s.paymentMethod || '').toLowerCase();
      if (!pm.includes('cash') && pm !== '') {
        salesBank += s.grossSale;
      }
    });

    let expensesBank = 0;
    expenses.forEach(e => {
      const pm = (e.paymentMethod || '').toLowerCase();
      if (!pm.includes('cash') && pm !== '') {
        expensesBank += e.amount;
      }
    });

    const bankAdjust = Number(settings.bankAdjust) || 0;
    const startingCBE = Number(settings.startingCBE) || 0;
    const startingTelebirr = Number(settings.startingTelebirr) || 0;
    const startingEBirr = Number(settings.startingEBirr) || 0;
    const startingSinqee = Number(settings.startingSinqee) || 0;
    const startingOther = Number(settings.startingOther) || 0;

    const totalStartingBank = 
      (settings.preferCBE !== false ? startingCBE : 0) +
      (settings.preferTelebirr !== false ? startingTelebirr : 0) +
      (settings.preferEBirr !== false ? startingEBirr : 0) +
      (settings.preferSinqee !== false ? startingSinqee : 0) +
      (settings.preferOther === true ? startingOther : 0);

    return totalStartingBank + salesBank - expensesBank + bankAdjust;
  }, [sales, expenses, settings]);

  const cashOnHand = useMemo(() => {
    let salesCash = 0;
    sales.forEach(s => {
      const pm = (s.paymentMethod || '').toLowerCase();
      if (pm.includes('cash') || pm === '') {
        salesCash += s.grossSale;
      }
    });

    let expensesCash = 0;
    expenses.forEach(e => {
      const pm = (e.paymentMethod || '').toLowerCase();
      if (pm.includes('cash') || pm === '') {
        expensesCash += e.amount;
      }
    });

    const cashAdjust = Number(settings.cashAdjust) || 0;
    const startingCash = Number(settings.startingCash) || 0;

    return startingCash + salesCash - expensesCash + cashAdjust;
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
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('products').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map((d: any) => d.id);
          const currentIds = products.map(c => c.id);
          const toDelete = dbIds.filter((id: string) => !currentIds.includes(id));
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
  }, [products, isLoaded, userId, offlineMode, isResetting]);

  useEffect(() => {
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('sales').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map((d: any) => d.id);
          const currentIds = sales.map(c => c.id);
          const toDelete = dbIds.filter((id: string) => !currentIds.includes(id));
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
  }, [sales, isLoaded, userId, offlineMode, isResetting]);

  useEffect(() => {
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('expenses').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map((d: any) => d.id);
          const currentIds = expenses.map(c => c.id);
          const toDelete = dbIds.filter((id: string) => !currentIds.includes(id));
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
  }, [expenses, isLoaded, userId, offlineMode, isResetting]);

  useEffect(() => {
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('receivables').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map((d: any) => d.id);
          const currentIds = receivables.map(c => c.id);
          const toDelete = dbIds.filter((id: string) => !currentIds.includes(id));
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
  }, [receivables, isLoaded, userId, offlineMode, isResetting]);

  useEffect(() => {
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('payables').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map((d: any) => d.id);
          const currentIds = payables.map(c => c.id);
          const toDelete = dbIds.filter((id: string) => !currentIds.includes(id));
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
  }, [payables, isLoaded, userId, offlineMode, isResetting]);

  useEffect(() => {
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('tasks').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map((d: any) => d.id);
          const currentIds = tasks.map(c => c.id);
          const toDelete = dbIds.filter((id: string) => !currentIds.includes(id));
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
  }, [tasks, isLoaded, userId, offlineMode, isResetting]);

  useEffect(() => {
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('memos').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map((d: any) => d.id);
          const currentIds = memos.map(c => c.id);
          const toDelete = dbIds.filter((id: string) => !currentIds.includes(id));
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
  }, [memos, isLoaded, userId, offlineMode, isResetting]);

  useEffect(() => {
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const { data: dbData } = await supabase.from('goals').select('id').eq('userId', userId);
        if (dbData) {
          const dbIds = dbData.map((d: any) => d.id);
          const currentIds = goals.map(c => c.id);
          const toDelete = dbIds.filter((id: string) => !currentIds.includes(id));
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
  }, [goals, isLoaded, userId, offlineMode, isResetting]);

  useEffect(() => {
    if (!isLoaded || !userId || dataLoadedUserIdRef.current !== userId || offlineMode || isResetting) return;
    const sync = async () => {
      try {
        const fullPayload: any = {
          userId,
          businessName: settings.businessName,
          ownerName: settings.ownerName,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          currency: settings.currency,
          language: settings.language,
          theme: settings.theme,
          bankAdjust: settings.bankAdjust || 0,
          cashAdjust: settings.cashAdjust || 0,
          preferCBE: settings.preferCBE,
          preferTelebirr: settings.preferTelebirr,
          preferEBirr: settings.preferEBirr,
          preferSinqee: settings.preferSinqee,
          preferOther: settings.preferOther,
          startingCBE: settings.startingCBE,
          startingTelebirr: settings.startingTelebirr,
          startingEBirr: settings.startingEBirr,
          startingSinqee: settings.startingSinqee,
          startingOther: settings.startingOther,
          startingCash: settings.startingCash
        };

        const { error } = await supabase.from('business_settings').upsert(fullPayload);

        if (error && (error.message?.includes('column') || error.message?.includes('does not exist') || error.code === '42703')) {
          // Fallback to core columns if database table does not yet have preference columns
          await supabase.from('business_settings').upsert({
            userId,
            businessName: settings.businessName,
            ownerName: settings.ownerName,
            address: settings.address,
            phone: settings.phone,
            email: settings.email,
            currency: settings.currency,
            language: settings.language,
            theme: settings.theme,
            bankAdjust: settings.bankAdjust || 0,
            cashAdjust: settings.cashAdjust || 0
          });
        }
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
  }, [settings, isLoaded, userId, offlineMode, isResetting]);

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

  const location = useLocation();
  const navigate = useNavigate();

  // Sync route path to currentTab when authenticated
  useEffect(() => {
    const path = location.pathname.substring(1); // strip leading slash
    const tabs = ['dashboard', 'inventory', 'sales', 'expenses', 'loans', 'tasks', 'reports', 'settings'];
    if (userId && tabs.includes(path)) {
      setCurrentTab(path);
    }
  }, [location.pathname, userId]);

  // Sync currentTab state to route path when authenticated
  useEffect(() => {
    if (userId) {
      const tabs = ['dashboard', 'inventory', 'sales', 'expenses', 'loans', 'tasks', 'reports', 'settings'];
      if (tabs.includes(currentTab)) {
        const path = `/${currentTab}`;
        if (location.pathname !== path) {
          navigate(path);
        }
      }
    }
  }, [currentTab, userId, navigate, location.pathname]);

  const PageSkeleton = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col space-y-6">
      <div className="max-w-7xl mx-auto w-full space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-24"></div>
        </div>
        <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"></div>
          <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"></div>
        </div>
      </div>
    </div>
  );

  function RequireAuth({ children }: { children: React.ReactNode }) {
    if (dbLoading && !isLoaded) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
          {/* Skeleton Sidebar */}
          <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-b lg:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse w-3/4"></div>
            <div className="space-y-4 pt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
          {/* Skeleton Body */}
          <div className="flex-1 p-6 sm:p-8 space-y-6">
            {/* Header row */}
            <div className="flex justify-between items-center">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse w-1/4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse w-32"></div>
            </div>
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-1/2"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse w-3/4"></div>
                </div>
              ))}
            </div>
            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-1/3 mb-6"></div>
                <div className="h-64 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
              </div>
              <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-1/2 mb-2"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-3/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!userId) {
      return <Navigate to="/login" replace />;
    }

    if (dbError && !offlineMode) {
      return (
        <DatabaseSetupGuide 
          errorMessage={dbError}
          onRefresh={async () => {
            setDbLoading(true);
            try {
              const [sRes, eRes, rRes, payRes, setRes] = await Promise.all([
                supabase.from('sales').select('id, items, customerName, paymentMethod, date, notes, grossSale, cost, profit').range(0, 100),
                supabase.from('expenses').select('id, name, category, amount, paymentMethod, date, description').range(0, 100),
                supabase.from('receivables').select('id, customer, phone, amount, dueDate, status').range(0, 100),
                supabase.from('payables').select('id, supplier, amount, dueDate, status').range(0, 100),
                supabase.from('business_settings').select('*').maybeSingle()
              ]);

              const errors = [sRes.error, eRes.error, rRes.error, payRes.error, setRes.error].filter(Boolean);
              const missingTableError = errors.find(e => 
                e.code === '42P01' || 
                e.message?.includes('relation') || 
                e.message?.includes('schema cache') || 
                e.message?.includes('Could not find the table') ||
                (e.message?.includes('does not exist') && !e.message?.includes('column'))
              );

              if (missingTableError) {
                setDbError(missingTableError.message || 'Database tables are missing.');
              } else {
                setDbError(null);
                if (!setRes.data) {
                  setSetupRequired(true);
                  setSales([]);
                  setExpenses([]);
                  setReceivables([]);
                  setPayables([]);
                } else {
                  setSetupRequired(false);
                  setSales(sRes.data || []);
                  setExpenses(eRes.data || []);
                  setReceivables(rRes.data || []);
                  setPayables(payRes.data || []);
                  const dbSettings = setRes.data || {};
                  const storageKey = `habesha_tracker_preferred_accounts_${userId}`;
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

    if (setupRequired) {
      return (
        <ProfileSetup 
          userId={userId || ''} 
          userEmail={userEmail}
          onComplete={(newSettings) => {
            setSettings(newSettings);
            setSetupRequired(false);
            addToast(newSettings.language === 'am' ? 'መገለጫዎ በተሳካ ሁኔታ ተዋቅሯል!' : 'Profile setup completed successfully!', 'success');
          }}
          onLogout={handleLogout}
        />
      );
    }

    return <>{children}</>;
  }

  function renderWorkspace(tab: any) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-150">
        
        {/* Sidebar navigation element */}
        <HeaderNav 
          currentTab={tab} 
          setCurrentTab={setCurrentTab} 
          notifications={notifications}
          clearNotifications={clearNotifications}
          settings={settings}
          setSettings={setSettings}
          onOpenSpreadShare={() => setIsSpreadShareOpen(true)}
          onOpenTelegramGuide={() => setIsTelegramGuideOpen(true)}
          onLogout={handleLogout}
        />
          
        {/* Scrollable workspace next to fixed sidebar */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto animate-in fade-in duration-200">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
            
            {tab === 'dashboard' && (
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

            {tab === 'inventory' && (
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

            {tab === 'sales' && (
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

            {tab === 'expenses' && (
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

            {tab === 'loans' && (
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

            {tab === 'tasks' && (
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

            {tab === 'reports' && (
              <Reports 
                products={products}
                sales={sales}
                expenses={expenses}
                receivables={receivables}
                payables={payables}
                settings={settings}
                addToast={addToast}
                onOpenSpreadShare={() => setIsSpreadShareOpen(true)}
              />
            )}

            {tab === 'settings' && (
              <Settings 
                settings={settings}
                setSettings={setSettings}
                onBackup={handleBackup}
                onRestore={handleRestore}
                addToast={addToast}
                onLogout={handleLogout}
                onEraseAllData={handleEraseAllUserData}
                itemCounts={{
                  products: products.length,
                  sales: sales.length,
                  expenses: expenses.length,
                  receivables: receivables.length,
                  payables: payables.length
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

        {/* Spread & Share Suite Modal */}
        <SpreadShareModal 
          isOpen={isSpreadShareOpen}
          onClose={() => setIsSpreadShareOpen(false)}
          products={products}
          sales={sales}
          expenses={expenses}
          receivables={receivables}
          payables={payables}
          settings={settings}
          addToast={addToast}
        />

        {/* Telegram Mini App Bot Guide Modal */}
        <TelegramBotGuideModal 
          isOpen={isTelegramGuideOpen}
          onClose={() => setIsTelegramGuideOpen(false)}
          language={settings.language}
          addToast={addToast}
        />
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
        {/* Public SaaS Pages */}
        <Route path="/" element={
          <LandingPage 
            onEnterApp={() => {
              setOfflineMode(true);
              setUserId('demo-offline-user');
              setAuthScreen('app');
              setCurrentTab('dashboard');
              navigate('/dashboard');
            }} 
            onLoginClick={() => {
              setSignupPrefillEmail('');
              setSignupSuccess(false);
              setAuthScreen('signin');
              navigate('/login');
            }}
            onSignUpClick={() => {
              setSignupPrefillEmail('');
              setSignupSuccess(false);
              setAuthScreen('signup');
              navigate('/signup');
            }}
            settings={settings} 
            setSettings={setSettings} 
          />
        } />
        <Route path="/features" element={<FeaturesPage settings={settings} setSettings={setSettings} />} />
        <Route path="/about" element={<AboutPage settings={settings} setSettings={setSettings} />} />
        <Route path="/contact" element={<ContactPage settings={settings} setSettings={setSettings} />} />
        <Route path="/faq" element={<FAQPage settings={settings} setSettings={setSettings} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage settings={settings} setSettings={setSettings} />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage settings={settings} setSettings={setSettings} />} />
        <Route path="/refund-policy" element={<RefundPolicyPage settings={settings} setSettings={setSettings} />} />

        {/* Auth Pages */}
        <Route path="/login" element={
          userId ? <Navigate to="/dashboard" replace /> : (
            <SignIn 
              onSuccess={() => {
                setSignupPrefillEmail('');
                setSignupSuccess(false);
                setAuthScreen('app');
                setCurrentTab('dashboard');
                navigate('/dashboard');
              }}
              onSwitchToSignUp={() => {
                setSignupPrefillEmail('');
                setSignupSuccess(false);
                setAuthScreen('signup');
                navigate('/signup');
              }}
              onBack={() => {
                setSignupPrefillEmail('');
                setSignupSuccess(false);
                setAuthScreen('landing');
                navigate('/');
              }}
              settings={settings}
              prefillEmail={signupPrefillEmail}
              showSuccess={signupSuccess}
            />
          )
        } />
        <Route path="/signup" element={
          userId ? <Navigate to="/dashboard" replace /> : (
            <SignUp 
              onSuccess={() => {
                setAuthScreen('app');
                setCurrentTab('dashboard');
                navigate('/dashboard');
              }}
              onSwitchToSignIn={(email, success) => {
                if (email) setSignupPrefillEmail(email);
                if (success !== undefined) setSignupSuccess(success);
                setAuthScreen('signin');
                navigate('/login');
              }}
              onBack={() => {
                setAuthScreen('landing');
                navigate('/');
              }}
              settings={settings}
            />
          )
        } />
        <Route path="/forgot-password" element={
          userId ? <Navigate to="/dashboard" replace /> : (
            <SignIn 
              onSuccess={() => {
                setSignupPrefillEmail('');
                setSignupSuccess(false);
                setAuthScreen('app');
                setCurrentTab('dashboard');
                navigate('/dashboard');
              }}
              onSwitchToSignUp={() => {
                setSignupPrefillEmail('');
                setSignupSuccess(false);
                setAuthScreen('signup');
                navigate('/signup');
              }}
              onBack={() => {
                setSignupPrefillEmail('');
                setSignupSuccess(false);
                setAuthScreen('landing');
                navigate('/');
              }}
              settings={settings}
              prefillEmail={signupPrefillEmail}
              showSuccess={signupSuccess}
            />
          )
        } />
        <Route path="/reset-password" element={
          <ResetPassword 
            onSuccess={() => {
              setAuthScreen('signin');
              navigate('/login');
            }}
            onBackToLogin={() => {
              setAuthScreen('signin');
              navigate('/login');
            }}
            settings={settings}
            addToast={addToast}
          />
        } />

        {/* Authenticated ERP Workspace Dashboard Pages */}
        <Route path="/dashboard" element={<RequireAuth>{renderWorkspace('dashboard')}</RequireAuth>} />
        <Route path="/inventory" element={<RequireAuth>{renderWorkspace('inventory')}</RequireAuth>} />
        <Route path="/sales" element={<RequireAuth>{renderWorkspace('sales')}</RequireAuth>} />
        <Route path="/expenses" element={<RequireAuth>{renderWorkspace('expenses')}</RequireAuth>} />
        <Route path="/loans" element={<RequireAuth>{renderWorkspace('loans')}</RequireAuth>} />
        <Route path="/tasks" element={<RequireAuth>{renderWorkspace('tasks')}</RequireAuth>} />
        <Route path="/reports" element={<RequireAuth>{renderWorkspace('reports')}</RequireAuth>} />
        <Route path="/settings" element={<RequireAuth>{renderWorkspace('settings')}</RequireAuth>} />

        {/* Fallback Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>

      {/* Global Modals */}
      <TelegramBotGuideModal 
        isOpen={isTelegramGuideOpen}
        onClose={() => setIsTelegramGuideOpen(false)}
        language={settings.language}
        addToast={addToast}
      />

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
    </>
  );
}
