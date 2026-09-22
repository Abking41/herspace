import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  Tag,
  Flag,
  Trash2,
  Edit2,
  Search,
  Filter,
  Repeat,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskCategory, TaskPriority, TaskRecurrence } from '../../types';
import { getTodayStr, getOffsetDateStr } from '../../data/initialData';

const CATEGORIES: TaskCategory[] = ['Study', 'Personal', 'Health', 'Home', 'Work', 'Other'];

export const TaskManager: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompleted } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Study');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(getTodayStr());
  const [dueTime, setDueTime] = useState<string>('14:00');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none');
  const [notes, setNotes] = useState('');

  const todayStr = getTodayStr();

  // Progress metrics
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => !t.dueDate || t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;
  const todayCompletionRate =
    todayTasks.length > 0 ? Math.round((completedTodayTasks / todayTasks.length) * 100) : 0;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || task.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'completed'
          ? task.completed
          : !task.completed;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tasks, searchQuery, selectedCategory, selectedStatus]);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('Study');
    setPriority('medium');
    setDueDate(todayStr);
    setDueTime('14:00');
    setRecurrence('none');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate || todayStr);
    setDueTime(task.dueTime || '');
    setRecurrence(task.recurrence);
    setNotes(task.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        category,
        priority,
        dueDate,
        dueTime: dueTime || undefined,
        recurrence,
        notes: notes.trim() || undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        category,
        priority,
        dueDate,
        dueTime: dueTime || undefined,
        recurrence,
        notes: notes.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'low':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Daily Task Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Organize your day calmly. One achievable step at a time.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="py-2.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Today's Progress Card */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Today&apos;s Progress
            </span>
            <span className="text-[11px] text-stone-400">
              {completedTodayTasks} of {todayTasks.length} tasks finished
            </span>
          </div>

          {/* Ascii-style visual representation as requested */}
          <div className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200/50 dark:border-rose-900/30">
            {Array.from({ length: 10 })
              .map((_, i) => (i < Math.round(todayCompletionRate / 10) ? '█' : '░'))
              .join('')}{' '}
            {todayCompletionRate}%
          </div>
        </div>

        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden mt-1">
          <div
            className="bg-linear-to-r from-rose-500 to-rose-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${todayCompletionRate}%` }}
          />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
            />
          </div>

          <div className="flex gap-1 bg-stone-100 dark:bg-stone-850 p-1 rounded-xl self-start">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                  selectedStatus === status
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-rose-300 opacity-60" />
            <p>No tasks match your filter.</p>
            <button
              onClick={openAddModal}
              className="mt-3 text-rose-600 dark:text-rose-400 font-medium hover:underline"
            >
              Create a new task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isToday = task.dueDate === todayStr;
            const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;

            return (
              <div
                key={task.id}
                className={`group p-4 rounded-2xl border transition-all duration-200 ${
                  task.completed
                    ? 'bg-stone-50/60 dark:bg-stone-850/40 border-stone-200/60 dark:border-stone-800/40 opacity-75'
                    : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 hover:shadow-xs hover:border-rose-300 dark:hover:border-rose-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox & Content */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className="mt-0.5 text-stone-300 dark:text-stone-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
                      aria-label="Toggle task"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-rose-500 fill-rose-100 dark:fill-rose-950/60" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-medium text-xs sm:text-sm ${
                            task.completed
                              ? 'line-through text-stone-400 dark:text-stone-500'
                              : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        {/* Recurrence Badge */}
                        {task.recurrence !== 'none' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center gap-0.5">
                            <Repeat className="w-2.5 h-2.5" /> {task.recurrence}
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                          {task.notes}
                        </p>
                      )}

                      {/* Meta Tags: Category, Date, Time */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-stone-400">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                          {task.category}
                        </span>

                        {task.dueDate && (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : isToday
                                ? 'text-amber-600 dark:text-amber-400 font-medium'
                                : 'text-stone-400'
                            }`}
                          >
                            <CalendarIcon className="w-3 h-3" />
                            {isToday ? 'Today' : task.dueDate}
                          </span>
                        )}

                        {task.dueTime && (
                          <span className="flex items-center gap-1 text-stone-400">
                            <Clock className="w-3 h-3" /> {task.dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Review Psychology lecture notes..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Due Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="none">One-time (No recurrence)</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Notes / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional details, links, or sub-points..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none focus:outline-hidden focus:ring-2 focus:ring-rose-400"
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
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
