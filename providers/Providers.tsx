import React, { ReactNode } from 'react';
import { GluestackUIProvider, ToastProvider, ToastViewport } from '@gluestack-ui/themed';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { glueTheme } from '@/design-system/theme.glue';
import { queryClient, persister } from '@/utils/query-client';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Persist queries for offline scenarios
  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24 h
  });

  return (
    <GluestackUIProvider config={glueTheme} colorMode="light">
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          {/* Toasts render here so they sit above everything */}
          <ToastViewport />
        </QueryClientProvider>
      </ToastProvider>
    </GluestackUIProvider>
  );
}

