import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { GluestackUIProvider } from '@gluestack-ui/themed';

import glueTheme from '@/design-system/theme.glue';
import { trpc } from '@/utils/trpc';
import '@/utils/query-client';               // keeps existing offline-cache helpers alive

/**
 * Replaces the Tamagui-centric Providers.tsx :contentReference[oaicite:8]{index=8}&#8203;:contentReference[oaicite:9]{index=9}
 * with a Gluestack-first stack.  React-Query + tRPC logic is untouched.
 */
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient]  = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/trpc' })],
    }),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider config={glueTheme} colorMode={useColorScheme()}>
            {children}
          </GluestackUIProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}
