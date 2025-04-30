// tamagui.config.ts
import { createAnimations } from '@tamagui/animations-react-native';
import { createInterFont } from '@tamagui/font-inter'; 
import { createFont, createTamagui, createTokens } from 'tamagui'; 
import { Platform } from 'react-native';
import * as MotionConstants from '@/constants/motion'; // Import motion constants

// Font definitions
const headingFont = createInterFont({
  family: Platform.select({ web: 'Inter', default: 'InterBold' }), // Assuming InterBold is for headings
  size: {
    1: 12, 2: 14, 3: 15, 4: 16, 5: 18, 6: 20, 7: 24, 8: 30, 9: 36, true: 16,
  },
  lineHeight: {
    1: 18, 2: 22, 3: 24, 4: 26, 5: 28, 6: 32, 7: 36, 8: 44, 9: 52, true: 26,
  },
  weight: {
    4: '400', // Normal/Regular (use 'System' default)
    6: '600', // Semibold (use 'System' default)
    7: '700', // Bold (use 'System' default)
    true: '400',
  },
  letterSpacing: {
    1: 0, 2: 0.1, 3: 0.2, true: 0,
  },
});

const bodyFont = createInterFont({
  family: Platform.select({ web: 'Inter', default: 'Inter' }), // Assuming Inter (Medium) is for body
  size: {
    1: 12, 2: 14, 3: 15, 4: 16, 5: 18, 6: 20, true: 15,
  },
  lineHeight: {
    1: 18, 2: 22, 3: 24, 4: 26, 5: 28, 6: 32, true: 24,
  },
  weight: {
    4: '400',
    5: '500', // Medium (use 'System' default)
    true: '400',
  },
  letterSpacing: {
    1: 0, 2: 0.1, 3: 0.2, true: 0,
  },
});

const monoFont = createFont({ 
  family: Platform.select({ web: 'monospace', default: 'SpaceMono' }), // Correctly matches useFonts
  size: {
    1: 12, 2: 14, 3: 15, 4: 16, 5: 18, 6: 20, true: 15,
  },
  lineHeight: {
    1: 18, 2: 22, 3: 24, 4: 26, 5: 28, 6: 32, true: 24,
  },
  weight: {
    4: '400', // Normal weight
    true: '400',
  },
  letterSpacing: {
    4: 0,
    true: 0,
  },
  face: {
    400: { normal: 'SpaceMono' }, // Map weight 400 to the loaded SpaceMono font
  },
});

// Animation driver using reanimated
const animations = createAnimations({
  fast: {
    type: 'timing',
    duration: MotionConstants.durations.standard,
    // easing: MotionConstants.easings.standard, // Removed as createAnimations defaults work well
  },
  medium: {
    type: 'timing',
    duration: MotionConstants.durations.modal,
  },
  slow: {
    type: 'timing',
    duration: MotionConstants.durations.long,
  },
  bouncy: {
    type: 'spring',
    damping: 9,
    mass: 0.9,
    stiffness: 150,
  },
  lazy: {
    type: 'spring',
    damping: 18,
    stiffness: 50,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
});

// Tokens (refined based on your existing config)
const tokens = createTokens({
  size: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 13: 52, 14: 56, 15: 60, 16: 64, true: 16,
  },
  space: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 13: 52, 14: 56, 15: 60, 16: 64, true: 16, '-1': -4, '-2': -8, '-3': -12, '-4': -16,
  },
  radius: {
    0: 0, 1: 3, 2: 5, 3: 8, 4: 10, 5: 12, 6: 16, 7: 20, 8: 24, 9: 28, 10: 32, true: 10,
  },
  zIndex: { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 },
  color: {
    // Light Theme Brand Colors
    brandBlue: '#007AFF',
    brandGreen: '#34C759',
    brandYellow: '#FFCC00',
    brandRed: '#FF3B30',
    brandPurple: '#5E5CE6',
    brandOrange: '#FF9500',
    brandPink: '#FF2D55',
    brandIndigo: '#5856D6',

    // Dark Theme Brand Colors
    brandBlue_dark: '#0A84FF',
    brandGreen_dark: '#30D158',
    brandYellow_dark: '#FFD60A',
    brandRed_dark: '#FF453A',
    brandPurple_dark: '#5E5CE6', // Often stays the same or similar
    brandOrange_dark: '#FF9F0A',
    brandPink_dark: '#FF375F',
    brandIndigo_dark: '#5E5CE6',

    // Radix Grays (Example - Adapt as needed)
    gray1: '#fcfcfc', gray2: '#f8f8f8', gray3: '#f3f3f3', gray4: '#ededed', gray5: '#e8e8e8', gray6: '#e2e2e2', gray7: '#dbdbdb', gray8: '#c7c7c7', gray9: '#8f8f8f', gray10: '#858585', gray11: '#6f6f6f', gray12: '#171717',
    gray1_dark: '#191919', gray2_dark: '#212121', gray3_dark: '#282828', gray4_dark: '#303030', gray5_dark: '#393939', gray6_dark: '#424242', gray7_dark: '#4f4f4f', gray8_dark: '#626262', gray9_dark: '#737373', gray10_dark: '#838383', gray11_dark: '#ababab', gray12_dark: '#ededed',

    white: '#FFFFFF',
    black: '#000000',
  },
});

// Define themes
const lightTheme = {
  background: tokens.color.gray2,
  backgroundHover: tokens.color.gray3,
  backgroundPress: tokens.color.gray4,
  backgroundFocus: tokens.color.gray4,
  backgroundStrong: tokens.color.white, // e.g., Card background
  backgroundTransparent: tokens.color.gray1,

  color: tokens.color.gray12,
  colorHover: tokens.color.gray11,
  colorPress: tokens.color.gray10,
  colorFocus: tokens.color.gray10,
  colorSecondary: tokens.color.gray11, // Use Radix gray11 for secondary text
  colorTertiary: tokens.color.gray9,   // Use Radix gray9 for tertiary text

  borderColor: tokens.color.gray6,
  borderColorHover: tokens.color.gray7,
  borderColorPress: tokens.color.gray8,
  borderColorFocus: tokens.color.brandBlue, // Use brand blue for focus

  // Semantic colors
  primary: tokens.color.brandBlue,
  secondary: tokens.color.brandPurple,
  success: tokens.color.brandGreen,
  warning: tokens.color.brandYellow,
  error: tokens.color.brandRed,
  info: tokens.color.brandBlue,

  // Specific component overrides if needed
  inputBackground: tokens.color.white,
  cardBackground: tokens.color.white,
  shadowColor: tokens.color.gray8,
  shadowColorHover: tokens.color.gray9,
};

const darkTheme: typeof lightTheme = {
  background: tokens.color.gray1_dark,
  backgroundHover: tokens.color.gray3_dark,
  backgroundPress: tokens.color.gray4_dark,
  backgroundFocus: tokens.color.gray4_dark,
  backgroundStrong: tokens.color.gray2_dark, // e.g., Card background
  backgroundTransparent: tokens.color.gray1_dark,

  color: tokens.color.gray12_dark,
  colorHover: tokens.color.gray11_dark,
  colorPress: tokens.color.gray10_dark,
  colorFocus: tokens.color.gray10_dark,
  colorSecondary: tokens.color.gray11_dark,
  colorTertiary: tokens.color.gray9_dark,

  borderColor: tokens.color.gray5_dark, // Slightly lighter border for dark mode
  borderColorHover: tokens.color.gray6_dark,
  borderColorPress: tokens.color.gray7_dark,
  borderColorFocus: tokens.color.brandBlue_dark,

  // Semantic colors (using dark variants)
  primary: tokens.color.brandBlue_dark,
  secondary: tokens.color.brandPurple_dark,
  success: tokens.color.brandGreen_dark,
  warning: tokens.color.brandYellow_dark,
  error: tokens.color.brandRed_dark,
  info: tokens.color.brandBlue_dark,

  // Specific component overrides
  inputBackground: tokens.color.gray3_dark,
  cardBackground: tokens.color.gray2_dark,
  shadowColor: tokens.color.black, // Use black for shadow in dark mode
  shadowColorHover: tokens.color.black,
};

// Create the Tamagui config
const config = createTamagui({
  animations,
  shouldAddPrefersColorThemes: false, // We control theme via Zustand
  themeClassNameOnRoot: false, // Recommended for native
  shorthands: {
    // Keep your existing shorthands
    m: 'margin', mt: 'marginTop', mr: 'marginRight', mb: 'marginBottom', ml: 'marginLeft', mx: 'marginHorizontal', my: 'marginVertical',
    p: 'padding', pt: 'paddingTop', pr: 'paddingRight', pb: 'paddingBottom', pl: 'paddingLeft', px: 'paddingHorizontal', py: 'paddingVertical',
    bg: 'backgroundColor', br: 'borderRadius', bw: 'borderWidth', bc: 'borderColor',
    f: 'flex', fd: 'flexDirection', ai: 'alignItems', jc: 'justifyContent', w: 'width', h: 'height',
  },
  fonts: {
    heading: headingFont,
    body: bodyFont,
    mono: monoFont,
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
    // Add component specific themes if needed, e.g., for buttons
    light_Button: {
      background: tokens.color.brandBlue,
      backgroundHover: tokens.color.brandBlue, // Use a slightly darker shade if defined, else fallback
      backgroundPress: tokens.color.brandBlue, // Use a darker shade if defined, else fallback
      color: tokens.color.white,
      borderColor: tokens.color.brandBlue, // Ensure border matches for outline variant
    },
    dark_Button: {
      background: tokens.color.brandBlue_dark,
      backgroundHover: tokens.color.brandBlue_dark, // Use a slightly lighter shade if defined, else fallback
      backgroundPress: tokens.color.brandBlue_dark, // Use a lighter shade if defined, else fallback
      color: tokens.color.gray1_dark, // Ensure contrast
      borderColor: tokens.color.brandBlue_dark,
    },
  },
  tokens,
  media: { // Keep standard media queries
    xs: { maxWidth: 660 }, sm: { maxWidth: 800 }, md: { maxWidth: 1020 }, lg: { maxWidth: 1280 }, xl: { maxWidth: 1420 }, xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 661 }, gtSm: { minWidth: 801 }, gtMd: { minWidth: 1021 }, gtLg: { minWidth: 1281 },
    short: { maxHeight: 820 }, tall: { minHeight: 820 },
    hoverNone: { hover: 'none' }, pointerCoarse: { pointer: 'coarse' },
  },
  settings: {
      allowedStyleValues: 'somewhat-strict',
      autocompleteSpecificTokens: 'except-special',
  },
  // SSR settings usually not needed for Expo
  // disableSSR: true,
  // disableRootThemeClass: true, // Recommended for native
});

type AppConfig = typeof config;

// Augment Tamagui interface - this is crucial!
declare module '@tamagui/core' {
  // If AppConfig is defined and exported:
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;