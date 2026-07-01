import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  BarChart3, 
  Database, 
  Shield, 
  Globe, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ShoppingBag, 
  Users, 
  CreditCard, 
  Sparkles, 
  ArrowRight,
  Zap,
  Calendar,
  Smartphone,
  Laptop,
  Check,
  Star,
  Activity,
  ArrowUpRight,
  Sun,
  Moon,
  X,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  WifiOff
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function LandingPage({ 
  onEnterApp, 
  onLoginClick, 
  onSignUpClick, 
  settings, 
  setSettings 
}: LandingPageProps) {
  const handleLogin = onLoginClick || onEnterApp;
  const handleSignUp = onSignUpClick || onEnterApp;
  const isAmharic = settings.language === 'am';
  const isDark = settings.theme === 'dark';

  // State for FAQ accordion
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // State for active document modal (About Us, Contact, Support, Terms, Privacy)
  const [activeDocument, setActiveDocument] = useState<'about' | 'contact' | 'support' | 'terms' | 'privacy' | null>(null);

  // State for interactive live billing preview widget
  const [demoSaleAmount, setDemoSaleAmount] = useState<number>(3450);
  const [demoCommission, setDemoCommission] = useState<number>(2.5);

  // Stats count up animation simulation
  const [bizCount, setBizCount] = useState(120);
  const [itemsCount, setItemsCount] = useState(2400);
  const [salesCount, setSalesCount] = useState(5800);

  useEffect(() => {
    const interval = setInterval(() => {
      setBizCount(prev => (prev < 4250 ? prev + Math.floor(Math.random() * 80) + 40 : 4250));
      setItemsCount(prev => (prev < 1250000 ? prev + Math.floor(Math.random() * 25000) + 12000 : 1250000));
      setSalesCount(prev => (prev < 8540200 ? prev + Math.floor(Math.random() * 180000) + 90000 : 8540200));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const toggleLanguage = () => {
    setSettings(prev => ({
      ...prev,
      language: prev.language === 'am' ? 'en' : 'am'
    }));
  };

  const features = [
    {
      icon: <Database className="w-6 h-6 text-emerald-500" />,
      titleEn: "Smart Inventory & Stocks",
      titleAm: "የዘመነ የዕቃ ክምችትና ቁጥጥር",
      descEn: "Track stock quantities, low-stock notifications, dynamic categories, and retail valuation.",
      descAm: "የዕቃዎች መጠን፣ ያለቁ ዕቃዎች ማስጠንቀቂያ፣ የዋጋ ግምትና ዝርዝር መረጃዎችን በአንድ ቦታ ይቆጣጠሩ።"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
      titleEn: "Instant Sales Tracking",
      titleAm: "ፈጣን የሽያጭ መመዝገቢያ",
      descEn: "Record daily transactions, generate professional printable PDF receipts, and track customer balances.",
      descAm: "ዕለታዊ ሽያጮችን ይመዝግቡ፣ በፒዲኤፍ ደረሰኞች ያውጡ፣ እና የደንበኞችን የዱቤ ቀሪ ሂሳብ ይከታተሉ።"
    },
    {
      icon: <CreditCard className="w-6 h-6 text-cyan-500" />,
      titleEn: "Expense & Finance Ledger",
      titleAm: "የወጪና ፋይናንስ ቁጥጥር",
      descEn: "Monitor categorized operating costs, supplier records, and track dynamic bank vs. cash flows.",
      descAm: "የንግድዎን ወጪዎች በየዘርፉ ይመድቡ፣ የላኪዎችን ሂሳብና የባንክና በእጅ ያሉ ጥሬ ገንዘቦችን ይቆጣጠሩ።"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      titleEn: "Customer & Supplier CRM",
      titleAm: "የደንበኞችና ላኪዎች መረጃ",
      descEn: "Maintain dynamic profiles, track absolute credit history, and manage relationship ledgers.",
      descAm: "የደንበኞችና የአቅራቢዎችን ዝርዝር መረጃ፣ የክፍያ ታሪክና አጠቃላይ የዱቤ ልውውጦችን ይከታተሉ።"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
      titleEn: "Executive PDF Reports",
      titleAm: "የተሟሉ የፒዲኤፍ ሪፖርቶች",
      descEn: "Compile daily performance summaries, profit & loss analysis, and professional exports.",
      descAm: "ዕለታዊ የሽያጭ ሪፖርት፣ የትርፍና ኪሳራ ስሌት እና ለማንበብ ቀላል የሆኑ የፒዲኤፍ ፋይሎችን ያውርዱ።"
    },
    {
      icon: <Shield className="w-6 h-6 text-rose-500" />,
      titleEn: "Secured Local & Cloud Sync",
      titleAm: "አስተማማኝ የደመናና የአካባቢ መጠባበቂያ",
      descEn: "Advanced client data backup, instant security levels, and real-time ledger consistency.",
      descAm: "የመረጃዎችዎ አስተማማኝ መጠባበቂያ (Backup) እና ከፍተኛ የደህንነት ጥበቃ በማንኛውም ሰዓት ያግኙ።"
    }
  ];

  const faqs = [
    {
      qEn: "Is Habesha Tracker compliant with Ethiopian banking standards?",
      qAm: "የሀበሻ ትራከር ከኢትዮጵያ ባንኮች አሰራር ጋር ይጣጣማል?",
      aEn: "Yes! We support standard local workflows including Commercial Bank of Ethiopia (CBE), Awash, Dashen, and mobile banking splits (Telebirr). You can categorize transactions by specific payment methods easily.",
      aAm: "አዎ! የኢትዮጵያ ንግድ ባንክ (CBE)፣ አዋሽ፣ ዳሽን እና የቴሌብር (Telebirr) የክፍያ መንገዶችን በሙሉ ይደግፋል። ሽያጮችንና ወጪዎችን በየባንክ ዓይነታቸው መመደብ ይችላሉ።"
    },
    {
      qEn: "Is my data safe if my internet goes down?",
      qAm: "ኢንተርኔት ቢቋረጥ መረጃዬ አስተማማኝ ነው?",
      aEn: "Absolutely. Habesha Tracker operates on a advanced local-first database cache. If your internet connection drops, the app stores all transactions safely on your device. As soon as connectivity returns, your records are automatically synchronized with our secure server, meaning you never lose a single transaction.",
      aAm: "አዎ፣ በእርግጠኝነት! ሀበሻ ትራከር ከመስመር ውጭ መስራት በሚችል (local-first cache) ዘመናዊ ቴክኖሎጂ የተገነባ በመሆኑ ኢንተርኔት ቢቋረጥም እንኳ መረጃዎ በስልክዎ ወይም በኮምፒውተርዎ ላይ በጥንቃቄ ይቀመጣል። ኢንተርኔት ሲመለስ በራሱ ከደመናው (Cloud) ጋር ይመሳሰላል።"
    },
    {
      qEn: "Can I access my reports on my phone?",
      qAm: "ሪፖርቶችን በስልኬ ማግኘት እችላለሁ?",
      aEn: "Absolutely! The web dashboard is fully mobile responsive and optimized for any smartphone or tablet. You can view all analytics, register transactions, and generate high-contrast PDF reports directly from your mobile browser.",
      aAm: "በእርግጠኝነት! ሲስተሙ ሙሉ ለሙሉ ከማንኛውም ስልክ ወይም ታብሌት ጋር የሚስማማ (fully mobile responsive) ነው። በስልክዎ መተግበሪያውን በመክፈት ሽያጭ መመዝገብ፣ መረጃዎችን መከታተልና የፒዲኤፍ ሪፖርቶችን ማመንጨት ይችላሉ።"
    },
    {
      qEn: "Do you offer training for my staff?",
      qAm: "ለሰራተኞቼ ስልጠና ትሰጣላችሁ?",
      aEn: "Yes, we provide comprehensive training, onboarding assistance, and ready-to-use digital manuals. We also offer interactive support through Telegram and Email to ensure your employees can quickly get comfortable with the dashboard and run operations smoothly.",
      aAm: "አዎ፣ ለሰራተኞችዎ ዝርዝር ስልጠና፣ ዲጂታል መመሪያዎች እና አጠቃቀምን የሚያግዙ ቪዲዮዎችን እናቀርባለን። በተጨማሪም በቴሌግራም ወይም በኢሜይል ፈጣን እገዛ በማድረግ ሰራተኞችዎ ሲስተሙን በቀላሉ እንዲለምዱት እናደርጋለን።"
    },
    {
      qEn: "How readable are the compiled daily sales PDF reports?",
      qAm: "የሚወርዱት የፒዲኤፍ ሪፖርቶች ለማንበብ ምቹ ናቸው?",
      aEn: "The daily PDF sales reports are designed to be extremely clean, professional, and accessible to everyone. They include summary cards, transaction tables with alternating rows, and official stamp sign-off lines.",
      aAm: "የሚዘጋጁት የፒዲኤፍ ሪፖርቶች እጅግ ዘመናዊ፣ ግልጽና ለማንኛውም ሰው ለማንበብ ምቹ ሆነው የተሰሩ ናቸው። ማጠቃለያዎችንና ዝርዝር ሠንጠረዦችን ያካትታሉ።"
    }
  ];

  const docContent = {
    about: {
      titleEn: "About Us",
      titleAm: "ስለ እኛ",
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      contentEn: (
        <div className="space-y-4 font-sans">
          <p className="leading-relaxed">
            <strong>Habesha Tracker</strong> was founded with a single mission: to empower local businesses, retailers, wholesalers, and entrepreneurs across Ethiopia with modern, highly reliable, and accessible enterprise technology.
          </p>
          <p className="leading-relaxed">
            Our platform is built specifically to address local challenges—such as intermittent internet connectivity, diverse digital banking channels (like CBE Birr, Telebirr, Awash, Dashen, and private bank transfers), and localized business operations. We believe that professional bookkeeping and financial visibility should not require expensive, foreign ERP solutions.
          </p>
          <p className="leading-relaxed">
            That's why we crafted a high-performance, local-first platform designed to run smoothly on any device (including smartphones and tablets) while maintaining strong cloud security when online.
          </p>
          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 mt-6">
            <h5 className="font-bold text-slate-800 dark:text-white mb-1.5 text-xs uppercase tracking-wider">Our Core Vision</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              To be the most trusted and simple-to-use business manager in Ethiopian commerce, helping merchants scale, prevent loan leakages, and track their stock valuations with absolute precision.
            </p>
          </div>
        </div>
      ),
      contentAm: (
        <div className="space-y-4 font-sans">
          <p className="leading-relaxed">
            <strong>ሀበሻ ትራከር</strong> የተመሰረተው በአንድ ትልቅ ዓላማ ነው፦ በኢትዮጵያ ውስጥ ያሉ የችርቻሮ ነጋዴዎችን፣ የጅምላ አከፋፋዮችን፣ ላኪዎችንና አነስተኛና መካከለኛ ንግዶችን በዘመናዊና እጅግ አስተማማኝ በሆነ የዲጂታል ቴክኖሎጂ ማብቃት።
          </p>
          <p className="leading-relaxed">
            የእኛ መተግበሪያ የተሰራው በተለይ የሀገር ውስጥ የገበያ ተግዳሮቶችን—እንደ ኢንተርኔት መቆራረጥ፣ የተለያዩ የዲጂታል ክፍያ መንገዶች (እንደ ሲቢኢ ብር፣ ቴሌብር፣ አዋሽ፣ ዳሽን እና የግል ባንክ ዝውውሮች) እና የአካባቢውን የንግድ ልማዶች ከግምት ውስጥ በሚስገባ መልኩ ነው። እኛ እናምናለን፤ ጥራት ያለው የሂሳብ አያያዝ ቴክኖሎጂ ውድ በሆኑ የውጭ ሲስተሞች ብቻ መገደብ የለበትም።
          </p>
          <p className="leading-relaxed">
            ለዚህም ነው ከማንኛውም ስልክና ኮምፒውተር ጋር በቀላሉ የሚስማማውን፣ ያለ ኢንተርኔት በከፊል (local-first) መስራት የሚችለውንና ከደመናው (Cloud) ጋር የሚጣጣመውን ሀበሻ ትራከርን ያዘጋጀነው።
          </p>
          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 mt-6">
            <h5 className="font-bold text-slate-800 dark:text-white mb-1.5 text-xs uppercase tracking-wider">ዋነኛ ራእያችን</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              በኢትዮጵያ የንግድ ዓለም ውስጥ እጅግ ተአማኒ እና ቀላል የንግድ መቆጣጠሪያ በመሆን፣ ነጋዴዎች ስራቸውን እንዲያስፋፉ፣ የብድር መዝገብ ስህተቶችን እንዲከላከሉ እና የዕቃ ክምችት ዋጋቸውን በትክክል እንዲያውቁ መርዳት።
            </p>
          </div>
        </div>
      )
    },
    contact: {
      titleEn: "Contact Us",
      titleAm: "ያግኙን",
      icon: <Phone className="w-6 h-6 text-indigo-500" />,
      contentEn: (
        <div className="space-y-6 font-sans">
          <p className="leading-relaxed text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Have a question, feedback, or want to arrange an on-site demonstration? Get in touch with our team through any of the options below. We are based in the heart of Addis Ababa and always ready to assist.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-white text-sm">Direct Phone Inquiry</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  +251 986 580 996
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Monday to Saturday: 8:30 AM – 6:30 PM (Local Time)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-white text-sm">Email Support</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  support@habeshatracker.et
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Average response time: &lt; 15 minutes</p>
              </div>
            </div>
          </div>
        </div>
      ),
      contentAm: (
        <div className="space-y-6 font-sans">
          <p className="leading-relaxed text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            ጥያቄ አለዎት ወይስ በቀጥታ የሲስተሙን አጠቃቀም ማሳያ እንዲቀርብልዎት ይፈልጋሉ? ከታች ባሉት የግንኙነት መንገዶች በሙሉ ሊያገኙን ይችላሉ። ቡድናችን ሁል ጊዜ እርስዎን ለመርዳት ዝግጁ ነው።
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-white text-sm">በቀጥታ ስልክ መደወል</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  0986580996
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">ከሰኞ እስከ ቅዳሜ፦ ከጠዋቱ 2:30 እስከ ምሽቱ 12:30</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-white text-sm">ኢሜይል ድጋፍ</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  support@habeshatracker.et
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">አማካይ የምላሽ ሰዓት፦ ከ15 ደቂቃ በታች</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    support: {
      titleEn: "Technical Support & Telegram Helpdesk",
      titleAm: "የቴክኒክ ድጋፍና ቴሌግራም",
      icon: <MessageSquare className="w-6 h-6 text-sky-500" />,
      contentEn: (
        <div className="space-y-6 font-sans">
          <p className="leading-relaxed text-xs sm:text-sm">
            We provide premium, 24/7 dedicated customer support. Whether you need help setting up your product catalog, backing up your databases, or resolving CBE/Telebirr reconciliations, our helpdesk is here.
          </p>

          <div className="p-5 bg-sky-500/10 dark:bg-sky-500/5 border border-sky-500/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#0088cc] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.05 4.67-1.5 6.75-.1.45-.25.6-.45.62-.43.04-.76-.28-1.18-.55-.65-.43-1.02-.7-1.65-1.11-.73-.47-.26-.73.16-1.16.11-.11 2.02-1.85 2.06-2.02.01-.02.01-.1-.05-.15-.06-.05-.15-.03-.21-.02-.1.02-1.61 1.02-4.54 3.00-.43.3-.82.44-1.17.43-.39-.01-1.13-.22-1.68-.40-.68-.22-1.22-.34-1.17-.72.03-.2.3-.4.81-.61 3.17-1.38 5.29-2.29 6.36-2.73 3.03-1.26 3.66-1.48 4.07-1.49.09 0 .29.02.42.13.11.1.14.23.15.33-.01.07-.01.14-.02.2z" />
              </svg>
              <h5 className="font-bold text-slate-800 dark:text-white text-sm">Join Our Telegram Support (@Manbuza12)</h5>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Connect directly with our support specialists and get instant answers inside Telegram. We offer automated stock alerts, manuals, and live chat.
            </p>
            <div className="pt-2">
              <a 
                href="https://t.me/Manbuza12" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-bold rounded-xl transition duration-150 gap-2 shadow-md shadow-sky-500/20"
              >
                Open Telegram Support (@Manbuza12)
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">Additional Channels</h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Email Support</strong>: support@habeshatracker.et</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Phone Helpdesk</strong>: +251 986 580 996</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Staff Onboarding Assistance</strong>: Available for premium accounts.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      contentAm: (
        <div className="space-y-6 font-sans">
          <p className="leading-relaxed text-xs sm:text-sm">
            እኛ 24/7 ሙሉ ሰዓት የሚሰሩ የቴክኒክ ድጋፍ ባለሙያዎችን አሰልፈናል። የእርስዎን የዕቃዎች ዝርዝር ለመጫን፣ መረጃዎችን ኮፒ አድርጎ ለመያዝ (Backup) ወይም የቴሌብር/የባንክ መግለጫዎችን ለማስታረቅ እርዳታ ከፈለጉ ሁል ጊዜ ዝግጁ ነን።
          </p>

          <div className="p-5 bg-sky-500/10 dark:bg-sky-500/5 border border-sky-500/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#0088cc] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.05 4.67-1.5 6.75-.1.45-.25.6-.45.62-.43.04-.76-.28-1.18-.55-.65-.43-1.02-.7-1.65-1.11-.73-.47-.26-.73.16-1.16.11-.11 2.02-1.85 2.06-2.02.01-.02.01-.1-.05-.15-.06-.05-.15-.03-.21-.02-.1.02-1.61 1.02-4.54 3.00-.43.3-.82.44-1.17.43-.39-.01-1.13-.22-1.68-.40-.68-.22-1.22-.34-1.17-.72.03-.2.3-.4.81-.61 3.17-1.38 5.29-2.29 6.36-2.73 3.03-1.26 3.66-1.48 4.07-1.49.09 0 .29.02.42.13.11.1.14.23.15.33-.01.07-.01.14-.02.2z" />
              </svg>
              <h5 className="font-bold text-slate-800 dark:text-white text-sm">የቴሌግራም የቴክኒክ ድጋፍ ማዕከል (@Manbuza12)</h5>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ከቴክኒክ ባለሙያዎቻችን ጋር በቀጥታ በመገናኘት በቴሌግራም ፈጣን መልስ ያግኙ። የተጠናቀቁ መመሪያዎችን፣ የስራ ማስጠንቀቂያዎችንና የቀጥታ ቻት እናቀርባለን።
            </p>
            <div className="pt-2">
              <a 
                href="https://t.me/Manbuza12" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-bold rounded-xl transition duration-150 gap-2 shadow-md shadow-sky-500/20"
              >
                ቴሌግራም ድጋፍን ክፈት (@Manbuza12)
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">ሌሎች የግንኙነት መንገዶች</h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>ኢሜይል ድጋፍ</strong>: support@habeshatracker.et</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>የስልክ ድጋፍ</strong>: 0986580996</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>የሰራተኞች ስልጠና</strong>: ለፕሪሚየም ተጠቃሚዎች በአካል ቀርበን እናስተምራለን።</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    terms: {
      titleEn: "Terms of Service",
      titleAm: "የአጠቃቀም ውሎችና ደንቦች",
      icon: <Shield className="w-6 h-6 text-amber-500" />,
      contentEn: (
        <div className="space-y-4 text-xs sm:text-sm font-sans">
          <p className="leading-relaxed">
            Welcome to Habesha Tracker. By creating an account or accessing our cloud bookkeeping portal, you agree to comply with and be bound by the following Terms of Service.
          </p>
          <ol className="list-decimal pl-5 space-y-3 mt-4 text-slate-600 dark:text-slate-400">
            <li>
              <strong>License Grant</strong>: We grant you a revocable, non-exclusive, non-transferable license to use the Habesha Tracker software specifically for managing your physical or digital business transactions.
            </li>
            <li>
              <strong>Accounting & Ledger Responsibility</strong>: While Habesha Tracker implements robust local databases and automatic client caching, the accuracy of the transactions (sales ledger, loan inputs, grain prices) remains solely your responsibility.
            </li>
            <li>
              <strong>LocalStorage and Offline Cache</strong>: To guarantee 100% offline uptime, certain data points are cached inside your browser sandboxed workspace. Clearing browser caches, cookies, or formatting your device may delete unbacked-up logs. You are requested to use our single-click database backup feature regularly.
            </li>
            <li>
              <strong>System Integrity</strong>: You agree not to attempt to reverse engineer, disrupt, or exploit any cloud resources hosted on Habesha Tracker endpoints.
            </li>
          </ol>
        </div>
      ),
      contentAm: (
        <div className="space-y-4 text-xs sm:text-sm font-sans">
          <p className="leading-relaxed">
            ወደ ሀበሻ ትራከር እንኳን በደህና መጡ። መለያ በመፍጠር ወይም የእኛን የደመና ERP ሲስተም በመጠቀም በሚከተሉት የአጠቃቀም ውሎችና ደንቦች ለመገዛት ተስማምተዋል።
          </p>
          <ol className="list-decimal pl-5 space-y-3 mt-4 text-slate-600 dark:text-slate-400">
            <li>
              <strong>የአጠቃቀም ፈቃድ</strong>: የእርስዎን የግል የንግድ እንቅስቃሴ ለመከታተልና ለመቆጣጠር የሀበሻ ትራከር ሶፍትዌርን በነጻ ወይም በክፍያ እንዲጠቀሙ የግል ፍቃድ ሰጥተንዎታል።
            </li>
            <li>
              <strong>የመረጃዎች ትክክለኛነት</strong>: መተግበሪያው ዘመናዊ የሂሳብ ስሌቶችን የሚያከናውን ቢሆንም፣ በሲስተሙ ላይ የሚገቡት መረጃዎች (ሽያጭ፣ ክምችት፣ የብድር ሂሳቦች) ትክክለኛነት ሙሉ በሙሉ የእርስዎ ኃላፊነት ነው።
            </li>
            <li>
              <strong>የብሮውዘር መረጃ ቁጠባ (LocalStorage)</strong>: መተግበሪያው ያለ ኢንተርኔት በከፍተኛ ፍጥነት እንዲሰራ መረጃዎችን በብሮውዘርዎ ላይ ስለሚይዝ፣ ብሮውዘርዎን በሚያፀዱበት ጊዜ ወይም ኮምፒውተሩን በሚቀይሩበት ጊዜ መረጃ እንዳይጠፋ አዘውትረው የመጠባበቂያ ፋይል (Backup) እንዲያወርዱ ይመከራል።
            </li>
            <li>
              <strong>የሲስተሙ ደህንነት</strong>: የሀበሻ ትራከርን የደመና ሲስተም ለማወክ ወይም የደህንነት ቅንብሮችን ለመጣስ መሞከር በጥብቅ የተከለከለ ነው።
            </li>
          </ol>
        </div>
      )
    },
    privacy: {
      titleEn: "Privacy Policy",
      titleAm: "የግል መረጃ ጥበቃ ፖሊሲ",
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      contentEn: (
        <div className="space-y-4 text-xs sm:text-sm font-sans">
          <p className="leading-relaxed">
            Your commercial secrecy and business privacy is our absolute core value. This Privacy Policy documents how your transactions, logs, and email configurations are securely stored:
          </p>
          <ol className="list-decimal pl-5 space-y-3 mt-4 text-slate-600 dark:text-slate-400">
            <li>
              <strong>Client-Side Processing</strong>: To prevent data leaks and state intervention, your proprietary business transaction records (such as customer loan lists, grains inventories, cash on hand) are processed on your device. We do not inspect, sell, or parse your accounting logs.
            </li>
            <li>
              <strong>Authentication Security</strong>: Your basic login metadata is strictly protected via industry-standard Supabase identity keys.
            </li>
            <li>
              <strong>Zero Advertising</strong>: Habesha Tracker is supported strictly by subscription models. We never host advertising tracking tags or share business metrics with external marketing conglomerates.
            </li>
            <li>
              <strong>Database Portability</strong>: You maintain the absolute right to export or delete your local sandboxed database with a single click.
            </li>
          </ol>
        </div>
      ),
      contentAm: (
        <div className="space-y-4 text-xs sm:text-sm font-sans">
          <p className="leading-relaxed">
            የንግድ ስራዎ ሚስጥራዊነት መጠበቅ ለእኛ የመጨረሻው ትልቅ ዋጋችን ነው። የእርስዎን የግብይትና የግል መረጃዎች እንዴት እንደምንጠብቅ ከታች ተዘርዝሯል፦
          </p>
          <ol className="list-decimal pl-5 space-y-3 mt-4 text-slate-600 dark:text-slate-400">
            <li>
              <strong>መረጃዎ ለርስዎ ብቻ</strong>: በሲስተሙ ላይ የሚመዘግቧቸው የሽያጭ፣ የክምችት፣ የብድርና የባንክ መረጃዎች በሙሉ በብሮውዘርዎ ላይ የሚሰሩ ሲሆን፣ መረጃዎን እኛ ማንበብ ወይም ለሌሎች የንግድ ድርጅቶች መሸጥ አንችልም።
            </li>
            <li>
              <strong>የመለያ ደህንነት</strong>: የእርስዎን የመለያ መረጃዎች (ኢሜይል፣ የይለፍ ቃልና ቅንብሮች) በኢንዱስትሪ ደረጃ ተቀባይነት ባለው በSupabase ቴክኖሎጂ አማካኝነት እንጠብቃለን።
            </li>
            <li>
              <strong>ማስታወቂያዎችን አናሳይም</strong>: መተግበሪያው የሚተዳደረው በደንበኝነት ክፍያ ስለሆነ፣ የእርስዎን የሽያጭ ሁኔታዎች የሚከታተሉ የውጭ ማስታወቂያ ሰሪ ኮዶችን ሲስተማችን ውስጥ በፍጹም አናስገባም።
            </li>
            <li>
              <strong>መረጃ የመውሰድ መብት</strong>: በማንኛውም ሰዓት መረጃዎን በፒዲኤፍ ወይም በኤክሴል ማውረድ ወይም መለያዎን ሙሉ በሙሉ መሰረዝ ይችላሉ።
            </li>
          </ol>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* 1. STICKY NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-[#0F172A]/70 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg className="w-10 h-10 shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" id="logo-svg-landing">
              <defs>
                <linearGradient id="logo-grad-landing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="gold-grad-landing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="10" fill="url(#logo-grad-landing)" />
              <rect x="11" y="10" width="5" height="20" rx="1.5" fill="white" />
              <rect x="24" y="10" width="5" height="20" rx="1.5" fill="white" />
              <rect x="15" y="18.5" width="10" height="3" fill="white" />
              <path d="M 16 20 L 20 16 L 24 20 L 20 24 Z" fill="url(#gold-grad-landing)" />
            </svg>
            <div>
              <span className="font-bold tracking-tight text-slate-950 dark:text-white text-lg">Habesha Tracker</span>
              <span className="text-[9px] block font-semibold text-emerald-500 uppercase tracking-widest leading-none">ERP SUITE</span>
            </div>
          </div>

          {/* Nav Items - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-500 transition-colors">{isAmharic ? "ልዩ ባህሪያት" : "Features"}</a>
            <a href="#why-choose-us" className="hover:text-emerald-500 transition-colors">{isAmharic ? "ለምን መረጡን" : "Why Us"}</a>
            <a href="#faq" className="hover:text-emerald-500 transition-colors">{isAmharic ? "ጥያቄዎች" : "FAQ"}</a>
            <button onClick={() => setActiveDocument('about')} className="hover:text-emerald-500 transition-colors cursor-pointer focus:outline-hidden">{isAmharic ? "ስለ እኛ" : "About Us"}</button>
            <button onClick={() => setActiveDocument('contact')} className="hover:text-emerald-500 transition-colors cursor-pointer focus:outline-hidden">{isAmharic ? "ያግኙን" : "Contact Us"}</button>
            <button onClick={() => setActiveDocument('support')} className="hover:text-emerald-500 transition-colors cursor-pointer focus:outline-hidden text-emerald-600 dark:text-emerald-400 font-semibold">{isAmharic ? "እገዛ & ቴሌግራም" : "Support"}</button>
          </nav>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-3">
            {/* Lang switcher */}
            <button 
              onClick={toggleLanguage}
              className="px-2 py-1 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
              title="Switch Language"
              id="lang-toggle-landing"
            >
              {isAmharic ? "EN" : "አማ"}
            </button>

            {/* Theme switcher */}
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
              title="Toggle Theme"
              id="theme-toggle-landing"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* App Launchers */}
            <button 
              onClick={handleLogin}
              className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
              id="btn-login-landing"
            >
              {isAmharic ? "ግባ" : "Log In"}
            </button>

            <button 
              onClick={handleSignUp}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition duration-150"
              id="btn-signup-landing"
            >
              {isAmharic ? "በነጻ ይጀምሩ" : "Start Free Trial"}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Soft floating colored background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-6">
              


              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white leading-tight tracking-tight">
                {isAmharic ? "ንግድዎን " : "Track. Manage."} <br />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
                  {isAmharic ? "ይቆጣጠሩ፣ ያሳድጉ!" : "Grow Your Business."}
                </span>
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
                {isAmharic 
                  ? "የሀበሻ ትራከር የዕቃ ክምችት፣ ፈጣን ሽያጭ፣ የባንክና ጥሬ ገንዘብ ፍሰት፣ ወጪዎችና ብድሮችን በአንድ ቦታ የሚቆጣጠሩበት ዘመናዊ የኢንተርፕራይዝ ሲስተም ነው።"
                  : "The complete inventory, sales, finance, expense, and business management solution built specifically for Ethiopian retail, grains, tech, and service sectors."
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <button 
                  onClick={handleSignUp}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition duration-150 flex items-center justify-center gap-2"
                  id="btn-hero-cta-trial"
                >
                  {isAmharic ? "በነጻ መጠቀም ይጀምሩ" : "Start Free Trial"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleLogin}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition duration-150 flex items-center justify-center gap-2"
                  id="btn-hero-cta-dashboard"
                >
                  {isAmharic ? "ዳሽቦርድን ይጎብኙ" : "Explore ERP Dashboard"}
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>



              {/* Badges / Micro proof */}
              <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">{isAmharic ? "ክሬዲት ካርድ አያስፈልግም" : "No credit card"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">{isAmharic ? "100% ደህንነቱ የተጠበቀ" : "Offline backup sync"}</span>
                </div>
              </div>

            </div>

            {/* Hero Right Floating Mockup Visuals */}
            <div className="lg:col-span-7 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none w-full bg-gradient-to-tr from-emerald-500/5 to-indigo-500/5 p-4 sm:p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-2xl backdrop-blur-3xl">
                
                {/* Decorative glows inside mockup border */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl" />

                {/* Dashboard Frame Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 block" />
                  </div>
                  <div className="bg-slate-200/50 dark:bg-slate-800/50 px-6 py-1 rounded-lg text-[10px] font-mono text-slate-500 dark:text-slate-400 select-none">
                    demo.habeshatracker.et/dashboard
                  </div>
                  <div className="w-12 h-2" />
                </div>

                {/* Core Live Dashboard Mockup Grid */}
                <div className="space-y-4">
                  
                  {/* Top Stats boxes row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">TODAY'S REVENUE</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">14,230 Br</p>
                      <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5 mt-0.5">
                        ↑ 12% <span className="text-[8px] text-slate-400 dark:text-slate-500 font-normal">vs yesterday</span>
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">BANK BALANCE</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">320,000 Br</p>
                      <span className="text-[8px] text-slate-400 font-medium">CBE / Telebirr</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">STOCK VALUE</span>
                      <p className="text-sm font-bold text-indigo-500 mt-1">745,000 Br</p>
                      <span className="text-[8px] text-rose-500 font-medium font-mono">14 low stock alerts</span>
                    </div>
                  </div>

                  {/* Dynamic interactive widget showcase */}
                  <div className="bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                        {isAmharic ? "የቀጥታ ስሌት መግብያ (Interactive Demo)" : "Interactive Pricing Widget"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                        Calculated Real-Time
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {isAmharic ? "የሽያጭ ዋጋ (Br)" : "Sale Amount (ETB)"}
                        </label>
                        <input 
                          type="range" 
                          min="1000" 
                          max="20000" 
                          step="250"
                          value={demoSaleAmount}
                          onChange={(e) => setDemoSaleAmount(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-ew-resize"
                        />
                        <div className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                          {demoSaleAmount.toLocaleString()} Br
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {isAmharic ? "የትርፍ መጠን (%)" : "Profit margin (%)"}
                        </label>
                        <input 
                          type="range" 
                          min="1" 
                          max="40" 
                          step="1"
                          value={demoCommission}
                          onChange={(e) => setDemoCommission(Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-ew-resize"
                        />
                        <div className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                          {demoCommission}%
                        </div>
                      </div>
                    </div>

                    {/* Calculated output */}
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Net profit</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                          {((demoSaleAmount * demoCommission) / 100).toFixed(2)} Br
                        </span>
                      </div>
                      <button 
                        onClick={handleSignUp}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-600 transition"
                      >
                        {isAmharic ? "እዚህ ይመዝግቡ" : "Record in Ledger"}
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Realistic Recent Sales ledger */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Completed Transactions</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <div className="p-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px] p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">C</div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">Almaz Bekele</p>
                            <p className="text-[9px] text-slate-400">Grains (Red Teff) x3 bags</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-slate-900 dark:text-white">+11,400 Br</p>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">Bank Transfer</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">K</div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">Kedir Yusuf</p>
                            <p className="text-[9px] text-slate-400">Premium Barley Premium x5</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-slate-900 dark:text-white">+8,250 Br</p>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">Cash</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Mini floating labels */}
              <div className="absolute -top-4 -left-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 shadow-xl animate-bounce duration-1000 hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200">
                  {isAmharic ? "+14% የሽያጭ እድገት" : "+14% sales growth"}
                </span>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 shadow-xl hidden sm:flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200">
                  {isAmharic ? "ከባንክ ጋር የተገናኘ" : "CBE/Awash reconciled"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CORE STATISTICS */}
      <section className="bg-white dark:bg-[#0F172A] border-y border-slate-100 dark:border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-500 font-mono">
                {bizCount}+
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                {isAmharic ? "ንግዶች እየተጠቀሙ ነው" : "Businesses Using"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-indigo-500 font-mono">
                {(itemsCount / 1000000).toFixed(1)}M+
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                {isAmharic ? "ዕቃዎች ይተዳደራሉ" : "Products Managed"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-cyan-500 font-mono">
                {(salesCount / 1000000).toFixed(1)}M+
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                {isAmharic ? "ሽያጮች ተመዝግበዋል" : "Sales Recorded"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-500 font-mono">
                99.8%
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                {isAmharic ? "የደንበኞች እርካታ" : "Customer Satisfaction"}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-24">
            <div className="inline-flex items-center gap-1 bg-indigo-500/10 dark:bg-indigo-500/5 px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" />
              {isAmharic ? "የታመኑና ዘመናዊ መፍትሄዎች" : "ENTERPRISE LEVEL ADVANTAGES"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {isAmharic ? "ለንግድዎ ስኬት የሚያስፈልጉ የተሟሉ መሳሪያዎች" : "Unrivaled Platform Capabilities"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              {isAmharic 
                ? "ማንኛውንም የንግድ ዓይነት በቀላሉ ለማስተዳደርና ለማሳደግ የሚረዱዎ ልዩ መተግበሪያዎች።" 
                : "A unified engine mapping inventory levels, instant ledger postings, loan allocations, and dynamic multi-calendar timelines."
              }
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <div 
                key={i}
                onClick={handleSignUp}
                className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs hover:shadow-xl hover:border-emerald-500/20 dark:hover:border-emerald-500/30 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
              >
                {/* Visual Accent Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none" />

                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>

                <h3 className="text-base font-bold text-slate-950 dark:text-white mb-2 group-hover:text-emerald-500 transition-colors">
                  {isAmharic ? feat.titleAm : feat.titleEn}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {isAmharic ? feat.descAm : feat.descEn}
                </p>

                <div className="mt-5 flex items-center gap-1 text-[10px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{isAmharic ? "መተግበሪያውን ይክፈቱ" : "Explore feature"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. WHY CHOOSE US (TWO COLUMN SECTION) */}
      <section id="why-choose-us" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left side: Beautiful visual checklist illustration */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500/10 to-indigo-500/10 p-8 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between relative shadow-lg">
                <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none blur-3xl" />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">SYSTEM COMPLIANT</span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>

                <div className="space-y-4">
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">100% Ethiopian Business Ready</p>
                    <p className="text-[10px] text-slate-400 mt-1">Multi-currency setup supporting ETB as standard base value ledger.</p>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Zero Internet dependency</p>
                    <p className="text-[10px] text-slate-400 mt-1">Saves all data to secure LocalStorage cache. Never lose transaction logs.</p>
                  </div>
                </div>

                <div className="text-slate-400 text-[10px] font-semibold text-center mt-4">
                  HA-T-ERP-CLIENT-v3.0.4
                </div>
              </div>
            </div>

            {/* Right side: Benefits list */}
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1 rounded-full">
                  {isAmharic ? "ለምን መረጡን?" : "WHY HABESHA TRACKER?"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  {isAmharic ? "የተሻለ አሰራር፣ የላቀ ውጤት!" : "Built to Power Modern Commerce"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {isAmharic 
                    ? "ከሌሎች ሲስተሞች በተለየ መልኩ የሀገር ውስጥ የገበያ ሁኔታዎችን፣ የባንክ አሰራሮችንና የቀን አቆጣጠሮችን ባገናዘበ መልኩ የተሰራ ልዩ መተግበሪያ ነው።"
                    : "No complex servers or configurations. Boot your digital sales ledger in 10 seconds and enjoy absolute accounting visibility from day one."
                  }
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">{isAmharic ? "ፈጣንና ቀላል አጠቃቀም" : "Astonishingly Fast Execution"}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{isAmharic ? "ማንኛውም ሰው በቀላሉ እንዲረዳው ተደርጎ የተሰራ ግልጽና ጽዱ ገጽታ።" : "Optimized UI layout with single-click records. Zero unnecessary training required."}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">{isAmharic ? "አስተማማኝ የደህንነት ጥበቃ" : "Absolute Sandbox Security"}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{isAmharic ? "የእርሶ መረጃ በኮምፒውተርዎ ላይ ብቻ ተቀምጦ እንዲቆይ ያደርጋል።" : "Your accounting ledgers are cached in your local sandbox. Encrypted backups let you restore records anytime."}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">{isAmharic ? "ቀላልና ግልጽ ሪፖርቶች" : "High Contrast PDF Exports"}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{isAmharic ? "ለማንበብ እጅግ ግልጽ የሆኑ ዕለታዊና ወርሃዊ የፒዲኤፍ ሪፖርቶች።" : "Compile high contrast, easy-to-read daily, weekly, or annual PDFs with standard audit compliance details."}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ (ACCORDION SECTION) */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1 rounded-full">
              {isAmharic ? "የሚጠየቁ ጥያቄዎች" : "COMMON QUESTIONS"}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {isAmharic ? "ተደጋግመው የሚነሱ ጥያቄዎችና ምላሾች" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-bold text-slate-950 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors focus:outline-hidden"
                  >
                    <span>{isAmharic ? faq.qAm : faq.qEn}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-6 pb-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                          {isAmharic ? faq.aAm : faq.aEn}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-16 lg:py-24 relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-y border-emerald-500/30 shadow-2xl">
        {/* Soft decorative background visuals */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {isAmharic ? "ንግድዎን በዘመናዊ መንገድ መምራት ይጀምሩ!" : "Start Managing Your Business Today"}
          </h2>
          
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
            {isAmharic 
              ? "ምንም አይነት ተጨማሪ ክፍያ ሳይኖርዎት አሁኑኑ በነጻ በመመዝገብ ዕለታዊ ሽያጮችንና የወጪ ሂሳቦችን በከፍተኛ ደረጃ መቆጣጠር ይጀምሩ።" 
              : "Experience high-contrast reports, live grain/tech inventory reconciliations, and automatic local data synchronization."
            }
          </p>

          <div className="pt-4">
            <button
              onClick={handleSignUp}
              className="px-8 py-4 bg-white text-emerald-700 font-extrabold rounded-xl hover:bg-slate-50 transition duration-150 shadow-xl shadow-emerald-950/20 text-sm inline-flex items-center gap-2"
              id="btn-cta-signup-bottom"
            >
              {isAmharic ? "አሁኑኑ በነጻ ይጀምሩ" : "Create Free Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-emerald-200/80 text-[11px] font-medium">
            {isAmharic ? "ክሬዲት ካርድ አያስፈልግም • ፈጣን ምዝገባ" : "No installation required • Fully secure sandbox client"}
          </p>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white dark:bg-[#080D1A] border-t border-slate-100 dark:border-slate-900/60 py-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Branding */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm">H</div>
                <span className="font-bold text-slate-950 dark:text-white text-sm">Habesha Tracker</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {isAmharic 
                  ? "ለኢትዮጵያ ንግዶች የተዘጋጀ የመጀመሪያው የተሟላና ዘመናዊ የዕቃ ቁጥጥርና ሽያጭ መከታተያ የERP ዳሽቦርድ መተግበሪያ።" 
                  : "Empowering retailers, distributors, grains exporters, and tech-hubs in Ethiopia with zero friction bookkeeping."
                }
              </p>
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">{isAmharic ? "አገልግሎቶች" : "SaaS Products"}</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-emerald-500 transition-colors">{isAmharic ? "የዕቃ ቁጥጥር" : "Inventory Ledger"}</a></li>
                <li><a href="#features" className="hover:text-emerald-500 transition-colors">{isAmharic ? "ሽያጭ መመዝገቢያ" : "Sales Tracker"}</a></li>
                <li><a href="#features" className="hover:text-emerald-500 transition-colors">{isAmharic ? "የወጪና ብድር መዝገብ" : "Loans & Credit"}</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">{isAmharic ? "ሀብቶች & ድጋፍ" : "Resources & Support"}</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setActiveDocument('about')} className="hover:text-emerald-500 transition-colors text-left cursor-pointer focus:outline-hidden">{isAmharic ? "ስለ እኛ (About Us)" : "About Us"}</button></li>
                <li><button onClick={() => setActiveDocument('contact')} className="hover:text-emerald-500 transition-colors text-left cursor-pointer focus:outline-hidden">{isAmharic ? "ያግኙን (Contact Us)" : "Contact Us"}</button></li>
                <li><button onClick={() => setActiveDocument('support')} className="hover:text-emerald-500 transition-colors text-left cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400 focus:outline-hidden">{isAmharic ? "የቴሌግራም ድጋፍ (Support)" : "Telegram Support"}</button></li>
                <li><a href="#faq" className="hover:text-emerald-500 transition-colors">{isAmharic ? "ተደጋግመው የሚነሱ ጥያቄዎች" : "FAQ"}</a></li>
              </ul>
            </div>

            {/* Social / Contact info */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">{isAmharic ? "አድራሻ" : "Corporate Office"}</h4>
              <p className="leading-relaxed">
                Addis Ababa, Ethiopia <br />
                {isAmharic ? "ስልክ: 0986580996" : "Phone: +251 986 580 996"} <br />
                Support: support@habeshatracker.et
              </p>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} Habesha Tracker Cloud Systems. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => setActiveDocument('terms')} className="hover:text-emerald-500 transition-colors cursor-pointer focus:outline-hidden">{isAmharic ? "ውሎችና ደንቦች" : "Terms of Service"}</button>
              <button onClick={() => setActiveDocument('privacy')} className="hover:text-emerald-500 transition-colors cursor-pointer focus:outline-hidden">{isAmharic ? "የግል መረጃ ጥበቃ" : "Privacy Policy"}</button>
            </div>
          </div>

        </div>
      </footer>

      {/* Dynamic Document Modal */}
      <AnimatePresence>
        {activeDocument && (() => {
          const doc = docContent[activeDocument];
          if (!doc) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop blur & overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveDocument(null)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Container */}
              <motion.div 
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col z-10 text-left"
                id="landing-doc-modal"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                      {doc.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-950 dark:text-white text-base sm:text-lg tracking-tight">
                        {isAmharic ? doc.titleAm : doc.titleEn}
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                        {isAmharic ? 'የሀበሻ ትራከር መረጃ ማዕከል' : 'Habesha Tracker Resource Hub'}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveDocument(null)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-hidden cursor-pointer"
                    aria-label="Close modal"
                    id="btn-close-doc-modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 overflow-y-auto text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-h-[60vh]">
                  {isAmharic ? doc.contentAm : doc.contentEn}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 text-[10px] sm:text-xs text-slate-400">
                  <span>© {new Date().getFullYear()} Habesha Tracker Systems.</span>
                  <button 
                    onClick={() => setActiveDocument(null)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition cursor-pointer text-xs focus:outline-hidden"
                    id="btn-modal-close-footer"
                  >
                    {isAmharic ? 'ዝጋ' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
