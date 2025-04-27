import { createTamagui, createTokens, createFont } from 'tamagui';

// --- 1. Define your Tokens ---
const tokens = createTokens({
  size: {
    // Using a consistent step (e.g., 4px)
    0: 0,
    1: 4, 
    2: 8, 
    3: 12,
    4: 16, 
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48, // Example: button height
    13: 52,
    14: 56, // Example: larger input height
    15: 60,
    16: 64,
    true: 16, // Default size
  },
  space: {
    // Often matches size for simplicity
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    13: 52,
    14: 56,
    15: 60,
    16: 64,
    true: 16, // Default space
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 10, // Small button radius
    4: 12, // Input/card radius
    5: 16, // Larger card radius
    6: 20,
    7: 24,
    8: 28,
    9: 32,
    10: 40,
    true: 12, // Default radius
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  color: {
    // Light Theme Colors
    gray1: '#f9f9f9', // Lightest background
    gray2: '#f3f3f3', // Subtle background
    gray3: '#ededed', // UI element background
    gray4: '#e7e7e7', // Hovered UI element background
    gray5: '#dedede', // Active / Selected UI element background
    gray6: '#d7d7d7', // Subtle borders and separators (iOS: #D1D1D6)
    gray7: '#c7c7c7', // UI element border and focus rings (iOS: #C7C7CC)
    gray8: '#a7a7a7', // Hovered UI element border
    gray9: '#8f8f8f', // Solid backgrounds (iOS: #8E8E93)
    gray10: '#858585', // Hovered solid backgrounds
    gray11: '#6f6f6f', // Low-contrast text
    gray12: '#1f1f1f', // High-contrast text

    blue1: '#f0f9ff',
    blue2: '#e0f2fe',
    blue3: '#bae6fd',
    blue4: '#7dd3fc',
    blue5: '#38bdf8',
    blue6: '#0ea5e9',
    blue7: '#0284c7',
    blue8: '#0369a1',
    blue9: '#007AFF', // iOS primary blue
    blue10: '#065a94',
    blue11: '#074774',
    blue12: '#062640',

    // Aether brand colors
    brandBlue: '#007AFF',  // Primary brand blue (same as iOS blue)
    brandGreen: '#34C759', // Success actions, completion
    brandYellow: '#FFCC00', // Warnings, badges
    brandRed: '#FF3B30',    // Errors, destructive actions
    brandPurple: '#5E5CE6',  // Secondary accent
    
    // iOS standard colors (keeping for compatibility)
    red9: '#FF3B30', // iOS red
    green9: '#34C759', // iOS green
    yellow9: '#FFCC00', // iOS yellow
    orange9: '#FF9500', // iOS orange
    purple9: '#AF52DE', // iOS purple
    pink9: '#FF2D55', // iOS pink
    indigo9: '#5856D6', // iOS indigo

    // Dark Theme Colors
    gray1_dark: '#1C1C1E', // iOS dark background
    gray2_dark: '#2C2C2E', // iOS dark secondary background
    gray3_dark: '#3A3A3C', // iOS dark tertiary background
    gray4_dark: '#48484A',
    gray5_dark: '#545456',
    gray6_dark: '#636366', // iOS dark gray
    gray7_dark: '#8E8E93', // iOS gray
    gray8_dark: '#AEAEB2', // iOS gray2
    gray9_dark: '#C7C7CC', // iOS gray3
    gray10_dark: '#D1D1D6', // iOS gray4
    gray11_dark: '#E5E5EA', // iOS gray5
    gray12_dark: '#F2F2F7', // iOS gray6
    
    // Aether brand dark theme colors
    brandBlue_dark: '#0A84FF', // Slightly brighter blue for dark mode
    brandGreen_dark: '#30D158', // Slightly brighter green for dark mode
    brandYellow_dark: '#FFD60A', // Slightly brighter yellow for dark mode
    brandRed_dark: '#FF453A', // Slightly brighter red for dark mode
    brandPurple_dark: '#5E5CE6', // Same as light mode

    blue1_dark: '#052b4c',
    blue2_dark: '#06355f',
    blue3_dark: '#07467d',
    blue4_dark: '#085a9f',
    blue5_dark: '#0973c7',
    blue6_dark: '#098ff0',
    blue7_dark: '#1aa0ff',
    blue8_dark: '#3db3ff',
    blue9_dark: '#0A84FF', // iOS dark mode blue
    blue10_dark: '#83cfff',
    blue11_dark: '#a8ddff',
    blue12_dark: '#d1ecff',

    // Additional iOS dark mode colors
    red9_dark: '#FF453A', // iOS dark mode red
    green9_dark: '#30D158', // iOS dark mode green
    yellow9_dark: '#FFD60A', // iOS dark mode yellow
    orange9_dark: '#FF9F0A', // iOS dark mode orange
    purple9_dark: '#BF5AF2', // iOS dark mode purple
    pink9_dark: '#FF375F', // iOS dark mode pink
    indigo9_dark: '#5E5CE6', // iOS dark mode indigo

    // Common absolute colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  font: {
    body: 'System', // Default system font
    heading: 'System',
    mono: 'SpaceMono', // Custom font loaded in app
  },
  fontSize: {
    1: 12,
    2: 14,
    3: 15, // Common iOS body size
    4: 16,
    5: 18,
    6: 20, // Subtitle
    7: 24,
    8: 30, // Title
    9: 36,
    true: 15, // Default body size
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 22, // Body line height
    4: 24,
    5: 28,
    6: 32,
    true: 22,
  },
  fontWeight: {
    1: '400', // Regular
    2: '500', // Medium
    3: '600', // Semibold
    4: '700', // Bold
    true: '400',
  },
  letterSpacing: {
    1: 0,
    2: 0.2,
    3: 0.4,
    true: 0,
  },
  // Add font scale tokens for typography consistency
  fontScale: {
    // Heading sizes
    headingXl: 36, // Large title
    headingLg: 30, // Title
    headingMd: 24, // Subtitle
    headingSm: 20, // Section header
    
    // Body sizes
    bodyLg: 18, // Emphasized body text
    bodyMd: 16, // Standard body text
    bodySm: 14, // Secondary/hint text
    bodyXs: 12, // Small text (captions, labels)
  },
});

// --- NEW: Define Fonts --- 
const interFont = createFont({
  family: 'Inter',
  // Define sizes based on your fontSize tokens
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 30,
    9: 36,
    true: 15, // Default body size
  },
  // Define line heights based on your lineHeight tokens
  lineHeight: {
    1: 16,
    2: 20,
    3: 22,
    4: 24,
    5: 28,
    6: 32,
    true: 22,
  },
  // Define weights based on your fontWeight tokens and loaded fonts
  weight: {
    4: '400', // Corresponds to Inter-Medium loaded as 'Inter'
    7: '700', // Corresponds to Inter-Bold loaded as 'InterBold'
    true: '400', // Default weight
  },
  // Define letter spacing based on your letterSpacing tokens
  letterSpacing: {
    1: 0,
    2: 0.2,
    3: 0.4,
    true: 0,
  },
  // Use face to map weights to the specific font family names Expo loads
  face: {
    400: { normal: 'Inter', italic: 'Inter' }, // Assuming no italic variant loaded for 400
    700: { normal: 'InterBold', italic: 'InterBold' }, // Assuming no italic variant loaded for 700
  },
});

// --- 2. Define Theme Variables ---
const light = {
  background: tokens.color.gray1,
  backgroundHover: tokens.color.gray2,
  backgroundPress: tokens.color.gray3,
  backgroundFocus: tokens.color.gray2,
  backgroundStrong: tokens.color.gray3, // For content backgrounds
  backgroundTransparent: tokens.color.gray1,
  
  color: tokens.color.gray12, // Default text color - high contrast
  colorHover: tokens.color.gray11,
  colorPress: tokens.color.gray10,
  colorFocus: tokens.color.gray11,
  colorTransparent: 'transparent',
  colorMuted: tokens.color.gray11, // Secondary text
  
  // Variant/state colors (success, error, etc.)
  color1: tokens.color.gray1, // Lowest (often unused)
  color2: tokens.color.gray2,
  color3: tokens.color.gray3,
  color4: tokens.color.gray4,
  color5: tokens.color.gray5,
  color6: tokens.color.gray6,
  color7: tokens.color.gray7,
  color8: tokens.color.gray8,
  color9: tokens.color.gray9,
  color10: tokens.color.gray10,
  color11: tokens.color.gray11,
  color12: tokens.color.gray12, // Highest
  
  // Borders, from subtle to visible
  borderColor: tokens.color.gray6,
  borderColorHover: tokens.color.gray7,
  borderColorFocus: tokens.color.gray8,
  borderColorPress: tokens.color.gray7,
  
  // Shadows
  shadowColor: tokens.color.gray8,
  shadowColorHover: tokens.color.gray9,
  
  // Interactive colors
  primary: tokens.color.brandBlue, // Primary action color (Aether brand blue)
  secondary: tokens.color.brandPurple, // Secondary action color (Aether brand purple)
  success: tokens.color.brandGreen, // Success states (Aether brand green)
  error: tokens.color.brandRed, // Error states (Aether brand red)
  warn: tokens.color.brandYellow, // Warning states (Aether brand yellow)
  info: tokens.color.brandBlue, // Info states (Aether brand blue)

  // Card-specific backgrounds for different elevations
  cardBackground: tokens.color.white,
  cardBackgroundHover: tokens.color.gray1,
  cardBackgroundPress: tokens.color.gray2,
  
  // Input backgrounds
  inputBackground: tokens.color.gray3,
  inputBackgroundHover: tokens.color.gray4,
  inputBackgroundFocus: tokens.color.gray4,
};

const dark = {
  background: tokens.color.gray1_dark,
  backgroundHover: tokens.color.gray2_dark,
  backgroundPress: tokens.color.gray3_dark,
  backgroundFocus: tokens.color.gray2_dark,
  backgroundStrong: tokens.color.gray3_dark, // For content backgrounds
  backgroundTransparent: tokens.color.gray1_dark,
  
  color: tokens.color.gray12_dark, // Default text color - high contrast
  colorHover: tokens.color.gray11_dark,
  colorPress: tokens.color.gray10_dark,
  colorFocus: tokens.color.gray11_dark,
  colorTransparent: 'transparent',
  colorMuted: tokens.color.gray11_dark, // Secondary text
  
  // Variant/state colors (success, error, etc.)
  color1: tokens.color.gray1_dark, // Lowest (often unused)
  color2: tokens.color.gray2_dark,
  color3: tokens.color.gray3_dark,
  color4: tokens.color.gray4_dark,
  color5: tokens.color.gray5_dark,
  color6: tokens.color.gray6_dark,
  color7: tokens.color.gray7_dark,
  color8: tokens.color.gray8_dark,
  color9: tokens.color.gray9_dark,
  color10: tokens.color.gray10_dark,
  color11: tokens.color.gray11_dark,
  color12: tokens.color.gray12_dark, // Highest
  
  // Borders, from subtle to visible
  borderColor: tokens.color.gray6_dark,
  borderColorHover: tokens.color.gray7_dark,
  borderColorFocus: tokens.color.gray8_dark,
  borderColorPress: tokens.color.gray7_dark,
  
  // Shadows
  shadowColor: tokens.color.gray8_dark,
  shadowColorHover: tokens.color.gray9_dark,
  
  // Interactive colors
  primary: tokens.color.brandBlue_dark, // Primary action color (Aether brand blue)
  secondary: tokens.color.brandPurple_dark, // Secondary action color (Aether brand purple)
  success: tokens.color.brandGreen_dark, // Success states (Aether brand green)
  error: tokens.color.brandRed_dark, // Error states (Aether brand red)
  warn: tokens.color.brandYellow_dark, // Warning states (Aether brand yellow)
  info: tokens.color.brandBlue_dark, // Info states (Aether brand blue)
  // Card-specific backgrounds for different elevations
  cardBackground: tokens.color.gray2_dark,
  cardBackgroundHover: tokens.color.gray3_dark,
  cardBackgroundPress: tokens.color.gray4_dark,
  
  // Input backgrounds
  inputBackground: tokens.color.gray3_dark,
  inputBackgroundHover: tokens.color.gray2_dark,
  inputBackgroundFocus: tokens.color.gray2_dark,
};

// --- 3. Create the Config --- 
const config = createTamagui({
  tokens,
  themes: {
    light,
    dark,
  },
  fonts: {
    // Tamagui uses the key 'body' for the default font
    body: interFont, 
    // You can add other font aliases if needed, like 'heading'
    heading: interFont, 
    // Keep mono if you use it, but ensure SpaceMono is also defined with createFont if loaded
    // mono: spaceMonoFont, 
  },
  shorthands: {
    m: 'margin',
    mt: 'marginTop',
    mr: 'marginRight',
    mb: 'marginBottom',
    ml: 'marginLeft',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    p: 'padding',
    pt: 'paddingTop',
    pr: 'paddingRight',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    bg: 'backgroundColor',
    br: 'borderRadius',
    bw: 'borderWidth',
    bc: 'borderColor',
    f: 'flex',
    fd: 'flexDirection',
    ai: 'alignItems',
    jc: 'justifyContent',
    w: 'width',
    h: 'height',
  },
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  disableStrictSimpleProps: true,
  settings: {
    allowedStyleValues: 'somewhat-strict', // Allow both tokens and raw values
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

// --- 4. Type Augmentation ---
type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;