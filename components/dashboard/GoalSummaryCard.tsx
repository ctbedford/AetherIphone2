import React from 'react';
import { Text, XStack, Card } from 'tamagui';
import ProgressRing from '@/components/aether/ProgressRing';

interface Goal {
  id: string;
  title: string;
  progress: number;
  tasks?: {
    total: number;
    completed: number;
  };
}

interface GoalSummaryCardProps {
  goal: Goal;
  onPress: () => void;
}

export default function GoalSummaryCard({ goal, onPress }: GoalSummaryCardProps) {
  return (
    <Card 
      bordered
      elevate
      onPress={onPress} 
      pressStyle={{ opacity: 0.8 }}
      padding="$3"
    >
      <XStack alignItems="center" space="$3">
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
            <Text color="$colorSecondary" fontSize="$2">
              {goal.tasks.completed}/{goal.tasks.total} tasks completed
            </Text>
          )}
        </XStack>
      </XStack>
    </Card>
  );
} 