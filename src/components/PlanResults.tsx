import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AgeGroup, 
  Sex, 
  ActivityLevel, 
  FoodStyle, 
  MainGoal, 
  EnergyGoal, 
  BudgetTier, 
  MealItem 
} from '../types';
import { calculatePersonalizedNutrition } from '../utils/nutritionEngine';
import { generateDietPlanPdf } from '../utils/pdfGenerator';
import { 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Utensils, 
  Flame, 
  Zap, 
  Check, 
  ArrowLeft, 
  Copy, 
  Dumbbell, 
  Clock,
  Sparkles,
  DollarSign,
  Download,
  FileText,
  Loader2
} from 'lucide-react';

interface PlanResultsProps {
  userName?: string;
  userContact?: string;
  userNotes?: string;
  ageGroup: AgeGroup;
  exactAge: string;
  height: string;
  weight: string;
  sex: Sex | '';
  activity: ActivityLevel | '';
  foodStyle: FoodStyle;
  mainGoal: MainGoal;
  energyGoal: EnergyGoal;
  budget: BudgetTier;
  onReset: () => void;
}

export const PlanResults: React.FC<PlanResultsProps> = ({
  userName,
  userContact,
  userNotes,
  ageGroup,
  exactAge,
  height,
  weight,
  sex,
  activity,
  foodStyle,
  mainGoal,
  energyGoal,
  budget,
  onReset,
}) => {
  // Dynamically calculate personalized nutrition from all user inputs
  const planOutput = useMemo(() => {
    return calculatePersonalizedNutrition({
      ageGroup,
      exactAge,
      height,
      weight,
      sex: sex || undefined,
      activity: activity || undefined,
      foodStyle,
      mainGoal,
      energyGoal,
      budget,
    });
  }, [ageGroup, exactAge, height, weight, sex, activity, foodStyle, mainGoal, energyGoal, budget]);

  const [activeMeals, setActiveMeals] = useState<MealItem[]>(planOutput.meals);
  const [expandedRecipes, setExpandedRecipes] = useState<Record<number, boolean>>({});
  const [expandedAlternatives, setExpandedAlternatives] = useState<Record<number, boolean>>({});
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);
  const [swappedIndex, setSwappedIndex] = useState<number | null>(null);

  // Sync activeMeals whenever inputs change so the user immediately gets updated results!
  useEffect(() => {
    setActiveMeals(planOutput.meals);
  }, [planOutput.meals]);

  const toggleRecipe = (index: number) => {
    setExpandedRecipes((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleAlternatives = (index: number) => {
    setExpandedAlternatives((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const swapMealAlternative = (mealIndex: number, newTitle: string, newDesc: string) => {
    setActiveMeals((prev) => {
      const copy = [...prev];
      if (copy[mealIndex]) {
        copy[mealIndex] = {
          ...copy[mealIndex],
          dishTitle: newTitle,
          quantity: newDesc,
        };
      }
      return copy;
    });
    setExpandedAlternatives((prev) => ({ ...prev, [mealIndex]: false }));
    setSwappedIndex(mealIndex);
    setTimeout(() => setSwappedIndex(null), 1800);
  };

  const alternativesByMeal = planOutput.alternatives;

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateDietPlanPdf({
        userName: userName || undefined,
        ageGroup,
        exactAge,
        height,
        weight,
        sex: sex || undefined,
        activity: activity || undefined,
        foodStyle,
        mainGoal,
        energyGoal,
        budget,
        planOutput,
        activeMeals,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF diet plan:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyPlan = () => {
    const text = `NOURISH PRO ATHLETIC MEAL PLAN\nGoal: ${mainGoal} (${energyGoal})\nStyle: ${foodStyle} | Budget: ${budget}\n\n` +
      `Target Calories: ${planOutput.targetCalories.toLocaleString()} kcal (${planOutput.calorieRange.low}–${planOutput.calorieRange.high} kcal)\n` +
      `Macros: ${planOutput.macros.protein}g Protein | ${planOutput.macros.carbs}g Carbs | ${planOutput.macros.fats}g Fats | ${planOutput.macros.fiber}g Fiber\n\n` +
      activeMeals.map((m) => `[${m.mealName.toUpperCase()}] ${m.dishTitle}\n  Quantity: ${m.quantity}\n  Est. Protein: ${m.proteinEstimate}${m.caloriesEstimate ? ` | ${m.caloriesEstimate}` : ''}\n  Macros: ${m.macroSplit || 'Balanced'}`).join('\n\n') +
      `\n\nBudget Strategy: ${planOutput.budgetExecutionPlan}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }).catch(() => {});
  };

  const mealTimingCues = [
    'Morning Fuel – High Satiety & Micronutrients',
    'Midday Sustained Energy – Complex Carbs & Glycogen',
    'Pre/Post Training – Rapid Amino Acid Delivery',
    'Evening Recovery – Slow-Digesting Casein / Repair'
  ];

  return (
    <section id="results" className="bg-white dark:bg-[#10141D] border border-slate-200/90 dark:border-[#1E2638] rounded-3xl p-6 sm:p-9 my-8 max-w-4xl mx-auto shadow-xl dark:shadow-2xl transition-all relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#CCFF00]/10 border border-emerald-200/80 dark:border-[#CCFF00]/30 text-emerald-800 dark:text-[#CCFF00] text-[10px] font-['Outfit'] font-black tracking-[0.2em] uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DYNAMIC CALIBRATED PROTOCOL</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight uppercase">
              Your Performance Blueprint
            </h2>
            {userName && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-[#CCFF00]/20 border border-emerald-300 dark:border-[#CCFF00]/40 text-emerald-900 dark:text-[#CCFF00] font-['Outfit'] font-bold text-xs uppercase tracking-wider">
                Athlete: {userName}
              </span>
            )}
          </div>
          <div className="text-xs font-mono font-semibold text-slate-600 dark:text-[#94A3B8] tracking-wide flex flex-wrap items-center gap-2 mt-1">
            <span className="text-emerald-700 dark:text-[#CCFF00] font-bold">{ageGroup}</span>
            <span>•</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{foodStyle}</span>
            <span>•</span>
            <span>{mainGoal}</span>
            <span>•</span>
            <span className="text-cyan-700 dark:text-[#00F0FF] font-bold">{energyGoal}</span>
            <span>•</span>
            <span className="text-orange-600 dark:text-[#FF6B00] font-bold">{budget}</span>
          </div>
        </div>

        {/* Action Buttons: PDF Download (Primary) + Copy Text (Secondary) */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            id="download-plan-pdf-btn"
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#b8e600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-500/20 dark:shadow-[#CCFF00]/20 disabled:opacity-60"
            title="Download full structured diet plan in PDF format"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Diet Plan (PDF)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyPlan}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#171E2D] dark:hover:bg-[#20293D] text-slate-800 dark:text-white border border-slate-200 dark:border-[#263147] hover:border-emerald-500 dark:hover:border-[#CCFF00] text-xs font-['Outfit'] font-bold uppercase tracking-wider transition cursor-pointer shadow-sm"
            title="Copy meal plan to clipboard"
          >
            {copySuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#CCFF00]" />
                <span className="text-emerald-700 dark:text-[#CCFF00] hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8]" />
                <span className="hidden sm:inline">Copy Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Goal Quote / Manifesto */}
      <div className="rounded-2xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] p-5 mb-8 text-slate-800 dark:text-[#E2E8F0] font-['Outfit'] italic text-base leading-relaxed border-l-4 border-l-emerald-600 dark:border-l-[#CCFF00]">
        “{planOutput.goalRationale}”
      </div>

      {/* Comprehensive Dynamic Macro Breakdown Dashboard */}
      <div className="mb-8 p-5 rounded-2xl bg-slate-50/90 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-[#1E2638] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
            <span className="text-xs font-['Outfit'] font-black tracking-widest text-slate-950 dark:text-white uppercase">
              Target Daily Macro Allocation
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">
            {planOutput.isBiometricEstimated ? 'Calibrated from age & standard biometrics' : 'Calibrated from your exact height & weight'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Daily Calories */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#20293D]">
            <span className="text-[10px] font-mono font-bold tracking-widest text-orange-600 dark:text-[#FF6B00] uppercase block">
              TARGET CALORIES
            </span>
            <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-950 dark:text-white mt-0.5">
              {planOutput.targetCalories.toLocaleString()}
              <span className="text-xs font-sans font-normal text-slate-500 dark:text-[#94A3B8] ml-1">kcal</span>
            </p>
            <span className="text-[10px] text-slate-500 dark:text-[#64748B]">
              Range: {planOutput.calorieRange.low}–{planOutput.calorieRange.high} kcal
            </span>
          </div>

          {/* Daily Protein */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#20293D]">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block">
              OPTIMAL PROTEIN
            </span>
            <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-950 dark:text-white mt-0.5">
              {planOutput.macros.protein}g
              <span className="text-xs font-sans font-normal text-slate-500 dark:text-[#94A3B8] ml-1">({planOutput.macros.proteinPct}%)</span>
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-[#CCFF00] font-mono">
              ~2.0g/kg bodyweight
            </span>
          </div>

          {/* Daily Carbs */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#20293D]">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-600 dark:text-[#00F0FF] uppercase block">
              COMPLEX CARBS
            </span>
            <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-950 dark:text-white mt-0.5">
              {planOutput.macros.carbs}g
              <span className="text-xs font-sans font-normal text-slate-500 dark:text-[#94A3B8] ml-1">({planOutput.macros.carbsPct}%)</span>
            </p>
            <span className="text-[10px] text-slate-500 dark:text-[#64748B]">
              Glycogen & stamina fuel
            </span>
          </div>

          {/* Daily Fats */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#20293D]">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 dark:text-[#F59E0B] uppercase block">
              HEALTHY FATS
            </span>
            <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-950 dark:text-white mt-0.5">
              {planOutput.macros.fats}g
              <span className="text-xs font-sans font-normal text-slate-500 dark:text-[#94A3B8] ml-1">({planOutput.macros.fatsPct}%)</span>
            </p>
            <span className="text-[10px] text-slate-500 dark:text-[#64748B]">
              Fiber: ~{planOutput.macros.fiber}g/day
            </span>
          </div>
        </div>

        {/* Visual Macro Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-600 dark:text-[#94A3B8]">
            <span>Macro Energy Ratio</span>
            <span className="space-x-3">
              <span className="text-emerald-700 dark:text-[#CCFF00]">● Protein {planOutput.macros.proteinPct}%</span>
              <span className="text-cyan-600 dark:text-[#00F0FF]">● Carbs {planOutput.macros.carbsPct}%</span>
              <span className="text-amber-600 dark:text-[#F59E0B]">● Fats {planOutput.macros.fatsPct}%</span>
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-[#182030] rounded-full overflow-hidden flex">
            <div style={{ width: `${planOutput.macros.proteinPct}%` }} className="bg-emerald-500 dark:bg-[#CCFF00]" />
            <div style={{ width: `${planOutput.macros.carbsPct}%` }} className="bg-cyan-500 dark:bg-[#00F0FF]" />
            <div style={{ width: `${planOutput.macros.fatsPct}%` }} className="bg-amber-500 dark:bg-[#F59E0B]" />
          </div>
        </div>
      </div>

      {/* 1. Full-day meal plan */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-[#CCFF00]/15 text-emerald-700 dark:text-[#CCFF00] flex items-center justify-center border border-emerald-200/80 dark:border-[#CCFF00]/30">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-xl text-slate-950 dark:text-white uppercase tracking-tight">
                1. Four-Stage Athletic Fuel Protocol
              </h3>
              <span className="text-[11px] text-emerald-700 dark:text-[#CCFF00] font-mono">
                Portions scaled to {planOutput.calorieTier.toUpperCase()} energy tier & {budget} budget
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#64748B] hidden sm:inline-block">Click recipe details or swap alternatives</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMeals.map((meal, index) => {
            const isRecipeOpen = !!expandedRecipes[index];
            const isAltOpen = !!expandedAlternatives[index];
            const availableAlts = alternativesByMeal[meal.mealName] || [];
            const timingCue = mealTimingCues[index] || 'Performance Fuel';
            const isJustSwapped = swappedIndex === index;

            return (
              <motion.div
                key={`${meal.mealName}-${index}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isJustSwapped ? [1, 1.02, 1] : 1,
                  boxShadow: isJustSwapped ? '0 0 25px rgba(204,255,0,0.35)' : 'none'
                }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md dark:shadow-none transition-colors hover:border-slate-300 dark:hover:border-[#334155] relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 dark:text-[#94A3B8] uppercase">
                      {meal.mealName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {meal.caloriesEstimate && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#171E2D] text-slate-700 dark:text-[#CBD5E1] text-[10px] font-mono font-semibold">
                          {meal.caloriesEstimate}
                        </span>
                      )}
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#CCFF00]/15 border border-emerald-200/80 dark:border-[#CCFF00]/30 text-emerald-800 dark:text-[#CCFF00] text-[11px] font-mono font-bold">
                        {meal.proteinEstimate}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 dark:text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600 dark:text-[#CCFF00]" />
                    <span>{timingCue}</span>
                  </div>

                  <h4 className="font-['Outfit'] text-base font-bold text-slate-950 dark:text-white mb-2 leading-snug">
                    {meal.dishTitle}
                  </h4>
                  
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-3">
                    <span className="font-bold text-slate-900 dark:text-[#CBD5E1]">Quantity:</span> {meal.quantity}
                  </p>

                  {meal.budgetTip && (
                    <div className="mb-3 p-2 rounded-lg bg-emerald-50/70 dark:bg-[#CCFF00]/5 border border-emerald-100 dark:border-[#CCFF00]/15 text-[11px] text-emerald-900 dark:text-[#CBD5E1] flex items-start gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-[#CCFF00] shrink-0 mt-0.5" />
                      <span>{meal.budgetTip}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-[#182030]">
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleRecipe(index)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#141A26] dark:hover:bg-[#1C2536] text-slate-800 dark:text-white text-xs font-['Outfit'] font-bold uppercase tracking-wider border border-slate-200 dark:border-[#263147] transition cursor-pointer"
                    >
                      <span>{isRecipeOpen ? 'Hide Recipe' : 'Prep & Cooking'}</span>
                      {isRecipeOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </motion.button>

                    {availableAlts.length > 0 && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleAlternatives(index)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#141A26] dark:hover:bg-[#1C2536] text-emerald-700 dark:text-[#CCFF00] text-xs font-['Outfit'] font-bold uppercase tracking-wider border border-slate-200 dark:border-[#263147] hover:border-emerald-500 dark:hover:border-[#CCFF00] transition cursor-pointer"
                        title="View alternative meal options"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Swap</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Recipe Accordion Box */}
                  <AnimatePresence>
                    {isRecipeOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-[#141A26] border-l-3 border-emerald-600 dark:border-[#CCFF00] text-xs text-slate-700 dark:text-[#CBD5E1] space-y-2">
                          <p>
                            <strong className="block text-slate-900 dark:text-white mb-0.5 font-['Outfit'] uppercase tracking-wider text-[11px]">
                              Ingredients & Measurements:
                            </strong>
                            {meal.ingredients}
                          </p>
                          <p>
                            <strong className="block text-slate-900 dark:text-white mb-0.5 font-['Outfit'] uppercase tracking-wider text-[11px]">
                              Preparation Protocol:
                            </strong>
                            {meal.preparationSteps}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Alternatives Box */}
                  <AnimatePresence>
                    {isAltOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#090C12] border border-slate-200 dark:border-[#1E2638] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-[#CCFF00] uppercase tracking-wider">
                              Compatible Swap Options
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-[#64748B]">Click to substitute</span>
                          </div>
                          <div className="space-y-2">
                            {availableAlts.map((alt, altIdx) => (
                              <div
                                key={altIdx}
                                className="p-2.5 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#20293D] hover:border-emerald-500 dark:hover:border-[#CCFF00] transition flex items-center justify-between gap-2 shadow-sm dark:shadow-none"
                              >
                                <div>
                                  <span className="font-['Outfit'] font-bold text-xs text-slate-900 dark:text-white block">
                                    {alt.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                                    {alt.description}
                                  </span>
                                </div>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => swapMealAlternative(index, alt.name, alt.description)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 dark:bg-[#CCFF00] hover:bg-emerald-700 dark:hover:bg-[#BAE600] text-white dark:text-[#090C12] text-[11px] font-['Outfit'] font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-sm"
                                >
                                  Use
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 2. Energy needs */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-[#FF6B00]/15 text-orange-600 dark:text-[#FF6B00] flex items-center justify-center border border-orange-200 dark:border-[#FF6B00]/30">
            <Flame className="w-4 h-4" />
          </div>
          <h3 className="font-['Outfit'] font-black text-xl text-slate-950 dark:text-white uppercase tracking-tight">
            2. Bio-Energetic Breakdown & Calorie Targets
          </h3>
        </div>

        {ageGroup === '13–17' ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#2A1D0B] border border-amber-300 dark:border-[#FF9800]/40 text-xs text-amber-900 dark:text-[#FFB74D] leading-relaxed">
            <p className="font-bold text-sm text-amber-950 dark:text-white mb-1">TEEN ATHLETE ADVISORY:</p>
            NOURISH does not calculate aggressive calorie deficits for teenagers. Growing bodies have dynamic energy requirements for skeletal, hormonal, and muscular development. Please involve a parent/guardian and a qualified sports dietitian.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638]">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block mb-1">
                  ESTIMATED BMR (RESTING BASAL)
                </span>
                <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white">
                  {planOutput.bmr.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-500 dark:text-[#64748B]">kcal/day</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-[#64748B] mt-1">
                  Baseline cellular energy expenditure at complete rest.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638]">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-700 dark:text-[#00F0FF] uppercase block mb-1">
                  DAILY EXPENDITURE (TDEE)
                </span>
                <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white">
                  {planOutput.tdee.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-500 dark:text-[#64748B]">kcal/day</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-[#64748B] mt-1">
                  Maintenance energy with your current activity frequency.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3.5 rounded-xl border text-center transition-all ${
                energyGoal === 'Muscle-building surplus' 
                  ? 'bg-emerald-50 dark:bg-[#CCFF00]/10 border-emerald-500 dark:border-[#CCFF00] shadow-sm'
                  : 'bg-slate-50/80 dark:bg-[#0B0E15] border-slate-200 dark:border-[#1E2638]'
              }`}>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block mb-0.5">
                  BULK SURPLUS (+10%)
                </span>
                <p className="text-sm font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white">
                  {planOutput.bulkRange.low.toLocaleString()} – {planOutput.bulkRange.high.toLocaleString()} kcal
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border text-center transition-all ${
                energyGoal === 'Fat-loss deficit' 
                  ? 'bg-orange-50 dark:bg-[#FF6B00]/10 border-orange-500 dark:border-[#FF6B00] shadow-sm'
                  : 'bg-slate-50/80 dark:bg-[#0B0E15] border-slate-200 dark:border-[#1E2638]'
              }`}>
                <span className="text-[10px] font-mono font-bold tracking-widest text-orange-600 dark:text-[#FF6B00] uppercase block mb-0.5">
                  CUT DEFICIT (-15%)
                </span>
                <p className="text-sm font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white">
                  {planOutput.cutRange.low.toLocaleString()} – {planOutput.cutRange.high.toLocaleString()} kcal
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border text-center transition-all ${
                energyGoal === 'Recomposition' 
                  ? 'bg-cyan-50 dark:bg-[#00F0FF]/10 border-cyan-500 dark:border-[#00F0FF] shadow-sm'
                  : 'bg-slate-50/80 dark:bg-[#0B0E15] border-slate-200 dark:border-[#1E2638]'
              }`}>
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-600 dark:text-[#38BDF8] uppercase block mb-0.5">
                  RECOMPOSITION (-5%)
                </span>
                <p className="text-sm font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white">
                  {planOutput.recompRange.low.toLocaleString()} – {planOutput.recompRange.high.toLocaleString()} kcal
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#141A26] border border-slate-200 dark:border-[#253249] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block">
                  SELECTED TARGET ({energyGoal.toUpperCase()})
                </span>
                <p className="text-lg font-['Space_Grotesk'] font-bold text-slate-950 dark:text-white mt-0.5">
                  {planOutput.targetCalories.toLocaleString()} kcal / day ({planOutput.calorieRange.low}–{planOutput.calorieRange.high} kcal)
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">
                Consistency &gt; Perfection
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Tactical Budget Strategy */}
      <div className="mb-10">
        <h3 className="font-['Outfit'] font-black text-xl text-slate-950 dark:text-white uppercase tracking-tight mb-3">
          3. Budget & Resource Strategy ({budget})
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
          A high-performance athletic day combines complex carbohydrates for glycogen replenishment, high-quality protein for muscle repair, and healthy fats for hormone regulation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638]">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 dark:text-[#CCFF00] uppercase block mb-1">
              BUDGET EXECUTION ({budget})
            </span>
            <p className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
              {planOutput.budgetExecutionPlan}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638]">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-700 dark:text-[#00F0FF] uppercase block mb-1">
              HIGH PROTEIN PER RUPEE STAPLES
            </span>
            <p className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
              Prioritize cost-effective staples: bulk soya chunks (52% protein, ₹45/kg), roasted sattu flour, whole eggs (~₹7/egg), seasonal lentils, and local fresh curd for maximum protein yield per rupee spent.
            </p>
          </div>
        </div>

        {foodStyle === 'Jain' && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-[#2A1D0B] border border-amber-300 dark:border-[#FF9800]/40 text-xs text-amber-900 dark:text-[#FFB74D] leading-relaxed">
            <strong className="block mb-0.5 text-amber-950 dark:text-white">Jain Community Guidance:</strong>
            Practices vary. Check every ingredient against your own personal or family practice (root vegetables, honey, specific fermented items).
          </div>
        )}
      </div>

      {/* 4. Protein Note & Important Note */}
      <div className="mb-8 space-y-4">
        <div>
          <h3 className="font-['Outfit'] font-bold text-base text-slate-950 dark:text-white uppercase tracking-wider mb-1">
            4. Protein & MPS Guidelines
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            Targeting ~{planOutput.macros.protein}g daily protein split across 4 feeding windows stimulates Muscle Protein Synthesis (MPS) with approximately 25g–40g high-quality protein per bolus.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
          <strong className="block text-slate-950 dark:text-white mb-0.5">Disclaimer:</strong>
          This is an educational fitness planning tool, not medical or clinical advice. For allergies, metabolic conditions, or clinical care, always consult a qualified medical provider.
        </div>
      </div>

      {/* Signature quote & Action */}
      <div className="text-center border-t border-b border-slate-200 dark:border-[#1E2638] py-4 text-sm font-['Outfit'] italic text-slate-600 dark:text-[#94A3B8] mb-6">
        “Good nutrition should fit your life – not take over your life.”
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="download-plan-pdf-bottom-btn"
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#b8e600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-500/20 dark:shadow-[#CCFF00]/20 disabled:opacity-60"
          title="Download full structured diet plan in PDF format"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Building Your PDF...</span>
            </>
          ) : pdfSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>PDF Downloaded Successfully!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Diet Plan (PDF)</span>
            </>
          )}
        </button>

        <button
          id="again"
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-[#141A26] hover:bg-slate-800 dark:hover:bg-[#1E273A] text-white text-xs font-['Outfit'] font-black uppercase tracking-wider border border-slate-800 dark:border-[#263147] hover:border-emerald-500 dark:hover:border-[#CCFF00] transition cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Re-Calibrate Parameters</span>
        </button>
      </div>
    </section>
  );
};
