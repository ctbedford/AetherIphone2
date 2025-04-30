import React, { PropsWithChildren } from 'react';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'server/src/router';
import { httpBatchLink } from '@trpc/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils/query-client';

// 👉 one singleton instance – re-use across the app
export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: PropsWithChildren) {
  const url =
    process.env.EXPO_PUBLIC_API_URL ??
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/trpc`;

  const client = React.useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            url,
            headers() {
              return {
                // you can inject the supabase JWT here later:
              };
            },
          }),
        ],
      }),
    [url]
  );

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
