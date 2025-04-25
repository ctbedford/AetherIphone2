import { useTheme } from 'tamagui';

/**
 * Semantic color tokens that map to theme variables
 */
export const semanticTokens = {
  // Background colors
  background: {
    /** Main app background */
    app: '$background',
    /** Card/surface background */
    card: '$backgroundHover',
    /** Secondary surface background */
    secondary: '$backgroundPress',
    /** Tertiary surface background */
    tertiary: '$backgroundStrong',
    /** Input background */
    input: '$backgroundTransparent',
  },
  
  // Foreground/content colors
  content: {
    /** Primary text */
    primary: '$color',
    /** Secondary/dimmed text */
    secondary: '$colorTransparent',
    /** Subtle text - least emphasis */
    subtle: '$colorTransparent2',
    /** Disabled text */
    disabled: '$colorTransparent3',
  },
  
  // Border colors
  border: {
    /** Default border */
    default: '$borderColor',
    /** Focused border */
    focus: '$borderColorFocus',
    /** Border for hover state */
    hover: '$borderColorHover',
  },
  
  // Status colors
  status: {
    /** Success indicators */
    success: '$green10',
    /** Error indicators */
    error: '$red10',
    /** Warning indicators */
    warning: '$yellow10',
    /** Information indicators */
    info: '$blue10',
  },
  
  // Brand colors (adjust to match your brand)
  brand: {
    /** Primary brand color */
    primary: '$blue10',
    /** Secondary brand color */
    secondary: '$purple10',
    /** Accent brand color */
    accent: '$green10',
  }
};

/**
 * Hook that provides access to theme-aware colors from the semantic tokens
 * @returns An object with semantic color tokens mapped to actual theme colors
 */
export function useColors() {
  const theme = useTheme();
  
  return {
    background: {
      app: theme?.background?.get() || '#FFFFFF',
      card: theme?.backgroundHover?.get() || '#F3F4F6',
      secondary: theme?.backgroundPress?.get() || '#E5E7EB',
      tertiary: theme?.backgroundStrong?.get() || '#D1D5DB',
      input: theme?.backgroundTransparent?.get() || '#FFFFFF',
    },
    content: {
      primary: theme?.color?.get() || '#111827',
      secondary: theme?.colorTransparent?.get() || '#4B5563',
      subtle: theme?.colorTransparent2?.get() || theme?.colorTransparent?.get() || '#6B7280',
      disabled: theme?.colorTransparent3?.get() || theme?.colorTransparent?.get() || '#9CA3AF',
    },
    border: {
      default: theme?.borderColor?.get() || '#E5E7EB',
      focus: theme?.borderColorFocus?.get() || '#93C5FD',
      hover: theme?.borderColorHover?.get() || '#BFDBFE',
    },
    status: {
      success: theme?.green10?.get() || '#10B981',
      error: theme?.red10?.get() || '#EF4444',
      warning: theme?.yellow10?.get() || '#F59E0B',
      info: theme?.blue10?.get() || '#3B82F6',
    },
    brand: {
      primary: theme?.blue10?.get() || '#3B82F6',
      secondary: theme?.purple10?.get() || '#8B5CF6',
      accent: theme?.green10?.get() || '#10B981',
    }
  };
}

/**
 * Helper function to handle opacity for colors
 * @param hex Hex color code
 * @param alpha Opacity (0-1)
 * @returns RGBA color string
 */
export function withOpacity(hex: string, alpha: number): string {
  // Extract RGB components from hex
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Palette with static color values for when theme context is not available
 * These should be used sparingly, prefer the useColors hook when possible
 */
export const palette = {
  // Main UI colors
  black: '#000000',
  white: '#FFFFFF',
  
  // Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Blues
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Greens
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Reds
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Yellows
  yellow: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Purples
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
}; 