// __tests__/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
// Ensure the path to your config is correct
// It might be '../tamagui.config' or './tamagui.config' depending on your structure
import config from '../tamagui.config';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Ensure you're providing the correct defaultTheme if your app uses one
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      {children}
    </TamaguiProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };
