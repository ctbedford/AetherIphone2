// app/components/SectionCard.tsx
import React from 'react';
import { Stack, Text } from '@/design-system/Primitives';
import { BlurView } from 'expo-blur';

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

export const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => {
  return (
    <Stack className="mb-6 overflow-hidden rounded-2xl">
      <BlurView intensity={30} tint="light" className="overflow-hidden rounded-2xl">
        <Stack className="p-4 bg-parchment/50 dark:bg-sheikahCyan/10">
          <Text className="font-heading text-lg mb-2 text-darkText dark:text-parchment">{title}</Text>
          {children}
        </Stack>
      </BlurView>
    </Stack>
  );
};
