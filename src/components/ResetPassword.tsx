import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BusinessSettings } from '../types';

interface ResetPasswordProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
}

export default function ResetPassword({ 
  onSuccess, 
  onBackToLogin, 
  settings,
  addToast
}: ResetPasswordProps) {
  const isAmharic = settings.language === 'am';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Validation criteria states
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  const passwordsMatch = password && password === confirmPassword;

  // Strength score
  const criteriaMetCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (criteriaMetCount <= 2) return isAmharic ? 'ደካማ (Weak)' : 'Weak';
    if (criteriaMetCount <= 4) return isAmharic ? 'መካከለኛ (Medium)' : 'Medium';
    return isAmharic ? 'በጣም ጥሩ (Strong)' : 'Strong';
  };

  const getStrengthColor = () => {
    if (password.length === 0) return 'bg-slate-200 dark:bg-slate-800';
    if (criteriaMetCount <= 2) return 'bg-rose-500';
    if (criteriaMetCount <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthPercent = () => {
    return (criteriaMetCount / 5) * 100;
  };

  const getFriendlyErrorMessage = (error: any) => {
    const msg = error?.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
      return isAmharic 
        ? 'የግንኙነት ስህተት፡ እባክዎ የበይነመረብ ግንኙነትዎን ያረጋግጡ።'
        : 'Network error: Please check your internet connection and try again.';
    }
    if (msg.includes('Auth session missing') || msg.includes('recovery flow') || msg.includes('expired')) {
      return isAmharic
        ? 'የይለፍ ቃል መቀየሪያ ሊንኩ ጊዜው አልፏል ወይም ልክ ያልሆነ ነው። እባክዎ አዲስ ሊንክ ይጠይቁ።'
        : 'The password reset link is invalid or has expired. Please request a new one.';
    }
    return isAmharic ? 'ስህተት ተከስቷል፣ እባክዎ እንደገና ይሞክሩ።' : 'An error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate overall requirements
    if (criteriaMetCount < 5) {
      setErrorMsg(isAmharic 
        ? 'የይለፍ ቃሉ ሁሉንም መስፈርቶች ማሟላት አለበት።' 
        : 'Please make sure your password meets all criteria.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg(isAmharic 
        ? 'የይለፍ ቃሎቹ አይመሳሰሉም።' 
        : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrorMsg(getFriendlyErrorMessage(error));
        addToast(
          isAmharic 
            ? 'የይለፍ ቃል መቀየር አልተሳካም' 
            : 'Failed to update password', 
          'warning'
        );
      } else {
        setSuccessMsg(isAmharic 
          ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል። ወደ መግቢያ ገጽ በመዘዋወር ላይ...' 
          : 'Your password has been updated successfully. Redirecting to Login...');
        
        addToast(
          isAmharic 
            ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!' 
            : 'Your password has been updated successfully.', 
          'success'
        );

        // Redirect after 3 seconds as required
        setTimeout(() => {
          onSuccess();
        }, 3000);
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
        id="reset-password-container"
      >
        {/* Brand Header */}
        <div className="text-center pt-2 pb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500 items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isAmharic ? 'አዲስ የይለፍ ቃል መፍጠር' : 'Reset Your Password'}
          </h2>
          <p className="text-slate-400 dark:text-slate-400 text-xs mt-1.5 font-medium">
            {isAmharic 
              ? 'እባክዎ ደህንነቱ የተጠበቀ አዲስ የይለፍ ቃል ያስገቡ' 
              : 'Please enter a highly secure new password for your account'}
          </p>
        </div>

        {successMsg ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-3 shadow-xs mb-4"
            id="reset-success-alert"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500 animate-bounce" />
            <div className="space-y-1">
              <p className="font-bold">
                {isAmharic ? 'የይለፍ ቃል ተቀይሯል!' : 'Success!'}
              </p>
              <p className="leading-relaxed opacity-90">
                {successMsg}
              </p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'አዲስ የይለፍ ቃል' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isAmharic ? 'የይለፍ ቃል ያስገቡ' : 'New Password'}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400"
                  id="new-password-input"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden"
                  id="btn-toggle-new-pwd"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{isAmharic ? 'የይለፍ ቃል ጥንካሬ፡' : 'Password Strength:'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{getStrengthLabel()}</span>
                </div>
                
                {/* Visual Bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${getStrengthPercent()}%` }}
                  />
                </div>

                {/* Checklist Criteria */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                    <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {isAmharic ? 'ቢያንስ 8 ፊደላት' : 'Min 8 characters'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasUppercase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                    <span className={hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {isAmharic ? 'አንድ ትልቅ ፊደል (A-Z)' : 'One uppercase (A-Z)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasLowercase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                    <span className={hasLowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {isAmharic ? 'አንድ ትንሽ ፊደል (a-z)' : 'One lowercase (a-z)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                    <span className={hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {isAmharic ? 'ቢያንስ አንድ ቁጥር (0-9)' : 'One number (0-9)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    {hasSpecial ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                    <span className={hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {isAmharic ? 'ልዩ ምልክት (ለምሳሌ፡ @, #, $, %, ^, &)' : 'One special character (e.g. @, #, $, %)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isAmharic ? 'የይለፍ ቃልዎን ያረጋግጡ' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isAmharic ? 'የይለፍ ቃልዎን በድጋሚ ያስገቡ' : 'Confirm Password'}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white placeholder-slate-400"
                  id="confirm-password-input"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden"
                  id="btn-toggle-confirm-pwd"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Match Validation Info */}
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs pt-1">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {isAmharic ? 'የይለፍ ቃሎች ይመሳሰላሉ!' : 'Passwords match!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="text-rose-500 font-medium">
                        {isAmharic ? 'የይለፍ ቃሎች አይመሳሰሉም።' : 'Passwords do not match yet.'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Error Message display */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 shadow-xs"
                id="reset-error-display"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading || criteriaMetCount < 5 || !passwordsMatch}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
              id="btn-update-password-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAmharic ? 'በማደስ ላይ...' : 'Updating Password...'}</span>
                </>
              ) : (
                <>
                  <span>{isAmharic ? 'የይለፍ ቃል ቀይር' : 'Update Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Return to login link */}
        <div className="text-center pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button 
            type="button"
            onClick={onBackToLogin}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition"
            id="btn-reset-back-to-login"
          >
            {isAmharic ? 'ወደ መግቢያ ገጽ ተመለስ' : 'Back to Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
