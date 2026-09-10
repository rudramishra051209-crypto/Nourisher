import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { EASING } from '../../utils/motion';

export interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
  blur?: boolean;
}

/**
 * Premium ScrollReveal component with GPU-accelerated transforms and smooth in-view entrance
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 24,
  className = '',
  blur = true,
  ...props
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance, x: 0 };
      case 'down': return { y: -distance, x: 0 };
      case 'left': return { x: distance, y: 0 };
      case 'right': return { x: -distance, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...initialPos,
        filter: blur ? 'blur(6px)' : 'none',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.55,
        delay,
        ease: EASING.smoothOut,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
