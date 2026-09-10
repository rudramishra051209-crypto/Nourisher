import { HTMLMotionProps, Variants } from 'motion/react';
export { ScrollReveal } from '../components/common/ScrollReveal';

// Refined easing curves
export const EASING = {
  spring: { type: 'spring', stiffness: 380, damping: 28 },
  gentleSpring: { type: 'spring', stiffness: 260, damping: 24 },
  smoothOut: [0.16, 1, 0.3, 1] as const,
  smoothInOut: [0.65, 0, 0.35, 1] as const,
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Reusable Variants for Staggered Containers
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: EASING.smoothOut,
    },
  },
};

export const cardHoverMotion: HTMLMotionProps<'div'> = {
  whileHover: {
    y: -3,
    scale: 1.008,
    transition: { duration: 0.22, ease: EASING.smoothOut },
  },
  whileTap: {
    scale: 0.99,
    transition: { duration: 0.12 },
  },
};

export const buttonMicroMotion: HTMLMotionProps<'button'> = {
  whileHover: {
    scale: 1.015,
    y: -1,
    transition: { duration: 0.18, ease: EASING.smoothOut },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};
