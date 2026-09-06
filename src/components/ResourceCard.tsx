import React from 'react';
import { Resource } from '../types';
import { useApp } from '../context/AppContext';
import { Bookmark, Star, Clock, BookOpen, Video, FileText, Sparkles, MessageCircle, Share2 } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  compact?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, compact = false }) => {
  const { openResourceDetail, openPdfReader, isBookmarked, toggleBookmark, askAiAboutResource, language } = useApp();
  const bookmarked = isBookmarked(resource.id);
  const isBn = language === 'bn';

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Videos':
      case 'Reels':
        return <Video className="w-3.5 h-3.5" />;
      case 'Books':
      case 'Guides':
        return <BookOpen className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${resource.title} - Check this on Askio: ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div
      id={`resource-card-${resource.id}`}
      onClick={() => openResourceDetail(resource)}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Banner image & format badge */}
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-medium">
            {getFormatIcon(resource.format)}
            <span>{resource.format}</span>
          </div>

          <button
            id={`bookmark-btn-${resource.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(resource.id);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-colors ${
              bookmarked
                ? 'bg-amber-500 text-white'
                : 'bg-black/60 text-white hover:bg-black/80'
            }`}
            title={bookmarked ? 'Remove Bookmark' : 'Save to Library'}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {resource.category}
            </span>
            <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{resource.rating}</span>
              <span className="text-zinc-400">({resource.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base line-clamp-2 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {resource.title}
          </h3>

          {!compact && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
              {resource.description}
            </p>
          )}

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.hashtags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Author & Action Footer */}
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
        <div className="flex items-center gap-2">
          <img
            src={resource.author.avatar}
            alt={resource.author.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <div className="truncate max-w-[120px]">
            <span className="font-medium text-zinc-800 dark:text-zinc-200 block truncate">
              {resource.author.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(resource.format === 'PDFs' || resource.format === 'Books' || resource.format === 'Guides') && (
            <button
              id={`quick-read-card-${resource.id}`}
              onClick={(e) => {
                e.stopPropagation();
                openPdfReader(resource);
              }}
              className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
              title={isBn ? 'সরাসরি পড়ুন' : 'Read Full Document'}
            >
              <BookOpen className="w-3 h-3" />
              <span>{isBn ? 'পড়ুন' : 'Read'}</span>
            </button>
          )}

          <button
            id={`ask-ai-card-${resource.id}`}
            onClick={(e) => {
              e.stopPropagation();
              askAiAboutResource(resource);
            }}
            className="p-1.5 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Ask AI about this resource"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Ask AI</span>
          </button>

          <button
            id={`share-btn-${resource.id}`}
            onClick={handleShare}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
