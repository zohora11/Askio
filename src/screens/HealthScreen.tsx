import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HeartPulse, 
  AlertTriangle, 
  PhoneCall, 
  ShieldCheck, 
  Activity, 
  Apple, 
  Dumbbell, 
  Smile, 
  Eye, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Database,
  Wifi,
  Sparkles
} from 'lucide-react';
import { WELLNESS_TIPS, MOCK_RESOURCES } from '../data/mockData';
import { ResourceCard } from '../components/ResourceCard';
import { WellnessTip } from '../types';
import { t } from '../constants/translations';

export const HealthScreen: React.FC = () => {
  const { sendChatMessage, setActiveTab, language } = useApp();
  const isBn = language === 'bn';

  const [selectedTip, setSelectedTip] = useState<WellnessTip | null>(null);

  const healthResources = MOCK_RESOURCES.filter(r => r.category === 'Health');

  const handleStartTipAi = (tip: WellnessTip) => {
    setSelectedTip(null);
    setActiveTab('ai');
    sendChatMessage(
      isBn 
        ? `আমাকে "${tip.title}" সঠিকভাবে মেনে চলার বিষয়ে একটি সহজ রুটিন ও পরামর্শ দিন।` 
        : `Can you guide me on implementing "${tip.title}"? Please give me an interactive countdown or scheduled routine.`
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-emerald-600" />
            <span>{t('health.title', language)}</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('health.subtitle', language)}
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Database className="w-3.5 h-3.5" />
          <span>{isBn ? 'লাইভ হেলথ ডাটাবেস সক্রিয়' : 'Live Knowledge Stream Active'}</span>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div 
        id="medical-disclaimer-banner"
        className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex items-start gap-3.5 text-amber-900 dark:text-amber-200 shadow-2xs"
      >
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong className="font-bold block mb-0.5">
            {isBn ? 'চিকিৎসা ও দৃষ্টি শিক্ষা বিষয়ক ডিসক্লেইমার' : 'Medical & Clinical Educational Disclaimer'}
          </strong>
          {isBn 
            ? 'Askio-তে প্রদত্ত স্বাস্থ্য টিপস এবং এআই নির্দেশিকা কেবল শিক্ষণীয় ও সচেতনতামূলক উদ্দেশ্যে তৈরি। চোখের তীব্র প্রদাহ বা দৃষ্টির কোনো গুরুতর সমস্যায় অবশ্যই লাইসেন্সপ্রাপ্ত চক্ষু বিশেষজ্ঞের পরামর্শ গ্রহণ করুন।'
            : 'The content, routines, and AI guidance provided on Askio are curated strictly for educational and self-care reference. They do not constitute formal medical diagnosis or replace professional consultation with a licensed ophthalmologist or physician.'}
        </div>
      </div>

      {/* Emergency Hotline Card */}
      <div 
        id="emergency-hotline-card"
        className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <PhoneCall className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-0.5 rounded-full bg-black/20 text-white text-[10px] font-extrabold uppercase tracking-wide">
              {isBn ? 'জরুরি সহায়তা' : 'Emergency Assistance'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              {isBn ? 'জরুরি চিকিৎসা বা চক্ষু সহায়তা হটলাইন' : 'Need Help Now? Emergency Medical Hotlines'}
            </h3>
            <p className="text-xs text-rose-100 mt-1 max-w-xl">
              {isBn 
                ? 'হঠাৎ দৃষ্টিশক্তি হ্রাস, চোখে তীব্র আঘাত বা যে কোনো জরুরি প্রয়োজনে তাৎক্ষণিক জাতীয় বা স্বাস্থ্য বাতায়নে যোগাযোগ করুন।'
                : 'If you are experiencing acute ocular pain, sudden vision loss, severe trauma, or psychological distress, contact emergency responders immediately.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href="tel:999"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white text-rose-700 font-black text-xs hover:bg-rose-50 transition-colors text-center flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>{isBn ? 'জাতীয় জরুরি সেবা: ৯৯৯' : 'National: 999'}</span>
          </a>
          <a
            href="tel:16263"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-900/40 text-white border border-rose-300 font-bold text-xs hover:bg-rose-900/60 transition-colors text-center flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>{isBn ? 'স্বাস্থ্য বাতায়ন: ১৬২৬৩' : 'Health Batayan: 16263'}</span>
          </a>
        </div>
      </div>

      {/* Wellness Protocols & Action Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {t('health.tips_heading', language)}
            </h3>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {WELLNESS_TIPS.length} {isBn ? 'টি পরীক্ষিত টিপস' : 'Protocols Available'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WELLNESS_TIPS.map((tip) => (
            <div
              key={tip.id}
              id={`wellness-tip-${tip.id}`}
              onClick={() => setSelectedTip(tip)}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                  {tip.category}
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{tip.durationMinutes} {isBn ? 'মিনিট' : 'min'}</span>
                </span>
              </div>

              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-emerald-600 transition-colors">
                {tip.title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {tip.description}
              </p>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{isBn ? 'বিস্তারিত গাইড দেখুন' : 'Explore step-by-step'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Clinical Health Resources */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            <span>{isBn ? 'চোখের যত্ন ও স্বাস্থ্য গাইড' : 'Featured Eye Care Guides'}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {healthResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </section>

      {/* Selected Tip Modal with AI Assistant Link */}
      {selectedTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {selectedTip.category} • {selectedTip.durationMinutes} {isBn ? 'মিনিট' : 'min'}
              </span>
              <button
                onClick={() => setSelectedTip(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {selectedTip.title}
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
              {selectedTip.description}
            </p>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 mb-5">
              <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'কার্যকর টিপস ও কার্যপদ্ধতি' : 'Key Clinical Insights'}</span>
              </h5>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {isBn 
                  ? 'এই ব্যায়ামটি দিনে কয়েকবার নিয়মিত অনুশীলন করুন যাতে চোখের পেশির ক্লান্তি কমে এবং ফোকাস বৃদ্ধি পায়।' 
                  : 'Practicing this routine consistently reduces dry-eye syndrome and ocular muscle fatigue during long work hours.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTip(null)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                onClick={() => handleStartTipAi(selectedTip)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isBn ? 'এআই সহকারীর সাথে অনুশীলন করুন' : 'Practice with Askio AI'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
