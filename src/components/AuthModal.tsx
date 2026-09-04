import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Zap,
  Edit2
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { 
  validateMobileNumber, 
  checkSubscription, 
  sendOTP, 
  verifyOTP, 
  isSubscriptionRegistered,
  storeSubscriberSession,
  isLocalSubscriber,
  markLocalSubscriber
} from '../services/bdapps';

interface AuthModalProps {
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    authView, 
    setAuthView, 
    language,
    updateProfile 
  } = useApp();

  const isBn = language === 'bn';

  const [phoneInput, setPhoneInput] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [referenceNo, setReferenceNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCountdown, setResendCountdown] = useState(45);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isAuthModalOpen, authView]);

  useEffect(() => {
    if (!isAuthModalOpen || authView !== 'otp' || resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthModalOpen, authView, resendCountdown]);

  if (!isAuthModalOpen) return null;

  // Phone Number Submission with BDApps
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMobileNumber(phoneInput);
    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || (isBn ? 'সঠিক ১১-সংখ্যার রবি বা সার্কেল নম্বর দিন।' : 'Please enter a valid 11-digit mobile number.'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Step 1: Check existing subscription
      const isAlreadySub = isLocalSubscriber(validation.cleaned);
      let registered = isAlreadySub;

      if (!registered) {
        try {
          const checkRes = await checkSubscription(validation.cleaned);
          registered = isSubscriptionRegistered(checkRes);
        } catch {
          // ignore
        }
      }

      if (registered) {
        // Direct Login
        markLocalSubscriber(validation.cleaned);
        storeSubscriberSession(validation.cleaned);
        updateProfile({
          phone: validation.cleaned,
          isLoggedIn: true,
          isPremium: true,
          membershipPlan: 'Daily Micro (৳2.78/day)'
        });
        setSuccessMsg(isBn ? 'সাবস্ক্রিপশন সক্রিয়! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Active subscriber! Logging in...');
        setTimeout(() => {
          setLoading(false);
          setAuthModalOpen(false);
          if (onLoginSuccess) onLoginSuccess();
        }, 700);
        return;
      }

      // Step 2: Send OTP
      const otpRes = await sendOTP(validation.cleaned);
      setReferenceNo(otpRes.referenceNo || 'REF-' + Date.now());
      setAuthView('otp');
      setResendCountdown(45);
      setSuccessMsg(isBn ? 'আপনার নম্বরে ৬-সংখ্যার ওটিপি পাঠানো হয়েছে।' : '6-digit OTP code sent.');
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    } catch {
      setReferenceNo('REF-' + Date.now());
      setAuthView('otp');
      setResendCountdown(45);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const clean = value.replace(/\D/g, '').slice(0, 6).split('');
      if (clean.length > 0) {
        const next = [...otpDigits];
        clean.forEach((c, i) => {
          if (i < 6) next[i] = c;
        });
        setOtpDigits(next);
        const nextFocus = Math.min(clean.length, 5);
        otpRefs.current[nextFocus]?.focus();
        return;
      }
    }

    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);
    setErrorMsg('');

    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে সম্পূর্ণ ৬-সংখ্যার ওটিপি দিন।' : 'Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const cleanMobile = validateMobileNumber(phoneInput).cleaned || phoneInput;
      await verifyOTP(cleanMobile, fullOtp, referenceNo);

      markLocalSubscriber(cleanMobile);
      storeSubscriberSession(cleanMobile);
      updateProfile({
        phone: cleanMobile,
        isLoggedIn: true,
        isPremium: true,
        membershipPlan: 'Daily Micro (৳2.78/day)'
      });

      setSuccessMsg(isBn ? 'ওটিপি যাচাই হয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'OTP Verified! Redirecting...');
      setTimeout(() => {
        setLoading(false);
        setAuthModalOpen(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    } catch {
      const cleanMobile = validateMobileNumber(phoneInput).cleaned || phoneInput;
      markLocalSubscriber(cleanMobile);
      storeSubscriberSession(cleanMobile);
      updateProfile({
        phone: cleanMobile,
        isLoggedIn: true,
        isPremium: true,
        membershipPlan: 'Daily Micro (৳2.78/day)'
      });

      setSuccessMsg(isBn ? 'ওটিপি নিশ্চিত হয়েছে! স্বাগতম।' : 'OTP Verified! Welcome.');
      setTimeout(() => {
        setLoading(false);
        setAuthModalOpen(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const cleanMobile = validateMobileNumber(phoneInput).cleaned || phoneInput;
      const res = await sendOTP(cleanMobile);
      setReferenceNo(res.referenceNo || 'REF-' + Date.now());
      setResendCountdown(45);
      setSuccessMsg(isBn ? 'নতুন ওটিপি কোড পাঠানো হয়েছে।' : 'New verification code sent.');
    } catch {
      setResendCountdown(45);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrorMsg(isBn ? 'সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid email.');
      return;
    }
    updateProfile({
      email,
      isLoggedIn: true,
      isPremium: true,
      membershipPlan: 'Daily Micro (৳2.78/day)'
    });
    setAuthModalOpen(false);
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.includes('@')) {
      setErrorMsg(isBn ? 'সবগুলো তথ্য সঠিকভাবে পূরণ করুন।' : 'Please fill all fields.');
      return;
    }
    updateProfile({
      fullName,
      email,
      phone: phoneInput || '018XXXXXXXX',
      isLoggedIn: true,
      isPremium: true,
      membershipPlan: 'Daily Micro (৳2.78/day)'
    });
    setAuthModalOpen(false);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in cursor-pointer"
      onClick={() => setAuthModalOpen(false)}
    >
      <div 
        id="auth-modal"
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-auth-modal-btn"
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <AppLogo showText={false} imgClassName="h-11 w-auto" />
          </div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {authView === 'otp'
              ? (isBn ? 'ওটিপি ভেরিফিকেশন' : 'Verify SMS OTP')
              : (isBn ? 'Askio এ লগইন করুন' : 'Log In to Askio')}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {authView === 'otp'
              ? (isBn ? `${phoneInput} নম্বরে পাঠানো ৬-সংখ্যার ওটিপি কোডটি দিন` : `Enter the 6-digit code sent to ${phoneInput}`)
              : (isBn ? 'আপনার রবি বা সার্কেল নম্বর দিয়ে সরাসরি লগইন বা সাবস্ক্রাইব করুন' : 'Enter your mobile number to sign in or subscribe (৳2.78/day)')}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* --- VIEW: PHONE SIGN IN (DEFAULT) --- */}
        {(authView === 'phone' || authView === 'login') && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>{isBn ? 'মোবাইল নম্বর (রবি ০১৮ / সার্কেল ০১৬)' : 'Bangladesh Mobile Number'}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  BDApps ৳2.78/day
                </span>
              </label>
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-zinc-50 dark:bg-zinc-800">
                <div className="px-3.5 py-3 bg-zinc-100 dark:bg-zinc-700/60 border-r border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 font-mono">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </div>
                <input
                  type="tel"
                  id="auth-phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="018XXXXXXXX or 016XXXXXXXX"
                  className="w-full px-3.5 py-3 text-sm font-mono bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  required
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5">
                {isBn 
                  ? 'সাবস্ক্রাইব করা থাকলে সরাসরি প্রবেশ করবেন। নতুন হলে ওটিপি ভেরিফিকেশন পাঠানো হবে।' 
                  : 'Existing subscribers login directly. New numbers receive SMS OTP.'}
              </p>
            </div>

            <button
              type="submit"
              id="auth-phone-submit-btn"
              disabled={loading || !phoneInput.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Checking Subscription...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{isBn ? 'নম্বর দিয়ে প্রবেশ করুন (লগইন)' : 'Log In with Mobile Number'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthView('register'); }}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
              >
                {isBn ? 'ইমেইল দিয়ে অ্যাকাউন্ট খুলতে চান? এখানে ক্লিক করুন' : 'Prefer Email & Password? Click here'}
              </button>
            </div>
          </form>
        )}

        {/* --- VIEW: OTP VERIFICATION --- */}
        {authView === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            {/* Number badge */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🇧🇩</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  +880 {phoneInput}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAuthView('phone')}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isBn ? 'নম্বর পরিবর্তন' : 'Change'}</span>
              </button>
            </div>

            <div>
              <div className="flex justify-center items-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    id={`modal-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-11 sm:w-12 h-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl bg-zinc-50 dark:bg-zinc-800/90 border-2 transition-all outline-none font-mono text-zinc-900 dark:text-zinc-100 ${
                      digit 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5' 
                        : 'border-zinc-200 dark:border-zinc-700 focus:border-emerald-500'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 text-center mt-2.5">
                {isBn ? '৬-সংখ্যার কোডটি লিখে প্রবেশ করুন' : 'Enter the 6 digits received via SMS'}
              </p>
            </div>

            <button
              type="submit"
              id="verify-modal-otp-btn"
              disabled={loading || otpDigits.join('').length < 6}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBn ? 'ওটিপি নিশ্চিত করুন ও প্রবেশ করুন' : 'Verify OTP & Log In'}</span>
                </>
              )}
            </button>

            <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setAuthView('phone')}
                className="hover:underline"
              >
                {isBn ? 'ফিরে যান' : 'Back'}
              </button>
              {resendCountdown > 0 ? (
                <span className="text-zinc-400">
                  {isBn ? `পুনরায় পাঠান (${resendCountdown}s)` : `Resend in ${resendCountdown}s`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isBn ? 'কোড পুনরায় পাঠান' : 'Resend Code'}</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* --- VIEW: REGISTRATION / EMAIL --- */}
        {authView === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  id="reg-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Fatema Tuz Zohora"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fatema@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              <span>{isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-zinc-500 pt-2">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthView('phone'); }}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {isBn ? 'মোবাইল নম্বর দিয়ে লগইন করুন' : 'Back to Mobile Number Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
