import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { BusinessSettings } from '../types';

interface PublicHeaderProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function PublicHeader({ settings, setSettings }: PublicHeaderProps) {
  const location = useLocation();
  const isAmharic = settings.language === 'am';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setSettings(prev => ({
      ...prev,
      language: prev.language === 'am' ? 'en' : 'am'
    }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const navLinks = [
    { nameEn: 'Home', nameAm: 'መነሻ', path: '/' },
    { nameEn: 'Features', nameAm: 'ልዩ ባህሪያት', path: '/features' },
    { nameEn: 'About', nameAm: 'ስለ እኛ', path: '/about' },
    { nameEn: 'Contact', nameAm: 'ያግኙን', path: '/contact' },
    { nameEn: 'FAQ', nameAm: 'ጥያቄዎች', path: '/faq' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0B0F19]/80 border-b border-slate-200/50 dark:border-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Brand Block */}
        <Link to="/" className="flex items-center gap-3 select-none">
          <svg className="w-10 h-10 shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="header-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#16A34A" /> {/* Emerald Green */}
                <stop offset="100%" stopColor="#2563EB" /> {/* Royal Blue */}
              </linearGradient>
              <linearGradient id="header-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" /> {/* Gold */}
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="12" fill="url(#header-grad)" />
            <rect x="11" y="10" width="4" height="20" rx="1" fill="white" />
            <rect x="25" y="10" width="4" height="20" rx="1" fill="white" />
            <rect x="15" y="18" width="10" height="4" fill="white" />
            <circle cx="20" cy="20" r="4" fill="url(#header-gold)" />
          </svg>
          <div className="hidden sm:block">
            <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg block leading-tight font-sans">
              Habesha Tracker
            </span>
          </div>
        </Link>

        {/* Desktop Central Navigation Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-bold transition-colors ${
                  isActive 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                {isAmharic ? link.nameAm : link.nameEn}
              </Link>
            );
          })}
        </nav>

        {/* Quick SaaS Control Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition"
            title={isAmharic ? 'ገጽታ ቀይር' : 'Toggle Theme'}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Localized Language Switcher */}
          <button 
            onClick={toggleLanguage}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
            title="Switch Language / ቋንቋ ለመቀየር"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{isAmharic ? "English" : "አማርኛ"}</span>
            <span className="sm:hidden">{isAmharic ? "EN" : "አማ"}</span>
          </button>

          {/* Account CTA Group */}
          <Link 
            to="/login"
            className="inline-flex items-center text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition py-2 px-1.5 sm:px-3 shrink-0"
          >
            {isAmharic ? "ግባ" : "Login"}
          </Link>

          <Link 
            to="/signup"
            className="inline-flex items-center justify-center px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg sm:rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition duration-150 cursor-pointer border border-transparent shrink-0"
          >
            <span>{isAmharic ? "በነጻ ይጀምሩ" : "Get Started"}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 sm:ml-1.5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg md:hidden transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/50 dark:border-slate-900/60 bg-white dark:bg-[#0B0F19] px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {isAmharic ? link.nameAm : link.nameEn}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
