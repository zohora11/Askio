import React from 'react';
import { APP_LOGO_URL, APP_LOGO_FALLBACK } from '../constants/branding';

interface AppLogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  subtitle?: string;
  subtitleClassName?: string;
  onClick?: () => void;
  id?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  imgClassName = 'h-10 sm:h-12 w-auto',
  showText = true,
  subtitle = 'Resource & AI Hub',
  subtitleClassName = 'hidden sm:inline text-xs sm:text-[13px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5',
  onClick,
  id = 'app-brand-logo'
}) => {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`flex items-center gap-3 sm:gap-3.5 bg-transparent select-none shrink-0 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Logo image with transparent background */}
      <div className="bg-transparent flex items-center justify-center shrink-0">
        <img
          src={APP_LOGO_URL}
          onError={(e) => {
            if (e.currentTarget.src !== APP_LOGO_FALLBACK) {
              e.currentTarget.src = APP_LOGO_FALLBACK;
            }
          }}
          alt="Askio"
          className={`${imgClassName} object-contain bg-transparent transition-transform duration-200 group-hover:scale-105 drop-shadow-xs`}
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col bg-transparent justify-center">
          <span className="font-black text-2xl sm:text-3xl tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
            Askio
          </span>
          {subtitle && (
            <span className={subtitleClassName}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
