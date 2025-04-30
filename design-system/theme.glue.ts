import { addTheme } from '@gluestack-ui/themed';
import { colors, radii, space, sizes, fonts } from './tokens';

/**
 * Central GlueStack palette created from the Zelda-style tokens that
 * already live in design-system/tokens.ts :contentReference[oaicite:6]{index=6}&#8203;:contentReference[oaicite:7]{index=7}
 */
const glueTheme = addTheme({
  colors,
  radii,
  space,
  sizes,
  fonts,

  shadows: {
    1: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    2: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  },
});

export default glueTheme;
