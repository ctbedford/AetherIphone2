// components/compass/StateDefinitionCard.tsx
import React from 'react';
import { Card, Text, XStack, YStack } from 'tamagui';
import { type RouterOutputs } from '@/utils/trpc';

// Use the correct type based on the query in StatesTab (getDefinitions)
type StateDefinition = RouterOutputs['state']['getDefinitions'][number];

interface StateDefinitionCardProps {
  state: StateDefinition;
  onPress?: () => void; // Make onPress optional
}

export function StateDefinitionCard({ state, onPress }: StateDefinitionCardProps) {
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
        <XStack alignItems="center" space="$3">
          <Text fontSize="$5" fontWeight="bold">
            {state.name}
          </Text>
          {/* Display scale type if available */}
          {state.scale && (
            <Text color="$colorFocus" fontSize="$2">({state.scale})</Text>
          )}
        </XStack>
        {state.description && (
          <Text color="$colorFocus" marginTop="$2">
            {state.description}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
