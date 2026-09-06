import React, { useState, useEffect } from 'react';
import { APP_LOGO_URL, APP_LOGO_FALLBACK } from '../constants/branding';

interface InitialLoadingScreenProps {
  onLoaded?: () => void;
  minDurationMs?: number;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({
  onLoaded,
  minDurationMs = 700,
}) => {
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        setIsMounted(false);
        if (onLoaded) {
          onLoaded();
        }
      }, 350);
      return () => clearTimeout(exitTimer);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onLoaded]);

  if (!isMounted) return null;

  return (
    <div
      id="app-initial-loading-screen"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-opacity duration-350 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading Askio"
    >
      <div className="flex flex-col items-center text-center px-4 max-w-xs">
        {/* App Logo */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute -inset-2 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 blur-lg animate-pulse pointer-events-none" />
          <img
            src={APP_LOGO_URL}
            onError={(e) => {
              if (e.currentTarget.src !== APP_LOGO_FALLBACK) {
                e.currentTarget.src = APP_LOGO_FALLBACK;
              }
            }}
            alt="Askio"
            className="relative h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-xs transition-transform"
            loading="eager"
          />
        </div>

        {/* App Name */}
        <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-zinc-900 dark:text-zinc-100 leading-none mb-1">
          Askio
        </h1>

        {/* Brand Subtitle */}
        <span className="text-xs sm:text-[13px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400 mb-6">
          Resource &amp; AI Hub
        </span>

        {/* Subtle Elegant Progress Indicator */}
        <div 
          id="loading-progress-track"
          className="w-36 sm:w-44 h-1 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-full overflow-hidden relative shadow-inner"
        >
          <div 
            id="loading-progress-bar"
            className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.55)] animate-askio-progress" 
          />
        </div>
      </div>
    </div>
  );
};
