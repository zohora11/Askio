import React from 'react';
import { APP_LOGO_URL, APP_LOGO_FALLBACK } from '../constants/branding';

interface AppLogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  subtitle?: string;
  onClick?: () => void;
  id?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  imgClassName = 'h-9 w-auto',
  showText = true,
  subtitle = 'AI Knowledge',
  onClick,
  id = 'app-brand-logo'
}) => {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`flex items-center gap-2.5 bg-transparent select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
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
          className={`${imgClassName} object-contain bg-transparent transition-transform duration-200 group-hover:scale-105`}
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col bg-transparent">
          <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            Askio
          </span>
          {subtitle && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
