import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Target, 
  Plus, 
  Flame, 
  CheckCircle, 
  Calendar, 
  Trash2, 
  X, 
  Sparkles,
  Award
} from 'lucide-react';
import { Goal } from '../types';
import { t } from '../constants/translations';

export const GoalsScreen: React.FC = () => {
  const { goals, addGoal, incrementGoalProgress, deleteGoal, language } = useApp();
  const isBn = language === 'bn';

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Goal['category']>('Health');
  const [totalModules, setTotalModules] = useState(8);
  const [deadlineDate, setDeadlineDate] = useState('Oct 15, 2026');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      category,
      progress: 0,
      totalModules: Number(totalModules),
      completedModules: 0,
      streakDays: 1,
      deadlineDate
    });
    setTitle('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('goals.title', language)}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              {goals.length} {isBn ? 'সক্রিয়' : 'Active'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('goals.subtitle', language)}
          </p>
        </div>

        <button
          id="create-goal-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-transform hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('goals.add_goal', language)}</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {goals.map((goal) => {
          const remainingModules = goal.totalModules - goal.completedModules;
          const isFinished = goal.progress >= 100;

          return (
            <div
              key={goal.id}
              id={`goal-card-${goal.id}`}
              className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between group hover:border-zinc-400 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400">
                    {goal.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {goal.progress}%
                    </span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer"
                      title={isBn ? 'মুছে ফেলুন' : 'Delete Goal'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {goal.title}
                </h3>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isFinished
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>

                {/* Meta stats */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{goal.completedModules}/{goal.totalModules} {isBn ? 'মডিউল সম্পন্ন' : 'modules'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{goal.streakDays} {isBn ? 'দিনের স্ট্রিক' : 'day streak'}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  {isFinished 
                    ? (isBn ? 'সম্পূর্ণ অর্জিত!' : 'Milestone Achieved!') 
                    : (isBn ? `${remainingModules}টি বাকি` : `${remainingModules} modules left`)}
                </span>

                <button
                  id={`goal-step-btn-${goal.id}`}
                  onClick={() => incrementGoalProgress(goal.id)}
                  disabled={isFinished}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isFinished
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95 cursor-pointer'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isFinished ? (isBn ? 'সম্পন্ন' : 'Complete') : (isBn ? '+১ ধাপ যোগ' : '+1 Step')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Create New Learning Goal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {t('goals.new_goal_title', language)}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('goals.goal_name', language)}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isBn ? 'উদা: প্রতি ২০ মিনিটে চোখের বিরতি...' : 'e.g., Daily 20-20-20 Eye Rest Routine...'}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {isBn ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="Health">{isBn ? 'স্বাস্থ্য (Health)' : 'Health'}</option>
                    <option value="Tech">{isBn ? 'প্রযুক্তি (Tech)' : 'Tech'}</option>
                    <option value="Career">{isBn ? 'ক্যারিয়ার (Career)' : 'Career'}</option>
                    <option value="Productivity">{isBn ? 'উৎপাদনশীলতা' : 'Productivity'}</option>
                    <option value="Wellness">{isBn ? 'সুস্থতা' : 'Wellness'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {isBn ? 'মোট ধাপ / সেশন' : 'Total Target Steps'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={totalModules}
                    onChange={(e) => setTotalModules(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer"
                >
                  {t('goals.cancel', language)}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  {t('goals.save_goal', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
