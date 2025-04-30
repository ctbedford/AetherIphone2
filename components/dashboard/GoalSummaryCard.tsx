import React from 'react';
import { Text, XStack, Button } from 'tamagui';
import ProgressRing from '@/components/aether/ProgressRing';
import { RouterOutputs } from '@/utils/trpc';
import { BlurView } from 'expo-blur'; // Import BlurView

// Define a custom type that includes everything we need
type DashboardGoal = {
  id: string;
  title: string;
  status?: string;
  priority?: number;
  progress: number;
  tasks?: {
    total: number;
    completed: number;
  };
};

interface GoalSummaryCardProps {
  goal: DashboardGoal;
  onPress: () => void;
}

export default function GoalSummaryCard({ goal, onPress }: GoalSummaryCardProps) {
  return (
    <BlurView 
      intensity={50} 
      tint="default" 
      style={{ borderRadius: 12, overflow: 'hidden' }}
    >
      <Button 
        chromeless // Remove default button styling
        padding="$3" 
        onPress={onPress}
        width="100%" // Ensure it fills the BlurView
      >
        <XStack alignItems="center" space="$3" flex={1}> 
          <ProgressRing
            progress={goal.progress}
            size={40}
            primaryColor="$primary"
          />
          <XStack flex={1} flexDirection="column">
            <Text fontSize="$4" fontWeight="500" color="$color">
              {goal.title}
            </Text>
            {goal.tasks && (
              <Text color="$gray9" fontSize="$2">
                {goal.tasks.completed}/{goal.tasks.total} tasks completed
              </Text>
            )}
          </XStack>
        </XStack>
      </Button>
    </BlurView>
  );
}