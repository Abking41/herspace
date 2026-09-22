import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Droplets,
  Moon,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  ArrowRight,
  Heart,
  Plus,
  Edit2,
  Check,
  X,
  FileText,
  Calendar,
  Smile,
  Meh,
  Frown,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayStr } from '../../data/initialData';
import { MoodValue } from '../../types';

const MOTIVATIONAL_QUOTES = [
  "You don't have to carry everything at once. Just this present moment.",
  'Gentle consistency beats frantic intensity every single time.',
  'Rest is not a reward you earn; it is how your mind and spirit recharge.',
  'Be patient with yourself. Nothing in nature blooms all year round.',
  'Small steps forward still count as meaningful progress.',
  'Today is a fresh canvas. Take a deep breath and begin with kindness.',
];

export const HomeDashboard: React.FC = () => {
  const {
    settings,
    updateSettings,
    tasks,
    toggleTaskCompleted,
    subjects,
    reminders,
    todayMood,
    setMoodForToday,
    incrementWater,
    decrementWater,
    notes,
    addNote,
    setActiveTab,
    setMoreSubView,
  } = useApp();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [editingPriorities, setEditingPriorities] = useState(false);
  const [prioritiesInput, setPrioritiesInput] = useState<string[]>(
    settings.dailyPriorities || []
  );
  const [newQuickNote, setNewQuickNote] = useState('');
  const [partnerMessageIdx, setPartnerMessageIdx] = useState(0);

  // Time-based greeting
  const greetingData = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    let salutation = 'Good morning';
    let icon = '🌅';

    if (hour >= 12 && hour < 17) {
      salutation = 'Good afternoon';
      icon = '☀️';
    } else if (hour >= 17 && hour < 22) {
      salutation = 'Good evening';
      icon = '🌇';
    } else if (hour >= 22 || hour < 5) {
      salutation = 'Good night';
      icon = '🌙';
    }

    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return { salutation, icon, dayName, formattedDate };
  }, []);

  const todayStr = getTodayStr();

  // Today's tasks & completion
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => !t.dueDate || t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;
  const taskCompletionRate =
    todayTasks.length > 0 ? Math.round((completedTodayTasks / todayTasks.length) * 100) : 0;

  // Next upcoming exam
  const upcomingExams = useMemo(() => {
    return subjects
      .filter((s) => s.examDate && s.examDate >= todayStr)
      .sort((a, b) => (a.examDate! > b.examDate! ? 1 : -1));
  }, [subjects, todayStr]);

  const nearestExam = upcomingExams[0];
  const examDaysLeft = nearestExam
    ? Math.ceil(
        (new Date(nearestExam.examDate!).getTime() - new Date(todayStr).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Today's upcoming reminders
  const activeReminders = useMemo(() => {
    return reminders.filter((r) => r.enabled).slice(0, 3);
  }, [reminders]);

  // Water percentage
  const waterPct = Math.min(
    Math.round((settings.waterCurrentGlasses / settings.waterTargetGlasses) * 100),
    100
  );

  // Save priorities
  const handleSavePriorities = () => {
    const cleaned = prioritiesInput.filter((p) => p.trim().length > 0).slice(0, 3);
    updateSettings({ dailyPriorities: cleaned });
    setEditingPriorities(false);
  };

  // Add quick note
  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickNote.trim()) return;
    addNote({
      title: `Quick Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      content: newQuickNote.trim(),
      category: 'Personal',
      pinned: false,
    });
    setNewQuickNote('');
  };

  const cycleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const cyclePartnerMessage = () => {
    if (settings.partnerMessages.length > 0) {
      setPartnerMessageIdx((prev) => (prev + 1) % settings.partnerMessages.length);
    }
  };

  const currentPartnerMsg =
    settings.partnerMessages[partnerMessageIdx] || "You've got this ❤️";

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* 1. Header Greeting & Date */}
      <div className="rounded-3xl bg-linear-to-br from-rose-100/70 via-stone-100 to-amber-50/50 dark:from-rose-950/40 dark:via-stone-900 dark:to-stone-900/60 p-6 sm:p-7 border border-rose-200/50 dark:border-rose-900/40 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <span>{greetingData.dayName}</span>
              <span className="w-1 h-1 rounded-full bg-rose-400" />
              <span>{greetingData.formattedDate}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {greetingData.salutation}, {settings.userName || 'Sayani'} ❤️
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans max-w-lg">
              {settings.dailyGreetingCustom ||
                "Let's make today a little easier, one step at a time."}
            </p>
          </div>

          {/* Motivational Quote pill */}
          <div className="bg-white/80 dark:bg-stone-850/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-xs sm:max-w-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 mb-1">
              <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium">
                <Sparkles className="w-3 h-3" /> Today&apos;s Affirmation
              </span>
              <button
                onClick={cycleQuote}
                className="p-1 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                title="Next thought"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 italic leading-snug font-serif">
              &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex]}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* 2. "Today for Me" - What Matters Most Today? */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
              ⭐
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Today for Me
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                What matters most today? (Focus on up to 3 gentle priorities)
              </p>
            </div>
          </div>
          {!editingPriorities ? (
            <button
              onClick={() => {
                setPrioritiesInput(settings.dailyPriorities || []);
                setEditingPriorities(true);
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Edit priorities"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSavePriorities}
                className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200"
                title="Save priorities"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditingPriorities(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {editingPriorities ? (
          <div className="space-y-2 mt-2">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-amber-500 text-xs">⭐</span>
                <input
                  type="text"
                  placeholder={`Priority ${idx + 1}...`}
                  value={prioritiesInput[idx] || ''}
                  onChange={(e) => {
                    const copy = [...prioritiesInput];
                    copy[idx] = e.target.value;
                    setPrioritiesInput(copy);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                />
              </div>
            ))}
            <p className="text-[11px] text-stone-400 italic mt-1">
              Limiting to 3 keeps your mind calm and focused.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
            {(settings.dailyPriorities && settings.dailyPriorities.length > 0
              ? settings.dailyPriorities
              : ['Finish key study topic', 'Stay hydrated & rested', 'Take a peaceful break']
            ).map((priority, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs text-stone-800 dark:text-stone-200"
              >
                <span className="text-amber-500 shrink-0 mt-0.5">⭐</span>
                <span className="leading-snug font-medium">{priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Daily Progress & Quick Tasks Glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card (1 column) */}
        <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                Today&apos;s Progress
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {taskCompletionRate}%
              </span>
            </div>

            {/* Ascii-style visual bar representation per request + smooth bar */}
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden mb-2">
              <div
                className="bg-linear-to-r from-rose-500 to-rose-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>

            <div className="font-mono text-[11px] text-stone-500 dark:text-stone-400 text-center tracking-widest bg-stone-50 dark:bg-stone-850 py-1 rounded-lg">
              {Array.from({ length: 10 })
                .map((_, i) => (i < Math.round(taskCompletionRate / 10) ? '█' : '░'))
                .join('')}{' '}
              {taskCompletionRate}%
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-3 text-center">
              {completedTodayTasks} of {todayTasks.length} tasks completed today
            </p>
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            className="w-full mt-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 hover:text-rose-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            Manage all tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Today's Tasks list (2 columns) */}
        <div className="md:col-span-2 rounded-3xl bg-white dark:bg-stone-900 p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> Today&apos;s Focus Tasks
              </h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                + Add Task
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-6 text-center text-stone-400 text-xs">
                No tasks scheduled for today. Enjoy a quiet, peaceful moment!
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskCompleted(task.id)}
                    className={`group p-2.5 rounded-2xl border cursor-pointer flex items-center justify-between gap-3 text-xs transition-all ${
                      task.completed
                        ? 'bg-stone-50/70 dark:bg-stone-850/40 border-stone-200/50 dark:border-stone-800/40 text-stone-400 line-through'
                        : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-rose-300 dark:hover:border-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-rose-400 shrink-0" />
                      )}
                      <span className="truncate font-medium">{task.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                        {task.category}
                      </span>
                      {task.dueTime && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.dueTime}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {todayTasks.length > 4 && (
            <p className="text-[11px] text-stone-400 text-right mt-2">
              +{todayTasks.length - 4} more tasks on Tasks page
            </p>
          )}
        </div>
      </div>

      {/* 4. Study Schedule & Exam Countdown Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Next Study Focus */}
        <div className="rounded-3xl bg-linear-to-br from-sky-50/60 to-white dark:from-sky-950/20 dark:to-stone-900 p-5 border border-sky-200/60 dark:border-sky-900/40 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sky-500" /> Study Dashboard
              </span>
              <button
                onClick={() => setActiveTab('study')}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
              >
                Pomodoro & Subjects <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {nearestExam ? (
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-stone-850/80 border border-sky-200/50 dark:border-sky-900/30 mt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600 dark:text-sky-400">
                      Upcoming Exam
                    </span>
                    <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100 mt-0.5">
                      {nearestExam.examName || nearestExam.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {nearestExam.name} • {nearestExam.examDate}
                    </p>
                  </div>
                  {examDaysLeft !== null && (
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-bold text-xs shadow-2xs">
                        {examDaysLeft} days left
                      </span>
                    </div>
                  )}
                </div>

                {/* Topics progress */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                    <span>Topics Mastered</span>
                    <span>
                      {nearestExam.topics.filter((t) => t.completed).length} /{' '}
                      {nearestExam.topics.length}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-sky-500 h-1.5 rounded-full"
                      style={{
                        width: `${
                          nearestExam.topics.length > 0
                            ? (nearestExam.topics.filter((t) => t.completed).length /
                                nearestExam.topics.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-3">
                No exams on the horizon. A wonderful time for relaxed learning!
              </p>
            )}
          </div>

          <button
            onClick={() => setActiveTab('study')}
            className="w-full mt-3 py-2 rounded-xl bg-sky-100/70 dark:bg-sky-950/50 hover:bg-sky-200/80 text-sky-800 dark:text-sky-200 text-xs font-medium transition-colors"
          >
            Start Pomodoro Focus Session ⏱️
          </button>
        </div>

        {/* Water & Hydration Tracker */}
        <div className="rounded-3xl bg-linear-to-br from-teal-50/60 to-white dark:from-teal-950/20 dark:to-stone-900 p-5 border border-teal-200/60 dark:border-teal-900/40 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-teal-500" /> Hydration Check
              </span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {settings.waterCurrentGlasses} / {settings.waterTargetGlasses} glasses
              </span>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
              &ldquo;Have you had some fresh water recently?&rdquo; 🌿
            </p>

            {/* Glasses Visual */}
            <div className="flex flex-wrap items-center gap-1.5 my-3">
              {Array.from({ length: settings.waterTargetGlasses }).map((_, i) => (
                <div
                  key={i}
                  className={`w-7 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                    i < settings.waterCurrentGlasses
                      ? 'bg-teal-500 text-white shadow-xs scale-105'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 border border-dashed border-stone-300 dark:border-stone-700'
                  }`}
                  title={`Glass ${i + 1}`}
                >
                  💧
                </div>
              ))}
            </div>

            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${waterPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={decrementWater}
              disabled={settings.waterCurrentGlasses <= 0}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs hover:bg-stone-200 transition-colors disabled:opacity-40"
            >
              -1
            </button>
            <button
              onClick={incrementWater}
              className="flex-1 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium flex items-center justify-center gap-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Log 1 Glass (+250ml)
            </button>
          </div>
        </div>
      </div>

      {/* 5. Mood Quick Check-in & Sleep Reminder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mood check-in */}
        <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-rose-500" /> How are you feeling today?
            </span>
            <button
              onClick={() => {
                setActiveTab('more');
                setMoreSubView('mood');
              }}
              className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
            >
              Mood Log
            </button>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
            Check in privately with yourself. No judgment, just awareness.
          </p>

          <div className="grid grid-cols-5 gap-1.5">
            {(
              [
                { value: 'great', label: 'Great', emoji: '😊' },
                { value: 'good', label: 'Good', emoji: '🙂' },
                { value: 'okay', label: 'Okay', emoji: '😐' },
                { value: 'not_great', label: 'Not great', emoji: '😕' },
                { value: 'difficult', label: 'Difficult', emoji: '😔' },
              ] as { value: MoodValue; label: string; emoji: string }[]
            ).map((item) => {
              const isSelected = todayMood?.mood === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setMoodForToday(item.value)}
                  className={`py-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 scale-105 shadow-xs'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 border border-transparent'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[10px] text-stone-600 dark:text-stone-300 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {todayMood?.mood === 'difficult' && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              Be gentle with yourself today. It&apos;s okay to take things slow, pause, and talk with someone you trust. ❤️
            </div>
          )}
        </div>

        {/* Sleep Routine Tonight */}
        <div className="rounded-3xl bg-linear-to-br from-indigo-50/60 to-white dark:from-indigo-950/20 dark:to-stone-900 p-5 border border-indigo-200/60 dark:border-indigo-900/40 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-500" /> Sleep & Wind-Down
              </span>
              <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
                {settings.sleepBedtime} Bedtime
              </span>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
              Target bedtime at {settings.sleepBedtime}. Wake-up at {settings.sleepWakeTime}.
            </p>

            <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Wind-down reminder starts 30m prior</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Dim screen lights & warm tea recommended</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center text-[11px] text-stone-500">
            <span>Restful sleep powers healthy memory</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Peaceful night</span>
          </div>
        </div>
      </div>

      {/* 6. Upcoming Reminders glance */}
      {activeReminders.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-purple-500" /> Upcoming Reminders
            </h3>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              View calendar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activeReminders.map((rem) => (
              <div
                key={rem.id}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {rem.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800">
                    {rem.category}
                  </span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">
                    {rem.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Quick Notes Scratchpad & Optional Partner Message */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quick Note Scratchpad */}
        <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-500" /> Quick Scratchpad
              </span>
              <button
                onClick={() => {
                  setActiveTab('more');
                  setMoreSubView('notes');
                }}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                All notes
              </button>
            </div>

            <form onSubmit={handleAddQuickNote} className="space-y-2 mt-2">
              <textarea
                value={newQuickNote}
                onChange={(e) => setNewQuickNote(e.target.value)}
                placeholder="Jot down a fleeting thought, grocery item, or idea..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-400 resize-none"
              />
              <button
                type="submit"
                disabled={!newQuickNote.trim()}
                className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors disabled:opacity-40"
              >
                Save Quick Note
              </button>
            </form>
          </div>

          {notes.length > 0 && (
            <p className="text-[10px] text-stone-400 mt-2">
              Latest note: &ldquo;{notes[0].title}&rdquo;
            </p>
          )}
        </div>

        {/* 8. Optional Partner Message Feature */}
        {settings.partnerMessageEnabled && (
          <div className="rounded-3xl bg-linear-to-br from-rose-50/80 via-white to-stone-50 dark:from-rose-950/30 dark:via-stone-900 dark:to-stone-900 p-5 border border-rose-200/60 dark:border-rose-900/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> A Little Message
                </span>
                <button
                  onClick={cyclePartnerMessage}
                  className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
                  title="Next message"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <div className="py-4 px-3 rounded-2xl bg-white/70 dark:bg-stone-850/60 border border-rose-100 dark:border-rose-900/30 text-center">
                <p className="font-serif text-sm sm:text-base text-stone-800 dark:text-stone-200 italic font-medium leading-relaxed">
                  &ldquo;{currentPartnerMsg}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 mt-3">
              <span>Always cheering for you</span>
              <button
                onClick={() => {
                  setActiveTab('more');
                  setMoreSubView('settings');
                }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:underline"
              >
                Customize
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
