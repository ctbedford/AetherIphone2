// providers/GluestackProvider.tsx
import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueTheme } from '@/design-system/theme.glue';

export const GluestackProvider = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider config={glueTheme}>
    {children}
  </GluestackUIProvider>
);
