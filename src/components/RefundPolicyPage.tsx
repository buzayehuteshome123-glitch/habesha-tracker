import React from 'react';
import { CreditCard } from 'lucide-react';
import { BusinessSettings } from '../types';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MetaTags from './MetaTags';

interface RefundPolicyPageProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function RefundPolicyPage({ settings, setSettings }: RefundPolicyPageProps) {
  const isAmharic = settings.language === 'am';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <MetaTags 
        title={isAmharic ? "የገንዘብ ተመላሽ ፖሊሲ - ሀበሻ ትራከር" : "Refund Policy - Habesha Tracker"}
        description={isAmharic 
          ? "የሀበሻ ትራከር የክፍያ እና የገንዘብ ተመላሽ ፖሊሲ ዝርዝር መግለጫ።" 
          : "Review the Refund Policy for Habesha Tracker. Learn about our 14-day money-back guarantee, trial extensions, and cancellation mechanics."}
        canonicalUrl="https://habeshatracker.com/refund-policy"
        isAmharic={isAmharic}
      />

      <PublicHeader settings={settings} setSettings={setSettings} />

      <main className="flex-grow py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isAmharic ? "የገንዘብ ተመላሽ ፖሊሲ" : "Refund Policy"}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
                {isAmharic ? "የክፍያና ተመላሽ ደንቦች" : "Last updated: July 2026"}
              </p>
            </div>
          </div>

          <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6 font-semibold">
            {isAmharic ? (
              <>
                <p>
                  በሀበሻ ትራከር የደንበኞቻችን እርካታ ለንግዳችን ስኬት ወሳኝ ነው። ክፍያዎችን እና የገንዘብ ተመላሽ ጥያቄዎችን በተመለከተ የሚከተሉትን ህጎች በጥብቅ እንከተላለን፡
                </p>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">1. ነጻ የሙከራ ጊዜ (Free Trial)</h3>
                  <p>
                    ሁሉም አዲስ ተመዝጋቢዎች ምንም አይነት የክፍያ መረጃ ሳይጠየቁ ለ14 ቀናት መተግበሪያውን በነጻ መሞከር ይችላሉ። በዚህ ጊዜ ውስጥ አገልግሎቱ ካልተመቸዎት ያለምንም ክፍያ ማቆም ይችላሉ።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">2. የ14-ቀናት የገንዘብ ተመላሽ ዋስትና</h3>
                  <p>
                    ፕሪሚየም ዕቅድ ከገዙ በኋላ ባሉት የመጀመሪያዎቹ 14 ቀናት ውስጥ በሲስተማችን አጠቃቀም ካልረኩ የከፈሉትን ገንዘብ ሙሉ በሙሉ ተመላሽ እንዲደረግልዎ መጠየቅ ይችላሉ። ጥያቄዎን በኢሜይል ወይም በቴሌግራም በኩል ማቅረብ ይችላሉ።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">3. ተመላሽ የማያደርጉ ሁኔታዎች</h3>
                  <p>
                    ከተመዘገቡ ወይም ክፍያ ከፈጸሙ ከ14 ቀናት ካለፉ በኋላ የሚቀርቡ የገንዘብ ተመላሽ ጥያቄዎች ተቀባይነት አይኖራቸውም። ነገር ግን የደንበኝነት ምዝገባዎ በቀጣዩ ወር እንዳይቀጥል በማንኛውም ጊዜ መሰረዝ ይችላሉ።
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">4. ገንዘብ ተመላሽ የሚደረግበት መንገድ</h3>
                  <p>
                    የገንዘብ ተመላሽ ጥያቄዎ ተቀባይነት ሲያገኝ፣ በከፈሉበት የባንክ አካውንት (CBE, Awash ወዘተ) ወይም በቴሌብር በኩል ከ 3 እስከ 5 የባንክ የስራ ቀናት ውስጥ ገንዘቡ ይመለሳል።
                  </p>
                </div>
              </>
            ) : (
              <>
                <p>
                  At Habesha Tracker, customer satisfaction is core to our team. This Refund Policy details our trial guarantee, subscription cancellation terms, and refund request conditions.
                </p>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">1. Risk-Free 14-Day Trial Period</h3>
                  <p>
                    All new merchant registrations start with a completely free 14-day evaluation trial. No credit card, bank detail, or Telebirr verification is required during registration. You can explore full bookkeeping features without any prior billing obligations.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">2. 14-Day Money-Back Guarantee</h3>
                  <p>
                    If you upgrade to our Premium Plan and are not completely satisfied with our ERP operations, you can submit a refund request within 14 calendar days of your premium activation. We will cancel your subscription and refund your payment in full.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">3. Non-refundable Conditions</h3>
                  <p>
                    All refund claims initiated beyond the 14-day premium activation threshold are ineligible for a refund. However, you can cancel your subscription at any time to avoid future renewals.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">4. Refund Execution Channel</h3>
                  <p>
                    Once approved, refunds are processed via the original transaction channel (e.g., Commercial Bank of Ethiopia (CBE) transfer or Telebirr mobile wallet) within 3 to 5 banking business days.
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
