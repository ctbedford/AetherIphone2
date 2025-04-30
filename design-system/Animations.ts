// design-system/Animations.ts
// Moti animation presets for consistent effects across the app

// Fade in from bottom
export const fadeInUp = {
  from: { opacity: 0, translateY: 16 },
  animate: { opacity: 1, translateY: 0 },
  exit: { opacity: 0, translateY: 16 },
  transition: { type: 'timing', duration: 350 },
};

// Slide out to left (for swipe to complete)
export const slideOutLeft = {
  from: { translateX: 0 },
  animate: { translateX: -100 },
  exit: { translateX: -100 },
  transition: { type: 'spring', dampingRatio: 0.7 },
};

// Zelda-themed glowing effect
export const sheikahGlow = {
  from: { opacity: 0.4, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0.4, scale: 0.95 },
  transition: { type: 'timing', duration: 800, loop: true },
};

// Task completion animation
export const taskComplete = {
  from: { opacity: 1, translateX: 0 },
  animate: { opacity: 0.6, translateX: -5 },
  transition: { type: 'spring', dampingRatio: 0.8 },
};

// Korok reveal animation (for success states)
export const korokReveal = {
  from: { opacity: 0, scale: 0.7, rotate: '-10deg' },
  animate: { opacity: 1, scale: 1, rotate: '0deg' },
  transition: { type: 'spring', dampingRatio: 0.6 },
};
