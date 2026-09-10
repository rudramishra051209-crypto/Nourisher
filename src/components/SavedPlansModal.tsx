import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { Bookmark, X, Trash2, Calendar, ArrowRight, UserCheck, Download, Loader2 } from 'lucide-react';
import { calculatePersonalizedNutrition } from '../utils/nutritionEngine';
import { generateDietPlanPdf } from '../utils/pdfGenerator';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProfiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onDeleteProfile: (id: string) => void;
  onClearAllProfiles?: () => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  savedProfiles,
  onSelectProfile,
  onDeleteProfile,
  onClearAllProfiles,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadSavedPdf = (p: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(p.id);
    try {
      const planOutput = calculatePersonalizedNutrition({
        ageGroup: p.ageGroup,
        exactAge: p.age,
        height: p.height,
        weight: p.weight,
        sex: p.sex || undefined,
        activity: p.activity || undefined,
        foodStyle: p.foodStyle,
        mainGoal: p.mainGoal,
        energyGoal: p.energyGoal,
        budget: p.budget,
      });

      generateDietPlanPdf({
        ageGroup: p.ageGroup,
        exactAge: p.age,
        height: p.height,
        weight: p.weight,
        sex: p.sex || undefined,
        activity: p.activity || undefined,
        foodStyle: p.foodStyle,
        mainGoal: p.mainGoal,
        energyGoal: p.energyGoal,
        budget: p.budget,
        planOutput,
        activeMeals: planOutput.meals,
      });
    } catch (err) {
      console.error('Error downloading saved profile PDF:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#10141D] border border-slate-200 dark:border-[#1E2638] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1C2436] mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-[#CCFF00]/15 text-emerald-700 dark:text-[#CCFF00] flex items-center justify-center border border-emerald-200 dark:border-[#CCFF00]/30">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-['Outfit'] font-black text-lg text-slate-950 dark:text-white uppercase tracking-tight">
                  Saved Profiles
                </h3>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  {savedProfiles.length} {savedProfiles.length === 1 ? 'profile' : 'profiles'} saved on this device
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C2436] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {savedProfiles.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#141A26] text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h4 className="font-['Outfit'] font-bold text-sm text-slate-800 dark:text-white mb-1">
                  No Saved Profiles Yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-xs mx-auto">
                  Configure your preferences in the Plan Builder and tap “Save Profile” to switch easily between bulking, cutting, or family presets.
                </p>
              </div>
            ) : (
              savedProfiles.map((p) => {
                const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Saved Preset';

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0B0E15] border border-slate-200 dark:border-[#1E2638] hover:border-emerald-500 dark:hover:border-[#CCFF00] transition group flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div 
                      onClick={() => {
                        onSelectProfile(p);
                        onClose();
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-['Outfit'] font-bold text-sm text-slate-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-[#CCFF00] transition">
                          {p.name || 'Athletic Preset'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046] text-[10px] font-mono text-emerald-800 dark:text-[#CCFF00] font-bold">
                          {p.foodStyle}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-[#94A3B8] flex items-center gap-2 flex-wrap font-mono">
                        <span>{p.mainGoal}</span>
                        <span>•</span>
                        <span>{p.energyGoal}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadSavedPdf(p, e)}
                        disabled={downloadingId === p.id}
                        className="p-2 rounded-xl text-emerald-600 dark:text-[#CCFF00] hover:bg-emerald-50 dark:hover:bg-[#CCFF00]/10 border border-transparent hover:border-emerald-200 dark:hover:border-[#CCFF00]/30 transition cursor-pointer"
                        title="Download profile as PDF"
                      >
                        {downloadingId === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProfile(p);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 dark:bg-[#CCFF00] hover:bg-emerald-700 dark:hover:bg-[#BAE600] text-white dark:text-[#090C12] text-xs font-['Outfit'] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-sm"
                        title="Load profile into plan"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProfile(p.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                        title="Delete saved profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-[#1C2436] mt-4 flex items-center justify-between">
            {savedProfiles.length > 0 && onClearAllProfiles ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all saved profiles from this device?')) {
                    onClearAllProfiles();
                  }
                }}
                className="text-xs text-red-500 hover:text-red-600 hover:underline flex items-center gap-1.5 transition cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Profiles
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141A26] dark:hover:bg-[#1E2638] text-slate-800 dark:text-white text-xs font-['Outfit'] font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
