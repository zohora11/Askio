import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Filter, 
  Sparkles, 
  BookOpen, 
  Video, 
  FileText, 
  Layers
} from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { MOCK_RESOURCES, CATEGORIES_DATA, TRENDING_SEARCHES } from '../data/mockData';
import { FormatType, CategoryDomain } from '../types';
import { t, CATEGORY_TRANSLATIONS, FORMAT_TRANSLATIONS } from '../constants/translations';

const FORMAT_OPTIONS: FormatType[] = [
  'All',
  'Books',
  'PDFs',
  'Videos',
  'Links',
  'Articles',
  'Tools',
  'Talks'
];

export const SearchScreen: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedFormat, 
    setSelectedFormat,
    recentSearches, 
    addRecentSearch, 
    removeRecentSearch,
    clearRecentSearches,
    language
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<CategoryDomain | 'All'>('All');

  // Filter logic
  const filteredResources = MOCK_RESOURCES.filter(res => {
    const matchesQuery = !searchQuery.trim() || 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      res.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat = selectedFormat === 'All' || res.format === selectedFormat;
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;

    return matchesQuery && matchesFormat && matchesCategory;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }
  };

  const handleChipSearch = (query: string) => {
    setSearchQuery(query);
    addRecentSearch(query);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Live Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1 flex items-center bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden">
          <div className="pl-4 text-zinc-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.input_placeholder', language)}
            className="w-full px-3 py-3.5 text-sm sm:text-base bg-transparent text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400"
          />

          {searchQuery && (
            <button
              type="button"
              id="clear-search-btn"
              onClick={() => setSearchQuery('')}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 mr-1 rounded-lg cursor-pointer"
              title={t('search.clear', language)}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            id="submit-search-btn"
            className="hidden sm:flex items-center gap-1.5 px-5 py-3 mr-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>{language === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
          </button>
        </div>
      </form>

      {/* Multi-Type Resource Filtering (Books, Videos, Reels, PDFs, Articles, Guides, Talks) */}
      <div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> {language === 'bn' ? 'ফরম্যাট:' : 'Formats:'}
          </span>
          {FORMAT_OPTIONS.map((format) => (
            <button
              key={format}
              id={`filter-format-${format}`}
              onClick={() => setSelectedFormat(format)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFormat === format
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {FORMAT_TRANSLATIONS[language]?.[format] || format}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Search History with Individual Deletion Chips & Suggested Chips */}
      {!searchQuery && (
        <div className="space-y-4">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t('search.recent_searches', language)}</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-zinc-400 hover:text-rose-500 font-medium cursor-pointer"
                >
                  {t('search.clear_history', language)}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 group hover:border-zinc-400"
                  >
                    <button
                      onClick={() => handleChipSearch(query)}
                      className="hover:text-emerald-600 text-left truncate max-w-[200px] cursor-pointer"
                    >
                      {query}
                    </button>
                    <button
                      onClick={() => removeRecentSearch(query)}
                      className="p-0.5 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'bn' ? 'প্রস্তাবিত ও ট্রেন্ডিং সার্চ' : 'Suggested & Trending Queries'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((trend, i) => (
                <button
                  key={i}
                  onClick={() => handleChipSearch(trend)}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-2xs transition-colors cursor-pointer"
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Domain Filter Tabs */}
      <div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 text-xs font-semibold transition-colors border-b-2 -mb-2 cursor-pointer ${
              selectedCategory === 'All'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {language === 'bn' ? 'সকল ডোমেইন (১০+)' : 'All Domains (10+)'}
          </button>
          {CATEGORIES_DATA.map((cat) => (
            <button
              key={cat.domain}
              onClick={() => setSelectedCategory(cat.domain)}
              className={`px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-2 cursor-pointer ${
                selectedCategory === cat.domain
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {CATEGORY_TRANSLATIONS[language]?.[cat.domain] || cat.domain} ({cat.solutionsCount})
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            {searchQuery 
              ? (language === 'bn' ? `"${searchQuery}" এর ফলাফল` : `Results for "${searchQuery}"`)
              : (language === 'bn' ? 'সকল যাচাইকৃত রিসোর্স' : 'All Verified Resources')}
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {language === 'bn' ? `${filteredResources.length} টি আইটেম প্রদর্শিত` : `Showing ${filteredResources.length} items`}
          </span>
        </div>

        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
              {t('search.no_results', language)}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {t('search.no_results_sub', language)}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFormat('All');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 cursor-pointer"
            >
              {t('search.reset_filters', language)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
