import React, { useState } from 'react';
import {
  ArrowLeft,
  Moon,
  Sun,
  Heart,
  Droplets,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Shield,
  Sparkles,
  Cloud,
  LogIn,
  LogOut,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    darkMode,
    toggleDarkMode,
    setMoreSubView,
    resetToDefaultData,
    showToast,
    tasks,
    subjects,
    reminders,
    moodEntries,
    journalEntries,
    habits,
    notes,
    shoppingItems,
    contacts,
    currentUser,
    authLoading,
    signInWithGoogle,
    signOut,
    isCloudSynced,
    syncToCloud,
  } = useApp();

  const [userName, setUserName] = useState(settings.userName);
  const [partnerEnabled, setPartnerEnabled] = useState(settings.partnerMessageEnabled);
  const [newPartnerMsg, setNewPartnerMsg] = useState('');
  const [waterTarget, setWaterTarget] = useState(settings.waterTargetGlasses);
  const [bedtime, setBedtime] = useState(settings.sleepBedtime);
  const [wakeTime, setWakeTime] = useState(settings.sleepWakeTime);
  const [workMins, setWorkMins] = useState(settings.pomodoroWorkMinutes);
  const [breakMins, setBreakMins] = useState(settings.pomodoroShortBreakMinutes);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim() || 'Sayani',
      partnerMessageEnabled: partnerEnabled,
      waterTargetGlasses: Number(waterTarget) || 8,
      sleepBedtime: bedtime,
      sleepWakeTime: wakeTime,
      pomodoroWorkMinutes: Number(workMins) || 25,
      pomodoroShortBreakMinutes: Number(breakMins) || 5,
    });
    showToast('Settings saved gracefully 🌸', '🌸');
  };

  const handleAddPartnerMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerMsg.trim()) return;

    updateSettings({
      partnerMessages: [...settings.partnerMessages, newPartnerMsg.trim()],
    });
    setNewPartnerMsg('');
    showToast('New message added to rotation ❤️', '❤️');
  };

  const handleDeletePartnerMsg = (index: number) => {
    const updated = settings.partnerMessages.filter((_, i) => i !== index);
    updateSettings({ partnerMessages: updated });
  };

  // Export JSON Backup
  const handleExportData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      tasks,
      subjects,
      reminders,
      moodEntries,
      journalEntries,
      habits,
      notes,
      shoppingItems,
      contacts,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `herspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully 📦', '📦');
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMoreSubView(null)}
          className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Settings & Preferences
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Tailor your HerSpace experience, appearance, and wellness goals.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
        {/* Profile & Appearance */}
        <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Profile & Appearance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Your Preferred Name / Nickname
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Appearance Mode
              </label>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  {darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  {darkMode ? 'Dark Theme (Night)' : 'Light Theme (Day)'}
                </span>
                <span className="text-[11px] text-stone-400">Tap to toggle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Daily Hydration & Sleep Rhythm */}
        <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-teal-500" /> Wellness Targets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Daily Water Target (Glasses)
              </label>
              <input
                type="number"
                min="4"
                max="16"
                value={waterTarget}
                onChange={(e) => setWaterTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Target Bedtime
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Target Wake-Up Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Pomodoro Timer Timing */}
        <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" /> Pomodoro Timer Intervals
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Focus Duration (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={workMins}
                onChange={(e) => setWorkMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Short Break (Minutes)
              </label>
              <input
                type="number"
                min="3"
                max="20"
                value={breakMins}
                onChange={(e) => setBreakMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Save button for main settings */}
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm shadow-xs transition-colors"
        >
          Save Preferences
        </button>
      </form>

      {/* Partner Message Feature Customizer */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                &ldquo;A Little Message&rdquo; Feature
              </h2>
              <p className="text-[11px] text-stone-500">
                Optional sweet notes & reminders displayed gently on the home dashboard.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={partnerEnabled}
              onChange={(e) => {
                setPartnerEnabled(e.target.checked);
                updateSettings({ partnerMessageEnabled: e.target.checked });
              }}
              className="accent-rose-500 rounded-sm"
            />
            <span>Enabled</span>
          </label>
        </div>

        {partnerEnabled && (
          <div className="space-y-3 pt-2 text-xs">
            <form onSubmit={handleAddPartnerMsg} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a sweet supportive message..."
                value={newPartnerMsg}
                onChange={(e) => setNewPartnerMsg(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shrink-0"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {settings.partnerMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2"
                >
                  <span className="truncate italic text-stone-700 dark:text-stone-300">
                    &ldquo;{msg}&rdquo;
                  </span>
                  <button
                    onClick={() => handleDeletePartnerMsg(idx)}
                    className="p-1 text-stone-400 hover:text-rose-500 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Firebase Cloud Sync & Authentication */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-rose-100 dark:border-stone-800 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Firebase Cloud & Authentication
              </h2>
              <p className="text-[11px] text-stone-500">
                Google Sign-in with Firebase Auth and Firestore persistent cloud backup
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
              currentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
            }`}
          >
            <Cloud className="w-3 h-3" />
            {currentUser ? (isCloudSynced ? 'Cloud Synced' : 'Connected') : 'Local Mode'}
          </span>
        </div>

        {currentUser ? (
          <div className="p-3.5 bg-rose-50/50 dark:bg-stone-800/60 rounded-2xl border border-rose-100 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-rose-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold">
                  {(currentUser.displayName || currentUser.email || 'S')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-100 text-xs">
                  {currentUser.displayName || 'Sayani'}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={syncToCloud}
                className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </button>
              <button
                type="button"
                onClick={signOut}
                className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-stone-800 dark:text-stone-200">
                Sign in with Google
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Protect your journal, habits, and tasks across all your devices with Firestore.
              </p>
            </div>
            <button
              type="button"
              disabled={authLoading}
              onClick={signInWithGoogle}
              className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-medium text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <LogIn className="w-4 h-4 text-rose-500" />
              <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}

        <div className="text-[11px] text-stone-400 dark:text-stone-500 flex items-center justify-between">
          <span>Project: gen-lang-client-0753615720</span>
          <span>Rules: Strict user data isolation</span>
        </div>
      </div>

      {/* Local Storage & Data Privacy */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Data Privacy & Local Backup
            </h2>
            <p className="text-[11px] text-stone-500">
              HerSpace stores your journal, habits, and tasks 100% locally in your browser.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Backup (JSON)
          </button>

          <button
            onClick={resetToDefaultData}
            className="py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-rose-500 hover:border-rose-300 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Reset to Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};
