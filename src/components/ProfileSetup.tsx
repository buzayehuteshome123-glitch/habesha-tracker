import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Coins, 
  Languages, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BusinessSettings } from '../types';
import { BANK_LOGOS } from '../bankLogos';

interface ProfileSetupProps {
  userId: string;
  userEmail: string;
  onComplete: (settings: BusinessSettings) => void;
  onLogout: () => void;
}

export default function ProfileSetup({ userId, userEmail, onComplete, onLogout }: ProfileSetupProps) {
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const isAmharic = lang === 'am';

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('ETB');
  const [email, setEmail] = useState(userEmail || '');
  const [preferCBE, setPreferCBE] = useState(true);
  const [preferTelebirr, setPreferTelebirr] = useState(true);
  const [preferEBirr, setPreferEBirr] = useState(true);
  const [preferSinqee, setPreferSinqee] = useState(false);
  const [preferOther, setPreferOther] = useState(false);

  const [startingCBE, setStartingCBE] = useState('0');
  const [startingTelebirr, setStartingTelebirr] = useState('0');
  const [startingEBirr, setStartingEBirr] = useState('0');
  const [startingSinqee, setStartingSinqee] = useState('0');
  const [startingOther, setStartingOther] = useState('0');
  const [startingCash, setStartingCash] = useState('0');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone || !address || !ownerName) {
      setErrorMsg(isAmharic ? 'እባክዎ ሁሉንም አስገዳጅ መስኮች ይሙሉ' : 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const cbeAmt = preferCBE ? parseFloat(startingCBE) || 0 : 0;
    const telebirrAmt = preferTelebirr ? parseFloat(startingTelebirr) || 0 : 0;
    const ebirrAmt = preferEBirr ? parseFloat(startingEBirr) || 0 : 0;
    const sinqeeAmt = preferSinqee ? parseFloat(startingSinqee) || 0 : 0;
    const otherAmt = preferOther ? parseFloat(startingOther) || 0 : 0;
    const cashAmt = parseFloat(startingCash) || 0;

    const bankAmt = cbeAmt + telebirrAmt + ebirrAmt + sinqeeAmt + otherAmt;

    const newSettings: BusinessSettings = {
      businessName,
      ownerName,
      phone,
      address,
      currency,
      email,
      language: lang,
      theme: 'dark',
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
    };

    try {
      // Save full custom details locally for load recovery
      localStorage.setItem(`habesha_tracker_preferred_accounts_${userId}`, JSON.stringify({
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

      // Upsert business settings for this user in Supabase
      const { error } = await supabase.from('business_settings').upsert({
        userId,
        businessName: newSettings.businessName,
        ownerName: newSettings.ownerName,
        phone: newSettings.phone,
        address: newSettings.address,
        currency: newSettings.currency,
        email: newSettings.email,
        language: newSettings.language,
        theme: newSettings.theme,
        bankAdjust: newSettings.bankAdjust,
        cashAdjust: newSettings.cashAdjust
      });

      if (error) {
        throw error;
      }

      onComplete(newSettings);
    } catch (err: any) {
      console.error('Error saving profile settings:', err);
      setErrorMsg(err.message || (isAmharic ? 'የስህተት ሙከራ ተከስቷል፣ እባክዎ እንደገና ይሞክሩ።' : 'Failed to save business profile. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 transition-colors duration-200 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/75 dark:bg-[#1E293B]/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        {/* Language Quick Toggle */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5">
          <button
            onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
            id="btn-setup-toggle-lang"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'English' : 'አማርኛ'}</span>
          </button>
        </div>

        {/* Header */}
        <div className="pt-4 pb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500 items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isAmharic ? 'የንግድ ሥራ መገለጫዎን ያዋቅሩ' : 'Set Up Your Business Profile'}
          </h2>
          <p className="text-slate-400 dark:text-slate-400 text-xs mt-1.5 font-medium leading-relaxed">
            {isAmharic 
              ? 'እባክዎ አዲሱን መለያዎን ለመጠቀም የንግድ ሥራ መረጃዎን ያስገቡ። ሁሉንም መረጃዎች በቀላሉ መጀመር ይችላሉ።' 
              : 'Welcome! Let\'s build your brand-new business profile so you can manage your shop, stock, and ledger with a clean database.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Business/Shop Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'የንግዱ / የሱቁ ስም *' : 'Business / Shop Name *'}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={isAmharic ? 'ለምሳሌ: ኪያ የጥራጥሬ መደብር' : 'e.g. Merkato Grains & Spices'}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400 font-semibold"
                  id="setup-business-name"
                />
              </div>
            </div>

            {/* Owner Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'የባለቤቱ ሙሉ ስም *' : 'Owner\'s Full Name *'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder={isAmharic ? 'ለምሳሌ: ሙሉጌታ አበበ' : 'e.g. Mulugeta Abebe'}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400 font-semibold"
                  id="setup-owner-name"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'የስልክ ቁጥር *' : 'Contact Phone *'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +251 911 123456"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400 font-mono"
                  id="setup-phone"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'የንግዱ አድራሻ (ከተማ/ሰፈር) *' : 'Business Address *'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isAmharic ? 'ለምሳሌ: መርካቶ፣ አዲስ አበባ' : 'e.g. Merkato, Addis Ababa'}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400"
                  id="setup-address"
                />
              </div>
            </div>

            {/* Preferred Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'የመገበያያ ገንዘብ' : 'Trading Currency'}
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400 appearance-none font-semibold"
                  id="setup-currency"
                >
                  <option value="ETB">ETB (ብር)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-2">▼</div>
              </div>
            </div>

            {/* Business Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'የኢሜል አድራሻ (አማራጭ)' : 'Business Email (Optional)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">@</span>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shop@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400"
                  id="setup-email"
                />
              </div>
            </div>

            {/* Account Preferences and Starting Balances */}
            <div className="sm:col-span-2 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                {isAmharic ? 'የክፍያ ሂሳቦች ምርጫ እና መነሻ ቀሪ' : 'Payment Accounts & Starting Balances'}
              </h4>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                {isAmharic 
                  ? 'ለመደብርዎ የሚጠቀሙባቸውን የክፍያ አማራጮች ይምረጡ እና መነሻ ሂሳባቸውን ያስገቡ። ይህ መረጃ በቀጥታ ወደ ባንክ እና ጥሬ ገንዘብ መዝገብ ይገባል::'
                  : 'Select your active payment wallets/banks and set their starting balances. These will sum up to your ledger capital.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* CBE Card */}
                <div className={`p-4 rounded-2xl border transition-all duration-200 ${preferCBE ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-500/40 dark:border-indigo-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800/60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-200">
                      <input 
                        type="checkbox" 
                        checked={preferCBE} 
                        onChange={(e) => setPreferCBE(e.target.checked)}
                        className="w-4.5 h-4.5 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="flex items-center gap-1.5">
                        <img src={BANK_LOGOS.CBE} alt="CBE" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                        {isAmharic ? 'ሲቢኢ (የኢትዮጵያ ንግድ ባንክ)' : 'CBE (Commercial Bank)'}
                      </span>
                    </label>
                  </div>
                  {preferCBE && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <span className="text-[10px] text-slate-400 font-semibold">{isAmharic ? 'መነሻ ሂሳብ (CBE Balance)' : 'Starting CBE Balance'}</span>
                      <input 
                        type="number"
                        value={startingCBE}
                        onChange={(e) => setStartingCBE(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Telebirr Card */}
                <div className={`p-4 rounded-2xl border transition-all duration-200 ${preferTelebirr ? 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-500/40 dark:border-blue-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800/60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-200">
                      <input 
                        type="checkbox" 
                        checked={preferTelebirr} 
                        onChange={(e) => setPreferTelebirr(e.target.checked)}
                        className="w-4.5 h-4.5 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                      />
                      <span className="flex items-center gap-1.5">
                        <img src={BANK_LOGOS.Telebirr} alt="Telebirr" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                        {isAmharic ? 'ቴሌብር (Telebirr)' : 'Telebirr'}
                      </span>
                    </label>
                  </div>
                  {preferTelebirr && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <span className="text-[10px] text-slate-400 font-semibold">{isAmharic ? 'መነሻ ሂሳብ (Telebirr)' : 'Starting Telebirr Balance'}</span>
                      <input 
                        type="number"
                        value={startingTelebirr}
                        onChange={(e) => setStartingTelebirr(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* E-Birr Card */}
                <div className={`p-4 rounded-2xl border transition-all duration-200 ${preferEBirr ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/40 dark:border-emerald-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800/60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-200">
                      <input 
                        type="checkbox" 
                        checked={preferEBirr} 
                        onChange={(e) => setPreferEBirr(e.target.checked)}
                        className="w-4.5 h-4.5 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="flex items-center gap-1.5">
                        <img src={BANK_LOGOS.EBirr} alt="E-Birr" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                        {isAmharic ? 'ኢ-ብር (E-Birr)' : 'E-Birr'}
                      </span>
                    </label>
                  </div>
                  {preferEBirr && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <span className="text-[10px] text-slate-400 font-semibold">{isAmharic ? 'መነሻ ሂሳብ (E-Birr)' : 'Starting E-Birr Balance'}</span>
                      <input 
                        type="number"
                        value={startingEBirr}
                        onChange={(e) => setStartingEBirr(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Sinqee Bank Card */}
                <div className={`p-4 rounded-2xl border transition-all duration-200 ${preferSinqee ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-500/40 dark:border-amber-500/30' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800/60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-200">
                      <input 
                        type="checkbox" 
                        checked={preferSinqee} 
                        onChange={(e) => setPreferSinqee(e.target.checked)}
                        className="w-4.5 h-4.5 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                      />
                      <span className="flex items-center gap-1.5">
                        <img src={BANK_LOGOS.Sinqee} alt="Sinqee" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                        {isAmharic ? 'ሲንቄ ባንክ (Sinqee)' : 'Sinqee Bank'}
                      </span>
                    </label>
                  </div>
                  {preferSinqee && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <span className="text-[10px] text-slate-400 font-semibold">{isAmharic ? 'መነሻ ሂሳብ (Sinqee)' : 'Starting Sinqee Balance'}</span>
                      <input 
                        type="number"
                        value={startingSinqee}
                        onChange={(e) => setStartingSinqee(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Cash on Hand Card (Always Enabled for basic retail operations) */}
                <div className="p-4 rounded-2xl border bg-slate-50/40 dark:bg-slate-950/10 border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>💵</span> {isAmharic ? 'በእጅ ያለ ጥሬ ገንዘብ' : 'Cash on Hand (Required)'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold">{isAmharic ? 'መነሻ በእጅ ያለ ገንዘብ' : 'Starting Cash on Hand'}</span>
                    <input 
                      type="number"
                      required
                      value={startingCash}
                      onChange={(e) => setStartingCash(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono dark:text-white"
                    />
                  </div>
                </div>

                {/* Other Card */}
                <div className={`p-4 rounded-2xl border transition-all duration-200 ${preferOther ? 'bg-slate-500/10 border-slate-500/40' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800/60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-200">
                      <input 
                        type="checkbox" 
                        checked={preferOther} 
                        onChange={(e) => setPreferOther(e.target.checked)}
                        className="w-4.5 h-4.5 text-slate-600 rounded-sm border-slate-300 focus:ring-slate-500"
                      />
                      <span className="flex items-center gap-1.5">
                        <span>💸</span> {isAmharic ? 'ሌላ ባንክ / ዌይላንድ' : 'Other Bank / Wallet'}
                      </span>
                    </label>
                  </div>
                  {preferOther && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <span className="text-[10px] text-slate-400 font-semibold">{isAmharic ? 'መነሻ ሂሳብ (Other)' : 'Starting Other Balance'}</span>
                      <input 
                        type="number"
                        value={startingOther}
                        onChange={(e) => setStartingOther(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold font-mono dark:text-white"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2"
              id="setup-error-msg"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-1/3 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold rounded-xl transition duration-150 text-sm flex items-center justify-center cursor-pointer"
              id="btn-setup-logout"
            >
              {isAmharic ? 'ውጣ' : 'Logout'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-2/3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              id="btn-setup-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAmharic ? 'በማስቀመጥ ላይ...' : 'Launching Profile...'}</span>
                </>
              ) : (
                <>
                  <span>{isAmharic ? 'መገለጫ ፍጠር እና ጀምር' : 'Create Profile & Launch'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
