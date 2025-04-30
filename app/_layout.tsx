import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueTheme } from '@/design-system/theme.glue';
import { TRPCProvider } from '@/providers/TRPCProvider';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import '@/global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GluestackUIProvider config={glueTheme}>
          <SupabaseProvider>
            <TRPCProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </TRPCProvider>
          </SupabaseProvider>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
