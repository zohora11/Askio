import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
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
  Globe,
  FileText,
  Layers,
  PhoneCall,
  Play,
  RotateCcw,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Laptop,
  Flame,
  Star,
  ExternalLink,
  MessageSquare,
  Shield,
  Smartphone,
  Code2,
  PenTool,
  TrendingUp,
  Home,
  Activity,
  Users,
  Smile,
  Menu,
  X,
  Search,
  Bot
} from 'lucide-react';
import { 
  validateMobileNumber, 
  checkSubscription, 
  sendOTP, 
  isSubscriptionRegistered,
  storeSubscriberSession,
  isLocalSubscriber,
  markLocalSubscriber
} from '../services/bdapps';
import { AppLogo } from './AppLogo';
import { ChatbotAvatar } from './ChatbotAvatar';
import { AppDocumentationModal } from './AppDocumentationModal';
import { OtpVerificationModal } from './OtpVerificationModal';
import { AuthModal } from './AuthModal';

interface LandingPageProps {
  onEnterApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    setAuthModalOpen, 
    setAuthView,
    updateProfile
  } = useApp();

  const isBn = language === 'bn';

  // BDApps micro-subscription flow state
  const [mobileInput, setMobileInput] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Features Showcase Carousel Slider (1-by-1 Slide)
  const [currentFeatureSlide, setCurrentFeatureSlide] = useState(0);
  const totalFeatureSlides = 7;
  
  // Interactive mini 20-20-20 preview timer on landing page
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(20);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);

  // Modals
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Personas Slider State (Askio is for Everyone)
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [isPersonaHovered, setIsPersonaHovered] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);

  const personas = [
    {
      id: 'developers',
      icon: Laptop,
      colorClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      title: isBn ? 'প্রোগ্রামার ও কোডার' : 'Developers & Coders',
      tag: isBn ? 'কোডিং ও টেক গাইড' : 'Tech & Coding',
      desc: isBn
        ? 'কোডিং সমস্যা সমাধান, টেকনিক্যাল রিসার্চ, বাগ ফিক্সিং পরামর্শ ও ৮-১২ ঘণ্টার স্ক্রিন টাইমে ২০-২০-২০ আই কেয়ার।'
        : 'Rapid code assistance, debugging tips, library documentation, and ocular strain reduction for long sprints.',
      badge: isBn ? '২৪/৭ এআই ও আই কেয়ার' : '24/7 AI & Eye Care'
    },
    {
      id: 'students',
      icon: GraduationCap,
      colorClass: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-500/30',
      badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      title: isBn ? 'শিক্ষার্থী ও বিসিএস পরীক্ষার্থী' : 'Students & BCS Aspirants',
      tag: isBn ? 'স্টাডি ও বিসিএস প্রিপারেশন' : 'Academics & Exams',
      desc: isBn
        ? 'বিসিএস ও চাকরির জন্য ১৪,০০০+ হ্যান্ডবুক, প্রতিদিনের গোলস ট্র্যাকিং এবং জটিল যেকোনো বিষয়ের সহজ এআই ব্যাখ্যা।'
        : 'Access 14,000+ handbooks, daily habit tracking, and crystal-clear AI explanations for study topics.',
      badge: isBn ? '১৪,০০০+ হ্যান্ডবুক' : '14,000+ Handbooks'
    },
    {
      id: 'executives',
      icon: Briefcase,
      colorClass: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      title: isBn ? 'চাকরিজীবী ও পেশাজীবী' : 'Executives & Professionals',
      tag: isBn ? 'অফিস প্রোডাক্টিভিটি' : 'Workplace Productivity',
      desc: isBn
        ? 'প্রফেশনাল ইমেইল ও রিপোর্ট ড্রাফটিং, অফিসিয়াল মিটিং নোটস সামারি, কাজের প্রায়োরিটি ও কর্মদক্ষতা বৃদ্ধি।'
        : 'Draft executive emails, summarize complex briefs, organize workflow priorities, and boost day-to-day focus.',
      badge: isBn ? 'স্মার্ট অ্যাসিস্ট্যান্ট' : 'Smart Workflow'
    },
    {
      id: 'freelancers',
      icon: Globe,
      colorClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-500/30',
      badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      title: isBn ? 'রিমোট ওয়ার্কার ও ফ্রিল্যান্সার' : 'Freelancers & Remote Workers',
      tag: isBn ? 'কাজের ভারসাম্য' : 'Work-Life Balance',
      desc: isBn
        ? 'কাজের ফাঁকে চোখ ও ঘাড়ের ক্লান্তি দূর করা, ক্লায়েন্ট কমিউনিকেশন পরামর্শ ও নতুন স্কিল শেখার দ্রুত গাইড।'
        : 'Protect vision during midnight client deadlines while rapidly learning new digital tools and skills.',
      badge: isBn ? 'ফ্লেক্সিবল লার্নিং' : 'Ocular Longevity'
    },
    {
      id: 'teachers',
      icon: BookOpen,
      colorClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-500/30',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      title: isBn ? 'শিক্ষক ও গবেষক' : 'Teachers & Educators',
      tag: isBn ? 'পাঠপরিকল্পনা ও রিসার্চ' : 'Lesson Plans & Research',
      desc: isBn
        ? 'ক্লাসরুম লেকচার নোটস, রেফারেন্স বইয়ের নির্যাস তৈরি এবং শিক্ষার্থীদের জন্য আকর্ষণীয় পাঠদান পরিকল্পনা।'
        : 'Generate interactive lecture guides, academic citations, and modern pedagogical materials with ease.',
      badge: isBn ? 'নলেজ রেফারেন্স' : 'Academic Guides'
    },
    {
      id: 'entrepreneurs',
      icon: TrendingUp,
      colorClass: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-500/30',
      badgeClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      title: isBn ? 'উদ্যোক্তা ও ব্যবসায়ী' : 'Entrepreneurs & Founders',
      tag: isBn ? 'বিজনেস স্ট্র্যাটেজি' : 'Strategy & Growth',
      desc: isBn
        ? 'ব্যবসার আইডিয়া ও মার্কেট রিসার্চ, গ্রাহক সেবা কৌশল, মার্কেটিং আইডিয়া এবং ম্যানেজমেন্ট হ্যান্ডবুক।'
        : 'Market insights, customer outreach strategies, business frameworks, and actionable execution roadmaps.',
      badge: isBn ? 'বিজনেস হ্যান্ডবুক' : 'Business Insights'
    },
    {
      id: 'creators',
      icon: PenTool,
      colorClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-500/30',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      title: isBn ? 'কন্টেন্ট ক্রিয়েটর ও লেখক' : 'Content Creators & Writers',
      tag: isBn ? 'সৃজনশীল আইডিয়া' : 'Creative Writing',
      desc: isBn
        ? 'ভিডিও স্ক্রিপ্ট, সোশ্যাল মিডিয়া পোস্ট আইডিয়া, ব্লগ আর্টিকেলের রূপরেখা ও রাইটার্স ব্লকের সমাধান।'
        : 'Unblock creative fatigue with instant hook ideas, blog structuring, and engaging copy inspiration.',
      badge: isBn ? 'ক্রিয়েটিভ সাপোর্ট' : 'Creative Spark'
    },
    {
      id: 'parents',
      icon: Home,
      colorClass: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      badgeClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      title: isBn ? 'অভিভাবক ও পরিবার' : 'Parents & Homemakers',
      tag: isBn ? 'পারিবারিক যত্ন' : 'Family & Wellness',
      desc: isBn
        ? 'সন্তানদের পড়াশোনা ও যত্নের রুটিন, পুষ্টিকর ডায়েট টিপস এবং পারিবারিক সুস্থতার বৈজ্ঞানিক তথ্য।'
        : 'Practical parenting advice, study habit setups for kids, nutrition tips, and daily home wellness.',
      badge: isBn ? 'ফ্যামিলি গাইড' : 'Family Care'
    },
    {
      id: 'wellness',
      icon: HeartPulse,
      colorClass: 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-500/30',
      badgeClass: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      title: isBn ? 'স্বাস্থ্য সচেতন নাগরিক' : 'Health Conscious Citizens',
      tag: isBn ? 'সুস্থ জীবনধারা' : 'Everyday Health',
      desc: isBn
        ? 'সঠিক পানি পান (Hydration), স্লিপ হাইজিন ও সরকারি স্বাস্থ্য বাতায়ন ১৬২৬৩-এ সরাসরি ১-ট্যাপে যোগাযোগ।'
        : 'Track hydration, build healthy sleep hygiene, and access the national health hotline 16263 instantly.',
      badge: isBn ? 'জরুরি ১৬২৬৩ হটলাইন' : 'Helpline 16263'
    }
  ];

  // Screen resize handler to adapt visible cards
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setVisibleCards(1);
        } else if (window.innerWidth < 1024) {
          setVisibleCards(2);
        } else {
          setVisibleCards(4);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persona Carousel Auto-slide timer (Slides 1-by-1 automatically & continuously)
  const maxPersonaIndex = Math.max(0, personas.length - visibleCards);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPersonaIndex((prev) => (prev >= maxPersonaIndex ? 0 : prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, [maxPersonaIndex]);

  const handlePrevPersona = () => {
    setCurrentPersonaIndex((prev) => (prev <= 0 ? maxPersonaIndex : prev - 1));
  };

  const handleNextPersona = () => {
    setCurrentPersonaIndex((prev) => (prev >= maxPersonaIndex ? 0 : prev + 1));
  };

  // Feature Showcase Carousel Auto-slide Timer (Slides 1-by-1 continuously)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureSlide((prev) => (prev >= totalFeatureSlides - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handlePrevFeatureSlide = () => {
    setCurrentFeatureSlide((prev) => (prev <= 0 ? totalFeatureSlides - 1 : prev - 1));
  };

  const handleNextFeatureSlide = () => {
    setCurrentFeatureSlide((prev) => (prev >= totalFeatureSlides - 1 ? 0 : prev + 1));
  };

  // Interactive timer effect on landing page
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timerSecondsLeft === 0) {
      setIsTimerRunning(false);
      setTimerCompleted(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  const handleStartDemoTimer = () => {
    setTimerSecondsLeft(20);
    setTimerCompleted(false);
    setIsTimerRunning(true);
  };

  const handleResetDemoTimer = () => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(20);
    setTimerCompleted(false);
  };

  // Handle direct phone subscription / check from hero card
  const handleInitiateSubscription = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const validation = validateMobileNumber(mobileInput);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || (isBn ? 'অনুগ্রহ করে ১১-সংখ্যার রবি (০১৮) বা সার্কেল (০১৬) নম্বর দিন।' : 'Please enter an 11-digit Robi (018) or Cirkle (016) number.'));
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(isBn ? 'সাবস্ক্রিপশন স্ট্যাটাস যাচাই করা হচ্ছে...' : 'Checking subscription status with BDApps...');

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
        setStatusMessage(isBn ? 'সাবস্ক্রিপশন সক্রিয় রয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Active subscription verified! Logging you in...');
        setTimeout(() => {
          setIsSubmitting(false);
          if (onEnterApp) onEnterApp();
        }, 700);
        return;
      }

      // Step 2: Not subscribed yet! Send SMS OTP and open dedicated OTP modal
      setStatusMessage(isBn ? 'এসএমএস ওটিপি পাঠানো হচ্ছে...' : 'Sending BDApps verification OTP...');
      const otpRes = await sendOTP(validation.cleaned);
      const ref = otpRes.referenceNo || otpRes.subscriberId || 'REF-' + Date.now();
      setReferenceNo(ref);
      setIsSubmitting(false);
      setStatusMessage('');
      // Open the dedicated OTP Verification Modal
      setIsOtpModalOpen(true);
    } catch {
      // Fallback: Open OTP modal with generated reference
      setReferenceNo('REF-' + Date.now());
      setIsSubmitting(false);
      setStatusMessage('');
      setIsOtpModalOpen(true);
    }
  };

  const handleOpenLogin = () => {
    setAuthView('phone');
    setAuthModalOpen(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  const faqs = isBn ? [
    {
      q: 'Askio এর জন্য সাবস্ক্রিপশন চার্জ কত এবং কিভাবে কাটা হয়?',
      a: 'Askio এর দৈনিক সাবস্ক্রিপশন ফি মাত্র ২ টাকা (ভ্যাট ও এসডি সহ ৳২.৭৮)। এটি আপনার রবি (০১৮) বা সার্কেল/এয়ারটেল (০১৬) সিমের মোবাইল ব্যালেন্স থেকে সরাসরি কাটা হয়। কোনো ক্রেডিট বা ডেবিট কার্ডের প্রয়োজন নেই।'
    },
    {
      q: 'আমি কীভাবে সাবস্ক্রিপশন বাতিল বা আনসাবস্ক্রাইব করব?',
      a: 'অ্যাপের ভেতরে আপনার প্রোফাইল পেজে গিয়ে যেকোনো সময় ১-ক্লিকে Unsubscribe করতে পারবেন। অথবা আপনার হ্যান্ডসেট থেকে 21213 নম্বরে SMS পাঠিয়ে STOP ASKIO লিখে পাঠালেই সার্ভিস বন্ধ হয়ে যাবে।'
    },
    {
      q: 'আমি পূর্বে সাবস্ক্রাইব করা থাকলে পুনরায় চার্জ হবে কি?',
      a: 'না, ইতিমধ্যে সক্রিয় সাবস্ক্রিপশন থাকলে লগইন অপশনে গিয়ে আপনার মোবাইল নম্বরটি লিখলেই কোনো অতিরিক্ত চার্জ বা ওটিপি ছাড়াই সরাসরি অ্যাপে প্রবেশ করতে পারবেন।'
    },
    {
      q: '২০-২০-২০ আই কেয়ার রুটিন আসলে কী?',
      a: 'এটি চক্ষু চিকিৎসকদের একটি বৈজ্ঞানিক নিয়ম: প্রতি ২০ মিনিট স্ক্রিনের দিকে তাকানোর পর ২০ সেকেন্ডের জন্য অন্তত ২০ ফুট দূরত্বের কোনো বস্তুর দিকে তাকিয়ে চোখ রিল্যাক্স করতে হয়। Askio তে এর জন্য বিল্ট-ইন টাইমার ও গাইড রয়েছে।'
    },
    {
      q: 'Askio AI অ্যাসিস্ট্যান্ট কি বাংলায় কথা বলতে পারে?',
      a: 'হ্যাঁ, Askio AI বাংলা এবং ইংরেজি উভয় ভাষায় সাবলীলভাবে যেকোনো প্রশ্নের সংক্ষিপ্ত, প্রাসঙ্গিক ও কার্যকরী পরামর্শ দিতে পারে।'
    }
  ] : [
    {
      q: 'How much is the subscription fee and how is it billed?',
      a: 'The daily subscription fee is ৳2.78 (including VAT & SD). It is automatically deducted from your Robi (018) or Cirkle/Airtel (016) main mobile balance. No credit or debit cards are required.'
    },
    {
      q: 'How can I unsubscribe or cancel my plan?',
      a: 'You can easily cancel anytime with 1-tap in the Profile screen inside Askio, or by sending an SMS typing "STOP ASKIO" to 21213 from your mobile handset.'
    },
    {
      q: 'Will I be charged again if I am already subscribed?',
      a: 'No. If your daily subscription is currently active, simply enter your phone number via "Log In" to access the app immediately with zero extra charges.'
    },
    {
      q: 'What is the 20-20-20 eye wellness routine?',
      a: 'It is a clinically approved protocol: every 20 minutes of screen use, pause for 20 seconds and look at an object at least 20 feet away to relax ciliary eye muscles. Askio includes an interactive timer for this.'
    },
    {
      q: 'Does Askio AI support Bengali language?',
      a: 'Yes, Askio AI provides native, fluent, and highly accurate answers in both Bengali and English with complete contextual awareness.'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* --- TOP APP BAR --- */}
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Brand Logo with responsive sizing */}
          <div className="flex items-center gap-2 shrink-0">
            <AppLogo 
              imgClassName="h-7 sm:h-8 md:h-9 w-auto" 
              subtitle={isBn ? 'নলেজ ও ভিশন প্ল্যাটফর্ম' : 'Knowledge & Vision Platform'}
            />
          </div>

          {/* Desktop Nav Actions (md:flex) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Features & Documentation Button in Nav */}
            <button
              id="landing-nav-docs-btn"
              onClick={() => setIsDocModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View Documentation"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? 'ডকুমেন্টেশন' : 'Docs'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              id="landing-theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Toggle */}
            <button
              id="landing-lang-toggle"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Log In Button - Opens Phone Login Modal */}
            <button
              id="landing-login-btn"
              onClick={handleOpenLogin}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
            >
              {isBn ? 'লগইন' : 'Log In'}
            </button>

            {/* Direct Subscribe CTA in Top Nav */}
            <a
              href="#subscription"
              id="landing-nav-subscribe-btn"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBn ? 'সাবস্ক্রাইব (৳২.৭৮)' : 'Subscribe (৳2.78)'}</span>
            </a>
          </div>

          {/* Mobile Nav Action Bar (< md) - Compact, Elegant & Zero-Overflow */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle Mobile */}
            <button
              id="landing-theme-toggle-mobile"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Toggle Mobile */}
            <button
              id="landing-lang-toggle-mobile"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Mobile Login Button */}
            <button
              id="landing-login-btn-mobile"
              onClick={handleOpenLogin}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
            >
              {isBn ? 'লগইন' : 'Log In'}
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              id="landing-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle Menu"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-zinc-900 dark:text-zinc-100" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Direct Subscribe CTA Mobile Banner */}
            <a
              href="#subscription"
              onClick={() => setIsMobileMenuOpen(false)}
              id="landing-mobile-subscribe-btn"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>{isBn ? 'সাবস্ক্রাইব করুন (মাত্র ৳২.৭৮/দিন)' : 'Subscribe Now (৳2.78/day)'}</span>
            </a>

            {/* Documentation Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsDocModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? 'অ্যাপ ডকুমেন্টেশন ও ফিচার গাইড' : 'App Documentation & Guide'}</span>
            </button>

            {/* Quick Section Links */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <a 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isBn ? 'ফিচার ডেমো' : 'Feature Demo'}</span>
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBn ? 'কিভাবে কাজ করে' : 'How it works'}</span>
              </a>
              <a 
                href="#subscription" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>{isBn ? 'সাবস্ক্রিপশন' : 'Pricing Plan'}</span>
              </a>
              <a 
                href="#faqs" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                <span>{isBn ? 'প্রশ্নোত্তর' : 'FAQs'}</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
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
              {isBn ? (
                <>আপনার সার্বক্ষণিক <span className="text-emerald-600 dark:text-emerald-400">এআই ভিশন</span> ও সমৃদ্ধ জ্ঞানভাণ্ডার</>
              ) : (
                <>Your Daily Intelligent <span className="text-emerald-600 dark:text-emerald-400">AI Vision</span> & Knowledge Platform</>
              )}
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {isBn 
                ? 'চোখের সুরক্ষায় ২০-২০-২০ ব্রেক টাইমার, ১৪,০০০+ হ্যান্ডবুক ও গাইড, ডেইলি গোলস ট্র্যাকার এবং ২৪/৭ এআই গাইডেন্স—কোনো ক্রেডিট কার্ড ছাড়াই প্রতিদিন মাত্র ৳২.৭৮ এ।' 
                : 'Empowering digital workers & students with evidence-based eye wellness, 14,000+ research guides, daily habit streak tracking, and 24/7 bilingual AI for only ৳2.78 / day.'}
            </p>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
                  14,000+
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {isBn ? 'গাইড ও হ্যান্ডবুক' : 'Curated Guides'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="font-extrabold text-lg text-teal-600 dark:text-teal-400">
                  20-20-20
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {isBn ? 'আই কেয়ার টাইমার' : 'Eye Care Timer'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="font-extrabold text-lg text-amber-600 dark:text-amber-400">
                  ৳2.78
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {isBn ? 'দৈনিক টেলকো ফি' : 'Daily Telco Billing'}
                </div>
              </div>
            </div>

            {/* Hero Action Buttons: Subscribe & App Details/Documentation */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-3">
              <a
                href="#subscription"
                id="hero-subscribe-cta-btn"
                className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>{isBn ? '৳২.৭৮/দিনে সাবস্ক্রাইব করুন' : 'Subscribe for ৳2.78/day'}</span>
              </a>

              {/* Documentation / Details Button right next to Subscribe button */}
              <button
                id="hero-documentation-btn"
                onClick={() => setIsDocModalOpen(true)}
                className="px-5 py-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl text-sm border border-zinc-200 dark:border-zinc-800 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isBn ? 'ফিচার্স ও বিস্তারিত ডকুমেন্টেশন' : 'Features & Documentation'}</span>
              </button>
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

              {/* Status Alert */}
              {errorMessage && (
                <div className="p-3 mb-4 rounded-xl text-xs flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {statusMessage && (
                <div className="p-3 mb-4 rounded-xl text-xs flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Step 1: Mobile Phone Number Input */}
              <form onSubmit={handleInitiateSubscription} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{isBn ? 'মোবাইল নম্বর (রবি ০১৮ / সার্কেল ০১৬)' : 'Mobile Number (Robi / Cirkle)'}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      BDApps ৳2.78/day
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
                    {isBn 
                      ? 'পূর্বে সাবস্ক্রাইব করা থাকলে সরাসরি প্রবেশ করবেন। নতুন নম্বরে আলাদা স্ক্রিনে ওটিপি পাঠানো হবে।' 
                      : 'Existing subscribers enter directly. New numbers verify via a dedicated OTP screen.'}
                  </p>
                </div>

                <button
                  type="submit"
                  id="subscribe-now-btn"
                  disabled={isSubmitting || !mobileInput.trim()}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying with BDApps...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>{isBn ? 'নম্বর দিয়ে প্রবেশ করুন (৳২.৭৮/দিন)' : 'Enter with Mobile (৳2.78/day)'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Benefits summary list */}
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? '২৪/৭ Askio AI গাইডেন্স কনসালটেশন' : 'Unlimited Askio AI Guidance queries'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? '১৪,০০০+ কিউরেটেড গাইড ও হ্যান্ডবুক সম্পূর্ণ অ্যাক্সেস' : 'Full access to 14,000+ medical and study handbooks'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? 'প্রোফাইল থেকে যেকোনো সময় ১-ক্লিকে আনসাবস্ক্রাইব' : 'Easy 1-tap unsubscribe anytime from your Profile'}</span>
                </div>
              </div>

              {/* Log In Here link in Subscription card */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                <span>{isBn ? 'ইতিমধ্যে সাবস্ক্রাইব করা আছে?' : 'Already subscribed?'}</span>
                <button
                  type="button"
                  id="subscribe-card-login-link"
                  onClick={handleOpenLogin}
                  className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {isBn ? 'এখানে লগইন করুন' : 'Log In Here'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 1: 1-BY-1 SLIDING FEATURE DEMO SHOWCASE --- */}
      <section id="features" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {isBn ? 'ইন্টারেক্টিভ ফিচার শোকেস' : 'Interactive Feature Showcase'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isBn ? 'অ্যাপের প্রধান ফিচারগুলো নিজেই পরখ করে দেখুন' : 'Experience Askio Features Right Here'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {isBn 
              ? 'একটি একটি করে স্লাইড করে দেখুন প্রতিটি টুল কীভাবে আপনার পড়ালেখা, কাজ ও চোখের যত্নে সহায়তা করবে।' 
              : 'Slide through each tool to preview how it elevates your studies, work, and ocular health.'}
          </p>
        </div>

        {/* Feature Carousel Container */}
        <div className="max-w-4xl mx-auto">
          {/* Sliding Viewport */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentFeatureSlide * 100}%)` }}
            >
              {/* SLIDE 0: AI CHAT ASSISTANT (MAIN AI) */}
              <div className="w-full shrink-0 px-1 sm:px-3">
                {/* Feature Name Button-shape (Centered Middle Highlight) */}
                <div className="flex flex-col items-center justify-center mb-5">
                  <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20 font-black text-sm sm:text-base tracking-wide">
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span>{isBn ? 'AI Chat Assistant' : 'AI Chat Assistant'}</span>
                    <span className="text-[11px] bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full font-bold ml-1">
                      {isBn ? 'প্রধান এআই' : 'Core AI'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    {isBn ? 'বাংলা ও ইংরেজিতে যেকোনো প্রশ্নের তাৎক্ষণিক বিশেষজ্ঞ সমাধান' : 'Instant bilingual intelligent guidance & multi-domain solutions'}
                  </p>
                </div>

                {/* Demo Card Below */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  {/* Card Status Subheader */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <ChatbotAvatar sizeClassName="w-10 h-10" showOnlineBadge={true} />
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Askio AI Assistant</h4>
                        <p className="text-[11px] text-zinc-400">{isBn ? 'যেকোনো বিষয়ের তাৎক্ষণিক উত্তর' : 'Intelligent multi-domain assistant'}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      Active 24/7
                    </span>
                  </div>

                  {/* Sample Chat Bubble Demo */}
                  <div className="space-y-3 pt-3">
                    <div className="flex justify-end">
                      <div className="bg-emerald-600 text-white text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-md shadow-sm">
                        {isBn ? 'দীর্ঘক্ষণ কম্পিউটারে কাজ করলে চোখের ক্লান্তি কীভাবে কমানো যায়?' : 'How do I relieve eye fatigue after 8 hours of computer work?'}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ChatbotAvatar sizeClassName="w-8 h-8 shrink-0 mt-0.5" />
                      <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tl-xs max-w-lg leading-relaxed shadow-sm">
                        {isBn ? (
                          <>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">চোখের ক্লান্তি কমাতে ৩টি কার্যকর নিয়ম:</p>
                            <p>১. <strong>২০-২০-২০ নিয়ম:</strong> প্রতি ২০ মিনিট পর ২০ সেকেন্ড ২০ ফুট দূরের কোনো দৃশ্যে তাকান।</p>
                            <p>২. <strong>ঘন ঘন পলক ফেলা:</strong> প্রতি মিনিটে ১২-১৫ বার পলক ফেলুন যেন চোখ আর্দ্র থাকে।</p>
                            <p>৩. <strong>স্ক্রিনের দূরত্ব:</strong> চোখ থেকে স্ক্রিন অন্তত ২০-২৪ ইঞ্চি দূরে রাখুন এবং চোখের লেভেলের সামান্য নিচে সেট করুন।</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">3 Evidence-Based Steps for Instant Relief:</p>
                            <p>1. <strong>20-20-20 Rule:</strong> Every 20 minutes, focus on an object 20 feet away for 20 seconds.</p>
                            <p>2. <strong>Blink Consciously:</strong> Complete 12-15 full blinks per minute to preserve the tear film.</p>
                            <p>3. <strong>Ergonomic Distance:</strong> Position the screen 20-24 inches away, slightly below eye level.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{isBn ? '💡 সাবস্ক্রাইব করে আনলিমিটেড যেকোনো প্রশ্ন করুন' : '💡 Subscribe to ask unlimited personalized questions'}</span>
                    <a href="#subscription" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                      {isBn ? 'এখনই শুরু করুন →' : 'Start Now →'}
                    </a>
                  </div>
                </div>
              </div>

              {/* SLIDE 1: SMART GLOBAL SEARCH */}
              <div className="w-full shrink-0 px-1 sm:px-3">
                {/* Feature Name Button-shape (Centered Middle Highlight) */}
                <div className="flex flex-col items-center justify-center mb-5">
                  <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/20 font-black text-sm sm:text-base tracking-wide">
                    <Search className="w-4 h-4 text-indigo-200 animate-pulse" />
                    <span>{isBn ? 'Smart Global Search' : 'Smart Global Search'}</span>
                    <span className="text-[11px] bg-indigo-700/80 text-indigo-100 px-2 py-0.5 rounded-full font-bold ml-1">
                      {isBn ? 'স্মার্ট সার্চ' : 'Instant Search'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    {isBn ? '১৪,০০০+ হ্যান্ডবুক, বিসিএস প্রস্তুতি ও স্বাস্থ্য নির্দেশিকা নিমেষেই খুঁজুন' : 'Lightning-fast search across 14,000+ handbooks, symptoms & study guides'}
                  </p>
                </div>

                {/* Demo Card Below */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  {/* Search Bar Simulation */}
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-indigo-500/40 dark:border-indigo-500/30 shadow-inner">
                        <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="flex-1 font-medium text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 truncate">
                          {isBn ? 'বিসিএস প্রিলিমিনারি সাধারণ বিজ্ঞান ও চোখের যত্ন গাইড...' : 'BCS Preliminary General Science & Eye Care Guide...'}
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          {isBn ? '০.০৩ সেকেন্ড' : '0.03s'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold">
                        {isBn ? 'সব (All)' : 'All'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                        {isBn ? 'চোখ ও স্বাস্থ্য' : 'Eye & Health'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                        {isBn ? 'বিসিএস ও চাকরি' : 'BCS & Career'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                        {isBn ? 'প্রযুক্তি ও কোডিং' : 'Tech & Coding'}
                      </span>
                    </div>

                    {/* Search Results Preview */}
                    <div className="space-y-2.5 pt-2">
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 transition-colors flex items-center justify-between">
                        <div className="space-y-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              {isBn ? 'স্বাস্থ্য নির্দেশিকা' : 'Health Guide'}
                            </span>
                            <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                              {isBn ? 'কম্পিউটার ভিশন সিন্ড্রোম ও আই কেয়ার প্রটোকল' : 'Computer Vision Syndrome & Eye Care Protocol'}
                            </h5>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {isBn ? 'চক্ষু বিশেষজ্ঞ নির্দেশিত স্ক্রিন টাইম কমানো ও ড্রাই আই প্রতিরোধের উপায়।' : 'Evidence-based routine for screen fatigue & digital eye strain.'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      </div>

                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 transition-colors flex items-center justify-between">
                        <div className="space-y-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                              {isBn ? 'বিসিএস স্টাডি' : 'BCS Study'}
                            </span>
                            <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                              {isBn ? '৪৬তম ও ৪৭তম বিসিএস বিজ্ঞান পূর্ণাঙ্গ সিলেবাস গাইড' : 'BCS General Science Comprehensive Syllabus & Q/A'}
                            </h5>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {isBn ? 'বিগত ১০ বছরের প্রশ্ন সমাধান ও শর্টকাট টেকনিকসহ হ্যান্ডবুক।' : '10-year question bank solutions and high-yield topic summaries.'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 2: 20-20-20 EYE TIMER */}
              <div className="w-full shrink-0 px-1 sm:px-3">
                {/* Feature Name Button-shape (Centered Middle Highlight) */}
                <div className="flex flex-col items-center justify-center mb-5">
                  <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30 ring-4 ring-teal-500/20 font-black text-sm sm:text-base tracking-wide">
                    <Eye className="w-4 h-4 text-teal-200 animate-pulse" />
                    <span>{isBn ? '20-20-20 Eye Timer' : '20-20-20 Eye Timer'}</span>
                    <span className="text-[11px] bg-teal-700/80 text-teal-100 px-2 py-0.5 rounded-full font-bold ml-1">
                      {isBn ? 'আই টাইমার' : 'Eye Care'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    {isBn ? 'স্ক্রিন ব্যবহারে চোখের ক্লান্তি রোধে বৈজ্ঞানিক ২০ সেকেন্ড টেস্ট' : 'Evidence-based ocular relaxation test for screens'}
                  </p>
                </div>

                {/* Demo Card Below */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  {/* Interactive Timer Content */}
                  <div className="text-center space-y-6 py-2">
                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {isBn ? 'স্ক্রিন থেকে চোখ সরিয়ে ২০ ফুট দূরে তাকান' : 'Look 20 feet away from the screen now'}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {isBn ? 'টাইমার স্টার্ট করে দেখুন আপনার চোখের সিলিয়ারি পেশী কতটা হালকা অনুভব করে' : 'Start the timer to experience ocular relaxation in real time'}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                        isTimerRunning 
                          ? 'border-teal-500 bg-teal-500/10 scale-105' 
                          : timerCompleted
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'
                      }`}>
                        <span className="font-mono text-4xl font-black text-zinc-900 dark:text-zinc-100">
                          {timerSecondsLeft}s
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">
                          {isTimerRunning ? (isBn ? 'বিশ্রাম নিন...' : 'Resting...') : timerCompleted ? (isBn ? 'সম্পূর্ণ!' : 'Complete!') : (isBn ? 'প্রস্তুত' : 'Ready')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      {!isTimerRunning ? (
                        <button
                          onClick={handleStartDemoTimer}
                          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isBn ? '২০ সেকেন্ড টেস্ট শুরু করুন' : 'Start 20s Test'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleResetDemoTimer}
                          className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl hover:bg-zinc-300 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isBn ? 'রিসেট' : 'Reset'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 3: KNOWLEDGE LIBRARY */}
              <div className="w-full shrink-0 px-1 sm:px-3">
                {/* Feature Name Button-shape (Centered Middle Highlight) */}
                <div className="flex flex-col items-center justify-center mb-5">
                  <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-500/20 font-black text-sm sm:text-base tracking-wide">
                    <BookOpen className="w-4 h-4 text-blue-200" />
                    <span>{isBn ? 'Knowledge Library' : 'Knowledge Library'}</span>
                    <span className="text-[11px] bg-blue-700/80 text-blue-100 px-2 py-0.5 rounded-full font-bold ml-1">
                      {isBn ? 'নলেজ লাইব্রেরি' : 'Handbooks'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    {isBn ? 'স্বাস্থ্য, প্রযুক্তি, ক্যারিয়ার ও বিসিএস স্টাডি গাইড' : 'Medical, Technology, Career and Productivity handbooks'}
                  </p>
                </div>

                {/* Demo Card Below */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  {/* Sub Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {isBn ? 'জনপ্রিয় রিসার্চ গাইডসমূহ' : 'Featured Guides & Handbooks'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                      10+ Categories
                    </span>
                  </div>

                  {/* Library Cards Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        Health • PDF Guide
                      </span>
                      <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {isBn ? 'ডিজিটাল আই স্ট্রেন ও নীল আলো থেকে সুরক্ষার হ্যান্ডবুক' : 'Complete Guide to Digital Eye Strain & Blue Light Protection'}
                      </h5>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {isBn ? 'চক্ষু বিশেষজ্ঞদের পরীক্ষিত ৭টি দৈনিক রুটিন ও চোখের ব্যায়াম।' : 'Clinical ophthalmology protocols for prolonged display usage.'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                        Career • Handbook
                      </span>
                      <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {isBn ? 'স্মার্ট স্টাডি মেথড ও ডিপ ফোকাস ফ্রেমওয়ার্ক' : 'Deep Work & Smart Study Workflow Framework'}
                      </h5>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {isBn ? 'পড়ার স্মৃতিশক্তি ধরে রাখা এবং ফোকাস ধরে রাখার বৈজ্ঞানিক উপায়।' : 'Retention mechanics and cognitive focus routines.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 4: MY GOALS TRACKER */}
              <div className="w-full shrink-0 px-1 sm:px-3">
                {/* Feature Name Button-shape (Centered Middle Highlight) */}
                <div className="flex flex-col items-center justify-center mb-5">
                  <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-4 ring-purple-500/20 font-black text-sm sm:text-base tracking-wide">
                    <Target className="w-4 h-4 text-purple-200" />
                    <span>{isBn ? 'My Goals Tracker' : 'My Goals Tracker'}</span>
                    <span className="text-[11px] bg-purple-700/80 text-purple-100 px-2 py-0.5 rounded-full font-bold ml-1">
                      {isBn ? 'গোলস ট্র্যাকার' : 'Habit & Goals'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    {isBn ? 'প্রতিদিনের লক্ষ্য পূরণ, হাইড্রেশন ও স্ট্রিক পয়েন্ট অর্জন' : 'Daily discipline tracking with milestone badges and streaks'}
                  </p>
                </div>

                {/* Demo Card Below */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  {/* Sub Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {isBn ? 'চলমান দৈনিক রুটিন' : 'Active Daily Routine'}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs">
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>7 {isBn ? 'দিনের স্ট্রিক' : 'Day Streak'}</span>
                    </div>
                  </div>

                  {/* Goals Content */}
                  <div className="space-y-3 pt-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                            {isBn ? '৪ বার ২০-২০-২০ আই ব্রেক সম্পন্ন' : '4x 20-20-20 Eye Breaks Completed'}
                          </span>
                          <span className="text-[10px] text-zinc-400">Target: 4/4 sessions</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100%</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                            {isBn ? '২ লিটার পানি পান ও হাইড্রেশন' : '2 Liters Hydration Goal'}
                          </span>
                          <span className="text-[10px] text-zinc-400">Target: 2000ml</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100%</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-zinc-400 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                          3
                        </div>
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                            {isBn ? 'নলেজ বেস থেকে ১টি রিসার্চ হ্যান্ডবুক পড়া' : 'Read 1 Curated Research Handbook'}
                          </span>
                          <span className="text-[10px] text-zinc-400">In progress • 15 mins left</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">60%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 5: HEALTH & EMERGENCY HELPLINE HUB */}
              <div className="w-full shrink-0 px-1 sm:px-3">
                {/* Feature Name Button-shape (Centered Middle Highlight) */}
                <div className="flex flex-col items-center justify-center mb-5">
                  <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-4 ring-rose-500/20 font-black text-sm sm:text-base tracking-wide">
                    <HeartPulse className="w-4 h-4 text-rose-200 animate-pulse" />
                    <span>{isBn ? 'Health & Emergency Hub' : 'Health & Emergency Hub'}</span>
                    <span className="text-[11px] bg-rose-700/80 text-rose-100 px-2 py-0.5 rounded-full font-bold ml-1">
                      {isBn ? 'জরুরি সেবা' : 'Emergency 24/7'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    {isBn ? 'জাতীয় জরুরি হটলাইন (৯৯৯, ১৬২৬৩), ব্লাড ব্যাংক ও সার্বক্ষণিক সহায়তা' : 'Instant access to national 24/7 emergency hotlines, ambulance & blood banks'}
                  </p>
                </div>

                {/* Demo Card Below */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  {/* Sub Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {isBn ? 'জরুরি হেল্পলাইন নম্বরসমূহ (বাংলাদেশ)' : 'Official Bangladesh Emergency Hotlines'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Toll Free 24/7
                    </span>
                  </div>

                  {/* Emergency Calling Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    {/* 999 */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
                          {isBn ? 'জাতীয় জরুরি সেবা' : 'National Emergency'}
                        </span>
                        <h4 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">999</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                          {isBn ? 'পুলিশ, অ্যাম্বুলেন্স ও ফায়ার সার্ভিস' : 'Police, Ambulance & Fire Service'}
                        </p>
                      </div>
                      <a 
                        href="tel:999" 
                        className="mt-3 py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{isBn ? 'কল করুন' : 'Call 999'}</span>
                      </a>
                    </div>

                    {/* 16263 */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                          {isBn ? 'স্বাস্থ্য বাতায়ন' : 'Health Helpline'}
                        </span>
                        <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">16263</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                          {isBn ? 'সরকারি ডাক্তারের তাৎক্ষণিক পরামর্শ' : '24/7 Certified Doctor Advice'}
                        </p>
                      </div>
                      <a 
                        href="tel:16263" 
                        className="mt-3 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{isBn ? 'কল করুন' : 'Call 16263'}</span>
                      </a>
                    </div>

                    {/* 333 */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                          {isBn ? 'জাতীয় তথ্য সেবা' : 'Govt Services'}
                        </span>
                        <h4 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">333</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                          {isBn ? 'সরকারি তথ্য ও সেবা সংক্রান্ত সহায়তা' : 'Citizen Assistance & Relief'}
                        </p>
                      </div>
                      <a 
                        href="tel:333" 
                        className="mt-3 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{isBn ? 'কল করুন' : 'Call 333'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 6: SPECIALIST AI PERSONAS */}
              <div className="w-full shrink-0 px-1 sm:px-3">
                {/* Feature Name Button-shape (Centered Middle Highlight) */}
                <div className="flex flex-col items-center justify-center mb-5">
                  <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-4 ring-amber-500/20 font-black text-sm sm:text-base tracking-wide">
                    <Bot className="w-4 h-4 text-amber-200" />
                    <span>{isBn ? 'Specialist AI Personas' : 'Specialist AI Personas'}</span>
                    <span className="text-[11px] bg-amber-700/80 text-amber-100 px-2 py-0.5 rounded-full font-bold ml-1">
                      {isBn ? 'বিশেষজ্ঞ মেন্টর' : '5+ Personas'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    {isBn ? 'চক্ষু বিশেষজ্ঞ, বিসিএস স্টাডি মেন্টর, ক্যারিয়ার কোচ ও কোডিং এক্সপার্ট' : 'Ophthalmologist, BCS mentor, career counselor & software mentor in one app'}
                  </p>
                </div>

                {/* Demo Card Below */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  {/* Sub Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {isBn ? 'নির্দিষ্ট বিষয়ের এক্সপার্ট মোড নির্বাচন করুন' : 'Choose Your Specialized Mentor Mode'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
                      Domain Tailored
                    </span>
                  </div>

                  {/* 3 Persona Cards Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold text-sm">
                        👁️
                      </div>
                      <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {isBn ? 'ডা. চক্ষু বিশেষজ্ঞ' : 'Dr. Eye Specialist'}
                      </h5>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {isBn ? 'চোখের চাপ, ঝাপসা দেখা, ড্রাই আই ও স্ক্রিন চশমার বৈজ্ঞানিক পরামর্শ।' : 'Clinical guidance on ocular strain, dry eyes & display ergonomics.'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm">
                        🎓
                      </div>
                      <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {isBn ? 'বিসিএস স্টাডি মেন্টর' : 'BCS Study Mentor'}
                      </h5>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {isBn ? 'বিসিএস প্রিলি ও রিটেন প্রস্তুতি, সাধারণ জ্ঞান ও প্রশ্ন ব্যাখ্যা।' : 'High-yield study plans, memorization tricks & previous exam questions.'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-sm">
                        💻
                      </div>
                      <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {isBn ? 'টেক ও কোডিং কোচ' : 'Tech & Career Coach'}
                      </h5>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {isBn ? 'প্রোগ্রামিং সমস্যা সমাধান, সিভি রিভিউ ও ক্যারিয়ার রোডম্যাপ।' : 'Code debugging, architectural guidance & technical interview prep.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Controls & Indicator Dots */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={handlePrevFeatureSlide}
              id="feature-carousel-prev-btn"
              title={isBn ? 'পূর্ববর্তী ফিচার' : 'Previous Feature'}
              className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentFeatureSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentFeatureSlide === idx 
                      ? 'w-8 h-2.5 bg-emerald-600 dark:bg-emerald-500' 
                      : 'w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNextFeatureSlide}
              id="feature-carousel-next-btn"
              title={isBn ? 'পরবর্তী ফিচার' : 'Next Feature'}
              className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: WHO IS ASKIO FOR? (DYNAMIC 4-CARD SLIDING CAROUSEL) --- */}
      <section 
        className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800"
      >
        {/* Centered Heading and Subtitle as Requested */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {isBn ? 'কাদের জন্য Askio?' : 'Who is Askio For?'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isBn ? 'শিক্ষার্থী থেকে প্রফেশনাল — Askio সবার জন্য' : 'From Students to Professionals — Askio is for Everyone'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {isBn 
              ? 'যে কোনো বয়সের মানুষ, শিক্ষার্থী, চাকরিজীবী, কোডার, ফ্রিল্যান্সার, শিক্ষক বা অভিভাবক — সবার যেকোনো প্রশ্নের স্মার্ট এআই সমাধান ও সমৃদ্ধ জ্ঞানভাণ্ডার।' 
              : 'Engineered with versatile AI intelligence and rich knowledge libraries to assist anyone in their daily learning, work, and wellness.'}
          </p>

          {/* Carousel Manual Controls */}
          <div className="pt-2 flex items-center justify-center gap-2.5">
            <button
              onClick={handlePrevPersona}
              id="persona-slide-prev-btn"
              title={isBn ? 'আগের স্লাইড' : 'Previous'}
              className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPersona}
              id="persona-slide-next-btn"
              title={isBn ? 'পরবর্তী স্লাইড' : 'Next'}
              className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Viewport Container */}
        <div className="overflow-hidden w-full relative py-2">
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentPersonaIndex * (100 / visibleCards)}%)`
            }}
          >
            {personas.map((persona, pIdx) => {
              const IconComp = persona.icon;
              return (
                <div 
                  key={persona.id}
                  className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 px-2.5"
                >
                  <div className="h-full p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg dark:hover:shadow-zinc-950/40 transition-all duration-300 group">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${persona.colorClass} shadow-xs group-hover:scale-105 transition-transform`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                          {persona.tag}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-snug">
                        {persona.title}
                      </h3>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[56px]">
                        {persona.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${persona.badgeClass}`}>
                        <Check className="w-3 h-3" />
                        <span>{persona.badge}</span>
                      </span>
                      <span className="text-[11px] font-bold text-zinc-400">
                        0{pIdx + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {Array.from({ length: maxPersonaIndex + 1 }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCurrentPersonaIndex(dotIdx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentPersonaIndex === dotIdx 
                  ? 'w-7 bg-emerald-600 dark:bg-emerald-400' 
                  : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
              }`}
              title={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* --- SECTION 3: WHY ASKIO IS UNIQUE (COMPARISON GRID WITH PROPER ROUNDED CORNERS) --- */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {isBn ? 'কেন Askio সেরা?' : 'Why Choose Askio?'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isBn ? 'সাধারণ সাবস্ক্রিপশন বনাম Askio' : 'Traditional SaaS vs. Askio BDApps'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {isBn ? 'আন্তর্জাতিক কার্ডের ঝামেলা ছাড়া সাশ্রয়ী ও সমন্বিত সমাধান' : 'Zero credit card friction — affordable, local, all-in-one daily solution'}
          </p>
        </div>

        {/* Outer Round Card Frame with Full Overflow Clipping */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-zinc-100/80 dark:bg-zinc-800/80">
                  <th className="py-4 px-5 font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800">
                    {isBn ? 'ফিচার / সুবিধা' : 'Comparison Point'}
                  </th>
                  <th className="py-4 px-5 font-bold text-zinc-400 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                    {isBn ? 'সাধারণ বিদেশি SaaS' : 'Traditional SaaS'}
                  </th>
                  <th className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-500/10">
                    {isBn ? 'Askio (বিডিঅ্যাপস)' : 'Askio (BDApps)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'খরচ ও মূল্য' : 'Cost & Pricing'}
                  </td>
                  <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/60">
                    $15 - $20 / month (৳১৮০০+)
                  </td>
                  <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'মাত্র ৳২.৭৮ / দিন (ভ্যাটসহ)' : 'Only ৳2.78 / day (incl. VAT)'}
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}
                  </td>
                  <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'আন্তর্জাতিক ক্রেডিট কার্ড প্রয়োজন' : 'International USD Credit Card'}
                  </td>
                  <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'রবি/সার্কেল মোবাইল ব্যালেন্স' : 'Robi/Cirkle Mobile Balance'}
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'বাতিল বা আনসাবস্ক্রাইব' : 'Cancellation'}
                  </td>
                  <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'জটিল ও দীর্ঘ প্রক্রিয়া' : 'Complex dark patterns'}
                  </td>
                  <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'প্রোফাইল থেকে ১-ক্লিকে বাতিল' : 'Instant 1-Tap in Profile'}
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'বাংলা ভাষা সাপোর্ট' : 'Language Support'}
                  </td>
                  <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'কেবলমাত্র ইংরেজি' : 'English Only'}
                  </td>
                  <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-b border-zinc-100 dark:border-zinc-800/60">
                    {isBn ? 'সম্পূর্ণ বাংলা ও ইংরেজি' : 'Full Bengali & English'}
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-zinc-100">
                    {isBn ? 'চোখের সুরক্ষা ও নলেজ' : 'Eye Health & Library'}
                  </td>
                  <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400">
                    {isBn ? 'আলাদা আলাদা টুলস' : 'Fragmented separate apps'}
                  </td>
                  <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    {isBn ? 'সব এক অ্যাপে সমন্বিত' : 'All-in-One Seamless App'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: HOW IT WORKS (3 STEPS) --- */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {isBn ? 'সহজ ৩টি ধাপ' : 'Simple Activation'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isBn ? 'বিডিঅ্যাপস সাবস্ক্রিপশন কিভাবে কাজ করে' : 'How BDApps Subscription Works'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {isBn ? 'কোনো ব্যাংক অ্যাকাউন্ট বা ক্রেডিট কার্ড ছাড়াই সরাসরি মোবাইল ব্যালেন্স দিয়ে সক্রিয় হয়।' : 'No bank accounts or credit cards required. Instant telco balance billing.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {isBn ? '১. রবি / সার্কেল নম্বর দিন' : '1. Enter Robi / Cirkle Number'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isBn ? 'আপনার ১১-সংখ্যার রবি (০১৮) অথবা সার্কেল (০১৬) মোবাইল নম্বরটি দিন।' : 'Provide your 11-digit mobile number starting with 018 (Robi) or 016 (Cirkle / Airtel).'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {isBn ? '২. এসএমএস ওটিপি নিশ্চিত করুন' : '2. Verify Instant SMS OTP'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isBn ? 'আপনার ফোনে আসা ৬-সংখ্যার পিন ওটিপি স্ক্রিনে নিশ্চিত করুন।' : 'Receive a secure 6-digit confirmation pin directly via SMS and enter it to authorize.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {isBn ? '৩. আনলিমিটেড উপভোগ করুন' : '3. Enjoy Full Access'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isBn ? 'প্রতিদিন মাত্র ৳২.৭৮ দিয়ে এআই অ্যাসিস্ট্যান্ট ও সকল ফিচার উপভোগ করুন। যেকোনো সময় বাতিলযোগ্য।' : 'Access the AI guidance engine and full library for ৳2.78 / day. Unsubscribe anytime in 2 taps.'}
            </p>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {isBn ? 'সাধারণ প্রশ্নোত্তর' : 'Got Questions?'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isBn ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {isBn ? 'বিলিং, সার্ভিস বাতিল ও লগইন সংক্রান্ত সকল প্রয়োজনীয় তথ্য' : 'Everything you need to know about billing, unsubscribe options, and logging in.'}
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
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
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

      {/* --- OVERHAULED PROFESSIONAL FOOTER --- */}
      <footer className="pt-16 pb-12 px-4 sm:px-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Brand and Description Column */}
            <div className="lg:col-span-4 space-y-3.5">
              <AppLogo 
                imgClassName="h-8 w-auto"
                subtitle={isBn ? 'নলেজ ও ভিশন প্ল্যাটফর্ম' : 'Knowledge & Vision Platform'}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                {isBn
                  ? 'Askio — আপনার বিশ্বস্ত এআই স্বাস্থ্য, চোখের সুরক্ষা ও সমৃদ্ধ নলেজ প্ল্যাটফর্ম। রবি ও সার্কেল বিডিঅ্যাপস ভেরিফাইড।'
                  : 'Askio — Your trusted bilingual AI health, ocular ergonomics, and curated knowledge platform powered by BDApps.'}
              </p>

              <div className="pt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>BDApps Official Partner</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                  ৳2.78 / Day
                </span>
              </div>
            </div>

            {/* Column 1: App Features (Bilingual) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {isBn ? 'অ্যাপের ফিচারসমূহ' : 'Core Features'}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setIsDocModalOpen(true)} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>{isBn ? 'Askio AI অ্যাসিস্ট্যান্ট' : 'Askio AI Assistant'}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsDocModalOpen(true)} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Eye className="w-3 h-3 text-teal-500" />
                    <span>{isBn ? '২০-২০-২০ আই কেয়ার টাইমার' : '20-20-20 Eye Care Timer'}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsDocModalOpen(true)} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    <span>{isBn ? '১৪,০০০+ নলেজ লাইব্রেরি' : '14,000+ Curated Library'}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsDocModalOpen(true)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Target className="w-3 h-3 text-purple-500" />
                    <span>{isBn ? 'মাই গোলস ও স্ট্রিক ট্র্যাকার' : 'Goals & Streak Tracker'}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsDocModalOpen(true)} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <PhoneCall className="w-3 h-3 text-rose-500" />
                    <span>{isBn ? 'জরুরি হেল্পলাইন ও হেলথ হাব' : 'Helpline & Health Hub'}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Telco & Billing */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {isBn ? 'বিডিঅ্যাপস টেলকো বিলিং' : 'Telco & Carrier Billing'}
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>{isBn ? 'রবি (০১৮) ও সার্কেল (০১৬) সিম' : 'Robi & Cirkle Carrier Billing'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>{isBn ? 'দৈনিক মাত্র ৳২.৭৮ (ভ্যাটসহ)' : '৳2.78 / Day (All Taxes Incl.)'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>{isBn ? '১-ক্লিক আনসাবস্ক্রাইব সুবিধা' : 'Instant 1-Click Unsubscribe'}</span>
                </li>
                <li className="pt-1 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                  SMS: <span className="font-bold text-emerald-600 dark:text-emerald-400">STOP ASKIO</span> to 21213
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Access & Actions */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {isBn ? 'দ্রুত প্রবেশ' : 'Quick Actions'}
              </h4>
              <div className="space-y-2 flex flex-col items-start">
                <button
                  onClick={handleOpenLogin}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors w-full text-left flex items-center justify-between cursor-pointer"
                >
                  <span>{isBn ? 'গ্রাহক লগইন' : 'Subscriber Log In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors w-full text-left flex items-center justify-between cursor-pointer"
                >
                  <span>{isBn ? 'ডকুমেন্টেশন গাইড' : 'Feature Documentation'}</span>
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar with Status Indicator */}
          <div className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                All BDApps API & Telco Gateways Operational
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 text-center sm:text-right">
              © 2026 Askio. Powered by BDApps for Robi Axiata & Cirkle. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Interactive App Documentation Modal */}
      <AppDocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubscribeClick={() => {
          document.getElementById('subscription')?.scrollIntoView({ behavior: 'smooth' });
          document.getElementById('user-mobile-input')?.focus();
        }}
      />

      {/* Dedicated SMS OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        phoneNumber={mobileInput}
        referenceNo={referenceNo}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => {
          setIsOtpModalOpen(false);
          if (onEnterApp) onEnterApp();
        }}
        onChangePhone={() => {
          setIsOtpModalOpen(false);
          setTimeout(() => {
            document.getElementById('user-mobile-input')?.focus();
          }, 150);
        }}
      />

      {/* Dedicated Global Phone Log In Modal */}
      <AuthModal 
        onLoginSuccess={() => {
          if (onEnterApp) onEnterApp();
        }}
      />
    </div>
  );
};
