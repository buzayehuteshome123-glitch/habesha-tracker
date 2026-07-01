import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  Building2, 
  AlertCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Chrome
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BusinessSettings } from '../types';

interface SignInProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  onBack: () => void;
  settings: BusinessSettings;
  prefillEmail?: string;
  showSuccess?: boolean;
}

export default function SignIn({ 
  onSuccess, 
  onSwitchToSignUp, 
  onBack, 
  settings,
  prefillEmail,
  showSuccess
}: SignInProps) {
  const isAmharic = settings.language === 'am';
  const [email, setEmail] = useState(() => {
    if (prefillEmail) return prefillEmail;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('signup_email') || '';
    } catch (e) {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessMsg, setShowSuccessMsg] = useState(() => {
    if (showSuccess !== undefined) return showSuccess;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('signup_success') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('signup_success') === 'true' || params.get('signup_email')) {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const getFriendlyErrorMessage = (error: any) => {
    const msg = error?.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network') || msg.includes('fetch')) {
      return isAmharic 
        ? 'የዳታቤዝ ግንኙነት ስህተት፡ ከደመና ዳታቤዝ ጋር መገናኘት አልተቻለም። እባክዎ የእርስዎ Supabase ዩአርኤል (URL) በስህተት አለመዋቀሩን፣ ወይም የበይነመረብ ግንኙነትዎን ያረጋግጡ። ያለ ኢንተርኔት ለመሞከር "Try Offline / Local Demo Mode" የሚለውን ይጫኑ።'
        : 'Database Connection Error: Could not connect to the cloud database. Please check your network connection, or ensure your Supabase VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are correct. To try the app offline, click "Try Offline / Local Demo Mode" below.';
    }
    return msg || (isAmharic ? 'የስህተት ሙከራ ተከስቷል፣ እባክዎ እንደገና ይሞክሩ።' : 'An unexpected error occurred. Please try again.');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) {
        setErrorMsg(getFriendlyErrorMessage(error));
      }
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(isAmharic ? 'እባክዎ ኢሜል እና የይለፍ ቃል ያስገቡ።' : 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(getFriendlyErrorMessage(error));
      } else if (data?.user) {
        // Redirect the user to the Home page ("/")
        window.history.pushState({}, '', '/');
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 transition-colors duration-200 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/70 dark:bg-[#1E293B]/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          id="btn-signin-back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isAmharic ? 'ተመለስ' : 'Back'}</span>
        </button>

        {/* Brand */}
        <div className="text-center pt-6 pb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500 items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isAmharic ? 'ወደ አካውንትዎ ይግቡ' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 dark:text-slate-400 text-xs mt-1.5 font-medium">
            {isAmharic ? 'የሀበሻ ትራከር የንግድ ሥራ መቆጣጠሪያ' : 'Enter your credentials to access your ERP dashboard'}
          </p>
        </div>

        {/* Success message above form */}
        {showSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 shadow-sm"
            id="success-msg-signup-confirmation"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            <div className="space-y-1">
              <p className="font-bold">
                {isAmharic ? 'አካውንትዎ ተፈጥሯል!' : 'Account Created!'}
              </p>
              <p className="leading-relaxed opacity-90">
                {isAmharic 
                  ? 'አካውንትዎ በተሳካ ሁኔታ ተፈጥሯል። እባክዎ ከመግባትዎ በፊት ኢሜልዎን ያረጋግጡ።' 
                  : 'Your account has been created. Please check your email and verify your address before logging in.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isAmharic ? 'የኢሜል አድራሻ' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400"
                id="input-signin-email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'የይለፍ ቃል' : 'Password'}
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400"
                id="input-signin-password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden"
                id="btn-signin-toggle-pwd"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Simple Error Message display */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2"
              id="error-msg-signin"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            id="btn-signin-submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAmharic ? 'በመግባት ላይ...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                <span>{isAmharic ? 'ግባ' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Or Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#F8FAFC] dark:bg-[#0F172A] px-2 text-slate-400 font-bold tracking-wider rounded-md">
              {isAmharic ? 'ወይም' : 'Or continue with'}
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          id="btn-google-signin"
        >
          <Chrome className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{isAmharic ? 'በጉግል ይግቡ (Google)' : 'Sign In with Google'}</span>
        </button>

        {/* Footer info & Link to switch */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs">
          <span className="text-slate-400">
            {isAmharic ? 'አካውንት የለዎትም? ' : "Don't have an account? "}
          </span>
          <button 
            onClick={onSwitchToSignUp}
            className="font-bold text-emerald-500 hover:text-emerald-600 transition"
            id="btn-signin-goto-signup"
          >
            {isAmharic ? 'አዲስ አካውንት በነጻ ይክፈቱ' : 'Create Free Account'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
