import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CRAVING_RECIPES } from '../data/cravingsData';
import { FoodStyle, CravingRecipe } from '../types';
import { Sparkles, Flame, Check, ChefHat, X, UtensilsCrossed } from 'lucide-react';

interface CravingFixProps {
  currentFoodStyle?: FoodStyle;
}

export const CravingFix: React.FC<CravingFixProps> = ({ currentFoodStyle }) => {
  const [selectedCraving, setSelectedCraving] = useState<string | null>(null);

  const categories = Object.keys(CRAVING_RECIPES);

  const handleSelect = (cat: string) => {
    if (selectedCraving === cat) {
      setSelectedCraving(null);
    } else {
      setSelectedCraving(cat);
    }
  };

  // Filter recipes based on current food style if set
  const getFilteredRecipes = (cat: string): CravingRecipe[] => {
    const raw = CRAVING_RECIPES[cat] || [];
    if (!currentFoodStyle) return raw;

    const filtered = raw.filter((item) => {
      if (!item.styles) return true;
      return item.styles.includes(currentFoodStyle);
    });

    return filtered.length > 0 ? filtered : raw;
  };

  return (
    <section id="cravings" className="bg-white dark:bg-[#10141D] border border-slate-200/90 dark:border-[#1E2638] rounded-3xl p-6 sm:p-9 my-8 max-w-4xl mx-auto shadow-xl dark:shadow-2xl transition-all relative">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-[#FF6B00]/10 border border-amber-200/80 dark:border-[#FF6B00]/25 text-amber-800 dark:text-[#FF6B00] text-[10px] font-['Outfit'] font-black tracking-[0.2em] uppercase mb-2">
          <Flame className="w-3.5 h-3.5" />
          <span>SMART PALATE CRUSHERS</span>
        </div>
        <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight uppercase">
          Athletic Craving Fix
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
          Satisfy intense taste cravings without blowing your macronutrient targets or gut digestion.
        </p>
      </div>

      {/* Craving Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-8">
        {categories.map((cat) => {
          const isSelected = selectedCraving === cat;
          return (
            <motion.button
              key={cat}
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(cat)}
              className={`p-3 rounded-xl text-left border text-xs font-['Outfit'] font-bold transition-colors duration-150 cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-amber-50 dark:bg-[#FF6B00]/15 text-slate-950 dark:text-white border-amber-500 dark:border-[#FF6B00] shadow-[0_0_15px_rgba(245,158,11,0.2)] dark:shadow-[0_0_15px_rgba(255,107,0,0.2)] ring-1 ring-amber-500 dark:ring-[#FF6B00]'
                  : 'bg-slate-50 dark:bg-[#0B0E15] text-slate-700 dark:text-[#CBD5E1] border-slate-200 dark:border-[#1E2638] hover:border-slate-300 dark:hover:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#141A26]'
              }`}
            >
              <span className="truncate">{cat}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-[#FF6B00] stroke-[3] shrink-0 ml-1" />}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Craving Options Output with butter-smooth unfolding */}
      <AnimatePresence>
        {selectedCraving && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-slate-200 dark:border-[#1E2638]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-[#FF6B00]/15 text-amber-700 dark:text-[#FF6B00] flex items-center justify-center border border-amber-200 dark:border-[#FF6B00]/30">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <h3 className="font-['Outfit'] font-black text-xl text-slate-950 dark:text-white uppercase tracking-tight">
                    {selectedCraving} Athletic Alternatives
                  </h3>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCraving(null)}
                  className="text-xs text-slate-500 hover:text-slate-950 dark:text-[#94A3B8] dark:hover:text-white flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1A2333]"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFilteredRecipes(selectedCraving).map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-50/90 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-[#FF6B00]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-[#FF6B00] uppercase tracking-wider">
                          Craving Hack #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#1A2333] border border-emerald-200 dark:border-transparent text-emerald-800 dark:text-[#CCFF00] text-[10px] font-mono font-bold">
                          Macro Friendly
                        </span>
                      </div>
                      <h4 className="font-['Outfit'] text-base font-bold text-slate-950 dark:text-white mb-2.5">
                        {item.name}
                      </h4>

                      {item.ingredients && (
                        <div className="mb-3 text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                          <strong className="block text-slate-950 dark:text-white mb-0.5 font-['Outfit'] font-bold uppercase tracking-wider text-[10px]">
                            Ingredients:
                          </strong>
                          {item.ingredients}
                        </div>
                      )}

                      {item.steps && (
                        <div className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
                          <strong className="block text-slate-950 dark:text-white mb-0.5 font-['Outfit'] font-bold uppercase tracking-wider text-[10px]">
                            Execution:
                          </strong>
                          {item.steps}
                        </div>
                      )}
                    </div>

                    {item.alternatives && item.alternatives.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 dark:border-[#182030]">
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#64748B] block mb-1.5 uppercase tracking-wider">
                          More athletic variations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.alternatives.map((alt, altIdx) => (
                            <span
                              key={altIdx}
                              className="inline-block px-2.5 py-1 rounded-lg bg-white dark:bg-[#141A26] border border-slate-200 dark:border-[#253249] text-[11px] font-medium text-slate-700 dark:text-[#CBD5E1] shadow-xs"
                            >
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
