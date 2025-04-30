// components/compass/PrincipleCard.tsx
import React from 'react';
import { Card, Text, YStack } from 'tamagui';
import { type RouterOutputs } from '@/utils/trpc';

// Use the correct type based on the query in PrinciplesTab
type Principle = RouterOutputs['value']['getValues'][number];

interface PrincipleCardProps {
  principle: Principle;
  onPress?: () => void; // Make onPress optional if not always needed
}

export function PrincipleCard({ principle, onPress }: PrincipleCardProps) {
  return (
    <Card
      bordered
      padding="$4"
      elevation="$1"
      pressTheme
      hoverTheme
      onPress={onPress}
      animation="bouncy"
      scale={onPress ? 0.98 : 1} // Only apply scale if pressable
      hoverStyle={onPress ? { scale: 0.99 } : {}}
      pressStyle={onPress ? { scale: 0.96 } : {}}
    >
      <YStack>
        <Text fontSize="$5" fontWeight="bold">
          {principle.name}
        </Text>
        {principle.description && (
          <Text color="$colorFocus" marginTop="$2">
            {principle.description}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
