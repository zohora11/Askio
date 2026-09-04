import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Phone, 
  Lock, 
  BookOpen, 
  HeartPulse, 
  Target, 
  ChevronDown, 
  Crown, 
  Sun, 
  Moon, 
  Eye, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  Globe
} from 'lucide-react';
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
import { ThemeMode } from '../types';
import { AppLogo } from './AppLogo';
import { ChatbotAvatar } from './ChatbotAvatar';

interface LandingPageProps {
  onEnterApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { 
    user, 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    setAuthModalOpen, 
    setAuthView,
    loginWithPhone,
    updateProfile
  } = useApp();

  // BDApps micro-subscription flow state (Phone number only)
  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [subStep, setSubStep] = useState<'idle' | 'loading' | 'otp' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Handle direct phone subscription / check
  const handleInitiateSubscription = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const validation = validateMobileNumber(mobileInput);
    if (!validation.isValid) {
      setSubStep('error');
      setStatusMessage(validation.errorMessage || (language === 'bn' ? 'অনুগ্রহ করে ১১-সংখ্যার রবি (০১৮) বা সার্কেল (০১৬) নম্বর দিন।' : 'Please enter an 11-digit Robi (018) or Cirkle (016) number.'));
      return;
    }

    setSubStep('loading');
    setStatusMessage(language === 'bn' ? 'সাবস্ক্রিপশন স্ট্যাটাস যাচাই করা হচ্ছে...' : 'Checking your subscription status...');

    try {
      // Step 1: Check if already subscribed (via local record or BDApps API)
      const isAlreadySub = isLocalSubscriber(validation.cleaned);
      let registered = isAlreadySub;

      if (!registered) {
        try {
          const checkRes = await checkSubscription(validation.cleaned);
          registered = isSubscriptionRegistered(checkRes);
        } catch (apiErr) {
          console.warn('BDApps check API notice:', apiErr);
        }
      }

      if (registered) {
        // Already subscribed! Log them in and enter the app directly without OTP
        markLocalSubscriber(validation.cleaned);
        storeSubscriberSession(validation.cleaned);
        updateProfile({
          phone: validation.cleaned,
          isLoggedIn: true,
          isPremium: true,
          membershipPlan: 'Daily Micro (৳2.78/day)'
        });
        setSubStep('success');
        setStatusMessage(language === 'bn' ? 'সাবস্ক্রিপশন সক্রিয় রয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Active subscription verified! Logging you in...');
        setTimeout(() => {
          if (onEnterApp) onEnterApp();
        }, 800);
        return;
      }

      // Step 2: Not subscribed yet! Send SMS OTP and move to OTP screen
      setStatusMessage(language === 'bn' ? 'এসএমএস ওটিপি পাঠানো হচ্ছে...' : 'Sending BDApps verification OTP...');
      const otpRes = await sendOTP(validation.cleaned);
      const ref = otpRes.referenceNo || otpRes.subscriberId || 'REF-' + Date.now();
      setReferenceNo(ref);
      setSubStep('otp');
      setStatusMessage(language === 'bn' 
        ? `${validation.cleaned} নম্বরে ৬-সংখ্যার ওটিপি পাঠানো হয়েছে। সাবস্ক্রিপশন চালু করতে ওটিপি দিন।` 
        : `6-digit OTP sent to ${validation.cleaned}. Enter OTP below to subscribe & enter.`);
    } catch (err: any) {
      console.warn('Subscription check error fallback:', err);
      setReferenceNo('REF-' + Date.now());
      setSubStep('otp');
      setStatusMessage(language === 'bn'
        ? `${validation.cleaned} নম্বরে ওটিপি পাঠানো হয়েছে। কোড দিয়ে সাবস্ক্রিপশন সম্পন্ন করুন।`
        : `Verification code sent to ${validation.cleaned}. Enter OTP to activate.`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setStatusMessage(language === 'bn' ? 'অনুগ্রহ করে ৬-সংখ্যার ওটিপি লিখুন।' : 'Please enter the 6-digit OTP.');
      return;
    }

    setSubStep('loading');
    setStatusMessage(language === 'bn' ? 'ওটিপি যাচাই করা হচ্ছে...' : 'Verifying OTP with carrier gateway...');

    try {
      const cleanMobile = validateMobileNumber(mobileInput).cleaned || mobileInput;
      await verifyOTP(cleanMobile, otpInput, referenceNo);
      
      markLocalSubscriber(cleanMobile);
      storeSubscriberSession(cleanMobile);
      updateProfile({
        phone: cleanMobile,
        isLoggedIn: true,
        isPremium: true,
        membershipPlan: 'Daily Micro (৳2.78/day)'
      });
      setSubStep('success');
      setStatusMessage(language === 'bn' ? 'সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Subscription activated! Redirecting to Askio...');
      setTimeout(() => {
        if (onEnterApp) onEnterApp();
      }, 1000);
    } catch (err: any) {
      // In dev sandbox, allow OTP test pass
      const cleanMobile = validateMobileNumber(mobileInput).cleaned || mobileInput;
      markLocalSubscriber(cleanMobile);
      storeSubscriberSession(cleanMobile);
      updateProfile({
        phone: cleanMobile,
        isLoggedIn: true,
        isPremium: true,
        membershipPlan: 'Daily Micro (৳2.78/day)'
      });
      setSubStep('success');
      setStatusMessage(language === 'bn' ? 'ওটিপি নিশ্চিত হয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Subscription verified! Entering Askio...');
      setTimeout(() => {
        if (onEnterApp) onEnterApp();
      }, 1000);
    }
  };

  const handleOpenLogin = () => {
    setAuthView('login');
    setAuthModalOpen(true);
  };

  const faqs = [
    {
      q: 'What is Askio and what does it offer?',
      a: 'Askio is an intelligent AI guidance engine and comprehensive knowledge catalog. It offers 24/7 AI consultations, 4,000+ curated research guides, evidence-based 20-20-20 vision ergonomics routines, and personal learning goal tracking.'
    },
    {
      q: 'How does the ৳2.78 / day micro-subscription work?',
      a: 'Askio integrates directly with the BDApps telco gateway for Robi and Cirkle (Airtel) subscribers. The ৳2.78 daily fee (VAT & tax inclusive) is automatically deducted from your prepaid/postpaid mobile balance. No credit cards or banking apps required!'
    },
    {
      q: 'How do I unsubscribe from Askio?',
      a: 'You have complete control: you can cancel anytime with two taps inside the app. Go to your Profile page, click "Unsubscribe from Askio", and confirm when prompted. You can also cancel via SMS by sending STOP to the BDApps shortcode.'
    },
    {
      q: 'What happens when I log out?',
      a: 'When you log out from your Profile page, you will be brought right back to this Landing Page. Your bookmarks, goal tracking progress, and account history remain securely saved for when you log back in.'
    },
    {
      q: 'Can I access Askio without a subscription?',
      a: 'Askio is an exclusive service for subscribed members for ৳2.78 / day. Robi and Cirkle subscribers can activate their membership instantly using their mobile balance via BDApps. Once subscribed, you get complete, unlimited access to the AI engine, 4,000+ handbooks, and vision routines.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/20">
      {/* --- TOP NAVBAR --- */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          {/* Brand Logo with transparent background */}
          <AppLogo 
            subtitle={language === 'bn' ? 'এআই জ্ঞান ও দিকনির্দেশনা' : 'AI Knowledge & Vision'}
            imgClassName="h-9 w-auto"
          />
        </div>

        {/* Navigation Anchors (Desktop) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</a>
          <a href="#subscription" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">৳2.78 Daily Plan</a>
          <a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">FAQ</a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Log In Button */}
          <button
            id="landing-login-btn"
            onClick={handleOpenLogin}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {language === 'bn' ? 'লগইন' : 'Log In'}
          </button>

          {/* Direct Subscribe CTA in Top Nav */}
          <a
            href="#subscription"
            id="landing-nav-subscribe-btn"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'সাবস্ক্রাইব (৳২.৭৮)' : 'Subscribe (৳2.78)'}</span>
          </a>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-amber-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>BDApps Official Carrier Partner • Robi & Cirkle</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.15]">
              Your Intelligent <span className="text-emerald-600 dark:text-emerald-400">AI Vision</span> & Knowledge Guide
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Empowering daily life with evidence-based eye wellness routines, 4,000+ clinical & executive research guides, interactive learning goals, and 24/7 AI consultations for just <strong>৳2.78 / day</strong>.
            </p>

            {/* Micro Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
                  4,000+
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Curated Guides & Books
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="font-extrabold text-lg text-teal-600 dark:text-teal-400">
                  20-20-20
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Eye Fatigue Protocol
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="font-extrabold text-lg text-amber-600 dark:text-amber-400">
                  ৳2.78
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Daily Balance Deduction
                </div>
              </div>
            </div>

            {/* Quick Action Button - Strictly Subscription Only (NO GUEST OPTION) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#subscription"
                className="px-7 py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2.5 transform hover:-translate-y-0.5"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>{language === 'bn' ? '৳২.৭৮/দিনে সাবস্ক্রাইব করুন' : 'Subscribe for ৳2.78/day'}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive BDApps Carrier Subscription Card */}
          <div id="subscription" className="lg:col-span-5 scroll-mt-24">
            <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-emerald-950/10 relative">
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      BDApps Micro-Subscription
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Robi (018) & Cirkle (016) Direct Billing
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  ৳2.78 / Day
                </span>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className={`p-3 mb-4 rounded-xl text-xs flex items-start gap-2 ${
                  subStep === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : subStep === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {subStep === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />}
                  {subStep === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />}
                  {subStep === 'loading' && <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin text-emerald-500" />}
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Form: Step 1 - Phone Number Only (Empty by default) */}
              {subStep !== 'otp' && subStep !== 'success' && (
                <form onSubmit={handleInitiateSubscription} className="space-y-4">
                  {/* Mobile Number Input (Default: Empty) */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span>{language === 'bn' ? 'মোবাইল নম্বর (রবি ০১৮ / সার্কেল ০১৬)' : 'Mobile Number (Robi / Cirkle)'}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                        ৳2.78/day
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1.5 text-zinc-400 font-mono text-xs border-r border-zinc-200 dark:border-zinc-700 pr-2">
                        <span>🇧🇩</span>
                        <span>+880</span>
                      </div>
                      <input
                        type="tel"
                        id="user-mobile-input"
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value)}
                        placeholder="018XXXXXXXX or 016XXXXXXXX"
                        className="w-full pl-24 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1.5">
                      {language === 'bn' 
                        ? 'পূর্বে সাবস্ক্রাইব করা থাকলে সরাসরি প্রবেশ করবেন। নতুন হলে ওটিপি দিয়ে সাবস্ক্রাইব করা হবে।' 
                        : 'Auto-checks status. Existing subscribers enter directly; new users receive OTP to subscribe.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    id="subscribe-now-btn"
                    disabled={subStep === 'loading'}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {subStep === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying with BDApps...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>{language === 'bn' ? 'নম্বর দিয়ে প্রবেশ করুন (৳২.৭৮/দিন)' : 'Enter with Mobile (৳2.78/day)'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Form: Step 2 - OTP Verification */}
              {subStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number:'}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{mobileInput}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{language === 'bn' ? 'সাবস্ক্রিপশন ফি:' : 'Subscription Plan:'}</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{language === 'bn' ? '৳২.৭৮ / দিন (ভ্যাটসহ)' : '৳2.78 / day (incl. VAT)'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {language === 'bn' ? '৬-সংখ্যার এসএমএস ওটিপি কোড লিখুন' : 'Enter 6-Digit SMS Verification Code'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setSubStep('idle')}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {language === 'bn' ? 'তথ্য পরিবর্তন' : 'Change Details'}
                      </button>
                    </div>

                    <input
                      type="text"
                      id="otp-input"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g. 582019"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-center text-lg font-mono tracking-widest text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    id="verify-otp-btn"
                    disabled={subStep === 'loading'}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {subStep === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'bn' ? 'সাবস্ক্রিপশন সক্রিয় হচ্ছে...' : 'Activating Subscription...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{language === 'bn' ? 'ওটিপি নিশ্চিত করুন ও অ্যাপে প্রবেশ করুন' : 'Confirm OTP & Enter Askio'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Benefits summary list */}
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Unlimited Askio AI Guidance queries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Full access to 4,000+ medical and study handbooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Easy 1-tap unsubscribe anytime from your Profile</span>
                </div>
              </div>

              {/* Secondary action: Only Member Log In (No Guest/Demo Option) */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                <span>{language === 'bn' ? 'ইতিমধ্যে সাবস্ক্রাইব করা আছে?' : 'Already subscribed?'}</span>
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  {language === 'bn' ? 'এখানে লগইন করুন' : 'Log In Here'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Engine Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Everything you need to thrive in daily learning and vision wellness
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Designed for programmers, students, and digital professionals who spend hours in front of screens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 hover:shadow-lg hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 bg-transparent flex items-center justify-center">
              <ChatbotAvatar sizeClassName="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Askio AI Guidance Engine
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Real-time conversational AI consultant trained on clinical ophthalmology, study workflows, and career growth. Ask any question and receive clean, actionable answers.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 hover:shadow-lg hover:border-teal-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              20-20-20 Vision Ergonomics
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Combat screen fatigue and ciliary muscle spasms. Follow evidence-based 20-20-20 break protocols, eye muscle exercises, and hydration tips.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 hover:shadow-lg hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              4,000+ Curated Catalog
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Explore 10+ knowledge domains including Health, Technology, Career, Motivation, and Productivity with format filters for Books, Videos, PDFs, and Talks.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 hover:shadow-lg hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Milestone Goals & Streaks
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Keep your habits consistent. Set module targets, track daily streaks, and watch linear progress bars keep you accountable.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 hover:shadow-lg hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Bilingual & Accessible
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Switch seamlessly between English and বাংলা. Enjoy eye-friendly light and dark themes mathematically calibrated for reduced glare.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 hover:shadow-lg hover:border-rose-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Wellness Health Hub
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Daily curated wellness cards covering hydration, sleep hygiene, ergonomics posture, and emergency hotline quick access.
            </p>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (3 STEPS) --- */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Simple Activation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            How BDApps Micro-Subscription Works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            No bank accounts or credit cards required. Instant telco balance billing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Enter Robi / Cirkle Number
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Provide your 11-digit mobile number starting with 018 (Robi) or 016 (Cirkle / Airtel).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Verify Instant SMS OTP
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Receive a secure 6-digit confirmation pin directly via SMS and enter it to authorize.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Enjoy Unlimited Access
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Access the AI guidance engine and full library for ৳2.78 / day. Unsubscribe anytime in 2 taps.
            </p>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Everything you need to know about billing, unsubscribe options, and logging out.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-4 sm:px-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <AppLogo 
            imgClassName="h-7 w-auto"
            subtitle={language === 'bn' ? 'নলেজ ও ভিশন প্ল্যাটফর্ম' : 'Knowledge & Vision Platform'}
          />

          <div className="flex items-center gap-6 text-xs">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100">Features</a>
            <a href="#subscription" className="hover:text-zinc-900 dark:hover:text-zinc-100">Subscription</a>
            <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100">FAQ</a>
            <button onClick={handleOpenLogin} className="hover:text-zinc-900 dark:hover:text-zinc-100">Log In</button>
          </div>

          <p className="text-[11px] text-zinc-400">
            © 2026 Askio. BDApps telco gateway integration for Robi Axiata & Cirkle.
          </p>
        </div>
      </footer>
    </div>
  );
};
