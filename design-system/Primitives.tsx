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

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? dark : light;
}


// Export all other Gluestack components as-is
export { gs };
