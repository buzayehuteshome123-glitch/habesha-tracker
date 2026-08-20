import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Bot, 
  ExternalLink, 
  Sparkles, 
  Smartphone, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { getTelegramWebApp, isTelegramMiniApp, getTelegramUser, tgHaptics } from '../utils/telegram';

interface TelegramBotGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
}

export default function TelegramBotGuideModal({
  isOpen,
  onClose,
  language,
  addToast,
}: TelegramBotGuideModalProps) {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [customBotUsername, setCustomBotUsername] = useState('HabeshaTrackerBot');

  if (!isOpen) return null;

  const isAmharic = language === 'am';
  const appUrl = window.location.origin;
  const inTMA = isTelegramMiniApp();
  const tgUser = getTelegramUser();
  const tg = getTelegramWebApp();

  const handleCopy = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    tgHaptics.impact('light');
    addToast(isAmharic ? 'ወደ ክሊፕቦርድ ተቀድቷል!' : 'Copied to clipboard!', 'success');
    setTimeout(() => setCopiedStep(null), 2200);
  };

  const handleOpenBotFather = () => {
    tgHaptics.impact('medium');
    window.open('https://t.me/BotFather', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#0088cc]/15 via-emerald-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0088cc] flex items-center justify-center text-white shadow-md shadow-[#0088cc]/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAmharic ? 'የቴሌግራም ሚኒ አፕ ማዋቀሪያ' : 'Telegram Mini App (TMA)'}
                </h2>
                {inTMA ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active in Telegram
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/40">
                    TMA Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAmharic 
                  ? 'ሀበሻ ትራከርን በቀጥታ በቴሌግራም ቦት ውስጥ እንደ Mini App ያስጀምሩ' 
                  : 'Run Habesha Tracker directly inside Telegram chats, groups, and channels'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            id="btn-close-tg-guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Active Telegram Session Banner (If inside Telegram) */}
          {inTMA && tgUser && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center gap-3">
                {tgUser.photo_url ? (
                  <img src={tgUser.photo_url} alt="Profile" className="w-11 h-11 rounded-full border-2 border-emerald-500 shadow-xs" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {tgUser.first_name?.[0] || 'T'}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <span>{tgUser.first_name} {tgUser.last_name || ''}</span>
                    {tgUser.username && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal">(@{tgUser.username})</span>}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Telegram ID: <span className="font-mono font-semibold">{tgUser.id}</span> • Platform: <span className="font-semibold capitalize">{tg?.platform || 'web'}</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 p-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Haptic Engine Active</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-900/30 p-2 rounded-xl">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Expanded Viewport</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Overview Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAmharic ? 'የስልክ መተግበሪያ' : 'No App Store Needed'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'ያለ ምንም ጭነት በቴሌግራም ወዲያውኑ ይሰራል' : 'Opens instantly inside any Telegram chat'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAmharic ? 'ሙሉ ዳታ ማመሳሰያ' : 'Auto Cloud Sync'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'በቴሌብርና ንግድ ባንክ ሽያጮችን ይመዝግቡ' : 'Synced with PostgreSQL & offline memory'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAmharic ? 'ፈጣን ሀፕቲክስ' : 'Native Haptics'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'የስልክ መንቀጥቀጥና አዝራሮች ድጋፍ' : 'Physical vibration on sales & debt receipts'}
                </p>
              </div>
            </div>
          </div>

          {/* 3-Step BotFather Configuration Guide */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#0088cc]" />
                <span>{isAmharic ? 'የ 3-ደረጃ የቦት ማዋቀሪያ መመሪያ (@BotFather)' : 'How to Launch in 3 Minutes with @BotFather'}</span>
              </h3>
              <button
                onClick={handleOpenBotFather}
                className="text-xs text-[#0088cc] hover:underline font-bold flex items-center gap-1"
                id="btn-open-botfather"
              >
                <span>@BotFather ይክፈቱ</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0088cc] text-white flex items-center justify-center text-[11px] font-bold">1</span>
                  {isAmharic ? 'ቴሌግራም ላይ @BotFather ጋር ይሂዱና አዲስ ቦት ይፍጠሩ' : 'Create Bot on @BotFather'}
                </span>
                <button
                  onClick={() => handleCopy('/newbot', 'step1')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
                >
                  {copiedStep === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>/newbot</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAmharic 
                  ? 'የቦቱን ስም ያስገቡ (ለምሳሌ፦ Habesha Tracker)፣ በመቀጠል የቦት ዩዘርኔም (ለምሳሌ፦ habesha_tracker_bot) ይምረጡ።' 
                  : 'Give your bot a name (e.g. Habesha Tracker) and username ending with "bot".'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0088cc] text-white flex items-center justify-center text-[11px] font-bold">2</span>
                  {isAmharic ? 'ሚኒ አፕ (Mini App) ማገናኛ ትእዛዝ ይስጡ' : 'Register Web App URL via /newapp'}
                </span>
                <button
                  onClick={() => handleCopy('/newapp', 'step2')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
                >
                  {copiedStep === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>/newapp</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAmharic ? 'ቦትዎን ይምረጡ፣ በመቀጠል የድረ-ገጽ አድራሻ (Web App URL) ሲጠይቅዎ ከታች ያለውን ሊንክ ያስገቡ፦' : 'Select your bot and paste your live Web App URL when prompted:'}
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(appUrl, 'appurl')}
                  className="px-3 py-2 rounded-xl bg-[#0088cc] text-white text-xs font-bold hover:bg-[#0077b5] transition flex items-center gap-1 shrink-0"
                >
                  {copiedStep === 'appurl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isAmharic ? 'ሊንኩን ቅዳ' : 'Copy URL'}</span>
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0088cc] text-white flex items-center justify-center text-[11px] font-bold">3</span>
                  {isAmharic ? 'የቦቱን ሜኑ አዝራር ያዋቅሩ (Menu Button)' : 'Configure Menu Button via /setmenubutton'}
                </span>
                <button
                  onClick={() => handleCopy('/setmenubutton', 'step3')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
                >
                  {copiedStep === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>/setmenubutton</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAmharic 
                  ? 'ተጠቃሚዎች ቦቱን ሲከፍቱ በግራ በኩል ያለውን "Open App" አዝራር ተጭነው ወዲያውኑ እንዲከፈት ያደርጋል።' 
                  : 'Enables the direct "Open App" launcher button right inside the chat input bar.'}
              </p>
            </div>

          </div>

          {/* Test Link Generator */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>{isAmharic ? 'የቴሌግራም ማስጀመሪያ ቀጥታ ሊንክ' : 'Direct Telegram Share & Deep Link'}</span>
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-slate-800 rounded-xl px-3 py-2 border border-slate-700 text-xs font-mono">
                <span className="text-slate-400">https://t.me/</span>
                <input
                  type="text"
                  value={customBotUsername}
                  onChange={(e) => setCustomBotUsername(e.target.value.replace(/^@/, ''))}
                  placeholder="YourBotUsername"
                  className="bg-transparent text-emerald-300 focus:outline-hidden font-bold w-full"
                />
              </div>
              <button
                onClick={() => {
                  const link = `https://t.me/${customBotUsername || 'HabeshaTrackerBot'}`;
                  window.open(link, '_blank', 'noopener,noreferrer');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ቦቱን ይክፈቱ' : 'Open in Telegram'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0088cc]" />
            <span>{isAmharic ? 'ለቴሌግራም ሚኒ አፕ የተመቻቸ' : 'Official Telegram WebApp Ready'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition"
          >
            {isAmharic ? 'ዝጋ' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
