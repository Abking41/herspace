import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Pin,
  Search,
  Trash2,
  Edit2,
  FileText,
  X,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Note } from '../../types';

const NOTE_CATEGORIES = ['Personal', 'Ideas', 'Recipes', 'Books', 'Gifts', 'Other'];

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePinNote, setMoreSubView, showToast } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [isPinned, setIsPinned] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchesSearch =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCat === 'All' || n.category === selectedCat;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
  }, [notes, searchQuery, selectedCat]);

  const openNewNoteModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('Personal');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setIsPinned(note.pinned || false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: title.trim(),
        content: content.trim(),
        category: category as any,
        pinned: isPinned,
      });
      showToast('Note updated 📝', '📝');
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
        category: category as any,
        pinned: isPinned,
      });
      showToast('Note saved 📝', '📝');
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
              Notes & Ideas Scratchpad
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Quick thoughts, recipes, book wishlists, and gift inspirations.
            </p>
          </div>
        </div>

        <button
          onClick={openNewNoteModal}
          className="py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...NOTE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full p-10 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-400 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notes found.</p>
            <button
              onClick={openNewNoteModal}
              className="mt-3 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Write a quick note
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                note.pinned
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 shadow-xs'
                  : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {note.pinned && (
                      <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                    )}
                    <h3 className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                      {note.title}
                    </h3>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 shrink-0">
                    {note.category}
                  </span>
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>

              {/* Note actions footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400">
                <button
                  onClick={() => togglePinNote(note.id)}
                  className={`hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 ${
                    note.pinned ? 'text-amber-600 dark:text-amber-400 font-medium' : ''
                  }`}
                >
                  <Pin className="w-3 h-3" /> {note.pinned ? 'Unpin' : 'Pin note'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Favorite Matcha recipe, Book recommendations..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    {NOTE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="accent-amber-500 rounded-sm"
                    />
                    <span>Pin to top</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Content *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
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
                  className="flex-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-xs"
                >
                  {editingNote ? 'Save Changes' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
