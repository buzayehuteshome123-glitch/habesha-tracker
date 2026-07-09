import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, ArrowRight } from 'lucide-react';
import { BusinessSettings } from '../types';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MetaTags from './MetaTags';

interface FAQPageProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function FAQPage({ settings, setSettings }: FAQPageProps) {
  const isAmharic = settings.language === 'am';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqItems = [
    {
      qEn: "How do I upgrade to the premium founding plan?",
      qAm: "እንዴት ወደ ፕሪሚየም ማሻሻል (upgrade) እችላለሁ?",
      aEn: "Upgrading is simple! You can upgrade directly from your business settings tab or contact our local support specialists. We support convenient payments through local bank transfers (CBE, Awash, Dashen) or Telebirr.",
      aAm: "ማሻሻል እጅግ በጣም ቀላል ነው! በቀጥታ በመተግበሪያው ቅንብሮች (Settings) ውስጥ ማሻሻል ይችላሉ ወይም የእኛን የድጋፍ ባለሙያዎች ያነጋግሩ። ክፍያዎችን በባንክ ማስተላለፊያ (ንግድ ባንክ፣ አዋሽ፣ ዳሽን) ወይም በቴሌብር መቀበል እንችላለን።"
    },
    {
      qEn: "Is my commercial data safe and private?",
      qAm: "የእኔ መረጃ ደህንነቱ የተጠበቀ ነው?",
      aEn: "Yes, absolutely. Your database is isolated using advanced cloud firewalls and protected continuously with real-time automatic backup. We adhere to top-tier enterprise encryption to guarantee that only you can access your commercial records.",
      aAm: "አዎ፣ በእርግጠኝነት። መረጃዎችዎ ዘመናዊ ፋየርዎሎችን በመጠቀም ደህንነታቸው በተጠበቀ የውሂብ ጎታዎች ውስጥ ይለያሉ፣ እንዲሁም በየጊዜው በራስ-ሰር መጠባበቂያ (Cloud backup) ይደረጋሉ፤ መረጃዎን እርስዎ ብቻ ማየት ይችላሉ።"
    },
    {
      qEn: "Can I access my account on multiple devices?",
      qAm: "በተለያዩ መሳሪያዎች በአንድ ጊዜ መጠቀም እችላለሁ?",
      aEn: "Yes! Habesha Tracker is a fully synchronized cross-platform web application. You can simultaneously log in and manage your business from a laptop, office tablet, or a personal smartphone, and all logs stay in perfect sync.",
      aAm: "አዎ! ሀበሻ ትራከር ሙሉ ለሙሉ የደመና መተግበሪያ በመሆኑ በኮምፒውተር፣ በታብሌት ወይም በስልክ በአንድ ላይ መግባት ይችላሉ፣ መረጃዎ በሁሉም ላይ ወዲያውኑ ይመሳሰላል።"
    },
    {
      qEn: "Do I need accounting or bookkeeping experience?",
      qAm: "የሂሳብ አያያዝ ልምድ ወይም ትምህርት ያስፈልገኛል?",
      aEn: "Not at all. Habesha Tracker was built for busy merchants and store owners. We replaced dry, complex double-entry ledger terminology with intuitive buttons, simple stock alerts, and automated net profit trackers.",
      aAm: "በጭራሽ። መተግበሪያው የተሰራው ምንም የሂሳብ እውቀት የሌላቸው የሱቅ ባለቤቶችም በቀላሉ እንዲረዱት ተደርጎ ነው። ውስብስብ የሆኑ ቃላትን አስቀርተን በቀላሉ ሽያጭ እንዲመዘግቡ አድርገናል።"
    },
    {
      qEn: "Do you offer a free tutorial or training?",
      qAm: "ነጻ የስልጠና ቪዲዮዎችን ማግኘት እችላለሁ?",
      aEn: "Yes, 100%! We offer comprehensive video tutorials, interactive Telegram walkthroughs, and step-by-step manuals in both Amharic and English. Premium founding merchants can also request a free 1-on-1 staff training session.",
      aAm: "አዎ፣ በእርግጠኝነት! በአማርኛ እና በEnglish የተዘጋጁ ደረጃ በደረጃ የሚያስተምሩ የቪዲዮ ስልጠናዎችን፣ የቴሌግራም የቀጥታ እገዛዎችን እና መመሪያዎችን እናቀርባለን። ፕሪሚየም አባላት ደግሞ በአካል ስልጠና መጠየቅ ይችላሉ።"
    },
    {
      qEn: "Can I use Habesha Tracker offline?",
      qAm: "ሀበሻ ትራከርን ያለ ኢንተርኔት (offline) መጠቀም ይቻላል?",
      aEn: "Yes! The core application supports robust offline caching. If your connection drops in Bole or Merkato, you can continue recording sales and stock items. Once your connection restores, your records sync to the cloud database automatically.",
      aAm: "አዎ! ዋናው መተግበሪያ ከመስመር ውጭ (offline) መሥራት ይችላል። በቦሌም ሆነ በመርካቶ የኢንተርኔት ግንኙነት ቢቋረጥም ሽያጮችን መመዝገብ ይችላሉ። ኢንተርኔት ሲገናኝ መረጃው በራስ-ሰር ወደ ደመናው ይላካል።"
    },
    {
      qEn: "How do I export my data to Excel or PDF?",
      qAm: "መረጃዎችን ወደ ፒዲኤፍ ወይም ኤክሴል እንዴት ማውጣት እችላለሁ?",
      aEn: "You can download fully formatted reports of your sales, products, expenses, and receivables. Simply navigate to the Reports tab in your dashboard, select the desired date range, and click the Export PDF or Export Excel button.",
      aAm: "የሽያጭ፣ የምርቶች፣ የወጪዎች እና የብድር መረጃዎችዎን ሙሉ ዘገባ ማውረድ ይችላሉ። በዳሽቦርድዎ ላይ ወዳለው 'ሪፖርቶች' (Reports) በመሄድ የሚፈልጉትን ቀን ይምረጡና 'ፒዲኤፍ አውርድ' ወይም 'ኤክሴል አውርድ' የሚለውን ይጫኑ።"
    }
  ];

  const filteredFaqs = faqItems.filter(item => {
    const q = isAmharic ? item.qAm : item.qEn;
    const a = isAmharic ? item.aAm : item.aEn;
    const search = searchQuery.toLowerCase();
    return q.toLowerCase().includes(search) || a.toLowerCase().includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <MetaTags 
        title={isAmharic ? "ጥያቄዎች - ሀበሻ ትራከር" : "Frequently Asked Questions - Habesha Tracker"}
        description={isAmharic 
          ? "ስለ ሀበሻ ትራከር የሂሳብ መተግበሪያ አጠቃቀም፣ ደህንነት እና ክፍያዎች ተደጋግመው የሚነሱ ጥያቄዎችና ምላሾች።" 
          : "Find answers to frequently asked questions about Habesha Tracker ERP: Offline caching, secure databases, CBE and Telebirr integrations, and billing detail."}
        canonicalUrl="https://habeshatracker.com/faq"
        isAmharic={isAmharic}
      />

      <PublicHeader settings={settings} setSettings={setSettings} />

      <main className="flex-grow py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {isAmharic ? "የእገዛ ማዕከል" : "Support Center"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {isAmharic ? "ተደጋግመው የሚነሱ ጥያቄዎችና ምላሾች" : "Frequently Asked Questions"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold">
              {isAmharic 
                ? "ስለ መተግበሪያው አጠቃቀም እና ስለ አገልግሎቶቻችን ሰፋ ያለ መረጃ ያግኙ።" 
                : "Find detailed answers about localized payment systems, offline registers, data backup mechanics, and account billing details."}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAmharic ? "ጥያቄዎችን እዚህ ይፈልጉ..." : "Search help articles..."}
              className="w-full pl-10 pr-4 py-3 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold shadow-xs"
            />
          </div>

          {/* FAQ Accordion list */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden transition shadow-xs"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-950 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-950/40 transition cursor-pointer"
                    >
                      <span>{isAmharic ? item.qAm : item.qEn}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        {isAmharic ? item.aAm : item.aEn}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 font-semibold">
                {isAmharic ? "ምንም ውጤት አልተገኘም" : "No results found matching your search."}
              </div>
            )}
          </div>

          {/* Still have questions? Block */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-extrabold">{isAmharic ? "ሌሎች ጥያቄዎች አሉዎት?" : "Still Have Questions?"}</h3>
              <p className="text-xs text-emerald-100 max-w-md font-semibold">
                {isAmharic 
                  ? "የፈለጉትን ጥያቄ ካላገኙ፣ የእኛን የድጋፍ ሰጪዎች በቴሌግራም በቀጥታ ማነጋገር ይችላሉ።" 
                  : "If you cannot find your specific issue, contact our live customer helper in Addis Ababa."}
              </p>
            </div>
            <a 
              href="https://t.me/Manbuza12"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-white text-emerald-700 font-extrabold rounded-xl hover:bg-slate-50 transition shadow-md flex items-center gap-2 shrink-0 text-xs cursor-pointer border border-transparent"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isAmharic ? "ቴሌግራም ላይ ያግኙን" : "Telegram Helpline"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
