import React, { useState } from 'react';
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

interface SignUpProps {
  onSuccess: () => void;
  onSwitchToSignIn: (email?: string, success?: boolean) => void;
  onBack: () => void;
  settings: BusinessSettings;
}

export default function SignUp({ onSuccess, onSwitchToSignIn, onBack, settings }: SignUpProps) {
  const isAmharic = settings.language === 'am';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getFriendlyErrorMessage = (error: any) => {
    const msg = error?.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network') || msg.includes('fetch')) {
      return isAmharic 
        ? 'የዳታቤዝ ግንኙነት ስህተት፡ ከደመና ዳታቤዝ ጋር መገናኘት አልተቻለም። እባክዎ የእርስዎ Supabase ዩአርኤል (URL) በስህተት አለመዋቀሩን፣ ወይም የበይነመረብ ግንኙነትዎን ያረጋግጡ። ያለ ኢንተርኔት ለመሞከር "Try Offline / Local Demo Mode" የሚለውን ይጫኑ።'
        : 'Database Connection Error: Could not connect to the cloud database. Please check your network connection, or ensure your Supabase VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are correct. To try the app offline, click "Try Offline / Local Demo Mode" below.';
    }
    return msg || (isAmharic ? 'የስህተት ሙከራ ተከስቷል፣ እባክዎ እንደገና ይሞክሩ።' : 'An unexpected error occurred. Please try again.');
  };

  const handleGoogleSignUp = async () => {
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

    // Strong Password Validation
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      const criteria = [];
      if (!hasMinLength) criteria.push(isAmharic ? 'ቢያንስ 8 ፊደላት' : 'at least 8 characters');
      if (!hasUppercase) criteria.push(isAmharic ? 'ቢያንስ አንድ ትልቅ ፊደል (A-Z)' : 'at least one uppercase letter');
      if (!hasLowercase) criteria.push(isAmharic ? 'ቢያንስ አንድ ትንሽ ፊደል (a-z)' : 'at least one lowercase letter');
      if (!hasNumber) criteria.push(isAmharic ? 'ቢያንስ አንድ ቁጥር (0-9)' : 'at least one number');
      if (!hasSpecialChar) criteria.push(isAmharic ? 'ቢያንስ አንድ ልዩ ምልክት (ለምሳሌ @, #, $, %)' : 'at least one special character');

      const errorMsgText = isAmharic 
        ? `እባክዎ ጠንካራ የይለፍ ቃል ይጠቀሙ። የይለፍ ቃልዎ እነዚህን መስፈርቶች ማሟላት አለበት፡ ${criteria.join('፣ ')}።`
        : `Please choose a stronger password. It must contain: ${criteria.join(', ')}.`;
      
      setErrorMsg(errorMsgText);
      
      // Log validation failure
      import('../lib/logger').then(({ logger }) => {
        logger.warn('validation', 'Registration password strength check failed', { email, passwordLength: password.length });
      });
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(getFriendlyErrorMessage(error));
        // Log signup error
        import('../lib/logger').then(({ logger }) => {
          logger.error('auth', 'User registration failed on server', { email, errorMsg: error.message });
        });
      } else {
        // Log successful registration
        import('../lib/logger').then(({ logger }) => {
          logger.info('auth', 'User successfully registered', { email, userId: data?.user?.id });
        });
        // If a session exists (auto-login is enabled on Supabase project), sign out to prevent auto-login
        if (data?.session) {
          await supabase.auth.signOut();
        }

        // Set email and success params in query string as a fallback
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('signup_email', email);
          url.searchParams.set('signup_success', 'true');
          window.history.pushState({}, '', url.toString());
        } catch (e) {
          // Ignore state manipulation errors in sandboxed iframes
        }

        // Redirect the user to the Sign In page with parameters
        onSwitchToSignIn(email, true);
      }
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-200 relative overflow-y-auto py-8 sm:py-12">
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
          id="btn-signup-back"
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
            {isAmharic ? 'አዲስ አካውንት ይክፈቱ' : 'Create Free Account'}
          </h2>
          <p className="text-slate-400 dark:text-slate-400 text-xs mt-1.5 font-medium">
            {isAmharic ? 'የሀበሻ ትራከር የንግድ ሥራ መቆጣጠሪያ' : 'Enter your email to sign up and launch your local cloud backend'}
          </p>
        </div>

        {/* Sign Up Form */}
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
                id="input-signup-email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isAmharic ? 'የይለፍ ቃል' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400"
                id="input-signup-password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden"
                id="btn-signup-toggle-pwd"
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
              id="error-msg-signup"
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
            id="btn-signup-submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAmharic ? 'በመመዝገብ ላይ...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{isAmharic ? 'አካውንት ክፈት' : 'Sign Up'}</span>
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

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          id="btn-google-signup"
        >
          <Chrome className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{isAmharic ? 'በጉግል ይመዝገቡ (Google)' : 'Sign Up with Google'}</span>
        </button>

        {/* Footer info & Link to switch */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs">
          <span className="text-slate-400">
            {isAmharic ? 'ቀድሞውኑ አካውንት አለዎት? ' : 'Already have an account? '}
          </span>
          <button 
            onClick={() => onSwitchToSignIn()}
            className="font-bold text-emerald-500 hover:text-emerald-600 transition"
            id="btn-signup-goto-signin"
          >
            {isAmharic ? 'እዚህ ይግቡ' : 'Sign In instead'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
