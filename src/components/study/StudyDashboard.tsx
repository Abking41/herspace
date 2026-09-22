import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  BarChart2,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Globe,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PomodoroTimer } from './PomodoroTimer';
import { SmartStudyAssistant } from './SmartStudyAssistant';
import { LiveSearchAssistant } from './LiveSearchAssistant';
import { StudySpotsFinder } from './StudySpotsFinder';
import { Subject } from '../../types';
import { getTodayStr, getOffsetDateStr } from '../../data/initialData';

export const StudyDashboard: React.FC = () => {
  const {
    subjects,
    addSubject,
    deleteSubject,
    toggleTopicCompleted,
    addTopicToSubject,
    studySessions,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pomodoro' | 'subjects' | 'assistant' | 'research' | 'spots' | 'stats'>('pomodoro');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(
    subjects[0]?.id || null
  );

  // New Subject Modal
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('sky');
  const [newSubjTargetHours, setNewSubjTargetHours] = useState(15);
  const [newSubjExamName, setNewSubjExamName] = useState('');
  const [newSubjExamDate, setNewSubjExamDate] = useState(getOffsetDateStr(14));
  const [newSubjTopicsInput, setNewSubjTopicsInput] = useState('');

  // New topic quick input
  const [newTopicName, setNewTopicName] = useState('');
  const [addingTopicSubjectId, setAddingTopicSubjectId] = useState<string | null>(null);

  const todayStr = getTodayStr();

  // Statistics calculation
  const stats = useMemo(() => {
    const todaySessions = studySessions.filter((s) => s.date === todayStr);
    const todayMinutes = todaySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const past7Days = Array.from({ length: 7 }).map((_, i) => getOffsetDateStr(-6 + i));
    const weeklyData = past7Days.map((d) => {
      const dayMinutes = studySessions
        .filter((s) => s.date === d)
        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const dateObj = new Date(d);
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
      return { date: d, label, minutes: dayMinutes };
    });

    const weeklyTotalMinutes = weeklyData.reduce((acc, curr) => acc + curr.minutes, 0);

    return {
      todayMinutes,
      todaySessionsCount: todaySessions.length,
      weeklyTotalMinutes,
      weeklyData,
    };
  }, [studySessions, todayStr]);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    const topicList = newSubjTopicsInput
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t, idx) => ({
        id: `topic-${Date.now()}-${idx}`,
        name: t,
        completed: false,
      }));

    addSubject({
      name: newSubjName.trim(),
      color: newSubjColor,
      dailyTargetMinutes: Math.round(((Number(newSubjTargetHours) || 10) * 60) / 7),
      targetHoursPerWeek: Number(newSubjTargetHours) || 10,
      examName: newSubjExamName.trim() || undefined,
      examDate: newSubjExamDate || undefined,
      topics:
        topicList.length > 0
          ? topicList
          : [{ id: `top-${Date.now()}-1`, name: 'Introduction & Foundations', completed: false }],
    });

    setIsNewSubjectModalOpen(false);
    setNewSubjName('');
    setNewSubjTopicsInput('');
  };

  const handleAddTopic = (subjectId: string) => {
    if (!newTopicName.trim()) return;
    addTopicToSubject(subjectId, newTopicName.trim());
    setNewTopicName('');
    setAddingTopicSubjectId(null);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Study Assistant & Tracker
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Focus calmly, master your subjects, and learn without burnout.
          </p>
        </div>

        <button
          onClick={() => setIsNewSubjectModalOpen(true)}
          className="py-2.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Subject
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex p-1 rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'pomodoro', label: 'Pomodoro Timer', icon: Clock },
          { id: 'subjects', label: 'My Subjects', icon: BookOpen },
          { id: 'assistant', label: 'AI Study Assistant', icon: Sparkles },
          { id: 'research', label: 'Live Research', icon: Globe },
          { id: 'spots', label: 'Study Spots', icon: MapPin },
          { id: 'stats', label: 'Study Stats', icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 min-w-[75px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-stone-800 text-sky-600 dark:text-sky-400 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: Pomodoro Timer */}
      {activeSubTab === 'pomodoro' && (
        <div className="space-y-6">
          <PomodoroTimer />

          {/* Quick study stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500 block">Today&apos;s Focus</span>
              <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                {stats.todayMinutes}m
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500 block">Focus Sessions</span>
              <span className="text-xl font-bold text-stone-800 dark:text-stone-200">
                {stats.todaySessionsCount}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500 block">Past 7 Days</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(stats.weeklyTotalMinutes / 60)}h {stats.weeklyTotalMinutes % 60}m
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500 block">Active Subjects</span>
              <span className="text-xl font-bold text-stone-800 dark:text-stone-200">
                {subjects.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Subjects & Topic Checklists */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-4">
          {subjects.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No study subjects added yet.</p>
              <button
                onClick={() => setIsNewSubjectModalOpen(true)}
                className="mt-3 text-sky-600 dark:text-sky-400 font-medium hover:underline"
              >
                Add your first subject
              </button>
            </div>
          ) : (
            subjects.map((subj) => {
              const isExpanded = expandedSubjectId === subj.id;
              const completedTopicsCount = subj.topics.filter((t) => t.completed).length;
              const topicPercentage =
                subj.topics.length > 0
                  ? Math.round((completedTopicsCount / subj.topics.length) * 100)
                  : 0;

              const daysUntilExam = subj.examDate
                ? Math.ceil(
                    (new Date(subj.examDate).getTime() - new Date(todayStr).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

              return (
                <div
                  key={subj.id}
                  className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs"
                >
                  {/* Subject Header Bar */}
                  <div
                    onClick={() =>
                      setExpandedSubjectId(isExpanded ? null : subj.id)
                    }
                    className="p-5 cursor-pointer flex items-start sm:items-center justify-between gap-3 hover:bg-stone-50/70 dark:hover:bg-stone-850/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-sky-500 shrink-0 mt-1 sm:mt-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate">
                            {subj.name}
                          </h3>
                          {subj.examName && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-medium whitespace-nowrap">
                              {subj.examName}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                          <span>
                            {completedTopicsCount} of {subj.topics.length} topics covered (
                            {topicPercentage}%)
                          </span>
                          {subj.targetHoursPerWeek && (
                            <span>• Target: {subj.targetHoursPerWeek}h/wk</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {daysUntilExam !== null && (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                            daysUntilExam <= 7
                              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {daysUntilExam <= 0
                            ? 'Exam Today!'
                            : `${daysUntilExam}d until exam`}
                        </span>
                      )}

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-1">
                    <div
                      className="bg-sky-500 h-1 transition-all duration-300"
                      style={{ width: `${topicPercentage}%` }}
                    />
                  </div>

                  {/* Expanded Topics Checklist & Management */}
                  {isExpanded && (
                    <div className="p-5 pt-3 bg-stone-50/50 dark:bg-stone-850/30 border-t border-stone-100 dark:border-stone-800/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                          Syllabus / Topics Checklist
                        </span>
                        <button
                          onClick={() => setAddingTopicSubjectId(subj.id)}
                          className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Topic
                        </button>
                      </div>

                      {/* Add topic form inline */}
                      {addingTopicSubjectId === subj.id && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="New topic title..."
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddTopic(subj.id)}
                            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setAddingTopicSubjectId(null)}
                            className="px-2 py-1.5 text-stone-400 hover:text-stone-600 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Topics List */}
                      <div className="space-y-1.5">
                        {subj.topics.map((top) => (
                          <div
                            key={top.id}
                            onClick={() => toggleTopicCompleted(subj.id, top.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                              top.completed
                                ? 'bg-white/40 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800/50 text-stone-400 line-through'
                                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-sky-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {top.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0" />
                              )}
                              <span>{top.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Subject Footer Actions */}
                      <div className="pt-2 flex justify-between items-center text-[11px] text-stone-400">
                        <span>Subject ID: {subj.id}</span>
                        <button
                          onClick={() => deleteSubject(subj.id)}
                          className="text-stone-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Subject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 3: Smart AI Assistant */}
      {activeSubTab === 'assistant' && <SmartStudyAssistant />}

      {/* VIEW 4: Google Search Grounding Academic Research */}
      {activeSubTab === 'research' && <LiveSearchAssistant />}

      {/* VIEW 5: Google Maps Grounding Study Spots & Libraries */}
      {activeSubTab === 'spots' && <StudySpotsFinder />}

      {/* VIEW 6: Study Statistics */}
      {activeSubTab === 'stats' && (
        <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
              Study Rhythm & Habits
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Reflect on your focus consistency without self-judgment.
            </p>
          </div>

          {/* Weekly Bar Chart */}
          <div>
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-3">
              Past 7 Days Focus Minutes
            </span>
            <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200/60 dark:border-stone-800">
              {stats.weeklyData.map((d, i) => {
                const maxMins = Math.max(...stats.weeklyData.map((w) => w.minutes), 60);
                const barHeightPct = Math.min((d.minutes / maxMins) * 100, 100);

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {d.minutes > 0 ? `${d.minutes}m` : ''}
                    </span>
                    <div
                      className="w-full max-w-[28px] rounded-t-lg bg-sky-500/80 hover:bg-sky-500 transition-all"
                      style={{ height: `${Math.max(barHeightPct, 6)}%` }}
                    />
                    <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent sessions log */}
          <div>
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
              Recent Logged Sessions
            </span>
            {studySessions.length === 0 ? (
              <p className="text-xs text-stone-400 py-3">No focus sessions logged yet.</p>
            ) : (
              <div className="space-y-2">
                {studySessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {session.subjectName}
                      </span>
                      <span className="text-stone-400 ml-2">({session.type})</span>
                      {session.notes && (
                        <p className="text-[11px] text-stone-500">{session.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        +{session.durationMinutes} mins
                      </span>
                      <div className="text-[10px] text-stone-400">{session.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Subject Modal */}
      {isNewSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                New Study Subject
              </h3>
              <button
                onClick={() => setIsNewSubjectModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cognitive Psychology, Human Anatomy..."
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Exam / Target Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Midterm, Final..."
                    value={newSubjExamName}
                    onChange={(e) => setNewSubjExamName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={newSubjExamDate}
                    onChange={(e) => setNewSubjExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Initial Topics (One per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Chapter 1: Foundations&#10;Chapter 2: Core Models&#10;Chapter 3: Experimental Analysis"
                  value={newSubjTopicsInput}
                  onChange={(e) => setNewSubjTopicsInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSubjectModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
