import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  BookOpen, 
  Bookmark, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Printer,
  Sliders,
  Check,
  FileText
} from 'lucide-react';

export const PdfReaderModal: React.FC = () => {
  const { 
    readingResource, 
    closePdfReader, 
    goBack, 
    isBookmarked, 
    toggleBookmark, 
    askAiAboutResource,
    language 
  } = useApp();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [readingTheme, setReadingTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [copied, setCopied] = useState<boolean>(false);

  // Total pages derived from durationOrPages (or default to 12)
  const totalPages = React.useMemo(() => {
    if (!readingResource) return 12;
    const match = readingResource.durationOrPages.match(/\d+/);
    return match ? Math.max(4, parseInt(match[0], 10)) : 12;
  }, [readingResource]);

  // Reset page when resource changes
  useEffect(() => {
    setCurrentPage(1);
    setZoomLevel(100);
  }, [readingResource?.id]);

  // Keyboard navigation for page flips and Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!readingResource) return;
      if (e.key === 'Escape') {
        goBack();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage(p => Math.min(totalPages, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage(p => Math.max(1, p - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingResource, totalPages, goBack]);

  if (!readingResource) return null;

  const isBn = language === 'bn';
  const bookmarked = isBookmarked(readingResource.id);
  const progressPercent = Math.round((currentPage / totalPages) * 100);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getThemeStyles = () => {
    switch (readingTheme) {
      case 'sepia':
        return {
          wrapper: 'bg-[#fbf0d9] text-[#433422]',
          paper: 'bg-[#f4ecd8] text-[#3c2f1f] border-[#e2d5b8] shadow-lg',
          header: 'bg-[#ede1c7] text-[#3c2f1f] border-[#d8cbb0]',
          footer: 'bg-[#ede1c7] text-[#3c2f1f] border-[#d8cbb0]',
          subtext: 'text-[#725a3d]'
        };
      case 'light':
        return {
          wrapper: 'bg-zinc-100 text-zinc-900',
          paper: 'bg-white text-zinc-900 border-zinc-200 shadow-xl',
          header: 'bg-white text-zinc-900 border-zinc-200',
          footer: 'bg-white text-zinc-900 border-zinc-200',
          subtext: 'text-zinc-600'
        };
      default: // dark
        return {
          wrapper: 'bg-[#0f1117] text-zinc-100',
          paper: 'bg-[#181a20] text-zinc-100 border-zinc-800 shadow-2xl',
          header: 'bg-[#13151b] text-zinc-100 border-zinc-800',
          footer: 'bg-[#13151b] text-zinc-100 border-zinc-800',
          subtext: 'text-zinc-400'
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div 
      id="pdf-full-reader-overlay" 
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles.wrapper} animate-fade-in select-text overflow-hidden`}
    >
      {/* 1. Sticky Top Reader Navigation Bar */}
      <header className={`shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 border-b ${themeStyles.header} flex items-center justify-between gap-2 sm:gap-4 shadow-sm z-30`}>
        {/* Left: Resource Title & Category */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider shrink-0">
                {readingResource.format}
              </span>
              <h1 className="text-xs sm:text-sm font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {readingResource.title}
              </h1>
            </div>
            <p className={`text-[11px] ${themeStyles.subtext} truncate hidden sm:block`}>
              {readingResource.author.name} • {readingResource.category}
            </p>
          </div>
        </div>

        {/* Center/Right: Reader Controls (Theme, Font, Zoom, Bookmark, Close) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Page Counter Quick Badge */}
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-black/10 dark:bg-white/10">
            <span>{isBn ? 'পৃষ্ঠা' : 'Page'}</span>
            <span className="font-bold text-emerald-500">{currentPage}</span>
            <span>/</span>
            <span>{totalPages}</span>
            <span className="text-[10px] text-zinc-400 ml-1">({progressPercent}%)</span>
          </div>

          {/* Theme Selector (Dark / Sepia / Light) */}
          <div className="flex items-center bg-black/10 dark:bg-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => setReadingTheme('dark')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${readingTheme === 'dark' ? 'bg-zinc-800 text-white shadow-xs' : 'opacity-60 hover:opacity-100'}`}
              title="Dark Night Mode"
            >
              Dark
            </button>
            <button
              onClick={() => setReadingTheme('sepia')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${readingTheme === 'sepia' ? 'bg-[#ebd8b4] text-[#433422] shadow-xs' : 'opacity-60 hover:opacity-100'}`}
              title="Eye-Comfort Sepia"
            >
              Sepia
            </button>
            <button
              onClick={() => setReadingTheme('light')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${readingTheme === 'light' ? 'bg-white text-zinc-900 shadow-xs' : 'opacity-60 hover:opacity-100'}`}
              title="Paper Light"
            >
              Light
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="hidden sm:flex items-center bg-black/10 dark:bg-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${fontSize === 'normal' ? 'bg-emerald-500 text-zinc-950 shadow-xs' : 'opacity-60'}`}
              title="Standard Font"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${fontSize === 'large' ? 'bg-emerald-500 text-zinc-950 shadow-xs' : 'opacity-60'}`}
              title="Large Font"
            >
              A+
            </button>
          </div>

          {/* Zoom In / Zoom Out */}
          <div className="hidden lg:flex items-center bg-black/10 dark:bg-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => setZoomLevel(z => Math.max(80, z - 10))}
              className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(140, z + 10))}
              className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save / Bookmark Button */}
          <button
            onClick={() => toggleBookmark(readingResource.id)}
            className={`p-2 rounded-xl transition-all cursor-pointer border ${bookmarked ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'bg-black/10 dark:bg-white/10 border-transparent hover:bg-black/20'}`}
            title={bookmarked ? 'Saved to Library' : 'Save Bookmark'}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 transition-all cursor-pointer"
            title="Share Document"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Close Button (Also triggers goBack) */}
          <button
            id="pdf-reader-close-btn"
            onClick={goBack}
            className="p-2 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-all cursor-pointer ml-1"
            title={isBn ? 'বন্ধ করুন ও ফিরে যান' : 'Close Reader'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Document Reading Canvas */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-8 flex justify-center">
        <div 
          className={`w-full max-w-3xl rounded-3xl p-6 sm:p-12 border ${themeStyles.paper} transition-all origin-top duration-200`}
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {/* Document Top Header Metadata */}
          <div className="flex items-center justify-between border-b pb-4 mb-6 opacity-75 border-current text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span className="font-bold uppercase tracking-wider">{readingResource.format} DOCUMENT</span>
            </div>
            <div className="font-mono text-[11px]">
              {isBn ? `পৃষ্ঠা ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </div>
          </div>

          {/* Interactive Document Page Content based on currentPage */}
          {currentPage === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Document Cover Card */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] max-h-64 sm:max-h-80 w-full mb-6 shadow-md">
                <img 
                  src={readingResource.imageUrl} 
                  alt={readingResource.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-zinc-950 font-black text-xs w-fit mb-2">
                    {readingResource.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black">{readingResource.title}</h2>
                </div>
              </div>

              {/* Author & Publication Info */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
                <img 
                  src={readingResource.author.avatar} 
                  alt={readingResource.author.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{readingResource.author.name}</h3>
                  <p className="text-xs opacity-75">{readingResource.author.role}</p>
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="text-base sm:text-lg font-black mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  {isBn ? 'মূল সারসংক্ষেপ ও ভূমিকা' : 'Executive Overview & Synopsis'}
                </h4>
                <p className={`leading-relaxed opacity-90 ${fontSize === 'xl' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                  {readingResource.description}
                </p>
              </div>

              {/* Verified Clinical / Academic Stamp */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  {isBn 
                    ? 'এই ডকুমেন্টটি Askio AI নলেজ ইঞ্জিন ও মেডিকেল/একাডেমিক রিভিউর মাধ্যমে যাচাইকৃত এবং অফলাইন পড়ার জন্য উপযুক্ত।' 
                    : 'This document is peer-reviewed by the Askio Knowledge Board and optimized for offline learning and eye-safe reading.'}
                </span>
              </div>
            </div>
          )}

          {currentPage === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-black border-b pb-3 border-current/20">
                {isBn ? 'অধ্যায় ১: মূল টেকঅ্যাওয়ে ও নির্দেশিকা' : 'Chapter 1: Key Takeaways & Core Protocols'}
              </h3>
              
              <div className="space-y-3">
                {(readingResource.keyTakeaways || [
                  'Understanding the physiological and cognitive factors involved in deep focus and eye strain reduction.',
                  'Implementing the proven 20-20-20 rule during prolonged digital screen work to relieve ciliary muscle fatigue.',
                  'Structuring daily routines to balance high-intensity problem solving with active visual rest cycles.',
                  'Key nutrition, ambient lighting, and display color temperature adjustments for peak wellness.'
                ]).map((takeaway, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-current/10">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className={`leading-relaxed ${fontSize === 'xl' ? 'text-base' : 'text-xs sm:text-sm'}`}>
                      {takeaway}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl border border-current/15 bg-black/5 dark:bg-white/5">
                <h4 className="font-bold text-sm mb-2 text-emerald-500">
                  {isBn ? 'বাস্তবায়ন নোট (Actionable Protocol)' : 'Clinical / Practical Action Protocol'}
                </h4>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  {isBn 
                    ? 'প্রতিটি সেশনের পর ৫ মিনিট গভীর শ্বাস-প্রশ্বাস এবং চোখের পেশীর শিথিলকরণ অনুশীলন করুন। মোবাইল স্ক্রিন চোখের থেকে অন্তত ১৬ ইঞ্চি দূরে রাখুন।' 
                    : 'Ensure your display is positioned approximately 20 to 24 inches from your eyes, slightly below eye level. Maintain ambient room illumination to eliminate harsh screen glare.'}
                </p>
              </div>
            </div>
          )}

          {currentPage > 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-black border-b pb-3 border-current/20">
                {isBn ? `অধ্যায় ${currentPage - 1}: বিস্তারিত বিশ্লেষণ ও রিসোর্স গাইড` : `Chapter ${currentPage - 1}: Comprehensive Analysis & Guidelines`}
              </h3>

              <div className={`space-y-4 leading-relaxed opacity-90 ${fontSize === 'xl' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                <p>
                  {isBn 
                    ? `এই অধ্যায়ে ${readingResource.title}-এর আধুনিক গবেষণা ও প্রয়োগপদ্ধতি বিশ্লেষণ করা হয়েছে। টেকসই অভ্যাসের জন্য ধাপে ধাপে অনুশীলন অত্যন্ত কার্যকর প্রমাণিত হয়েছে।` 
                    : `In this section of ${readingResource.title}, we explore systemic implementations, empirical insights, and practical strategies designed to elevate performance without compromising physical well-being.`}
                </p>

                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 my-4">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-500 mb-1">
                    {isBn ? 'গবেষণামূলক পর্যবেক্ষণ' : 'Key Research Insight'}
                  </h5>
                  <p className="text-xs sm:text-sm italic">
                    {isBn 
                      ? '“ধারাবাহিক ও সুশৃঙ্খল অভ্যাস গঠন যেকোনো লক্ষ্য অর্জনের মূল ভিত্তি। ছোট ছোট নিয়মিত পদক্ষেপ দীর্ঘমেয়াদে বড় পরিবর্তন এনে দেয়।”' 
                      : '"Micro-habits compound over time. Regular visual pauses and deliberate cognitive recharge intervals dramatically enhance both retention and productivity."'}
                  </p>
                </div>

                <p>
                  {isBn 
                    ? 'আপনার দৈনন্দিন রুটিনে এই নিয়মগুলো যুক্ত করতে Askio AI-এর সাথে আলোচনা করতে পারেন বা গোলস স্ক্রিনে নতুন লক্ষ্য হিসেবে যোগ করতে পারেন।' 
                    : 'You can converse directly with Askio AI regarding any questions derived from this section, or seamlessly add these milestones to your Goals tracker.'}
                </p>
              </div>

              {/* Ask AI CTA Box */}
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/15 flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">
                    {isBn ? 'এই অধ্যায় সম্পর্কে কোনো প্রশ্ন আছে?' : 'Have questions regarding this chapter?'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    askAiAboutResource(readingResource);
                    goBack();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm w-full sm:w-auto text-center"
                >
                  {isBn ? 'Askio AI-কে জিজ্ঞাসা করুন' : 'Ask Askio AI'}
                </button>
              </div>
            </div>
          )}

          {/* Page Footer inside Document */}
          <div className="border-t pt-4 mt-8 flex items-center justify-between text-[11px] opacity-60">
            <span>Askio Digital Library • {readingResource.category}</span>
            <span>{isBn ? `পৃষ্ঠা ${currentPage}` : `Page ${currentPage}`}</span>
          </div>
        </div>
      </main>

      {/* 3. Sticky Bottom Navigation Bar with Page Controls */}
      <footer className={`shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 border-t ${themeStyles.footer} flex items-center justify-between gap-2 sm:gap-4 shadow-md z-30`}>
        {/* Center: Pagination Buttons */}
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <button
            id="pdf-reader-prev-page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{isBn ? 'পূর্ববর্তী' : 'Prev'}</span>
          </button>

          <span className="text-xs font-mono font-bold px-2">
            {currentPage} / {totalPages}
          </span>

          <button
            id="pdf-reader-next-page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-zinc-950 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <span className="hidden sm:inline">{isBn ? 'পরবর্তী' : 'Next'}</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Right: Quick Progress Indicator */}
        <div className="text-[11px] font-medium opacity-75 hidden sm:block">
          {progressPercent}% {isBn ? 'পড়া হয়েছে' : 'completed'}
        </div>
      </footer>
    </div>
  );
};
