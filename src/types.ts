export type TabType = 'home' | 'study' | 'tasks' | 'ai-chat' | 'calendar' | 'more';
export type MoreSubView = 'habits' | 'journal' | 'notes' | 'mood' | 'shopping' | 'contacts' | 'settings' | 'study-spots' | 'research' | null;

export type TaskCategory = 'Study' | 'Personal' | 'Health' | 'Home' | 'Work' | 'Other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'custom';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  recurrence: TaskRecurrence;
  notes?: string;
}

export interface SubjectTopic {
  id: string;
  name: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  examName?: string;
  examDate?: string; // YYYY-MM-DD
  topics: SubjectTopic[];
  dailyTargetMinutes: number;
  notes?: string;
  targetHoursPerWeek?: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  type: 'pomodoro' | 'custom' | 'review';
  notes?: string;
}

export interface Flashcard {
  id: string;
  subject?: string;
  front: string;
  back: string;
  hint?: string;
  mastered?: boolean;
}

export interface MCQOption {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type ReminderCategory =
  | 'Classes'
  | 'Exams'
  | 'Assignments'
  | 'Study sessions'
  | 'Important personal tasks'
  | 'Drinking water'
  | 'Taking breaks'
  | 'Sleep'
  | 'Birthdays'
  | 'Events'
  | 'water'
  | 'medication'
  | 'sleep'
  | 'study';

export interface Reminder {
  id: string;
  title: string;
  category: ReminderCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  recurrence: 'once' | 'daily' | 'weekly' | 'custom';
  repeat?: string;
  enabled: boolean;
  notes?: string;
}

export type MoodValue = 'great' | 'good' | 'okay' | 'not_great' | 'difficult';

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodValue;
  note?: string;
  tags?: string[];
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  pinned?: boolean;
  mood?: MoodValue;
  tags?: string[];
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  title?: string;
  category: 'Study' | 'Self-Care' | 'Wellness' | 'Mindfulness' | 'Personal' | string;
  icon: string;
  color?: string;
  completedDates: string[]; // List of YYYY-MM-DD
  createdAt: string;
  targetDaysPerWeek?: number;
  streak?: number;
}

export type NoteCategory =
  | 'Study'
  | 'Ideas'
  | 'Personal'
  | 'Shopping'
  | 'Important'
  | 'Recipes'
  | 'Books'
  | 'Gifts'
  | 'Other'
  | string;

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  pinned: boolean;
  color?: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  category: 'study' | 'exam' | 'task' | 'personal' | 'reminder';
  description?: string;
  color?: string;
}

export type ShoppingCategory =
  | 'Groceries'
  | 'Personal shopping'
  | 'Things to buy'
  | 'Things to remember'
  | 'Skincare'
  | 'Study supplies'
  | 'Personal'
  | 'Clothes'
  | 'Gifts'
  | string;

export interface ShoppingItem {
  id: string;
  text: string;
  name?: string;
  category: ShoppingCategory;
  checked: boolean;
  completed?: boolean;
  quantity?: string;
  createdAt: string;
}

export interface ImportantContact {
  id: string;
  name: string;
  relation: 'Family' | 'Friends' | 'College' | 'Emergency' | 'Health' | 'Other' | string;
  phone: string;
  notes?: string;
  isEmergency?: boolean;
}

export interface UserSettings {
  userName: string;
  avatarSeed: string; // cute avatar key
  theme: 'light' | 'dark' | 'system';
  accentColor: 'rose' | 'lavender' | 'sage' | 'peach' | 'sky';
  dailyGreetingCustom?: string;
  dailyPriorities: string[]; // Up to 3 priority statements
  waterTargetGlasses: number;
  waterCurrentGlasses: number;
  waterLastUpdatedDate: string; // YYYY-MM-DD
  waterRemindersEnabled: boolean;
  breakRemindersEnabled: boolean;
  sleepBedtime: string; // e.g. "22:30"
  sleepWakeTime: string; // e.g. "07:00"
  sleepReminderEnabled: boolean;
  windDownReminderEnabled: boolean;
  pomodoroWorkMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  partnerMessageEnabled: boolean;
  partnerMessages: string[];
  hasCompletedOnboarding: boolean;
  notificationPermissionRequested: boolean;
  lastPeriodStartDate?: string;
}
