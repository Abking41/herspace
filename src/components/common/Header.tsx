import React from 'react';
import { Search, Moon, Sun, Bell, Sparkles, Mic, Cloud } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenVoiceModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenVoiceModal }) => {
  const {
    settings,
    updateSettings,
    setSearchOpen,
    requestNotificationPermission,
    setOnboardingOpen,
    currentUser,
    isCloudSynced,
    signInWithGoogle,
    setActiveTab,
    setMoreSubView,
  } = useApp();

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: next });
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setOnboardingOpen(true)}
            className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 flex items-center justify-center text-xl shadow-xs border border-rose-200/60 dark:border-rose-900/50 cursor-pointer hover:scale-105 transition-transform"
            title="HerSpace Guide / Avatar"
          >
            {settings.avatarSeed || '🌸'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                HerSpace
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium tracking-wide rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/40">
                <Sparkles className="w-2.5 h-2.5" /> daily
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans leading-none">
              Welcome, {settings.userName || 'Sayani'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Gemini Live Voice Shortcut */}
          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
              title="Gemini Live Voice Companion (gemini-3.8-live)"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Live Voice</span>
            </button>
          )}

          {/* Cloud Sync / User Profile */}
          {currentUser ? (
            <button
              onClick={() => {
                setActiveTab('more');
                setMoreSubView('settings');
              }}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"
              title={`Signed in as ${currentUser.displayName || currentUser.email} • Firestore Synced`}
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-rose-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold text-xs">
                  {(currentUser.displayName || currentUser.email || 'S')[0].toUpperCase()}
                </div>
              )}
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Firestore Connected" />
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 rounded-xl text-xs hidden sm:flex items-center gap-1"
              title="Sign in with Google (Firebase Auth)"
            >
              <Cloud className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[11px]">Sign in</span>
            </button>
          )}

          <button
            onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors flex items-center gap-1.5 text-xs"
            title="Search anything (Cmd+K)"
            aria-label="Global search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline text-stone-400 dark:text-stone-500">Search</span>
          </button>

          <button
            onClick={requestNotificationPermission}
            className={`p-2.5 rounded-xl transition-colors ${
              settings.notificationPermissionRequested
                ? 'text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
            }`}
            title="Enable gentle reminders"
            aria-label="Reminders notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"
            title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
