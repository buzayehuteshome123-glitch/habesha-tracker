import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Coins, 
  Languages, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  LogOut
} from 'lucide-react';
import { BusinessSettings } from '../types';
import { TRANSLATIONS } from '../sampleData';
import { BANK_LOGOS } from '../bankLogos';

interface SettingsProps {
  settings: BusinessSettings;
  setSettings: (settings: BusinessSettings) => void;
  onBackup: () => void;
  onRestore: (dataStr: string) => void;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
  onLogout?: () => void;
}

export default function Settings({
  settings,
  setSettings,
  onBackup,
  onRestore,
  addToast,
  onLogout,
}: SettingsProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields mapped to settings state
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [ownerName, setOwnerName] = useState(settings.ownerName || '');
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [currency, setCurrency] = useState(settings.currency);

  const [preferCBE, setPreferCBE] = useState(settings.preferCBE !== false);
  const [preferTelebirr, setPreferTelebirr] = useState(settings.preferTelebirr !== false);
  const [preferEBirr, setPreferEBirr] = useState(settings.preferEBirr !== false);
  const [preferSinqee, setPreferSinqee] = useState(settings.preferSinqee !== false);
  const [preferOther, setPreferOther] = useState(settings.preferOther === true);

  const [startingCBE, setStartingCBE] = useState((settings.startingCBE ?? 0).toString());
  const [startingTelebirr, setStartingTelebirr] = useState((settings.startingTelebirr ?? 0).toString());
  const [startingEBirr, setStartingEBirr] = useState((settings.startingEBirr ?? 0).toString());
  const [startingSinqee, setStartingSinqee] = useState((settings.startingSinqee ?? 0).toString());
  const [startingOther, setStartingOther] = useState((settings.startingOther ?? 0).toString());
  const [startingCash, setStartingCash] = useState((settings.startingCash ?? 0).toString());

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const cbeAmt = preferCBE ? parseFloat(startingCBE) || 0 : 0;
    const telebirrAmt = preferTelebirr ? parseFloat(startingTelebirr) || 0 : 0;
    const ebirrAmt = preferEBirr ? parseFloat(startingEBirr) || 0 : 0;
    const sinqeeAmt = preferSinqee ? parseFloat(startingSinqee) || 0 : 0;
    const otherAmt = preferOther ? parseFloat(startingOther) || 0 : 0;
    const cashAmt = parseFloat(startingCash) || 0;

    const bankAmt = cbeAmt + telebirrAmt + ebirrAmt + sinqeeAmt + otherAmt;

    const storageKey = settings.userId 
      ? `habesha_tracker_preferred_accounts_${settings.userId}` 
      : 'habesha_tracker_preferred_accounts_default';

    localStorage.setItem(storageKey, JSON.stringify({
      preferCBE,
      preferTelebirr,
      preferEBirr,
      preferSinqee,
      preferOther,
      startingCBE: cbeAmt,
      startingTelebirr: telebirrAmt,
      startingEBirr: ebirrAmt,
      startingSinqee: sinqeeAmt,
      startingOther: otherAmt,
      startingCash: cashAmt
    }));

    setSettings({
      ...settings,
      businessName,
      ownerName,
      address,
      phone,
      email,
      currency,
      bankAdjust: bankAmt - 320000,
      cashAdjust: cashAmt - 65000,
      preferCBE,
      preferTelebirr,
      preferEBirr,
      preferSinqee,
      preferOther,
      startingCBE: cbeAmt,
      startingTelebirr: telebirrAmt,
      startingEBirr: ebirrAmt,
      startingSinqee: sinqeeAmt,
      startingOther: otherAmt,
      startingCash: cashAmt
    });
    addToast(isAmharic ? 'የማስተካከያ ዝርዝሮች ተቀምጠዋል!' : 'Business settings updated successfully!', 'success');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onRestore(text);
        addToast(isAmharic ? 'የአካባቢ መረጃ በተሳካ ሁኔታ ተመልሷል!' : 'Database restored successfully!', 'success');
      } catch (err) {
        addToast('Invalid backup file parsed.', 'warning');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-500 animate-spin-slow" />
          {t.settings}
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-sans">
          Configure localized translation modules, establish database backups, modify your public invoice coordinates, and extract SQL migration sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Forms Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Business Coordinates form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-5 border-l-3 border-emerald-500 pl-3">
              {t.businessDetails}
            </h3>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Business Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Business / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-sans font-semibold"
                  />
                </div>

                {/* Owner Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="text-emerald-500">👤</span>
                    {isAmharic ? 'የባለቤቱ ሙሉ ስም *' : "Owner's Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-sans font-semibold"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {t.address}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Business Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Base Currency code */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    Trading Currency Key
                  </label>
                  <input
                    type="text"
                    required
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>

                {/* Account Preferences and Starting Balances */}
                <div className="sm:col-span-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {isAmharic ? 'የክፍያ ሂሳቦች ምርጫ እና መነሻ ቀሪ' : 'Payment Accounts & Starting Balances'}
                  </label>
                  <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                    {isAmharic 
                      ? 'ለመደብርዎ የሚጠቀሙባቸውን የክፍያ አማራጮች ይምረጡ እና መነሻ ሂሳባቸውን ያስገቡ።' 
                      : 'Choose your active payment accounts and configure starting balances below.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* CBE Card */}
                    <div className={`p-3 rounded-xl border transition-colors ${preferCBE ? 'bg-indigo-50/15 dark:bg-indigo-950/5 border-indigo-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input 
                            type="checkbox" 
                            checked={preferCBE} 
                            onChange={(e) => setPreferCBE(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300"
                          />
                          <img src={BANK_LOGOS.CBE} alt="CBE" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                          <span>{isAmharic ? 'የኢትዮጵያ ንግድ ባንክ (CBE)' : 'Commercial Bank (CBE)'}</span>
                        </label>
                      </div>
                      {preferCBE && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-semibold block">{isAmharic ? 'ሲቢኢ መነሻ ሂሳብ' : 'CBE Starting Balance'}</span>
                          <input 
                            type="number"
                            value={startingCBE}
                            onChange={(e) => setStartingCBE(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-hidden"
                          />
                        </div>
                      )}
                    </div>

                    {/* Telebirr Card */}
                    <div className={`p-3 rounded-xl border transition-colors ${preferTelebirr ? 'bg-blue-50/15 dark:bg-blue-950/5 border-blue-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input 
                            type="checkbox" 
                            checked={preferTelebirr} 
                            onChange={(e) => setPreferTelebirr(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded-sm border-slate-300"
                          />
                          <img src={BANK_LOGOS.Telebirr} alt="Telebirr" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                          <span>{isAmharic ? 'ቴሌብር (Telebirr)' : 'Telebirr'}</span>
                        </label>
                      </div>
                      {preferTelebirr && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-semibold block">{isAmharic ? 'ቴሌብር መነሻ ሂሳብ' : 'Telebirr Starting Balance'}</span>
                          <input 
                            type="number"
                            value={startingTelebirr}
                            onChange={(e) => setStartingTelebirr(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-hidden"
                          />
                        </div>
                      )}
                    </div>

                    {/* E-Birr Card */}
                    <div className={`p-3 rounded-xl border transition-colors ${preferEBirr ? 'bg-emerald-50/15 dark:bg-emerald-950/5 border-emerald-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input 
                            type="checkbox" 
                            checked={preferEBirr} 
                            onChange={(e) => setPreferEBirr(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300"
                          />
                          <img src={BANK_LOGOS.EBirr} alt="E-Birr" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                          <span>{isAmharic ? 'ኢ-ብር (E-Birr)' : 'E-Birr'}</span>
                        </label>
                      </div>
                      {preferEBirr && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-semibold block">{isAmharic ? 'ኢ-ብር መነሻ ሂሳብ' : 'E-Birr Starting Balance'}</span>
                          <input 
                            type="number"
                            value={startingEBirr}
                            onChange={(e) => setStartingEBirr(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-hidden"
                          />
                        </div>
                      )}
                    </div>

                    {/* Sinqee Bank Card */}
                    <div className={`p-3 rounded-xl border transition-colors ${preferSinqee ? 'bg-amber-50/15 dark:bg-amber-950/5 border-amber-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input 
                            type="checkbox" 
                            checked={preferSinqee} 
                            onChange={(e) => setPreferSinqee(e.target.checked)}
                            className="w-4 h-4 text-amber-600 rounded-sm border-slate-300"
                          />
                          <img src={BANK_LOGOS.Sinqee} alt="Sinqee" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                          <span>{isAmharic ? 'ሲንቄ ባንክ (Sinqee)' : 'Sinqee Bank'}</span>
                        </label>
                      </div>
                      {preferSinqee && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-semibold block">{isAmharic ? 'ሲንቄ መነሻ ሂሳብ' : 'Sinqee Starting Balance'}</span>
                          <input 
                            type="number"
                            value={startingSinqee}
                            onChange={(e) => setStartingSinqee(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-hidden"
                          />
                        </div>
                      )}
                    </div>

                    {/* Cash on Hand Card (Required) */}
                    <div className="p-3 rounded-xl border bg-slate-50/40 dark:bg-slate-950/10 border-slate-200/50 dark:border-slate-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span>💵 {isAmharic ? 'ጥሬ ገንዘብ (Cash)' : 'Cash on Hand'}</span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-semibold block">{isAmharic ? 'ጥሬ ገንዘብ መነሻ ሂሳብ' : 'Cash Starting Balance'}</span>
                        <input 
                          type="number"
                          required
                          value={startingCash}
                          onChange={(e) => setStartingCash(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Other Card */}
                    <div className={`p-3 rounded-xl border transition-colors ${preferOther ? 'bg-slate-500/10 border-slate-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input 
                            type="checkbox" 
                            checked={preferOther} 
                            onChange={(e) => setPreferOther(e.target.checked)}
                            className="w-4 h-4 text-slate-600 rounded-sm border-slate-300"
                          />
                          <span>💸 {isAmharic ? 'ሌላ አማራጭ (Other)' : 'Other Bank/Wallet'}</span>
                        </label>
                      </div>
                      {preferOther && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-semibold block">{isAmharic ? 'መነሻ ሂሳብ' : 'Other Starting Balance'}</span>
                          <input 
                            type="number"
                            value={startingOther}
                            onChange={(e) => setStartingOther(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-hidden"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/10 transition"
                  id="btn-settings-save"
                >
                  {isAmharic ? 'መረጃ አስቀምጥ' : 'Save Details'}
                </button>
              </div>

            </form>
          </div>

          {/* Localization, language and theme setup panels */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-5 border-l-3 border-emerald-500 pl-3">
              {t.langAndTheme}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Language Selection Toggle */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">System Language</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Toggle Amharic vs English translation</span>
                </div>
                
                <button
                  onClick={() => setSettings({ ...settings, language: settings.language === 'en' ? 'am' : 'en' })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                  id="btn-settings-toggle-lang"
                >
                  <Languages className="w-3.5 h-3.5" />
                  {settings.language === 'en' ? 'Amharic (አማ)' : 'English (EN)'}
                </button>
              </div>

              {/* Theme Selector Toggle */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{t.theme} Mode</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Dark Mode vs Light Mode presets</span>
                </div>
                
                <button
                  onClick={() => setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                  id="btn-settings-toggle-theme"
                >
                  {settings.theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  {settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right Side: Backups & Supabase schemas */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Local Backups */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-2 border-l-3 border-emerald-500 pl-3">
                Local Database Backups
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-5">
                Download a JSON ledger containing all recorded products, sales, expense receipts, and personal tasks. You can restore this file at any time.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              
              {/* Backup */}
              <button
                onClick={onBackup}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 transition cursor-pointer"
                id="btn-settings-backup"
              >
                <Download className="w-4 h-4" />
                {t.backupDb}
              </button>

              {/* Restore */}
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-200/50 dark:border-indigo-800/40 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                {t.restoreDb}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  ref={fileInputRef}
                  className="hidden"
                  id="input-settings-restore"
                />
              </label>

            </div>
          </div>

          {/* Sign Out Card */}
          {onLogout && (
            <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/40 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 font-sans uppercase tracking-wider mb-2 border-l-3 border-rose-500 pl-3">
                  {isAmharic ? 'የመለያ መውጫ' : 'Account Sign Out'}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-5">
                  {isAmharic 
                    ? 'ከዚህ መለያ በደህንነት ለመውጣት እና ወደ መግቢያ ገጽ ለመመለስ ከታች ያለውን ቁልፍ ይጫኑ።' 
                    : 'Safely sign out of your current manager profile session and return to the main portal.'}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200/50 dark:border-rose-900/40 transition cursor-pointer"
                id="btn-settings-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>{isAmharic ? 'ከአካውንት ውጣ (Sign Out)' : 'Sign Out of Account'}</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
