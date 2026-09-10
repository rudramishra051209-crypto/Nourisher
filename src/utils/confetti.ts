import confetti from 'canvas-confetti';

/**
 * High-voltage celebration for generating a personalized nutrition plan
 */
export const triggerPlanConfetti = () => {
  const count = 120;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#CCFF00', '#10B981', '#00F0FF', '#F59E0B', '#FFFFFF'],
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

/**
 * Hydration target achieved celebration
 */
export const triggerHydrationConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#38BDF8', '#0284C7', '#00F0FF', '#CCFF00', '#FFFFFF'],
    zIndex: 9999,
  });
};

/**
 * 1-Rep Max or Personal Record celebration
 */
export const triggerPrConfetti = () => {
  confetti({
    particleCount: 90,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#CCFF00', '#F59E0B', '#10B981'],
    zIndex: 9999,
  });
  confetti({
    particleCount: 90,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#CCFF00', '#F59E0B', '#10B981'],
    zIndex: 9999,
  });
};

export const triggerPRConfetti = triggerPrConfetti;

/**
 * Workout complete or set completed celebration
 */
export const triggerWorkoutDoneConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.65 },
    colors: ['#CCFF00', '#10B981', '#F59E0B', '#00F0FF'],
    zIndex: 9999,
  });
};

/**
 * Profile saved celebration
 */
export const triggerProfileSavedConfetti = () => {
  confetti({
    particleCount: 45,
    spread: 45,
    origin: { y: 0.5 },
    colors: ['#10B981', '#CCFF00', '#FFFFFF'],
    zIndex: 9999,
  });
};
