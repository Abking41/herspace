import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { HomeDashboard } from './components/home/HomeDashboard';
import { StudyDashboard } from './components/study/StudyDashboard';
import { TaskManager } from './components/tasks/TaskManager';
import { CalendarView } from './components/calendar/CalendarView';
import { MoreHub } from './components/more/MoreHub';
import { MoodTrackerView } from './components/more/MoodTrackerView';
import { JournalView } from './components/more/JournalView';
import { HabitsView } from './components/more/HabitsView';
import { NotesView } from './components/more/NotesView';
import { ShoppingListView } from './components/more/ShoppingListView';
import { EmergencyContactsView } from './components/more/EmergencyContactsView';
import { SettingsView } from './components/more/SettingsView';
import { GeminiChatView } from './components/chat/GeminiChatView';
import { VoiceCompanionModal } from './components/voice/VoiceCompanionModal';
import { StudySpotsFinder } from './components/study/StudySpotsFinder';
import { LiveSearchAssistant } from './components/study/LiveSearchAssistant';

export function App() {
  const { activeTab, moreSubView, toast } = useApp();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'study':
        return <StudyDashboard />;
      case 'ai-chat':
        return <GeminiChatView onOpenVoiceModal={() => setIsVoiceOpen(true)} />;
      case 'tasks':
        return <TaskManager />;
      case 'calendar':
        return <CalendarView />;
      case 'more':
        if (!moreSubView) {
          return <MoreHub />;
        }
        switch (moreSubView) {
          case 'study-spots':
            return (
              <div className="max-w-4xl mx-auto px-4 py-6">
                <StudySpotsFinder />
              </div>
            );
          case 'research':
            return (
              <div className="max-w-4xl mx-auto px-4 py-6">
                <LiveSearchAssistant />
              </div>
            );
          case 'mood':
            return <MoodTrackerView />;
          case 'journal':
            return <JournalView />;
          case 'habits':
            return <HabitsView />;
          case 'notes':
            return <NotesView />;
          case 'shopping':
            return <ShoppingListView />;
          case 'contacts':
            return <EmergencyContactsView />;
          case 'settings':
            return <SettingsView />;
          default:
            return <MoreHub />;
        }
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Header with Live Voice & Auth trigger */}
      <Header onOpenVoiceModal={() => setIsVoiceOpen(true)} />

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto">{renderContent()}</main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Global Cmd+K Search Modal */}
      <GlobalSearchModal />

      {/* First-Time Gentle Onboarding Modal */}
      <OnboardingModal />

      {/* Gemini Live Voice Companion Modal */}
      <VoiceCompanionModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-stone-900/90 dark:bg-stone-100/90 text-white dark:text-stone-900 text-xs font-medium shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.icon && <span className="text-base">{toast.icon}</span>}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
