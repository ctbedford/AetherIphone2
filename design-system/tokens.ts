// design-system/tokens.ts
// Shared tokens used by both NativeWind and Gluestack UI

export const colors = {
  // Zelda theme colors from memories
  'parchment': '#FDFFE0',
  'sheikahCyan': '#86A5A9',
  'korokGreen': '#92C582',
  'darkText': '#536F50',
  'guardianOrange': '#FF9F0A',
  'darkTealBg': '#1A2E3A',
  'cyanGlow': '#64FFDA',
  
  // Semantic aliases
  'surface': '#FDFFE0', // parchment in light mode
  'onSurface': '#536F50', // darkText in light mode
  'outline': '#86A5A9', // sheikahCyan in both modes
  
  // Shadow colors with opacities
  'shadowSm': 'rgba(83, 111, 80, 0.10)', // Light theme
  'shadowMd': 'rgba(83, 111, 80, 0.15)',
  'shadowLg': 'rgba(83, 111, 80, 0.20)',
  'shadowDarkSm': 'rgba(0, 0, 0, 0.20)', // Dark theme
  'shadowDarkMd': 'rgba(0, 0, 0, 0.30)',
  'shadowDarkLg': 'rgba(0, 0, 0, 0.40)',
};

export const radii = {
  'sm': 4,
  'md': 8,
  'lg': 16,
  'xl': 24,
  'full': 9999,
};

export const space = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
};

export const sizes = {
  ...space,
};

export const fonts = {
  'heading': 'HyliaSerif',
  'body': 'CalamitySans',
  'mono': 'SpaceMono',
};

// Default export with all tokens
export default {
  colors,
  radii,
  space,
  sizes,
  fonts,
};
