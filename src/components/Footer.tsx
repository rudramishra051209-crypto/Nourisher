import React from 'react';
import { motion } from 'motion/react';
import { Zap, Heart, ArrowUp, Dumbbell, Utensils, Droplets, ShieldCheck, Shield } from 'lucide-react';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B0E15] text-slate-600 dark:text-[#94A3B8] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-[#182030]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-[#CCFF00] flex items-center justify-center text-[#CCFF00] dark:text-[#090C12] font-black text-sm">
                N
              </div>
              <span className="font-['Outfit'] font-black tracking-tight text-xl text-slate-950 dark:text-white uppercase">
                NOURISH
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#CCFF00]/10 border border-emerald-200/80 dark:border-[#CCFF00]/25 text-emerald-800 dark:text-[#CCFF00]">
                BY KALASH
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#64748B] max-w-sm leading-relaxed">
              Practical nutrition planning, scientific workout splits, and calorie guidance engineered for lifters, athletes, and real-world adherence.
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#141A26] dark:hover:bg-[#1E2638] text-slate-800 dark:text-white border border-slate-200 dark:border-[#263147] text-xs font-['Outfit'] font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
          </motion.button>
        </div>

        {/* Quick Nav Anchors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-b border-slate-100 dark:border-[#182030] text-xs">
          <div>
            <span className="font-['Outfit'] font-bold text-slate-950 dark:text-white uppercase tracking-wider block mb-2">
              Nutrition
            </span>
            <ul className="space-y-1.5 text-slate-500 dark:text-[#94A3B8]">
              <li><a href="#form" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">Plan Builder</a></li>
              <li><a href="#results" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">Calorie Targets</a></li>
              <li><a href="#cravings" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">Craving Crusher</a></li>
            </ul>
          </div>
          <div>
            <span className="font-['Outfit'] font-bold text-slate-950 dark:text-white uppercase tracking-wider block mb-2">
              Training
            </span>
            <ul className="space-y-1.5 text-slate-500 dark:text-[#94A3B8]">
              <li><a href="#workoutBuilder" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">Workout Split Generator</a></li>
              <li><a href="#gymTools" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">Rest Interval Timer</a></li>
              <li><a href="#gymTools" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">1RM Strength Matrix</a></li>
            </ul>
          </div>
          <div>
            <span className="font-['Outfit'] font-bold text-slate-950 dark:text-white uppercase tracking-wider block mb-2">
              Body Composition
            </span>
            <ul className="space-y-1.5 text-slate-500 dark:text-[#94A3B8]">
              <li><a href="#bodyFat" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">Navy Body Fat %</a></li>
              <li><a href="#bodyFat" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">Lean Mass Calculation</a></li>
              <li><a href="#gymTools" className="hover:text-emerald-600 dark:hover:text-[#CCFF00] transition">Hydration Tracker</a></li>
            </ul>
          </div>
          <div>
            <span className="font-['Outfit'] font-bold text-slate-950 dark:text-white uppercase tracking-wider block mb-2">
              Principles
            </span>
            <ul className="space-y-1.5 text-slate-500 dark:text-[#94A3B8]">
              <li className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-[#CCFF00]" /> Real Whole Foods</li>
              <li className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-[#CCFF00]" /> 1.6–2.2g/kg Protein</li>
              <li className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-[#CCFF00]" /> Progressive Overload</li>
            </ul>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-[#64748B]">
          <div className="flex items-center gap-3">
            <span>
              Designed & Engineered with athletic precision by <strong className="text-slate-800 dark:text-white font-['Outfit']">Kalash</strong>.
            </span>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-emerald-600 dark:hover:text-[#CCFF00] transition cursor-pointer"
                title="Admin Section"
              >
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}
          </div>
          <div className="font-mono text-[11px]">
            © {new Date().getFullYear()} NOURISH • All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
};
