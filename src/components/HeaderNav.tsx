import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingDown, 
  DollarSign, 
  CheckSquare, 
  BarChart3, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  Bell, 
  Languages, 
  Sun, 
  Moon,
  Building2,
  LogOut
} from 'lucide-react';
import { ERPTab, AppNotification, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../sampleData';

interface HeaderNavProps {
  currentTab: ERPTab;
  setCurrentTab: (tab: ERPTab) => void;
  notifications: AppNotification[];
  clearNotifications: () => void;
  settings: BusinessSettings;
  setSettings: (settings: BusinessSettings) => void;
  onLogout?: () => void;
}

export default function HeaderNav({
  currentTab,
  setCurrentTab,
  notifications,
  clearNotifications,
  settings,
  setSettings,
  onLogout,
}: HeaderNavProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const t = TRANSLATIONS[settings.language];

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'sales', label: t.sales, icon: ShoppingCart },
    { id: 'expenses', label: t.expenses, icon: TrendingDown },
    { id: 'loans', label: t.loans, icon: DollarSign },
    { id: 'tasks', label: t.tasks, icon: CheckSquare },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ] as const;

  const toggleLanguage = () => {
    setSettings({
      ...settings,
      language: settings.language === 'en' ? 'am' : 'en',
    });
  };

  const toggleTheme = () => {
    setSettings({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light',
    });
  };

  return (
    <>
      {/* Mobile Top Navigation */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200 shadow-xs">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label="Open Sidebar"
          id="btn-mobile-menu-open"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" id="logo-svg-mobile">
            <defs>
              <linearGradient id="logo-grad-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="gold-grad-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="10" fill="url(#logo-grad-mobile)" />
            <rect x="11" y="10" width="5" height="20" rx="1.5" fill="white" />
            <rect x="24" y="10" width="5" height="20" rx="1.5" fill="white" />
            <rect x="15" y="18.5" width="10" height="3" fill="white" />
            <path d="M 16 20 L 20 16 L 24 20 L 20 24 Z" fill="url(#gold-grad-mobile)" />
          </svg>
          <span className="font-sans font-bold text-slate-800 dark:text-white tracking-tight">
            Habesha Tracker
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleLanguage}
            className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            id="btn-mobile-lang"
          >
            {settings.language === 'en' ? 'አማ' : 'EN'}
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            id="btn-mobile-theme"
          >
            {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Responsive Sidebar Backing for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#1e293b] text-slate-300 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <svg className="w-10 h-10 shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" id="logo-svg-sidebar">
              <defs>
                <linearGradient id="logo-grad-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="gold-grad-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="10" fill="url(#logo-grad-sidebar)" />
              <rect x="11" y="10" width="5" height="20" rx="1.5" fill="white" />
              <rect x="24" y="10" width="5" height="20" rx="1.5" fill="white" />
              <rect x="15" y="18.5" width="10" height="3" fill="white" />
              <path d="M 16 20 L 20 16 L 24 20 L 20 24 Z" fill="url(#gold-grad-sidebar)" />
            </svg>
            <div>
              <h1 className="text-white font-bold leading-tight tracking-tight text-base">
                Habesha Tracker
              </h1>
              <p className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest leading-none mt-1">
                ERP System v2.0
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            aria-label="Close Sidebar"
            id="btn-mobile-menu-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-150 group
                  ${isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                `}
                id={`sidebar-nav-${item.id}`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">
                {settings.businessName || 'Habesha SMB'}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-bold">
                Manager Profile
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors duration-150 border border-transparent hover:border-rose-500/20"
              id="btn-sidebar-logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{settings.language === 'am' ? 'ከአካውንት ውጣ (Logout)' : 'Log Out to Portal'}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Desktop Main Header */}
      <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            SYS DATE: {new Date().toISOString().slice(0, 10)}
          </span>
          <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            LOCALE: ETB (Br)
          </span>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition"
            id="btn-desktop-lang"
          >
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            {settings.language === 'en' ? 'አማርኛ (Amharic)' : 'English'}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition"
            id="btn-desktop-theme"
          >
            {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition relative"
              id="btn-desktop-notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden transform origin-top-right animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-sans">
                    Notifications ({notifications.length})
                  </h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      id="btn-clear-notifications"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <div className="flex items-start gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            notif.type === 'success' ? 'bg-emerald-500' :
                            notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                              {notif.text}
                            </p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block mt-1">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
