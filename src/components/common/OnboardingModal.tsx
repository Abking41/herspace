import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Heart, Clock, Target, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OnboardingModal: React.FC = () => {
  const { onboardingOpen, setOnboardingOpen, settings, updateSettings, showToast } = useApp();
  const [step, setStep] = useState(1);

  // Local onboarding choices
  const [name, setName] = useState(settings.userName || 'Sayani');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    'Study',
    'Organization',
    'Habits',
    'Reminders',
    'Journaling',
  ]);
  const [waterGoal, setWaterGoal] = useState(settings.waterTargetGlasses || 8);
  const [studyMinutes, setStudyMinutes] = useState(settings.pomodoroWorkMinutes * 4 || 120);
  const [bedtime, setBedtime] = useState(settings.sleepBedtime || '22:45');
  const [wakeTime, setWakeTime] = useState(settings.sleepWakeTime || '07:15');

  if (!onboardingOpen) return null;

  const toggleArea = (area: string) => {
    if (area === 'All of these') {
      setSelectedAreas(['Study', 'Organization', 'Habits', 'Reminders', 'Journaling']);
      return;
    }
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleFinish = () => {
    updateSettings({
      userName: name.trim() || 'Sayani',
      waterTargetGlasses: waterGoal,
      sleepBedtime: bedtime,
      sleepWakeTime: wakeTime,
      hasCompletedOnboarding: true,
    });
    setOnboardingOpen(false);
    showToast('Your space is ready! Have a peaceful, wonderful day 🌸', '🌸');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i
                  ? 'w-7 bg-rose-500'
                  : i < step
                  ? 'w-3 bg-rose-300 dark:bg-rose-800'
                  : 'w-3 bg-stone-200 dark:bg-stone-800'
              }`}
            />
          ))}
        </div>

        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 mx-auto flex items-center justify-center text-3xl shadow-xs">
              🌸
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
                Welcome to your personal space.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                HerSpace is designed to make your everyday life calmer, more organized, and peaceful. A place for your studies, daily rhythm, self-care, and quiet thoughts.
              </p>
            </div>

            <div className="pt-2 text-left">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300 block mb-1.5">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sayani or your favorite nickname"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 2: What would you like help with? */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
                What would you like help with?
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Choose as many as you like. You can always adjust this later.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {['Study', 'Organization', 'Habits', 'Reminders', 'Journaling', 'All of these'].map(
                (item) => {
                  const isChecked =
                    item === 'All of these'
                      ? selectedAreas.length === 5
                      : selectedAreas.includes(item);

                  return (
                    <div
                      key={item}
                      onClick={() => toggleArea(item)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between text-sm transition-all ${
                        isChecked
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="font-medium">{item}</span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                          isChecked
                            ? 'bg-rose-500 text-white'
                            : 'border border-stone-300 dark:border-stone-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-2 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: Choose your daily goals */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
                Choose your daily goals.
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Gentle targets designed to guide you, never to stress you.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850">
                <div className="flex justify-between items-center mb-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-medium flex items-center gap-1.5">💧 Water intake goal</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{waterGoal} glasses ({waterGoal * 250}ml)</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="1"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850">
                <div className="flex justify-between items-center mb-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-medium flex items-center gap-1.5">📚 Daily study focus</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{studyMinutes} mins ({Math.floor(studyMinutes / 60)}h {studyMinutes % 60 ? `${studyMinutes % 60}m` : ''})</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="15"
                  value={studyMinutes}
                  onChange={(e) => setStudyMinutes(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-2 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 4: Set your preferred reminder times */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
                Set your preferred reminder times.
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                A gentle rhythm for waking and resting peacefully.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Target Bedtime
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">Wind-down reminder 30 mins before</div>
                </div>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono font-medium text-stone-800 dark:text-stone-200"
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500" /> Morning Wake-up
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">Time for gentle hydration and start</div>
                </div>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono font-medium text-stone-800 dark:text-stone-200"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-2 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 5: You're ready */}
        {step === 5 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center text-3xl shadow-xs">
              🌿
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
                You&apos;re ready.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                Take things one peaceful step at a time today, {name}. Your tasks, study sessions, and self-care moments are here whenever you need them.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 text-left space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Private & Protected
              </div>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                All your notes, thoughts, and journal entries are kept 100% private in your local browser storage.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full mt-4 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              Enter HerSpace <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
