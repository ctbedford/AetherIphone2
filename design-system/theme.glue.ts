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
