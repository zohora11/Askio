import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';

export const SubscriptionModal: React.FC = () => {
  const { isSubscriptionModalOpen, setSubscriptionModalOpen, user, upgradeToPremium } = useApp();

  if (!isSubscriptionModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={() => setSubscriptionModalOpen(false)}
    >
      <div 
        id="subscription-modal"
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-sub-modal-btn"
          onClick={() => setSubscriptionModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Crown Icon */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center justify-center mb-3 text-amber-600 dark:text-amber-400 shadow-sm">
            <Crown className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Askio Premium
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Empower your knowledge and vision health with ultra-affordable BDApps daily subscription.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent border-2 border-amber-400/40 dark:border-amber-500/30 rounded-2xl p-5 mb-6 text-center relative overflow-hidden">
          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
            BDApps Daily
          </span>
          <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            ৳2.78 <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/ day</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Billed daily via Robi (018) & Cirkle (016) direct mobile balance
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="space-y-3 mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Included Member Benefits:
          </h4>
          
          <div className="space-y-2.5">
            {[
              {
                title: 'Unlimited Askio AI Guidance Engine',
                desc: 'Uncapped context-aware queries, eye-strain diagnostics, and study summaries.'
              },
              {
                title: 'Full Resource Access & Offline PDFs',
                desc: 'Instant downloads for all 4,000+ clinical and executive research guides.'
              },
              {
                title: 'Personalized Health & Learning Recommendations',
                desc: 'Adaptive habit reminders, daily 20-20-20 notifications, and goal milestone alerts.'
              },
              {
                title: '100% Ad-Free & High-Bandwidth Streaming',
                desc: 'Zero sponsored disruptions on reels, talks, or masterclass video streams.'
              }
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 text-left">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {benefit.title}
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          id="confirm-upgrade-btn"
          onClick={upgradeToPremium}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>{user.isPremium ? 'Renew BDApps Daily (৳2.78)' : 'Activate BDApps Daily (৳2.78 / Day)'}</span>
        </button>

        <p className="text-[11px] text-zinc-400 text-center mt-3">
          Cancel anytime with 1-tap in Account Settings. No long-term commitments.
        </p>
      </div>
    </div>
  );
};
