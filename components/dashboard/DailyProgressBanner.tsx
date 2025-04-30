import React from 'react';
import { XStack, YStack, Text, Progress, useTheme } from 'tamagui';
import { BlurView } from 'expo-blur';
import { CheckSquare, Target } from '@tamagui/lucide-icons'; // Example icons

type DailyProgressBannerProps = {
  tasksCompleted: number;
  totalTasks: number; // Needed for progress calculation
  habitsChecked: number;
  totalHabits: number; // Needed for progress calculation
};

export default function DailyProgressBanner({ 
  tasksCompleted = 3, // Placeholder
  totalTasks = 5, // Placeholder
  habitsChecked = 2, // Placeholder
  totalHabits = 4 // Placeholder
}: DailyProgressBannerProps) {
  const theme = useTheme();
  const taskProgress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  const habitProgress = totalHabits > 0 ? (habitsChecked / totalHabits) * 100 : 0;

  return (
    <BlurView intensity={50} tint="default" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      <XStack 
        padding="$3"
        space="$4"
        alignItems="center" 
        backgroundColor="$surfaceSubtle" // Use subtle background from theme
      >
        {/* Tasks Progress */}
        <YStack flex={1} space="$1">
          <XStack space="$2" alignItems="center">
            <CheckSquare size={16} color={theme.accent?.get()} />
            <Text fontSize="$3" fontWeight="bold" color="$onSurface">
              Tasks
            </Text>
          </XStack>
          <Progress size="$1" value={taskProgress}>
            <Progress.Indicator animation="bouncy" backgroundColor="$accent" />
          </Progress>
          <Text fontSize="$1" color="$onSurfaceSubtle">
            {tasksCompleted} / {totalTasks} done
          </Text>
        </YStack>

        {/* Habits Progress */}
        <YStack flex={1} space="$1">
          <XStack space="$2" alignItems="center">
            <Target size={16} color={theme.accent?.get()} />
            <Text fontSize="$3" fontWeight="bold" color="$onSurface">
              Habits
            </Text>
          </XStack>
          <Progress size="$1" value={habitProgress}>
            <Progress.Indicator animation="bouncy" backgroundColor="$accent" />
          </Progress>
          <Text fontSize="$1" color="$onSurfaceSubtle">
            {habitsChecked} / {totalHabits} checked
          </Text>
        </YStack>
      </XStack>
    </BlurView>
  );
}
