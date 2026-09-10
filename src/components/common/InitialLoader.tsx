import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell } from 'lucide-react';
import { prefersReducedMotion } from '../../utils/motion';

export const InitialLoader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // If reduced motion is preferred or already seen in session, skip immediately
    if (prefersReducedMotion()) {
      setShow(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) {
        setTimeout(onComplete, 350);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4F6F9] dark:bg-[#090B10] pointer-events-none"
        >
          <div className="flex flex-col items-center">
            {/* Pulsing Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#CCFF00] to-[#99CC00] text-[#090C12] flex items-center justify-center shadow-[0_0_25px_rgba(204,255,0,0.4)] mb-3"
            >
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="font-['Outfit'] font-black tracking-[0.2em] text-lg text-slate-900 dark:text-white uppercase"
            >
              NOURISH<span className="text-emerald-600 dark:text-[#CCFF00]">PRO</span>
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.2 }}
              className="text-[10px] tracking-[0.25em] text-slate-400 dark:text-[#64748B] font-mono mt-1"
            >
              INITIALIZING PROTOCOLS...
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
