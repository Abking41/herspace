import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Sparkles, Volume2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { getTodayStr } from '../../data/initialData';

export const PomodoroTimer: React.FC = () => {
  const { settings, subjects, logStudySession, showToast } = useApp();

  type Mode = 'work' | 'shortBreak' | 'longBreak';
  const [mode, setMode] = useState<Mode>('work');
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );

  const getDurationForMode = useCallback((m: Mode) => {
    switch (m) {
      case 'work':
        return settings.pomodoroWorkMinutes * 60;
      case 'shortBreak':
        return settings.pomodoroShortBreakMinutes * 60;
      case 'longBreak':
        return settings.pomodoroLongBreakMinutes * 60;
    }
  }, [settings.pomodoroWorkMinutes, settings.pomodoroShortBreakMinutes, settings.pomodoroLongBreakMinutes]);

  const [timeLeft, setTimeLeft] = useState<number>(() => getDurationForMode('work'));

  // Gentle audio chime synthesizer using Web Audio API
  const playGentleChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz calming frequency
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }, []);

  // Timer interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playGentleChime();

      if (mode === 'work') {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#38bdf8', '#818cf8', '#f43f5e', '#a7f3d0'],
          });
        } catch (e) {}

        const targetSubj = subjects.find((s) => s.id === selectedSubjectId);
        logStudySession({
          subjectId: selectedSubjectId || 'general',
          subjectName: targetSubj ? targetSubj.name : 'General Study',
          durationMinutes: settings.pomodoroWorkMinutes,
          date: getTodayStr(),
          type: 'pomodoro',
          notes: 'Completed full Pomodoro focus block',
        });

        showToast(
          `Focus session complete! Time for a gentle ${settings.pomodoroShortBreakMinutes}m break 🌿`,
          '🌿'
        );
        setMode('shortBreak');
        setTimeLeft(getDurationForMode('shortBreak'));
      } else {
        showToast('Break finished! Ready to step back in gently when you are.', '✨');
        setMode('work');
        setTimeLeft(getDurationForMode('work'));
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    isActive,
    timeLeft,
    mode,
    playGentleChime,
    subjects,
    selectedSubjectId,
    logStudySession,
    settings.pomodoroWorkMinutes,
    settings.pomodoroShortBreakMinutes,
    showToast,
    getDurationForMode,
  ]);

  const toggleTimer = () => setIsActive((prev) => !prev);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDurationForMode(mode));
  };

  const switchMode = (m: Mode) => {
    setIsActive(false);
    setMode(m);
    setTimeLeft(getDurationForMode(m));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = getDurationForMode(mode);
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="rounded-3xl bg-linear-to-b from-sky-50/70 to-white dark:from-sky-950/20 dark:to-stone-900 p-6 border border-sky-200/60 dark:border-sky-900/40 shadow-xs flex flex-col items-center text-center">
      {/* Mode Selector Tabs */}
      <div className="flex p-1 rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-800 mb-6">
        <button
          onClick={() => switchMode('work')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            mode === 'work'
              ? 'bg-white dark:bg-stone-800 text-sky-600 dark:text-sky-400 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          Focus ({settings.pomodoroWorkMinutes}m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            mode === 'shortBreak'
              ? 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          Short Break ({settings.pomodoroShortBreakMinutes}m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            mode === 'longBreak'
              ? 'bg-white dark:bg-stone-800 text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          Long Break ({settings.pomodoroLongBreakMinutes}m)
        </button>
      </div>

      {/* Subject Dropdown */}
      <div className="w-full max-w-xs mb-6">
        <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">
          Studying for subject:
        </label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          <option value="general">General Focus</option>
        </select>
      </div>

      {/* Circular Clock Display */}
      <div className="relative w-52 h-52 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            className="text-stone-200/80 dark:text-stone-800"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            className={
              mode === 'work'
                ? 'text-sky-500 transition-all duration-500'
                : mode === 'shortBreak'
                ? 'text-emerald-500 transition-all duration-500'
                : 'text-purple-500 transition-all duration-500'
            }
            strokeWidth="5"
            strokeDasharray={263.89}
            strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tighter text-stone-900 dark:text-stone-100">
            {formattedTime}
          </span>
          <span className="text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-1 font-semibold">
            {mode === 'work' ? 'Deep Focus' : 'Gentle Rest'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          className={`py-3.5 px-8 rounded-2xl font-medium text-sm flex items-center gap-2 shadow-xs transition-transform active:scale-95 ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-sky-500 hover:bg-sky-600 text-white'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-white" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> Start Focus
            </>
          )}
        </button>

        <button
          onClick={() => {
            setIsActive(false);
            if (mode === 'work') {
              setMode('shortBreak');
              setTimeLeft(getDurationForMode('shortBreak'));
            } else {
              setMode('work');
              setTimeLeft(getDurationForMode('work'));
            }
          }}
          className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
          title="Skip session"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Friendly Footer Note */}
      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-5">
        Each completed focus session will automatically log to your study statistics.
      </p>
    </div>
  );
};
