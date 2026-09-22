import {
  Task,
  Subject,
  StudySession,
  Reminder,
  MoodEntry,
  JournalEntry,
  Habit,
  Note,
  ShoppingItem,
  ImportantContact,
  UserSettings,
} from '../types';

export const getTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOffsetDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const initialSettings: UserSettings = {
  userName: 'Sayani',
  avatarSeed: '🌸',
  theme: 'light',
  accentColor: 'rose',
  dailyGreetingCustom: "Let's make today a little easier, one step at a time.",
  dailyPriorities: [
    'Review Psychology Chapter 4 summary',
    'Drink 2L fresh water & stretch',
    'Sleep by 10:45 PM for tomorrow morning',
  ],
  waterTargetGlasses: 8,
  waterCurrentGlasses: 4,
  waterLastUpdatedDate: getTodayStr(),
  waterRemindersEnabled: true,
  breakRemindersEnabled: true,
  sleepBedtime: '22:45',
  sleepWakeTime: '07:15',
  sleepReminderEnabled: true,
  windDownReminderEnabled: true,
  pomodoroWorkMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  partnerMessageEnabled: true,
  partnerMessages: [
    "You've got this ❤️",
    'Take your time. One thing at a time.',
    "You don't have to be perfect today.",
    'So proud of how consistently you try.',
    'Remember to pause, breathe, and drink some water.',
  ],
  hasCompletedOnboarding: true,
  notificationPermissionRequested: false,
};

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Review Cognitive Psychology Chapter 4 slides',
    category: 'Study',
    priority: 'high',
    dueDate: getTodayStr(),
    dueTime: '11:00',
    completed: true,
    completedAt: `${getTodayStr()}T10:30:00`,
    recurrence: 'none',
    notes: 'Focus on working memory models and Baddeley model diagram.',
  },
  {
    id: 'task-2',
    title: 'Submit Organic Chemistry Lab report pre-lab questions',
    category: 'Study',
    priority: 'high',
    dueDate: getTodayStr(),
    dueTime: '15:30',
    completed: false,
    recurrence: 'none',
    notes: 'Upload PDF to university portal before 4 PM.',
  },
  {
    id: 'task-3',
    title: 'Hydrate & 15-minute afternoon sunshine walk',
    category: 'Health',
    priority: 'medium',
    dueDate: getTodayStr(),
    dueTime: '16:00',
    completed: false,
    recurrence: 'daily',
    notes: 'No screen time during walk; listen to calm playlist.',
  },
  {
    id: 'task-4',
    title: 'Pick up herbal tea and oats from market',
    category: 'Personal',
    priority: 'low',
    dueDate: getTodayStr(),
    dueTime: '18:00',
    completed: false,
    recurrence: 'none',
  },
  {
    id: 'task-5',
    title: 'Tidy desk & prepare tomorrow morning outfit',
    category: 'Home',
    priority: 'low',
    dueDate: getTodayStr(),
    dueTime: '21:30',
    completed: false,
    recurrence: 'daily',
  },
  {
    id: 'task-6',
    title: 'Read 15 pages of novel before wind-down',
    category: 'Personal',
    priority: 'low',
    dueDate: getOffsetDateStr(1),
    dueTime: '22:00',
    completed: false,
    recurrence: 'daily',
  },
];

export const initialSubjects: Subject[] = [
  {
    id: 'subj-1',
    name: 'Cognitive Psychology',
    color: '#e11d48', // rose
    icon: 'Brain',
    examName: 'Midterm Exam: Cognition & Memory',
    examDate: getOffsetDateStr(12),
    dailyTargetMinutes: 60,
    topics: [
      { id: 't-1', name: 'Information Processing Framework', completed: true },
      { id: 't-2', name: 'Sensory Memory & Selective Attention', completed: true },
      { id: 't-3', name: 'Working Memory (Baddeley Model)', completed: true },
      { id: 't-4', name: 'Long-term Encoding & Consolidation', completed: false },
      { id: 't-5', name: 'Retrieval Cues & Forgetting Curves', completed: false },
      { id: 't-6', name: 'Schema Theory & False Memories', completed: false },
    ],
    notes: 'Key textbook: Goldstein 5th Ed. Professor emphasizes Baddeley model and experimental design.',
  },
  {
    id: 'subj-2',
    name: 'Organic Chemistry II',
    color: '#0284c7', // sky
    icon: 'FlaskConical',
    examName: 'Module Test: Carbonyls & Amines',
    examDate: getOffsetDateStr(19),
    dailyTargetMinutes: 45,
    topics: [
      { id: 'oc-1', name: 'Aldehydes & Ketones Nucleophilic Addition', completed: true },
      { id: 'oc-2', name: 'Carboxylic Acid Derivatives Mechanisms', completed: true },
      { id: 'oc-3', name: 'Enolates & Aldol Condensation', completed: false },
      { id: 'oc-4', name: 'Amine Synthesis & Reactions', completed: false },
      { id: 'oc-5', name: 'Spectroscopy Practice Problems', completed: false },
    ],
    notes: 'Practice drawing curved arrows every single day. Keep flashcards for common reagents.',
  },
  {
    id: 'subj-3',
    name: 'Statistics for Research',
    color: '#059669', // emerald / sage
    icon: 'BarChart2',
    examName: 'Final Project Data Analysis',
    examDate: getOffsetDateStr(26),
    dailyTargetMinutes: 30,
    topics: [
      { id: 'st-1', name: 'Hypothesis Testing & Type I/II Errors', completed: true },
      { id: 'st-2', name: 'Two-Sample t-Tests & Assumptions', completed: true },
      { id: 'st-3', name: 'One-way & Two-way ANOVA', completed: true },
      { id: 'st-4', name: 'Multiple Linear Regression Interpretation', completed: false },
      { id: 'st-5', name: 'R-Studio scripts & output formatting', completed: false },
    ],
    notes: 'Remember p-value cutoff 0.05 and always verify normality plots.',
  },
];

export const initialStudySessions: StudySession[] = [
  {
    id: 'session-1',
    subjectId: 'subj-1',
    subjectName: 'Cognitive Psychology',
    durationMinutes: 25,
    date: getTodayStr(),
    type: 'pomodoro',
    notes: 'Covered working memory components cleanly.',
  },
  {
    id: 'session-2',
    subjectId: 'subj-1',
    subjectName: 'Cognitive Psychology',
    durationMinutes: 25,
    date: getTodayStr(),
    type: 'pomodoro',
    notes: 'Completed practice active recall diagrams.',
  },
  {
    id: 'session-3',
    subjectId: 'subj-2',
    subjectName: 'Organic Chemistry II',
    durationMinutes: 30,
    date: getOffsetDateStr(-1),
    type: 'custom',
    notes: 'Carbonyl mechanisms practice sheet.',
  },
  {
    id: 'session-4',
    subjectId: 'subj-3',
    subjectName: 'Statistics for Research',
    durationMinutes: 50,
    date: getOffsetDateStr(-2),
    type: 'pomodoro',
    notes: 'ANOVA lab practice in R.',
  },
  {
    id: 'session-5',
    subjectId: 'subj-1',
    subjectName: 'Cognitive Psychology',
    durationMinutes: 45,
    date: getOffsetDateStr(-3),
    type: 'pomodoro',
    notes: 'Selective attention theories review.',
  },
];

export const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Cognitive Psychology Lecture (Hall B)',
    category: 'Classes',
    date: getTodayStr(),
    time: '13:00',
    recurrence: 'weekly',
    enabled: true,
    notes: 'Bring printed lecture slides and notebook.',
  },
  {
    id: 'rem-2',
    title: 'Hydration check: drink a glass of water',
    category: 'Drinking water',
    date: getTodayStr(),
    time: '14:30',
    recurrence: 'daily',
    enabled: true,
    notes: 'Stay refreshed and hydrated.',
  },
  {
    id: 'rem-3',
    title: 'Organic Chemistry Pre-Lab submission deadline',
    category: 'Assignments',
    date: getTodayStr(),
    time: '16:00',
    recurrence: 'once',
    enabled: true,
  },
  {
    id: 'rem-4',
    title: 'Evening Wind-down & dim screens',
    category: 'Sleep',
    date: getTodayStr(),
    time: '22:15',
    recurrence: 'daily',
    enabled: true,
    notes: 'Time to relax, brew chamomile tea, and unwind.',
  },
  {
    id: 'rem-5',
    title: "Best friend Emma's Birthday dinner",
    category: 'Birthdays',
    date: getOffsetDateStr(5),
    time: '19:00',
    recurrence: 'once',
    enabled: true,
    notes: 'Gift is already ordered and wrapped.',
  },
];

export const initialHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Dedicated Study Focus (45m+)',
    category: 'Study',
    icon: 'BookOpen',
    color: '#f43f5e',
    completedDates: [
      getOffsetDateStr(-4),
      getOffsetDateStr(-3),
      getOffsetDateStr(-2),
      getOffsetDateStr(-1),
      getTodayStr(),
    ],
    createdAt: getOffsetDateStr(-20),
  },
  {
    id: 'habit-2',
    name: 'Morning Hydration (500ml water)',
    category: 'Wellness',
    icon: 'Droplets',
    color: '#06b6d4',
    completedDates: [
      getOffsetDateStr(-5),
      getOffsetDateStr(-4),
      getOffsetDateStr(-3),
      getOffsetDateStr(-2),
      getOffsetDateStr(-1),
      getTodayStr(),
    ],
    createdAt: getOffsetDateStr(-20),
  },
  {
    id: 'habit-3',
    name: 'Evening Wind-down Routine',
    category: 'Self-Care',
    icon: 'Moon',
    color: '#8b5cf6',
    completedDates: [
      getOffsetDateStr(-4),
      getOffsetDateStr(-3),
      getOffsetDateStr(-2),
      getOffsetDateStr(-1),
    ],
    createdAt: getOffsetDateStr(-20),
  },
  {
    id: 'habit-4',
    name: '15-min Gentle Movement / Stretch',
    category: 'Wellness',
    icon: 'Sparkles',
    color: '#10b981',
    completedDates: [
      getOffsetDateStr(-3),
      getOffsetDateStr(-2),
      getOffsetDateStr(-1),
      getTodayStr(),
    ],
    createdAt: getOffsetDateStr(-20),
  },
  {
    id: 'habit-5',
    name: 'Quiet Reading (15+ pages)',
    category: 'Mindfulness',
    icon: 'Feather',
    color: '#f59e0b',
    completedDates: [
      getOffsetDateStr(-2),
      getOffsetDateStr(-1),
    ],
    createdAt: getOffsetDateStr(-20),
  },
];

export const initialMoodEntries: MoodEntry[] = [
  {
    id: 'mood-today',
    date: getTodayStr(),
    mood: 'good',
    note: 'Woke up feeling refreshed, finished chapter 4 notes smoothly.',
    tags: ['Productive', 'Calm', 'Sunny'],
    createdAt: `${getTodayStr()}T09:15:00`,
  },
  {
    id: 'mood-1',
    date: getOffsetDateStr(-1),
    mood: 'great',
    note: 'Had a super productive study session with coffee and sunny weather.',
    tags: ['Grateful', 'Focused'],
    createdAt: `${getOffsetDateStr(-1)}T20:00:00`,
  },
  {
    id: 'mood-2',
    date: getOffsetDateStr(-2),
    mood: 'okay',
    note: 'A bit tired in the afternoon, took an extra tea break which helped.',
    tags: ['Slow pace', 'Restful'],
    createdAt: `${getOffsetDateStr(-2)}T21:00:00`,
  },
  {
    id: 'mood-3',
    date: getOffsetDateStr(-3),
    mood: 'good',
    note: 'Completed all target tasks early and cooked dinner peacefully.',
    tags: ['Content'],
    createdAt: `${getOffsetDateStr(-3)}T21:30:00`,
  },
  {
    id: 'mood-4',
    date: getOffsetDateStr(-4),
    mood: 'not_great',
    note: 'Felt slightly overwhelmed with organic chemistry concepts, stepped back and took a walk.',
    tags: ['Overwhelmed', 'Self-care'],
    createdAt: `${getOffsetDateStr(-4)}T19:00:00`,
  },
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'journal-1',
    title: 'Finding balance in small moments',
    content: `Today felt like one of those days where I didn't need to rush anything. Instead of trying to finish everything all at once, I broke my study session into two 25-minute blocks. The clarity came naturally.

I want to remember that resting isn't "wasting time"—it's how my brain actually processes everything I learn. Making a cup of lavender tea tonight and watching the sunset from the window.`,
    date: getTodayStr(),
    pinned: true,
    mood: 'good',
    tags: ['Reflections', 'Peace', 'Mindset'],
    updatedAt: `${getTodayStr()}T10:15:00`,
  },
  {
    id: 'journal-2',
    title: 'Overcoming the feeling of being behind',
    content: `Midterms are in two weeks, and sometimes that little whisper tells me I should have started earlier. But looking at my topics list today, I've already finished half of them! 

Progress is quiet and invisible until you look back. One chapter at a time is plenty.`,
    date: getOffsetDateStr(-2),
    pinned: false,
    mood: 'good',
    tags: ['Study', 'Encouragement'],
    updatedAt: `${getOffsetDateStr(-2)}T21:40:00`,
  },
];

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Baddeley Working Memory Model summary',
    content: `Core components:
1. Central Executive: attentional control, allocates resources, suppresses irrelevant info.
2. Phonological Loop: phonological store (inner ear) + articulatory rehearsal process (inner voice).
3. Visuospatial Sketchpad: visual imagery, spatial manipulation.
4. Episodic Buffer: integrates multi-modal info into chronological episodes.

Memory trick: CE delegates to PL, VSS, and EB!`,
    category: 'Study',
    pinned: true,
    color: 'rose',
    updatedAt: getTodayStr(),
  },
  {
    id: 'note-2',
    title: 'Weekend Self-Care ideas',
    content: `- Visit the botanical greenhouse Saturday morning
- Make matcha latte at home with cinnamon
- Finish chapter 7 of current fantasy book
- Fresh flowers for desk vase`,
    category: 'Personal',
    pinned: false,
    color: 'sage',
    updatedAt: getOffsetDateStr(-1),
  },
  {
    id: 'note-3',
    title: 'Book recommendations from Professor Vance',
    content: `- Thinking, Fast and Slow (Kahneman)
- The Memory Illusion (Julia Shaw)
- Deep Work (Cal Newport)`,
    category: 'Ideas',
    pinned: false,
    color: 'sky',
    updatedAt: getOffsetDateStr(-3),
  },
];

export const initialShoppingItems: ShoppingItem[] = [
  { id: 'shop-1', text: 'Oat milk (unsweetened)', category: 'Groceries', checked: false, createdAt: getTodayStr() },
  { id: 'shop-2', text: 'Chamomile & Lavender tea bags', category: 'Groceries', checked: true, createdAt: getTodayStr() },
  { id: 'shop-3', text: 'Greek yogurt & blueberries', category: 'Groceries', checked: false, createdAt: getTodayStr() },
  { id: 'shop-4', text: 'Sticky tabs for textbook annotation', category: 'Things to buy', checked: false, createdAt: getTodayStr() },
  { id: 'shop-5', text: 'Mildliner pastel highlighters (sage & blush)', category: 'Things to buy', checked: true, createdAt: getTodayStr() },
  { id: 'shop-6', text: 'Backup phone charger cable', category: 'Things to remember', checked: false, createdAt: getTodayStr() },
];

export const initialContacts: ImportantContact[] = [
  {
    id: 'contact-1',
    name: 'Mom',
    relation: 'Family',
    phone: '+1 (555) 234-5678',
    notes: 'Always calls on Sunday afternoons ❤️',
  },
  {
    id: 'contact-2',
    name: 'Liam (Partner)',
    relation: 'Friends',
    phone: '+1 (555) 345-6789',
    notes: 'Text whenever you need a quick study break or cheer-up.',
  },
  {
    id: 'contact-3',
    name: 'Emma (Best Friend)',
    relation: 'Friends',
    phone: '+1 (555) 876-5432',
    notes: 'Study buddy for library Saturdays.',
  },
  {
    id: 'contact-4',
    name: 'Campus Health & Wellness Center',
    relation: 'Health',
    phone: '+1 (555) 987-0000',
    notes: 'Student clinic open Mon-Fri 8:30am - 5pm. Walk-ins welcome.',
  },
  {
    id: 'contact-5',
    name: 'Campus Academic Advising',
    relation: 'College',
    phone: '+1 (555) 456-1212',
    notes: 'Student Union Bldg Room 204. Advisor: Mrs. Reynolds.',
  },
  {
    id: 'contact-6',
    name: 'Campus Security / Safe Walk Escort',
    relation: 'Emergency',
    phone: '+1 (555) 911-SAFE',
    notes: '24/7 security escort for late evening library returns.',
  },
];
