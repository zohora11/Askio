import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Globe, 
  Lock, 
  Sliders, 
  ShieldCheck, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  Check, 
  ChevronDown, 
  AlertOctagon,
  Trash2,
  Mail,
  FileText
} from 'lucide-react';
import { ThemeMode, AppLanguage } from '../types';
import { t } from '../constants/translations';

export const SettingsScreen: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    user, 
    activityTrackingEnabled, 
    setActivityTrackingEnabled,
    analyticsConsent, 
    setAnalyticsConsent,
    selectedFormat,
    setSelectedFormat
  } = useApp();

  const [activeSection, setActiveSection] = useState<'all' | 'appearance' | 'language' | 'security' | 'content' | 'privacy' | 'help' | 'about'>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = language === 'bn' ? [
    {
      q: 'Askio-তে ২০-২০-২০ চোখের স্ট্রেন নিয়মটি কীভাবে কাজ করে?',
      a: 'প্রতি ২০ মিনিট স্ক্রিনে একটানা তাকানোর পর, Askio আপনাকে ২০ ফুট দূরের কোনো বস্তুর দিকে ২০ সেকেন্ডের জন্য তাকাতে নির্দেশ দেয়। এটি সিলিয়ারি পেশীর ক্লান্তি কমায়।'
    },
    {
      q: 'আমি কি অফলাইনে Askio ব্যবহার করতে পারি?',
      a: 'হ্যাঁ! আপনার বুকমার্ক করা হ্যান্ডবুক, সংরক্ষিত গাইড এবং সুস্থতার অভ্যাসগুলো লোকাল স্টোরেজে সেভ থাকে, ফলে ইন্টারনেট সংযোগ ছাড়াও এগুলো পড়া যায়।'
    },
    {
      q: 'দৈনিক ৳২.৭৮ বিডি অ্যাপস সাবস্ক্রিপশন কীভাবে কাজ করে?',
      a: 'Askio বিকাশ, নগদ বা মোবাইল ব্যালেন্সের মাধ্যমে সহজ দৈনিক বিডি অ্যাপস পেমেন্ট প্রদান করে। এর মাধ্যমে আপনি আনলিমিটেড এআই প্রশ্ন ও বিজ্ঞাপনহীন গাইড পাবেন, যা যেকোনো সময় বন্ধ করা যাবে।'
    },
    {
      q: 'চিকিৎসাগত তথ্যগুলো কি বিশেষজ্ঞদের দ্বারা যাচাইকৃত?',
      a: 'হ্যাঁ, আমাদের সকল দৃষ্টি সুস্থতা ও স্বাস্থ্য বিষয়ক নির্দেশনা সার্টিফাইড চক্ষু বিশেষজ্ঞ ও অপটোমেট্রিস্টদের দ্বারা পর্যালোচিত।'
    }
  ] : [
    {
      q: 'How does the 20-20-20 eye strain rule work in Askio?',
      a: 'Every 20 minutes spent focusing on your screen, Askio prompts you to gaze at an object 20 feet away for 20 seconds. This relaxes your ciliary muscles and prevents screen-induced ocular spasms.'
    },
    {
      q: 'Can I use Askio offline?',
      a: 'Yes! All bookmarked PDF handbooks, saved guides, and daily wellness steps are cached in local browser storage so you can consult them without an internet connection.'
    },
    {
      q: 'How does the ৳2 / day micro-subscription work?',
      a: 'Askio offers flexible micro-billing via mobile balance or local mobile wallets (bKash/Nagad). You get unlimited AI guidance queries and ad-free guides, cancellable at any time.'
    },
    {
      q: 'Are the medical resources peer-reviewed?',
      a: 'All clinical eye care guides and occupational wellness routines are authored or reviewed by certified optometrists, ophthalmologists, and ergonomics researchers.'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t('settings.title', language)}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('settings.subtitle', language)}
          </p>
        </div>
      </div>

      {/* 1. Appearance Control (Light, Dark, System) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t('settings.appearance', language)}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('settings.appearance_sub', language)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: t('settings.light_mode', language), icon: Sun },
            { id: 'dark', label: t('settings.dark_mode', language), icon: Moon },
            { id: 'system', label: t('settings.system_mode', language), icon: Monitor }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                id={`theme-btn-${item.id}`}
                onClick={() => setTheme(item.id as ThemeMode)}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Multi-Language Support (English / Bengali বাংলা) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t('settings.language', language)}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('settings.language_sub', language)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'en', label: 'English (US / Global)', sub: 'Default' },
            { id: 'bn', label: 'বাংলা (Bengali)', sub: 'বাংলাদেশ' }
          ].map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                id={`lang-btn-${lang.id}`}
                onClick={() => setLanguage(lang.id as AppLanguage)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <div>
                  <div className="text-sm font-bold">{lang.label}</div>
                  <div className="text-[11px] text-zinc-500">{lang.sub}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Account Security (AccountScreen) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {language === 'bn' ? 'অ্যাকাউন্ট নিরাপত্তা ও সেশন' : 'Account Security & Sessions'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {language === 'bn' ? 'লগইন তথ্য ও সক্রিয় ডিভাইস পরিচালনা করুন' : 'Manage credentials, two-step OTP verification, and connected devices'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">{language === 'bn' ? 'নিবন্ধিত ইমেইল' : 'Registered Email'}</div>
              <div className="text-zinc-500">{user.email}</div>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">{language === 'bn' ? 'মোবাইল নম্বর ও ওটিপি' : 'Mobile Phone OTP'}</div>
              <div className="text-zinc-500">{user.phone}</div>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{language === 'bn' ? 'সক্রিয়' : 'Active'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">{language === 'bn' ? 'সক্রিয় ওয়েব সেশন' : 'Active Web Sessions'}</div>
              <div className="text-zinc-500">{language === 'bn' ? '১টি সেশন (বর্তমান ব্রাউজার)' : '1 session in Chrome / Linux Container'}</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              {language === 'bn' ? 'বর্তমান ডিভাইস' : 'Current Device'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Privacy & Activity Tracking */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t('settings.privacy', language)}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {language === 'bn' ? 'অনুসন্ধান ইতিহাস এবং অ্যানালিটিক্স পছন্দসমূহ নিয়ন্ত্রণ করুন' : 'Control search history logging and anonymous analytics'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {t('settings.tracking', language)}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {language === 'bn' ? 'আপনার ব্যক্তিগত ইতিহাস ও স্ট্রিক গণনায় সাহায্য করে' : 'Powers your MyActivity timeline and goal streak calculations'}
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-activity-tracking"
              checked={activityTrackingEnabled}
              onChange={(e) => setActivityTrackingEnabled(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {t('settings.analytics', language)}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {language === 'bn' ? 'দৃষ্টি সুস্থতার রেকমেন্ডেশন মডেল উন্নত করতে সাহায্য করে' : 'Help improve vision ergonomics recommendation models'}
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-analytics-consent"
              checked={analyticsConsent}
              onChange={(e) => setAnalyticsConsent(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-rose-500 font-semibold">
              {language === 'bn' ? 'অ্যাকাউন্ট ও ডাটা মুছে ফেলা' : 'Account Deletion & Data Purge'}
            </span>
            <button
              onClick={() => alert(language === 'bn' ? 'ডাটা মুছে ফেলার অনুরোধ গৃহীত হয়েছে। ইমেইলে কনফার্মেশন পাঠানো হয়েছে।' : 'Account deletion request submitted. An email confirmation has been sent.')}
              className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'ডাটা মোছার অনুরোধ' : 'Request Data Deletion'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Help & Support with FAQ Accordions */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {language === 'bn' ? 'সহায়তা ও সাধারণ প্রশ্নোত্তর (FAQ)' : 'Help & Frequently Asked Questions'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {language === 'bn' ? 'চোখের যত্ন, বিডি অ্যাপস সাবস্ক্রিপশন ও স্টাডি গাইড সংক্রান্ত তথ্য' : 'Answers regarding eye ergonomics, BDApps subscription, and study workflows'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-3.5 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 leading-relaxed border-t border-zinc-200/60 dark:border-zinc-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. About Askio (v1.0.0, Terms, Company) */}
      <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
        <div className="w-10 h-10 mx-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl flex items-center justify-center shadow-md">
          a.
        </div>
        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          Askio Knowledge & Vision Platform
        </h4>
        <p className="text-xs text-zinc-400">
          Version 1.0.0 (Production Build) • {language === 'bn' ? 'Askio এআই গাইডেন্স ইঞ্জিন দ্বারা চালিত' : 'Powered by Askio AI Guidance Engine'}
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-emerald-600 dark:text-emerald-400 pt-2 font-medium">
          <a href="#" className="hover:underline">{language === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service'}</a>
          <span>•</span>
          <a href="#" className="hover:underline">{language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</a>
          <span>•</span>
          <a href="#" className="hover:underline">{language === 'bn' ? 'মেডিকেল অ্যাডভাইজরি' : 'Ophthalmology Advisory Board'}</a>
        </div>
      </div>
    </div>
  );
};
