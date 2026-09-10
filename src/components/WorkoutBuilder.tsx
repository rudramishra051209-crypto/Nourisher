import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  WorkoutGoal, 
  WorkoutDays, 
  WorkoutPlace, 
  WorkoutStyle, 
  WorkoutDayPlan 
} from '../types';
import { generateWorkoutSplit } from '../data/workoutData';
import { triggerWorkoutDoneConfetti, triggerPRConfetti } from '../utils/confetti';
import { 
  Dumbbell, 
  Home, 
  Check, 
  AlertCircle, 
  Zap, 
  Copy, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const WorkoutBuilder: React.FC = () => {
  const [goal, setGoal] = useState<WorkoutGoal | null>(null);
  const [days, setDays] = useState<WorkoutDays | null>(null);
  const [place, setPlace] = useState<WorkoutPlace | null>(null);
  const [style, setStyle] = useState<WorkoutStyle | null>(null);
  const [splitResult, setSplitResult] = useState<{
    splitTitle: string;
    days: WorkoutDayPlan[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Set-completion tracker for gym workouts (DayIndex-ExIndex -> boolean)
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  const toggleExerciseComplete = (dayIdx: number, exIdx: number) => {
    const key = `${dayIdx}-${exIdx}`;
    const nextVal = !completedExercises[key];
    setCompletedExercises((prev) => {
      const updated = { ...prev, [key]: nextVal };
      if (nextVal && splitResult) {
        const currentDay = splitResult.days[dayIdx];
        if (currentDay) {
          const allCompleted = currentDay.exercises.every((_, idx) => (idx === exIdx ? true : updated[`${dayIdx}-${idx}`]));
          if (allCompleted) {
            triggerPRConfetti();
          }
        }
      }
      return updated;
    });
  };

  const handleCreateSplit = () => {
    if (!goal || !days || !place || !style) {
      setErrorMsg('Please select an option in each of the 4 workout sections above.');
      return;
    }
    setErrorMsg(null);
    const result = generateWorkoutSplit(days, place, style);
    setSplitResult(result);
    setCompletedExercises({});
    triggerWorkoutDoneConfetti();
    setTimeout(() => {
      const el = document.getElementById('workoutResults');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCopySplit = () => {
    if (!splitResult) return;
    const text = `NOURISH PRO ATHLETIC SPLIT\nProgram: ${splitResult.splitTitle}\nEnvironment: ${place?.toUpperCase()} | Setup: ${style === 'shoulderLegs' ? 'Shoulders+Legs' : 'Standard PPL'}\n\n` +
      splitResult.days.map((d, dIdx) => 
        `[${d.title.toUpperCase()}]\n` +
        d.exercises.map((ex, exIdx) => `  ${exIdx + 1}. ${ex.name} – ${ex.setsReps}`).join('\n')
      ).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }).catch(() => {});
  };

  const goalOptions: { value: WorkoutGoal; title: string; subtitle: string; icon: string }[] = [
    { value: 'strength', title: 'Power & Strength', subtitle: 'Heavy compound progression', icon: '⚡' },
    { value: 'muscle', title: 'Muscle Hypertrophy', subtitle: 'Volume & progressive overload', icon: '🏋️' },
    { value: 'fitness', title: 'Athletic Conditioning', subtitle: 'Work capacity & endurance', icon: '🏃' },
    { value: 'busy', title: 'High-Efficiency / Busy', subtitle: 'Maximum stimulus per minute', icon: '⏱️' },
  ];

  const dayOptions: { value: WorkoutDays; title: string; subtitle: string }[] = [
    { value: '2', title: '2 Days / Week', subtitle: 'Full Body A / B' },
    { value: '3', title: '3 Days / Week', subtitle: 'Full Body Classic' },
    { value: '4', title: '4 Days / Week', subtitle: 'Upper / Lower Split' },
    { value: '5', title: '5 Days / Week', subtitle: 'Push / Pull / Legs / Upper' },
    { value: '6', title: '6 Days / Week', subtitle: 'Push Pull Legs × 2' },
  ];

  const placeOptions: { value: WorkoutPlace; title: string; subtitle: string; icon: any }[] = [
    { value: 'gym', title: 'Commercial Gym', subtitle: 'Barbells, cables & machines', icon: Dumbbell },
    { value: 'home', title: 'Home / Minimal Equipment', subtitle: 'Dumbbells & bodyweight', icon: Home },
  ];

  const styleOptions: { value: WorkoutStyle; title: string; subtitle: string }[] = [
    {
      value: 'standard',
      title: 'Standard Push / Pull / Legs',
      subtitle: 'Shoulders are trained alongside Chest on Push days.',
    },
    {
      value: 'shoulderLegs',
      title: 'Shoulders + Legs Synergy',
      subtitle: 'Shoulder volume moves to Legs for fresher pressing power.',
    },
  ];

  return (
    <section id="workoutBuilder" className="bg-white dark:bg-[#10141D] border border-slate-200/90 dark:border-[#1E2638] rounded-3xl p-6 sm:p-9 my-8 max-w-4xl mx-auto shadow-xl dark:shadow-2xl transition-all relative">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#CCFF00]/10 border border-emerald-200/80 dark:border-[#CCFF00]/25 text-emerald-800 dark:text-[#CCFF00] text-[10px] font-['Outfit'] font-black tracking-[0.2em] uppercase mb-2">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>PHASE 2 – TRAINING ARCHITECTURE</span>
        </div>
        <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight uppercase">
          Build Your Training Split
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
          Generate an exercise-by-exercise workout program with volume targets, rest protocols, and interactive completion tracking.
        </p>
      </div>

      {/* 1. Goal */}
      <div className="mb-8" id="wsGoal">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          1. Training Objective
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {goalOptions.map((item) => {
            const isSelected = goal === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setGoal(isSelected ? null : item.value)}
                className={`tap p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer min-h-[84px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-[#CCFF00]/15 text-slate-950 dark:text-white border-emerald-600 dark:border-[#CCFF00] shadow-[0_0_15px_rgba(16,185,129,0.18)] dark:shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-emerald-600 dark:ring-[#CCFF00]'
                    : 'bg-slate-50/80 dark:bg-[#0B0E15] text-slate-800 dark:text-[#F1F5F9] border-slate-200 dark:border-[#1E2638] hover:border-slate-300 dark:hover:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#141A26]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Outfit'] font-bold text-sm flex items-center gap-1.5">
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </span>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 dark:bg-[#CCFF00] text-white dark:text-[#090C12] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[#334155]" />
                  )}
                </div>
                <span className={`text-[11px] mt-1 ${isSelected ? 'text-emerald-700 dark:text-[#CCFF00]' : 'text-slate-500 dark:text-[#64748B]'}`}>
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Days per week */}
      <div className="mb-8" id="wsDays">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          2. Weekly Training Frequency
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {dayOptions.map((item) => {
            const isSelected = days === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setDays(isSelected ? null : item.value)}
                className={`tap p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer min-h-[82px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-[#CCFF00]/15 text-slate-950 dark:text-white border-emerald-600 dark:border-[#CCFF00] shadow-[0_0_15px_rgba(16,185,129,0.18)] dark:shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-emerald-600 dark:ring-[#CCFF00]'
                    : 'bg-slate-50/80 dark:bg-[#0B0E15] text-slate-800 dark:text-[#F1F5F9] border-slate-200 dark:border-[#1E2638] hover:border-slate-300 dark:hover:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#141A26]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Outfit'] font-bold text-sm">{item.title}</span>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 dark:bg-[#CCFF00] text-white dark:text-[#090C12] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[#334155]" />
                  )}
                </div>
                <span className={`text-[11px] mt-1 ${isSelected ? 'text-emerald-700 dark:text-[#CCFF00]' : 'text-slate-500 dark:text-[#64748B]'}`}>
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Training setup */}
      <div className="mb-8" id="wsPlace">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          3. Training Facility / Equipment Setup
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {placeOptions.map((item) => {
            const isSelected = place === item.value;
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setPlace(isSelected ? null : item.value)}
                className={`tap p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer min-h-[82px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-[#CCFF00]/15 text-slate-950 dark:text-white border-emerald-600 dark:border-[#CCFF00] shadow-[0_0_15px_rgba(16,185,129,0.18)] dark:shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-emerald-600 dark:ring-[#CCFF00]'
                    : 'bg-slate-50/80 dark:bg-[#0B0E15] text-slate-800 dark:text-[#F1F5F9] border-slate-200 dark:border-[#1E2638] hover:border-slate-300 dark:hover:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#141A26]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Outfit'] font-bold text-sm flex items-center gap-2">
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
                    <span>{item.title}</span>
                  </span>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 dark:bg-[#CCFF00] text-white dark:text-[#090C12] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[#334155]" />
                  )}
                </div>
                <span className={`text-[11px] mt-1 ${isSelected ? 'text-emerald-700 dark:text-[#CCFF00]' : 'text-slate-500 dark:text-[#64748B]'}`}>
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Split style */}
      <div className="mb-8" id="wsStyle">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          4. Split Style / Shoulder Bias
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {styleOptions.map((item) => {
            const isSelected = style === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setStyle(isSelected ? null : item.value)}
                className={`tap p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer min-h-[82px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-[#CCFF00]/15 text-slate-950 dark:text-white border-emerald-600 dark:border-[#CCFF00] shadow-[0_0_15px_rgba(16,185,129,0.18)] dark:shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-emerald-600 dark:ring-[#CCFF00]'
                    : 'bg-slate-50/80 dark:bg-[#0B0E15] text-slate-800 dark:text-[#F1F5F9] border-slate-200 dark:border-[#1E2638] hover:border-slate-300 dark:hover:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#141A26]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Outfit'] font-bold text-sm">{item.title}</span>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 dark:bg-[#CCFF00] text-white dark:text-[#090C12] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[#334155]" />
                  )}
                </div>
                <span className={`text-[11px] mt-1 ${isSelected ? 'text-emerald-700 dark:text-[#CCFF00]' : 'text-slate-500 dark:text-[#64748B]'}`}>
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-[#2D1212] border border-red-200 dark:border-[#EF4444]/40 text-red-800 dark:text-[#FCA5A5] text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-[#EF4444]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Create Button */}
      <motion.button
        id="makeWorkout"
        type="button"
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCreateSplit}
        className="w-full py-4 px-6 rounded-2xl bg-slate-950 dark:bg-[#CCFF00] hover:bg-slate-900 dark:hover:bg-[#BAE600] text-[#CCFF00] dark:text-[#090C12] font-['Outfit'] font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_24px_rgba(15,23,42,0.25)] dark:shadow-[0_0_30px_rgba(204,255,0,0.25)] cursor-pointer"
      >
        <Dumbbell className="w-4 h-4 stroke-[3]" />
        <span>Generate Athletic Workout Split</span>
        <ArrowRight className="w-4 h-4 stroke-[3]" />
      </motion.button>

      {/* Split Result Output with smooth unfolding */}
      <AnimatePresence>
        {splitResult && (
          <motion.div
            id="workoutResults"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-[#1E2638]">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block">
                    VERIFIED ATHLETIC PROGRAM
                  </span>
                  <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase mt-0.5">
                    {splitResult.splitTitle}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono mt-0.5 block">
                    {place?.toUpperCase()} SETUP • {style === 'shoulderLegs' ? 'SHOULDERS + LEGS SYNERGY' : 'STANDARD PUSH/PULL/LEGS'}
                  </span>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopySplit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#171E2D] dark:hover:bg-[#20293D] text-slate-800 dark:text-white border border-slate-200 dark:border-[#263147] hover:border-emerald-500 dark:hover:border-[#CCFF00] text-xs font-['Outfit'] font-bold uppercase tracking-wider transition cursor-pointer self-start sm:self-auto shadow-sm"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
                      <span className="text-emerald-700 dark:text-[#CCFF00]">Copied Split!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500 dark:text-[#94A3B8]" />
                      <span>Copy Split</span>
                    </>
                  )}
                </motion.button>
              </div>

              <div className="space-y-6">
                {splitResult.days.map((day, dIdx) => {
                  // Calculate completion for this day
                  const totalInDay = day.exercises.length;
                  let completedInDay = 0;
                  for (let i = 0; i < totalInDay; i++) {
                    if (completedExercises[`${dIdx}-${i}`]) completedInDay++;
                  }
                  const dayPct = Math.round((completedInDay / totalInDay) * 100);
                  const isDayFullyDone = completedInDay === totalInDay && totalInDay > 0;

                  return (
                    <motion.div
                      key={dIdx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dIdx * 0.08 }}
                      className={`border rounded-2xl p-5 sm:p-6 shadow-sm transition-all ${
                        isDayFullyDone
                          ? 'bg-emerald-50/70 dark:bg-[#CCFF00]/5 border-emerald-500 dark:border-[#CCFF00]/50 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                          : 'bg-slate-50/90 dark:bg-[#0B0E15] border-slate-200 dark:border-[#1E2638]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-200 dark:border-[#1A2232] pb-3 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-['Outfit'] text-lg sm:text-xl font-black text-slate-950 dark:text-white uppercase">
                              {day.title}
                            </h4>
                            {isDayFullyDone && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 dark:bg-[#CCFF00] text-white dark:text-[#090C12] text-[10px] font-mono font-black uppercase">
                                COMPLETED
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-[#64748B] font-mono">
                            6 compound & isolation movements
                          </span>
                        </div>

                        {/* Progress tracking indicator */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 sm:w-32 bg-slate-200 dark:bg-[#182030] h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 dark:bg-[#CCFF00] h-full transition-all duration-300"
                              style={{ width: `${dayPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-[#CCFF00]">
                            {completedInDay}/{totalInDay} Done
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {day.exercises.map((item, exIdx) => {
                          const isDone = !!completedExercises[`${dIdx}-${exIdx}`];

                          return (
                            <motion.div
                              key={exIdx}
                              whileHover={{ scale: 1.015 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleExerciseComplete(dIdx, exIdx)}
                              className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between cursor-pointer select-none shadow-sm dark:shadow-none ${
                                isDone
                                  ? 'bg-emerald-50 dark:bg-[#CCFF00]/10 border-emerald-500/50 dark:border-[#CCFF00]/60 text-slate-900 dark:text-white'
                                  : 'bg-white dark:bg-[#121722] border-slate-200 dark:border-[#20293D] hover:border-slate-300 dark:hover:border-[#334155] text-slate-800 dark:text-[#CBD5E1]'
                              }`}
                            >
                              <div className="pr-2 flex items-center gap-2.5">
                                <motion.div 
                                  animate={{ scale: isDone ? [1, 1.25, 1] : 1 }}
                                  transition={{ duration: 0.2 }}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                                    isDone
                                      ? 'bg-emerald-600 dark:bg-[#CCFF00] border-emerald-600 dark:border-[#CCFF00] text-white dark:text-[#090C12]'
                                      : 'border-slate-300 dark:border-[#334155] text-transparent'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </motion.div>
                                <div>
                                  <strong className={`block text-xs sm:text-sm font-['Outfit'] font-bold ${
                                    isDone ? 'text-emerald-700 dark:text-[#CCFF00] line-through' : 'text-slate-950 dark:text-white'
                                  }`}>
                                    {item.name}
                                  </strong>
                                  <span className="block text-[10px] font-mono text-slate-500 dark:text-[#64748B] uppercase tracking-wider mt-0.5">
                                    Hypertrophy & Strength • RPE 8
                                  </span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1A2333] border border-slate-200 dark:border-[#253249] text-emerald-800 dark:text-[#CCFF00] text-[11px] font-mono font-bold tracking-tight shrink-0">
                                {item.setsReps}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
