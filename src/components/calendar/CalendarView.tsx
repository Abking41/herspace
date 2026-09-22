import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Bell,
  Check,
  Heart,
  Droplets,
  Pill,
  Moon,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reminder, ReminderCategory } from '../../types';
import { getTodayStr, getOffsetDateStr } from '../../data/initialData';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    subjects,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    settings,
    updateSettings,
    showToast,
  } = useApp();

  const todayStr = getTodayStr();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Reminders modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('12:00');
  const [reminderCategory, setReminderCategory] = useState<ReminderCategory>('water');
  const [reminderRepeat, setReminderRepeat] = useState<'daily' | 'weekdays' | 'once'>('daily');

  // Period / Cycle logging modal or inline toggle
  const [showCycleTracker, setShowCycleTracker] = useState(false);
  const [cycleSymptom, setCycleSymptom] = useState('');

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      // Format as YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to reach full rows (multiples of 7)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(year, month + 1, d);
        const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({
          dateStr,
          dayNum: d,
          isCurrentMonth: false,
        });
      }
    }

    return days;
  }, [currentMonthDate]);

  // Items for selected date
  const selectedDateEvents = useMemo(() => {
    const matchedTasks = tasks.filter((t) => t.dueDate === selectedDate);
    const matchedExams = subjects.filter((s) => s.examDate === selectedDate);
    return {
      tasks: matchedTasks,
      exams: matchedExams,
    };
  }, [tasks, subjects, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;

    addReminder({
      title: reminderTitle.trim(),
      date: selectedDate,
      time: reminderTime,
      category: reminderCategory,
      recurrence: reminderRepeat === 'daily' ? 'daily' : reminderRepeat === 'once' ? 'once' : 'weekly',
      repeat: reminderRepeat,
      enabled: true,
    });

    setIsReminderModalOpen(false);
    setReminderTitle('');
    showToast('Reminder saved successfully 🔔', '🔔');
  };

  // Cycle tracking helper
  const handleLogPeriodStart = () => {
    updateSettings({
      lastPeriodStartDate: selectedDate,
    });
    showToast(`Cycle start recorded for ${selectedDate} 🌸`, '🌸');
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Calendar & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track tasks, exam dates, gentle reminders, and personal rhythm.
          </p>
        </div>

        <button
          onClick={() => setIsReminderModalOpen(true)}
          className="py-2.5 px-4 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      {/* Main Calendar Card */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonthDate(now);
                setSelectedDate(todayStr);
              }}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-xs">
          {calendarDays.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            const isToday = d.dateStr === todayStr;

            // Check if day has tasks or exams
            const hasTasks = tasks.some((t) => t.dueDate === d.dateStr);
            const hasExams = subjects.some((s) => s.examDate === d.dateStr);
            const isPeriod = settings.lastPeriodStartDate === d.dateStr;

            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`min-h-[46px] sm:min-h-[56px] p-1.5 rounded-2xl flex flex-col items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white font-bold shadow-xs scale-105 z-10'
                    : isToday
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900 font-semibold'
                    : d.isCurrentMonth
                    ? 'bg-stone-50/50 dark:bg-stone-850/40 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                    : 'text-stone-300 dark:text-stone-600'
                }`}
              >
                <span className="text-xs">{d.dayNum}</span>

                {/* Event Indicator Dots */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {hasExams && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-sky-500'
                      }`}
                      title="Exam scheduled"
                    />
                  )}
                  {hasTasks && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-rose-400'
                      }`}
                      title="Task due"
                    />
                  )}
                  {isPeriod && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-pink-400'
                      }`}
                      title="Cycle day"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-rose-500" />
              Schedule for {selectedDate} {selectedDate === todayStr ? '(Today)' : ''}
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            {selectedDateEvents.tasks.length} tasks • {selectedDateEvents.exams.length} exams
          </span>
        </div>

        {/* Exams on this day */}
        {selectedDateEvents.exams.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
              Exams / Deadlines
            </span>
            {selectedDateEvents.exams.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-sky-900 dark:text-sky-100">
                    {sub.examName || sub.name}
                  </span>
                  <div className="text-[11px] text-sky-700 dark:text-sky-300">
                    Subject: {sub.name}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-sky-200/60 dark:bg-sky-800 text-sky-800 dark:text-sky-200 font-medium">
                  Exam
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tasks on this day */}
        {selectedDateEvents.tasks.length > 0 ? (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              Tasks
            </span>
            {selectedDateEvents.tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      task.completed ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'
                    }
                  >
                    {task.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {task.category}
                  </span>
                </div>
                {task.dueTime && (
                  <span className="text-[11px] text-stone-400 font-mono">{task.dueTime}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          selectedDateEvents.exams.length === 0 && (
            <p className="text-xs text-stone-400 py-3 text-center">
              No tasks or exams scheduled for this date.
            </p>
          )
        )}
      </div>

      {/* Smart Reminders Section */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center text-sm shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Daily Smart Reminders
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Gentle reminders for hydration, health, medication, and sleep.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reminders.map((rem) => {
            const getCategoryIcon = () => {
              switch (rem.category) {
                case 'water':
                  return <Droplets className="w-4 h-4 text-teal-500" />;
                case 'medication':
                  return <Pill className="w-4 h-4 text-rose-500" />;
                case 'sleep':
                  return <Moon className="w-4 h-4 text-indigo-500" />;
                case 'study':
                  return <Clock className="w-4 h-4 text-sky-500" />;
                default:
                  return <Bell className="w-4 h-4 text-purple-500" />;
              }
            };

            return (
              <div
                key={rem.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  rem.enabled
                    ? 'bg-stone-50 dark:bg-stone-850 border-stone-200/80 dark:border-stone-800'
                    : 'bg-stone-50/40 dark:bg-stone-900/40 border-stone-200/40 dark:border-stone-800/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white dark:bg-stone-800 shadow-2xs shrink-0">
                    {getCategoryIcon()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block truncate">
                      {rem.title}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                      <span className="font-mono">{rem.time}</span>
                      <span>•</span>
                      <span className="capitalize">{rem.repeat || rem.recurrence}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleReminder(rem.id)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      rem.enabled ? 'bg-purple-500' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        rem.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Cycle / Period Tracker Card */}
      <div className="rounded-3xl bg-linear-to-br from-pink-50/60 to-white dark:from-pink-950/20 dark:to-stone-900 border border-pink-200/60 dark:border-pink-900/40 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 flex items-center justify-center text-sm">
              🌸
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Cycle Rhythm & Self-Care
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                100% private. Track your natural cycle and comfort reminders.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCycleTracker(!showCycleTracker)}
            className="text-xs text-pink-600 dark:text-pink-400 hover:underline"
          >
            {showCycleTracker ? 'Hide Details' : 'View / Log'}
          </button>
        </div>

        {showCycleTracker && (
          <div className="pt-3 border-t border-pink-100 dark:border-pink-900/40 text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/80 dark:bg-stone-850/80 border border-pink-200/50 dark:border-pink-900/30">
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                  Last Recorded Period Start:
                </span>
                <span className="text-[11px] text-stone-500">
                  {settings.lastPeriodStartDate || 'None recorded yet'}
                </span>
              </div>
              <button
                onClick={handleLogPeriodStart}
                className="py-1.5 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium"
              >
                Set Selected Day ({selectedDate}) as Start
              </button>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Tracking cycle helps anticipate natural energy shifts, sleep requirements, and restful days during exam preparation.
            </p>
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                New Smart Reminder
              </h3>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon water refill, Evening stretch..."
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={reminderCategory}
                    onChange={(e) => setReminderCategory(e.target.value as ReminderCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="water">💧 Water</option>
                    <option value="medication">💊 Medication / Vitamin</option>
                    <option value="study">📚 Study Session</option>
                    <option value="sleep">🌙 Bedtime Wind-Down</option>
                    <option value="stretch">🧘 Stretch / Break</option>
                    <option value="custom">🔔 Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Repeat Schedule
                </label>
                <select
                  value={reminderRepeat}
                  onChange={(e) => setReminderRepeat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays only</option>
                  <option value="once">Once</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium shadow-xs"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
