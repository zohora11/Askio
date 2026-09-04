import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Bookmark, 
  Share2, 
  Star, 
  Sparkles, 
  ExternalLink, 
  CheckCircle, 
  BookOpen, 
  Clock, 
  Check,
  UserCheck
} from 'lucide-react';

export const ResourceDetailModal: React.FC = () => {
  const { selectedResource, setSelectedResource, isBookmarked, toggleBookmark, askAiAboutResource } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedResource) return null;

  const bookmarked = isBookmarked(selectedResource.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedResource.title,
        text: selectedResource.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${selectedResource.title} - Askio Knowledge: ${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto cursor-pointer"
      onClick={() => setSelectedResource(null)}
    >
      <div 
        id="resource-detail-modal"
        className="relative w-full max-w-3xl my-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-detail-modal-btn"
          onClick={() => setSelectedResource(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-900">
          <img
            src={selectedResource.imageUrl}
            alt={selectedResource.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-semibold backdrop-blur-md">
              {selectedResource.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {selectedResource.format}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium">
              <div className="flex items-center gap-1 bg-amber-500/90 text-black px-2 py-0.5 rounded font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{selectedResource.rating}</span>
              </div>
              <span className="text-zinc-300">({selectedResource.reviewCount} reviews)</span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {selectedResource.durationOrPages}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
              {selectedResource.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={selectedResource.author.avatar}
                alt={selectedResource.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                    {selectedResource.author.name}
                  </h4>
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedResource.author.role}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2">
              <button
                id="modal-bookmark-btn"
                onClick={() => toggleBookmark(selectedResource.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  bookmarked
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
                <span>{bookmarked ? 'Saved in Library' : 'Save'}</span>
              </button>

              <button
                id="modal-share-btn"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied Link' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Expandable Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Overview
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
              {isExpanded
                ? selectedResource.description
                : `${selectedResource.description.slice(0, 180)}...`}
            </p>
            <button
              id="expand-description-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          </div>

          {/* Key Takeaways */}
          {selectedResource.keyTakeaways && selectedResource.keyTakeaways.length > 0 && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 sm:p-5">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Key Takeaways & Protocol
              </h4>
              <ul className="space-y-2">
                {selectedResource.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200/90 flex items-start gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Category Hashtags */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Tags & Focus Domains
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedResource.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Context-Aware AI CTA Banner */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-white">
                  Have questions about this material?
                </h4>
                <p className="text-xs text-zinc-300">
                  Askio AI will synthesize summaries, answer clinical specifics, or create study goals.
                </p>
              </div>
            </div>

            <button
              id="ask-ai-detail-btn"
              onClick={() => askAiAboutResource(selectedResource)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-md hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Ask AI about this</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
