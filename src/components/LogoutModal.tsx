import React, { useState } from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { language } = useApp();
  const [loading, setLoading] = useState(false);
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Badge & Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isBn ? 'লগআউট নিশ্চিতকরণ' : 'Confirm Logout'}
          </h3>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            {isBn 
              ? 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?' 
              : 'Are you sure you want to log out?'}
          </p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isBn 
              ? 'লগআউট করলে বর্তমান সেশনটি বন্ধ হয়ে যাবে। পুনরায় প্রবেশ করতে আপনার ইমেইল/মোবাইল ও পাসওয়ার্ড প্রয়োজন হবে।' 
              : 'Logging out will end your current session. You will need your credentials to log in again.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="logout-cancel-btn"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            id="logout-confirm-btn"
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>{isBn ? 'হ্যাঁ, লগআউট' : 'Yes, Log Out'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
