// providers/Providers.tsx
import '../tamagui.config'; // Ensure Tamagui config is loaded first!
import { getConfig } from '@tamagui/core';
console.log('Effective Tamagui config keys:', Object.keys(getConfig() ?? {}));
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui';
import { ToastProvider, ToastViewport } from '@tamagui/toast'; // Import from Tamagui Toast
import React, { useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native'; // Import Platform

import config from '../tamagui.config'; // Import your config
import { trpc } from '../utils/trpc'; // Your tRPC hook setup
import { queryClient, persister, initializeNetworkMonitoring, resumeMutationsAndInvalidate } from '@/utils/query-client';
import { useUiStore } from '@/stores/uiStore';
import { supabase } from '@/utils/supabase'; // Needed for auth link
import { createTRPCClient, httpBatchLink, TRPCLink, TRPCClientError } from '@trpc/client'; // Import TRPC Client utils
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '../server/src/router'; // Adjust path if needed
import type { Session } from '@supabase/supabase-js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Setup query client persistence
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateMutation: () => false, // Usually don't dehydrate mutations
  },
});

// New component for the viewport using safe area
const CurrentToastViewport = () => {
  const { top, bottom, left, right } = useSafeAreaInsets();
  return (
    <>
      {/* Adjust positioning based on your desired toast location */}
      <ToastViewport
        name="global_top"
        flexDirection="column" // Stack new toasts below older ones
        top={top + 10} // Add padding below status bar
        left={left + 10} // Add padding from sides
        right={right + 10}
      />
      <ToastViewport
        name="global_bottom"
        flexDirection="column-reverse"
        bottom={bottom + 10}
        left={left + 10}
        right={right + 10}
      />
    </>
  );
};

// Extract tRPC links setup
function getTRPCLinks(getSession: () => Promise<Session | null>): TRPCLink<AppRouter>[] {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/trpc'; // Default to localhost
  console.log('Using tRPC API URL:', apiBaseUrl);

  return [
    // Link to handle auth token injection and refresh
    (runtime) => {
      return ({ op, next }) => {
        return observable((observer) => {
          getSession().then(session => {
            const headers = (op.context?.headers || {}) as Record<string, string>;
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            // Proceed with the request, ensuring context is passed correctly
            next({ ...op, context: { ...op.context, headers } })
              .subscribe({
                next: (value) => observer.next(value),
                error: async (err) => {
                  if (err instanceof TRPCClientError && err.data?.httpStatus === 401) {
                    console.log('tRPC: Token expired or invalid, attempting refresh...');
                    try {
                      // Supabase handles refresh internally if needed when getSession is called
                      const { data, error: refreshError } = await supabase.auth.refreshSession();
                      if (refreshError) throw refreshError;

                      if (data.session) {
                        console.log('tRPC: Session refreshed successfully, retrying request.');
                        const refreshedHeaders = { ...headers, Authorization: `Bearer ${data.session.access_token}` };
                        // Retry with new headers in context
                        next({ ...op, context: { ...op.context, headers: refreshedHeaders } }).subscribe(observer);
                      } else {
                        console.error('tRPC: Session refresh failed, no session returned.');
                        observer.error(err); // Propagate original error if no new session
                        // Optionally trigger logout here
                        supabase.auth.signOut();
                      }
                    } catch (refreshCatchError) {
                      console.error('tRPC: Session refresh catch error:', refreshCatchError);
                      observer.error(err); // Propagate original error
                      supabase.auth.signOut();
                    }
                  } else {
                    observer.error(err); // Propagate non-auth errors
                  }
                },
                complete: () => observer.complete(),
              });
          }).catch(err => {
             console.error('tRPC: Error getting session for headers:', err);
             observer.error(new TRPCClientError('Failed to get session')); // Use TRPCClientError
          });

          // Return cleanup function if needed
          return () => {};
        });
      };
    },
    // The terminating HTTP link
    httpBatchLink({
      url: apiBaseUrl,
       headers() {
         // Headers are injected by the middleware link above
         return {};
       },
      // Add superjson transformer here if you use one
      // transformer: superjson,
    }),
  ];
}

export function Providers({ children }: { children: ReactNode }) {
  // Get theme state from Zustand
  const { isDarkMode } = useUiStore();
  const currentTheme = isDarkMode ? 'dark' : 'light';

  // Initialize network monitoring and query client persistence
  useEffect(() => {
    const unsubscribeNetworkMonitoring = initializeNetworkMonitoring();
    resumeMutationsAndInvalidate(); // Try resuming mutations on app load
    return () => {
      unsubscribeNetworkMonitoring();
    };
  }, []);

  // Memoize tRPC client creation
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: getTRPCLinks(async () => { // Pass session getter to links setup
        const { data } = await supabase.auth.getSession();
        return data.session;
      }),
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider
            config={config}
            defaultTheme={currentTheme}
            // disableInjectCSS // May not be needed depending on setup
        >
          {/* Use Tamagui's ToastProvider */}
          <ToastProvider
            // burntOptions={{ from: 'top' }} // Disabled until native module 'Burnt' is installed
            swipeDirection="horizontal"
            duration={4000}
            native={[]}
          >
            {children}
            {/* Add the safe-area aware ToastViewport */}
            <CurrentToastViewport />
          </ToastProvider>
        </TamaguiProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}