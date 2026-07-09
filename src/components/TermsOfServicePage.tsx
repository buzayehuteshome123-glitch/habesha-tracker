import React from 'react';
import { Shield } from 'lucide-react';
import { BusinessSettings } from '../types';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MetaTags from './MetaTags';

interface TermsOfServicePageProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function TermsOfServicePage({ settings, setSettings }: TermsOfServicePageProps) {
  const isAmharic = settings.language === 'am';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <MetaTags 
        title={isAmharic ? "የአጠቃቀም ደንቦች - ሀበሻ ትራከር" : "Terms of Service - Habesha Tracker"}
        description={isAmharic 
          ? "ሀበሻ ትራከር የአገልግሎት አጠቃቀም ህጎችና ደንቦች።" 
          : "Review the Terms of Service for Habesha Tracker. Our merchant licensing, user regulations, and data backup policies."}
        canonicalUrl="https://habeshatracker.com/terms-of-service"
        isAmharic={isAmharic}
      />

      <PublicHeader settings={settings} setSettings={setSettings} />

      <main className="flex-grow py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isAmharic ? "የአጠቃቀም ደንቦች" : "Terms of Service"}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
                {isAmharic ? "የአገልግሎት ስምምነት" : "Last updated: July 2026"}
              </p>
            </div>
          </div>

          <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6 font-semibold">
            {isAmharic ? (
              <>
                <p>
                  በሀበሻ ትራከር መተግበሪያ ላይ በመመዝገብ፣ በሚከተሉት የአጠቃቀም ደንቦች ለመገዛት እና ለመጠበቅ ሙሉ ስምምነትዎን ሰጥተዋል፡
                </p>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">1. የመለያ ምዝገባና ደህንነት</h3>
                  <p>
                    መለያዎን በሚመዘግቡበት ጊዜ ትክክለኛ እና ወቅታዊ መረጃዎችን ማቅረብ አለብዎት። የመለያዎን የይለፍ ቃል እና መግቢያ መረጃ ደህንነት መጠበቅ የባለቤቱ ኃላፊነት ይሆናል።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">2. መረጃዎችን መመዝገብ</h3>
                  <p>
                    በመተግበሪያው ላይ ለሚመዘግቡት ማንኛውም የሽያጭ ዋጋዎች፣ የምርቶች ዝርዝር፣ የደንበኞች እዳዎች እና ወጪዎች ትክክለኛነት ሙሉ ኃላፊነት የእርስዎ ነው። የተሳሳተ መዝገብ ወይም ስሌት ቢመዘገብ መተግበሪያው ተጠያቂ አይሆንም።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">3. የአገልግሎት ፈቃድና ክልከላዎች</h3>
                  <p>
                    ንግድዎን በዘመናዊ የደመና ሲስተም ውስጥ በጥንቃቄ ለማስተዳደር የግል እና የማይተላለፍ ፈቃድ ተሰጥቶዎታል። የደመና አገልጋዮችን (servers) ወይም መተግበሪያውን ለማወክ መሞከር፣ ያለ አግባብ ለመገልበጥ መሞከር በጥብቅ የተከለከለ ነው።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">4. የአገልግሎት ማሻሻያ</h3>
                  <p>
                    የእኛን አገልግሎቶች ለማሻሻል ስንል መተግበሪያውን ያለ ቅድመ ማስጠንቀቂያ የማዘመን ወይም የመቀየር መብታችን የተጠበቀ ነው።
                  </p>
                </div>
              </>
            ) : (
              <>
                <p>
                  By registering or operating inside the Habesha Tracker ecosystem, you agree to comply with our commercial licensing and cloud terms of service:
                </p>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">1. Account Credential Safeguard</h3>
                  <p>
                    You agree to deliver authentic email verification structures during enrollment. Maintaining the secrecy of active login credentials is the sole liability of the merchant.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">2. Ledger Integrity</h3>
                  <p>
                    The merchant maintains total administrative control and represents that all stock items, price configurations, cost logs, and customer debt entries are true and accurate. We are not liable for bookkeeping mistakes.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">3. Software License Boundaries</h3>
                  <p>
                    We grant a limited, revocable, non-exclusive license to operate the database registers online. Probing cloud servers, injecting unauthorized scripts, or duplicating frontend assets is strictly prohibited.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">4. System Evolution</h3>
                  <p>
                    We regularly update features, adjust local currency tickers, and fine-tune databases to improve experience. We reserve the right to perform routine system improvements without prior notice.
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
