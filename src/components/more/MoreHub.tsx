import React from 'react';
import {
  Smile,
  Bookmark,
  CheckCircle2,
  FileText,
  ShoppingBag,
  Shield,
  Settings,
  ChevronRight,
  Heart,
  Sparkles,
  MapPin,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MoreSubView } from '../../types';

export const MoreHub: React.FC = () => {
  const {
    setMoreSubView,
    moodEntries,
    journalEntries,
    habits,
    notes,
    shoppingItems,
    contacts,
    settings,
    currentUser,
    isCloudSynced,
  } = useApp();

  const menuItems: {
    id: MoreSubView;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    badge?: string;
  }[] = [
    {
      id: 'study-spots',
      title: 'Study Spots & Libraries',
      description: 'Find serene cafes, quiet libraries & parks with Google Maps Grounding',
      icon: MapPin,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60',
      badge: 'Maps Grounding',
    },
    {
      id: 'research',
      title: 'Live Web Research',
      description: 'Search academic papers, facts & news with Google Search Grounding',
      icon: Globe,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60',
      badge: 'Search Grounding',
    },
    {
      id: 'mood',
      title: 'Mood & Emotion Tracker',
      description: 'Daily emotional check-ins, reflection notes, and feeling trends',
      icon: Smile,
      color: 'text-rose-500 bg-rose-100 dark:bg-rose-950/60',
      badge: `${moodEntries.length} entries`,
    },
    {
      id: 'journal',
      title: 'Private Journal & Diary',
      description: 'A protected sanctuary for quiet thoughts and daily gratitude',
      icon: Bookmark,
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/60',
      badge: `${journalEntries.length} pages`,
    },
    {
      id: 'habits',
      title: 'Habits & Self-Care',
      description: 'Water, reading, meditation, skincare, and gentle consistency',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60',
      badge: `${habits.length} habits`,
    },
    {
      id: 'notes',
      title: 'Notes & Scratchpad',
      description: 'Fleeting thoughts, recipes, book wishlists, and gift inspirations',
      icon: FileText,
      color: 'text-sky-500 bg-sky-100 dark:bg-sky-950/60',
      badge: `${notes.length} notes`,
    },
    {
      id: 'shopping',
      title: 'Shopping & Errands',
      description: 'Groceries, skincare, study stationery, and checklist essentials',
      icon: ShoppingBag,
      color: 'text-teal-500 bg-teal-100 dark:bg-teal-950/60',
      badge: `${shoppingItems.filter((i) => !i.checked).length} to buy`,
    },
    {
      id: 'contacts',
      title: 'Important Contacts & Safety',
      description: 'One-tap calls and messages to loved ones and medical numbers',
      icon: Shield,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950/60',
      badge: `${contacts.length} saved`,
    },
    {
      id: 'settings',
      title: 'Settings & Preferences',
      description: 'Profile name, appearance theme, partner messages, and export',
      icon: Settings,
      color: 'text-stone-500 bg-stone-200 dark:bg-stone-800',
    },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Personal Companion Space
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Everything for your private thoughts, self-care, daily needs, and wellness.
        </p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => setMoreSubView(item.id)}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-rose-300 dark:hover:border-rose-900/60 cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Friendly Bottom Banner */}
      <div className="p-4 rounded-3xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/30 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
        <span className="flex items-center gap-2 font-medium">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> Made with care for {settings.userName || 'Sayani'}
        </span>
        <span className="text-[11px] text-stone-400">HerSpace v1.0</span>
      </div>
    </div>
  );
};
