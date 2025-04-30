# Aether iPhone: Complete Migration Context
Generated on Wed Apr 30 02:25:58 CDT 2025



# 1️⃣ Project Overview & Migration Plan
Top-level overview and plan for Tamagui → Gluestack/NativeWind migration.

## Refactoring Plan

File-by-file work-order for the frontend refactor.
* Top-level paths follow an Expo Router layout (app/…)
* 🔮 marks assumptions to be confirmed

### 1️⃣ Core Design System (/design-system)

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| tokens.ts | keep → export Tailwind-ready object instead of Tamagui createTokens | n/a | single source for color / spacing across Gluestack and NativeWind |
| theme.glue.ts | new – export const gluestackTheme = {tokens, components} | tokens.ts, Gluestack | wires Zelda palette + fonts into Gluestack provider |
| tailwind.config.js | rewrite with content: ["app/**/*.{tsx,ts}"] + colors from tokens | tokens.ts, NativeWind | unlocks className="bg-parchment" etc. in JSX |
| Primitives.tsx | new – <Stack> <Text> <Button> wrappers ⮕ Gluestack equivalents | gluestackTheme | lets old code migrate screen-by-screen w/out mass edits |
| Animations.ts | new – reusable Moti presets (fadeInUp, runePulse) | moti, react-native-reanimated | consistent motion language |

### 2️⃣ Global Providers

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| app/_layout.tsx | rewrite – wrap with <GluestackProvider theme={gluestackTheme}>, <TRPCProvider>, <SupabaseProvider> | theme.glue.ts, 🔮 TRPCProvider, 🔮 SupabaseProvider | guarantees every screen sees styled components + auth + queries |
| providers/TRPCProvider.tsx | new – instantiates trpc.createClient() + React Query | @trpc/client, @tanstack/react-query | centralises tRPC; screens just useTRPCQuery() |

### 3️⃣ Navigation Shells

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| app/(tabs)/_layout.tsx | keep – Expo Router structure (tho migrate Tamagui instances) | n/a | tab layout doesn't need much refactoring |
| app/(auth)/_layout.tsx | keep – Expo Router structure (tho migrate Tamagui instances) | n/a | auth layout doesn't need much refactoring |

### 4️⃣ Reusable UI Components

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| SwipeableRow.tsx | implement – left swipe to Complete, right swipe to Delete | react-native-gesture-handler, react-native-reanimated | enables task status changes with haptic confirmation |
| TaskRow.tsx | implement – task row formatting for to-do lists | SwipeableRow | consistent per-task presentation (name, due date, etc) |
| SectionCard.tsx | implement – glazed Sheikah-glass card section | tokens, useColorScheme | consistent dashboard UI module |

### 5️⃣ Feature Screens Migration
Migrate each one with an index.gluestack.tsx, leave old versions until each can be tested.

| Screen | New Path | Action |
| --- | --- | --- |
| Dashboard | app/(tabs)/home/index.gluestack.tsx | Implement "Task Swipe → Done" with SectionCard + Gluestack |
| Planner | app/(tabs)/planner/index.gluestack.tsx | Migrate later | 
| Compass | app/(tabs)/compass/index.gluestack.tsx | Migrate later |
| Rewards | app/(tabs)/rewards/index.gluestack.tsx | Migrate later |
| Settings | app/(tabs)/settings/index.gluestack.tsx | Migrate later |

### 6️⃣ Utility Hooks

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| useDashboardQuery.ts | implement – fetches active tasks, habits, goals via tRPC | TRPCProvider, React Query | clean abstraction to get status summary |
| useToggleTaskStatus.ts | implement – mutates task status w/ optimistic update | TRPCProvider, React Query | toggle task (complete/not) with onSuccess/onError hooks |

### package.json
**Path:** package.json
**Description:** Current dependencies and scripts

```json
{
  "name": "aetheriphone",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "private": true,

  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "generate": "node ./scripts/generate-all.js",
    "dev": "npm run generate && expo start"
  },

  "dependencies": {
    "expo": "~52.0.46",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native": "0.76.9",
    "expo-router": "~4.0.20",
    "expo-dev-client": "~5.0.20",
    "expo-constants": "~17.0.8",
    "expo-font": "~13.0.4",
    "expo-haptics": "~14.0.1",
    "expo-linking": "~7.0.5",
    "expo-splash-screen": "~0.29.24",
    "expo-status-bar": "~2.0.1",
    "expo-web-browser": "~14.0.2",

    "@react-navigation/native": "^7.0.14",
    "@react-navigation/bottom-tabs": "^7.2.0",
    "react-native-gesture-handler": "^2.25.0",
    "react-native-reanimated": "^3.17.5",
    "react-native-screens": "~4.4.0",
    "react-native-safe-area-context": "4.12.0",

    "@gluestack-ui/config": "^1.1.20",
    "@gluestack-ui/themed": "^1.1.73",
    "nativewind": "^4.1.23",
    "@expo/vector-icons": "^14.0.2",
    "moti": "^0.30.0",
    "react-native-swipe-list-view": "^3.2.9",
    "@shopify/flash-list": "^1.8.0",

    "@tanstack/react-query": "^5.74.4",
    "@tanstack/query-async-storage-persister": "^5.74.4",
    "@tanstack/react-query-persist-client": "^5.74.4",
    "zustand": "^5.0.3",

    "@trpc/client": "^11.1.0",
    "@trpc/react-query": "^11.1.0",
    "@supabase/supabase-js": "^2.49.4",
    "expo-blur": "~14.0.3",
    "lottie-react-native": "7.1.0",
    "react-native-svg": "15.8.0",
    "expo-secure-store": "^14.0.1",

    "date-fns": "^4.1.0",
    "burnt": "^0.13.0",
    "text-encoding": "^0.7.0",
    "react-native-url-polyfill": "^2.0.0",

    "@tamagui/core": "1.126.1",
    "@tamagui/stacks": "1.126.1",
    "@tamagui/toast": "1.126.1",
    "@tamagui/themes": "1.126.1",
    "tamagui": "1.126.1"
  },

  "devDependencies": {
    "@types/react": "~18.3.12",
    "@types/react-test-renderer": "^18.3.0",
    "@testing-library/react-native": "^13.2.0",
    "jest-expo": "~52.0.6",
    "eslint": "^8.57.0",
    "eslint-config-expo": "~8.0.1",
    "nativewind": "^4.1.23",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.3.3",

    "@tamagui/babel-plugin": "1.126.1"
  },

  "resolutions": {
    "@gluestack-ui/config": "^1.1.20",
    "react-native-gesture-handler": "^2.25.0"
  }
}
```


# 2️⃣ Key Configuration Files
Configuration files critical to the Tamagui → Gluestack/NativeWind migration.

### tamagui.config.ts
**Path:** tamagui.config.ts
**Description:** Current Tamagui configuration (migration source)

```typescript
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

export default config;```

### babel.config.js
**Path:** babel.config.js
**Description:** Babel configuration - needs updates for NativeWind

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      // Support for Nativewind
      'nativewind/babel',
      // Support for Reanimated (must be last)
      'react-native-reanimated/plugin',
    ],
  };
};```

### tsconfig.json
**Path:** tsconfig.json
**Description:** TypeScript configuration

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "jsx": "react-native",
    "paths": {
      "@/*": [
        "./*"
      ],
      "server/*": [
        "./server/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "server/**/*.ts"
  ]
}
```

### tailwind.config.js
**Path:** tailwind.config.js
**Description:** Tailwind CSS configuration - needs updates for NativeWind

```javascript
/** @type {import('tailwindcss').Config} */
// Import the Zelda theme tokens
const zelda = require('./design-system/tokens');

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./design-system/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['HyliaSerif'],
        'body': ['CalamitySans'],
      },
      colors: {
        // Zelda theme colors
        'parchment': zelda.colors.parchment,
        'sheikahCyan': zelda.colors.sheikahCyan,
        'korokGreen': zelda.colors.korokGreen,
        'darkText': zelda.colors.darkText,
        'guardianOrange': zelda.colors.guardianOrange,
        'darkTealBg': zelda.colors.darkTealBg,
        'cyanGlow': zelda.colors.cyanGlow,
        
        // iOS standard colors
        // iOS system colors
        'ios-blue': '#007AFF',
        'ios-dark-blue': '#0A84FF', // dark mode variant
        'ios-red': '#FF3B30',
        'ios-dark-red': '#FF453A', // dark mode variant
        'ios-green': '#34C759',
        'ios-dark-green': '#30D158', // dark mode variant
        'ios-orange': '#FF9500',
        'ios-dark-orange': '#FF9F0A', // dark mode variant
        'ios-purple': '#AF52DE',
        'ios-dark-purple': '#BF5AF2', // dark mode variant
        'ios-yellow': '#FFCC00',
        'ios-dark-yellow': '#FFD60A', // dark mode variant
        'ios-pink': '#FF2D55',
        'ios-dark-pink': '#FF375F', // dark mode variant
        'ios-indigo': '#5856D6',
        'ios-dark-indigo': '#5E5CE6', // dark mode variant
        
        // iOS gray palette
        'ios-gray': {
          1: '#8E8E93',
          2: '#AEAEB2',
          3: '#C7C7CC',
          4: '#D1D1D6',
          5: '#E5E5EA',
          6: '#F2F2F7',
        },
        'ios-dark-gray': {
          1: '#8E8E93',
          2: '#636366',
          3: '#48484A',
          4: '#3A3A3C',
          5: '#2C2C2E',
          6: '#1C1C1E',
        },
        
        // System background colors
        'ios-system': {
          DEFAULT: '#FFFFFF',
          secondary: '#F2F2F7',
          tertiary: '#FFFFFF',
        },
        'ios-dark-system': {
          DEFAULT: '#000000',
          secondary: '#1C1C1E',
          tertiary: '#2C2C2E',
        },
      },
      
      // iOS standard spacing
      spacing: {
        // Added standard iOS spacing if needed beyond Tailwind defaults
      },
      
      // iOS standard border radius
      borderRadius: {
        'ios-small': '4px',
        'ios-regular': '8px',
        'ios-large': '12px',
        'ios-xl': '16px',
      },
      
      // iOS system font weights
      fontWeight: {
        'ios-regular': '400',
        'ios-medium': '500', 
        'ios-semibold': '600',
        'ios-bold': '700',
      },
      
      // iOS shadows
      boxShadow: {
        'ios-small': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'ios-medium': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'ios-large': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}; ```

### metro.config.js
**Path:** metro.config.js
**Description:** Metro bundler configuration

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const path = require('path');

// Get Expo's default Metro config
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Add .mjs extension support
config.resolver.sourceExts.push('mjs');

// Force Metro to resolve Tamagui packages to a single path
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'tamagui': path.resolve(__dirname, 'node_modules/tamagui'),
  '@tamagui/core': path.resolve(__dirname, 'node_modules/@tamagui/core'),
  '@tamagui/config': path.resolve(__dirname, 'node_modules/@tamagui/config'),
  '@tamagui/toast': path.resolve(__dirname, 'node_modules/@tamagui/toast')
};

// Wrap with Reanimated's config for better error handling
module.exports = wrapWithReanimatedMetroConfig(config); ```

### app.json
**Path:** app.json
**Description:** Expo app configuration

```json
{
  "expo": {
    "name": "AetherIphone",
    "slug": "AetherIphone",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "aether",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tybed7.AetherIphone",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.tybed7.AetherIphone"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/d25504b5-1869-4dca-bfe0-9aaf6e86923b"
    },
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "d25504b5-1869-4dca-bfe0-9aaf6e86923b"
      }
    }
  }
}
```


# 3️⃣ Design System Migration
Moving from Tamagui tokens to Gluestack UI theme & NativeWind classes.

### Existing design system files
```
./design-system/Animations.ts
./design-system/Primitives.tsx
./design-system/theme.glue.ts
./design-system/tokens.ts
```

### tokens.ts
**Path:** design-system/tokens.ts
**Description:** Current or new design tokens

```typescript
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
```

### theme.glue.ts
**Path:** design-system/theme.glue.ts
**Description:** New Gluestack theme configuration

```typescript
// design-system/theme.glue.ts
import { createConfig } from '@gluestack-ui/config';
import tokens from './tokens';

// Convert our tokens to Gluestack theme config
export const glueTheme = createConfig({
  tokens: {
    colors: tokens.colors,
    space: tokens.space,
    radii: tokens.radii,
    fonts: tokens.fonts,
  },
  aliases: {
    // Map our tokens to Gluestack's expected properties
    bg: 'backgroundColor',
    h: 'height',
    w: 'width',
    p: 'padding',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    m: 'margin',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    rounded: 'borderRadius',
  },
  globalStyle: {
    variants: {
      light: {
        backgroundColor: tokens.colors.parchment,
        color: tokens.colors.darkText,
      },
      dark: {
        backgroundColor: tokens.colors.darkTealBg,
        color: tokens.colors.parchment,
      },
    },
  },
});
```

### Primitives.tsx
**Path:** design-system/Primitives.tsx
**Description:** UI primitives wrapper

```typescript
// design-system/Primitives.tsx
import React from 'react';
import { styled } from 'nativewind';
import * as gs from '@gluestack-ui/themed';

// Styled components that accept className prop for NativeWind
export const Stack = styled(gs.View);
export const Text = styled(gs.Text);
export const Button = styled(gs.Button);
export const Pressable = styled(gs.Pressable);

// Re-export other Gluestack components that might be needed
export const HStack = styled(gs.HStack);
export const VStack = styled(gs.VStack);
export const Center = styled(gs.Center);
export const ScrollView = styled(gs.ScrollView);

// Forward gluestack hooks
export const useToast = gs.useToast;
export const useColorMode = gs.useColorMode;

// Export all other Gluestack components as-is
export { gs };
```

### Animations.ts
**Path:** design-system/Animations.ts
**Description:** Animation presets

```typescript
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
```

### Code with pattern: 'from ['"](.*tamagui.*|\.\./tokens)['"]Theme/token imports to convert'
**Description:** *.tsx


# 4️⃣ Provider Architecture
Overview of providers wrapper architecture.

### _layout.tsx
**Path:** app/_layout.tsx
**Description:** Root layout with providers

```typescript
// app/_layout.tsx
import '../tamagui.config'; // Import config first!

import React, { useCallback, useEffect, useState, ReactNode, createContext, useContext } from 'react';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui'; // Will be gradually removed
import { GluestackProvider } from '@/providers/GluestackProvider'; // New UI provider
// tamagui config is already imported at the top of the file
import type { ThemeName } from '@tamagui/core'; // Ensure ThemeName is imported from @tamagui/core
import * as SecureStore from 'expo-secure-store'; // Import SecureStore

import { supabase } from '@/utils/supabase';

import type { Session } from '@supabase/supabase-js';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/* ------------------------------------------------------------------ */
/*  1. Simple Auth-aware context                                       */
/* ------------------------------------------------------------------ */
interface AuthCtx {
  session: Session | null;
  isLoading: boolean;
}
export const AuthContext = React.createContext<AuthCtx>({
  session: null,
  isLoading: true,
});
export const useAuth = () => React.useContext(AuthContext);

/* ------------------------------------------------------------------ */
/*  2. The actual Provider                                             */
/* ------------------------------------------------------------------ */
function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setIsLoading(false);
      console.log('Initial session check:', data.session ? 'Session found' : 'No session');
    }).catch(error => {
        console.error("Error getting initial session:", error);
        setIsLoading(false);
    });

    // Subscribe to auth changes (login / logout / token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        console.log('Auth state changed:', _event, newSession ? 'New session' : 'No session');
        setSession(newSession ?? null);
        // If the event is SIGNED_IN or TOKEN_REFRESHED, loading might briefly be true again
        // depending on how you handle redirects, but usually setting session is enough.
        // If SIGNED_OUT, ensure loading is false.
        if (_event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Enforce splash-screen logic & route guarding                    */
/* ------------------------------------------------------------------ */
function Root() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments(); // e.g., ["(tabs)", "home"] or ["(auth)", "login"]

  /* Load Fonts ----------------------------------------------------- */
  const [fontsLoaded, fontError] = useFonts({
    // Ensure font names match those used in tamagui.config.ts
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  /* Handle Font Loading & Errors ----------------------------------- */
  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
      // Decide how to handle font errors - maybe show an error message?
      // For now, we still need to hide splash eventually.
      SplashScreen.hideAsync();
    }
  }, [fontError]);

  /* Redirect Logic ------------------------------------------------- */
  useEffect(() => {
    // Wait until auth state is confirmed AND fonts are potentially loaded
    if (isLoading || !fontsLoaded && !fontError) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log(`Auth State: isLoading=${isLoading}, session=${!!session}, inAuthGroup=${inAuthGroup}, segments=${segments.join('/')}`);

    if (!session && !inAuthGroup) {
      console.log('Redirecting to login...');
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      console.log('Redirecting to home...');
      router.replace('/(tabs)/home');
    } else {
        console.log('No redirect needed.');
    }
  }, [isLoading, session, segments, router, fontsLoaded, fontError]);

  /* Hide splash only when fonts loaded/error AND auth check done ---- */
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
        console.log('Hiding SplashScreen...');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  /* Show loading indicator until ready ----------------------------- */
  if (!fontsLoaded && !fontError || isLoading) {
    // Optionally, return the Splash Screen component itself or a custom loading view
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' /* Approx dark bg */ }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // Once loaded and auth checked, render the content based on route
  return (
    <>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Slot />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Wrap everything with SafeArea, Providers, etc.                  */
/* ------------------------------------------------------------------ */
import { ToastProvider, Toast, useToastState, ToastViewport } from '@tamagui/toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from '@tamagui/lucide-icons';
import { YStack, XStack } from 'tamagui';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

const ACCENT_COLOR_KEY = 'userAccentColor';
const DEFAULT_ACCENT = 'blue'; // Set your default accent color theme name here

// Context to provide accent update function down the tree
const AccentContext = createContext({
  setAccent: (color: string) => {},
});
export const useAccent = () => useContext(AccentContext);

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const themeMode = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <ToastProvider swipeDirection="horizontal" duration={6000}>
      <Slot />
      <CurrentToast />
      <ToastViewport name="DefaultViewport" top={40} left={0} right={0} /> 
    </ToastProvider>
  );
}

function CurrentToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) {
    return null;
  }

  const toastType = currentToast.customData?.type || 'info'; // Default to 'info'
  let themeName = 'toast_info'; // Default theme
  let IconComponent = Info;

  switch (toastType) {
    case 'success':
      themeName = 'toast_success';
      IconComponent = CheckCircle;
      break;
    case 'error':
      themeName = 'toast_error';
      IconComponent = AlertCircle;
      break;
    case 'warning':
      themeName = 'toast_warning';
      IconComponent = AlertTriangle;
      break;
  }

  return (
    <Theme name={themeName as ThemeName}> {/* Cast themeName to ThemeName */}
      <Toast
        key={currentToast.id}
        duration={currentToast.duration}
        enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
        exitStyle={{ opacity: 0, scale: 0.95, y: -10 }} // Adjusted exit style slightly
        y={0}
        opacity={1}
        scale={1}
        animation="bouncy" // Apply bouncy animation
        viewportName={currentToast.viewportName ?? 'DefaultViewport'}
        backgroundColor="$background" // Use background from the wrapped theme
        padding="$3"
        borderRadius="$4"
        marginHorizontal="$4"
        elevate
        shadowColor="$shadowColor"
      >
        <YStack space="$1">
          <XStack space="$2" alignItems="center">
            <IconComponent size={18} color="$color" /> {/* Use color from the wrapped theme */}
            <Toast.Title color="$color">{currentToast.title}</Toast.Title> {/* Use color from the wrapped theme */}
          </XStack>
          {!!currentToast.message && (
            <Toast.Description color="$color"> {/* Use color from the wrapped theme */}
              {currentToast.message}
            </Toast.Description>
          )}
        </YStack>
      </Toast>
    </Theme>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);

  // Load accent color on mount
  useEffect(() => {
    const loadAccent = async () => {
      try {
        const savedAccent = await SecureStore.getItemAsync(ACCENT_COLOR_KEY);
        if (savedAccent) {
          setAccentColor(savedAccent);
        }
      } catch (error) {
        console.error('Failed to load accent color:', error);
      }
    };
    loadAccent();
  }, []);

  // Function to update and save accent color
  const handleSetAccent = useCallback(async (newColor: string) => {
    try {
      await SecureStore.setItemAsync(ACCENT_COLOR_KEY, newColor);
      setAccentColor(newColor);
    } catch (error) {
      console.error('Failed to save accent color:', error);
    }
  }, []);

  return (
    <AccentContext.Provider value={{ setAccent: handleSetAccent }}>
      <Theme name={accentColor as ThemeName}> {/* Cast accentColor to ThemeName */}
        {children}
      </Theme>
    </AccentContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Gluestack Provider (wraps everything for migration) */}
        <GluestackProvider>
          {/* Core Providers (Tamagui, QueryClient, tRPC) */}
          <Providers>
            {/* Auth Provider manages session state */}
            <AuthProvider>
              {/* Root handles splash, font loading, and redirects */}
              <RootLayoutNav />
            </AuthProvider>
          </Providers>
        </GluestackProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### Current provider files
```
./providers/AppProvider.tsx
./providers/ConfettiProvider.tsx
./providers/GluestackProvider.tsx
./providers/Providers.tsx
```

### GluestackProvider.tsx
**Path:** providers/GluestackProvider.tsx
**Description:** New Gluestack provider

```typescript
// providers/GluestackProvider.tsx
import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueTheme } from '@/design-system/theme.glue';

export const GluestackProvider = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider config={glueTheme}>
    {children}
  </GluestackUIProvider>
);
```

### Providers.tsx
**Path:** providers/Providers.tsx
**Description:** Current providers wrapper (to be refactored)

```typescript
// providers/Providers.tsx
import '../tamagui.config'; // Ensure Tamagui config is loaded first!
import { getConfig } from '@tamagui/core';
console.log('Effective Tamagui config keys:', Object.keys(getConfig() ?? {}));
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui';
import { ToastProvider, ToastViewport } from '@tamagui/toast'; // Import from Tamagui Toast
import React, { useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native'; // Import Platform

import config from '../tamagui.config'; // Import your config
import { trpc } from '../utils/trpc'; // Your tRPC hook setup
import { queryClient, persister, initializeNetworkMonitoring, resumeMutationsAndInvalidate } from '@/utils/query-client';
import { useUiStore } from '@/stores/uiStore';
import { supabase } from '@/utils/supabase'; // Needed for auth link
import { createTRPCClient, httpBatchLink, TRPCLink, TRPCClientError } from '@trpc/client'; // Import TRPC Client utils
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '../server/src/router'; // Adjust path if needed
import type { Session } from '@supabase/supabase-js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Setup query client persistence
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateMutation: () => false, // Usually don't dehydrate mutations
  },
});

// New component for the viewport using safe area
const CurrentToastViewport = () => {
  const { top, bottom, left, right } = useSafeAreaInsets();
  return (
    <>
      {/* Adjust positioning based on your desired toast location */}
      <ToastViewport
        name="global_top"
        flexDirection="column" // Stack new toasts below older ones
        top={top + 10} // Add padding below status bar
        left={left + 10} // Add padding from sides
        right={right + 10}
      />
      <ToastViewport
        name="global_bottom"
        flexDirection="column-reverse"
        bottom={bottom + 10}
        left={left + 10}
        right={right + 10}
      />
    </>
  );
};

// Extract tRPC links setup
function getTRPCLinks(getSession: () => Promise<Session | null>): TRPCLink<AppRouter>[] {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/trpc'; // Default to localhost
  console.log('Using tRPC API URL:', apiBaseUrl);

  return [
    // Link to handle auth token injection and refresh
    (runtime) => {
      return ({ op, next }) => {
        return observable((observer) => {
          getSession().then(session => {
            const headers = (op.context?.headers || {}) as Record<string, string>;
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            // Proceed with the request, ensuring context is passed correctly
            next({ ...op, context: { ...op.context, headers } })
              .subscribe({
                next: (value) => observer.next(value),
                error: async (err) => {
                  if (err instanceof TRPCClientError && err.data?.httpStatus === 401) {
                    console.log('tRPC: Token expired or invalid, attempting refresh...');
                    try {
                      // Supabase handles refresh internally if needed when getSession is called
                      const { data, error: refreshError } = await supabase.auth.refreshSession();
                      if (refreshError) throw refreshError;

                      if (data.session) {
                        console.log('tRPC: Session refreshed successfully, retrying request.');
                        const refreshedHeaders = { ...headers, Authorization: `Bearer ${data.session.access_token}` };
                        // Retry with new headers in context
                        next({ ...op, context: { ...op.context, headers: refreshedHeaders } }).subscribe(observer);
                      } else {
                        console.error('tRPC: Session refresh failed, no session returned.');
                        observer.error(err); // Propagate original error if no new session
                        // Optionally trigger logout here
                        supabase.auth.signOut();
                      }
                    } catch (refreshCatchError) {
                      console.error('tRPC: Session refresh catch error:', refreshCatchError);
                      observer.error(err); // Propagate original error
                      supabase.auth.signOut();
                    }
                  } else {
                    observer.error(err); // Propagate non-auth errors
                  }
                },
                complete: () => observer.complete(),
              });
          }).catch(err => {
             console.error('tRPC: Error getting session for headers:', err);
             observer.error(new TRPCClientError('Failed to get session')); // Use TRPCClientError
          });

          // Return cleanup function if needed
          return () => {};
        });
      };
    },
    // The terminating HTTP link
    httpBatchLink({
      url: apiBaseUrl,
       headers() {
         // Headers are injected by the middleware link above
         return {};
       },
      // Add superjson transformer here if you use one
      // transformer: superjson,
    }),
  ];
}

export function Providers({ children }: { children: ReactNode }) {
  // Get theme state from Zustand
  const { isDarkMode } = useUiStore();
  const currentTheme = isDarkMode ? 'dark' : 'light';

  // Initialize network monitoring and query client persistence
  useEffect(() => {
    const unsubscribeNetworkMonitoring = initializeNetworkMonitoring();
    resumeMutationsAndInvalidate(); // Try resuming mutations on app load
    return () => {
      unsubscribeNetworkMonitoring();
    };
  }, []);

  // Memoize tRPC client creation
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: getTRPCLinks(async () => { // Pass session getter to links setup
        const { data } = await supabase.auth.getSession();
        return data.session;
      }),
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider
            config={config}
            defaultTheme={currentTheme}
            // disableInjectCSS // May not be needed depending on setup
        >
          {/* Use Tamagui's ToastProvider */}
          <ToastProvider
            // burntOptions={{ from: 'top' }} // Disabled until native module 'Burnt' is installed
            swipeDirection="horizontal"
            duration={4000}
            native={[]}
          >
            {children}
            {/* Add the safe-area aware ToastViewport */}
            <CurrentToastViewport />
          </ToastProvider>
        </TamaguiProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}```

### TRPCProvider.tsx (planned)
**Path:** providers/TRPCProvider.tsx
**Status:** File planned but not yet created
**Description:** tRPC client provider

### SupabaseProvider.tsx (planned)
**Path:** providers/SupabaseProvider.tsx
**Status:** File planned but not yet created
**Description:** Supabase client provider


# 5️⃣ Dashboard Implementation
Focus on the critical 'Task Swipe → Done' feature for migration.

### index.tsx
**Path:** app/(tabs)/home/index.tsx
**Description:** Current dashboard implementation (to be migrated)

```typescript
// app/(tabs)/home/index.gluestack.tsx
// New implementation of Home tab using Gluestack UI + NativeWind

import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Stack, Text, Button } from '@/design-system/Primitives';
import { router } from 'expo-router';
import { useDashboardQuery } from '@/app/lib/useDashboardQuery';
import { useToggleTaskStatus } from '@/app/lib/useToggleTaskStatus';
import { SectionCard } from '@/app/components/SectionCard';
import { SwipeableRow } from '@/app/components/SwipeableRow';
import { TaskRow } from '@/app/components/TaskRow';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons'; // Use Ionicons which is already in your project
import LottieView from 'lottie-react-native';

/**
 * Home Screen using Gluestack UI + NativeWind 
 * with Task Swipe → Done functionality
 */
export default function Home() {
  // Fetch dashboard data and task mutation
  const { data, isLoading, isRefetching, refetch } = useDashboardQuery();
  const toggleTaskMutation = useToggleTaskStatus();
  
  // Handle task completion with haptic feedback
  const handleCompleteTask = (taskId: string) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call mutation to mark task as complete
    toggleTaskMutation.mutate({ taskId, completed: true });
  };

  // Handle task deletion (placeholder for now)
  const handleDeleteTask = (taskId: string) => {
    console.log(`Delete task: ${taskId}`);
    // TODO: Implement delete mutation
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          // Custom refresh colors aligned with Zelda theme
          tintColor="#86A5A9" // sheikahCyan
          colors={['#86A5A9', '#92C582']} // sheikahCyan, korokGreen
        />
      }
      className="bg-parchment/30 dark:bg-darkTealBg/90"
    >
      <Stack className="p-4">
        {/* Today's Tasks Section */}
        <SectionCard title="Today's Tasks">
          {isLoading ? (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">Loading tasks...</Text>
            </Stack>
          ) : data?.tasks?.length ? (
            // Map through tasks and wrap each in SwipeableRow
            data.tasks.slice(0, 5).map((task) => (
              <SwipeableRow
                key={task.id}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              >
                <TaskRow task={task} />
              </SwipeableRow>
            ))
          ) : (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">No tasks for today</Text>
            </Stack>
          )}
          
          {/* Add Task Button */}
          <Stack className="mt-3 self-center">
            <Button
              className="bg-sheikahCyan/10 rounded-full py-2 px-4 border border-sheikahCyan/50 flex-row items-center"
              onPress={() => router.push('/(tabs)/tasks/add-task' as any)}
            >
              <Ionicons name="add-outline" size={16} color="#86A5A9" />
              <Text className="text-sheikahCyan ml-1">New Task</Text>
            </Button>
          </Stack>
        </SectionCard>
        
        {/* Additional sections can be added here */}
      </Stack>
    </ScrollView>
  );
}
```

### index.gluestack.tsx
**Path:** app/(tabs)/home/index.gluestack.tsx
**Description:** New Gluestack dashboard implementation

```typescript
// app/(tabs)/home/index.gluestack.tsx
// New implementation of Home tab using Gluestack UI + NativeWind

import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Stack, Text, Button } from '@/design-system/Primitives';
import { router } from 'expo-router';
import { useDashboardQuery } from '@/app/lib/useDashboardQuery';
import { useToggleTaskStatus } from '@/app/lib/useToggleTaskStatus';
import { SectionCard } from '@/app/components/SectionCard';
import { SwipeableRow } from '@/app/components/SwipeableRow';
import { TaskRow } from '@/app/components/TaskRow';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons'; // Use Ionicons which is already in your project
import LottieView from 'lottie-react-native';

/**
 * Home Screen using Gluestack UI + NativeWind 
 * with Task Swipe → Done functionality
 */
export default function Home() {
  // Fetch dashboard data and task mutation
  const { data, isLoading, isRefetching, refetch } = useDashboardQuery();
  const toggleTaskMutation = useToggleTaskStatus();
  
  // Handle task completion with haptic feedback
  const handleCompleteTask = (taskId: string) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call mutation to mark task as complete
    toggleTaskMutation.mutate({ taskId, completed: true });
  };

  // Handle task deletion (placeholder for now)
  const handleDeleteTask = (taskId: string) => {
    console.log(`Delete task: ${taskId}`);
    // TODO: Implement delete mutation
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          // Custom refresh colors aligned with Zelda theme
          tintColor="#86A5A9" // sheikahCyan
          colors={['#86A5A9', '#92C582']} // sheikahCyan, korokGreen
        />
      }
      className="bg-parchment/30 dark:bg-darkTealBg/90"
    >
      <Stack className="p-4">
        {/* Today's Tasks Section */}
        <SectionCard title="Today's Tasks">
          {isLoading ? (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">Loading tasks...</Text>
            </Stack>
          ) : data?.tasks?.length ? (
            // Map through tasks and wrap each in SwipeableRow
            data.tasks.slice(0, 5).map((task) => (
              <SwipeableRow
                key={task.id}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              >
                <TaskRow task={task} />
              </SwipeableRow>
            ))
          ) : (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">No tasks for today</Text>
            </Stack>
          )}
          
          {/* Add Task Button */}
          <Stack className="mt-3 self-center">
            <Button
              className="bg-sheikahCyan/10 rounded-full py-2 px-4 border border-sheikahCyan/50 flex-row items-center"
              onPress={() => router.push('/(tabs)/tasks/add-task' as any)}
            >
              <Ionicons name="add-outline" size={16} color="#86A5A9" />
              <Text className="text-sheikahCyan ml-1">New Task</Text>
            </Button>
          </Stack>
        </SectionCard>
        
        {/* Additional sections can be added here */}
      </Stack>
    </ScrollView>
  );
}
```

### SwipeableRow.tsx
**Path:** app/components/SwipeableRow.tsx
**Description:** Swipeable row component for task actions

```typescript
// app/components/SwipeableRow.tsx
import React from 'react';
import { View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Button } from '@/design-system/Primitives';
import { Ionicons } from '@expo/vector-icons';

type SwipeableRowProps = {
  children: React.ReactNode;
  onComplete?: () => void;
  onDelete?: () => void;
};

export const SwipeableRow = ({ children, onComplete, onDelete }: SwipeableRowProps) => {
  // Render left-swipe (complete) action
  const renderLeftActions = () => {
    if (!onComplete) return null;
    return (
      <View className="flex-row">
        <Button 
          className="w-20 h-full justify-center items-center bg-korokGreen" 
          onPress={onComplete}
          aria-label="Complete task"
        >
          <Ionicons name="checkmark-outline" size={20} color="#FDFFE0" /* parchment */ />
        </Button>
      </View>
    );
  };

  // Render right-swipe (delete) action
  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <View className="flex-row justify-end">
        <Button 
          className="w-20 h-full justify-center items-center bg-guardianOrange" 
          onPress={onDelete}
          aria-label="Delete task"
        >
          <Ionicons name="trash-outline" size={20} color="#FDFFE0" /* parchment */ />
        </Button>
      </View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootFriction={8}
      containerStyle={{ backgroundColor: 'transparent' }}
    >
      {children}
    </Swipeable>
  );
};
```

### TaskRow.tsx
**Path:** app/components/TaskRow.tsx
**Description:** Task row formatting for to-do lists

```typescript
// app/components/TaskRow.tsx
import React, { memo } from 'react';
import { Text, Stack } from '@/design-system/Primitives';
import { Ionicons } from '@expo/vector-icons';
import { RouterOutputs } from '@/utils/trpc';

// Use the existing task type from your tRPC output
type DashboardData = RouterOutputs['dashboard']['getDashboardData'];
type Task = DashboardData['tasks'][number];

export const TaskRow = memo(({ task }: { task: Task }) => (
  <Stack className="flex-row items-center py-3 px-4 bg-parchment/80 dark:bg-darkTealBg/50">
    {task.status === 'completed' && (
      <Ionicons 
        name="checkmark-circle" 
        size={18} 
        color="#92C582" // korokGreen
        style={{ marginRight: 8 }} 
      />
    )}
    <Text 
      className={`flex-1 ${task.status === 'completed' 
        ? 'text-darkText/50 line-through' 
        : 'text-darkText dark:text-parchment'}`}
    >
      {task.name}
    </Text>
    {task.due_date && (
      <Text className="text-xs text-darkText/70 dark:text-parchment/70">
        {new Date(task.due_date).toLocaleDateString()}
      </Text>
    )}
  </Stack>
));
```

### SectionCard.tsx
**Path:** app/components/SectionCard.tsx
**Description:** Glazed Sheikah-glass card section

```typescript
// app/components/SectionCard.tsx
import React from 'react';
import { Stack, Text } from '@/design-system/Primitives';
import { BlurView } from 'expo-blur';

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

export const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => {
  return (
    <Stack className="mb-6 overflow-hidden rounded-2xl">
      <BlurView intensity={30} tint="light" className="overflow-hidden rounded-2xl">
        <Stack className="p-4 bg-parchment/50 dark:bg-sheikahCyan/10">
          <Text className="font-heading text-lg mb-2 text-darkText dark:text-parchment">{title}</Text>
          {children}
        </Stack>
      </BlurView>
    </Stack>
  );
};
```

### useDashboardQuery.ts
**Path:** app/lib/useDashboardQuery.ts
**Description:** Hook for fetching dashboard data

```typescript
// app/lib/useDashboardQuery.ts
import { trpc, RouterOutputs } from '@/utils/trpc';

// Export the dashboard data type for reuse
export type DashboardData = RouterOutputs['dashboard']['getDashboardData'];

/**
 * Hook to fetch dashboard data with caching
 */
export const useDashboardQuery = () =>
  trpc.dashboard.getDashboardData.useQuery(undefined, { 
    staleTime: 60_000, // 1 minute stale time
    refetchOnMount: 'always', // Always refetch when component mounts
  });
```

### useToggleTaskStatus.ts
**Path:** app/lib/useToggleTaskStatus.ts
**Description:** Hook for toggling task status

```typescript
// app/lib/useToggleTaskStatus.ts
import { trpc } from '@/utils/trpc';
// Import Alert from React Native instead of using a toast library for simplicity
import { Alert } from 'react-native';

/**
 * Hook for toggling task completion status with optimistic updates
 */
export const useToggleTaskStatus = () => {
  const utils = trpc.useUtils();
  
  return trpc.task.toggleTask.useMutation({
    // Optimistically update UI before server responds
    onMutate: async ({ taskId, completed }) => {
      // Cancel any outgoing refetches
      await utils.dashboard.getDashboardData.cancel();
      
      // Snapshot current data for potential rollback
      const previous = utils.dashboard.getDashboardData.getData();
      
      // Optimistically update to the new value
      utils.dashboard.getDashboardData.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: oldData.tasks.map((task) => 
            task.id === taskId ? { ...task, status: completed ? 'completed' : 'in-progress' } : task
          ),
        };
      });
      
      return { previous };
    },
    
    // On successful mutation, show success message (silent in production)
    onSuccess: () => {
      if (__DEV__) {
        Alert.alert('Success', 'Task status updated');
      }
    },
    
    // If mutation fails, roll back optimistic update
    onError: (error, variables, context) => {
      if (context?.previous) {
        utils.dashboard.getDashboardData.setData(undefined, context.previous);
      }
      Alert.alert('Error', error.message || 'Failed to update task');
    },
    
    // Regardless of outcome, invalidate queries to refetch data
    onSettled: () => {
      utils.dashboard.getDashboardData.invalidate();
    },
  });
};
```


# 6️⃣ Task Swipe Implementation Details
Technical details of the swipe-to-complete feature.

### Code with pattern: 'SwipeableRow|onSwipe|onSwipeLeft|onSwipeRight'
**Description:** Swipeable row implementation details

### Code with pattern: 'completeTask|markTaskComplete|toggleTaskStatus'
**Description:** Task completion logic


# 7️⃣ tRPC Integration
How tRPC is integrated with the frontend.

### dashboardRouter.ts
**Path:** server/src/routers/dashboardRouter.ts
**Description:** tRPC router with task-related procedures

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

// Define fields for consistent selection - align with Zod schemas & table structure
const HABIT_FIELDS = 'id, user_id, name, description, habit_type, goal_quantity, goal_units, frequency_type, frequency_details, reminder_id, streak, best_streak, sort_order, created_at, updated_at'; // Added reminder_id
const GOAL_FIELDS = 'id, user_id, name, description, priority, status, target_date, sort_order, created_at, updated_at'; // Use target_date
const TASK_FIELDS = 'id, user_id, name, notes, status, priority, due_date, reminder_id, goal_id, sort_order, created_at, updated_at'; // Use due_date, reminder_id
const HABIT_ENTRY_FIELDS = 'id, habit_id, user_id, date, quantity_value, notes, created_at';
const TRACKED_STATE_DEF_FIELDS = 'id, user_id, name, description, data_type, unit, sort_order, active, notes, created_at, updated_at'; // Adjusted based on potential schema changes

export const dashboardRouter = router({
  getDashboardData: protectedProcedure
    .input(
      z.object({
        habitLimit: z.number().min(1).default(5),
        goalLimit: z.number().min(1).default(5),
        taskLimit: z.number().min(1).default(10)
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get limits from input or use defaults
        const habitLimit = input?.habitLimit || 5;
        const goalLimit = input?.goalLimit || 5;
        const taskLimit = input?.taskLimit || 10;

        // --- Fetch Habits ---
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .order('sort_order', { ascending: true, nullsFirst: false }) // Correct: nullsFirst: false for nulls last
          .limit(habitLimit);
        if (habitsError) throw habitsError;

        // --- Fetch Goals ---
        const { data: goals, error: goalsError } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .order('sort_order', { ascending: true, nullsFirst: false }) // Correct: nullsFirst: false for nulls last
          .limit(goalLimit);
        if (goalsError) throw goalsError;

        // --- Fetch Upcoming Tasks (focus on upcoming tasks and prioritize those due soon) ---
        const today = new Date();
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(today.getDate() + 14);
        
        // We want to fetch tasks that are:
        // 1. Not completed
        // 2. Due within the next two weeks, or overdue
        // 3. Either unassigned or associated with the dashboard goals
        const { data: tasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .neq('status', 'completed') // Use correct enum value
          .or(`due_date.lte.${twoWeeksFromNow.toISOString()},due_date.is.null`)
          .order('due_date', { ascending: true, nullsFirst: false }) // Use 'due_date'
          .limit(taskLimit);
        if (tasksError) throw tasksError;

        // --- Fetch Active Tracked State Definitions ---
        const { data: trackedStateDefinitions, error: statesError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .eq('active', true)
          .order('sort_order', { ascending: true, nullsFirst: false }); // Correct: nullsFirst: false for nulls last
        if (statesError) throw statesError;
        
        // --- Fetch Latest State Entries for Active Definitions ---
        let latestEntriesMap: Record<string, { value: any; created_at: string }> = {};
        const stateDefIds = (trackedStateDefinitions || []).map(s => s.id);

        if (stateDefIds.length > 0) {
          // Use a CTE and ROW_NUMBER() to get the latest entry per state_id
          const { data: latestEntries, error: entriesError } = await ctx.supabaseAdmin.rpc(
            'get_latest_state_entries_for_user', 
            { p_user_id: ctx.userId, p_state_ids: stateDefIds }
          );

          if (entriesError) {
            console.error('Error fetching latest state entries:', entriesError);
            // Decide how to handle this - throw, or continue with empty/default values?
            // For now, log and continue, states will show default value
          } else {
            // Define expected type for entries from RPC
            type LatestEntry = { state_id: string; value: any; created_at: string };
            
            latestEntriesMap = (latestEntries as LatestEntry[] || []).reduce(
              (acc: Record<string, { value: any; created_at: string }>, entry: LatestEntry) => {
              acc[entry.state_id] = { value: entry.value, created_at: entry.created_at };
              return acc;
            }, {} as typeof latestEntriesMap);
          }
        }

        // --- Process Habits for 'completed' flag ---
        const todayStr = new Date().toISOString().split('T')[0];
        const habitIds = (habits || []).map(h => h.id);
        const { data: habitEntriesToday, error: todayEntriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id') // Only need habit_id to check existence
          .eq('user_id', ctx.userId)
          .eq('date', todayStr) // Filter by date
          .in('habit_id', habitIds);
        if (todayEntriesError) throw todayEntriesError;

        const completedHabitIds = new Set((habitEntriesToday || []).map(e => e.habit_id));

        const formattedHabits = (habits || []).map(h => ({
          id: h.id,
          name: h.name, // Use name
          description: h.description, // Pass other potentially useful fields
          habit_type: h.habit_type,
          streak: h.streak,
          // Consider a habit completed if *any* entry exists for today
          completed: completedHabitIds.has(h.id)
        }));

        // --- Process Goals for 'progress' ---
        const goalIds = (goals || []).map(g => g.id);
        let tasksMap: Record<string, { total: number; completed: number }> = {};
        if (goalIds.length > 0) {
          const { data: allTasksForGoals, error: tasksError2 } = await ctx.supabaseAdmin
            .from('tasks')
            .select('goal_id, status')
            .eq('user_id', ctx.userId)
            .in('goal_id', goalIds);
          if (tasksError2) throw tasksError2;

          tasksMap = (allTasksForGoals || []).reduce<Record<string, { total: number; completed: number }>>((acc, task) => {
            if (task.goal_id) { // Ensure goal_id is not null
              const gid = task.goal_id;
              if (!acc[gid]) acc[gid] = { total: 0, completed: 0 };
              acc[gid].total++;
              if (task.status === 'completed') acc[gid].completed++;
            }
            return acc;
          }, {});
        }

        const formattedGoals = (goals || []).map((g) => {
          const { total = 0, completed: comp = 0 } = tasksMap[g.id] || {};
          // Calculate progress based on tasks, ignore goal.progress field for now
          const progress = total > 0 ? comp / total : 0;
          return {
            id: g.id,
            title: g.name, // Changed name to title to match frontend expectations
            status: g.status, // Pass status directly
            priority: g.priority, // Pass priority
            progress: Math.round(progress * 100) / 100, // Keep calculated progress
            tasks: { // Add tasks information expected by GoalSummaryCard
              total: total,
              completed: comp
            }
          };
        });

        // --- Format Tasks (Minimal formatting needed if TASK_FIELDS is correct) ---
        const formattedTasks = (tasks || []).map((t) => ({
          id: t.id,
          name: t.name,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date, // Use due_date
          // Add other fields as needed by the dashboard UI
        }));

        // --- Format Tracked States with Latest Values ---
        const formattedTrackedStates = (trackedStateDefinitions || []).map((def) => {
          const latestEntry = latestEntriesMap[def.id];
          return {
            id: def.id,
            name: def.name,
            unit: def.unit, // Use 'unit' field
            currentValue: latestEntry ? latestEntry.value : null, // Default to null
            lastUpdated: latestEntry ? latestEntry.created_at : null,
          };
        });

        // Return formatted data including trackedStates
        return {
          habits: formattedHabits,
          goals: formattedGoals,
          tasks: tasks || [], // Ensure tasks is always an array
          trackedStates: formattedTrackedStates, // Use the newly formatted array
        };
      } catch (error: any) {
        console.error('Dashboard data fetch error:', error);
        
        // Handle specific error types with appropriate error codes
        if (error.code === '42P01') { // Table doesn't exist
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database schema error',
          });
        }
        
        if (error.code === '23505') { // Unique violation
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Resource already exists',
          });
        }
        
        // Default error handling
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch dashboard data',
        });
      }
    }),
  
  getWeeklyProgress: protectedProcedure
    .input(z.object({
      daysToInclude: z.number().min(1).optional().default(7),
      includeRawData: z.boolean().optional().default(false),
    }).optional())
    .query(async ({ ctx, input }) => {
      try {
        // Calculate date range based on input or default to past week
        const daysToInclude = input?.daysToInclude || 7;
        const includeRawData = input?.includeRawData || false;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (daysToInclude - 1));
        
        const todayStr = endDate.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // Generate array of all dates in the range for daily aggregation
        const dateRange: string[] = [];
        const tempDate = new Date(startDate);
        while (tempDate <= endDate) {
          dateRange.push(tempDate.toISOString().split('T')[0]);
          tempDate.setDate(tempDate.getDate() + 1);
        }
        
        // Fetch habits relevant to the date range (active during any part of the range)
        // Need to consider habits created *before* the end date and not archived *before* the start date
        const HABIT_FIELDS_FOR_PROGRESS = 'id, name, habit_type, frequency_type, frequency_details, created_at, streak, best_streak'; // Add streak fields
        const { data: relevantHabits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS_FOR_PROGRESS)
          .eq('user_id', ctx.userId)
          // Add logic here if needed to filter habits active within the date range
          // e.g., .lt('created_at', endDate.toISOString())
          //       .or(`archived_at.gte.${startDate.toISOString()},archived_at.is.null`)
          ;
        if (habitsError) throw habitsError;

        const relevantHabitIds = (relevantHabits || []).map(h => h.id);

        // Fetch habit entries within the date range for relevant habits
        const { data: habitEntries, error: entriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('id, habit_id, date, completed, quantity_value, notes')
          .eq('user_id', ctx.userId)
          .in('habit_id', relevantHabitIds.length > 0 ? relevantHabitIds : ['dummy-uuid']) // Filter by relevant habits
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });
 
        if (entriesError) throw entriesError;

        // Get all tasks completed or due within the date range
        const { data: relevantTasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .or(`due_date.gte.${startDateStr}.and.due_date.lte.${todayStr},status.eq.completed.and.updated_at.gte.${startDateStr}.and.updated_at.lte.${todayStr}`);

        if (tasksError) throw tasksError;
        
        // Get total tasks count for completion rate
        const { count: totalTasks, error: countError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ctx.userId);
          
        if (countError) throw countError;
        
        // Get goal progress snapshots for the period
        const { data: goalSnapshots, error: goalSnapshotsError } = await ctx.supabaseAdmin
          .from('goal_progress_snapshots') // Assuming we have this table
          .select('goal_id, progress, created_at')
          .eq('user_id', ctx.userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
          
        if (goalSnapshotsError) throw goalSnapshotsError;

        // -- AGGREGATE DATA BY DAY --
        
        // Create daily habit completion structure
        const habitsByDay: Record<string, { completed: number; total: number; entries: any[]; expected: number }> = {};
        dateRange.forEach(date => {
          habitsByDay[date] = { completed: 0, total: 0, entries: [], expected: 0 };
        });
        
        // Populate completed habits from entries (count existence, not completed flag)
        habitEntries?.forEach((entry: any) => {
          const dateStr = (entry.date as string).split('T')[0];
          if (habitsByDay[dateStr]) {
            // Only count one completion per habit per day
            if (!habitsByDay[dateStr].entries.some((e: any) => e.habit_id === entry.habit_id)) {
              habitsByDay[dateStr].completed++;
            }
            habitsByDay[dateStr].entries.push(entry);
          }
        });
        
        // Create daily task completion structure
        const tasksByDay: Record<string, { completed: number; entries: any[] }> = {};
        dateRange.forEach(date => {
          tasksByDay[date] = { completed: 0, entries: [] };
        });
        
        // Process completed tasks into daily stats
        relevantTasks?.forEach(task => {
          const completedDate = (task.updated_at as string).split('T')[0];
          if (tasksByDay[completedDate]) {
            tasksByDay[completedDate].completed++;
            tasksByDay[completedDate].entries.push(task);
          }
        });
        
        // Calculate expected habits per day based on frequency
        const isHabitExpected = (habit: any, date: string): boolean => {
          const dateObj = new Date(date + 'T00:00:00Z'); // Ensure UTC
          const dayOfWeek = dateObj.getUTCDay(); // 0 = Sunday, 6 = Saturday
          const dayOfMonth = dateObj.getUTCDate();
          const month = dateObj.getUTCMonth(); // 0 = January, 11 = December

          const habitCreatedDate = new Date(habit.created_at);
          if (dateObj < habitCreatedDate) {
            return false; // Cannot be expected before it was created
          }

          switch (habit.frequency_type) {
            case 'daily':
              return true;
            case 'specific_days':
              return Array.isArray(habit.frequency_details?.days) && habit.frequency_details.days.includes(dayOfWeek);
            // TODO: Add logic for 'weekly', 'monthly' etc. as needed
            default:
              return false;
          }
        };
        relevantHabits?.forEach(habit => {
          dateRange.forEach(date => {
            if (isHabitExpected(habit, date)) {
              habitsByDay[date].expected++;
            }
          });
        });
        
        // Format into daily progress reports
        const dailyProgress = dateRange.map(date => {
          const habitStats = habitsByDay[date];
          const taskStats = tasksByDay[date];
          
          const habitCompletionRate = habitStats.expected > 0 
            ? habitStats.completed / habitStats.expected 
            : 0;
            
          return {
            date,
            habits: {
              total: habitStats.total,
              completed: habitStats.completed,
              completionRate: habitCompletionRate,
              expected: habitStats.expected
            },
            tasks: {
              completed: taskStats.completed
            },
            // Optionally include raw entries if requested
            ...(includeRawData ? {
              habitEntries: habitStats.entries,
              completedTasks: taskStats.entries
            } : {})
          };
        });
        
        // Calculate overall metrics
        const totalHabitEntries = Object.values(habitsByDay).reduce(
          (sum, day) => sum + day.total, 0);
        const completedHabitEntries = Object.values(habitsByDay).reduce(
          (sum, day) => sum + day.completed, 0);
        const totalCompletedTasks = Object.values(tasksByDay).reduce(
          (sum, day) => sum + day.completed, 0);
          
        const taskCompletionRate = totalTasks ? totalCompletedTasks / totalTasks : 0;
        const habitConsistency = totalHabitEntries > 0 
          ? completedHabitEntries / totalHabitEntries 
          : 0;
          
        // Calculate habit streaks (could be moved to a separate helper function)
        const habitStreaks = (relevantHabits || []).map(habit => ({
          id: habit.id,
          name: habit.name,
          currentStreak: habit.streak || 0,
          bestStreak: habit.best_streak || 0
        }));
        
        // Prepare goal progress data
        const goalProgress: Record<string, { snapshots: any[]; startProgress?: number; endProgress?: number }> = {};
        
        (goalSnapshots || []).forEach(snapshot => {
          if (!goalProgress[snapshot.goal_id]) {
            goalProgress[snapshot.goal_id] = { snapshots: [] };
          }
          goalProgress[snapshot.goal_id].snapshots.push({
            progress: snapshot.progress,
            date: (snapshot.created_at as string).split('T')[0]
          });
        });
        
        // Calculate start and end progress for each goal
        Object.keys(goalProgress).forEach(goalId => {
          const snapshots = goalProgress[goalId].snapshots;
          if (snapshots.length > 0) {
            // Sort by date
            snapshots.sort((a, b) => a.date.localeCompare(b.date));
            goalProgress[goalId].startProgress = snapshots[0].progress;
            goalProgress[goalId].endProgress = snapshots[snapshots.length - 1].progress;
          }
        });
        
        return {
          dailyProgress,
          overallMetrics: {
            totalHabitEntries,
            completedHabitEntries,
            habitCompletionRate: habitConsistency,
            completedTasksCount: totalCompletedTasks,
            taskCompletionRate,
            // Trend indicators (compared to previous period)
            trends: {
              habitsImproving: true, // Placeholder - would compare to previous period
              tasksImproving: false // Placeholder - would compare to previous period
            }
          },
          habitStreaks,
          goalProgress: Object.entries(goalProgress).map(([goalId, data]) => ({
            goalId,
            progressChange: (data.endProgress || 0) - (data.startProgress || 0),
            currentProgress: data.endProgress || 0
          })),
          dateRange: {
            start: startDateStr,
            end: todayStr,
            days: dateRange
          }
        };
      } catch (error: any) {
        console.error('Weekly progress fetch error:', error);
        
        // Handle specific error types with appropriate error codes
        if (error.code === '42P01') { // Table doesn't exist
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database schema error',
          });
        }
        
        if (error.code === '22P02') { // Invalid text representation
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid input format',
          });
        }
        
        // Default error handling
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch weekly progress',
        });
      }
    }),
}); ```

### rewardsRouter.ts
**Path:** server/src/routers/rewardsRouter.ts
**Description:** tRPC router with task-related procedures

```typescript
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { supabaseAdmin } from '../context';

// Corrected relative path
import { claimLootInput, awardBadgeInput } from '../types/trpc-types';

export const rewardsRouter = router({
  // Get all rewards for current user
  getUserRewards: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Select specific fields aligned with our Zod types
        const { data: rewards, error } = await ctx.supabaseAdmin
          .from('user_rewards')
          .select('id, user_id, reward_id, earned_at, rewards(id, name, description, emoji, image_url, required_points, type)')
          .eq('user_id', ctx.userId)
          .order('earned_at', { ascending: false });

        if (error) throw error;
        return rewards || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch user rewards',
        });
      }
    }),

  // Get available rewards that can be earned
  getAvailableRewards: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Get all rewards with specific fields
        const { data: allRewards, error: rewardsError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('id, name, description, emoji, image_url, required_points, type, can_earn_multiple')
          .order('required_points', { ascending: true });

        if (rewardsError) throw rewardsError;

        // Get already earned rewards
        const { data: earnedRewards, error: earnedError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .select('reward_id')
          .eq('user_id', ctx.userId);

        if (earnedError) throw earnedError;

        // Filter out already earned one-time rewards
        const earnedIds = new Set((earnedRewards || []).map(er => er.reward_id));
        const availableRewards = allRewards?.filter(reward => 
          !earnedIds.has(reward.id) || reward.can_earn_multiple);

        return availableRewards || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch available rewards',
        });
      }
    }),

  // Get user points
  getUserPoints: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: userProfile, error } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points, lifetime_points')
          .eq('id', ctx.userId)
          .single();

        if (error) throw error;
        return {
          points: userProfile?.points || 0,
          lifetimePoints: userProfile?.lifetime_points || 0,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch user points',
        });
      }
    }),

  // Earn a reward if eligible
  earnReward: protectedProcedure
    .input(claimLootInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the reward details
        const { data: reward, error: rewardError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('*')
          .eq('id', input.rewardId)
          .single();

        if (rewardError || !reward) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Reward not found',
          });
        }

        // Check if user has enough points
        const { data: userProfile, error: profileError } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points')
          .eq('id', ctx.userId)
          .single();

        if (profileError || !userProfile) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user profile',
          });
        }

        if (userProfile.points < reward.required_points) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough points to earn this reward',
          });
        }

        // If the reward is one-time, check if already earned
        if (!reward.can_earn_multiple) {
          const { data: existingReward, error: existingError } = await ctx.supabaseAdmin
            .from('user_rewards')
            .select('id')
            .eq('user_id', ctx.userId)
            .eq('reward_id', input.rewardId)
            .single();

          if (existingReward) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'You have already earned this one-time reward',
            });
          }
        }

        // Begin transaction
        // 1. Deduct points from user
        const { error: updateError } = await ctx.supabaseAdmin
          .from('profiles')
          .update({
            points: userProfile.points - reward.required_points,
          })
          .eq('id', ctx.userId);

        if (updateError) throw updateError;

        // 2. Add reward to user's earned rewards
        const { data: userReward, error: insertError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .insert({
            user_id: ctx.userId,
            reward_id: input.rewardId,
            earned_at: new Date().toISOString(),
            points_spent: reward.required_points,
          })
          .select()
          .single();

        if (insertError) {
          // Rollback points if adding reward failed
          await ctx.supabaseAdmin
            .from('profiles')
            .update({
              points: userProfile.points,
            })
            .eq('id', ctx.userId);

          throw insertError;
        }

        return {
          success: true,
          reward: userReward,
          remainingPoints: userProfile.points - reward.required_points,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to earn reward',
        });
      }
    }),

  // Award points to user (e.g., for completing habits, tasks)
  awardPoints: protectedProcedure
    .input(awardBadgeInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current user points
        const { data: userProfile, error: profileError } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points, lifetime_points')
          .eq('id', ctx.userId)
          .single();

        if (profileError || !userProfile) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user profile',
          });
        }

        // Get badge details
        const { data: badge, error: badgeError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('*')
          .eq('id', input.badgeId)
          .eq('type', 'badge')
          .single();

        if (badgeError || !badge) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Badge not found',
          });
        }

        // Default points to award
        const pointsToAward = 10;
        const currentPoints = userProfile.points || 0;
        const lifetimePoints = userProfile.lifetime_points || 0;
        const newPoints = currentPoints + pointsToAward;
        const newLifetimePoints = lifetimePoints + pointsToAward;

        // Update user points
        const { error: updateError } = await ctx.supabaseAdmin
          .from('profiles')
          .update({
            points: newPoints,
            lifetime_points: newLifetimePoints,
          })
          .eq('id', ctx.userId);

        if (updateError) throw updateError;

        // Record the point transaction
        const { data: pointTransaction, error: transactionError } = await ctx.supabaseAdmin
          .from('point_transactions')
          .insert({
            user_id: ctx.userId,
            points: pointsToAward,
            reason: `Earned badge: ${badge.name}`,
            source_type: 'badge',
            source_id: input.badgeId,
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Add badge to user's earned rewards
        const { data: userBadge, error: badgeInsertError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .insert({
            user_id: ctx.userId,
            reward_id: input.badgeId,
            reward_type: 'badge',
            earned_at: new Date().toISOString(),
            points_spent: 0, // Badges don't cost points
          })
          .select()
          .single();

        if (badgeInsertError) throw badgeInsertError;

        return {
          success: true,
          previousPoints: currentPoints,
          newPoints,
          pointsAdded: pointsToAward,
          transaction: pointTransaction,
          badge: userBadge,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to award badge',
        });
      }
    }),

  // Get point transaction history
  getPointHistory: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      cursor: z.string().optional(), // for pagination
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('point_transactions')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(input.limit);
          
        // Handle cursor-based pagination
        if (input.cursor) {
          query = query.lt('created_at', input.cursor);
        }
        
        const { data: transactions, error } = await query;

        if (error) throw error;
        
        // Determine if there are more results
        const lastItem = transactions && transactions.length > 0 
          ? transactions[transactions.length - 1] 
          : null;
          
        return {
          items: transactions || [],
          nextCursor: lastItem?.created_at,
          hasMore: (transactions?.length || 0) === input.limit,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch point history',
        });
      }
    }),
}); ```

### taskRouter.ts
**Path:** server/src/routers/taskRouter.ts
**Description:** tRPC router with task-related procedures

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  createTaskInput,
  updateTaskInput,
  updateTaskStatusInput,
  TaskStatusEnum, // Import the enum
  TaskPriorityEnum,
} from '../types/trpc-types';

// Define fields for selection consistency
const TASK_FIELDS =
  'id, user_id, title, notes, status, priority, due_date, goal_id, parent_task_id, recurrence_rule, recurrence_end_date, archived_at, sort_order, created_at, updated_at'; // Corrected: 'priority' instead of 'priority_enum' if that's the actual column name after migration
const GOAL_FIELDS = 'id, user_id, title, description, progress, target_date, archived_at, sort_order, created_at, updated_at';


// --- Helper function to update goal progress ---
async function updateGoalProgress(goalId: string, userId: string, supabase: any) {
  try {
    // 1. Fetch all non-archived tasks for the goal
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status') // Only need id and status
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .is('archived_at', null); // Exclude archived tasks

    if (tasksError) {
      console.error(`Error fetching tasks for goal ${goalId} during progress update:`, tasksError);
      // Decide how to handle this - maybe just log and skip update?
      return; // Exit if tasks can't be fetched
    }

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t: { status: string }) => t.status === TaskStatusEnum.enum.done).length || 0;

    // 2. Calculate progress (avoid division by zero)
    const newProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
    // Ensure progress is between 0 and 1, rounded to avoid floating point issues
    const clampedProgress = Math.round(Math.min(1, Math.max(0, newProgress)) * 100) / 100;

    // 3. Update the goal record
    const { error: updateError } = await supabase
      .from('goals')
      .update({ progress: clampedProgress })
      .eq('id', goalId)
      .eq('user_id', userId); // Ensure user owns the goal

    if (updateError) {
      console.error(`Error updating progress for goal ${goalId}:`, updateError);
      // Log error but don't necessarily throw, task toggle was successful
    } else {
        console.log(`Updated progress for goal ${goalId} to ${clampedProgress}`);
    }

  } catch (err) {
    console.error(`Unexpected error during goal progress update for goal ${goalId}:`, err);
    // Log unexpected errors
  }
}

export const taskRouter = router({
  getTasks: protectedProcedure // Gets non-archived tasks
    .input(z.object({
      goalId: z.string().uuid().optional(),
      // TODO: Add filters for status, priority, dates etc.?
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null); // Filter out archived

        if (input.goalId) {
          query = query.eq('goal_id', input.goalId);
        }

        // TODO: Add complex priority enum sorting? (e.g. high > medium > low)
        const { data: tasks, error } = await query
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('due_date', { ascending: true, nullsFirst: false }) // Order by due date (nulls last)
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tasks',
        });
      }
    }),

  getTaskById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(), // Use uuid validation
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: task, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found',
          });
        }

        // TODO: Parse with Task schema?
        return task;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch task',
        });
      }
    }),

  createTask: protectedProcedure
    .input(createTaskInput) // Use imported input type
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify goal_id if provided
        if (input.goal_id) {
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .select('id')
            .eq('id', input.goal_id)
            .eq('user_id', ctx.userId) // Ensure goal belongs to user
            .is('archived_at', null) // Ensure goal is not archived
            .single();

          if (goalError || !goal) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived goal ID',
            });
          }
        }

        // Verify parent_task_id if provided
        if (input.parent_task_id) {
          const { data: parentTask, error: parentError } = await ctx.supabaseAdmin
            .from('tasks')
            .select('id')
            .eq('id', input.parent_task_id)
            .eq('user_id', ctx.userId) // Ensure parent belongs to user
            .is('archived_at', null) // Ensure parent is not archived
            .single();

          if (parentError || !parentTask) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived parent task ID',
            });
          }
        }

        const { data: task, error } = await ctx.supabaseAdmin
          .from('tasks')
          .insert({
            ...input, // Spread validated input (includes new fields like parent_task_id, recurrence etc)
            user_id: ctx.userId,
            // Ensure due_date is used if present in input
            due_date: input.due_date ?? null, // Use correct field name
          })
          .select(TASK_FIELDS)
          .single();

        if (error) {
           // Handle specific errors like FK violations?
           console.error("Create task error:", error);
           throw error;
        }
        // TODO: Parse with Task schema?
        return task;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create task',
        });
      }
    }),

  updateTask: protectedProcedure
    .input(updateTaskInput) // Use imported input type
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input; // Separate id from update payload

        // Check ownership
        const { data: existingTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, parent_task_id') // Select parent_task_id for cycle check
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          });
        }

        // Verify goal_id if being updated
        if (updateData.goal_id) {
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .select('id')
            .eq('id', updateData.goal_id)
            .eq('user_id', ctx.userId)
            .is('archived_at', null)
            .single();

          if (goalError || !goal) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived goal ID',
            });
          }
        }
        // Handle setting goal_id to null
        if (updateData.goal_id === null) {
          updateData.goal_id = null;
        }

        // Verify parent_task_id if being updated
        if (updateData.parent_task_id) {
           // Basic cycle check
           if (updateData.parent_task_id === id) {
             throw new TRPCError({
               code: 'BAD_REQUEST',
               message: 'Task cannot be its own parent',
             });
           }
          const { data: parentTask, error: parentError } = await ctx.supabaseAdmin
            .from('tasks')
            .select('id')
            .eq('id', updateData.parent_task_id)
            .eq('user_id', ctx.userId)
            .is('archived_at', null)
            .single();

          if (parentError || !parentTask) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived parent task ID',
            });
          }
          // TODO: Add deeper cycle detection if needed (check if new parent is a descendant)
        }
         // Handle setting parent_task_id to null
        if (updateData.parent_task_id === null) {
          updateData.parent_task_id = null;
        }

        // Ensure correct field name for due date if provided
        const payload: Record<string, any> = { ...updateData };
        if ('due_date' in payload) {
          payload.due_date = payload.due_date ?? null;
        }

        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update(payload) // Pass validated update data
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
             // Handle specific errors like FK violations?
           console.error("Update task error:", error);
           throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update task',
        });
      }
    }),

  deleteTask: protectedProcedure
    .input(z.object({
      id: z.string().uuid(), // Use uuid validation
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check ownership
        const { data: existingTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to delete it',
          });
        }

        // Delete the task (consider implications for subtasks - maybe archive instead?)
        // For now, direct delete.
        const { error } = await ctx.supabaseAdmin
          .from('tasks')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete task',
        });
      }
    }),

  // ---- Archive/Unarchive ----
  listArchivedTasks: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: tasks, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .not('archived_at', 'is', null) // Filter for archived tasks
          .order('archived_at', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch archived tasks',
        });
      }
    }),

  archiveTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Consider archiving subtasks recursively?
      try {
        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found or you do not have permission to archive it.',
            });
          }
          throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to archive task',
        });
      }
    }),

  unarchiveTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
       // TODO: Consider check if parent is archived?
      try {
        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ archived_at: null })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found or you do not have permission to unarchive it.',
            });
          }
          throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to unarchive task',
        });
      }
    }),

  // ---- Status Update ----
  updateTaskStatus: protectedProcedure
    .input(updateTaskStatusInput) // Uses { id: string().uuid(), status: TaskStatusEnum }
    .mutation(async ({ ctx, input }) => {
       try {
         // Check ownership first
         const { data: existing, error: fetchErr } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

         if (fetchErr || !existing) {
           throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found or permission denied.' });
         }

         // Perform update
         const { data: updatedTask, error: updateErr } = await ctx.supabaseAdmin
           .from('tasks')
           .update({ status: input.status })
           .eq('id', input.id)
           .select(TASK_FIELDS)
           .single();

         if (updateErr) throw updateErr;
         // TODO: Parse with Task schema?
         return updatedTask;
       } catch (error: any) {
         if (error instanceof TRPCError) throw error;
         throw new TRPCError({
           code: 'INTERNAL_SERVER_ERROR',
           message: error.message || 'Failed to update task status',
         });
       }
    }),

  // ---- Refactored Stubs ----
  listToday: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data: tasks, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .gte('due_date', todayStart.toISOString())
          .lte('due_date', todayEnd.toISOString())
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('due_date', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list tasks for today' });
      }
    }),

  listUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
       try {
         const tomorrowStart = new Date();
         tomorrowStart.setDate(tomorrowStart.getDate() + 1);
         tomorrowStart.setHours(0, 0, 0, 0);

         const { data: tasks, error } = await ctx.supabaseAdmin
           .from('tasks')
           .select(TASK_FIELDS)
           .eq('user_id', ctx.userId)
           .is('archived_at', null)
           .gte('due_date', tomorrowStart.toISOString()) // Due date is tomorrow or later
           .order('due_date', { ascending: true, nullsFirst: false })
           .order('sort_order', { ascending: true, nullsFirst: false })
           .order('created_at', { ascending: false });

         if (error) throw error;
         // TODO: Parse with Task schema?
         return tasks || [];
       } catch (error: any) {
         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list upcoming tasks' });
       }
    }),

 listOverdue: protectedProcedure
    .query(async ({ ctx }) => {
       try {
         const todayStart = new Date();
         todayStart.setHours(0, 0, 0, 0);

         const { data: tasks, error } = await ctx.supabaseAdmin
           .from('tasks')
           .select(TASK_FIELDS)
           .eq('user_id', ctx.userId)
           .is('archived_at', null)
           .lt('due_date', todayStart.toISOString()) // Due date is before today
           .not('status', 'in', `('${TaskStatusEnum.enum.done}')`) // Exclude completed tasks
           .order('due_date', { ascending: true, nullsFirst: false })
           .order('sort_order', { ascending: true, nullsFirst: false })
           .order('created_at', { ascending: false });

         if (error) throw error;
         // TODO: Parse with Task schema?
         return tasks || [];
       } catch (error: any) {
         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list overdue tasks' });
       }
    }),

  toggleTask: protectedProcedure // Toggles between 'todo' and 'done'
    .input(z.object({
      taskId: z.string().uuid(),
      completed: z.boolean().optional() // Optional for backward compatibility
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Fetch the current task, including goal_id
        const { data: currentTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, status, goal_id, title') // <-- Include goal_id and title
          .eq('id', input.taskId)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !currentTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found or permission denied.' });
        }

        // 2. Determine the new status
        let newStatus;
        if (input.completed !== undefined) {
          // If completed was explicitly provided, use it
          newStatus = input.completed ? TaskStatusEnum.enum.done : TaskStatusEnum.enum.todo;
        } else {
          // Otherwise toggle the current status
          newStatus = currentTask.status === TaskStatusEnum.enum.done
            ? TaskStatusEnum.enum.todo
            : TaskStatusEnum.enum.done;
        }

        // 3. Update the task status
        const { data: updatedTask, error: updateError } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', input.taskId)
          .select(TASK_FIELDS) // Return the full updated task
          .single();

        if (updateError) throw updateError;

        // 4. *** NEW: Update goal progress if applicable ***
        if (currentTask.goal_id) {
           // Call the helper function asynchronously - no need to await here
           // unless the UI needs the updated goal immediately (unlikely for a toggle)
          updateGoalProgress(currentTask.goal_id, ctx.userId, ctx.supabaseAdmin);
        }

        // 5. Return the updated task
        return updatedTask;

      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in toggleTask:", error); // Log unexpected errors
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to toggle task status',
        });
      }
    }),

  // --- Obsolete Stubs (keep or remove based on client usage) ---
  /*
  getTasksByGoal: protectedProcedure ... // Covered by getTasks with goalId filter
  getTodaysTasks: protectedProcedure ... // Replaced by listToday
  getUpcomingTasks: protectedProcedure ... // Replaced by listUpcoming
  updateTaskStatus_OLD: protectedProcedure ... // Replaced by updateTaskStatus and toggleTask
  */

});```

### userRouter.ts
**Path:** server/src/routers/userRouter.ts
**Description:** tRPC router with task-related procedures

```typescript
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .select('id, username, avatar_url, full_name, bio, time_zone, onboarding_completed, created_at, updated_at')
        .eq('id', ctx.userId)
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  updateProfile: protectedProcedure
    .input(z.object({
      full_name: z.string().optional(),
      avatar_url: z.string().optional(),
      theme: z.string().optional(),
      time_zone: z.string().optional(),
      display_name: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  getUserSettings: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('user_settings')
        .select('id, user_id, notification_preferences, ui_preferences')
        .eq('user_id', ctx.userId)
        .single();
        
      if (error) {
        // If settings don't exist, create default settings
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: createError } = await ctx.supabaseAdmin
            .from('user_settings')
            .insert({
              user_id: ctx.userId,
              notification_preferences: {
                email: true,
                push: true,
                task_reminders: true,
                goal_updates: true,
                habit_reminders: true
              },
              ui_preferences: {
                theme: 'system',
                compact_view: false,
                show_completed_tasks: true
              }
            })
            .select()
            .single();
            
          if (createError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: createError.message });
          return newSettings;
        }
        
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }
      
      return data;
    }),
    
  updateUserSettings: protectedProcedure
    .input(z.object({
      notification_preferences: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        task_reminders: z.boolean().optional(),
        goal_updates: z.boolean().optional(),
        habit_reminders: z.boolean().optional()
      }).optional(),
      ui_preferences: z.object({
        theme: z.string().optional(),
        compact_view: z.boolean().optional(),
        show_completed_tasks: z.boolean().optional()
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // First check if settings exist
      const { data: existingSettings, error: fetchError } = await ctx.supabaseAdmin
        .from('user_settings')
        .select('id')
        .eq('user_id', ctx.userId)
        .single();
        
      if (fetchError && fetchError.code === 'PGRST116') {
        // Create settings if they don't exist
        const defaultSettings = {
          user_id: ctx.userId,
          notification_preferences: {
            email: true,
            push: true,
            task_reminders: true,
            goal_updates: true,
            habit_reminders: true,
            ...input.notification_preferences
          },
          ui_preferences: {
            theme: 'system',
            compact_view: false,
            show_completed_tasks: true,
            ...input.ui_preferences
          }
        };
        
        const { data, error } = await ctx.supabaseAdmin
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      } else if (fetchError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: fetchError.message });
      }
      
      // Update existing settings
      const { data, error } = await ctx.supabaseAdmin
        .from('user_settings')
        .update(input)
        .eq('user_id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  getOnboardingStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .select('id, onboarding_completed')
        .eq('id', ctx.userId)
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { onboardingCompleted: data?.onboarding_completed || false };
    }),
    
  completeOnboarding: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { success: true };
    }),
}); ```

### trpc.ts
**Path:** utils/trpc.ts
**Description:** tRPC client utility

```typescript
import { createTRPCReact } from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

// Import the real AppRouter type from our server
import { type AppRouter } from '../server/src/router';

// Import types using the updated path
import { RouterInputs as TypedRouterInputs, RouterOutputs as TypedRouterOutputs } from '../server/src/types/trpc-types';

/**
 * tRPC React client
 * The client for consuming your tRPC API from React components
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Inference helpers for input/output types
 * Use the pre-defined types from trpc-types.ts
 */
export type RouterInputs = TypedRouterInputs;
export type RouterOutputs = TypedRouterOutputs; ```

### Code with pattern: 'trpc\..*\.useQuery|trpc\..*\.useMutation'
**Description:** tRPC query and mutation usage


# 8️⃣ Supabase Integration
How Supabase is integrated with the frontend.

### supabase.ts
**Path:** utils/supabase.ts
**Description:** Supabase client utility

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// SecureStore adapter for Supabase auth persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Get Supabase URL and anon key from environment variables
// In production, these should be set in app.config.js or via EAS secrets
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or anon key not found. Make sure to set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession();
  return !!data.session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
  return data.user;
}; ```

### Code with pattern: 'supabase\.|from\(.*\)\.'
**Description:** Supabase client usage patterns


# 9️⃣ Zelda Styling Guide
Zelda: Breath of the Wild / Sheikah Slate aesthetic guidelines.

### Zelda Theme Styling Guide
**Source:** aether_styling_context.txt

```
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


```

### UI Primitives to Migrate

#### AetherListItem
**File:** components/ui/primitives/AetherListItem.tsx

```typescript
import React from 'react';
import { XStack, YStack, Text, styled, GetProps, Stack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

// Base ListItem container
const ListItemContainer = styled(XStack, {
  name: 'ListItemContainer',
  backgroundColor: '$cardBackground',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  borderRadius: '$3',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  minHeight: 60,
  
  variants: {
    isLast: {
      true: {
        borderBottomWidth: 0,
      },
    },
    interactive: {
      true: {
        pressStyle: {
          backgroundColor: '$backgroundPress',
          opacity: 0.9,
        },
        hoverStyle: {

...
```

#### SectionHeader
**File:** components/ui/primitives/SectionHeader.tsx

```typescript
import React from 'react';
import { XStack, Text, styled, GetProps, Button } from 'tamagui';

const SectionContainer = styled(XStack, {
  name: 'SectionContainer',
  paddingVertical: '$2',
  paddingHorizontal: '$4',
  marginTop: '$4',
  marginBottom: '$2',
  justifyContent: 'space-between',
  alignItems: 'center',
});

type SectionContainerProps = GetProps<typeof SectionContainer>;

export interface SectionHeaderProps extends SectionContainerProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * SectionHeader - A consistent section header with optional action button
 * 
 * Used to separate content sections in screens like Home, Settings, etc.
 *
 * @param title - The section title
 * @param actionLabel - Optional label for the action button
 * @param onAction - Optional callback when action button is pressed
 */

...
```

#### AetherCard
**File:** components/ui/primitives/AetherCard.tsx

```typescript
import React from 'react';
import { Card, CardProps, YStack, styled } from 'tamagui';

type AetherCardVariant = 'default' | 'elevated' | 'outlined';

interface AetherCardProps extends CardProps {
  variant?: AetherCardVariant;
  // Additional props specific to AetherCard
  isInteractive?: boolean;
}

// Create a styled Card component that uses our custom Tamagui theme variables
const StyledCard = styled(Card, {
  name: 'AetherCard',
  backgroundColor: '$cardBackground',
  borderRadius: '$4',
  padding: '$4',
  elevate: true,

  variants: {
    variant: {
      default: {
        // Using our theme tokens
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      elevated: {

...
```


# 🎨 Assets & Styles
Fonts, images, and other assets.

### Font Assets
```
assets/fonts/SpaceMono-Regular.ttf
```

### Image Assets
```
assets/images/adaptive-icon.png
assets/images/favicon.png
assets/images/icon.png
assets/images/partial-react-logo.png
assets/images/react-logo.png
assets/images/react-logo@2x.png
assets/images/react-logo@3x.png
assets/images/splash-icon.png
```

### Animation Assets (Lottie)
```
assets/refresh-sheikah.json
```
