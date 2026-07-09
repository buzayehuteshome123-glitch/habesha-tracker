import React from 'react';
import { Users, Shield, Target, Award, Check } from 'lucide-react';
import { BusinessSettings } from '../types';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MetaTags from './MetaTags';

interface AboutPageProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function AboutPage({ settings, setSettings }: AboutPageProps) {
  const isAmharic = settings.language === 'am';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <MetaTags 
        title={isAmharic ? "ስለ እኛ - ሀበሻ ትራከር" : "About Us - Habesha Tracker"}
        description={isAmharic 
          ? "ሀበሻ ትራከር በኢትዮጵያ ውስጥ ላሉ አነስተኛ እና መካከለኛ የንግድ ድርጅቶች የተዘጋጀ የደመና ቴክኖሎጂ ነው።" 
          : "Discover the mission and vision behind Habesha Tracker. Founded in Addis Ababa to build simplified, world-class enterprise ERP bookkeeping solutions for Ethiopian merchants."}
        canonicalUrl="https://habeshatracker.com/about"
        isAmharic={isAmharic}
      />

      <PublicHeader settings={settings} setSettings={setSettings} />

      <main className="flex-grow py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Mission Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                {isAmharic ? "ስለ እኛ" : "Our Vision"}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                {isAmharic 
                  ? "ለኢትዮጵያ ነጋዴዎች የተዘጋጀ የደመና የሂሳብ አያያዝ ቴክኖሎጂ" 
                  : "Empowering Ethiopian Merchants with World-Class Ledger Technology"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
                {isAmharic 
                  ? "ሀበሻ ትራከር የተመሰረተው በአዲስ አበባ ውስጥ ሲሆን ዓላማውም በኢትዮጵያ ውስጥ ላሉ ሱቆች፣ አከፋፋዮች እና ላኪዎች እጅግ በጣም ቀላል እና ዘመናዊ የሂሳብ አያያዝ መተግበሪያ ማቅረብ ነው።" 
                  : "Habesha Tracker was founded in Addis Ababa with a bold mission: to provide world-class, extremely simple cloud technology for Ethiopian small and medium businesses. We are dedicated to building intuitive, local-first enterprise software designed to scale retail stores, grain exporters, and service agencies."}
              </p>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 h-72 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-3xl p-1 shadow-2xl">
                <div className="w-full h-full bg-slate-900 rounded-[22px] p-6 flex flex-col justify-between text-white">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Target className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">10,000+</h3>
                    <p className="text-xs text-slate-400 font-semibold">{isAmharic ? "ቁርጠኝነት" : "Hours of Engineering"}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {isAmharic 
                      ? "የሀበሻ ሱቆች ስኬትን ለማረጋገጥ የተሰራ ልዩ ሲስተም።" 
                      : "Built locally to support local merchants navigate mobile wallets, sales channels, and dual currencies."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isAmharic ? "መሰረታዊ እሴቶቻችን" : "Our Core Values"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {isAmharic 
                  ? "የንግድ መዝገቦችዎን ጥራት እና ደህንነት ለመጠበቅ የምንመራባቸው ዋና ዋና መርሆች" 
                  : "The guiding beliefs that inspire us to serve merchants across Ethiopia with uncompromising standard and care."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  titleEn: "Absolute Security & Privacy",
                  titleAm: "ፍጹም ደህንነትና ሚስጥራዊነት",
                  descEn: "We treat your store databases with the highest level of confidentiality. Your profit margins, customer phone numbers, and debts are yours alone. We do not sell or inspect merchant data.",
                  descAm: "የንግድ መረጃዎችዎን በከፍተኛ ጥንቃቄ እና ሚስጥራዊነት እንይዛለን። የእርስዎ ትርፍ፣ የደንበኞች ስልክ እና ዕዳዎች የእርስዎ ብቻ ናቸው። መረጃዎን ለሌላ አናጋራም።",
                  icon: <Shield className="w-6 h-6 text-emerald-500" />
                },
                {
                  titleEn: "Extremely Simplified UX",
                  titleAm: "እጅግ በጣም ቀላል አጠቃቀም",
                  descEn: "Accounting shouldn't require an MBA. We removed double-entry bookkeeping jargon and replaced it with clean buttons, low-stock notifications, and automatic profit calculations.",
                  descAm: "የሂሳብ ስራ ረጅም ትምህርት መውሰድን አይጠይቅም። ውስብስብ የሂሳብ ቃላትን አስቀርተን በቀላሉ ሽያጭ መመዝገብ፣ ክምችት መከታተልና ሪፖርት ማውረድ እንዲችሉ አድርገናል።",
                  icon: <Users className="w-6 h-6 text-blue-500" />
                },
                {
                  titleEn: "Ethio-centric Innovation",
                  titleAm: "ለሀገር ውስጥ የተበጀ ፈጠራ",
                  descEn: "We integrate directly with local cash networks, Telebirr mobile wallet, Commercial Bank of Ethiopia, and Awash Bank, ensuring absolute harmony with Ethiopian commerce rules.",
                  descAm: "ከተንቀሳቃሽ ስልክ ክፍያዎች (ቴሌብር)፣ ከኢትዮጵያ ንግድ ባንክ እና ከሌሎች የሀገር ውስጥ ክፍያዎች ጋር በቀጥታ በመቀናጀት ከኢትዮጵያ ንግድ ሁኔታ ጋር ፍጹም ተስማሚ እንዲሆን አድርገናል።",
                  icon: <Award className="w-6 h-6 text-amber-500" />
                }
              ].map((value, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl w-fit">
                    {value.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
                    {isAmharic ? value.titleAm : value.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {isAmharic ? value.descAm : value.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold max-w-xl mx-auto">
              {isAmharic 
                ? "የኢትዮጵያ ንግዶችን በዘመናዊ የደመና ቴክኖሎጂ ማብቃት" 
                : "Supporting the Next Generation of Ethiopian Commerce"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
              {[
                { value: "99.9%", labelEn: "Cloud Uptime", labelAm: "ሲስተም ዝግጁነት" },
                { value: "100%", labelEn: "Safe Database", labelAm: "አስተማማኝ መረጃ" },
                { value: "24/7", labelEn: "Helpline Active", labelAm: "የድጋፍ ሰዓት" },
                { value: "15 Secs", labelEn: "Merchant Setup", labelAm: "ፈጣን ምዝገባ" }
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-semibold">{isAmharic ? stat.labelAm : stat.labelEn}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
