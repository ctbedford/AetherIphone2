// tamagui.config.ts
import { createAnimations } from '@tamagui/animations-react-native';
import { createFont, createTamagui, createTokens } from 'tamagui';
import { Platform } from 'react-native';
import * as MotionConstants from '@/constants/motion'; // Import motion constants

// Font definitions - Zelda Theme
// Assumes 'CalamitySans' and 'HyliaSerif' are loaded via useFonts or similar
const headingFont = createFont({
  family: 'HyliaSerif', // Zelda Display Font
  size: {
    // Mapped closer to iOS Dynamic Type: https://developer.apple.com/design/human-interface-guidelines/typography
    1: 13,  // Caption 2
    2: 15,  // Subheadline
    3: 17,  // Body (true default)
    4: 20,  // Title 3
    5: 22,  // Title 2
    6: 28,  // Title 1
    7: 34,  // Large Title
    8: 40,  // Extra Large Title (custom)
    true: 17, // Default size (Body)
  },
  lineHeight: {
    // Approximate line heights based on new sizes
    1: 18, 2: 20, 3: 22, 4: 25, 5: 28, 6: 34, 7: 41, 8: 50, 
    true: 22,
  },
  weight: {
    // Prompt 2 asks for 400-700
    4: '400', // Normal
    6: '600', // Semi-bold/Bold
    7: '700', // Extra-bold/Black
    true: '400',
  },
  letterSpacing: {
    1: 0, 2: 0, 3: -0.5, 4: -0.5, 5: -1, 6: -1, 7: -1.5, 8: -1.5,
    true: 0,
  },
  // Required: Map weights to specific font faces if needed (e.g., 'HyliaSerif-Bold')
  // face: {
  //   400: { normal: 'HyliaSerif-Regular' },
  //   700: { normal: 'HyliaSerif-Bold' },
  // },
});

const bodyFont = createFont({
  family: 'CalamitySans', // Zelda Body Font
  size: {
    // Mapped closer to iOS Dynamic Type
    1: 11,  // Footnote
    2: 12,  // Caption 1
    3: 13,  // Caption 2
    4: 15,  // Subheadline
    5: 17,  // Body (true default)
    6: 20,  // Title 3 (matching headingFont.$4)
    true: 17, // Default body size
  },
  lineHeight: {
    // Approximate line heights
    1: 13, 2: 16, 3: 18, 4: 20, 5: 22, 6: 25,
    true: 22, // Default body line height
  },
  weight: {
    4: '400', // Regular
    5: '500', // Medium (if available)
    7: '700', // Bold (if needed/available)
    true: '400',
  },
  letterSpacing: {
    1: 0.1, 2: 0.1, 3: 0, 4: 0, 5: -0.1, 6: -0.1,
    true: 0,
  },
  // Required: Map weights to specific font faces if needed (e.g., 'CalamitySans-Medium')
  // face: {
  //   400: { normal: 'CalamitySans-Regular' },
  //   500: { normal: 'CalamitySans-Medium' },
  // },
});

const monoFont = createFont({
  family: Platform.select({ web: 'monospace', default: 'SpaceMono' }), // Keep SpaceMono for code
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

// Standard Radix Gray scale (light theme)
const gray = {
  gray1: '#fcfcfc', gray2: '#f8f8f8', gray3: '#f3f3f3', gray4: '#ededed', gray5: '#e8e8e8', gray6: '#e2e2e2', gray7: '#dbdbdb', gray8: '#c7c7c7', gray9: '#8f8f8f', gray10: '#858585', gray11: '#6f6f6f', gray12: '#171717',
};

// Standard Radix Gray scale (dark theme)
const grayDark = {
  gray1: '#191919', gray2: '#212121', gray3: '#282828', gray4: '#303030', gray5: '#393939', gray6: '#424242', gray7: '#4f4f4f', gray8: '#626262', gray9: '#737373', gray10: '#838383', gray11: '#ababab', gray12: '#ededed',
};

// Tokens (refined based on your existing config)
const tokens = createTokens({
  size: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 13: 52, 14: 56, 15: 60, 16: 64, true: 16,
  },
  space: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 13: 52, 14: 56, 15: 60, 16: 64, true: 16, '-1': -4, '-2': -8, '-3': -12, '-4': -16,
  },
  radius: {
    0: 0, 1: 3, 2: 5, 3: 8, 4: 10, 5: 14, 6: 16, 7: 20, 8: 24, 9: 28, 10: 32, true: 10, // Updated radius.5 to 14
  },
  zIndex: { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 },
  color: {
    // Zelda Palette (Prompt 1)
    ...gray, // Add light greys
    ...grayDark, // Add dark greys (will be overridden in dark theme definition)
    parchment: '#FDFFE0',
    sheikahCyan: '#86A5A9',
    korokGreen: '#92C582',
    darkText: '#536F50',
    guardianOrange: '#FF9F0A',
    darkTealBg: '#1A2E3A',
    darkCyanGlow: '#64FFDA',

    // Shadow Colors (Prompt 5)
    shadowColorLight: 'rgba(83, 111, 80, 1)', // dark desaturated text color
    shadowColorDark: 'rgba(0, 0, 0, 1)', // Black base
    white: '#FFFFFF',
    black: '#000000',
  },
});

// Define themes using Zelda Palette
const lightTheme = {
  // Base Colors
  background: tokens.color.parchment,      // Light bg
  backgroundStrong: tokens.color.white,     // Keep white for strong contrast areas if needed
  backgroundTransparent: 'rgba(253, 255, 224, 0)', // Fully transparent parchment
  color: tokens.color.darkText,             // Dark desaturated text
  colorSecondary: tokens.color.darkText,      // Use main text color, maybe slightly lighter if needed later
  colorTertiary: tokens.color.sheikahCyan,    // Use accent for tertiary info?
  borderColor: tokens.color.sheikahCyan,      // Use accent for borders
  borderColorHover: tokens.color.korokGreen,  // Korok green on hover?

  // Theme-specific states (can refine later)
  backgroundHover: tokens.color.parchment,    // Keep parchment, maybe slightly darker/lighter
  backgroundPress: tokens.color.parchment,    // Keep parchment
  backgroundFocus: tokens.color.parchment,    // Keep parchment
  colorHover: tokens.color.korokGreen,        // Korok green text on hover?
  colorPress: tokens.color.korokGreen,
  colorFocus: tokens.color.sheikahCyan,
  borderColorPress: tokens.color.korokGreen,
  borderColorFocus: tokens.color.sheikahCyan,

  // Semantic Tokens (Prompt 4)
  accent: tokens.color.sheikahCyan,
  surfaceSubtle: tokens.color.parchment,    // Base color, apply opacity in component (e.g., rgba(253,255,224,0.8))
  destructive: tokens.color.guardianOrange,

  // Standard Semantic Mapping (can use Zelda colors)
  primary: tokens.color.sheikahCyan,        // Map primary to accent
  secondary: tokens.color.korokGreen,       // Map secondary to korok green?
  success: tokens.color.korokGreen,
  warning: tokens.color.guardianOrange,     // Use guardian orange for warning
  error: tokens.color.guardianOrange,       // Use guardian orange for error
  info: tokens.color.sheikahCyan,

  // Semantic Aliases (Playbook 1.1)
  surface: tokens.color.parchment, // Maps to background
  onSurface: tokens.color.darkText,  // Maps to color
  outline: tokens.color.sheikahCyan, // Maps to borderColor

  // Shadows (Playbook 1.1 & Prompt 5)
  shadowColor: tokens.color.shadowColorLight, // Use darkText color base for shadow
  shadowColorHover: 'rgba(83, 111, 80, 0.15)',
  shadowSm: 'rgba(83, 111, 80, 0.10)', // 10% opacity
  shadowMd: 'rgba(83, 111, 80, 0.15)', // 15% opacity
  shadowLg: 'rgba(83, 111, 80, 0.20)', // 20% opacity

  // Toast Themes (Report Item 6)
  toast_success_background: tokens.color.korokGreen,
  toast_success_color: tokens.color.parchment,
  toast_error_background: tokens.color.guardianOrange,
  toast_error_color: tokens.color.parchment,
  toast_warning_background: tokens.color.guardianOrange, // Often same as error
  toast_warning_color: tokens.color.parchment,
  toast_info_background: tokens.color.sheikahCyan,
  toast_info_color: tokens.color.parchment,
};

const darkTheme: typeof lightTheme = {
  // Base Colors
  ...grayDark, // Override light greys with dark greys
  background: tokens.color.darkTealBg,      // Dark-mode bg
  backgroundStrong: tokens.color.black,       // Black for contrast?
  backgroundTransparent: 'rgba(26, 46, 58, 0)', // Fully transparent dark teal
  color: tokens.color.parchment,          // Use light parchment for text
  colorSecondary: tokens.color.sheikahCyan,   // Sheikah cyan for secondary text
  colorTertiary: tokens.color.korokGreen,     // Korok green for tertiary
  borderColor: tokens.color.sheikahCyan,      // Sheikah cyan borders
  borderColorHover: tokens.color.darkCyanGlow, // Glow cyan on hover?

  // Theme-specific states
  backgroundHover: tokens.color.darkTealBg,   // Keep bg, maybe slightly lighter
  backgroundPress: tokens.color.darkTealBg,
  backgroundFocus: tokens.color.darkTealBg,
  colorHover: tokens.color.darkCyanGlow,
  colorPress: tokens.color.darkCyanGlow,
  colorFocus: tokens.color.darkCyanGlow,
  borderColorPress: tokens.color.darkCyanGlow,
  borderColorFocus: tokens.color.darkCyanGlow,

  // Semantic Tokens (Prompt 4)
  accent: tokens.color.sheikahCyan,
  surfaceSubtle: tokens.color.darkTealBg, // Use dark bg, apply opacity in component
  destructive: tokens.color.guardianOrange,

  // Standard Semantic Mapping
  primary: tokens.color.darkCyanGlow,       // Use glow cyan for primary actions
  secondary: tokens.color.korokGreen,
  success: tokens.color.korokGreen,
  warning: tokens.color.guardianOrange,
  error: tokens.color.guardianOrange,
  info: tokens.color.sheikahCyan,

  // Semantic Aliases (Playbook 1.1)
  surface: tokens.color.darkTealBg,   // Maps to background
  onSurface: tokens.color.parchment,  // Maps to color
  outline: tokens.color.sheikahCyan, // Maps to borderColor

  // Shadows (Playbook 1.1 & Prompt 5)
  shadowColor: tokens.color.shadowColorDark, // Darker shadow for dark mode
  shadowColorHover: 'rgba(0, 0, 0, 0.30)',
  shadowSm: 'rgba(0, 0, 0, 0.20)', // 20% opacity
  shadowMd: 'rgba(0, 0, 0, 0.30)', // 30% opacity
  shadowLg: 'rgba(0, 0, 0, 0.40)', // 40% opacity

  // Toast Themes (Report Item 6)
  toast_success_background: tokens.color.korokGreen,
  toast_success_color: tokens.color.darkTealBg,
  toast_error_background: tokens.color.guardianOrange,
  toast_error_color: tokens.color.darkTealBg,
  toast_warning_background: tokens.color.guardianOrange, // Often same as error
  toast_warning_color: tokens.color.darkTealBg,
  toast_info_background: tokens.color.sheikahCyan,
  toast_info_color: tokens.color.darkTealBg,
};

// Create the Tamagui config
const config = createTamagui({
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands: {
    // Keep your existing shorthands
    m: 'margin', mt: 'marginTop', mr: 'marginRight', mb: 'marginBottom', ml: 'marginLeft', mx: 'marginHorizontal', my: 'marginVertical',
    p: 'padding', pt: 'paddingTop', pr: 'paddingRight', pb: 'paddingBottom', pl: 'paddingLeft', px: 'paddingHorizontal', py: 'paddingVertical',
    bg: 'backgroundColor', br: 'borderRadius', bw: 'borderWidth', bc: 'borderColor',
    f: 'flex', fd: 'flexDirection', ai: 'alignItems', jc: 'justifyContent', w: 'width', h: 'height',
    ac: 'alignContent',
    als: 'alignSelf',
    btc: 'borderTopColor',
    bbc: 'borderBottomColor',
    blc: 'borderLeftColor',
    brc: 'borderRightColor',
    boc: 'borderColor',
    bs: 'borderStyle',
    dsp: 'display',
    fb: 'flexBasis',
    fg: 'flexGrow',
    fs: 'flexShrink',
    fw: 'flexWrap',
    mah: 'maxHeight',
    maw: 'maxWidth',
    mih: 'minHeight',
    miw: 'minWidth',
    op: 'opacity',
    ov: 'overflow',
    r: 'right',
    shac: 'shadowColor',
    shar: 'shadowRadius',
    shof: 'shadowOffset',
    shop: 'shadowOpacity',
    t: 'top',
    ta: 'textAlign',
    tt: 'textTransform',
    va: 'verticalAlign',
    zi: 'zIndex',
  },
  fonts: {
    // Use Zelda fonts
    heading: headingFont,
    body: bodyFont,
    mono: monoFont, // Keep mono
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
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
});

type AppConfig = typeof config;

// Augment Tamagui interface - this is crucial!
declare module '@tamagui/core' {
  // If AppConfig is defined and exported:
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;