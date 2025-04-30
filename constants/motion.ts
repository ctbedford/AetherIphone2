export const durations = {
  short:   150,
  medium:  300,
  long:    600
};

export const easings = {
  standard:    (x: number) => x * (2 - x),  // ease-out quad
  decelerate:  (x: number) => 1 - (1 - x) * (1 - x),
  accelerate:  (x: number) => x * x
};

export const presets = {
  fadeInUp: {
    from:  { opacity: 0, translateY: 8 },
    to:    { opacity: 1, translateY: 0, duration: durations.medium }
  }
};
