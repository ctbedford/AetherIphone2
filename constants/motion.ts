import { Easing } from 'react-native-reanimated';

/**
 * Standard animation durations (in milliseconds)
 */
export const durations = {
  /** Ultra-fast for micro-interactions */
  micro: 80,
  /** Tap/press feedback */
  tap: 120,
  /** Default animation speed for most UI transitions */
  standard: 200,
  /** For more noticeable animations */
  medium: 250,
  /** Modal entrances/exits, complex transitions */
  modal: 300,
  /** Full screen transitions */
  screen: 350,
  /** Extended animations for emphasis */
  long: 450,
};

/**
 * Standard easing curves
 */
export const easings = {
  /** Quick acceleration, gradual deceleration - for elements entering the screen */
  enter: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  /** Gradual acceleration, quick deceleration - for elements exiting the screen */
  exit: Easing.bezier(0.25, 0.0, 0.2, 1.0),
  /** For transitions between UI states */
  standard: Easing.bezier(0.4, 0.0, 0.2, 1.0),
  /** Quick in, quick out - for emphasis */
  energetic: Easing.bezier(0.55, 0.0, 0.1, 1.0),
  /** Linear - consistent motion with no acceleration/deceleration */
  linear: Easing.linear,
  /** Slow start, fast finish */
  accelerate: Easing.in(Easing.quad),
  /** Fast start, slow finish */
  decelerate: Easing.out(Easing.quad),
  /** Fast start and end, slower in the middle */
  emphasize: Easing.inOut(Easing.quad),
};

/**
 * Animation presets for common UI patterns
 */
export const presets = {
  fadeIn: {
    duration: durations.standard,
    easing: easings.enter,
  },
  fadeOut: {
    duration: durations.standard,
    easing: easings.exit,
  },
  slideIn: {
    duration: durations.modal,
    easing: easings.enter,
  },
  slideOut: {
    duration: durations.modal,
    easing: easings.exit,
  },
  scaleIn: {
    duration: durations.standard,
    easing: easings.emphasize,
  },
  scaleOut: {
    duration: durations.standard,
    easing: easings.emphasize,
  },
  tapFeedback: {
    duration: durations.tap,
    easing: easings.emphasize,
  },
  skeleton: {
    duration: durations.long * 2,
    easing: easings.linear,
  },
};

/**
 * Animation values for specific components
 */
export const componentAnimations = {
  toast: {
    show: {
      duration: durations.modal,
      easing: easings.enter,
    },
    hide: {
      duration: durations.standard,
      easing: easings.exit,
    },
  },
  modal: {
    overlay: {
      show: {
        duration: durations.modal,
        easing: easings.standard,
      },
      hide: {
        duration: durations.modal,
        easing: easings.standard,
      },
    },
    content: {
      show: {
        duration: durations.modal,
        easing: easings.enter,
      },
      hide: {
        duration: durations.standard,
        easing: easings.exit,
      },
    },
  },
  button: {
    press: {
      duration: durations.tap,
      easing: easings.emphasize,
    },
    release: {
      duration: durations.tap,
      easing: easings.emphasize,
    },
  },
  navigation: {
    screen: {
      duration: durations.screen,
      easing: easings.standard,
    },
    tab: {
      duration: durations.standard,
      easing: easings.standard,
    },
  },
}; 