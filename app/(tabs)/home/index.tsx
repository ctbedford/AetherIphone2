// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/home/index.tsx
import React from 'react';
import { YStack, H1, Paragraph } from 'tamagui'; // Using Tamagui components

export default function HomeScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" space="$4" padding="$4">
      <H1>Home Screen</H1>
      <Paragraph>This is the placeholder for the Home tab.</Paragraph>
      {/* Add dashboard components here later */}
    </YStack>
  );
}
