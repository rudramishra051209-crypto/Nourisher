import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { prefersReducedMotion } from '../../utils/motion';

interface MagneticProps {
  children: React.ReactNode;
  strength?: number; // Maximum offset in px
  className?: string;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 8,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    if (!ref.current) return;
    
    // Only on pointer devices with hover (desktop)
    if (window.matchMedia('(hover: none)').matches) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (clientX - centerX) / (width / 2);
    const deltaY = (clientY - centerY) / (height / 2);

    setPosition({
      x: deltaX * strength,
      y: deltaY * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 20,
        mass: 0.2,
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};
