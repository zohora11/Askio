import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Phone, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Edit2, 
  Lock, 
  Coins, 
  Clock, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  verifyOTP, 
  sendOTP, 
  checkSubscription,
  isSubscriptionRegistered,
  isInitialChargingPending,
  markLocalSubscriber, 
  storeSubscriberSession, 
  validateMobileNumber 
} from '../services/bdapps';
import { findUserByPhone, DEFAULT_AVATAR, isCustomAvatar } from '../services/firebase';
import { getTrustedDeviceUser } from '../services/deviceTrust';

interface OtpVerificationModalProps {
  isOpen: boolean;
  phoneNumber: string;
  referenceNo?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onChangePhone: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  phoneNumber,
  referenceNo = '',
  onClose,
  onSuccess,
  onChangePhone
}) => {
  const { 
    language, 
    setPendingPhone, 
    setAuthView, 
    setAuthModalOpen,
    updateProfile,
    setActiveTab
  } = useApp();

  const isBn = language === 'bn';

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCountdown, setResendCountdown] = useState(45);
  const [activeRefNo, setActiveRefNo] = useState(referenceNo);
  const [verificationStep, setVerificationStep] = useState<'input' | 'verifying' | 'charging_pending' | 'success'>('input');
  const [pollCount, setPollCount] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveRefNo(referenceNo);
  }, [referenceNo]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setSuccessMsg('');
      setResendCountdown(45);
      setVerificationStep('input');
      setPollCount(0);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [isOpen, phoneNumber]);

  // Resend OTP countdown
  useEffect(() => {
    if (!isOpen || resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resendCountdown]);

  // Finalize access after subscription & charging is confirmed
  const grantAccessAfterSubscription = async (cleanMobile: string) => {
    markLocalSubscriber(cleanMobile);
    storeSubscriberSession(cleanMobile);
    setVerificationStep('success');
    setSuccessMsg(isBn ? 'সাবস্ক্রিপশন ও চার্জিং সফল! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Subscription active & verified! Entering Askio...');

    try {
      // 1. Check if user already exists in Firestore
      const existingUser = await findUserByPhone(cleanMobile);
      const trustedUser = getTrustedDeviceUser(cleanMobile);

      if (trustedUser) {
        // Direct entry
        const trustedAvatar = trustedUser.avatar || undefined;

        updateProfile({
          uid: trustedUser.uid || 'user_' + cleanMobile,
          fullName: trustedUser.fullName || 'Askio Member',
          email: trustedUser.email || '',
          phone: cleanMobile,
          avatar: trustedAvatar,
          isLoggedIn: true,
          isPremium: true,
          membershipPlan: trustedUser.membershipPlan || 'BDApps Daily (৳2.78/day)'
        });

        setTimeout(() => {
          setLoading(false);
          onClose();
          setActiveTab('home');
          if (onSuccess) onSuccess();
        }, 800);
        return;
      }

      if (existingUser && existingUser.email) {
        // Has account -> take to password login
        setTimeout(() => {
          setLoading(false);
          setPendingPhone(cleanMobile);
          setAuthView('firebase_login');
          setAuthModalOpen(true);
          onClose();
        }, 800);
        return;
      }

      // Brand new user -> take to Firebase Register
      setTimeout(() => {
        setLoading(false);
        setPendingPhone(cleanMobile);
        setAuthView('firebase_register');
        setAuthModalOpen(true);
        onClose();
      }, 800);
    } catch {
      setTimeout(() => {
        setLoading(false);
        setPendingPhone(cleanMobile);
        setAuthView('firebase_register');
        setAuthModalOpen(true);
        onClose();
      }, 800);
    }
  };

  // Background auto-polling for Initial Charging Pending
  useEffect(() => {
    if (verificationStep !== 'charging_pending' || !isOpen) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const cleanMobile = validateMobileNumber(phoneNumber).cleaned || phoneNumber;

    // Check immediately once
    const checkStatus = async () => {
      try {
        setPollCount(prev => prev + 1);
        const subRes = await checkSubscription(cleanMobile);
        if (isSubscriptionRegistered(subRes)) {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          await grantAccessAfterSubscription(cleanMobile);
        }
      } catch (e) {
        // Continue polling
      }
    };

    // Poll every 3.5 seconds
    pollTimerRef.current = setInterval(checkStatus, 3500);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [verificationStep, isOpen, phoneNumber]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      if (cleanDigits.length > 0) {
        const next = [...digits];
        cleanDigits.forEach((char, i) => {
          if (i < 6) next[i] = char;
        });
        setDigits(next);
        const nextFocus = Math.min(cleanDigits.length, 5);
        inputRefs.current[nextFocus]?.focus();
        return;
      }
    }

    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setErrorMsg('');

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // STEP: Submit OTP and Check Subscription
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = digits.join('');

    if (fullOtp.length < 6) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে সম্পূর্ণ ৬-সংখ্যার ওটিপি কোড দিন।' : 'Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanMobile = validateMobileNumber(phoneNumber).cleaned || phoneNumber;

    try {
      // 1. Call Verify OTP API
      await verifyOTP(cleanMobile, fullOtp, activeRefNo);

      // 2. Immediately call Check Subscription API as specified by user
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg(isBn ? 'ওটিপি যাচাই হয়েছে! সাবস্ক্রিপশন স্ট্যাটাস চেক করা হচ্ছে...' : 'OTP verified! Checking subscription status...');

      const subRes = await checkSubscription(cleanMobile);

      // 3. Evaluate Subscription status
      if (isSubscriptionRegistered(subRes)) {
        // Charged & registered immediately!
        await grantAccessAfterSubscription(cleanMobile);
      } else if (isInitialChargingPending(subRes) || !isSubscriptionRegistered(subRes)) {
        // Charging pending or waiting for balance deduction
        setLoading(false);
        setVerificationStep('charging_pending');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setErrorMsg(
        err?.message || 
        (isBn ? 'ভুল ওটিপি কোড বা মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে সঠিক কোড দিন।' : 'Invalid OTP or expired. Please check and try again.')
      );
      setLoading(false);
      // STRICT CONSTRAINT: Do NOT mark subscriber or advance if OTP failed!
    }
  };

  const handleManualCheckNow = async () => {
    setLoading(true);
    setErrorMsg('');
    const cleanMobile = validateMobileNumber(phoneNumber).cleaned || phoneNumber;
    try {
      const subRes = await checkSubscription(cleanMobile);
      if (isSubscriptionRegistered(subRes)) {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        await grantAccessAfterSubscription(cleanMobile);
      } else {
        setErrorMsg(
          isBn
            ? 'এখনও চার্জ সম্পন্ন হয়নি। মোবাইলে পর্যাপ্ত টাকা (৳২.৭৮) আছে কিনা দেখে অপেক্ষা করুন।'
            : 'Charging not completed yet. Please ensure sufficient mobile balance (৳2.78) and wait.'
        );
      }
    } catch (e: any) {
      setErrorMsg(isBn ? 'স্ট্যাটাস চেক করা যায়নি। পুনরায় চেষ্টা করুন।' : 'Unable to check status. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const cleanMobile = validateMobileNumber(phoneNumber).cleaned || phoneNumber;
      const res = await sendOTP(cleanMobile);
      setActiveRefNo(res.referenceNo || 'REF-' + Date.now());
      setResendCountdown(45);
      setErrorMsg('');
      setSuccessMsg(isBn ? 'নতুন ওটিপি পাঠানো হয়েছে!' : 'New OTP has been sent via SMS.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে।' : 'Failed to resend OTP.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div 
        id="otp-verification-modal"
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-otp-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center border shadow-xs transition-colors ${
              verificationStep === 'charging_pending'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : verificationStep === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }`}>
              {verificationStep === 'charging_pending' ? (
                <Coins className="w-7 h-7 animate-bounce" />
              ) : verificationStep === 'success' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <ShieldCheck className="w-7 h-7" />
              )}
            </div>
          </div>

          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {verificationStep === 'charging_pending'
              ? (isBn ? 'ইনিশিয়াল চার্জিং পেন্ডিং' : 'Initial Charging Pending')
              : verificationStep === 'success'
              ? (isBn ? 'সাবস্ক্রিপশন সম্পন্ন!' : 'Subscription Confirmed!')
              : (isBn ? 'এসএমএস ওটিপি ভেরিফিকেশন' : 'SMS OTP Verification')}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {verificationStep === 'charging_pending'
              ? (isBn
                  ? 'আপনার মোবাইলে ব্যালেন্স (৳২.৭৮) রাখুন, ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে যাচাই হচ্ছে'
                  : 'Please maintain balance (৳2.78). Auto-refreshing in the background.')
              : verificationStep === 'success'
              ? (isBn
                  ? 'আপনার সাবস্ক্রিপশন সক্রিয় হয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...'
                  : 'Your subscription is now active! Opening Askio...')
              : (isBn
                  ? 'আপনার রবি বা সার্কেল নম্বরে পাঠানো ৬-সংখ্যার কোডটি দিন'
                  : 'Enter the 6-digit verification code sent to your phone')}
          </p>
        </div>

        {/* Mobile Number Badge */}
        <div className="p-3 mb-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🇧🇩</span>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">
                {isBn ? 'ভেরিফিকেশন নম্বর' : 'Destination'}
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                +880 {phoneNumber}
              </span>
            </div>
          </div>

          {verificationStep === 'input' && (
            <button
              type="button"
              id="change-otp-phone-btn"
              onClick={() => {
                onClose();
                onChangePhone();
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isBn ? 'পরিবর্তন' : 'Change'}</span>
            </button>
          )}
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: 6-Box OTP Form */}
        {verificationStep === 'input' && (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <div className="flex justify-center items-center gap-2 sm:gap-2.5">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    id={`otp-box-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-11 sm:w-12 h-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl bg-zinc-50 dark:bg-zinc-800/90 border-2 transition-all outline-none font-mono text-zinc-900 dark:text-zinc-100 ${
                      digit 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5' 
                        : 'border-zinc-200 dark:border-zinc-700 focus:border-emerald-500'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] text-zinc-400 text-center mt-3">
                {isBn 
                  ? 'রবি বা সার্কেল হ্যান্ডসেটে এসএমএস পেতে কয়েক সেকেন্ড সময় লাগতে পারে' 
                  : 'SMS may take a few seconds to arrive on your handset'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="confirm-otp-submit-btn"
              disabled={loading || digits.join('').length < 6}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'ওটিপি যাচাই ও সাবস্ক্রিপশন চেক...' : 'Verifying OTP & Subscription...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBn ? 'ওটিপি নিশ্চিত করুন' : 'Verify OTP Code'}</span>
                </>
              )}
            </button>

            {/* Resend OTP Row */}
            <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
              <span>{isBn ? 'কোড পাননি?' : "Didn't receive code?"}</span>
              {resendCountdown > 0 ? (
                <span className="font-medium text-zinc-400">
                  {isBn ? `পুনরায় পাঠান (${resendCountdown}s)` : `Resend in ${resendCountdown}s`}
                </span>
              ) : (
                <button
                  type="button"
                  id="resend-otp-btn"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isBn ? 'কোড পুনরায় পাঠান' : 'Resend Code'}</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* VIEW 2: INITIAL CHARGING PENDING (AUTO REFRESHING IN BACKGROUND) */}
        {verificationStep === 'charging_pending' && (
          <div className="space-y-5 animate-fade-in text-center">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{isBn ? 'ব্যালেন্স ও চার্জিং নির্দেশনা' : 'Balance & Charging Notice'}</span>
              </div>
              <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                {isBn 
                  ? 'আপনার ৬-সংখ্যার ওটিপি সফলভাবে যাচাই হয়েছে। সাবস্ক্রিপশন সম্পন্ন করার জন্য আপনার মোবাইল ব্যালেন্স থেকে দৈনিক ৳২.৭৮ চার্জ করার চেষ্টা চলছে।' 
                  : 'Your OTP has been verified. BDApps daily charge (৳2.78) is being initiated from your balance.'}
              </p>
              <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                💡 {isBn 
                  ? 'অনুগ্রহ করে সিমে অন্তত ৳২.৭৮ ব্যালেন্স রাখুন। ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে ব্যালেন্স রিফ্রেশ হচ্ছে, টাকা কাটার সাথে সাথে অ্যাক্সেস দেওয়া হবে।' 
                  : 'Ensure at least ৳2.78 on your SIM. System is auto-polling in the background and will grant access once charged.'}
              </div>
            </div>

            {/* Pulsing auto-checking badge */}
            <div className="py-2 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>
                {isBn 
                  ? `ব্যাকগ্রাউন্ডে স্বয়ংক্রিয় রিফ্রেশ হচ্ছে... (${pollCount})` 
                  : `Auto-refreshing status in background... (${pollCount})`}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                id="check-status-now-btn"
                onClick={handleManualCheckNow}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Checking Status...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>{isBn ? 'এখনই পুনরায় চেক করুন' : 'Check Status Now'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="close-charging-pending-btn"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                {isBn ? 'পরে ব্যালেন্স রিচার্জ করে ঢুকব' : 'I will recharge and enter later'}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: SUCCESS */}
        {verificationStep === 'success' && (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {isBn ? 'সাবস্ক্রিপশন সম্পন্ন!' : 'Subscription Confirmed!'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isBn ? 'অ্যাপে প্রবেশ করানো হচ্ছে...' : 'Redirecting to your account...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
