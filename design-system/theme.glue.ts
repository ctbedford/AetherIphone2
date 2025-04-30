import { config as base } from '@gluestack-ui/config';
import tokens from './tokens';

export const glueTheme = {
  ...base,
  tokens: {
    ...base.tokens,
    ...tokens,          // merge Zelda palette
  },
} as const;            // ← strongly-typed
