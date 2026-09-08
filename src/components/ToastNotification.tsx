import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toastMessage, clearToast } = useApp();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isWarning = toastMessage.type === 'warning';
  const isError = toastMessage.type === 'error';

  return (
    <div 
      id="global-toast-notification"
      role="alert"
      className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[calc(100%-32px)] sm:w-auto px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
        isWarning
          ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-100 shadow-amber-500/10'
          : isSuccess
          ? 'bg-emerald-50/95 dark:bg-zinc-900/95 border-emerald-400/80 dark:border-emerald-500/60 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/15'
          : isError
          ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-700/80 text-rose-950 dark:text-rose-100 shadow-rose-500/10'
          : 'bg-white/95 dark:bg-zinc-900/95 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
      }`}
    >
      <div className="shrink-0">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        {isWarning && <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-bounce" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
        {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      </div>
      <p className="text-xs sm:text-sm font-bold flex-1 leading-snug">
        {toastMessage.text}
      </p>
      <button
        onClick={clearToast}
        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
