import { TRPCClientError } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import { useState, useEffect, type ReactNode } from 'react';
import { TamaguiProvider } from 'tamagui';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { ToastProvider } from './ToastProvider';
import config from '../tamagui.config';
import { trpc } from '../utils/trpc';
import { useUiStore } from '@/stores/uiStore';
import { supabase } from '@/utils/supabase';
import { queryClient, persister, initializeNetworkMonitoring, resumeMutationsAndInvalidate } from '@/utils/query-client';

// Create a superjson transformer
// Note: In a real app, you'd use superjson when available
const transformer = {
  serialize: (obj: any) => JSON.stringify(obj),
  deserialize: (str: string) => JSON.parse(str),
};

// Set up persistence
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateMutation: () => false,
  },
});

export function Providers({ children }: { children: ReactNode }) {
  // Get theme state from Zustand
  const { isDarkMode } = useUiStore();
  const currentTheme = isDarkMode ? 'dark' : 'light';
  
  // Initialize network monitoring and query client persistence
  useEffect(() => {
    // Set up network monitoring
    const unsubscribeNetworkMonitoring = initializeNetworkMonitoring();
    
    // Try to resume any paused mutations immediately
    resumeMutationsAndInvalidate();
    
    return () => {
      unsubscribeNetworkMonitoring();
    };
  }, []);
  
  // Create tRPC client with Supabase auth integration
  const [trpcClient] = useState(() => 
    trpc.createClient({
      links: [
        // Link to handle auth token injection
        (runtime) => {
          return ({ op, next }) => {
            return observable((observer) => {
              // Get current session from Supabase
              const getSession = async () => {
                const { data } = await supabase.auth.getSession();
                return data.session;
              };
              
              Promise.resolve(getSession()).then(session => {
                // Safely handle headers, checking if op.input is an object
                let headers: Record<string, string> = {};
                if (typeof op.input === 'object' && op.input !== null && 'headers' in op.input && typeof op.input.headers === 'object') {
                  headers = { ...(op.input.headers as Record<string, string>) };
                }
                
                // Add authorization header if we have a session
                if (session?.access_token) {
                  headers['Authorization'] = `Bearer ${session.access_token}`;
                }

                // Construct input, merging potentially existing input object with new headers
                const input = typeof op.input === 'object' && op.input !== null 
                  ? { ...op.input, headers }
                  : { headers }; 

                // Proceed with the request
                next({ ...op, input })
                  .subscribe({
                    next: (value) => observer.next(value),
                    error: async (err) => {
                      // Check for unauthorized error (e.g., 401)
                      if (err instanceof TRPCClientError && err.data?.httpStatus === 401) {
                        console.log('Token expired or invalid, refreshing session...');
                        
                        try {
                          // Supabase will automatically refresh the session if needed
                          const { data, error } = await supabase.auth.refreshSession();
                          
                          if (error) throw error;
                          
                          if (data.session) {
                            console.log('Session refreshed successfully');
                            
                            // Retry the original request with the new token
                            const updatedHeaders = { 
                              ...headers, 
                              Authorization: `Bearer ${data.session.access_token}` 
                            };
                            const updatedInput = { ...input, headers: updatedHeaders };
                            next({ ...op, input: updatedInput }).subscribe(observer);
                          } else {
                            // No session after refresh, error out
                            observer.error(err);
                          }
                        } catch (refreshError) {
                          console.error('Session refresh failed:', refreshError);
                          observer.error(err); // Propagate original error
                        }
                      } else {
                        observer.error(err);
                      }
                    },
                    complete: () => observer.complete(),
                  });
              });

              return () => {
                // Cleanup logic if needed
              };
            });
          };
        },
        // REST API Link - modify URL to point to your Supabase function or other API
        (runtime) => {
          return ({ op, next }) => {
            return observable((observer) => {
              const { path, input, context } = op;
              
              // Provide base URL for API calls
              const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://fjzzeprbdjwpxnhnltqm.supabase.co/rest/v1';
              const url = `${baseUrl}/${path.replace(/\./g, '/')}`;
              
              const fetchOptions: RequestInit = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
                },
                body: JSON.stringify(input),
              };
              
              // Execute fetch
              fetch(url, fetchOptions)
                .then(res => {
                  if (!res.ok) {
                    throw new Error(`HTTP error ${res.status}`);
                  }
                  return res.json();
                })
                .then(data => {
                  observer.next({ result: { data } });
                  observer.complete();
                })
                .catch(error => {
                  observer.error(error);
                });
              
              return () => {
                // Cancel fetch if needed
              };
            });
          };
        }
      ],
    })
  );
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config} defaultTheme={currentTheme}>
          
            <ToastProvider>
              {children}
            </ToastProvider>
          
        </TamaguiProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
} 