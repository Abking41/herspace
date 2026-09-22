import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, CheckSquare, BookOpen, FileText, Bookmark, Bell, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    searchOpen,
    setSearchOpen,
    tasks,
    notes,
    journalEntries,
    subjects,
    reminders,
    contacts,
    setActiveTab,
    setMoreSubView,
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedTasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
    );

    const matchedNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );

    const matchedJournal = journalEntries.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.content.toLowerCase().includes(q) ||
        j.tags?.some((tag) => tag.toLowerCase().includes(q))
    );

    const matchedSubjects = subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.examName && s.examName.toLowerCase().includes(q)) ||
        s.topics.some((top) => top.name.toLowerCase().includes(q))
    );

    const matchedReminders = reminders.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q))
    );

    const matchedContacts = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.relation.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );

    return {
      tasks: matchedTasks,
      notes: matchedNotes,
      journal: matchedJournal,
      subjects: matchedSubjects,
      reminders: matchedReminders,
      contacts: matchedContacts,
      totalCount:
        matchedTasks.length +
        matchedNotes.length +
        matchedJournal.length +
        matchedSubjects.length +
        matchedReminders.length +
        matchedContacts.length,
    };
  }, [query, tasks, notes, journalEntries, subjects, reminders, contacts]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search tasks, notes, journal, study topics, reminders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-hidden text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSearchOpen(false)}
            className="text-xs px-2 py-1 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 text-sm divide-y divide-stone-100 dark:divide-stone-800/60">
          {!query.trim() && (
            <div className="py-8 text-center text-stone-400 dark:text-stone-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50 text-rose-400" />
              <p className="text-xs">Type to search through your entire daily companion</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px]">
                <span className="px-2 py-1 rounded-full bg-stone-200/50 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  Psychology
                </span>
                <span className="px-2 py-1 rounded-full bg-stone-200/50 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  Water
                </span>
                <span className="px-2 py-1 rounded-full bg-stone-200/50 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  Reflections
                </span>
                <span className="px-2 py-1 rounded-full bg-stone-200/50 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  Exams
                </span>
              </div>
            </div>
          )}

          {results && results.totalCount === 0 && (
            <div className="py-8 text-center text-stone-400 dark:text-stone-500 text-xs">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {results && results.tasks.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" /> Tasks ({results.tasks.length})
              </div>
              <div className="space-y-1.5">
                {results.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setActiveTab('tasks');
                      setSearchOpen(false);
                    }}
                    className="p-2 rounded-xl hover:bg-rose-50/60 dark:hover:bg-rose-950/30 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className={task.completed ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}>
                        {task.title}
                      </span>
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        {task.category}
                      </span>
                    </div>
                    {task.dueDate && <span className="text-[11px] text-stone-400">{task.dueDate}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.subjects.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Study Subjects ({results.subjects.length})
              </div>
              <div className="space-y-1.5">
                {results.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setActiveTab('study');
                      setSearchOpen(false);
                    }}
                    className="p-2 rounded-xl hover:bg-sky-50/60 dark:hover:bg-sky-950/30 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-stone-800 dark:text-stone-200">{sub.name}</div>
                      {sub.examName && (
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {sub.examName} ({sub.examDate})
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-sky-600 dark:text-sky-300">
                      {sub.topics.filter((t) => t.completed).length}/{sub.topics.length} topics
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.journal.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" /> Private Journal ({results.journal.length})
              </div>
              <div className="space-y-1.5">
                {results.journal.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setActiveTab('more');
                      setMoreSubView('journal');
                      setSearchOpen(false);
                    }}
                    className="p-2 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-950/30 cursor-pointer"
                  >
                    <div className="font-medium text-stone-800 dark:text-stone-200">{entry.title}</div>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.notes.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Notes ({results.notes.length})
              </div>
              <div className="space-y-1.5">
                {results.notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveTab('more');
                      setMoreSubView('notes');
                      setSearchOpen(false);
                    }}
                    className="p-2 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 cursor-pointer"
                  >
                    <div className="font-medium text-stone-800 dark:text-stone-200">{note.title}</div>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.reminders.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Reminders ({results.reminders.length})
              </div>
              <div className="space-y-1.5">
                {results.reminders.map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => {
                      setActiveTab('calendar');
                      setSearchOpen(false);
                    }}
                    className="p-2 rounded-xl hover:bg-purple-50/60 dark:hover:bg-purple-950/30 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-stone-800 dark:text-stone-200">{rem.title}</div>
                      <div className="text-[10px] text-stone-400">{rem.category}</div>
                    </div>
                    <span className="text-[11px] text-purple-600 dark:text-purple-300">{rem.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.contacts.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Important Contacts ({results.contacts.length})
              </div>
              <div className="space-y-1.5">
                {results.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setActiveTab('more');
                      setMoreSubView('contacts');
                      setSearchOpen(false);
                    }}
                    className="p-2 rounded-xl hover:bg-rose-50/60 dark:hover:bg-rose-950/30 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-stone-800 dark:text-stone-200">{contact.name}</div>
                      <div className="text-[10px] text-stone-400">{contact.relation}</div>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono">{contact.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
