import React from 'react';
// Use Tamagui components
import { Text, XStack, YStack, Card } from 'tamagui'; 
// Import RouterOutputs for inferred types
import { RouterOutputs } from '@/utils/trpc';

// Define prop type using inferred type from router
type DashboardTrackedState = RouterOutputs['dashboard']['getDashboardData']['trackedStates'][number];

interface StateIndicatorProps {
  state: DashboardTrackedState; // Use the inferred type
  onPress: () => void;
}

export default function StateIndicator({ state, onPress }: StateIndicatorProps) {
  // Format the last updated time
  const formattedTime = state.lastUpdated 
    ? new Date(state.lastUpdated).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : 'N/A';
  
  // Use Tamagui Card component
  return (
    <Card 
      onPress={onPress} 
      pressStyle={{ opacity: 0.8 }}
      padding="$3"
      // No explicit background, will use default Card background from theme
    >
      <YStack space="$1"> {/* Main container for text */}
        <Text fontSize="$3" color="$colorMuted"> {/* Use tokens */}
          {state.name}
        </Text>
        
        <XStack alignItems="baseline" space="$2"> {/* Align text by baseline, add space */}
          <Text fontSize="$5" fontWeight="600" color="$color"> {/* Use tokens */}
            {state.currentValue}
          </Text>
          <Text color="$colorMuted" fontSize="$2"> {/* Use tokens */}
            {formattedTime}
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
} 