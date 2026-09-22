import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Task,
  Reminder,
  MoodEntry,
  JournalEntry,
  Habit,
  Note,
  ShoppingItem,
  UserSettings,
} from '../types';

export interface UserFullState {
  settings: UserSettings;
  tasks: Task[];
  reminders: Reminder[];
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  habits: Habit[];
  notes: Note[];
  shoppingItems: ShoppingItem[];
}

/**
 * Save user profile and settings to Firestore under /users/{userId}
 */
export async function saveUserSettingsToFirestore(userId: string, settings: UserSettings): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Failed to save settings to Firestore:', error);
  }
}

/**
 * Save tasks collection for user to Firestore
 */
export async function syncTaskToFirestore(userId: string, task: Task): Promise<void> {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', task.id);
    await setDoc(taskRef, task, { merge: true });
  } catch (error) {
    console.error('Failed to sync task to Firestore:', error);
  }
}

/**
 * Sync entire snapshot to Firestore
 */
export async function syncAllDataToFirestore(userId: string, state: UserFullState): Promise<void> {
  try {
    // 1. Settings
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...state.settings, updatedAt: new Date().toISOString() }, { merge: true });

    // 2. Batch write recent tasks
    const batch = writeBatch(db);
    for (const task of state.tasks.slice(0, 50)) {
      const taskRef = doc(db, 'users', userId, 'tasks', task.id);
      batch.set(taskRef, task, { merge: true });
    }

    // 3. Batch write journals
    for (const journal of state.journalEntries.slice(0, 30)) {
      const journalRef = doc(db, 'users', userId, 'journalEntries', journal.id);
      batch.set(journalRef, journal, { merge: true });
    }

    // 4. Batch write habits
    for (const habit of state.habits.slice(0, 20)) {
      const habitRef = doc(db, 'users', userId, 'habits', habit.id);
      batch.set(habitRef, habit, { merge: true });
    }

    // 5. Batch write notes
    for (const note of state.notes.slice(0, 30)) {
      const noteRef = doc(db, 'users', userId, 'notes', note.id);
      batch.set(noteRef, note, { merge: true });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error syncing data to Firestore:', error);
  }
}

/**
 * Load user state from Firestore
 */
export async function loadUserDataFromFirestore(userId: string): Promise<Partial<UserFullState> | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    let loadedSettings: UserSettings | undefined;
    if (userSnap.exists()) {
      loadedSettings = userSnap.data() as UserSettings;
    }

    // Load tasks
    const tasksCol = collection(db, 'users', userId, 'tasks');
    const tasksSnap = await getDocs(tasksCol);
    const tasks: Task[] = [];
    tasksSnap.forEach((d) => tasks.push(d.data() as Task));

    // Load journalEntries
    const journalCol = collection(db, 'users', userId, 'journalEntries');
    const journalSnap = await getDocs(journalCol);
    const journalEntries: JournalEntry[] = [];
    journalSnap.forEach((d) => journalEntries.push(d.data() as JournalEntry));

    // Load habits
    const habitsCol = collection(db, 'users', userId, 'habits');
    const habitsSnap = await getDocs(habitsCol);
    const habits: Habit[] = [];
    habitsSnap.forEach((d) => habits.push(d.data() as Habit));

    // Load notes
    const notesCol = collection(db, 'users', userId, 'notes');
    const notesSnap = await getDocs(notesCol);
    const notes: Note[] = [];
    notesSnap.forEach((d) => notes.push(d.data() as Note));

    return {
      ...(loadedSettings ? { settings: loadedSettings } : {}),
      ...(tasks.length > 0 ? { tasks } : {}),
      ...(journalEntries.length > 0 ? { journalEntries } : {}),
      ...(habits.length > 0 ? { habits } : {}),
      ...(notes.length > 0 ? { notes } : {}),
    };
  } catch (error) {
    console.error('Error loading Firestore data:', error);
    return null;
  }
}
