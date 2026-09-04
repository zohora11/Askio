import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  BookOpen, 
  Target, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  FileText,
  Video,
  Flame,
  Globe,
  Compass,
  HeartPulse
} from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { MOCK_RESOURCES, FEATURED_SPOTLIGHTS, CATEGORIES_DATA } from '../data/mockData';
import { ChatbotAvatar } from '../components/ChatbotAvatar';
import { t, CATEGORY_TRANSLATIONS } from '../constants/translations';

export const HomeScreen: React.FC = () => {
  const { 
    user, 
    setActiveTab, 
    setSearchQuery, 
    goals, 
    sendChatMessage,
    language,
    setWellnessModalOpen
  } = useApp();

  const isBn = language === 'bn';
  const spotlight = FEATURED_SPOTLIGHTS[0];
  const featuredResources = MOCK_RESOURCES.slice(0, 4);

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleQuickAiPrompt = (prompt: string) => {
    setActiveTab('ai');
    sendChatMessage(prompt);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-zinc-800/80">
        {/* Ambient Decorative Lighting Aura */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('home.badge', language)}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t('home.welcome', language)}, {user.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            {t('home.subtitle', language)}
          </p>

          {/* Prompt quick actions */}
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => handleQuickSearch('PDF books')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('home.quick_eye', language)}</span>
            </button>
            <button
              onClick={() => handleQuickSearch('Video Tutorials')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('home.quick_specialist', language)}</span>
            </button>
            <button
              onClick={() => handleQuickAiPrompt(isBn ? 'যেকোনো বিষয় সম্পর্কে আমাকে সংক্ষেপে সহজ বাংলায় গাইড দাও।' : 'Summarize the most important concepts on Machine Learning and React.')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('home.quick_guide', language)}</span>
            </button>
          </div>
        </div>

        {/* Floating Stat Badge & Premium Holographic AI Portal */}
        <div className="relative z-10 sm:self-center shrink-0 flex items-center gap-4">
          {/* Ethereal Floating AI Orb (No Box Border) */}
          <div 
            onClick={() => setActiveTab('ai')}
            className="cursor-pointer group flex flex-col items-center justify-center relative select-none"
            title={isBn ? 'Askio এআই সহকারীর সাথে কথা বলুন' : 'Chat with Askio AI'}
          >
            {/* Ambient Radial Pulsing Aura */}
            <span className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/40 via-teal-400/30 to-emerald-400/50 rounded-full blur-md group-hover:blur-lg opacity-80 group-hover:opacity-100 transition-all duration-500 animate-pulse pointer-events-none" />

            {/* Circular Holographic Glass Orb Frame */}
            <div className="relative w-15 h-15 rounded-full bg-gradient-to-br from-emerald-950/80 via-zinc-900/90 to-teal-950/80 p-0.5 border-2 border-emerald-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)] group-hover:border-emerald-300 group-hover:scale-105 transition-all duration-300">
              <ChatbotAvatar sizeClassName="w-11 h-11 group-hover:scale-110 transition-transform" showOnlineBadge={true} />
            </div>

            {/* Floating Soft Pill Badge */}
            <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md flex items-center gap-1 shadow-sm group-hover:bg-emerald-500/30 transition-colors">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-300 font-bold tracking-wide">
                {isBn ? 'আস্ক এআই' : 'Askio AI'}
              </span>
            </div>
          </div>

          {/* Frosted Glass Streak Capsule */}
          <div className="p-4 rounded-3xl bg-white/10 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/15 dark:border-zinc-700/60 flex flex-col items-center justify-center min-w-[135px] text-center shadow-lg hover:border-emerald-400/40 transition-all">
            <div className="flex items-center gap-1.5 text-2xl font-black text-emerald-400">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400/30 animate-pulse" />
              <span>{goals[0]?.streakDays || 7}</span>
              <span className="text-sm font-semibold text-zinc-300">{t('home.streak_days', language)}</span>
            </div>
            <span className="text-[11px] text-zinc-300 font-medium mt-0.5">
              {t('home.wellness_streak', language)}
            </span>
            <button
              onClick={() => setActiveTab('goals')}
              className="mt-2 text-xs text-emerald-300 hover:text-white flex items-center gap-1 font-semibold group"
            >
              <span>{t('home.view_goals', language)}</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Wellness Tips Featured Card */}
      <div 
        id="home-daily-wellness-tips-card"
        onClick={() => setWellnessModalOpen(true)}
        className="group relative bg-gradient-to-r from-teal-950/90 via-emerald-950/90 to-zinc-900 border-2 border-emerald-400/60 dark:border-emerald-500/50 rounded-3xl p-6 text-white shadow-xl hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Subtle Background Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl group-hover:bg-emerald-500/30 transition-all pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
              <HeartPulse className="w-7 h-7 text-emerald-100 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{isBn ? 'আজকের ডেইলি ওয়েলনেস টিপস' : "Today's Daily Wellness Tip"}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-200 transition-colors leading-tight">
                {isBn ? '২০-২০-২০ আই কেয়ার রুল ও কম্পিউটার ভিশন রিলিফ' : '20-20-20 Eye Care Rule & Screen Fatigue Relief'}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 line-clamp-2 max-w-2xl leading-relaxed">
                {isBn 
                  ? 'দীর্ঘক্ষণ স্ক্রিনে তাকিয়ে কাজ করলে চোখের শুষ্কতা তৈরি হয়। প্রতি ২০ মিনিট পর ২০ ফুট দূরের যেকোনো বস্তুর দিকে অন্তত ২০ সেকেন্ড তাকিয়ে থাকুন।' 
                  : 'Continuous screen time causes digital eye strain. Look at an object 20 feet away for 20 seconds every 20 minutes to relax your eyes.'}
              </p>
            </div>
          </div>

          <button
            id="open-wellness-modal-home-btn"
            onClick={(e) => {
              e.stopPropagation();
              setWellnessModalOpen(true);
            }}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shrink-0 group-hover:scale-105 cursor-pointer"
          >
            <span>{isBn ? 'সম্পূর্ণ টিপস ও গাইড দেখুন' : 'View Full Tips & Guide'}</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Featured Search Spotlight Card */}
      <div 
        id="home-search-spotlight-card"
        className="bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/40 dark:to-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 shadow-sm transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {t('home.daily_tip', language)} • {spotlight.tag}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isBn ? 'ফুল-স্ট্যাক ডেভেলপার রোডম্যাপ ২০২৬ (ফ্রি পিডিএফ)' : spotlight.title}
              </h3>
            </div>
          </div>

          <button
            id="view-all-spotlights-btn"
            onClick={() => setActiveTab('health')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{t('home.explore_all_tips', language)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
          {isBn 
            ? 'রিঅ্যাক্ট, নেক্সট.জেএস, নোড.জেএস, ডাটাবেস ও এআই এপিআই ইন্টিগ্রেশন সম্পর্কিত স্টেপ-বাই-স্টেপ পূর্ণাঙ্গ ২০২৬ গাইড পিডিএফ ডাউনলোড করুন।'
            : spotlight.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
          {(isBn 
            ? ['জাভাস্ক্রিপ্ট ও টাইপস্ক্রিপ্ট ফান্ডামেন্টালস রিভিউ', 'এআই ও ক্লাউড রান ডেপ্লয়মেন্ট প্র্যাকটিস']
            : spotlight.actionableSteps.slice(0, 2)
          ).map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {isBn ? '১৫ মিনিট পড়া' : '15 mins read'}
          </span>
          <button
            onClick={() => handleQuickSearch('Full Stack Developer Roadmap')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {isBn ? 'পিডিএফ সার্চ ও ভিউ করুন' : 'Search & View PDF'}
          </button>
        </div>
      </div>

      {/* Category Pills (10+ Domains) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {t('home.explore_categories', language)}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('home.categories_sub', language)}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('home.view_all_catalogs', language)}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.domain}
              id={`category-card-${cat.domain.replace(/\s+/g, '-')}`}
              onClick={() => handleQuickSearch(cat.domain)}
              className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {cat.badge}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {CATEGORY_TRANSLATIONS[language]?.[cat.domain] || cat.domain}
                </h4>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                {cat.solutionsCount} {isBn ? 'টি আইটেম' : 'items'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Resources Catalog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {t('home.featured_resources', language)}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('home.featured_sub', language)}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('home.see_all_resources', language)}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </div>

      {/* Learning Goals Snapshot */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                {isBn ? 'সক্রিয় শিখন লক্ষ্য ও স্টাডি গোল' : 'Active Learning Goals & Milestones'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isBn ? 'বই পড়া, ভিডিও টিউটোরিয়াল দেখা ও নোট করার ট্র্যাকিং' : 'Track your daily reading, video courses, and notes'}
              </p>
            </div>
          </div>

          <button
            id="open-goals-btn"
            onClick={() => setActiveTab('goals')}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
          >
            {isBn ? 'লক্ষ্যসমূহ পরিচালনা' : 'Manage Goals'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.slice(0, 3).map((goal) => (
            <div
              key={goal.id}
              className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {goal.category}
                  </span>
                  <span className="text-zinc-500 font-medium">{goal.progress}%</span>
                </div>
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-3">
                  {goal.title}
                </h4>
                
                {/* Linear progress bar */}
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
                <span>{goal.totalModules - goal.completedModules} {isBn ? 'টি টাস্ক বাকি' : 'tasks left'}</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  🔥 {goal.streakDays}{isBn ? ' দিনের স্ট্রিক' : 'd streak'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
