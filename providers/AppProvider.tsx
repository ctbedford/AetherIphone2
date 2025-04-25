import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { NativeWindProvider } from '@/components/ui/nativewind-setup';
import config from '../tamagui.config';
import { trpc } from '@/utils/trpc';
import { useUiStore } from '@/stores/uiStore'; // Import store to get theme

/**
 * Complete app provider that integrates:
 * - tRPC
 * - React Query
 * - Tamagui
 * - NativeWind
 * - Additional providers can be added here
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // Create Query Client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000, // 5 seconds
        retry: Platform.OS === 'web' ? 3 : 1, // Less retries on mobile to save battery
      },
    },
  }));
  
  // Create tRPC client
  const [trpcClient] = useState(() => 
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
          fetch: (input, init) => {
            return fetch(input, {
              ...init,
              credentials: 'include',
            });
          },
        }),
      ],
    })
  );
  
  // Get theme state from Zustand
  const { isDarkMode } = useUiStore();
  const currentTheme = isDarkMode ? 'dark' : 'light';
  
  // You could add NATS initialization here
  useEffect(() => {
    // Example: Initialize NATS for real-time updates
    // Note: This is commented out since we don't have a real NATS server to connect to
    /*
    try {
      const url = 'ws://localhost:4222';
      initNatsClient(url, queryClient)
        .then(conn => {
          console.log('NATS client initialized successfully');
          // Set up subscriptions to relevant topics
          subscribeWithCache('users.updates', ['users']);
          subscribeWithCache('messages.updates', ['messages']);
        })
        .catch(err => {
          console.error('Failed to initialize NATS client:', err);
        });
    } catch (error) {
      console.error('Error in NATS setup:', error);
    }
    
    // Cleanup on unmount
    return () => {
      closeNatsConnection().catch(err => {
        console.error('Error closing NATS connection:', err);
      });
    };
    */
  }, [queryClient]);
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NativeWindProvider theme={currentTheme}>
          <TamaguiProvider config={config}>
            {children}
          </TamaguiProvider>
        </NativeWindProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
} 