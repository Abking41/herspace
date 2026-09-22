import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  auth,
  signInWithGoogle as firebaseSignIn,
  signOutUser as firebaseSignOut,
  onAuthStateChanged,
  testFirestoreConnection,
  type FirebaseUser,
} from '../lib/firebase';
import {
  syncAllDataToFirestore,
  loadUserDataFromFirestore,
} from '../lib/firestoreSync';
import {
  TabType,
  MoreSubView,
  Task,
  Subject,
  StudySession,
  Reminder,
  MoodEntry,
  MoodValue,
  JournalEntry,
  Habit,
  Note,
  ShoppingItem,
  ImportantContact,
  UserSettings,
} from '../types';
import {
  initialSettings,
  initialTasks,
  initialSubjects,
  initialStudySessions,
  initialReminders,
  initialHabits,
  initialMoodEntries,
  initialJournalEntries,
  initialNotes,
  initialShoppingItems,
  initialContacts,
  getTodayStr,
} from '../data/initialData';

interface Toast {
  id: string;
  message: string;
  icon?: string;
}

interface AppContextType {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  moreSubView: MoreSubView;
  setMoreSubView: (view: MoreSubView) => void;

  // Search & Modals
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;

  // User & Settings
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  incrementWater: () => void;
  decrementWater: () => void;
  resetDailyWater: () => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;

  // Study & Subjects
  subjects: Subject[];
  addSubject: (subj: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  toggleTopicCompleted: (subjectId: string, topicId: string) => void;
  addTopicToSubject: (subjectId: string, topicName: string) => void;

  // Study Sessions
  studySessions: StudySession[];
  logStudySession: (session: Omit<StudySession, 'id'>) => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  requestNotificationPermission: () => Promise<boolean>;

  // Mood
  moodEntries: MoodEntry[];
  todayMood: MoodEntry | undefined;
  setMoodForToday: (mood: MoodValue, note?: string, tags?: string[]) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'updatedAt'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  togglePinJournal: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  toggleHabitDate: (habitId: string, dateStr: string) => void;
  toggleHabitForDate: (habitId: string, dateStr: string) => void;
  deleteHabit: (id: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Shopping / Checklist
  shoppingItems: ShoppingItem[];
  addShoppingItem: (text: string, category?: ShoppingItem['category']) => void;
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;

  // Contacts
  contacts: ImportantContact[];
  addContact: (contact: Omit<ImportantContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<ImportantContact>) => void;
  deleteContact: (id: string) => void;

  // Backup & Reset
  exportAllData: () => void;
  importData: (jsonStr: string) => boolean;
  resetAllData: () => void;
  resetToDefaultData: () => void;

  // Gentle Toasts
  showToast: (message: string, icon?: string) => void;
  toasts: Toast[];
  toast: Toast | undefined;
  dismissToast: (id: string) => void;

  // Firebase Auth & Cloud Persistence
  currentUser: FirebaseUser | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isCloudSynced: boolean;
  syncToCloud: () => Promise<void>;
}

const STORAGE_KEY = 'herspace_data_v1.0';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [moreSubView, setMoreSubView] = useState<MoreSubView>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State slices
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.userName || parsed.userName === 'Mia') {
          parsed.userName = 'Sayani';
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialSettings;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialTasks;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_subjects`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialSubjects;
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_studySessions`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialStudySessions;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_reminders`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialReminders;
  });

  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_moodEntries`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialMoodEntries;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_journalEntries`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialJournalEntries;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_habits`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialHabits;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_notes`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialNotes;
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_shoppingItems`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialShoppingItems;
  });

  const [contacts, setContacts] = useState<ImportantContact[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_contacts`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialContacts;
  });

  // Firebase Auth and Firestore Cloud state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Initialize and listen to Firebase Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        try {
          const cloudData = await loadUserDataFromFirestore(user.uid);
          if (cloudData) {
            if (cloudData.settings) {
              const cloudSettings = cloudData.settings;
              setSettings((prev) => ({
                ...prev,
                ...cloudSettings,
                userName: cloudSettings.userName || prev.userName || 'Sayani',
              }));
            }
            if (cloudData.tasks && cloudData.tasks.length > 0) {
              setTasks(cloudData.tasks);
            }
            if (cloudData.journalEntries && cloudData.journalEntries.length > 0) {
              setJournalEntries(cloudData.journalEntries);
            }
            if (cloudData.habits && cloudData.habits.length > 0) {
              setHabits(cloudData.habits);
            }
            if (cloudData.notes && cloudData.notes.length > 0) {
              setNotes(cloudData.notes);
            }
            setIsCloudSynced(true);
            showToast('Loaded your space from Firestore ☁️');
          } else {
            // First time sync
            await syncAllDataToFirestore(user.uid, {
              settings,
              tasks,
              reminders,
              moodEntries,
              journalEntries,
              habits,
              notes,
              shoppingItems,
            });
            setIsCloudSynced(true);
          }
        } catch (err) {
          console.error('Firestore init error:', err);
        }
      } else {
        setIsCloudSynced(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthLoading(true);
      const user = await firebaseSignIn();
      if (user) {
        showToast(`Welcome, ${user.displayName || 'Sayani'}! 🌸`);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      showToast(err?.message || 'Sign in canceled or failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      showToast('Signed out. Local data preserved safely.');
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  const syncToCloud = async () => {
    if (!currentUser) {
      showToast('Sign in with Google to sync to Firestore');
      return;
    }
    try {
      await syncAllDataToFirestore(currentUser.uid, {
        settings,
        tasks,
        reminders,
        moodEntries,
        journalEntries,
        habits,
        notes,
        shoppingItems,
      });
      setIsCloudSynced(true);
      showToast('Synced to Firestore database! ☁️');
    } catch (err) {
      console.error('Sync failed:', err);
      showToast('Failed to sync to Firestore.');
    }
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
    } catch (e) {
      console.error(e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_studySessions`, JSON.stringify(studySessions));
    } catch (e) {
      console.error(e);
    }
  }, [studySessions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_reminders`, JSON.stringify(reminders));
    } catch (e) {
      console.error(e);
    }
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_moodEntries`, JSON.stringify(moodEntries));
    } catch (e) {
      console.error(e);
    }
  }, [moodEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_journalEntries`, JSON.stringify(journalEntries));
    } catch (e) {
      console.error(e);
    }
  }, [journalEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_habits`, JSON.stringify(habits));
    } catch (e) {
      console.error(e);
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_notes`, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_shoppingItems`, JSON.stringify(shoppingItems));
    } catch (e) {
      console.error(e);
    }
  }, [shoppingItems]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contacts));
    } catch (e) {
      console.error(e);
    }
  }, [contacts]);

  // Dark/Light Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Daily water reset check
  useEffect(() => {
    const today = getTodayStr();
    if (settings.waterLastUpdatedDate !== today) {
      setSettings((prev) => ({
        ...prev,
        waterCurrentGlasses: 0,
        waterLastUpdatedDate: today,
      }));
    }
  }, [settings.waterLastUpdatedDate]);

  // Toasts
  const showToast = useCallback((message: string, icon?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Settings
  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const incrementWater = useCallback(() => {
    setSettings((prev) => {
      const nextVal = Math.min(prev.waterCurrentGlasses + 1, 20);
      if (nextVal === prev.waterTargetGlasses) {
        showToast('Daily water goal reached! Stay refreshed 💧', '💧');
      }
      return {
        ...prev,
        waterCurrentGlasses: nextVal,
        waterLastUpdatedDate: getTodayStr(),
      };
    });
  }, [showToast]);

  const decrementWater = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      waterCurrentGlasses: Math.max(prev.waterCurrentGlasses - 1, 0),
    }));
  }, []);

  const resetDailyWater = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      waterCurrentGlasses: 0,
      waterLastUpdatedDate: getTodayStr(),
    }));
  }, []);

  // Task actions
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'completed'>) => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        completed: false,
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('Task added to your day', '✨');
    },
    [showToast]
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Task removed', '🗑️');
    },
    [showToast]
  );

  const toggleTaskCompleted = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const nextCompleted = !t.completed;
            if (nextCompleted) {
              // Trigger gentle celebratory confetti
              try {
                confetti({
                  particleCount: 38,
                  spread: 60,
                  origin: { y: 0.8 },
                  colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#a7f3d0', '#bfdbfe'],
                  disableForReducedMotion: true,
                });
              } catch (e) {
                // ignore
              }
              showToast('Nice work! Step by step 🌸', '🌸');
            }
            return {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            };
          }
          return t;
        })
      );
    },
    [showToast]
  );

  // Subject actions
  const addSubject = useCallback(
    (subjData: Omit<Subject, 'id'>) => {
      const newSubject: Subject = {
        ...subjData,
        id: `subj-${Date.now()}`,
      };
      setSubjects((prev) => [...prev, newSubject]);
      showToast(`Subject "${newSubject.name}" created`, '📚');
    },
    [showToast]
  );

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteSubject = useCallback(
    (id: string) => {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      showToast('Subject deleted', '🗑️');
    },
    [showToast]
  );

  const toggleTopicCompleted = useCallback((subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((subj) => {
        if (subj.id !== subjectId) return subj;
        const nextTopics = subj.topics.map((top) =>
          top.id === topicId ? { ...top, completed: !top.completed } : top
        );
        return { ...subj, topics: nextTopics };
      })
    );
  }, []);

  // Study sessions
  const logStudySession = useCallback(
    (sessionData: Omit<StudySession, 'id'>) => {
      const newSession: StudySession = {
        ...sessionData,
        id: `sess-${Date.now()}`,
      };
      setStudySessions((prev) => [newSession, ...prev]);
      showToast(`Logged ${newSession.durationMinutes} min study session! Great focus 🌿`, '🌿');
    },
    [showToast]
  );

  // Reminders
  const addReminder = useCallback(
    (reminderData: Omit<Reminder, 'id'>) => {
      const newRem: Reminder = {
        ...reminderData,
        id: `rem-${Date.now()}`,
      };
      setReminders((prev) => [newRem, ...prev]);
      showToast('Reminder saved', '🔔');
    },
    [showToast]
  );

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteReminder = useCallback(
    (id: string) => {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      showToast('Reminder removed', '🗑️');
    },
    [showToast]
  );

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      showToast('Browser notifications are not supported on this device.', 'ℹ️');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setSettings((prev) => ({ ...prev, notificationPermissionRequested: true }));
      if (permission === 'granted') {
        showToast('Notifications enabled! We will remind you gently 🌿', '🌿');
        new Notification('HerSpace', {
          body: 'Notifications are active! Take care and have a peaceful day.',
          icon: '/favicon.ico',
        });
        return true;
      } else {
        showToast('Notification permission was not granted.', 'ℹ️');
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [showToast]);

  // Mood
  const todayStr = getTodayStr();
  const todayMood = moodEntries.find((m) => m.date === todayStr);

  const setMoodForToday = useCallback(
    (mood: MoodValue, note?: string, tags?: string[]) => {
      const existing = moodEntries.find((m) => m.date === todayStr);
      if (existing) {
        setMoodEntries((prev) =>
          prev.map((m) =>
            m.date === todayStr
              ? {
                  ...m,
                  mood,
                  note: note !== undefined ? note : m.note,
                  tags: tags !== undefined ? tags : m.tags,
                }
              : m
          )
        );
      } else {
        const newEntry: MoodEntry = {
          id: `mood-${Date.now()}`,
          date: todayStr,
          mood,
          note,
          tags,
          createdAt: new Date().toISOString(),
        };
        setMoodEntries((prev) => [newEntry, ...prev]);
      }
      showToast('Mood check-in recorded ❤️', '❤️');
    },
    [todayStr, moodEntries, showToast]
  );

  // Journal
  const addJournalEntry = useCallback(
    (entryData: Omit<JournalEntry, 'id' | 'updatedAt'>) => {
      const newEntry: JournalEntry = {
        ...entryData,
        id: `journ-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      setJournalEntries((prev) => [newEntry, ...prev]);
      showToast('Journal entry saved privately 📖', '📖');
    },
    [showToast]
  );

  const updateJournalEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j
      )
    );
  }, []);

  const deleteJournalEntry = useCallback(
    (id: string) => {
      setJournalEntries((prev) => prev.filter((j) => j.id !== id));
      showToast('Journal entry removed', '🗑️');
    },
    [showToast]
  );

  const togglePinJournal = useCallback((id: string) => {
    setJournalEntries((prev) =>
      prev.map((j) => (j.id === id ? { ...j, pinned: !j.pinned } : j))
    );
  }, []);

  // Habits
  const addHabit = useCallback(
    (habitData: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}`,
        completedDates: [],
        createdAt: getTodayStr(),
      };
      setHabits((prev) => [...prev, newHabit]);
      showToast(`Habit "${newHabit.name}" created 🌱`, '🌱');
    },
    [showToast]
  );

  const toggleHabitDate = useCallback((habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(dateStr);
        const nextDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];
        return { ...h, completedDates: nextDates };
      })
    );
  }, []);

  const deleteHabit = useCallback(
    (id: string) => {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      showToast('Habit removed', '🗑️');
    },
    [showToast]
  );

  // Notes
  const addNote = useCallback(
    (noteData: Omit<Note, 'id' | 'updatedAt'>) => {
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}`,
        updatedAt: getTodayStr(),
      };
      setNotes((prev) => [newNote, ...prev]);
      showToast('Note added', '📝');
    },
    [showToast]
  );

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: getTodayStr() } : n))
    );
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast('Note deleted', '🗑️');
    },
    [showToast]
  );

  const togglePinNote = useCallback((id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }, []);

  // Shopping
  const addShoppingItem = useCallback(
    (text: string, category: ShoppingItem['category'] = 'Groceries') => {
      if (!text.trim()) return;
      const newItem: ShoppingItem = {
        id: `shop-${Date.now()}`,
        text: text.trim(),
        category,
        checked: false,
        createdAt: getTodayStr(),
      };
      setShoppingItems((prev) => [...prev, newItem]);
    },
    []
  );

  const toggleShoppingItem = useCallback((id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  const deleteShoppingItem = useCallback((id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCompletedShopping = useCallback(() => {
    setShoppingItems((prev) => prev.filter((item) => !item.checked));
    showToast('Checked items cleared', '✨');
  }, [showToast]);

  // Contacts
  const addContact = useCallback(
    (contactData: Omit<ImportantContact, 'id'>) => {
      const newContact: ImportantContact = {
        ...contactData,
        id: `contact-${Date.now()}`,
      };
      setContacts((prev) => [...prev, newContact]);
      showToast('Contact saved privately', '📞');
    },
    [showToast]
  );

  const deleteContact = useCallback(
    (id: string) => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      showToast('Contact removed', '🗑️');
    },
    [showToast]
  );

  // Backup & Restore
  const exportAllData = useCallback(() => {
    const payload = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      settings,
      tasks,
      subjects,
      studySessions,
      reminders,
      moodEntries,
      journalEntries,
      habits,
      notes,
      shoppingItems,
      contacts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HerSpace_backup_${getTodayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully', '💾');
  }, [
    settings,
    tasks,
    subjects,
    studySessions,
    reminders,
    moodEntries,
    journalEntries,
    habits,
    notes,
    shoppingItems,
    contacts,
    showToast,
  ]);

  const importData = useCallback(
    (jsonStr: string): boolean => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.settings) setSettings(parsed.settings);
        if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
        if (Array.isArray(parsed.subjects)) setSubjects(parsed.subjects);
        if (Array.isArray(parsed.studySessions)) setStudySessions(parsed.studySessions);
        if (Array.isArray(parsed.reminders)) setReminders(parsed.reminders);
        if (Array.isArray(parsed.moodEntries)) setMoodEntries(parsed.moodEntries);
        if (Array.isArray(parsed.journalEntries)) setJournalEntries(parsed.journalEntries);
        if (Array.isArray(parsed.habits)) setHabits(parsed.habits);
        if (Array.isArray(parsed.notes)) setNotes(parsed.notes);
        if (Array.isArray(parsed.shoppingItems)) setShoppingItems(parsed.shoppingItems);
        if (Array.isArray(parsed.contacts)) setContacts(parsed.contacts);
        showToast('Data restored successfully! Welcome back 🌸', '🌸');
        return true;
      } catch (e) {
        console.error(e);
        showToast('Invalid backup file. Please verify JSON format.', '⚠️');
        return false;
      }
    },
    [showToast]
  );

  const resetAllData = useCallback(() => {
    localStorage.clear();
    setSettings(initialSettings);
    setTasks(initialTasks);
    setSubjects(initialSubjects);
    setStudySessions(initialStudySessions);
    setReminders(initialReminders);
    setMoodEntries(initialMoodEntries);
    setJournalEntries(initialJournalEntries);
    setHabits(initialHabits);
    setNotes(initialNotes);
    setShoppingItems(initialShoppingItems);
    setContacts(initialContacts);
    showToast('All data reset to fresh defaults', '🔄');
  }, [showToast]);

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<ImportantContact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const addTopicToSubject = useCallback((subjectId: string, topicName: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              topics: [
                ...s.topics,
                { id: Math.random().toString(36).substring(2, 9), name: topicName, completed: false },
              ],
            }
          : s
      )
    );
  }, []);

  const darkMode = settings.theme === 'dark';
  const toast = toasts[toasts.length - 1];

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        moreSubView,
        setMoreSubView,
        searchOpen,
        setSearchOpen,
        onboardingOpen,
        setOnboardingOpen,
        settings,
        updateSettings,
        darkMode,
        toggleDarkMode,
        incrementWater,
        decrementWater,
        resetDailyWater,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        toggleTopicCompleted,
        addTopicToSubject,
        studySessions,
        logStudySession,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
        requestNotificationPermission,
        moodEntries,
        todayMood,
        setMoodForToday,
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        togglePinJournal,
        habits,
        addHabit,
        toggleHabitDate,
        toggleHabitForDate: toggleHabitDate,
        deleteHabit,
        notes,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        shoppingItems,
        addShoppingItem,
        toggleShoppingItem,
        deleteShoppingItem,
        clearCompletedShopping,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        exportAllData,
        importData,
        resetAllData,
        resetToDefaultData: resetAllData,
        showToast,
        toasts,
        toast,
        dismissToast,
        currentUser,
        authLoading,
        signInWithGoogle,
        signOut,
        isCloudSynced,
        syncToCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
