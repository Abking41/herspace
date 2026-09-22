import React from 'react';
import { Home, BookOpen, CheckSquare, Calendar, Heart, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';
import { getTodayStr } from '../../data/initialData';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setMoreSubView, tasks } = useApp();

  const todayStr = getTodayStr();
  const pendingTodayTasks = tasks.filter(
    (t) => !t.completed && (t.dueDate === todayStr || !t.dueDate)
  ).length;

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'ai-chat', label: 'Gemini', icon: Sparkles },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'more', label: 'More', icon: Heart },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (tabId !== 'more') {
      setMoreSubView(null);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800/80 py-1.5 px-3 shadow-lg transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 font-medium scale-105'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.id === 'tasks' && pendingTodayTasks > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {pendingTodayTasks}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-rose-500 dark:bg-rose-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
