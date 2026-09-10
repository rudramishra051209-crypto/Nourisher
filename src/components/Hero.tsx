import React from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Flame, Zap, Quote, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { EASING, prefersReducedMotion } from '../utils/motion';

export const Hero: React.FC = () => {
  const reducedMotion = prefersReducedMotion();

  const scrollToPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    const startEl = document.getElementById('start');
    if (startEl) {
      startEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSplits = (e: React.MouseEvent) => {
    e.preventDefault();
    const splitEl = document.getElementById('workoutBuilder');
    if (splitEl) {
      splitEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featureBadges = [
    { label: 'Calculated BMR & Surpluses', icon: Flame, color: 'text-orange-500 dark:text-[#FF6B00]' },
    { label: 'High-Protein Meal Swaps', icon: Zap, color: 'text-emerald-600 dark:text-[#CCFF00]' },
    { label: '6-Day / PPL / Upper-Lower Splits', icon: Dumbbell, color: 'text-cyan-600 dark:text-[#00F0FF]' },
    { label: 'Gym Rest & Hydration Tools', icon: Trophy, color: 'text-emerald-600 dark:text-[#CCFF00]' },
  ];

  return (
    <section className="text-center pt-8 sm:pt-12 pb-8 px-4 sm:px-6 max-w-4xl mx-auto relative overflow-hidden">
      {/* Background ambient glow with soft pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.35, 0.55, 0.35],
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22rem] sm:w-[28rem] h-[22rem] sm:h-[28rem] bg-emerald-400/10 dark:bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* Pill Badge */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: EASING.smoothOut }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-[#141A26] border border-emerald-200/80 dark:border-[#253247] text-emerald-800 dark:text-[#CCFF00] text-[11px] font-['Outfit'] font-black tracking-[0.2em] uppercase mb-5 shadow-[0_2px_12px_rgba(16,185,129,0.1)] dark:shadow-[0_0_20px_rgba(204,255,0,0.1)] transition-colors"
      >
        <Flame className="w-3.5 h-3.5 text-orange-500 dark:text-[#FF6B00]" />
        <span>ATHLETIC FUEL & HYPERTROPHY PROTOCOLS</span>
      </motion.div>

      {/* Main Title with Staggered Lines */}
      <div className="overflow-hidden mb-5">
        <motion.h1
          initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, delay: 0.2, ease: EASING.smoothOut }}
          className="font-['Outfit'] text-4xl sm:text-6xl md:text-7xl text-slate-950 dark:text-white font-black tracking-tight uppercase leading-[0.98] transition-colors"
        >
          Fuel Stronger. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-[#CCFF00] dark:via-[#A6E22E] dark:to-[#00F0FF]">
            Train Harder.
          </span>
        </motion.h1>
      </div>

      {/* Supporting Text */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32, ease: EASING.smoothOut }}
        className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-7 transition-colors"
      >
        Build high-performance meal plans around your exact food style, budget, and calorie goals. Pair with hypertrophy training splits and in-gym recovery tools.
      </motion.p>

      {/* Interactive CTA Buttons with Arrow micro-interaction */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4, ease: EASING.smoothOut }}
        className="flex flex-wrap items-center justify-center gap-3 mb-8"
      >
        <motion.a
          href="#start"
          onClick={scrollToPlan}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group px-6 py-3 rounded-xl bg-slate-950 dark:bg-[#CCFF00] hover:bg-slate-900 dark:hover:bg-[#BAE600] text-[#CCFF00] dark:text-[#090C12] font-['Outfit'] font-black text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2 shadow-lg dark:shadow-[0_0_25px_rgba(204,255,0,0.25)] transition-all cursor-pointer"
        >
          <span>Build Nutrition Plan</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1.5 transition-transform duration-200" />
        </motion.a>
        <motion.a
          href="#workoutBuilder"
          onClick={scrollToSplits}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group px-5 py-3 rounded-xl bg-white dark:bg-[#121722] hover:bg-slate-50 dark:hover:bg-[#192233] text-slate-800 dark:text-white border border-slate-200 dark:border-[#26334A] font-['Outfit'] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
          <span>Explore Workout Splits</span>
        </motion.a>
      </motion.div>

      {/* Key Feature Badges with subtle staggered entrance */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.07, delayChildren: 0.48 },
          },
        }}
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8"
      >
        {featureBadges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 10 },
                visible: { opacity: 1, scale: 1, y: 0 },
              }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-[#1E2638] text-xs font-bold text-slate-700 dark:text-[#CBD5E1] shadow-sm transition-colors cursor-default"
            >
              <Icon className={`w-3.5 h-3.5 ${badge.color}`} />
              <span>{badge.label}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Kalash Quote Card with subtle hover lift */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.6, ease: EASING.smoothOut }}
        whileHover={reducedMotion ? {} : { y: -3, scale: 1.005 }}
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-[#1E2638] p-6 sm:p-7 text-center shadow-md dark:shadow-xl transition-all"
      >
        <div className="flex justify-center mb-2 text-emerald-500/30 dark:text-[#CCFF00]/40">
          <Quote className="w-8 h-8 rotate-180" />
        </div>
        <p className="font-['Outfit'] italic text-base sm:text-xl text-slate-800 dark:text-[#F1F5F9] font-medium leading-relaxed max-w-xl mx-auto">
          “Good nutrition isn't about eating perfectly. It's about making better choices consistently.”
        </p>
        <div className="mt-3 text-[10px] sm:text-[11px] font-['Outfit'] font-extrabold tracking-[0.25em] text-emerald-700 dark:text-[#CCFF00] uppercase">
          — WRITTEN BY KALASH
        </div>
      </motion.div>
    </section>
  );
};
