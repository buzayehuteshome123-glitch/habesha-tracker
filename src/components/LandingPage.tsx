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
  Users, 
  CreditCard, 
  Sparkles, 
  ArrowRight,
  Zap,
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
  FileSpreadsheet,
  FileText,
  BadgePercent,
  CheckCircle,
  HelpCircle,
  ArrowRightLeft
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

// Global localization dictionary for SaaS landing page
const translations = {
  en: {
    nav: {
      features: "Features",
      whyUs: "Why Us",
      faq: "FAQ",
      pricing: "Pricing",
      aboutUs: "About Us",
      contactUs: "Contact Us",
      support: "Support / Telegram",
      logIn: "Log In",
      startTrial: "Get Started Free"
    },
    hero: {
      badge: "Built for Ethiopian Businesses 🇪🇹",
      title: "Manage Your Entire Business in One Place",
      subtitle: "Habesha Tracker helps Ethiopian businesses manage inventory, sales, customer debts, expenses, profits, and subscriptions from one secure cloud platform.",
      ctaStart: "Get Started Free",
      ctaDemo: "Live Dashboard Preview",
      badgeSecure: "Secure Cloud Storage",
      badgeBackup: "Automatic Backup",
      badgeDevices: "Mobile & Desktop",
      badgeLocal: "Built for Ethiopia"
    },
    mockup: {
      title: "Ethiopian Banking & Wallet Summary",
      badgeText: "Live Ledger",
      subtitle: "Real-time ledger overview for your active Ethiopian financial channels.",
      saleAmount: "Sales Amount (ETB)",
      profitMargin: "Profit Margin (%)",
      estimatedProfit: "Estimated Net Profit",
      recordBtn: "Save Mock Transaction",
      revenue: "Cash on Hand",
      bankBal: "Total in Bank",
      stockVal: "Telebirr Wallet",
      growthText: "↑ 14% sales growth",
      cbeText: "CBE / Telebirr reconciled",
      latestSales: "Live Mock Transactions",
      cash: "Cash on Hand",
      bankTransfer: "Total in Bank",
      telebirr: "Telebirr Wallet"
    },
    features: {
      sectionBadge: "UNRIVALED FEATURES",
      sectionTitle: "Everything You Need to Scale Your Retail Business",
      sectionDesc: "A complete operational suite designed to prevent financial leakages, manage stock balances, and track digital bank transactions.",
      items: [
        {
          title: "Inventory Management",
          desc: "Track stock quantities in real time, receive low-stock email/SMS alerts, and easily manage unlimited products and variants."
        },
        {
          title: "Sales Tracking",
          desc: "Record daily customer transactions instantly with divided cash, bank transfer, and Telebirr payment method records."
        },
        {
          title: "Customer Debt Ledger",
          desc: "Keep absolute control over customer receivables. Track individual payment histories and absolute credit records."
        },
        {
          title: "Business Analytics",
          desc: "Monitor your net profits, revenue, operating margins, and seasonal store performance in an elegant graphical dashboard."
        },
        {
          title: "PDF & Excel Reports",
          desc: "Generate professional business performance reports, inventory summaries, and cash flow exports in a single click."
        },
        {
          title: "Secure Cloud Backup",
          desc: "Automatically synchronize and safeguard your business registers with zero manual effort. Your logs are always accessible."
        }
      ]
    },
    whyUs: {
      badge: "WHY CHOOSE US",
      title: "Designed Specifically for Ethiopian Commerce",
      desc: "Unlike complex, rigid international accounting software, Habesha Tracker respects localized financial dynamics, payment channels, and operational rhythms.",
      stats: [
        { value: "99.9%", label: "Cloud Uptime" },
        { value: "100%", label: "Secure Isolation" },
        { value: "24/7", label: "Instant Synchronization" },
        { value: "Unlimited", label: "Growth Potential" }
      ],
      list: [
        {
          title: "Extremely Clean UX",
          desc: "No training required. Designed so any retail worker or business manager can record sales in less than 3 seconds."
        },
        {
          title: "Dual Language Support",
          desc: "Easily toggle the entire application workspace between English and Amharic with one click."
        },
        {
          title: "Localized Financial Rails",
          desc: "Built-in options for Telebirr, CBE Birr, Awash Bank, Dashen Bank, and standard cash splits."
        }
      ]
    },
    pricing: {
      badge: "MEMBERSHIP",
      title: "One Premium Plan. Unlimited Growth.",
      desc: "Become an early adopter and join our Founding Merchant circle with full lifetime benefits.",
      planName: "Founding Merchant Plan",
      planDesc: "Perfect for retail shops, wholesalers, grain exporters, and growing Ethiopian enterprises.",
      price: "199 Br",
      pricePeriod: "/ month",
      priceSub: "Billed annually or 299 Br monthly. No hidden fees.",
      buttonText: "Become a Founding Merchant",
      limitedOffer: "🔥 Exclusive Limited Offer for early sign-ups",
      features: [
        "Unlimited Products & Stock Tracking",
        "Advanced Real-time Analytics & Profits",
        "Automatic Secure Cloud Backup",
        "Unlimited PDF Reports Generation",
        "Excel & CSV Data Exports",
        "Multi-device Synchronized Access",
        "24/7 Priority Support & Free Onboarding"
      ]
    },
    steps: {
      badge: "HOW IT WORKS",
      title: "Five Simple Steps to Financial Clarity",
      desc: "Transform how you run your store in less than 5 minutes. No complex setups or expensive consultants.",
      items: [
        { step: "Step 1", title: "Create Free Account", desc: "Sign up with your email. No credit card required." },
        { step: "Step 2", title: "Complete Profile", desc: "Enter your store name, category, and preferred language." },
        { step: "Step 3", title: "Add Products", desc: "Upload your catalog, define costs, selling prices, and alert levels." },
        { step: "Step 4", title: "Record Sales", desc: "Process client transactions and choose Cash, CBE Bank, or Telebirr." },
        { step: "Step 5", title: "Grow Your Business", desc: "Analyze profit trends, track customer debts, and export PDF summaries." }
      ]
    },
    faq: {
      badge: "SUPPORT CENTER",
      title: "Frequently Asked Questions",
      items: [
        {
          q: "How do I upgrade to the premium plan?",
          a: "Upgrading is simple! You can upgrade directly from your business settings tab or contact our local support specialists. We support convenient payments through local bank transfers (C CBE, Awash, Dashen) or Telebirr."
        },
        {
          q: "Is my data secure?",
          a: "Yes, absolutely. Your database is isolated using advanced cloud firewalls and protected continuously with real-time automatic backup. We adhere to top-tier enterprise encryption to guarantee that only you can access your commercial records."
        },
        {
          q: "Can I access my account on multiple devices?",
          a: "Yes! Habesha Tracker is a fully synchronized cross-platform web application. You can simultaneously log in and manage your business from a laptop, office tablet, or a personal smartphone, and all logs stay in perfect sync."
        },
        {
          q: "Do I need accounting or bookkeeping experience?",
          a: "Not at all. Habesha Tracker was built for busy merchants and store owners. We replaced dry, complex double-entry ledger terminology with intuitive buttons, simple stock alerts, and automated net profit trackers."
        },

        {
          q: "Can I get a free tutorial?",
          a: "Yes, 100%! We offer comprehensive video tutorials, interactive Telegram walkthroughs, and step-by-step manuals in both Amharic and English. Premium founding merchants can also request a free 1-on-1 staff training session."
        }
      ]
    },
    cta: {
      title: "Ready to Modernize Your Business?",
      subtitle: "Join progressive Ethiopian businesses using Habesha Tracker to protect inventory, secure customer loans, and run commercial operations with confidence.",
      button: "Start Free Today",
      microText: "No credit card required • Instant setup in 15 seconds"
    },
    footer: {
      companyDesc: "Empowering retailers, distributors, wholesalers, and grain exporters in Ethiopia with modern bookkeeping tools.",
      rights: "Habesha Tracker Cloud Systems. All rights reserved.",
      columns: {
        product: "SaaS Product",
        resources: "Resources",
        contact: "Addis Ababa Office"
      }
    }
  },
  am: {
    nav: {
      features: "ልዩ ባህሪያት",
      whyUs: "ለምን መረጡን",
      faq: "ጥያቄዎች",
      pricing: "ዋጋ",
      aboutUs: "ስለ እኛ",
      contactUs: "ያግኙን",
      support: "ቴሌግራም ድጋፍ",
      logIn: "ግባ",
      startTrial: "በነጻ ይጀምሩ"
    },
    hero: {
      badge: "ለኢትዮጵያ ንግዶች የተሰራ 🇪🇹",
      title: "አጠቃላይ ንግድዎን በአንድ ቦታ ያስተዳድሩ",
      subtitle: "የሀበሻ ትራከር የኢትዮጵያ የንግድ ድርጅቶች የዕቃ ክምችት፣ ሽያጭ፣ የደንበኞች እዳ፣ ወጪ፣ ትርፍ እና የደንበኝነት ክፍያዎችን በአንድ ደህንነቱ በተጠበቀ የደመና (cloud) መድረክ ላይ እንዲያስተዳድሩ ይረዳል።",
      ctaStart: "በነጻ ይጀምሩ",
      ctaDemo: "ቀጥታ የዳሽቦርድ ማሳያ",
      badgeSecure: "ደህንነቱ የተጠበቀ ደመና",
      badgeBackup: "አውቶማቲክ መጠባበቂያ",
      badgeDevices: "በስልክና በኮምፒውተር",
      badgeLocal: "ለሀገር ውስጥ የተዘጋጀ"
    },
    mockup: {
      title: "የኢትዮጵያ ባንክ እና የዲጂታል ዋሌት ማጠቃለያ",
      badgeText: "የቀጥታ ሂሳብ መዝገብ (Live Ledger)",
      subtitle: "ለእርስዎ ንቁ የኢትዮጵያ የፋይናንስ አማራጮች የቀጥታ የሂሳብ መዝገብ አጠቃላይ እይታ።",
      saleAmount: "የሽያጭ ዋጋ (Br)",
      profitMargin: "የትርፍ መጠን (%)",
      estimatedProfit: "የተጣራ የተገመተ ትርፍ",
      recordBtn: "በመዝገቡ ላይ ይመዝግቡ",
      revenue: "በእጅ ላይ ያለ ጥሬ ገንዘብ",
      bankBal: "በባንክ ያለው አጠቃላይ ሂሳብ",
      stockVal: "የቴሌብር የሂሳብ መጠን",
      growthText: "↑ 14% የሽያጭ እድገት",
      cbeText: "ባንክና ቴሌብር ተጣጥሟል",
      latestSales: "የቀጥታ የሽያጭ ልምምድ",
      cash: "በእጅ ላይ ያለ ጥሬ ገንዘብ",
      bankTransfer: "በባንክ ያለው አጠቃላይ ሂሳብ",
      telebirr: "የቴሌብር የሂሳብ መጠን"
    },
    features: {
      sectionBadge: "የተሟሉ አገልግሎቶች",
      sectionTitle: "ለንግድዎ ስኬት የሚያስፈልጉ ዘመናዊ መቆጣጠሪያዎች",
      sectionDesc: "የዕቃዎች ክምችት እንዳይባክን ለመከላከል፣ የብድር ቀሪዎችን ለመቆጣጠርና ዕለታዊ ሽያጮችን በትክክል ለመመዝገብ የሚረዱ ልዩ መተግበሪያዎች።",
      items: [
        {
          title: "የዕቃ ክምችት ቁጥጥር",
          desc: "የዕቃዎችን መጠን በየሴኮንዱ ይከታተሉ፣ ያለቁ ዕቃዎች ማስጠንቀቂያዎችን በኢሜይል ወይም በኤስኤምኤስ ያግኙ፣ እና ያልተገደበ ምርቶችን ያስተዳድሩ።"
        },
        {
          title: "የሽያጭ መከታተያ",
          desc: "ዕለታዊ ሽያጮችን በእጅ ገንዘብ፣ በባንክ ማስተላለፊያ (CBE, Awash ወዘተ) እና በቴሌብር የክፍያ መንገዶች በቅጽበት ይመዝግቡ።"
        },
        {
          title: "የደንበኞች እዳ (ዱቤ)",
          desc: "የደንበኞችን የዱቤ መዝገብ እና ክፍያዎችን ሙሉ በሙሉ ይቆጣጠሩ። የእያንዳንዱን ደንበኛ የክፍያ ታሪክ በጥራት ይከታተሉ።"
        },
        {
          title: "የንግድ ትንተና (Analytics)",
          desc: "የተጣራ ትርፍዎን፣ ወጪዎችን እና የንግድዎን ዕድገት በሚያምሩ ግራፎች እና ዝርዝር የሽያጭ ማጠቃለያዎች ይመልከቱ።"
        },
        {
          title: "የፒዲኤፍ እና ኤክሴል ሪፖርቶች",
          desc: "የንግድዎን አፈጻጸም ሪፖርቶች፣ የዕቃ ክምችት ዝርዝሮችን እና የገንዘብ እንቅስቃሴዎችን በአንድ ጠቅታ ያውርዱ።"
        },
        {
          title: "አስተማማኝ የደመና መጠባበቂያ",
          desc: "የንግድ መረጃዎችዎ ደህንነታቸው ተጠብቆ በራስ-ሰር ደመና (Cloud) ላይ እንዲቀመጡ ያድርጉ። ያለ ኢንተርኔትም ይሰራል።"
        }
      ]
    },
    whyUs: {
      badge: "ለምን መረጡን?",
      title: "ለኢትዮጵያ ንግዶች ፍላጎት የተበጀ ልዩ ቴክኖሎጂ",
      desc: "ሀበሻ ትራከር ከሌሎች የውጭ አገር ሲስተሞች በተለየ መልኩ የሀገር ውስጥ የንግድ ባህሪያትን፣ ዲጂታል ባንኮችን እና የቴሌብር ክፍያዎችን ታሳቢ አድርጎ የተሰራ ነው።",
      stats: [
        { value: "99.9%", label: "የሲስተም ዝግጁነት" },
        { value: "100%", label: "የመረጃ ዋስትና" },
        { value: "24/7", label: "ፈጣን ማመሳሰል" },
        { value: "ያልተገደበ", label: "የንግድ እድገት" }
      ],
      list: [
        {
          title: "ቀላልና ፈጣን አጠቃቀም",
          desc: "ምንም አይነት ስልጠና አያስፈልገውም። ማንኛውም ሠራተኛ በ3 ሰከንድ ውስጥ ሽያጮችን መመዝገብ እንዲችል ተደርጎ የተሰራ ነው።"
        },
        {
          title: "በአማርኛ እና በEnglish",
          desc: "ሲስተሙን ሙሉ በሙሉ በአማርኛ ወይም በEnglish ቋንቋ በአንድ ጠቅታ መቀያየር ይችላሉ።"
        },
        {
          title: "የሀገር ውስጥ ክፍያዎችን ያካተተ",
          desc: "ለቴሌብር፣ ለሲቢኢ ብር፣ ለአዋሽ፣ ለዳሽን እና ለጥሬ ገንዘብ የተዘጋጁ ምቹ የመመዝገቢያ መንገዶች አሉት።"
        }
      ]
    },
    pricing: {
      badge: "የአባልነት ክፍያ",
      title: "አንድ ፕሪሚየም ዕቅድ። ያልተገደበ ስኬት።",
      desc: "አሁኑኑ በመመዝገብ ልዩ ጥቅማ ጥቅሞችን ያካተተውን የ'መስራች ነጋዴ' ዕቅድን በቅናሽ ያግኙ።",
      planName: "የመስራች ነጋዴ (Founding) ዕቅድ",
      planDesc: "ለችርቻሮ ሱቆች፣ ለጅምላ አከፋፋዮች፣ ለእህል ላኪዎች እና ለማንኛውም በማደግ ላይ ለሚገኙ የኢትዮጵያ ንግዶች የተሰራ።",
      price: "199 Br",
      pricePeriod: "/ በወር",
      priceSub: "በዓመት ሲከፈል በወር 199 ብር። በየወሩ ከሆነ 299 ብር። ምንም የተደበቀ ክፍያ የለም።",
      buttonText: "መስራች ነጋዴ ይሁኑ",
      limitedOffer: "🔥 ቀድመው ለሚመዘገቡ ብቻ የሚቀርብ ልዩ የዕድሜ ልክ ቅናሽ",
      features: [
        "ያልተገደበ ምርቶች እና የክምችት ክትትል",
        "የላቀ የእውነተኛ ጊዜ የትርፍና ሽያጭ ትንተና",
        "ደህንነቱ የተጠበቀ አውቶማቲክ የደመና መጠባበቂያ",
        "ያልተገደበ የፒዲኤፍ ሪፖርቶች ማመንጨት",
        "በኤክሴል እና በCSV መረጃዎችን ማውጣት",
        "በስልክ እና በኮምፒውተር በአንድ ላይ መጠቀም",
        "24/7 ቀዳሚ የቴክኒክ ድጋፍ እና ነጻ ስልጠና"
      ]
    },
    steps: {
      badge: "እንዴት ይሰራል?",
      title: "ለንግድዎ ግልጽነት የሚሰጡ አምስት ቀላል ደረጃዎች",
      desc: "በአምስት ደቂቃ ውስጥ የንግድዎን የሂሳብ አያያዝ ዘመናዊ ያድርጉ። ምንም አይነት ባለሙያ መቅጠር አያስፈልግዎትም።",
      items: [
        { step: "ደረጃ 1", title: "ነጻ መለያ ይፍጠሩ", desc: "በኢሜይል አድራሻዎ ይመዝገቡ። ምንም አይነት የክፍያ ካርድ አይጠይቅም።" },
        { step: "ደረጃ 2", title: "መረጃዎን ያጠናቅቁ", desc: "የሱቅዎን ስም፣ የስራ ዘርፍ እና መጠቀም የሚፈልጉትን ቋንቋ ያስገቡ።" },
        { step: "ደረጃ 3", title: "ምርቶችን ያስገቡ", desc: "የዕቃዎችዎን ዝርዝር፣ የገዙበትንና የሚሸጡበትን ዋጋ ያስገቡ።" },
        { step: "ደረጃ 4", title: "ሽያጮችን ይመዝግቡ", desc: "ሽያጭ ሲያካሂዱ በካሽ፣ በባንክ ወይም በቴሌብር ተከፍሎ እንደሆነ መርጠው ይመዝግቡ።" },
        { step: "ደረጃ 5", title: "ንግድዎን ያሳድጉ", desc: "በትርፍና ኪሳራ ትንተና፣ በብድር ክትትል እና በፒዲኤፍ ሪፖርቶች ንግድዎን ያሳድጉ።" }
      ]
    },
    faq: {
      badge: "የእገዛ ማዕከል",
      title: "ተደጋግመው የሚነሱ ጥያቄዎችና ምላሾች",
      items: [
        {
          q: "እንዴት ወደ ፕሪሚየም ማሻሻል (upgrade) እችላለሁ?",
          a: "ማሻሻል እጅግ በጣም ቀላል ነው! በቀጥታ በመተግበሪያው ቅንብሮች (Settings) ውስጥ ማሻሻል ይችላሉ ወይም የእኛን የድጋፍ ባለሙያዎች ያነጋግሩ። ክፍያዎችን በባንክ ማስተላለፊያ (ንግድ ባንክ፣ አዋሽ፣ ዳሽን) ወይም በቴሌብር መቀበል እንችላለን።"
        },
        {
          q: "የእኔ መረጃ ደህንነቱ የተጠበቀ ነው?",
          a: "አዎ፣ በእርግጠኝነት። መረጃዎችዎ ዘመናዊ ፋየርዎሎችን በመጠቀም ደህንነታቸው በተጠበቀ የውሂብ ጎታዎች ውስጥ ይለያሉ፣ እንዲሁም በየጊዜው በራስ-ሰር መጠባበቂያ (Cloud backup) ይደረጋሉ፤ መረጃዎን እርስዎ ብቻ ማየት ይችላሉ።"
        },
        {
          q: "በተለያዩ መሳሪያዎች በአንድ ጊዜ መጠቀም እችላለሁ?",
          a: "አዎ! ሀበሻ ትራከር ሙሉ ለሙሉ የደመና መተግበሪያ በመሆኑ በኮምፒውተር፣ በታብሌት ወይም በስልክ በአንድ ላይ መግባት ይችላሉ፣ መረጃዎ በሁሉም ላይ ወዲያውኑ ይመሳሰላል።"
        },
        {
          q: "የሂሳብ አያያዝ ልምድ ወይም ትምህርት ያስፈልገኛል?",
          a: "በጭራሽ። መተግበሪያው የተሰራው ምንም የሂሳብ እውቀት የሌላቸው የሱቅ ባለቤቶችም በቀላሉ እንዲረዱት ተደርጎ ነው። ውስብስብ የሆኑ ቃላትን አስቀርተን በቀላሉ ሽያጭ እንዲመዘግቡ አድርገናል።"
        },

        {
          q: "ነጻ የስልጠና ቪዲዮዎችን ማግኘት እችላለሁ?",
          a: "አዎ፣ በእርግጠኝነት! በአማርኛ እና በEnglish የተዘጋጁ ደረጃ በደረጃ የሚያስተምሩ የቪዲዮ ስልጠናዎችን፣ የቴሌግራም የቀጥታ እገዛዎችን እና መመሪያዎችን እናቀርባለን። ፕሪሚየም አባላት ደግሞ በአካል ስልጠና መጠየቅ ይችላሉ።"
        }
      ]
    },
    cta: {
      title: "ንግድዎን በዘመናዊ መንገድ ለመምራት ዝግጁ ነዎት?",
      subtitle: "የዕቃ ክምችትን፣ ሽያጮችን እና ወጪዎችን በልበ ሙሉነት ለመቆጣጠር የሀበሻ ትራከርን የሚጠቀሙ ስኬታማ የኢትዮጵያ ንግዶችን ይቀላቀሉ።",
      button: "ዛሬውኑ በነጻ ይጀምሩ",
      microText: "ምንም አይነት የክፍያ ካርድ አያስፈልግም • በ15 ሰከንድ ውስጥ ይመዝገቡ"
    },
    footer: {
      companyDesc: "በኢትዮጵያ ውስጥ ያሉ የችርቻሮ ሱቆችን፣ አከፋፋዮችን፣ ጅምላ ነጋዴዎችን እና ላኪዎችን በዘመናዊ የሂሳብ አያያዝ ቴክኖሎጂ እናበቃለን።",
      rights: "የሀበሻ ትራከር የደመና ሲስተምስ። መብቱ በህግ የተጠበቀ ነው።",
      columns: {
        product: "አገልግሎቶች",
        resources: "ጠቃሚ ገጾች",
        contact: "የአዲስ አበባ ቢሮ"
      }
    }
  }
};

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
  const t = isAmharic ? translations.am : translations.en;

  // FAQ Accordion Active state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Document modal toggler
  const [activeDocument, setActiveDocument] = useState<'about' | 'contact' | 'support' | 'terms' | 'privacy' | null>(null);

  // Interactive mockup simulator state
  const [demoSaleAmount, setDemoSaleAmount] = useState<number>(3450);
  const [demoProfitMargin, setDemoProfitMargin] = useState<number>(15);
  const [mockSales, setMockSales] = useState<Array<{ name: string; item: string; amount: number; method: string }>>([
    { name: "Almaz Bekele", item: "Red Teff x2 bags", amount: 12400, method: "bank" },
    { name: "Kedir Yusuf", item: "Premium Wheat x5", amount: 8250, method: "telebirr" },
    { name: "Sintayehu Assefa", item: "Sunflower Oil x10L", amount: 2100, method: "cash" }
  ]);
  const [inputName, setInputName] = useState<string>("");
  const [inputItem, setInputItem] = useState<string>("");

  const handleAddMockSale = (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputName.trim() || (isAmharic ? "አዲስ ደንበኛ" : "Walk-in Customer");
    const item = inputItem.trim() || (isAmharic ? "የተለያዩ ምርቶች" : "Assorted Products");
    const methods = ["cash", "bank", "telebirr"];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    
    setMockSales(prev => [
      { name, item, amount: demoSaleAmount, method: randomMethod },
      ...prev.slice(0, 2)
    ]);
    setInputName("");
    setInputItem("");
  };



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

  // Modal Content Data definitions
  const docContent = {
    about: {
      titleEn: "About Habesha Tracker",
      titleAm: "ስለ ሀበሻ ትራከር",
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      contentEn: (
        <div className="space-y-4 text-sm font-sans text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            <strong>Habesha Tracker</strong> was founded in Addis Ababa with a bold mission: to provide world-class, extremely simple cloud technology for Ethiopian small and medium businesses.
          </p>
          <p className="leading-relaxed">
            Our app is custom-tailored to handle local merchant realities: poor internet speed, the explosion of mobile wallets (Telebirr, CBE Birr), and the need for straightforward debt and loan registers (የብድር መዝገብ). We believe accounting software shouldn't require complex corporate training.
          </p>
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/15 mt-6">
            <h5 className="font-bold text-slate-900 dark:text-white mb-1.5 text-xs uppercase tracking-wider">Our Commitment</h5>
            <p className="text-xs">
              To remain 100% focused on local store success, to isolate customer data securely, and to deliver updates that make running physical shops easier every single day.
            </p>
          </div>
        </div>
      ),
      contentAm: (
        <div className="space-y-4 text-sm font-sans text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            <strong>ሀበሻ ትራከር</strong> በአዲስ አበባ የተቋቋመው በአንድ ትልቅ ዓላማ ነው፡ በኢትዮጵያ ውስጥ ላሉ አነስተኛ እና መካከለኛ የንግድ ድርጅቶች ዓለም አቀፍ ደረጃውን የጠበቀ እና እጅግ ቀላል የሆነ የደመና ቴክኖሎጂ ማቅረብ።
          </p>
          <p className="leading-relaxed">
            መተግበሪያችን በአካባቢው ያሉ ነጋዴዎችን ተጨባጭ ሁኔታ ከግምት ውስጥ ያስገባ ነው፡ የኢንተርኔት መቆራረጥን መቋቋም፣ የሞባይል ክፍያዎችን (ቴሌብር፣ CBE ብር) በቀላሉ መመዝገብ፣ እና የደንበኞችን የብድርና ዱቤ መዝገብ (የብድር መዝገብ) በቀላሉ መቆጣጠር። የሂሳብ አያያዝ ሶፍትዌር ረጅም ስልጠና መውሰድን መፈጸም የለበትም ብለን እናምናለን።
          </p>
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/15 mt-6">
            <h5 className="font-bold text-slate-900 dark:text-white mb-1.5 text-xs uppercase tracking-wider">ቃል ኪዳናችን</h5>
            <p className="text-xs">
              ለሀገር ውስጥ ሱቆች ስኬት 100% ትኩረት መስጠት፣ የደንበኞችን መረጃዎች በከፍተኛ ደህንነት መለየት እና የዕለታዊ የሽያጭ ስራዎችን የሚያቃልሉ ዝመናዎችን ዘወትር ማቅረብ።
            </p>
          </div>
        </div>
      )
    },
    contact: {
      titleEn: "Contact Our Addis Ababa Office",
      titleAm: "የአዲስ አበባ ቢሮአችንን ያግኙ",
      icon: <Phone className="w-6 h-6 text-blue-500" />,
      contentEn: (
        <div className="space-y-6 text-sm font-sans text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Have queries, feedback, or want a customized demonstration for your wholesale staff? Reach out directly.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <Phone className="w-5 h-5 text-emerald-500 mt-1" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Customer Helpline</h5>
                <p className="text-xs">+251 986 580 996</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Monday to Saturday: 8:30 AM – 6:30 PM (Local Time)</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <Mail className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Official Email</h5>
                <p className="text-xs">support@habeshatracker.et</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <MapPin className="w-5 h-5 text-amber-500 mt-1" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Office Location</h5>
                <p className="text-xs">Bole, Medhanialem Area, Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </div>
        </div>
      ),
      contentAm: (
        <div className="space-y-6 text-sm font-sans text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            ጥያቄ፣ አስተያየት ካለዎት ወይም ለጅምላ ንግድ ድርጅትዎ ሰራተኞች ልዩ የአጠቃቀም ማሳያ እንዲዘጋጅልዎ ከፈለጉ በቀጥታ ያነጋግሩን።
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <Phone className="w-5 h-5 text-emerald-500 mt-1" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">የደንበኞች አገልግሎት ስልክ</h5>
                <p className="text-xs">0986580996</p>
                <p className="text-[10px] text-slate-400 mt-0.5">ከሰኞ እስከ ቅዳሜ፡ ከጠዋቱ 2:30 እስከ ምሽቱ 12:30</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <Mail className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">ኢሜይል</h5>
                <p className="text-xs">support@habeshatracker.et</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <MapPin className="w-5 h-5 text-amber-500 mt-1" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">የቢሮ አድራሻ</h5>
                <p className="text-xs">ቦሌ፣ መድኃኔዓለም አካባቢ፣ አዲስ አበባ፣ ኢትዮጵያ</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    support: {
      titleEn: "Priority Technical Helpdesk & Telegram",
      titleAm: "የቴክኒክ ድጋፍ እና የቴሌግራም እገዛ",
      icon: <MessageSquare className="w-6 h-6 text-sky-500" />,
      contentEn: (
        <div className="space-y-6 text-sm font-sans text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            We provide around-the-clock technical assistance. Whether setting up stock categories or exporting Excel files, we can support you instantly.
          </p>
          <div className="p-5 bg-sky-500/10 dark:bg-sky-500/5 border border-sky-500/20 rounded-2xl space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white text-sm">Join Our Support Telegram (@Manbuza12)</h5>
            <p className="text-xs leading-relaxed">
              Connect with our live onboarding specialists in Addis Ababa for fast feedback, training manuals, and direct setups.
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
        </div>
      ),
      contentAm: (
        <div className="space-y-6 text-sm font-sans text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            ሙሉ የ24 ሰዓት የቴክኒክ ድጋፍ እናቀርባለን። የዕቃዎችን ምድብ ለማስተካከልም ሆነ የኤክሴል ሪፖርቶችን ለማውጣት በማንኛውም ጊዜ እናግዝዎታለን።
          </p>
          <div className="p-5 bg-sky-500/10 dark:bg-sky-500/5 border border-sky-500/20 rounded-2xl space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white text-sm">የቴሌግራም ድጋፍ ማዕከል (@Manbuza12)</h5>
            <p className="text-xs leading-relaxed">
              በአዲስ አበባ ካሉ የድጋፍ ባለሙያዎቻችን ጋር በቴሌግራም በቀጥታ በመገናኘት ፈጣን ምላሾችን፣ የማስተማሪያ ቪዲዮዎችን እና መመሪያዎችን ያግኙ።
            </p>
            <div className="pt-2">
              <a 
                href="https://t.me/Manbuza12" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-bold rounded-xl transition duration-150 gap-2 shadow-md shadow-sky-500/20"
              >
                ቴሌግራም ድጋፍ ክፈት (@Manbuza12)
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )
    },
    terms: {
      titleEn: "Terms of Service",
      titleAm: "የአጠቃቀም ደንቦች",
      icon: <Shield className="w-6 h-6 text-amber-500" />,
      contentEn: (
        <div className="space-y-4 text-xs sm:text-sm font-sans text-slate-600 dark:text-slate-300">
          <p>By registering on Habesha Tracker, you agree to comply with our localized cloud service terms:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Data Integrity</strong>: You are solely responsible for all inventory items, costs, selling prices, and customer debts recorded in your workspace.</li>
            <li><strong>Licensing</strong>: We grant a personal, non-transferable license to manage your business databases online on our secure environment.</li>
            <li><strong>Usage Limitations</strong>: Reverse-engineering or spamming the server framework API is strictly prohibited.</li>
          </ul>
        </div>
      ),
      contentAm: (
        <div className="space-y-4 text-xs sm:text-sm font-sans text-slate-600 dark:text-slate-300">
          <p>በሀበሻ ትራከር ላይ በመመዝገብ፣ በሚከተሉት የአጠቃቀም ደንቦች ለመገዛት ተስማምተዋል፡</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>የመረጃ ትክክለኛነት</strong>: በዳሽቦርድዎ ላይ ለሚመዘገቡት ምርቶች፣ ዋጋዎች፣ ሽያጮች እና የደንበኛ እዳዎች (ዱቤ) ትክክለኛነት ሙሉ ኃላፊነት የእርስዎ ነው።</li>
            <li><strong>አጠቃቀም</strong>: ንግድዎን በዘመናዊ የደመና ሲስተም ውስጥ በጥንቃቄ ለማስተዳደር የግል እና የማይተላለፍ ፈቃድ ተሰጥቶዎታል።</li>
            <li><strong>ማዕቀቦች</strong>: የደመና አገልጋዮችን (servers) ወይም ሲስተሙን ለማወክ መሞከር በጥብቅ የተከለከለ ነው።</li>
          </ul>
        </div>
      )
    },
    privacy: {
      titleEn: "Privacy & Commercial Secrecy Policy",
      titleAm: "የግል እና የንግድ ሚስጥር ጥበቃ ፖሊሲ",
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      contentEn: (
        <div className="space-y-4 text-xs sm:text-sm font-sans text-slate-600 dark:text-slate-300">
          <p>Your commercial logs are completely secure. We treat store privacy as our primary corporate values:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Zero Inspection</strong>: We do not parse, analyze, or sell your product inventories, customer credit logs, or net profits.</li>
            <li><strong>No Ad Trackers</strong>: We do not serve advertisements and we do not participate in marketing tracker networks.</li>
            <li><strong>Database Exportability</strong>: You maintain the absolute right to export your products or delete your account in full with one click.</li>
          </ul>
        </div>
      ),
      contentAm: (
        <div className="space-y-4 text-xs sm:text-sm font-sans text-slate-600 dark:text-slate-300">
          <p>የንግድ መዝገቦችዎ ፍጹም ሚስጥራዊ ናቸው። የንግድ መረጃዎን መጠበቅ ዋነኛ መርሐችን ነው፡</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>ቁጥጥር የለም</strong>: የእርስዎን ምርቶች፣ የደንበኛ የዱቤ ዝርዝሮች ወይም የተጣራ ትርፍ መረጃዎች እኛ አናይም፣ ለሌላም አናስተላልፍም።</li>
            <li><strong>ከማስታወቂያ ነጻ</strong>: ምንም አይነት ማስታወቂያዎች ወይም የመከታተያ ኮዶች በሲስተማችን ውስጥ የሉም።</li>
            <li><strong>የመረጃ ባለቤትነት</strong>: በማንኛውም ሰዓት መረጃዎን በፒዲኤፍ ማውረድ ወይም መለያዎን ሙሉ በሙሉ ማጥፋት ይችላሉ።</li>
          </ul>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* 1. PREMIUM HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0B0F19]/80 border-b border-slate-200/50 dark:border-slate-900/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand Block */}
          <div className="flex items-center gap-3">
            <svg className="w-10 h-10 shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" id="logo-svg-saas">
              <defs>
                <linearGradient id="primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16A34A" /> {/* Emerald Green */}
                  <stop offset="100%" stopColor="#2563EB" /> {/* Royal Blue */}
                </linearGradient>
                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" /> {/* Gold */}
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="12" fill="url(#primary-grad)" />
              {/* Clean abstract 'H' & Chart combo representing Habesha Tracker */}
              <rect x="11" y="10" width="4" height="20" rx="1" fill="white" />
              <rect x="25" y="10" width="4" height="20" rx="1" fill="white" />
              <rect x="15" y="18" width="10" height="4" fill="white" />
              <circle cx="20" cy="20" r="4" fill="url(#gold-grad)" />
            </svg>
            <div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg block leading-tight font-sans">
                Habesha Tracker
              </span>
            </div>
          </div>

          {/* Quick SaaS Control Toolbar */}
          <div className="flex items-center gap-3">
            {/* Localized Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
              title="Switch Language / ቋንቋ ለመቀየር"
              id="btn-lang-toggle"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{isAmharic ? "English" : "አማርኛ"}</span>
            </button>

            {/* Account CTA Group */}
            <button 
              onClick={handleLogin}
              className="hidden sm:inline-flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition py-2 px-3"
              id="btn-login"
            >
              {t.nav.logIn}
            </button>

            <button 
              onClick={handleSignUp}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition duration-150 cursor-pointer border border-transparent"
              id="btn-signup"
            >
              <span>{t.nav.startTrial}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. MODERN SAAS HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-radial-gradient from-white to-slate-50 dark:from-[#0B0F19] dark:to-[#080B12]">
        
        {/* Soft background radial visual overlays */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero text information column */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-6">
              
              {/* Micro pill badge */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-800 dark:text-emerald-400 text-xs font-bold leading-none mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{t.hero.badge}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 bg-clip-text text-transparent">
                  {t.hero.title}
                </span>
              </h1>

              {/* Subheadline description */}
              <p className="text-slate-500 dark:text-slate-400 text-xs xs:text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                {t.hero.subtitle}
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <button 
                  onClick={handleSignUp}
                  className="px-8 py-4 rounded-xl text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-hero-signup"
                >
                  <span>{t.hero.ctaStart}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a 
                  href="#mockup-simulation"
                  className="px-6 py-4 rounded-xl text-sm font-extrabold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 flex items-center justify-center gap-2"
                >
                  <span>{t.hero.ctaDemo}</span>
                  <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              {/* Horizontal Trust badges row */}
              <div className="pt-8 grid grid-cols-2 gap-4 border-t border-slate-200/50 dark:border-slate-900/60 text-slate-500 dark:text-slate-400 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-emerald-500">🔒</span>
                  <span>{t.hero.badgeSecure}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-emerald-500">☁</span>
                  <span>{t.hero.badgeBackup}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-emerald-500">📱</span>
                  <span>{t.hero.badgeDevices}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-emerald-500">🇪🇹</span>
                  <span>{t.hero.badgeLocal}</span>
                </div>
              </div>

            </div>

            {/* Hero Right Visual Column: Modern business dashboard mockup with charts, inventory, sales, and analytics */}
            <div className="lg:col-span-7 relative" id="mockup-simulation">
              
              <div className="relative mx-auto max-w-lg lg:max-w-none w-full bg-white dark:bg-slate-900/40 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl backdrop-blur-md">
                
                {/* Decorative gradients */}
                <div className="absolute -top-3 -right-3 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-3 -left-3 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Dashboard mock browser frame bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 mb-5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400 block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 block" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-1 rounded-lg text-[10px] font-mono text-slate-500 dark:text-slate-400 select-none border border-slate-200/30 dark:border-slate-800/30">
                    habeshatracker.et/demo
                  </div>
                  <div className="w-12 h-1" />
                </div>

                {/* Simulated live telemetry metrics */}
                <div className="space-y-4">
                  
                  {/* Top Stats Cards Row */}
                  <div className="grid grid-cols-3 gap-1.5 xs:gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-2 xs:p-3 rounded-xl xs:rounded-2xl shadow-xs flex flex-col justify-between min-h-[75px] xs:min-h-[85px]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[8px] xs:text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block leading-none">
                          {t.mockup.revenue}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                          <span className="text-[10px]" role="img" aria-label="cash">💵</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
                          14,230 Br
                        </p>
                        <span className="text-[8px] xs:text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5 leading-none">
                          ↑ 12.4%
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-2 xs:p-3 rounded-xl xs:rounded-2xl shadow-xs flex flex-col justify-between min-h-[75px] xs:min-h-[85px]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[8px] xs:text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block leading-none">
                          {t.mockup.bankBal}
                        </span>
                        <img 
                          src="https://vectorseek.com/wp-content/uploads/2026/04/Commercial-Bank-of-Ethiopia-Logo-PNG-SVG-Vector-01.png" 
                          className="w-5 h-5 object-contain rounded-xs shrink-0" 
                          alt="CBE" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                          320,000 Br
                        </p>
                        <span className="text-[7px] xs:text-[8px] text-slate-400 font-medium block mt-0.5 leading-none truncate">
                          CBE
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-2 xs:p-3 rounded-xl xs:rounded-2xl shadow-xs flex flex-col justify-between min-h-[75px] xs:min-h-[85px]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[8px] xs:text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block leading-none">
                          {t.mockup.stockVal}
                        </span>
                        <img 
                          src="https://cdn.brandfetch.io/idAe1C3sxm/w/400/h/400/theme/light/icon.png" 
                          className="w-5 h-5 object-contain rounded-xs shrink-0" 
                          alt="Telebirr" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://cdn.brandfetch.io/idAe1C3sxm/theme/light/logo.svg";
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-xs xs:text-sm sm:text-base font-extrabold text-amber-500 mt-0.5 font-mono">
                          745,000 Br
                        </p>
                        <span className="text-[7px] xs:text-[8px] text-rose-500 font-bold block mt-0.5 leading-none truncate">
                          telebirr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Pricing/Profits Ledger Simulator */}
                  <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800/80 p-4 rounded-2xl">
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold uppercase tracking-wider block w-fit mb-1 leading-none">
                          {t.mockup.badgeText}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-tight">
                          {t.mockup.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug font-medium">
                          {t.mockup.subtitle}
                        </p>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-mono font-bold shrink-0 ml-2">
                        100% Client Sync
                      </span>
                    </div>

                    {/* Dual sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                          {t.mockup.saleAmount}
                        </label>
                        <input 
                          type="range" 
                          min="1000" 
                          max="25000" 
                          step="500"
                          value={demoSaleAmount}
                          onChange={(e) => setDemoSaleAmount(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-ew-resize h-1 bg-slate-200 dark:bg-slate-800 rounded-lg"
                        />
                        <div className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                          {demoSaleAmount.toLocaleString()} Br
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                          {t.mockup.profitMargin}
                        </label>
                        <input 
                          type="range" 
                          min="5" 
                          max="40" 
                          step="1"
                          value={demoProfitMargin}
                          onChange={(e) => setDemoProfitMargin(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-ew-resize h-1 bg-slate-200 dark:bg-slate-800 rounded-lg"
                        />
                        <div className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                          {demoProfitMargin}%
                        </div>
                      </div>
                    </div>

                    {/* Simulation Calculations Input Form */}
                    <form onSubmit={handleAddMockSale} className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder={isAmharic ? "ደንበኛ ስም (ለምሳሌ፦ አልማዝ)" : "Customer name"} 
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
                      />
                      <input 
                        type="text" 
                        placeholder={isAmharic ? "ዕቃ ዓይነት (ለምሳሌ፦ ጤፍ)" : "Product item"} 
                        value={inputItem}
                        onChange={(e) => setInputItem(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
                      />
                      <button 
                        type="submit"
                        className="col-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{t.mockup.recordBtn}</span>
                      </button>
                    </form>

                    {/* Calculated Output Display Box */}
                    <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-wider">
                          {t.mockup.estimatedProfit}
                        </span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                          {((demoSaleAmount * demoProfitMargin) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Br
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-wider">Store Margin</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                          +{(demoProfitMargin).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Mock live transaction entries */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                        {t.mockup.latestSales}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    
                    <div className="p-2 space-y-1.5 max-h-40 overflow-y-auto">
                      <AnimatePresence initial={false}>
                        {mockSales.map((sale, i) => (
                          <motion.div 
                            key={i + "-" + sale.name}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between text-xs p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold">
                                {sale.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 dark:text-white leading-tight">{sale.name}</p>
                                <p className="text-[10px] text-slate-400 leading-tight">{sale.item}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-extrabold text-slate-900 dark:text-white">+{sale.amount.toLocaleString()} Br</p>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-extrabold ${
                                sale.method === 'telebirr' 
                                  ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400' 
                                  : sale.method === 'bank' 
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                              }`}>
                                {sale.method === 'telebirr' ? t.mockup.telebirr : sale.method === 'bank' ? t.mockup.bankTransfer : t.mockup.cash}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                  </div>

                </div>

              </div>

              {/* Floating aesthetic labels */}
              <div className="absolute -top-4 -left-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-3 shadow-xl hidden sm:flex items-center gap-2 select-none animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200">
                  {t.mockup.growthText}
                </span>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-3 shadow-xl hidden sm:flex items-center gap-2 select-none">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200">
                  {t.mockup.cbeText}
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>



      {/* 4. BEAUTIFUL FEATURES GRID */}
      <section id="features" className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-24">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1.5 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest leading-none">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.features.sectionBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
              {t.features.sectionTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">
              {t.features.sectionDesc}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feat, i) => {
              const icons = [
                <Database className="w-5 h-5 text-emerald-600" />,
                <TrendingUp className="w-5 h-5 text-blue-600" />,
                <Users className="w-5 h-5 text-amber-500" />,
                <BarChart3 className="w-5 h-5 text-blue-600" />,
                <FileText className="w-5 h-5 text-emerald-600" />,
                <Shield className="w-5 h-5 text-emerald-600" />
              ];
              return (
                <div 
                  key={i}
                  onClick={handleSignUp}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-xs hover:shadow-xl hover:border-emerald-500/20 dark:hover:border-emerald-500/30 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none" />

                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                    {icons[i] || <Check className="w-5 h-5 text-emerald-600" />}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {feat.desc}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{isAmharic ? "አሁኑኑ ይሞክሩ" : "Try feature now"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. WHY CHOOSE US (TWO COLUMN SECTION) */}
      <section id="why-choose-us" className="py-20 lg:py-32 bg-slate-100/60 dark:bg-slate-950/30 border-y border-slate-200/50 dark:border-slate-900/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left side: Checklist illustration */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500/5 via-slate-50 to-blue-500/5 dark:from-emerald-500/5 dark:via-slate-900/50 dark:to-blue-500/5 p-8 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between relative shadow-lg">
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                      LOCALIZED PLATFORM
                    </span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                </div>

                {/* Vertical layout list inside mock device */}
                <div className="space-y-4 my-6">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">🇪🇹</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">100% Ethiopian Commerce Ready</p>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Multi-currency settings optimized with ETB as baseline ledgers.</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">📶</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Robust Cloud Database Isolation</p>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Instantly synchronize to cloud. Your commercial entries stay isolated securely.</p>
                  </div>
                </div>

                <div className="text-slate-400 dark:text-slate-500 text-[9px] font-mono font-bold text-center">
                  HABESHA-TRACKER-CORE-v4.0
                </div>
              </div>
            </div>

            {/* Right side: SaaS Benefits list */}
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase bg-blue-500/10 dark:bg-blue-500/5 px-3 py-1.5 rounded-full leading-none w-fit block">
                  {t.whyUs.badge}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                  {t.whyUs.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  {t.whyUs.desc}
                </p>
              </div>

              {/* Grid of stats */}
              <div className="grid grid-cols-2 gap-2 xs:gap-4">
                {t.whyUs.stats.map((stat, i) => (
                  <div key={i} className="p-3 xs:p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl xs:rounded-2xl">
                    <p className="text-lg xs:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono leading-none">
                      {stat.value}
                    </p>
                    <p className="text-[9px] xs:text-[11px] font-bold text-slate-400 uppercase mt-1.5 xs:mt-2 tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bullet advantages list */}
              <div className="space-y-4 pt-2">
                {t.whyUs.list.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mt-1 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (TIMELINE SECTION) */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-white dark:bg-[#0B0F19]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16 lg:mb-24">
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1.5 rounded-full leading-none">
              {t.steps.badge}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {t.steps.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {t.steps.desc}
            </p>
          </div>

          {/* Timeline steps */}
          <div className="relative">
            {/* Timeline connection line (horizontal on desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-12 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {t.steps.items.map((item, idx) => (
                <div key={idx} className="text-center space-y-4">
                  {/* Step icon number indicator */}
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-lg mx-auto shadow-sm relative group-hover:border-emerald-500 transition-colors">
                    {idx + 1}
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-md text-[9px] font-mono font-bold uppercase text-slate-500">
                      {item.step}
                    </span>
                  </div>

                  <div className="space-y-1.5 px-2">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>



      {/* 8. FAQ (ACCORDION SECTION) */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase bg-blue-500/10 dark:bg-blue-500/5 px-3 py-1.5 rounded-full leading-none">
              {t.faq.badge}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
              {t.faq.title}
            </h2>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {t.faq.items.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-extrabold text-slate-950 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors focus:outline-hidden cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{faq.q}</span>
                    </span>
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
                        <div className="px-6 pb-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-150 dark:border-slate-800 pt-4 font-medium">
                          {faq.a}
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

      {/* 9. HIGH CONVERSION CTA SECTION */}
      <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-y border-emerald-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {t.cta.title}
          </h2>
          
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto font-semibold">
            {t.cta.subtitle}
          </p>

          <div className="pt-4">
            <button
              onClick={handleSignUp}
              className="px-8 py-4 bg-white text-emerald-700 font-extrabold rounded-2xl hover:bg-slate-50 transition duration-150 shadow-xl shadow-emerald-950/20 text-sm inline-flex items-center gap-2 cursor-pointer border border-transparent"
              id="btn-bottom-cta"
            >
              <span>{t.cta.button}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-emerald-200/80 text-xs font-bold font-mono">
            {t.cta.microText}
          </p>
        </div>
      </section>

      {/* 10. SAAS FOOTER */}
      <footer className="bg-white dark:bg-[#080D1A] border-t border-slate-200/60 dark:border-slate-900/60 py-16 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Branding Column */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">H</div>
                <span className="font-bold text-slate-950 dark:text-white text-base">Habesha Tracker</span>
              </div>
              <p className="text-[11px] leading-relaxed font-semibold">
                {t.footer.companyDesc}
              </p>
            </div>

            {/* Product capabilities links */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">
                {t.footer.columns.product}
              </h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{isAmharic ? "የዕቃ ቁጥጥር" : "Stock Valuation"}</a></li>
                <li><a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{isAmharic ? "ሽያጭ መመዝገቢያ" : "Daily Sales Entry"}</a></li>
                <li><a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{isAmharic ? "የወጪና ብድር መዝገብ" : "Debt History Ledger"}</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">
                {t.footer.columns.resources}
              </h4>
              <ul className="space-y-2">
                <li><button onClick={() => setActiveDocument('about')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">{isAmharic ? "ስለ ሀበሻ ትራከር" : "About Us"}</button></li>
                <li><button onClick={() => setActiveDocument('contact')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer">{isAmharic ? "ያግኙን" : "Contact Us"}</button></li>
                <li><button onClick={() => setActiveDocument('support')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer">{isAmharic ? "ቴሌግራም ድጋፍ (Telegram)" : "Telegram Helpline"}</button></li>
                <li><a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t.nav.faq}</a></li>
              </ul>
            </div>

            {/* Office Column */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-[10px]">
                {t.footer.columns.contact}
              </h4>
              <p className="leading-relaxed font-semibold">
                Addis Ababa, Ethiopia <br />
                {isAmharic ? "ስልክ: 0986580996" : "Phone: +251 986 580 996"} <br />
                Email: support@habeshatracker.et
              </p>
            </div>

          </div>

          {/* Legal Bar */}
          <div className="pt-8 border-t border-slate-200/50 dark:border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} {t.footer.rights}</p>
            <div className="flex gap-4">
              <button onClick={() => setActiveDocument('terms')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">{isAmharic ? "የአጠቃቀም ደንቦች" : "Terms of Service"}</button>
              <button onClick={() => setActiveDocument('privacy')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">{isAmharic ? "የግል መረጃ ጥበቃ" : "Privacy Policy"}</button>
            </div>
          </div>

        </div>
      </footer>

      {/* DYNAMIC DOCUMENT MODALS */}
      <AnimatePresence>
        {activeDocument && (() => {
          const doc = docContent[activeDocument];
          if (!doc) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay Backdrop */}
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
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col z-10 text-left"
                id="landing-doc-modal"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                      {doc.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-950 dark:text-white text-base sm:text-lg tracking-tight leading-tight">
                        {isAmharic ? doc.titleAm : doc.titleEn}
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
                        {isAmharic ? 'የሀበሻ ትራከር መረጃ ማዕከል' : 'Habesha Tracker Resource Hub'}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveDocument(null)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    aria-label="Close modal"
                    id="btn-close-modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 overflow-y-auto text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-h-[60vh] font-medium">
                  {isAmharic ? doc.contentAm : doc.contentEn}
                </div>

                {/* Footer bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between shrink-0 text-[10px] sm:text-xs text-slate-400">
                  <span>© {new Date().getFullYear()} Habesha Tracker.</span>
                  <button 
                    onClick={() => setActiveDocument(null)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition cursor-pointer text-xs"
                    id="btn-modal-close"
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
