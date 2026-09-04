import React, { useState } from 'react';
import { AlertTriangle, X, Loader2, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface UnsubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileNumber: string;
  onConfirmUnsubscribe: () => Promise<boolean>;
}

export const UnsubscribeModal: React.FC<UnsubscribeModalProps> = ({
  isOpen,
  onClose,
  mobileNumber,
  onConfirmUnsubscribe,
}) => {
  const { language } = useApp();
  const isBn = language === 'bn';

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const success = await onConfirmUnsubscribe();
      if (!success) {
        setErrorMessage(
          isBn
            ? 'সাবস্ক্রিপশন বাতিল করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Unable to cancel the subscription. Please try again or contact support.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (isBn
            ? 'সাবস্ক্রিপশন বাতিল করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
            : 'Unable to cancel the subscription. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => !loading && onClose()}
    >
      <div 
        id="unsubscribe-modal"
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 p-6 sm:p-7 shadow-2xl transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!loading && (
          <button
            id="close-unsub-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-center mb-3 text-rose-600 dark:text-rose-400 shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {isBn ? 'সাবস্ক্রিপশন বাতিল করবেন?' : 'Cancel Subscription?'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
            {isBn 
              ? 'তুমি কি সত্যিই Askio থেকে আনসাবস্ক্রাইব করতে চাও?' 
              : 'Are you sure you want to unsubscribe from Askio Premium?'}
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4 mb-5 text-xs text-zinc-600 dark:text-zinc-300 space-y-2 border border-zinc-200/80 dark:border-zinc-700/80">
          <div className="font-semibold text-zinc-800 dark:text-zinc-200">
            {isBn ? 'আনসাবস্ক্রাইব করার নম্বর:' : 'Account to unsubscribe:'}{' '}
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{mobileNumber}</span>
          </div>
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            {isBn 
              ? 'BDApps দৈনিক সাবস্ক্রিপশন (৳২.৭৮/দিন) বাতিল করলে:' 
              : 'By canceling your BDApps daily subscription (৳2.78/day):'}
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500 dark:text-zinc-400 pl-1">
            <li>{isBn ? 'আস্কিও এআই অ্যাসিস্ট্যান্টের আনলিমিটেড এক্সেস বন্ধ হবে' : 'Unlimited Askio AI Guidance will be locked'}</li>
            <li>{isBn ? '৪,০০০+ লার্নিং গাইড ও পিডিএফ এক্সেস সীমিত হবে' : 'Full access to 4,000+ learning guides will be restricted'}</li>
            <li>{isBn ? 'আপনার মোবাইল ব্যালেন্স থেকে প্রতিদিন ৳২.৭৮ কাটা বন্ধ হবে' : 'No daily charge of ৳2.78/day will be deducted from your balance'}</li>
          </ul>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="cancel-unsub-action-btn"
            disabled={loading}
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isBn ? 'না, সাবস্ক্রিপশন রাখুন' : 'Keep Subscription'}
          </button>

          <button
            id="confirm-unsub-action-btn"
            disabled={loading}
            onClick={handleConfirm}
            className="w-full sm:w-1/2 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isBn ? 'বাতিল করা হচ্ছে...' : 'Cancelling...'}</span>
              </>
            ) : (
              <span>{isBn ? 'হ্যাঁ, আনসাবস্ক্রাইব করুন' : 'Confirm Unsubscribe'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
