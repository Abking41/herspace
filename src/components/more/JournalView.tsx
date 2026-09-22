import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Lock,
  Unlock,
  Sparkles,
  Search,
  Trash2,
  Edit2,
  Calendar,
  X,
  Bookmark,
  Heart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JournalEntry, MoodValue } from '../../types';
import { getTodayStr } from '../../data/initialData';

const GRATITUDE_PROMPTS = [
  'Three small things I am grateful for today...',
  'A quiet victory from today, even if nobody else noticed...',
  'How did I treat myself with kindness today?',
  'What made me laugh or smile today?',
  'What is something peaceful I am looking forward to?',
];

export const JournalView: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry, setMoreSubView, showToast } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(getTodayStr());
  const [mood, setMood] = useState<MoodValue>('good');
  const [tagsInput, setTagsInput] = useState('Reflections, Calm');

  // Privacy lock state
  const [isUnlocked, setIsUnlocked] = useState(true);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter(
      (j) =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [journalEntries, searchQuery]);

  const openNewEntryModal = (initialPrompt?: string) => {
    setEditingEntry(null);
    setTitle(initialPrompt ? 'Gratitude & Reflection' : '');
    setContent(initialPrompt ? `${initialPrompt}\n\n1. \n2. \n3. ` : '');
    setDate(getTodayStr());
    setMood('good');
    setTagsInput('Personal, Daily');
    setIsModalOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setDate(entry.date);
    setMood(entry.mood || 'good');
    setTagsInput(entry.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingEntry) {
      updateJournalEntry(editingEntry.id, {
        title: title.trim(),
        content: content.trim(),
        date,
        mood,
        tags,
      });
      showToast('Journal entry updated 📖', '📖');
    } else {
      addJournalEntry({
        title: title.trim(),
        content: content.trim(),
        date,
        mood,
        tags,
        pinned: false,
      });
      showToast('New memory saved to your journal 🌸', '🌸');
    }

    setIsModalOpen(false);
  };

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
              Private Journal & Diary
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              A private, tranquil sanctuary for your thoughts and reflections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsUnlocked(!isUnlocked)}
            className={`p-2.5 rounded-2xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isUnlocked
                ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                : 'bg-rose-500 text-white border-rose-600'
            }`}
          >
            {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isUnlocked ? 'Unlocked' : 'Locked'}</span>
          </button>

          <button
            onClick={() => openNewEntryModal()}
            className="py-2.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Write Entry
          </button>
        </div>
      </div>

      {/* Daily Gratitude Prompts Card */}
      <div className="rounded-3xl bg-linear-to-br from-amber-50/70 to-rose-50/50 dark:from-amber-950/20 dark:to-rose-950/20 border border-amber-200/60 dark:border-amber-900/40 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gentle Journal Inspiration
          </span>
          <span className="text-[11px] text-stone-400">Tap to start writing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GRATITUDE_PROMPTS.slice(0, 4).map((prompt, i) => (
            <button
              key={i}
              onClick={() => openNewEntryModal(prompt)}
              className="text-left p-3 rounded-2xl bg-white/80 dark:bg-stone-850/80 hover:bg-white dark:hover:bg-stone-800 border border-amber-200/50 dark:border-amber-900/30 text-xs text-stone-700 dark:text-stone-300 transition-all hover:scale-[1.01]"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
        <input
          type="text"
          placeholder="Search journal entries by title, words, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
        />
      </div>

      {/* Locked State Screen */}
      {!isUnlocked ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-500 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
            Journal is Currently Locked
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Your personal diary thoughts are kept protected and private from casual viewing.
          </p>
          <button
            onClick={() => setIsUnlocked(true)}
            className="py-2 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium"
          >
            Unlock Diary
          </button>
        </div>
      ) : (
        /* Unlocked Entries List */
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-400 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No journal entries found.</p>
              <button
                onClick={() => openNewEntryModal()}
                className="mt-3 text-rose-600 dark:text-rose-400 font-medium hover:underline"
              >
                Start your first entry
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-rose-300 dark:hover:border-rose-900/60 shadow-xs transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                      {entry.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {entry.date}
                      </span>
                      {entry.mood && (
                        <span>
                          • Mood:{' '}
                          {entry.mood === 'great'
                            ? '😊 Great'
                            : entry.mood === 'good'
                            ? '🙂 Good'
                            : entry.mood === 'okay'
                            ? '😐 Okay'
                            : '😔 Difficult'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(entry)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Edit entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {entry.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Entry Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A peaceful cup of coffee, What I learned today..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value as MoodValue)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="great">😊 Great</option>
                    <option value="good">🙂 Good</option>
                    <option value="okay">😐 Okay</option>
                    <option value="not_great">😕 Not Great</option>
                    <option value="difficult">😔 Difficult</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Thoughts & Reflections *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write freely. Your words are safe here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 leading-relaxed resize-y focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gratitude, Studies, Peace, Personal"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
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
                  {editingEntry ? 'Save Changes' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
