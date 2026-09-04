import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bookmark, Clock, Trash2, BookOpen, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { MOCK_RESOURCES } from '../data/mockData';
import { FormatType } from '../types';

const FORMAT_OPTIONS: FormatType[] = [
  'All',
  'Books',
  'Videos',
  'Reels',
  'PDFs',
  'Articles',
  'Guides',
  'Talks'
];

export const LibraryScreen: React.FC = () => {
  const { 
    bookmarkedIds, 
    recentlyViewedIds, 
    clearRecentlyViewed, 
    setActiveTab 
  } = useApp();

  const [activeTab, setActiveSubTab] = useState<'saved' | 'history'>('saved');
  const [libraryFormat, setLibraryFormat] = useState<FormatType>('All');

  // Bookmarked list
  const savedResources = MOCK_RESOURCES.filter(r => bookmarkedIds.includes(r.id));
  const filteredSaved = savedResources.filter(r => 
    libraryFormat === 'All' ? true : r.format === libraryFormat
  );

  // Recently viewed list (chronological)
  const historyResources = recentlyViewedIds
    .map(id => MOCK_RESOURCES.find(r => r.id === id))
    .filter(Boolean) as typeof MOCK_RESOURCES;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Personal Library
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Access your saved collections and recently consulted knowledge items
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl self-start sm:self-auto">
          <button
            id="tab-saved-collections"
            onClick={() => setActiveSubTab('saved')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Collections ({savedResources.length})</span>
          </button>

          <button
            id="tab-recently-viewed"
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recently Viewed ({historyResources.length})</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: SAVED COLLECTIONS --- */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {/* Format Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt}
                id={`lib-format-${fmt}`}
                onClick={() => setLibraryFormat(fmt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  libraryFormat === fmt
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Items or Custom Empty State */}
          {filteredSaved.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSaved.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 max-w-lg mx-auto">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                No saved items under "{libraryFormat}"
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Save guides, research PDFs, or video clips by clicking the bookmark icon on any card.
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="mt-5 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs transition-transform hover:scale-105"
              >
                Explore Knowledge Catalog
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: RECENTLY VIEWED HISTORY --- */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Chronological history of your consultations
            </span>
            {historyResources.length > 0 && (
              <button
                onClick={clearRecentlyViewed}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear history</span>
              </button>
            )}
          </div>

          {historyResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {historyResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                No history yet
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                When you inspect clinical guides, books, or masterclasses, they will show up here for fast reference.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
