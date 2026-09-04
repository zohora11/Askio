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

export const GoalsScreen: React.FC = () => {
  const { goals, addGoal, incrementGoalProgress, deleteGoal } = useApp();
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
              Learning Goals & Milestones
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              {goals.length} Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Build lasting habits and track module completions across Health, Tech, and Career
          </p>
        </div>

        <button
          id="create-goal-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Learning Goal</span>
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
                      className="text-zinc-400 hover:text-rose-500 p-1"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {goal.title}
                </h3>

                {/* Linear Animated Progress Indicator */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFinished
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                {/* Remaining module and streak counters */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  <span className="font-medium">
                    {isFinished ? 'All modules completed 🎉' : `${remainingModules} modules left`}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{goal.streakDays}-day streak</span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Due: {goal.deadlineDate}
                </span>

                <button
                  id={`progress-btn-${goal.id}`}
                  onClick={() => incrementGoalProgress(goal.id)}
                  disabled={isFinished}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
                    isFinished
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-zinc-900 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isFinished ? 'Completed' : 'Complete Next Module'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Create New Learning Goal
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Goal Title / Objective
                </label>
                <input
                  type="text"
                  id="goal-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 20-20-20 Vision Ergonomics Routine"
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Health">Health & Vision</option>
                  <option value="Technology">Technology & Engineering</option>
                  <option value="Career">Career & Leadership</option>
                  <option value="Productivity">Productivity & Habits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Total Modules / Checkpoints
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={totalModules}
                  onChange={(e) => setTotalModules(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Deadline
                </label>
                <input
                  type="text"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  placeholder="e.g. Nov 1, 2026"
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-create-goal-btn"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
