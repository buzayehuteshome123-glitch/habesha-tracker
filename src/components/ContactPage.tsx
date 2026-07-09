import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { BusinessSettings } from '../types';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MetaTags from './MetaTags';

interface ContactPageProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function ContactPage({ settings, setSettings }: ContactPageProps) {
  const isAmharic = settings.language === 'am';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <MetaTags 
        title={isAmharic ? "ያግኙን - ሀበሻ ትራከር" : "Contact Us - Habesha Tracker"}
        description={isAmharic 
          ? "ሀበሻ ትራከር የደንበኞች አገልግሎት ስልክ፡ 0986580996። አድራሻ፡ ቦሌ፣ አዲስ አበባ፣ ኢትዮጵያ።" 
          : "Get in touch with the Habesha Tracker team in Addis Ababa. Access customer helplines, support emails, and direct Telegram support vectors."}
        canonicalUrl="https://habeshatracker.com/contact"
        isAmharic={isAmharic}
      />

      <PublicHeader settings={settings} setSettings={setSettings} />

      <main className="flex-grow py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {isAmharic ? "ያግኙን" : "Contact Us"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {isAmharic ? "እኛን ለማግኘት ዝግጁ ነን" : "We'd Love to Hear From You"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-semibold">
              {isAmharic 
                ? "ጥያቄዎች ካሉዎት፣ ለሱቅዎ ሰራተኞች ማብራሪያ ከፈለጉ ወይም በቀጥታ ማነጋገር ከፈለጉ መልእክት ይላኩልን።" 
                : "Have questions about features, pricing plans, custom integrations, or want an onboarding demo for your team? Get in touch."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
                <h3 className="font-extrabold text-slate-950 dark:text-white text-lg">
                  {isAmharic ? "የቀጥታ የመገናኛ መንገዶች" : "Direct Support Desk"}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                    <Phone className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{isAmharic ? "የደንበኞች አገልግሎት ስልክ" : "Helpline Contact"}</h5>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">+251 986 580 996</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{isAmharic ? "ከሰኞ እስከ ቅዳሜ፡ ከጠዋቱ 2:30 - ምሽቱ 12:30" : "Mon - Sat: 8:30 AM – 6:30 PM (Local Time)"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                    <Mail className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{isAmharic ? "ኢሜይል" : "Support Email"}</h5>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">support@habeshatracker.et</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                    <MapPin className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{isAmharic ? "የቢሮ አድራሻ" : "Office Location"}</h5>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{isAmharic ? "ቦሌ፣ መድኃኔዓለም አካባቢ፣ አዲስ አበባ፣ ኢትዮጵያ" : "Bole, Medhanialem Area, Addis Ababa, Ethiopia"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-sky-500/10 dark:bg-sky-500/5 border border-sky-500/20 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-sky-500 mt-1 shrink-0" />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{isAmharic ? "የቴሌግራም እገዛ" : "Telegram Support"}</h5>
                      <p className="text-xs font-semibold text-sky-600 mt-0.5">@Manbuza12</p>
                      <a 
                        href="https://t.me/Manbuza12" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-sky-500 font-extrabold hover:underline mt-1 block"
                      >
                        {isAmharic ? "ቴሌግራም ክፈት" : "Chat on Telegram"} →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-sm">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
                      {isAmharic ? "መልእክትዎ በተሳካ ሁኔታ ተልኳል!" : "Message Sent Successfully!"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto font-semibold">
                      {isAmharic 
                        ? "መልእክትዎን ስለላኩልን እናመሰግናለን። የደንበኞች ድጋፍ ባለሙያዎቻችን በቅርቡ በስልክ ወይም በኢሜይል ያነጋግሩዎታል።" 
                        : "Thank you for reaching out to Habesha Tracker. Our customer support desk will contact you via email or phone shortly."}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition"
                    >
                      {isAmharic ? "ሌላ መልእክት ላክ" : "Send Another Message"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="font-extrabold text-slate-950 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800/80 pb-3">
                      {isAmharic ? "መልእክት ይላኩልን" : "Send Us a Message"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                          {isAmharic ? "የእርስዎ ስም" : "Full Name"}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={isAmharic ? "ለምሳሌ፡ አሉላ በቀለ" : "e.g. Alula Bekele"}
                          className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                          {isAmharic ? "የኢሜይል አድራሻ" : "Email Address"}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. alula@gmail.com"
                          className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        {isAmharic ? "የስልክ ቁጥር" : "Phone Number (Optional)"}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +251 911 234567"
                        className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        {isAmharic ? "የመልእክትዎ ዝርዝር" : "Message Detail"}
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={isAmharic ? "እባክዎ መልእክትዎን እዚህ ይጻፉ..." : "How can we help your business succeed today?"}
                        className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isAmharic ? "በመላክ ላይ..." : "Submitting..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{isAmharic ? "መልእክት ላክ" : "Send Message"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
