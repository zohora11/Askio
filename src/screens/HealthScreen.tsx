import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Compass, 
  Sparkles, 
  Search, 
  FileText, 
  BookOpen, 
  Video, 
  Wrench, 
  ArrowRight,
  Database,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';
import { FEATURED_SPOTLIGHTS, MOCK_RESOURCES } from '../data/mockData';
import { ResourceCard } from '../components/ResourceCard';
import { KnowledgeSpotlight } from '../types';
import { t } from '../constants/translations';

export const HealthScreen: React.FC = () => {
  const { sendChatMessage, setActiveTab, setSearchQuery, language } = useApp();
  const isBn = language === 'bn';

  const [selectedSpotlight, setSelectedSpotlight] = useState<KnowledgeSpotlight | null>(null);

  const handleSpotlightAi = (spotlightItem: KnowledgeSpotlight) => {
    setSelectedSpotlight(null);
    setActiveTab('ai');
    sendChatMessage(
      isBn 
        ? `আমাকে "${spotlightItem.title}" বিষয়ে বিস্তারিত ব্যাখ্যা, বুক সামারি এবং প্রয়োজনীয় শেখার লিংক প্রদান করুন।` 
        : `Can you give me a detailed summary and learning guide on "${spotlightItem.title}"?`
    );
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" />
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
          <span>{isBn ? 'ইউনিভার্সাল সার্চ ইন্ডেক্স লাইভ' : 'Universal Search Stream Active'}</span>
        </div>
      </div>

      {/* AI Quick Search Hero Banner */}
      <div 
        id="discover-hero-banner"
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-0.5 rounded-full bg-black/20 text-white text-[10px] font-extrabold uppercase tracking-wide">
              {isBn ? 'এআই সার্চ ইঞ্জিন' : 'AI Search Engine'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              {isBn ? 'যেকোনো বিষয় লিখে সার্চ করুন বা এআই-কে আস্ক করুন' : 'Search Millions of Verified Books, PDFs & Video Guides'}
            </h3>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              {isBn 
                ? 'বইয়ের সামারি, ফ্রি পিডিএফ ডাউনলোড, ভিডিও টিউটোরিয়াল, গবেষণাপত্র ও ওয়েবাসাইট লিংক এক প্ল্যাটফর্মে।'
                : 'Instantly find and summarize eBooks, research PDFs, coding video lectures, and web toolkits.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('search')}
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs shadow-lg hover:bg-emerald-50 transition-all shrink-0 flex items-center justify-center gap-2 relative z-10"
        >
          <Search className="w-4 h-4" />
          <span>{isBn ? 'মাল্টি-ফরম্যাট সার্চ খুলুন' : 'Open Search Engine'}</span>
        </button>
      </div>

      {/* Format Category Hubs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => handleQuickSearch('Books')}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{isBn ? 'বই ও সাহিত্য' : 'eBooks & Literature'}</h4>
          <p className="text-xs text-zinc-500 mt-1">{isBn ? '৪৮,০০০+ বই' : '48,000+ books'}</p>
        </div>

        <div 
          onClick={() => handleQuickSearch('PDFs')}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{isBn ? 'পিডিএফ ও রিসার্চ' : 'PDFs & Whitepapers'}</h4>
          <p className="text-xs text-zinc-500 mt-1">{isBn ? '৩৫,০০০+ পিডিএফ' : '35,000+ PDFs'}</p>
        </div>

        <div 
          onClick={() => handleQuickSearch('Videos')}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{isBn ? 'ভিডিও টিউটোরিয়াল' : 'Video Masterclasses'}</h4>
          <p className="text-xs text-zinc-500 mt-1">{isBn ? '২৬,০০০+ ভিডিও' : '26,000+ videos'}</p>
        </div>

        <div 
          onClick={() => handleQuickSearch('Tools')}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{isBn ? 'টুলস ও চিরকুট' : 'Tools & Cheat Sheets'}</h4>
          <p className="text-xs text-zinc-500 mt-1">{isBn ? '১৯,০০০+ টুলস' : '19,000+ cheat sheets'}</p>
        </div>
      </div>

      {/* Featured Knowledge Spotlights */}
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {t('health.tips_heading', language)}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURED_SPOTLIGHTS.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.durationMinutes}m
                  </span>
                </div>

                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  {item.subtitle}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {item.actionableSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSpotlightAi(item)}
                className="mt-5 w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white" />
                <span>{isBn ? 'এআই দিয়ে ব্যাখ্যা চান' : 'Analyze with AI'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Resources */}
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {isBn ? 'জনপ্রিয় সার্চ আইটেমসমূহ' : 'Popular Knowledge Items'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_RESOURCES.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </div>
    </div>
  );
};
