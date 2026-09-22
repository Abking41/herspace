import React, { useState } from 'react';
import { Smile, Meh, Frown, Sparkles, Heart, Calendar, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MoodValue } from '../../types';
import { getTodayStr } from '../../data/initialData';

const MOOD_MAP: Record<MoodValue, { label: string; emoji: string; color: string }> = {
  great: { label: 'Great', emoji: '😊', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300' },
  good: { label: 'Good', emoji: '🙂', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-300' },
  okay: { label: 'Okay', emoji: '😐', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300' },
  not_great: { label: 'Not Great', emoji: '😕', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-300' },
  difficult: { label: 'Difficult Day', emoji: '😔', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-300' },
};

export const MoodTrackerView: React.FC = () => {
  const { moodEntries, setMoodForToday, todayMood, setMoreSubView, showToast } = useApp();

  const [selectedMood, setSelectedMood] = useState<MoodValue>(todayMood?.mood || 'good');
  const [note, setNote] = useState(todayMood?.note || '');
  const [tagsInput, setTagsInput] = useState(todayMood?.tags?.join(', ') || 'Calm, Focused');

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setMoodForToday(selectedMood, note.trim() || undefined, tags);
    showToast('Mood check-in saved peacefully 🌸', '🌸');
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMoreSubView(null)}
          className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Mood & Emotion Check-in
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Honor how you feel. Every emotion is valid and temporary.
          </p>
        </div>
      </div>

      {/* Log Today's Mood Form */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
          How is your heart feeling today?
        </h2>

        {/* 5 Emojis */}
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(MOOD_MAP) as MoodValue[]).map((m) => {
            const item = MOOD_MAP[m];
            const isSelected = selectedMood === m;

            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMood(m)}
                className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                  isSelected
                    ? `${item.color} border-2 scale-105 shadow-xs font-semibold`
                    : 'bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 text-stone-600 dark:text-stone-300'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSaveMood} className="space-y-4 text-xs pt-2">
          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Reflections or What&apos;s on Your Mind (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What made you smile today? Or what felt heavy? Jot it down here..."
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Feelings Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Grateful, Tired, Productive, Relaxed..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-xs transition-colors"
          >
            Save Today&apos;s Check-in
          </button>
        </form>
      </div>

      {/* Mood History Log */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
          Past Mood History
        </h3>

        {moodEntries.length === 0 ? (
          <p className="text-xs text-stone-400 py-3">No mood entries recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {moodEntries.map((entry) => {
              const info = MOOD_MAP[entry.mood];
              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 flex items-start gap-3 text-xs"
                >
                  <span className="text-2xl mt-0.5">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {info.label}
                      </span>
                      <span className="text-[11px] text-stone-400">{entry.date}</span>
                    </div>

                    {entry.note && (
                      <p className="text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                        {entry.note}
                      </p>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
