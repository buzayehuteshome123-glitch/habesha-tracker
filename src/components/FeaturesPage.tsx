import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Database, 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  FileSpreadsheet, 
  ArrowRightLeft, 
  Layers, 
  Cloud,
  Check
} from 'lucide-react';
import { BusinessSettings } from '../types';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MetaTags from './MetaTags';

interface FeaturesPageProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function FeaturesPage({ settings, setSettings }: FeaturesPageProps) {
  const isAmharic = settings.language === 'am';

  const features = [
    {
      titleEn: "Real-time Inventory & Stock Tracking",
      titleAm: "የዕቃ ክምችትና የክምችት መከታተያ በቅጽበት",
      descEn: "Track stock quantities as sales occur. Receive low-stock email or SMS alerts to avoid out-of-stock scenarios. Ideal for managing wholesale or retail grain, fast-moving consumer goods, and multi-variant product portfolios.",
      descAm: "ሽያጭ በሚካሄድበት ጊዜ የዕቃዎችን ክምችት መጠን ይከታተሉ። ክምችቱ እንዳያልቅ ለመከላከል ዝቅተኛ የክምችት ማስጠንቀቂያዎችን በኢሜይል ወይም በኤስኤምኤስ ያግኙ። ለጅምላ ወይም ችርቻሮ እህል፣ ለፈጣን ፍጆታ ዕቃዎች እና ለተለያዩ ምርቶች ተስማሚ።",
      icon: <Layers className="w-8 h-8 text-emerald-500" />
    },
    {
      titleEn: "Smart Sales Recording & Ledger Reconciliations",
      titleAm: "ዘመናዊ የሽያጭ ምዝገባና የባንክ ሂሳብ ማጣጣም",
      descEn: "Log customer sales in under 3 seconds. Separate transactions based on localized payment methods: Cash on hand, Commercial Bank of Ethiopia (CBE) transfer, Telebirr mobile wallet, or Sinqee Bank.",
      descAm: "ከ3 ሰከንድ ባነሰ ጊዜ ውስጥ የደንበኞችን ሽያጭ ይመዝግቡ። በሀገር ውስጥ ክፍያ መንገዶች ላይ በመመስረት ግብይቶችን ይለያዩ፡ በእጅ ያለ ጥሬ ገንዘብ፣ የኢትዮጵያ ንግድ ባንክ (CBE) ዝውውር፣ የቴሌብር የሞባይል ዋሌት ወይም ሲንቄ ባንክ።",
      icon: <ArrowRightLeft className="w-8 h-8 text-blue-500" />
    },
    {
      titleEn: "Customer Debt & Receivable Ledger (የዱቤ መዝገብ)",
      titleAm: "የደንበኞች እዳና የዱቤ መዝገብ",
      descEn: "Keep absolute control over customer loans. Track individual payment histories, outstanding balances, and send payment reminders. Never lose track of your receivables again.",
      descAm: "የደንበኞችን የዱቤ መዝገብ እና ክፍያዎችን ሙሉ በሙሉ ይቆጣጠሩ። የእያንዳንዱን ደንበኛ የክፍያ ታሪክ፣ ያልተከፈለ እዳ ይከታተሉ እና የክፍያ ማስታወሻዎችን ይላኩ። ከእንግዲህ ደንበኞችዎ የወሰዱትን ዕዳ አይዘንጉ።",
      icon: <TrendingUp className="w-8 h-8 text-indigo-500" />
    },
    {
      titleEn: "Interactive Financial Analytics Dashboard",
      titleAm: "የንግድ ትንተናና የፋይናንስ ዳሽቦርድ",
      descEn: "Gain commercial clarity. Visualize your daily revenues, net profit margins, operating expenses, and peak sales hours in beautiful, high-fidelity real-time interactive charts.",
      descAm: "ለንግድዎ ግልጽነት ያግኙ። ዕለታዊ ገቢዎችን፣ የተጣራ ትርፍ መጠንን፣ የሥራ ማስኬጃ ወጪዎችን እና የሽያጭ ሰዓቶችን በሚያማሩ እና በይነተገናኝ የቀጥታ ግራፎች ይመልከቱ።",
      icon: <BarChart3 className="w-8 h-8 text-amber-500" />
    },
    {
      titleEn: "Professional PDF & Excel Reports Generator",
      titleAm: "የፒዲኤፍ እና ኤክሴል ሪፖርቶች ማመንጫ",
      descEn: "Generate professional business performance reports, physical store inventories summaries, tax-ready statements, and Excel bookkeeping sheets with a single click.",
      descAm: "የንግድዎን አፈጻጸም ሪፖርቶች፣ የዕቃ ክምችት ዝርዝሮችን እና የገንዘብ እንቅስቃሴዎችን በአንድ ጠቅታ ያውርዱ። ለግብር ፋይል እና ለቢዝነስ ማጠቃለያዎች የተዘጋጁ።",
      icon: <FileSpreadsheet className="w-8 h-8 text-rose-500" />
    },
    {
      titleEn: "Military-grade Secure Cloud Backup",
      titleAm: "አስተማማኝ የደመና መጠባበቂያ",
      descEn: "Your enterprise records are continuously guarded with secure isolated databases. We protect data with modern cloud encryptions, offering automatic background backups and zero data-loss guarantee.",
      descAm: "የንግድ መረጃዎችዎ ደህንነታቸው ተጠብቆ በራስ-ሰር ደመና (Cloud) ላይ እንዲቀመጡ ያድርጉ። ያለ ኢንተርኔትም ይሰራል። መረጃዎችዎ ዘመናዊ ምስጠራዎችን በመጠቀም ደህንነታቸው በተጠበቀ የውሂብ ጎታዎች ውስጥ ይቀመጣሉ።",
      icon: <Cloud className="w-8 h-8 text-teal-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <MetaTags 
        title={isAmharic ? "ልዩ ባህሪያት - ሀበሻ ትራከር" : "Enterprise ERP Features - Habesha Tracker"}
        description={isAmharic 
          ? "የዕቃ ቁጥጥር፣ የሽያጭ መከታተያ፣ የዱቤ መዝገብ፣ እና የባንክ ሂሳብ ማጣጣም መተግበሪያዎች።" 
          : "Discover Habesha Tracker ERP capabilities: Real-time inventory tracking, local debt ledgers, localized financial payment integration, and graphical analytics dashboard."}
        canonicalUrl="https://habeshatracker.com/features"
        isAmharic={isAmharic}
      />

      <PublicHeader settings={settings} setSettings={setSettings} />

      <main className="flex-grow py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {isAmharic ? "የተሟሉ አገልግሎቶች" : "Unrivaled Features"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {isAmharic 
                ? "ንግድዎን በዘመናዊ መንገድ ለመምራት የሚረዱ ልዩ መተግበሪያዎች" 
                : "Everything You Need to Scale Your Ethiopian Business"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {isAmharic 
                ? "የዕቃዎች ክምችት እንዳይባክን ለመከላከል፣ የብድር ቀሪዎችን ለመቆጣጠርና ዕለታዊ ሽያጮችን በትክክል ለመመዝገብ የሚረዱ ልዩ መተግበሪያዎች።" 
                : "A complete operational suite designed to prevent financial leakages, manage stock balances, and track digital bank transactions."}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 space-y-4"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl w-fit">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white leading-tight">
                  {isAmharic ? feat.titleAm : feat.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {isAmharic ? feat.descAm : feat.descEn}
                </p>
              </div>
            ))}
          </div>

          {/* Feature Showcase Details */}
          <div className="mt-24 bg-gradient-to-br from-indigo-900/10 to-teal-900/5 dark:from-slate-900 dark:to-slate-950/80 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isAmharic 
                  ? "ለምን ሀበሻ ትራከር ከሌሎች ሶፍትዌሮች ይለያል?" 
                  : "Why Habesha Tracker Beats Standard Bookkeeping Systems"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {isAmharic 
                  ? "የውጭ ሀገር ሶፍትዌሮች የኢትዮጵያን የፋይናንስ እንቅስቃሴዎች ማለትም ቴሌብርን፣ ሲቢኢ ብርን እና ዱቤን በቀላሉ ማቀናጀት አይችሉም። ሀበሻ ትራከር ለሀገር ውስጥ ነጋዴዎች ፍላጎት ተስማሚ ሆኖ የተሰራ መተግበሪያ ነው።" 
                  : "International accounting programs are complex, rigid, and completely ignore localized merchant needs. Habesha Tracker bridges this gap with built-in financial payment structures, language selection, and an extremely clean interface requiring zero accounting training."}
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { en: "Local payment methods (CBE, telebirr)", am: "የሀገር ውስጥ ክፍያ መንገዶች (CBE, ቴሌብር)" },
                  { en: "No training or double-entry bookkeeping required", am: "የሂሳብ ባለሙያ እውቀት ወይም ስልጠና አያስፈልግም" },
                  { en: "Dual Language Workspace (English / አማርኛ)", am: "በእንግሊዝኛ እና በአማርኛ ማስተዳደሪያ" },
                  { en: "Continuous automatic safe cloud backup", am: "የማያቋርጥ አስተማማኝ መጠባበቂያ" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{isAmharic ? item.am : item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-xl w-full max-w-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                    {isAmharic ? "ማጠቃለያ" : "Quick Ledger Info"}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {isAmharic ? "ቀጥታ" : "Reconciled"}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{isAmharic ? "በባንክ ያለው" : "Bank Ledger"}</span>
                    <span className="font-mono font-bold">142,500.00 ETB</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{isAmharic ? "ቴሌብር ያለው" : "Telebirr Ledger"}</span>
                    <span className="font-mono font-bold text-emerald-500">65,900.00 ETB</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{isAmharic ? "ያልተሰበሰበ ዱቤ" : "Active Credit"}</span>
                    <span className="font-mono font-bold text-amber-500">12,400.00 ETB</span>
                  </div>
                </div>
                
                <Link 
                  to="/signup" 
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center block text-xs shadow-lg shadow-emerald-600/10 transition"
                >
                  {isAmharic ? "ነጻ ሙከራ ይጀምሩ" : "Try It For Free"}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
