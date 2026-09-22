import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Trash2,
  Sparkles,
  Heart,
  X,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import { getTodayStr, getOffsetDateStr } from '../../data/initialData';

export const HabitsView: React.FC = () => {
  const { habits, addHabit, deleteHabit, toggleHabitForDate, setMoreSubView, showToast } =
    useApp();

  const todayStr = getTodayStr();

  // Last 7 days for the weekly habit grid
  const pastWeekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = getOffsetDateStr(-6 + i);
      const dateObj = new Date(d);
      const dayLetter = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
      return { dateStr: d, dayLetter, isToday: d === todayStr };
    });
  }, [todayStr]);

  // Modal for new habit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Wellness');
  const [newEmoji, setNewEmoji] = useState('✨');

  const handleToggleHabit = (habitId: string, dateStr: string) => {
    toggleHabitForDate(habitId, dateStr);

    const habit = habits.find((h) => h.id === habitId);
    const isNowDone = !habit?.completedDates.includes(dateStr);

    if (isNowDone && dateStr === todayStr) {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
        });
      } catch (e) {}
      showToast(`Completed: ${habit?.name || habit?.title} ✨`, habit?.icon || '✨');
    }
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addHabit({
      name: newTitle.trim(),
      title: newTitle.trim(),
      category: newCategory as any,
      icon: newEmoji,
      color: '#f43f5e',
    });

    setIsModalOpen(false);
    setNewTitle('');
    showToast('New habit added gently to your routine 🌿', '🌿');
  };

  // Today completion summary
  const habitsDoneToday = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const completionRate =
    habits.length > 0 ? Math.round((habitsDoneToday / habits.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMoreSubView(null)}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Daily Habits & Self-Care
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Gentle consistency over perfection. One small act of care at a time.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {/* Overview Card */}
      <div className="rounded-3xl bg-linear-to-br from-rose-50/70 via-stone-50 to-amber-50/40 dark:from-rose-950/20 dark:via-stone-900 dark:to-stone-900 p-5 sm:p-6 border border-rose-200/60 dark:border-rose-900/40 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Today&apos;s Rhythm
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {habitsDoneToday} of {habits.length} habits completed today ({completionRate}%)
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            {completionRate === 100
              ? 'You have nurtured every single habit today. Wonderful job! 🌸'
              : 'Remember: missing a day is just a pause, never a failure. Tomorrow is a gentle new opportunity.'}
          </p>
        </div>

        <div className="w-full sm:w-48 bg-stone-200 dark:bg-stone-800 rounded-full h-3 overflow-hidden shrink-0">
          <div
            className="bg-rose-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Habits List with 7-Day Grid */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 text-xs text-stone-400 font-medium">
          <span>Habit & Streak</span>
          <div className="flex items-center gap-1 sm:gap-2">
            {pastWeekDays.map((d) => (
              <span
                key={d.dateStr}
                className={`w-7 sm:w-8 text-center text-[10px] font-bold ${
                  d.isToday ? 'text-rose-500' : 'text-stone-400'
                }`}
              >
                {d.dayLetter}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {habits.map((habit) => {
            const isDoneToday = habit.completedDates.includes(todayStr);

            return (
              <div
                key={habit.id}
                className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-stone-850/40 border border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between gap-3 text-xs"
              >
                {/* Left: Icon, Title & Streak */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl shrink-0">{habit.icon || '✨'}</span>
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block truncate">
                      {habit.name || habit.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                      <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {habit.streak || habit.completedDates.length}d streak
                      </span>
                      <span>•</span>
                      <span>{habit.category}</span>
                    </div>
                  </div>
                </div>

                {/* Right: 7-day checkboxes */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {pastWeekDays.map((d) => {
                    const isDone = habit.completedDates.includes(d.dateStr);

                    return (
                      <button
                        key={d.dateStr}
                        onClick={() => handleToggleHabit(habit.id, d.dateStr)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-rose-500 text-white shadow-2xs scale-105'
                            : d.isToday
                            ? 'border-2 border-dashed border-rose-300 dark:border-rose-800 text-stone-300 hover:border-rose-400'
                            : 'bg-stone-200/60 dark:bg-stone-800 text-transparent hover:bg-stone-300 dark:hover:bg-stone-700'
                        }`}
                        title={`${d.dateStr}: ${isDone ? 'Completed' : 'Not completed'}`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1.5 ml-1 text-stone-300 hover:text-rose-500 transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                New Daily Habit
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Habit Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening walk in fresh air, Read 15 mins..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="Wellness">Wellness</option>
                    <option value="Health">Health</option>
                    <option value="Study">Study</option>
                    <option value="Self-care">Self-care</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Icon Emoji
                  </label>
                  <select
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="🌿">🌿 Plant</option>
                    <option value="💧">💧 Water</option>
                    <option value="📖">📖 Book</option>
                    <option value="🧘">🧘 Mindfulness</option>
                    <option value="🏃‍♀️">🏃‍♀️ Exercise</option>
                    <option value="✨">✨ Sparkles</option>
                    <option value="💊">💊 Vitamin</option>
                    <option value="🌙">🌙 Sleep</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-xs"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
