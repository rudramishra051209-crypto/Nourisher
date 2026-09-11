import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AgeGroup, 
  Sex, 
  ActivityLevel, 
  FoodStyle, 
  MainGoal, 
  EnergyGoal, 
  BudgetTier,
  EnergyCalculations,
  ExcelMappedAthlete
} from '../types';
import { calculatePersonalizedNutrition } from '../utils/nutritionEngine';
import { fetchLiveExcelAthletes } from '../utils/interactionsStorage';
import { Flame, Calculator, Check, AlertCircle, ArrowRight, Zap, Target, Gauge, User, Mail, FileSpreadsheet, Sparkles } from 'lucide-react';

interface PlanBuilderProps {
  userName: string;
  setUserName: (val: string) => void;
  userContact: string;
  setUserContact: (val: string) => void;
  userNotes: string;
  setUserNotes: (val: string) => void;
  ageGroup: AgeGroup | '';
  setAgeGroup: (val: AgeGroup | '') => void;
  exactAge: string;
  setExactAge: (val: string) => void;
  height: string;
  setHeight: (val: string) => void;
  weight: string;
  setWeight: (val: string) => void;
  sex: Sex | '';
  setSex: (val: Sex | '') => void;
  activity: ActivityLevel | '';
  setActivity: (val: ActivityLevel | '') => void;
  foodStyle: FoodStyle | '';
  setFoodStyle: (val: FoodStyle | '') => void;
  mainGoal: MainGoal | '';
  setMainGoal: (val: MainGoal | '') => void;
  energyGoal: EnergyGoal | '';
  setEnergyGoal: (val: EnergyGoal | '') => void;
  budget: BudgetTier | '';
  setBudget: (val: BudgetTier | '') => void;
  onBuildPlan: () => void;
  validationError: string | null;
}

export const PlanBuilder: React.FC<PlanBuilderProps> = ({
  userName,
  setUserName,
  userContact,
  setUserContact,
  userNotes,
  setUserNotes,
  ageGroup,
  setAgeGroup,
  exactAge,
  setExactAge,
  height,
  setHeight,
  weight,
  setWeight,
  sex,
  setSex,
  activity,
  setActivity,
  foodStyle,
  setFoodStyle,
  mainGoal,
  setMainGoal,
  energyGoal,
  setEnergyGoal,
  budget,
  setBudget,
  onBuildPlan,
  validationError,
}) => {
  const [calcFeedback, setCalcFeedback] = useState<{
    type: 'teen' | 'missing' | 'success';
    data?: EnergyCalculations;
  } | null>(null);

  const [excelAthletes, setExcelAthletes] = useState<ExcelMappedAthlete[]>([]);
  const [selectedExcelAthlete, setSelectedExcelAthlete] = useState<ExcelMappedAthlete | null>(null);

  // Live-load registered names from the Excel file on mount
  useEffect(() => {
    let isMounted = true;
    fetchLiveExcelAthletes().then((athletes) => {
      if (isMounted && athletes && athletes.length > 0) {
        setExcelAthletes(athletes);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectExcelAthlete = (athlete: ExcelMappedAthlete) => {
    setSelectedExcelAthlete(athlete);
    setUserName(athlete.name);
    if (athlete.contact) setUserContact(athlete.contact);
    if (athlete.notes) setUserNotes(athlete.notes);
    if (athlete.exactAge) setExactAge(athlete.exactAge);
    if (athlete.height) setHeight(athlete.height);
    if (athlete.weight) setWeight(athlete.weight);
    if (athlete.sex) setSex(athlete.sex as Sex);
    if (athlete.activity) setActivity(athlete.activity as ActivityLevel);
    if (athlete.foodStyle) setFoodStyle(athlete.foodStyle as FoodStyle);
    if (athlete.mainGoal) setMainGoal(athlete.mainGoal as MainGoal);
    if (athlete.energyGoal) setEnergyGoal(athlete.energyGoal as EnergyGoal);
    if (athlete.budget) setBudget(athlete.budget as BudgetTier);
  };

  const calculateEnergy = () => {
    if (ageGroup === '13–17') {
      setCalcFeedback({ type: 'teen' });
      return;
    }
    const exact = parseInt(exactAge, 10) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;

    if (!ageGroup || exact < 18 || h < 100 || w < 25 || !sex || !activity) {
      setCalcFeedback({ type: 'missing' });
      return;
    }

    const calculated = calculatePersonalizedNutrition({
      ageGroup,
      exactAge,
      height,
      weight,
      sex,
      activity,
      foodStyle: foodStyle || 'Vegetarian (Lacto-Ovo)',
      mainGoal: mainGoal || 'Muscle & strength support',
      energyGoal: energyGoal || 'Maintenance',
      budget: budget || 'Balanced daily (₹200–₹350)',
    });

    setCalcFeedback({
      type: 'success',
      data: {
        bmr: calculated.bmr,
        maintenance: calculated.tdee,
        bulkLow: calculated.bulkRange.low,
        bulkHigh: calculated.bulkRange.high,
        cutLow: calculated.cutRange.low,
        cutHigh: calculated.cutRange.high,
        recompLow: calculated.recompRange.low,
        recompHigh: calculated.recompRange.high,
      },
    });
  };

  const ageOptions: { value: AgeGroup; title: string; subtitle: string }[] = [
    { value: '13–17', title: '13–17', subtitle: 'Teen / school years' },
    { value: '18–25', title: '18–25', subtitle: 'College / early adult' },
    { value: '26–40', title: '26–40', subtitle: 'Adult lifter' },
    { value: '41–60', title: '41–60', subtitle: 'Master athlete' },
    { value: '61+', title: '61+', subtitle: 'Longevity & vitality' },
  ];

  const sexOptions: { value: Sex; title: string; subtitle: string }[] = [
    { value: 'Male', title: 'Male', subtitle: 'Used for adult energy calculation' },
    { value: 'Female', title: 'Female', subtitle: 'Used for adult energy calculation' },
  ];

  const activityOptions: { value: ActivityLevel; title: string; subtitle: string }[] = [
    { value: 'Light', title: 'Light activity', subtitle: 'Desk job + light training' },
    { value: 'Moderate', title: 'Moderate activity', subtitle: '3–4 gym sessions / week' },
    { value: 'High', title: 'High activity', subtitle: '5–6 intense gym / sport sessions' },
  ];

  const styleOptions: { value: FoodStyle; title: string; subtitle: string }[] = [
    { value: 'Vegetarian', title: 'Vegetarian', subtitle: 'Dairy, pulses, grains, soya' },
    { value: 'Eggetarian', title: 'Eggetarian', subtitle: 'Vegetarian + whole eggs' },
    { value: 'Non-vegetarian', title: 'Non-vegetarian', subtitle: 'Chicken, fish, eggs, meat' },
    { value: 'Jain', title: 'Jain', subtitle: 'Root-free traditional practices' },
    { value: 'Mostly plant-based', title: 'Mostly plant-based', subtitle: 'Tofu, legumes, seeds, greens' },
  ];

  const goalOptions: { value: MainGoal; title: string; subtitle: string; icon: string }[] = [
    { value: 'More daily energy', title: 'More daily energy', subtitle: 'Steady training stamina', icon: '⚡' },
    { value: 'Muscle & strength support', title: 'Muscle & strength support', subtitle: 'Hypertrophy & heavy lifting', icon: '🏋️' },
    { value: 'Study-day nutrition', title: 'Study-day nutrition', subtitle: 'Cognitive clarity & focus', icon: '📚' },
    { value: 'Balanced eating', title: 'Balanced eating', subtitle: 'Sustainable body composition', icon: '🥗' },
    { value: 'Eat well on a budget', title: 'Eat well on a budget', subtitle: 'High protein per rupee', icon: '🪙' },
  ];

  const energyGoalOptions: { value: EnergyGoal; title: string; subtitle: string }[] = [
    { value: 'Maintenance', title: 'Maintenance (Base)', subtitle: 'Stay lean & maintain current mass' },
    { value: 'Muscle-building surplus', title: 'Bulk / Muscle-building surplus', subtitle: '+8% to +12% calorie surplus' },
    { value: 'Fat-loss deficit', title: 'Cut / Fat-loss deficit', subtitle: '-5% to -10% controlled deficit' },
    { value: 'Recomposition', title: 'Recomposition', subtitle: 'Build muscle while dropping body fat' },
  ];

  const budgetOptions: { value: BudgetTier; title: string; subtitle: string }[] = [
    { value: 'Under ₹100/day', title: 'Under ₹100/day', subtitle: 'Soya, eggs, seasonal dal, oats' },
    { value: '₹200/day', title: '₹200/day', subtitle: 'Paneer, chicken, peanut butter' },
    { value: '₹350/day', title: '₹350/day', subtitle: 'Whey protein, Greek yogurt, fish' },
    { value: '₹350+/day', title: '₹350+/day', subtitle: 'Premium clean athletic groceries' },
    { value: 'Flexible / unknown', title: "I don't know yet", subtitle: 'Adaptable daily choices' },
  ];

  return (
    <section id="start" className="bg-white dark:bg-[#10141D] border border-slate-200/90 dark:border-[#1E2638] rounded-3xl p-6 sm:p-9 my-8 max-w-4xl mx-auto shadow-xl dark:shadow-2xl transition-all relative">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#CCFF00]/10 border border-emerald-200/80 dark:border-[#CCFF00]/25 text-emerald-800 dark:text-[#CCFF00] text-[10px] font-['Outfit'] font-black tracking-[0.2em] uppercase mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>PHASE 1 – NUTRITION ARCHITECTURE</span>
        </div>
        <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight uppercase">
          Build Your Nutrition Blueprint
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
          Select your biometric parameters and performance targets to calibrate your meal plan.
        </p>
      </div>

      {/* 0. Athlete Personal Information */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638]" id="personal-info">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-[#CCFF00]/15 text-emerald-700 dark:text-[#CCFF00] flex items-center justify-center font-black text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00]">
              Athlete Information
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-[#CCFF00]/15 text-emerald-800 dark:text-[#CCFF00]">
              <FileSpreadsheet className="w-3 h-3" />
              Live Excel Mapped
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#64748B] font-mono">STEP 0 OF 5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-['Outfit'] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Full Name
              </label>
              {excelAthletes.length > 0 && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-[#CCFF00]">
                  {excelAthletes.length} in Excel registry
                </span>
              )}
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                list="excel-athletes-datalist"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  const matched = excelAthletes.find(
                    (a) => a.name.toLowerCase() === e.target.value.trim().toLowerCase()
                  );
                  if (matched) {
                    setSelectedExcelAthlete(matched);
                  }
                }}
                placeholder="e.g., David Miller"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-[#141A26] border border-slate-300 dark:border-[#243046] text-sm text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-[#CCFF00] transition"
              />
              <datalist id="excel-athletes-datalist">
                {excelAthletes.map((athlete) => (
                  <option
                    key={athlete.id || athlete.rowNumber}
                    value={athlete.name}
                    label={`Row #${athlete.rowNumber} • ${athlete.mainGoal || 'Athlete'}`}
                  />
                ))}
              </datalist>
            </div>

            {/* Registered names chips from Excel */}
            {excelAthletes.length > 0 && !userName && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 dark:text-[#64748B] flex items-center gap-1 font-mono">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-500 dark:text-[#CCFF00]" />
                  Excel names:
                </span>
                {excelAthletes.slice(0, 3).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelectExcelAthlete(a)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-[#24334A] text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-[#CCFF00] hover:border-emerald-400 transition cursor-pointer"
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            )}

            {/* Mapped profile notification */}
            {selectedExcelAthlete && userName === selectedExcelAthlete.name && (
              <div className="mt-2 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-[#CCFF00]/10 border border-emerald-200 dark:border-[#CCFF00]/25 flex items-center justify-between text-[11px] text-emerald-900 dark:text-[#CCFF00]">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-[#CCFF00]" />
                  Mapped from Excel Row #{selectedExcelAthlete.rowNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectExcelAthlete(selectedExcelAthlete)}
                  className="font-bold underline hover:opacity-80 cursor-pointer"
                >
                  Re-apply All Biometrics
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-['Outfit'] font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
              Contact (Email or Phone)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userContact}
                onChange={(e) => setUserContact(e.target.value)}
                placeholder="e.g., david.miller@example.com or +1 (555) 019-2834"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-[#141A26] border border-slate-300 dark:border-[#243046] text-sm text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-[#CCFF00] transition"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-['Outfit'] font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
              Personal Goal / Training Notes (Optional)
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g., Aiming for 10km run stamina, student schedule with gym 4x/week..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141A26] border border-slate-300 dark:border-[#243046] text-sm text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-[#CCFF00] transition"
            />
          </div>
        </div>
      </div>

      {/* 1. Age Section */}
      <div className="mb-8" id="ages">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00]">
            1. Age Group
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-[#64748B] font-mono">STEP 1 OF 5</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {ageOptions.map((item) => {
            const isSelected = ageGroup === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setAgeGroup(isSelected ? '' : item.value)}
                className={`tap p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[82px] ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-[#CCFF00]/15 text-slate-950 dark:text-white border-emerald-600 dark:border-[#CCFF00] shadow-[0_0_15px_rgba(16,185,129,0.18)] dark:shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-emerald-600 dark:ring-[#CCFF00]'
                    : 'bg-slate-50/80 dark:bg-[#0B0E15] text-slate-800 dark:text-[#F1F5F9] border-slate-200 dark:border-[#1E2638] hover:border-slate-300 dark:hover:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#141A26]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Outfit'] font-bold text-sm leading-snug">{item.title}</span>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 dark:bg-[#CCFF00] text-white dark:text-[#090C12] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[#334155]" />
                  )}
                </div>
                <span className={`text-[11px] mt-1 leading-snug ${isSelected ? 'text-emerald-700 dark:text-[#CCFF00]' : 'text-slate-500 dark:text-[#64748B]'}`}>
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Exact Age */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] max-w-sm">
          <label htmlFor="exactAge" className="block text-xs font-['Outfit'] font-bold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
            Exact Age (Years, Adults Only)
          </label>
          <input
            id="exactAge"
            type="number"
            min="18"
            max="100"
            placeholder="e.g. 23"
            value={exactAge}
            onChange={(e) => setExactAge(e.target.value)}
            className="w-full bg-white dark:bg-[#141A26] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono outline-none transition"
          />
        </div>
      </div>

      {/* 2. Height & Weight */}
      <div className="mb-8">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          2. Biometric Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638]">
            <label htmlFor="height" className="block text-xs font-['Outfit'] font-bold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
              Height (cm)
            </label>
            <input
              id="height"
              type="number"
              min="100"
              max="230"
              placeholder="e.g. 178"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-white dark:bg-[#141A26] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono outline-none transition"
            />
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638]">
            <label htmlFor="weight" className="block text-xs font-['Outfit'] font-bold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              min="25"
              max="250"
              placeholder="e.g. 74"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-white dark:bg-[#141A26] border border-slate-200 dark:border-[#263147] focus:border-emerald-600 dark:focus:border-[#CCFF00] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* 3. Sex Section */}
      <div className="mb-8" id="sexes">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          3. Biological Sex (For Adult Calorie Estimation)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          {sexOptions.map((item) => {
            const isSelected = sex === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setSex(isSelected ? '' : item.value)}
                className={`tap p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer min-h-[76px] flex flex-col justify-between ${
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

      {/* 4. Activity Level */}
      <div className="mb-8" id="activities">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          4. Training & Activity Level
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activityOptions.map((item) => {
            const isSelected = activity === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setActivity(isSelected ? '' : item.value)}
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

      {/* 5. Food Style */}
      <div className="mb-8" id="styles">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          5. Dietary Style
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {styleOptions.map((item) => {
            const isSelected = foodStyle === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFoodStyle(isSelected ? '' : item.value)}
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

      {/* 6. Main Goal */}
      <div className="mb-8" id="goals">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          6. Primary Fitness & Nutrition Objective
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {goalOptions.map((item) => {
            const isSelected = mainGoal === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setMainGoal(isSelected ? '' : item.value)}
                className={`tap p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer min-h-[86px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-[#CCFF00]/15 text-slate-950 dark:text-white border-emerald-600 dark:border-[#CCFF00] shadow-[0_0_15px_rgba(16,185,129,0.18)] dark:shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-emerald-600 dark:ring-[#CCFF00]'
                    : 'bg-slate-50/80 dark:bg-[#0B0E15] text-slate-800 dark:text-[#F1F5F9] border-slate-200 dark:border-[#1E2638] hover:border-slate-300 dark:hover:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#141A26]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Outfit'] font-bold text-sm flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
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

      {/* Gym Bio-Energy Console (Adult Calorie Calculator) */}
      <div className="rounded-2xl bg-slate-50/90 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] p-5 sm:p-6 mb-8 relative overflow-hidden transition-colors duration-200">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-[#CCFF00]/15 text-emerald-800 dark:text-[#CCFF00] flex items-center justify-center border border-emerald-300/60 dark:border-[#CCFF00]/30">
            <Gauge className="w-4 h-4" />
          </div>
          <h3 className="font-['Outfit'] font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">
            Athlete Bio-Energetics Engine
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
          Estimates resting BMR (Mifflin-St Jeor) and Total Daily Energy Expenditure (TDEE) based on your height, weight, age, and activity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#20293D] shadow-sm dark:shadow-none">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block mb-0.5">
              BASAL METABOLIC RATE (BMR)
            </span>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
              Calories burned purely keeping your organs and muscles alive at rest.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#20293D] shadow-sm dark:shadow-none">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-700 dark:text-[#00F0FF] uppercase block mb-0.5">
              MAINTENANCE EXPENDITURE (TDEE)
            </span>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
              Energy burned factoring in workouts, steps, and thermic effect of food.
            </p>
          </div>
        </div>

        <button
          id="calcBtn"
          type="button"
          onClick={calculateEnergy}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-[#182030] hover:bg-slate-800 dark:hover:bg-[#222C42] text-white font-['Outfit'] font-black text-xs tracking-wider uppercase border border-slate-800 dark:border-[#2D3A54] hover:border-emerald-500 dark:hover:border-[#CCFF00] transition cursor-pointer shadow-sm"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400 dark:text-[#CCFF00]" />
          <span>Compute Energy Targets</span>
        </button>

        {calcFeedback?.type === 'teen' && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-[#2A1D0B] border border-amber-300 dark:border-[#FF9800]/40 text-xs text-amber-900 dark:text-[#FFB74D] leading-relaxed">
            <span className="font-['Outfit'] font-bold text-sm block mb-1 text-amber-950 dark:text-white">TEEN MODE NOTICE:</span>
            NOURISH does not calculate aggressive bulk, cut or strict calorie deficits for teenagers. Growing bodies have dynamic energy needs. Please consult a guardian and sports physician or dietitian.
          </div>
        )}

        {calcFeedback?.type === 'missing' && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-[#2D1212] border border-red-200 dark:border-[#EF4444]/40 text-xs text-red-800 dark:text-[#FCA5A5] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600 dark:text-[#EF4444]" />
            <div>
              <span className="font-bold text-red-950 dark:text-white block mb-0.5">Missing Biometric Inputs:</span>
              Please select Age Group, enter exact age (≥ 18), height (cm), weight (kg), biological sex, and activity level.
            </div>
          </div>
        )}

        {calcFeedback?.type === 'success' && calcFeedback.data && (
          <div className="mt-5 space-y-3" id="calcResult">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#253249] shadow-sm dark:shadow-none">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block">
                  BMR (RESTING)
                </span>
                <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white mt-1">
                  {calcFeedback.data.bmr.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-500 dark:text-[#64748B]">kcal/day</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#64748B] mt-0.5">Baseline basal expenditure.</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#253249] shadow-sm dark:shadow-none">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-700 dark:text-[#00F0FF] uppercase block">
                  DAILY MAINTENANCE
                </span>
                <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white mt-1">
                  {calcFeedback.data.maintenance.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-500 dark:text-[#64748B]">kcal/day</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#64748B] mt-0.5">Energy burned with current activity.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#253249] text-center shadow-sm dark:shadow-none">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block">
                  BULK SURPLUS
                </span>
                <p className="text-sm font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white mt-1">
                  {calcFeedback.data.bulkLow} – {calcFeedback.data.bulkHigh} kcal
                </p>
                <span className="text-[9px] text-slate-500 dark:text-[#64748B] uppercase">Hypertrophy</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#253249] text-center shadow-sm dark:shadow-none">
                <span className="text-[10px] font-mono font-bold tracking-widest text-orange-600 dark:text-[#FF6B00] uppercase block">
                  CUT DEFICIT
                </span>
                <p className="text-sm font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white mt-1">
                  {calcFeedback.data.cutLow} – {calcFeedback.data.cutHigh} kcal
                </p>
                <span className="text-[9px] text-slate-500 dark:text-[#64748B] uppercase">Fat Loss</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#253249] text-center shadow-sm dark:shadow-none">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-600 dark:text-[#38BDF8] uppercase block">
                  RECOMPOSITION
                </span>
                <p className="text-sm font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white mt-1">
                  {calcFeedback.data.recompLow} – {calcFeedback.data.recompHigh} kcal
                </p>
                <span className="text-[9px] text-slate-500 dark:text-[#64748B] uppercase">Lean Gains</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Energy Goal */}
      <div className="mb-8" id="energygoals">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          7. Caloric Target Strategy
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {energyGoalOptions.map((item) => {
            const isSelected = energyGoal === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setEnergyGoal(isSelected ? '' : item.value)}
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

      {/* 8. Food Budget */}
      <div className="mb-8" id="budgets">
        <h3 className="text-xs font-['Outfit'] font-black tracking-[0.2em] uppercase text-emerald-700 dark:text-[#CCFF00] mb-3">
          8. Daily Nutrition Budget Tier
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {budgetOptions.map((item) => {
            const isSelected = budget === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setBudget(isSelected ? '' : item.value)}
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

      {/* Validation banner */}
      {validationError && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-[#2D1212] border border-red-200 dark:border-[#EF4444]/40 text-red-800 dark:text-[#FCA5A5] text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-[#EF4444]" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Build Plan CTA button */}
      <motion.button
        id="startBtn"
        type="button"
        onClick={onBuildPlan}
        whileHover={{ scale: 1.015, y: -1 }}
        whileTap={{ scale: 0.985 }}
        className="group w-full py-4 px-6 rounded-2xl bg-slate-950 dark:bg-[#CCFF00] hover:bg-slate-900 dark:hover:bg-[#BAE600] text-[#CCFF00] dark:text-[#090C12] font-['Outfit'] font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_24px_rgba(15,23,42,0.25)] dark:shadow-[0_0_30px_rgba(204,255,0,0.25)] cursor-pointer"
      >
        <Zap className="w-4 h-4 stroke-[3]" />
        <span>Generate Athletic Nutrition Blueprint</span>
        <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1.5 transition-transform duration-200" />
      </motion.button>
    </section>
  );
};
