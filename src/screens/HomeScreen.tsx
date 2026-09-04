import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  HeartPulse, 
  Target, 
  Zap, 
  CheckCircle, 
  Crown, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Eye
} from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { MOCK_RESOURCES, WELLNESS_TIPS, CATEGORIES_DATA } from '../data/mockData';

export const HomeScreen: React.FC = () => {
  const { 
    user, 
    setActiveTab, 
    setSearchQuery, 
    goals, 
    setSubscriptionModalOpen,
    sendChatMessage 
  } = useApp();

  const dailyTip = WELLNESS_TIPS[0]; // 20-20-20 Rule
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Askio AI Engine 2.0 Live</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Hello, {user.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            What knowledge or vision wellness guidance do you need today? Search across 14,000+ verified solutions or consult our AI assistant.
          </p>

          {/* Prompt quick actions */}
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => handleQuickAiPrompt('Can you guide me through a 2-minute eye exercise routine to relieve screen strain?')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eye exercises (2-min)</span>
            </button>
            <button
              onClick={() => handleQuickAiPrompt('How do I choose between an optometrist and ophthalmologist?')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>Find a specialist</span>
            </button>
            <button
              onClick={() => handleQuickAiPrompt('Book a personalized 14-day vision wellness guide')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Book a vision guide</span>
            </button>
          </div>
        </div>

        {/* Floating Stat Badge */}
        <div className="relative z-10 sm:self-center shrink-0">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center min-w-[140px] text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {goals[0]?.streakDays || 7} Days
            </div>
            <span className="text-[11px] text-zinc-300 font-medium">
              Daily Wellness Streak 🔥
            </span>
            <button
              onClick={() => setActiveTab('goals')}
              className="mt-2 text-xs text-white/80 hover:text-white flex items-center gap-1 underline"
            >
              <span>View Goals</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Daily Wellness Tip Card (Featured on Home) */}
      <div 
        id="home-daily-wellness-card"
        className="bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/40 dark:to-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 shadow-sm transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Daily Wellness Tip • {dailyTip.tag}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {dailyTip.title}
              </h3>
            </div>
          </div>

          <button
            id="view-all-wellness-btn"
            onClick={() => setActiveTab('health')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore all 10 Wellness Tips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
          {dailyTip.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
          {dailyTip.actionableSteps.slice(0, 2).map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 20 seconds needed
          </span>
          <button
            onClick={() => handleQuickAiPrompt('Can you start an audio/visual 20-20-20 countdown timer with eye roll cues?')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Start 20s Exercise Now
          </button>
        </div>
      </div>

      {/* Category Pills (10+ Domains) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Browse by Domain
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Curated across 10+ professional and personal development fields
            </p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            See All Domains
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.domain}
              id={`category-card-${cat.domain}`}
              onClick={() => handleQuickSearch(cat.domain)}
              className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {cat.badge}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.domain}
                </h4>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                {cat.solutionsCount} solutions
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
              Featured Clinical & Knowledge Guides
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Top-rated peer reviewed handbooks, talks, and vertical micro-reels
            </p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Explore Catalog
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
                Active Learning Goals & Milestones
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Keep up your momentum with structured module tracks
              </p>
            </div>
          </div>

          <button
            id="open-goals-btn"
            onClick={() => setActiveTab('goals')}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
          >
            Manage Goals
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
                <span>{goal.totalModules - goal.completedModules} modules left</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  🔥 {goal.streakDays}d streak
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Askio Premium Micro-subscription Banner (৳2 / day) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border-2 border-amber-300 dark:border-amber-700/60 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase mb-1">
              Askio Micro-Plan
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Unlimited AI Guidance & Ad-Free Content for just ৳2 / day
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Pay daily via bKash/Nagad. Instant access to all 4,000+ clinical eye and study blueprints.
            </p>
          </div>
        </div>

        <button
          id="home-upgrade-btn"
          onClick={() => setSubscriptionModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wide transition-all shrink-0 shadow-md"
        >
          {user.isPremium ? 'Manage Subscription' : 'Upgrade for ৳2 / day'}
        </button>
      </div>
    </div>
  );
};
