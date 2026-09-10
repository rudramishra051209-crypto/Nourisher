import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerPRConfetti } from '../utils/confetti';
import { 
  Percent, 
  Ruler, 
  HelpCircle, 
  Activity, 
  Sparkles, 
  ChevronRight, 
  Info, 
  Scale, 
  Target,
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Sex, UserProfile } from '../types';

interface BodyFatCalculatorProps {
  initialSex?: Sex | '';
  initialHeight?: string;
  initialWeight?: string;
  initialAge?: string;
}

export const BodyFatCalculator: React.FC<BodyFatCalculatorProps> = ({
  initialSex,
  initialHeight,
  initialWeight,
  initialAge,
}) => {
  const [method, setMethod] = useState<'navy' | 'bmi'>('navy');
  const [sex, setSex] = useState<Sex | null>(initialSex === 'Female' ? 'Female' : 'Male');
  const [height, setHeight] = useState<string>(initialHeight || '');
  const [weight, setWeight] = useState<string>(initialWeight || '');
  const [age, setAge] = useState<string>(initialAge || '');

  // Circumferences in cm (U.S. Navy Method) - Empty by default
  const [neck, setNeck] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [hip, setHip] = useState<string>(''); // Required for females

  // Target body fat slider for target weight projection
  const [targetBf, setTargetBf] = useState<number>(sex === 'Male' ? 12 : 20);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Auto-load from saved athletic profile or stored body fat data if available
  useEffect(() => {
    try {
      const rawProfile = localStorage.getItem('nourish_profile_v1_merged');
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile);
        if (parsed.height && !height) setHeight(parsed.height);
        if (parsed.weight && !weight) setWeight(parsed.weight);
        if (parsed.age && !age) setAge(parsed.age);
      }
      const savedBf = localStorage.getItem('nourish_bodyfat_measurements');
      if (savedBf) {
        const parsedBf = JSON.parse(savedBf);
        if (parsedBf.neck) setNeck(parsedBf.neck);
        if (parsedBf.waist) setWaist(parsedBf.waist);
        if (parsedBf.hip) setHip(parsedBf.hip);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync with initial props when they change
  useEffect(() => {
    if (initialSex) setSex(initialSex);
    if (initialHeight) setHeight(initialHeight);
    if (initialWeight) setWeight(initialWeight);
    if (initialAge) setAge(initialAge);
  }, [initialSex, initialHeight, initialWeight, initialAge]);

  // Adjust default target BF when sex toggles
  const handleSexChange = (newSex: Sex) => {
    if (sex === newSex) {
      setSex(null);
    } else {
      setSex(newSex);
      if (newSex === 'Male' && targetBf > 22) setTargetBf(12);
      if (newSex === 'Female' && targetBf < 16) setTargetBf(20);
    }
  };

  // Helper to persist circumferences to localStorage
  const saveBfMeasurements = (updated: { neck: string; waist: string; hip: string }) => {
    try {
      localStorage.setItem('nourish_bodyfat_measurements', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNeckChange = (val: string) => {
    setNeck(val);
    saveBfMeasurements({ neck: val, waist, hip });
  };

  const handleWaistChange = (val: string) => {
    setWaist(val);
    saveBfMeasurements({ neck, waist: val, hip });
  };

  const handleHipChange = (val: string) => {
    setHip(val);
    saveBfMeasurements({ neck, waist, hip: val });
  };

  // Pre-load from saved profile if available
  const handleSyncFromProfile = () => {
    try {
      const raw = localStorage.getItem('nourish_profile_v1_merged');
      if (raw) {
        const parsed: UserProfile = JSON.parse(raw);
        if (parsed.height) setHeight(parsed.height);
        if (parsed.weight) setWeight(parsed.weight);
        if (parsed.age) setAge(parsed.age);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- CALCULATION LOGIC ---
  const numHeight = parseFloat(height) || 0;
  const numWeight = parseFloat(weight) || 0;
  const numAge = parseFloat(age) || 25;
  const numNeck = parseFloat(neck) || 0;
  const numWaist = parseFloat(waist) || 0;
  const numHip = parseFloat(hip) || 0;

  let bodyFatPercentage: number | null = null;

  if (method === 'navy' && sex) {
    if (sex === 'Male') {
      if (numHeight > 50 && numWaist > numNeck && numNeck > 10) {
        // U.S. Navy Formula for Men (Metric):
        // 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
        const logWaistNeck = Math.log10(numWaist - numNeck);
        const logHeight = Math.log10(numHeight);
        const denom = 1.0324 - (0.19077 * logWaistNeck) + (0.15456 * logHeight);
        if (denom > 0) {
          const calculated = (495 / denom) - 450;
          bodyFatPercentage = Math.min(Math.max(calculated, 3), 60);
        }
      }
    } else if (sex === 'Female') {
      if (numHeight > 50 && (numWaist + numHip) > numNeck && numNeck > 10) {
        // U.S. Navy Formula for Women (Metric):
        // 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
        const logSum = Math.log10(numWaist + numHip - numNeck);
        const logHeight = Math.log10(numHeight);
        const denom = 1.29579 - (0.35004 * logSum) + (0.22100 * logHeight);
        if (denom > 0) {
          const calculated = (495 / denom) - 450;
          bodyFatPercentage = Math.min(Math.max(calculated, 10), 65);
        }
      }
    }
  } else if (method === 'bmi' && sex) {
    // Deurenberg Adult Body Fat Formula (BMI Based):
    // BF% = (1.20 * BMI) + (0.23 * Age) - (10.8 * sexFactor) - 5.4 (sexFactor: 1 for Men, 0 for Women)
    if (numHeight > 50 && numWeight > 20) {
      const heightInMeters = numHeight / 100;
      const bmi = numWeight / (heightInMeters * heightInMeters);
      const sexFactor = sex === 'Male' ? 1 : 0;
      const calculated = (1.20 * bmi) + (0.23 * numAge) - (10.8 * sexFactor) - 5.4;
      bodyFatPercentage = Math.min(Math.max(calculated, sex === 'Male' ? 4 : 10), 60);
    }
  }

  // --- DERIVED METRICS ---
  let fatMass = 0;
  let leanMass = 0;
  let targetWeight = 0;
  let weightDelta = 0;

  if (bodyFatPercentage !== null && numWeight > 0) {
    fatMass = (numWeight * bodyFatPercentage) / 100;
    leanMass = numWeight - fatMass;
    
    // Target Weight Formula: LBM / (1 - targetBF/100)
    if (targetBf > 0 && targetBf < 100) {
      targetWeight = leanMass / (1 - targetBf / 100);
      weightDelta = numWeight - targetWeight;
    }
  }

  // Classification Categories
  const getCategory = (bf: number, isMale: boolean) => {
    if (isMale) {
      if (bf < 6) return { label: 'Essential Fat (Critical)', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
      if (bf <= 13) return { label: 'Athletic / Shredded', color: 'text-emerald-500 dark:text-[#CCFF00]', bg: 'bg-emerald-500/10 dark:bg-[#CCFF00]/10 border-emerald-500/30 dark:border-[#CCFF00]/30' };
      if (bf <= 17) return { label: 'Fitness / Lean', color: 'text-cyan-500 dark:text-[#00F0FF]', bg: 'bg-cyan-500/10 dark:bg-[#00F0FF]/10 border-cyan-500/30 dark:border-[#00F0FF]/30' };
      if (bf <= 24) return { label: 'Average / Healthy', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' };
      return { label: 'Above Average / High', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30' };
    } else {
      if (bf < 14) return { label: 'Essential Fat (Critical)', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
      if (bf <= 20) return { label: 'Athletic / Shredded', color: 'text-emerald-500 dark:text-[#CCFF00]', bg: 'bg-emerald-500/10 dark:bg-[#CCFF00]/10 border-emerald-500/30 dark:border-[#CCFF00]/30' };
      if (bf <= 24) return { label: 'Fitness / Lean', color: 'text-cyan-500 dark:text-[#00F0FF]', bg: 'bg-cyan-500/10 dark:bg-[#00F0FF]/10 border-cyan-500/30 dark:border-[#00F0FF]/30' };
      if (bf <= 31) return { label: 'Average / Healthy', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' };
      return { label: 'Above Average / High', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30' };
    }
  };

  const category = bodyFatPercentage !== null ? getCategory(bodyFatPercentage, sex === 'Male') : null;

  return (
    <section 
      id="bodyFat" 
      className="bg-white dark:bg-[#10141D] border border-slate-200/90 dark:border-[#1E2638] rounded-3xl p-6 sm:p-9 my-8 max-w-4xl mx-auto shadow-xl dark:shadow-2xl transition-all relative"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#CCFF00]/10 border border-emerald-200/80 dark:border-[#CCFF00]/25 text-emerald-800 dark:text-[#CCFF00] text-[10px] font-['Outfit'] font-black tracking-[0.2em] uppercase mb-2">
            <Percent className="w-3.5 h-3.5" />
            <span>ATHLETIC BODY COMPOSITION</span>
          </div>
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight uppercase">
            Body Fat % Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
            Calculate your body fat percentage, lean mass, and target goal weight using precision biometric modeling.
          </p>
        </div>

        {/* Sync button */}
        <button
          type="button"
          onClick={handleSyncFromProfile}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141A26] dark:hover:bg-[#1E2638] text-slate-700 dark:text-[#CBD5E1] text-xs font-mono font-medium border border-slate-200 dark:border-[#263147] transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#CCFF00]" />
          <span>Sync Biometrics</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] mb-6">
        <button
          type="button"
          onClick={() => setMethod('navy')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-['Outfit'] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            method === 'navy'
              ? 'bg-white dark:bg-[#172030] text-slate-950 dark:text-[#CCFF00] shadow-sm border border-slate-200/60 dark:border-[#2B3B59]'
              : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>U.S. Navy Method (Circumferences – High Precision)</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod('bmi')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-['Outfit'] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            method === 'bmi'
              ? 'bg-white dark:bg-[#172030] text-slate-950 dark:text-[#CCFF00] shadow-sm border border-slate-200/60 dark:border-[#2B3B59]'
              : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Biometric / BMI Estimate (Quick – No Tape)</span>
        </button>
      </div>

      {/* Main Grid: Inputs + Realtime Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sex Toggle */}
          <div>
            <label className="block text-xs font-['Outfit'] font-bold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
              Biological Sex
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSexChange('Male')}
                className={`py-2 px-3 rounded-xl text-xs font-['Outfit'] font-bold uppercase tracking-wider border transition cursor-pointer ${
                  sex === 'Male'
                    ? 'bg-slate-950 text-[#CCFF00] border-slate-950 dark:bg-[#CCFF00] dark:text-[#090C12] dark:border-[#CCFF00]'
                    : 'bg-slate-50 dark:bg-[#0B0E15] text-slate-700 dark:text-[#CBD5E1] border-slate-200 dark:border-[#1E2638] hover:bg-slate-100 dark:hover:bg-[#141A26]'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => handleSexChange('Female')}
                className={`py-2 px-3 rounded-xl text-xs font-['Outfit'] font-bold uppercase tracking-wider border transition cursor-pointer ${
                  sex === 'Female'
                    ? 'bg-slate-950 text-[#CCFF00] border-slate-950 dark:bg-[#CCFF00] dark:text-[#090C12] dark:border-[#CCFF00]'
                    : 'bg-slate-50 dark:bg-[#0B0E15] text-slate-700 dark:text-[#CBD5E1] border-slate-200 dark:border-[#1E2638] hover:bg-slate-100 dark:hover:bg-[#141A26]'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Standard Biometrics Row: Height & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bfHeight" className="block text-xs font-['Outfit'] font-bold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
                Height (cm)
              </label>
              <input
                id="bfHeight"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 178"
                className="w-full bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3.5 py-2 text-sm text-slate-950 dark:text-white font-mono outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="bfWeight" className="block text-xs font-['Outfit'] font-bold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
                Weight (kg)
              </label>
              <input
                id="bfWeight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 75"
                className="w-full bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3.5 py-2 text-sm text-slate-950 dark:text-white font-mono outline-none transition"
              />
            </div>
          </div>

          {/* Mode specific inputs */}
          {method === 'navy' ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-['Outfit'] font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-emerald-600 dark:text-[#CCFF00]" />
                  Tape Measurements (cm)
                </span>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-[11px] font-mono text-emerald-700 dark:text-[#CCFF00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showGuide ? 'Hide guide' : 'Measurement guide'}</span>
                </button>
              </div>

              {/* Tape measurement inputs */}
              <div className={`grid ${sex === 'Female' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                <div>
                  <label htmlFor="bfNeck" className="block text-[11px] font-['Outfit'] font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8] mb-1">
                    Neck (cm)
                  </label>
                  <input
                    id="bfNeck"
                    type="number"
                    value={neck}
                    onChange={(e) => handleNeckChange(e.target.value)}
                    placeholder="e.g. 38"
                    className="w-full bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3 py-2 text-sm text-slate-950 dark:text-white font-mono outline-none transition"
                  />
                  <span className="text-[9px] text-slate-500 dark:text-[#64748B] block mt-0.5">Below larynx</span>
                </div>
                <div>
                  <label htmlFor="bfWaist" className="block text-[11px] font-['Outfit'] font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8] mb-1">
                    Waist (cm)
                  </label>
                  <input
                    id="bfWaist"
                    type="number"
                    value={waist}
                    onChange={(e) => handleWaistChange(e.target.value)}
                    placeholder={sex === 'Male' ? 'e.g. 82' : 'e.g. 70'}
                    className="w-full bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3 py-2 text-sm text-slate-950 dark:text-white font-mono outline-none transition"
                  />
                  <span className="text-[9px] text-slate-500 dark:text-[#64748B] block mt-0.5">
                    {sex === 'Male' ? 'At navel level' : 'Narrowest point'}
                  </span>
                </div>
                {sex === 'Female' && (
                  <div>
                    <label htmlFor="bfHip" className="block text-[11px] font-['Outfit'] font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8] mb-1">
                      Hips (cm)
                    </label>
                    <input
                      id="bfHip"
                      type="number"
                      value={hip}
                      onChange={(e) => handleHipChange(e.target.value)}
                      placeholder="e.g. 96"
                      className="w-full bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3 py-2 text-sm text-slate-950 dark:text-white font-mono outline-none transition"
                    />
                    <span className="text-[9px] text-slate-500 dark:text-[#64748B] block mt-0.5">Widest point</span>
                  </div>
                )}
              </div>

              {/* Expandable Measurement Guide with smooth unfolding */}
              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-[#0B1522] border border-emerald-200 dark:border-[#1E3048] text-xs text-slate-700 dark:text-[#94A3B8] space-y-1.5">
                      <div className="font-['Outfit'] font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-[#CCFF00]" />
                        How to measure accurately:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                        <li><strong>Neck:</strong> Measure right below the Adam's apple (larynx) without pulling the tape tight.</li>
                        <li><strong>Waist (Men):</strong> Measure horizontally at the level of the belly button (navel) after normal exhalation.</li>
                        <li><strong>Waist (Women):</strong> Measure at the narrowest circumference between the ribs and navel.</li>
                        {sex === 'Female' && <li><strong>Hips (Women):</strong> Measure horizontally across the widest protrusion of the buttocks.</li>}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div>
              <label htmlFor="bfAge" className="block text-xs font-['Outfit'] font-bold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
                Age (years)
              </label>
              <input
                id="bfAge"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-slate-50 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3.5 py-2 text-sm text-slate-950 dark:text-white font-mono outline-none transition"
              />
              <span className="text-[10px] text-slate-500 dark:text-[#64748B] mt-1 block">
                Calculates body density and age-calibrated fat mass using the clinical Deurenberg formula.
              </span>
            </div>
          )}
        </div>

        {/* Right Output & Analytics Column */}
        <div className="lg:col-span-5 bg-slate-50/90 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#182030] mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-[#64748B]">
                ESTIMATED BODY FAT
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-[#1A2333] text-emerald-800 dark:text-[#CCFF00] text-[10px] font-mono font-bold">
                {method === 'navy' ? 'U.S. Navy Method' : 'BMI Equation'}
              </span>
            </div>

            {/* Big Readout */}
            {bodyFatPercentage !== null ? (
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-['Outfit'] text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
                    {bodyFatPercentage.toFixed(1)}
                  </span>
                  <span className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-[#CCFF00]">
                    %
                  </span>
                </div>

                {/* Category Pill */}
                {category && (
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-['Outfit'] font-bold uppercase tracking-wider mb-4 ${category.bg} ${category.color}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{category.label}</span>
                  </div>
                )}

                {/* Body Composition Breakdown */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-200 dark:border-[#182030] mb-4">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121824] border border-slate-200/80 dark:border-[#1E2638]">
                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#64748B] block">
                      Lean Mass (LBM)
                    </span>
                    <span className="font-['Outfit'] text-base font-bold text-slate-950 dark:text-white">
                      {leanMass.toFixed(1)} kg
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121824] border border-slate-200/80 dark:border-[#1E2638]">
                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#64748B] block">
                      Fat Mass
                    </span>
                    <span className="font-['Outfit'] text-base font-bold text-amber-600 dark:text-[#FF6B00]">
                      {fatMass.toFixed(1)} kg
                    </span>
                  </div>
                </div>

                {/* Visual Spectrum Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                    <span>Essential ({sex === 'Male' ? '5%' : '12%'})</span>
                    <span>Athletic ({sex === 'Male' ? '12%' : '18%'})</span>
                    <span>High ({sex === 'Male' ? '25%+' : '32%+'})</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-[#1A2333] overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 transition-all duration-300"
                      style={{ 
                        width: `${Math.min(Math.max((bodyFatPercentage / (sex === 'Male' ? 35 : 45)) * 100, 5), 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-[#64748B]">
                Enter your valid measurements to generate your body composition analysis.
              </div>
            )}
          </div>

          {/* Target Weight Estimator Box */}
          {bodyFatPercentage !== null && (
            <div className="pt-3 border-t border-slate-200 dark:border-[#182030] mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-[#94A3B8] uppercase flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-[#CCFF00]" />
                  Goal Target: {targetBf}% Body Fat
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                  {weightDelta > 0 ? `Lose ${(weightDelta).toFixed(1)} kg fat` : `Muscle target`}
                </span>
              </div>
              <input
                type="range"
                min={sex === 'Male' ? 7 : 14}
                max={sex === 'Male' ? 25 : 35}
                value={targetBf}
                onChange={(e) => setTargetBf(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 dark:accent-[#CCFF00] h-1.5 bg-slate-200 dark:bg-[#1E2638] rounded-lg cursor-pointer mb-2"
              />
              <div className="flex items-center justify-between text-xs font-['Outfit'] font-bold text-slate-900 dark:text-white bg-white dark:bg-[#121824] px-3 py-2 rounded-xl border border-slate-200/80 dark:border-[#1E2638]">
                <span className="text-slate-500 dark:text-[#94A3B8] font-normal text-[11px]">
                  Target Weight at {targetBf}% BF:
                </span>
                <span className="text-emerald-700 dark:text-[#CCFF00] font-mono">
                  {targetWeight.toFixed(1)} kg
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
