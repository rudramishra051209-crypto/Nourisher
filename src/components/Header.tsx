import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Dumbbell, 
  Zap, 
  Flame, 
  Utensils, 
  Sun, 
  Moon, 
  Percent, 
  Menu,
  X 
} from 'lucide-react';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { EASING, prefersReducedMotion } from '../utils/motion';

interface HeaderProps {
  profile?: UserProfile | null;
  savedProfilesCount?: number;
  onOpenSavedModal?: () => void;
  onOpenProfile?: () => void;
}

const NAV_ITEMS = [
  { id: 'start', label: 'Nutrition', href: '#start', icon: Utensils },
  { id: 'cravings', label: 'Cravings', href: '#cravings', icon: Flame },
  { id: 'bodyFat', label: 'Body Fat', href: '#bodyFat', icon: Percent },
  { id: 'workoutBuilder', label: 'Workouts', href: '#workoutBuilder', icon: Dumbbell },
  { id: 'gymTools', label: 'Gym Tools', href: '#gymTools', icon: Zap },
];

export const Header: React.FC<HeaderProps> = ({ 
  profile, 
  savedProfilesCount = 0, 
  onOpenSavedModal, 
  onOpenProfile 
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const ignoreScrollUntilRef = useRef<number>(0);

  // Synchronize scroll position with dynamic dock highlight (scroll-spy)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      // Don't override while programmatic smooth scrolling is in progress
      if (Date.now() < ignoreScrollUntilRef.current) {
        return;
      }

      // If at top of the page before the main content sections
      if (scrollY < 120) {
        setActiveNav(null);
        return;
      }

      // Check if user is near the bottom of the page
      const windowBottom = window.innerHeight + scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight - windowBottom < 90) {
        setActiveNav('gymTools');
        return;
      }

      // Focal reference line: roughly 220px from the top (just underneath the floating header)
      const focalY = 220;
      let matchedSection: string | null = null;

      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= focalY && rect.bottom > focalY) {
            matchedSection = item.id;
            break;
          }
        }
      }

      // Fallback: if focal line falls into gap between cards, choose the section closest to focal line
      if (!matchedSection) {
        let minDistance = Infinity;
        for (const item of NAV_ITEMS) {
          const el = document.getElementById(item.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
              const distance = Math.abs(rect.top - focalY);
              if (distance < minDistance) {
                minDistance = distance;
                matchedSection = item.id;
              }
            }
          }
        }
      }

      if (matchedSection) {
        setActiveNav(matchedSection);
      }
    };

    // When the user physically initiates scrolling (wheel or touch), instantly re-enable scroll detection
    const handleUserInteraction = () => {
      ignoreScrollUntilRef.current = 0;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
    };
  }, []);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getInitials = (name?: string) => {
    if (!name?.trim()) return 'ATH';
    return name
      .trim()
      .split(/\s+/)
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleNavClick = (id: string, href: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (activeNav === id) {
      // Tap again -> unselect!
      setActiveNav(null);
      ignoreScrollUntilRef.current = Date.now() + 1500;
    } else {
      // Tap different category -> select new, unselect previous!
      setActiveNav(id);
      ignoreScrollUntilRef.current = Date.now() + 850;
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  const reducedMotion = prefersReducedMotion();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: EASING.smoothOut }}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-[#090C12]/85 backdrop-blur-xl border-b border-slate-200/90 dark:border-[#1E2638] shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'bg-white/70 dark:bg-[#090C12]/70 backdrop-blur-md border-b border-slate-200/50 dark:border-[#1E2638]/60'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between relative gap-2">
        {/* Brand Logo & Creator */}
        <motion.a
          href="#"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
          aria-label="NOURISH PRO Homepage"
        >
          <motion.div 
            whileHover={{ rotate: 8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CCFF00] to-[#99CC00] text-[#090C12] flex items-center justify-center font-['Outfit'] font-black text-base shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-shadow group-hover:shadow-[0_0_20px_rgba(204,255,0,0.5)]"
          >
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Outfit'] font-black tracking-[0.15em] text-sm sm:text-base text-slate-900 dark:text-white uppercase transition-colors">
                NOURISH<span className="text-emerald-600 dark:text-[#CCFF00]">PRO</span>
              </span>
              <span className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1C2536] border border-slate-200 dark:border-[#2B3852] text-[9px] font-bold text-slate-700 dark:text-[#CCFF00] uppercase tracking-wider">
                GYM EDITION
              </span>
            </div>
            <span className="text-[10px] tracking-wider text-slate-500 dark:text-[#64748B] font-semibold block">
              BY KALASH
            </span>
          </div>
        </motion.a>

        {/* Unified Header Floating Dock */}
        <nav 
          className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-100/90 dark:bg-[#0E121B]/90 backdrop-blur-xl border border-slate-200/90 dark:border-[#20293D] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)] ring-1 ring-black/5 dark:ring-white/5 select-none"
          onMouseLeave={() => setHoveredNav(null)}
          aria-label="Floating Dock Navigation"
        >
          {/* Dock Links with Active Indicator Pill & Proximity Scaling */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = activeNav === item.id;
            const isHovered = hoveredNav === item.id;

            return (
              <motion.a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(item.id, item.href, e)}
                onMouseEnter={() => setHoveredNav(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-['Outfit'] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'text-slate-950 dark:text-[#090C12]'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="headerDockActive"
                    className="absolute inset-0 rounded-full bg-white dark:bg-[#CCFF00] shadow-sm -z-10 border border-slate-200/80 dark:border-transparent"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: isHovered && !reducedMotion ? 1.15 : 1,
                    rotate: isHovered && !reducedMotion ? 4 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-700 dark:text-[#090C12]' : 'opacity-75'}`} />
                </motion.div>
                <span className="text-[11px] font-extrabold">{item.label}</span>
              </motion.a>
            );
          })}
        </nav>

        {/* Right Controls: Theme Toggle & Athlete Profile & Mobile Menu Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Theme Option Toggle Button */}
          <motion.button
            id="themeToggle"
            type="button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#26334A] bg-white dark:bg-[#121722] hover:bg-slate-100 dark:hover:bg-[#171E2D] hover:border-slate-300 dark:hover:border-[#CCFF00]/50 text-slate-700 dark:text-[#CCFF00] transition-colors shadow-sm cursor-pointer"
            title={isDark ? "Switch to Titanium Light Theme" : "Switch to Obsidian Gym Dark Theme"}
            aria-label="Toggle visual theme"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-[#CCFF00] group-hover:rotate-45 transition-transform duration-300" />
                <span className="hidden sm:inline text-[11px] font-['Outfit'] font-black tracking-wider uppercase text-slate-200">
                  LIGHT
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline text-[11px] font-['Outfit'] font-black tracking-wider uppercase text-slate-800">
                  DARK
                </span>
              </>
            )}
          </motion.button>

          {/* Athlete Profile / Saved Plans Button */}
          <motion.button
            id="openProfile"
            type="button"
            onClick={onOpenSavedModal || onOpenProfile}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="group flex items-center space-x-2.5 px-3 sm:px-4 py-1.5 rounded-xl border border-slate-200 dark:border-[#26334A] bg-white dark:bg-[#121722] hover:bg-slate-100 dark:hover:bg-[#171E2D] hover:border-slate-300 dark:hover:border-[#CCFF00]/60 transition-colors shadow-sm cursor-pointer"
            aria-label="Open athlete presets and saved plans"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#1D2738] text-slate-800 dark:text-[#CCFF00] flex items-center justify-center text-[10px] font-black">
              {profile?.name ? (
                getInitials(profile.name)
              ) : (
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-[#CCFF00]" />
              )}
            </div>
            <div className="text-left">
              <span className="text-[11px] font-['Outfit'] font-black tracking-wider uppercase text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-[#CCFF00] transition-colors leading-tight">
                {profile?.name ? profile.name.split(' ')[0] : 'SAVED PLANS'}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-[#64748B] block font-mono">
                {savedProfilesCount > 0 ? `${savedProfilesCount} SAVED` : (profile?.mainGoal ? profile.mainGoal.split(' ')[0] : 'PRESETS')}
              </span>
            </div>
          </motion.button>

          {/* Mobile Hamburger Menu Toggle */}
          <motion.button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.92 }}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-[#26334A] bg-white dark:bg-[#121722] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#171E2D] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer Navigation with Staggered Items */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASING.smoothOut }}
            className="md:hidden border-t border-slate-200 dark:border-[#1E2638] bg-white/95 dark:bg-[#0B0E15]/95 backdrop-blur-xl px-4 py-3 overflow-hidden"
          >
            <div className="text-[10px] font-['Outfit'] font-black tracking-[0.2em] text-slate-400 dark:text-[#64748B] uppercase mb-2">
              NAVIGATION
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = activeNav === item.id;

                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      handleNavClick(item.id, item.href, e);
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-['Outfit'] font-bold uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 dark:bg-[#CCFF00]/15 border-emerald-500 dark:border-[#CCFF00] text-emerald-900 dark:text-[#CCFF00]'
                        : 'bg-slate-50 dark:bg-[#121722] border-slate-100 dark:border-[#1E2638] text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected 
                        ? 'bg-emerald-600 text-white dark:bg-[#CCFF00] dark:text-[#090C12]' 
                        : 'bg-slate-200/70 dark:bg-[#1C2536] text-slate-700 dark:text-slate-300'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{item.label}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
