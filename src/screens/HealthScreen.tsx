import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HeartPulse, 
  AlertTriangle, 
  PhoneCall, 
  ShieldCheck, 
  Activity, 
  Apple, 
  Dumbbell, 
  Smile, 
  Eye, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Database,
  Wifi,
  Sparkles
} from 'lucide-react';
import { WELLNESS_TIPS, MOCK_RESOURCES } from '../data/mockData';
import { ResourceCard } from '../components/ResourceCard';
import { WellnessTip } from '../types';

export const HealthScreen: React.FC = () => {
  const { sendChatMessage, setActiveTab } = useApp();
  const [selectedTip, setSelectedTip] = useState<WellnessTip | null>(null);

  const healthResources = MOCK_RESOURCES.filter(r => r.category === 'Health');

  const handleStartTipAi = (tip: WellnessTip) => {
    setSelectedTip(null);
    setActiveTab('ai');
    sendChatMessage(`Can you guide me on implementing "${tip.title}"? Please give me an interactive countdown or scheduled routine.`);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header & Simulated Live Firestore Status Stream */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-emerald-600" />
            <span>Health & Wellness Portal</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Clinical vision guidelines, evidence-based wellness routines, and emergency assistance
          </p>
        </div>

        {/* Live Firestore Stream Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Database className="w-3.5 h-3.5" />
          <span>Live Firestore Stream Active</span>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div 
        id="medical-disclaimer-banner"
        className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex items-start gap-3.5 text-amber-900 dark:text-amber-200 shadow-xs"
      >
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong className="font-bold block mb-0.5">Medical & Clinical Educational Disclaimer</strong>
          The content, routines, and AI guidance provided on Askio are curated strictly for educational and self-care reference. They do not constitute formal medical diagnosis or replace professional consultation with a licensed ophthalmologist or physician.
        </div>
      </div>

      {/* Emergency Hotline Card ("Need Help Now?") */}
      <div 
        id="emergency-hotline-card"
        className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <PhoneCall className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-0.5 rounded-full bg-black/20 text-white text-[10px] font-extrabold uppercase tracking-wide">
              Emergency Assistance
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              Need Help Now? Emergency Medical Hotlines
            </h3>
            <p className="text-xs text-rose-100 mt-1 max-w-xl">
              If you are experiencing acute ocular pain, sudden vision loss, severe trauma, or psychological distress, contact emergency responders immediately.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href="tel:999"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white text-rose-700 font-black text-xs hover:bg-rose-50 transition-colors text-center flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>National: 999</span>
          </a>
          <a
            href="tel:16263"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <span>Health Desk: 16263</span>
          </a>
          <a
            href="tel:988"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <span>Crisis Lifeline: 988</span>
          </a>
        </div>
      </div>

      {/* Topic Exploration Cards (Heart Health, Nutrition, Fitness, Mental Health) */}
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Topic Exploration Hub
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { title: 'Heart Health', icon: HeartPulse, color: 'rose', count: '1,800+ articles' },
            { title: 'Nutrition & Diet', icon: Apple, color: 'emerald', count: '2,400+ guides' },
            { title: 'Fitness & Mobility', icon: Dumbbell, color: 'blue', count: '1,950+ videos' },
            { title: 'Mental Health', icon: Smile, color: 'purple', count: '3,100+ protocols' }
          ].map((topic, i) => {
            const Icon = topic.icon;
            return (
              <div
                key={i}
                onClick={() => {
                  setActiveTab('search');
                }}
                className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {topic.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {topic.count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Wellness Tips: All 10 Curated Wellness Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Curated Daily Wellness Protocols (10 Core Habits)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Evidence-based micro-practices designed to counter digital desk fatigue
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WELLNESS_TIPS.map((tip) => (
            <div
              key={tip.id}
              id={`wellness-tip-card-${tip.id}`}
              onClick={() => setSelectedTip(tip)}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {tip.tag}
                  </span>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {tip.durationMinutes} min
                  </span>
                </div>

                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                  {tip.title}
                </h4>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                  {tip.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>View Full Protocol</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Resources Stream */}
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Clinical Vision & Occupational Health Guides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {healthResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </div>

      {/* Wellness Tip Detail Modal */}
      {selectedTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            id="wellness-detail-modal"
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {selectedTip.tag} • {selectedTip.durationMinutes} min protocol
              </span>
              <button
                onClick={() => setSelectedTip(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {selectedTip.title}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-3">
              {selectedTip.subtitle}
            </p>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-5">
              {selectedTip.description}
            </p>

            <div className="space-y-2.5 mb-6">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Actionable Execution Steps:
              </h5>
              {selectedTip.actionableSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedTip(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleStartTipAi(selectedTip)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Exercise with AI Guidance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
