import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHydrationConfetti, triggerPRConfetti } from '../utils/confetti';
import { 
  Timer, 
  Dumbbell, 
  Droplets, 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Plus, 
  Minus,
  Sparkles,
  Award,
  Zap
} from 'lucide-react';

interface GymToolsProps {
  userWeight?: string;
  userGoal?: string;
}

export const GymTools: React.FC<GymToolsProps> = ({ userWeight, userGoal }) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'onerm' | 'hydration'>('timer');

  // --- REST TIMER STATE ---
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [initialSeconds, setInitialSeconds] = useState<number>(60);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isRunning) {
      setIsRunning(false);
      triggerAlarmSound();
      triggerPRConfetti();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerSeconds]);

  const triggerAlarmSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Triple beep workout chime
      [0, 0.18, 0.36].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.12);
      });
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  };

  const handleSelectPreset = (seconds: number) => {
    setIsRunning(false);
    if (selectedPreset === seconds) {
      setSelectedPreset(null);
    } else {
      setSelectedPreset(seconds);
      setInitialSeconds(seconds);
      setTimerSeconds(seconds);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialSeconds > 0 
    ? Math.round(((initialSeconds - timerSeconds) / initialSeconds) * 100) 
    : 0;

  // --- 1-REP MAX (1RM) STATE ---
  const [liftWeight, setLiftWeight] = useState<string>(() => {
    try {
      return localStorage.getItem('nourish_1rm_weight') || '';
    } catch {
      return '';
    }
  });
  const [liftReps, setLiftReps] = useState<string>(() => {
    try {
      return localStorage.getItem('nourish_1rm_reps') || '';
    } catch {
      return '';
    }
  });

  const handleLiftWeightChange = (val: string) => {
    setLiftWeight(val);
    try {
      if (val) localStorage.setItem('nourish_1rm_weight', val);
      else localStorage.removeItem('nourish_1rm_weight');
    } catch (e) {}
  };

  const handleLiftRepsChange = (val: string) => {
    setLiftReps(val);
    try {
      if (val) localStorage.setItem('nourish_1rm_reps', val);
      else localStorage.removeItem('nourish_1rm_reps');
    } catch (e) {}
  };

  const numLiftWeight = parseFloat(liftWeight) || 0;
  const numLiftReps = parseInt(liftReps, 10) || 0;

  const calculateOneRepMax = () => {
    if (numLiftWeight <= 0 || numLiftReps <= 0) return 0;
    if (numLiftReps === 1) return numLiftWeight;
    // Epley Formula: 1RM = Weight * (1 + Reps / 30)
    return Math.round(numLiftWeight * (1 + numLiftReps / 30));
  };

  const oneRepMax = calculateOneRepMax();

  // --- HYDRATION STATE ---
  const parsedWeight = parseFloat(userWeight || '') || 0;
  // Athletic hydration formula: ~35-40ml/kg + 500-750ml workout surplus
  const dailyTargetLiters = parsedWeight > 0 ? Number(((parsedWeight * 38 + 600) / 1000).toFixed(1)) : 2.8;
  const totalGlassesTarget = Math.round((dailyTargetLiters * 1000) / 250); // 250ml per glass
  
  const [glassesDrank, setGlassesDrank] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nourish_hydration_log');
      if (saved !== null) return parseInt(saved, 10) || 0;
    } catch (e) {}
    return 0;
  });

  const handleUpdateGlasses = (delta: number) => {
    setGlassesDrank((prev) => {
      const next = Math.max(0, Math.min(prev + delta, totalGlassesTarget + 4));
      try {
        localStorage.setItem('nourish_hydration_log', next.toString());
      } catch (e) {}
      if (delta > 0) {
        triggerHydrationConfetti();
      }
      return next;
    });
  };

  const currentLiters = (glassesDrank * 0.25).toFixed(2);
  const hydrationPct = Math.min(100, Math.round((glassesDrank / totalGlassesTarget) * 100));

  return (
    <section 
      id="gymTools" 
      className="bg-white dark:bg-[#10141D] border border-slate-200/90 dark:border-[#1E2638] rounded-3xl p-6 sm:p-8 my-8 max-w-4xl mx-auto shadow-xl dark:shadow-2xl relative overflow-hidden transition-all"
    >
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/5 dark:bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/5 dark:bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#CCFF00]/10 border border-emerald-200/80 dark:border-[#CCFF00]/25 text-emerald-800 dark:text-[#CCFF00] text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">
            <Zap className="w-3 h-3 text-emerald-600 dark:text-[#CCFF00]" />
            GYM UTILITIES & PERFORMANCE
          </div>
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight uppercase">
            Gym Power Tools
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">
            Rest countdown between sets, 1-Rep Max percentage matrix, and athletic hydration tracking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-[#090C12] border border-slate-200 dark:border-[#1F2739] rounded-xl self-start sm:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-slate-950 text-[#CCFF00] dark:bg-[#CCFF00] dark:text-[#090C12] shadow-sm'
                : 'text-slate-600 hover:text-slate-950 dark:text-[#94A3B8] dark:hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Rest Timer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('onerm')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition cursor-pointer ${
              activeTab === 'onerm'
                ? 'bg-slate-950 text-[#CCFF00] dark:bg-[#CCFF00] dark:text-[#090C12] shadow-sm'
                : 'text-slate-600 hover:text-slate-950 dark:text-[#94A3B8] dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>1RM Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hydration')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition cursor-pointer ${
              activeTab === 'hydration'
                ? 'bg-slate-950 text-[#CCFF00] dark:bg-[#CCFF00] dark:text-[#090C12] shadow-sm'
                : 'text-slate-600 hover:text-slate-950 dark:text-[#94A3B8] dark:hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Hydration</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: REST TIMER --- */}
      {activeTab === 'timer' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/90 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] text-center shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-[#64748B] mb-2">
              REST INTERVAL
            </span>
            <div className="font-['Space_Grotesk'] font-bold text-5xl sm:text-6xl text-slate-950 dark:text-white tracking-tighter mb-4 tabular-nums">
              {formatTimer(timerSeconds)}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-[#182030] h-2 rounded-full overflow-hidden mb-6">
              <div 
                className="bg-emerald-600 dark:bg-[#CCFF00] h-full transition-all duration-300 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Play/Pause Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-['Outfit'] text-xs font-black uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-sm ${
                  isRunning 
                    ? 'bg-[#FF5E1E] text-white hover:bg-[#E04F14]' 
                    : 'bg-slate-950 text-[#CCFF00] hover:bg-slate-900 dark:bg-[#CCFF00] dark:text-[#090C12] dark:hover:bg-[#BAE600]'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Rest</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setTimerSeconds(initialSeconds);
                }}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#171E2D] dark:hover:bg-[#20293D] text-slate-600 hover:text-slate-950 dark:text-[#94A3B8] dark:hover:text-white border border-slate-200 dark:border-[#263147] transition cursor-pointer shadow-sm"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-xl border transition cursor-pointer shadow-sm ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-[#171E2D] dark:text-[#CCFF00] dark:border-[#CCFF00]/40'
                    : 'bg-white text-slate-400 border-slate-200 dark:bg-[#171E2D] dark:text-[#64748B] dark:border-[#263147]'
                }`}
                title={soundEnabled ? 'Chime sound enabled' : 'Muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-[#94A3B8] block mb-2.5">
                QUICK RECOVERY PRESETS
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { label: '30s', sec: 30, desc: 'Quick / Arms' },
                  { label: '60s', sec: 60, desc: 'Hypertrophy' },
                  { label: '90s', sec: 90, desc: 'Standard' },
                  { label: '120s', sec: 120, desc: 'Compound' },
                  { label: '180s', sec: 180, desc: 'Heavy Heavy' },
                ].map((item) => {
                  const isCur = selectedPreset === item.sec;
                  return (
                    <button
                      key={item.sec}
                      type="button"
                      onClick={() => handleSelectPreset(item.sec)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer shadow-sm ${
                        isCur
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 dark:bg-[#CCFF00]/15 dark:border-[#CCFF00] dark:text-[#CCFF00]'
                          : 'bg-white dark:bg-[#0B0E15] border-slate-200 dark:border-[#1E2638] text-slate-700 dark:text-[#CBD5E1] hover:border-slate-300 dark:hover:border-[#334155]'
                      }`}
                    >
                      <div className="font-['Space_Grotesk'] font-bold text-base leading-none mb-1 text-slate-900 dark:text-white">
                        {item.label}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-[#64748B]">
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] text-xs text-slate-600 dark:text-[#94A3B8] flex items-start gap-2.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00] shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-950 dark:text-white">Pro Tip:</strong> Rest 60–90 seconds between isolation movements (curls, lateral raises), and 2–3 minutes between heavy compound lifts (squats, bench press, deadlifts) to restore intra-muscular ATP.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: 1-REP MAX CALCULATOR --- */}
      {activeTab === 'onerm' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50/90 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] space-y-4 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-[#64748B] block">
              ENTER YOUR BEST SET
            </span>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider block mb-1.5">
                Weight Lifted (KG)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  placeholder="e.g. 70"
                  value={liftWeight}
                  onChange={(e) => handleLiftWeightChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-slate-300 dark:border-[#253046] text-slate-950 dark:text-white font-['Space_Grotesk'] font-bold text-lg focus:outline-none focus:border-emerald-600 dark:focus:border-[#CCFF00] shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider block mb-1.5">
                Reps Completed ({liftReps ? `${liftReps} reps` : 'Enter reps'})
              </label>
              <input
                type="number"
                min="1"
                max="30"
                placeholder="e.g. 8"
                value={liftReps}
                onChange={(e) => handleLiftRepsChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#141A26] border border-slate-300 dark:border-[#253046] text-slate-950 dark:text-white font-['Space_Grotesk'] font-bold text-lg focus:outline-none focus:border-emerald-600 dark:focus:border-[#CCFF00] shadow-sm mb-2"
              />
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={numLiftReps || 1}
                onChange={(e) => handleLiftRepsChange(e.target.value)}
                className="w-full accent-emerald-600 dark:accent-[#CCFF00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#64748B] font-mono mt-1">
                <span>1 Rep</span>
                <span>6 Reps</span>
                <span>12 Reps</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#1C2436] text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700 dark:text-[#CCFF00] block mb-0.5">
                ESTIMATED 1-REP MAX
              </span>
              <div className="font-['Space_Grotesk'] font-bold text-4xl text-slate-950 dark:text-white">
                {oneRepMax > 0 ? (
                  <>
                    {oneRepMax} <span className="text-sm font-sans font-normal text-slate-500 dark:text-[#94A3B8]">KG</span>
                  </>
                ) : (
                  <span className="text-2xl text-slate-400 dark:text-[#64748B]">-- KG</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#64748B] mt-1">
                {oneRepMax > 0 
                  ? 'Calculated using the standard Epley strength equation.' 
                  : 'Enter your lifted weight and reps above.'}
              </p>
            </div>
          </div>

          <div className="md:col-span-7 space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-[#94A3B8] block">
              TRAINING LOAD BREAKDOWN
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { pct: '95%', weight: oneRepMax > 0 ? Math.round(oneRepMax * 0.95) : 0, reps: '1–2 reps', zone: 'Peak Power' },
                { pct: '85%', weight: oneRepMax > 0 ? Math.round(oneRepMax * 0.85) : 0, reps: '4–6 reps', zone: 'Strength' },
                { pct: '75%', weight: oneRepMax > 0 ? Math.round(oneRepMax * 0.75) : 0, reps: '8–10 reps', zone: 'Hypertrophy' },
                { pct: '65%', weight: oneRepMax > 0 ? Math.round(oneRepMax * 0.65) : 0, reps: '12–15 reps', zone: 'Volume / Pump' },
              ].map((tier, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] text-center shadow-sm"
                >
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-[#CCFF00] block font-mono">
                    {tier.pct} 1RM
                  </span>
                  <div className="font-['Space_Grotesk'] font-bold text-xl text-slate-950 dark:text-white my-1">
                    {tier.weight > 0 ? `${tier.weight}` : '--'}{' '}
                    <span className="text-xs text-slate-500 dark:text-[#64748B] font-normal">kg</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-[#CBD5E1] block">
                    {tier.reps}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-[#64748B] block mt-0.5">
                    {tier.zone}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] text-xs text-slate-600 dark:text-[#94A3B8] shadow-sm">
              <strong className="text-slate-950 dark:text-white block mb-0.5">How to apply this in your workouts:</strong>
              Use 75% for your main working sets of 8–10 reps on compound exercises (e.g. flat bench, squats, lat pulldowns) to stimulate maximal muscle hypertrophy with clean execution.
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: HYDRATION ENGINE --- */}
      {activeTab === 'hydration' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50/90 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] text-center shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-700 dark:text-[#00F0FF] block mb-1">
              ATHLETIC HYDRATION TARGET
            </span>
            <div className="font-['Space_Grotesk'] font-bold text-4xl sm:text-5xl text-slate-950 dark:text-white mb-1">
              {currentLiters} <span className="text-base font-sans font-normal text-slate-500 dark:text-[#64748B]">/ {dailyTargetLiters} L</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-[#94A3B8] mb-4">
              {glassesDrank} of {totalGlassesTarget} glasses (250ml each)
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-[#182030] h-2.5 rounded-full overflow-hidden mb-5">
              <div 
                className="bg-cyan-500 dark:bg-[#00F0FF] h-full transition-all duration-300 rounded-full"
                style={{ width: `${hydrationPct}%` }}
              />
            </div>

            {/* Tap controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleUpdateGlasses(-1)}
                className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#171E2D] dark:hover:bg-[#20293D] text-slate-600 hover:text-slate-950 dark:text-[#94A3B8] dark:hover:text-white border border-slate-200 dark:border-[#263147] flex items-center justify-center cursor-pointer transition active:scale-95 shadow-sm"
                title="Subtract 1 glass"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleUpdateGlasses(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-[#00F0FF] dark:hover:bg-[#00D4E2] dark:text-[#090C12] font-['Outfit'] text-xs font-black uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Log +250ml</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-7 space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-[#94A3B8] block">
              HYDRATION BENEFITS FOR LIFTERS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-[#00F0FF]" />
                  <span className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Muscle Pump & Fullness</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Skeletal muscles are ~75% water. Dehydration of just 2% drops lifting power output by up to 15%.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#CCFF00]" />
                  <span className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Cramp Prevention</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Proper fluid intake maintains electrolyte transport (sodium, potassium, magnesium) preventing muscle lockup.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] text-xs text-slate-600 dark:text-[#94A3B8] flex items-center justify-between shadow-sm">
              <span>Current Status:</span>
              <span className={`font-mono font-bold text-xs ${hydrationPct >= 100 ? 'text-cyan-700 dark:text-[#00F0FF]' : 'text-emerald-700 dark:text-[#CCFF00]'}`}>
                {hydrationPct >= 100 ? 'Optimal Hydration Achieved 🏆' : `${hydrationPct}% of Daily Target`}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
