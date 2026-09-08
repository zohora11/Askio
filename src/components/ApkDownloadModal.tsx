import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Download, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap, 
  ArrowRight,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { 
  validateMobileNumber, 
  checkSubscription, 
  isSubscriptionRegistered, 
  sendOTP, 
  markLocalSubscriber,
  storeSubscriberSession
} from '../services/bdapps';
import { findUserByPhone, FirestoreUserData } from '../services/firebase';
import { getTrustedDeviceUser } from '../services/deviceTrust';
import { triggerApkDownload, APK_FILENAME, APK_FILE_SIZE, APK_VERSION } from '../constants/branding';
import { OtpVerificationModal } from './OtpVerificationModal';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const { 
    language, 
    showToast, 
    pendingPhone,
    setPendingPhone, 
    setPendingApkDownload
  } = useApp();

  const isBn = language === 'bn';

  const [step, setStep] = useState<'input' | 'not_subscribed' | 'downloading'>('input');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verifiedNumber, setVerifiedNumber] = useState('');
  
  // OTP Modal for unsubscribed users
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpRefNo, setOtpRefNo] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyPhoneForApk = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const validation = validateMobileNumber(phoneInput);
    if (!validation.isValid) {
      setErrorMsg(
        validation.errorMessage || 
        (isBn 
          ? 'অনুগ্রহ করে সঠিক ১১-সংখ্যার রবি (০১৮) বা সার্কেল (০১৬) মোবাইল নম্বর দিন।' 
          : 'Please enter a valid 11-digit Robi (018) or Cirkle (016) mobile number.')
      );
      return;
    }

    setLoading(true);
    const cleanMobile = validation.cleaned;
    setPendingPhone(cleanMobile);
    setVerifiedNumber(cleanMobile);

    try {
      // 1. Check if user has an existing account in Firebase Firestore
      let firebaseUser: FirestoreUserData | null = null;
      try {
        firebaseUser = await findUserByPhone(cleanMobile);
      } catch (fbErr) {
        console.warn('Firebase user check notice:', fbErr);
      }

      // 2. Check Device Trust
      const trustedUser = getTrustedDeviceUser(cleanMobile);

      // 3. Check BDApps Subscription status API
      let isRegistered = false;
      try {
        const checkRes = await checkSubscription(cleanMobile);
        isRegistered = isSubscriptionRegistered(checkRes);
      } catch (subErr) {
        console.warn('BDApps checkSubscription notice:', subErr);
      }

      // If registered in Firebase OR device is trusted OR BDApps active subscription is confirmed:
      const hasAccountOrSub = Boolean(firebaseUser?.email || trustedUser?.email || isRegistered);

      if (hasAccountOrSub) {
        // SUCCESS CASE: User already has an account / is subscribed!
        markLocalSubscriber(cleanMobile);
        storeSubscriberSession(cleanMobile);
        setStep('downloading');
        setLoading(false);

        setSuccessMsg(
          isBn 
            ? `অ্যাকাউন্ট সনাক্ত ও যাচাই সম্পন্ন (${firebaseUser?.fullName || 'সদস্য'})! Askio APK ডাউনলোড শুরু হচ্ছে...` 
            : `Account verified for ${firebaseUser?.fullName || 'Member'}! Starting Askio APK download...`
        );

        // TRIGGER APK DOWNLOAD IMMEDIATELY!
        triggerApkDownload();
        showToast(
          isBn 
            ? 'অ্যাকাউন্ট যাচাই সম্পন্ন! Askio APK ডাউনলোড শুরু হচ্ছে...' 
            : 'Account verified! Askio APK download started.', 
          'success'
        );

        // Auto-close modal after 3.5 seconds
        setTimeout(() => {
          onClose();
        }, 3500);

        return;
      }

      // UNSUBSCRIBED USER CASE:
      // Show the explicit "You are not a subscribed user, please subscribe first" screen
      setLoading(false);
      setStep('not_subscribed');

    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || (isBn ? 'যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to verify. Please try again.'));
    }
  };

  // User clicks "Next" on the not_subscribed screen -> sends OTP and opens standard subscription OTP modal
  const handleProceedToOtpSubscription = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const rawMobile = verifiedNumber || phoneInput.trim();
      const val = validateMobileNumber(rawMobile);
      const cleanMobile = val.isValid ? val.cleaned : rawMobile;

      setVerifiedNumber(cleanMobile);
      setPendingPhone(cleanMobile);
      setPendingApkDownload(true);

      const otpRes = await sendOTP(cleanMobile);
      const ref = otpRes.referenceNo || otpRes.subscriberId || 'REF-' + Date.now();
      setOtpRefNo(ref);
      setLoading(false);
      setIsOtpModalOpen(true);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to send OTP. Please try again.'));
    }
  };

  return (
    <>
      <div 
        id="apk-download-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div 
          id="apk-download-modal-container"
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Close button */}
          <button
            type="button"
            id="apk-modal-close-btn"
            onClick={onClose}
            className="absolute top-4.5 right-4.5 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                  {isBn ? 'Askio APK ডাউনলোড' : 'Download Askio APK'}
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {APK_VERSION}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isBn 
                  ? 'ডাউনলোড করতে মোবাইল নম্বর যাচাই করুন' 
                  : 'Verify mobile number to download APK'}
              </p>
            </div>
          </div>

          {/* STEP 1: Phone Number Input */}
          {step === 'input' && (
            <div>
              {/* Verification Requirements Info Card */}
              <div className="mb-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                    {isBn ? (
                      <>
                        <strong className="text-zinc-900 dark:text-white font-bold">লগইন/সাবস্ক্রিপশন যাচাই: </strong> 
                        আপনার নম্বর দিয়ে পূর্বে সাবস্ক্রাইব করা থাকলে নম্বর দেওয়া মাত্রই সরাসরি ডাউনলোড শুরু হবে।
                      </>
                    ) : (
                      <>
                        <strong className="text-zinc-900 dark:text-white font-bold">Verification: </strong> 
                        If your number is an active subscriber or registered account, download starts instantly upon verification.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyPhoneForApk} className="space-y-4">
                <div>
                  <label 
                    htmlFor="apk-modal-phone-input"
                    className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    {isBn ? 'রবি / সার্কেল মোবাইল নম্বর দিন' : 'Enter Robi / Cirkle Mobile Number'}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-none px-3.5 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-bold">
                      <span>🇧🇩</span>
                      <span>+880</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        id="apk-modal-phone-input"
                        value={phoneInput}
                        onChange={(e) => {
                          setPhoneInput(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="018XXXXXXXX"
                        maxLength={14}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                        autoFocus
                      />
                      <Smartphone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1.5">
                    {isBn 
                      ? '১১-সংখ্যার রবি বা এয়ারটেল নম্বর দিন (যেমন: 018... বা 016...)' 
                      : 'Enter 11-digit mobile number (e.g., 018... or 016...)'}
                  </p>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  id="apk-modal-verify-submit-btn"
                  disabled={loading || !phoneInput.trim()}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying Account...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isBn ? 'যাচাই ও APK ডাউনলোড করুন' : 'Verify & Download APK'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Not Subscribed Screen (Requested by User) */}
          {step === 'not_subscribed' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Prominent Warning / Not Subscribed Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 dark:text-amber-100">
                      {isBn ? 'আপনি সাবস্ক্রাইব করা ইউজার নন' : 'You are not a subscribed user'}
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-medium leading-relaxed">
                      {isBn 
                        ? 'APK ডাউনলোড করতে অনুগ্রহ করে প্রথমে সাবস্ক্রাইব সম্পন্ন করুন।' 
                        : 'Please subscribe first to unlock the APK download.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Show the Entered Phone Number */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                      {isBn ? 'প্রদত্ত মোবাইল নম্বর' : 'Mobile Number'}
                    </span>
                    <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">
                      +880 {verifiedNumber || phoneInput}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  id="apk-modal-change-phone-btn"
                  onClick={() => {
                    setErrorMsg('');
                    setStep('input');
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                >
                  {isBn ? 'পরিবর্তন' : 'Change'}
                </button>
              </div>

              {/* Subscription Price Details */}
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isBn ? 'দৈনিক সাবস্ক্রিপশন চার্জ:' : 'Daily Subscription Fee:'}</span>
                </div>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg">
                  {isBn ? '৳২.৭৮ / দিন' : '৳2.78 / day'}
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {/* Primary "Next" Action Button (Sends OTP & opens verification flow) */}
              <button
                type="button"
                id="apk-modal-next-step-btn"
                disabled={loading}
                onClick={handleProceedToOtpSubscription}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'ওটিপি পাঠানো হচ্ছে...' : 'Sending OTP...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isBn ? 'Next (ওটিপি ভেরিফিকেশন)' : 'Next (Verify OTP)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: Downloading State */}
          {step === 'downloading' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black text-sm leading-snug block">
                    {successMsg || (isBn ? 'ডাউনলোড শুরু হয়েছে!' : 'Download Started!')}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                    {isBn ? `ফাইল সাইজ: ${APK_FILE_SIZE} (${APK_FILENAME})` : `File Size: ${APK_FILE_SIZE} (${APK_FILENAME})`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="apk-modal-redownload-btn"
                onClick={() => {
                  triggerApkDownload();
                  showToast(isBn ? 'Askio APK ডাউনলোড শুরু হচ্ছে...' : 'Starting Askio APK download...', 'success');
                }}
                className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? 'পুনরায় ডাউনলোড করুন' : 'Download Again'}</span>
              </button>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-400">
              {isBn 
                ? 'অ্যান্ড্রয়েড ৮.০+ সকল স্মার্টফোনে সমর্থিত।' 
                : 'Compatible with all Android 8.0+ smartphones.'}
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal if user proceeds to subscribe */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        phoneNumber={verifiedNumber || phoneInput || pendingPhone}
        mobileNumber={verifiedNumber || phoneInput || pendingPhone}
        referenceNo={otpRefNo}
        onClose={() => setIsOtpModalOpen(false)}
        onChangePhone={() => {
          setIsOtpModalOpen(false);
          setStep('input');
        }}
        onSuccess={() => {
          setIsOtpModalOpen(false);
          // TRIGGER APK DOWNLOAD NOW THAT SUBSCRIPTION IS COMPLETED!
          triggerApkDownload();
          showToast(
            isBn 
              ? 'সাবস্ক্রিপশন সম্পন্ন হয়েছে! Askio APK ডাউনলোড শুরু হচ্ছে...' 
              : 'Subscription activated! Starting Askio APK download...', 
            'success'
          );
          setPendingApkDownload(false);
          onClose();
        }}
      />
    </>
  );
};

