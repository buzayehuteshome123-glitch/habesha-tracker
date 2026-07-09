import React from 'react';
import { Link } from 'react-router-dom';
import { BusinessSettings } from '../types';

interface PublicFooterProps {
  settings: BusinessSettings;
}

export default function PublicFooter({ settings }: PublicFooterProps) {
  const isAmharic = settings.language === 'am';

  return (
    <footer className="bg-white dark:bg-[#080D1A] border-t border-slate-200/60 dark:border-slate-900/60 py-16 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Branding Column */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">H</div>
              <span className="font-bold text-slate-950 dark:text-white text-base">Habesha Tracker</span>
            </Link>
            <p className="text-[11px] leading-relaxed font-semibold">
              {isAmharic 
                ? "በኢትዮጵያ ውስጥ ያሉ የችርቻሮ ሱቆችን፣ አከፋፋዮችን፣ ጅምላ ነጋዴዎችን እና ላኪዎችን በዘመናዊ የሂሳብ አያያዝ ቴክኖሎጂ እናበቃለን።" 
                : "Empowering retailers, distributors, wholesalers, and grain exporters in Ethiopia with modern bookkeeping tools."}
            </p>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">
              {isAmharic ? "ድርጅት" : "Company"}
            </h4>
            <ul className="space-y-2 font-semibold">
              <li>
                <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isAmharic ? "ስለ እኛ" : "About Us"}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isAmharic ? "ያግኙን" : "Contact"}
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isAmharic ? "ልዩ ባህሪያት" : "Features"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">
              {isAmharic ? "ህጋዊ" : "Legal"}
            </h4>
            <ul className="space-y-2 font-semibold">
              <li>
                <Link to="/privacy-policy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isAmharic ? "የግል መረጃ ጥበቃ" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isAmharic ? "የአጠቃቀም ደንቦች" : "Terms of Service"}
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isAmharic ? "የገንዘብ ተመላሽ ፖሊሲ" : "Refund Policy"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">
              {isAmharic ? "እገዛ" : "Support"}
            </h4>
            <ul className="space-y-2 font-semibold">
              <li>
                <Link to="/faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isAmharic ? "ተደጋግመው የሚነሱ ጥያቄዎች" : "FAQ"}
                </Link>
              </li>
              <li>
                <a 
                  href="https://t.me/Manbuza12" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {isAmharic ? "የእገዛ ማዕከል" : "Help Center"}
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/Manbuza12" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bold text-emerald-600 dark:text-emerald-400"
                >
                  {isAmharic ? "ቴሌግራም ድጋፍ" : "Telegram Support"}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal Bar */}
        <div className="pt-8 border-t border-slate-200/50 dark:border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Habesha Tracker Cloud Systems. {isAmharic ? "መብቱ በህግ የተጠበቀ ነው።" : "All rights reserved."}</p>
          <div className="flex gap-4">
            <Link to="/terms-of-service" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              {isAmharic ? "የአጠቃቀም ደንቦች" : "Terms of Service"}
            </Link>
            <Link to="/privacy-policy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              {isAmharic ? "የግል መረጃ ጥበቃ" : "Privacy Policy"}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
