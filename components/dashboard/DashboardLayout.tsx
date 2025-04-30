import React from 'react';
import { ScrollView, VStack } from '@gluestack-ui/themed';

/**
 * Simple wrapper so the Home screen (app/(tabs)/home/index.tsx) can
 * consume Glue primitives without touching Tamagui.
 */
export default function DashboardLayout(
  { children }: { children: React.ReactNode },
) {
  return (
    <ScrollView flex={1} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <VStack space="$4">
        {children}
      </VStack>
    </ScrollView>
  );
}
