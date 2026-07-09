import React from 'react';
import { Shield } from 'lucide-react';
import { BusinessSettings } from '../types';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MetaTags from './MetaTags';

interface PrivacyPolicyPageProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function PrivacyPolicyPage({ settings, setSettings }: PrivacyPolicyPageProps) {
  const isAmharic = settings.language === 'am';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <MetaTags 
        title={isAmharic ? "የግል መረጃ ጥበቃ ፖሊሲ - ሀበሻ ትራከር" : "Privacy Policy - Habesha Tracker"}
        description={isAmharic 
          ? "የግል እና የንግድ ሚስጥር ጥበቃ ፖሊሲ ዝርዝር።" 
          : "Read the Privacy & Commercial Secrecy Policy of Habesha Tracker. Learn how we safeguard your enterprise database with strict data isolation, zero trackers, and complete ownership."}
        canonicalUrl="https://habeshatracker.com/privacy-policy"
        isAmharic={isAmharic}
      />

      <PublicHeader settings={settings} setSettings={setSettings} />

      <main className="flex-grow py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isAmharic ? "የግል እና የንግድ ሚስጥር ጥበቃ ፖሊሲ" : "Privacy Policy"}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
                {isAmharic ? "እባክዎ በጥንቃቄ ያንብቡት" : "Last updated: July 2026"}
              </p>
            </div>
          </div>

          <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6 font-semibold">
            {isAmharic ? (
              <>
                <p>
                  በሀበሻ ትራከር ሲስተም ውስጥ የነጋዴዎቻችን መዝገቦች ደህንነታቸው የተጠበቀ እና ፍጹም ሚስጥራዊ እንዲሆኑ ማድረግ ዋነኛው መርሐችን ነው። የእርስዎን የንግድ ሚስጥር ለመጠበቅ የሚከተሉትን ህጎች በጥብቅ እንከተላለን፡
                </p>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">1. የመረጃ ባለቤትነት</h3>
                  <p>
                    በመተግበሪያው ላይ የሚመዘገቡት ማንኛውም አይነት የሽያጭ፣ የወጪ፣ የዕቃ ክምችት እና የደንበኛ እዳ (ዱቤ) መረጃዎች ሙሉ ባለቤትነታቸው የእርስዎ ብቻ ነው። እኛ መረጃዎቹን አናይም፣ ለሶስተኛ ወገን አናስተላልፍም ወይም ለንግድ ማስታወቂያ ስራ አናውልም።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">2. የመረጃ ደህንነት ቁጥጥር</h3>
                  <p>
                    መረጃዎችዎ ዘመናዊ ምስጠራዎችን (encryptions) እና የደመና ፋየርዎሎችን በመጠቀም ደህንነታቸው በተጠበቀ የውሂብ ጎታዎች ውስጥ ይለያሉ። መተግበሪያው በየጊዜው በራስ-ሰር መጠባበቂያ (Cloud backup) ስለሚያደርግ የእርስዎ መረጃዎች መቼም አይጠፉም።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">3. ማስታወቂያዎችና መከታተያዎች</h3>
                  <p>
                    በእኛ መተግበሪያ ውስጥ ምንም አይነት የሶስተኛ ወገን የንግድ ማስታወቂያዎች ወይም የመከታተያ ኮዶች (cookies or ad-trackers) የሉም። ንጹህ እና ደህንነቱ የተጠበቀ የንግድ ስራን ብቻ እናቀርባለን።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">4. የመረጃ ባለቤትነት መብት</h3>
                  <p>
                    በማንኛውም ሰዓት የንግድ መረጃዎን በፒዲኤፍ ወይም በኤክሴል ማውረድ ወይም መለያዎን ሙሉ በሙሉ በአንድ ጠቅታ ማጥፋት ይችላሉ።
                  </p>
                </div>
              </>
            ) : (
              <>
                <p>
                  At Habesha Tracker, safeguarding the commercial confidentiality of our merchants is a core corporate value. This Privacy Policy documents how we secure, isolate, and limit our interaction with your business databases.
                </p>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">1. Merchant Database Ownership</h3>
                  <p>
                    All sales tallies, product catalogues, operating costs, customer contact details, and debt ledgers are completely owned by you. We maintain a zero-inspection policy: we never parse, analyze, share, or sell your commercial registries.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">2. Advanced Isolation & Security</h3>
                  <p>
                    Your records are segmented on secure cloud database structures. All interactions are processed through industry-standard secure socket layers (SSL) and database firewalls. We maintain multi-location backup clusters to guarantee zero data loss.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">3. Tracker & Advertising Networks</h3>
                  <p>
                    We do not participate in marketing trackers, advertising networks, or retargeting pixels. The app remains 100% clean, focusing entirely on secure bookkeeping tools.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">4. Account Portability</h3>
                  <p>
                    You retain the absolute right to export your products or delete your account in full with one click, destroying all hosted backups instantly from our clusters.
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
