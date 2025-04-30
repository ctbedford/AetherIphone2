import React from 'react';
import { Box, HStack, VStack, Text, Progress } from '@gluestack-ui/themed';
import { BlurView } from 'expo-blur';

/**
 * 1-for-1 Glue rewrite of the Tamagui version in the repo
 * (components/dashboard/DailyProgressBanner.tsx) :contentReference[oaicite:4]{index=4}&#8203;:contentReference[oaicite:5]{index=5}
 */
export interface DailyProgressBannerProps {
  tasksCompleted:  number;
  totalTasks:      number;
  habitsChecked:   number;
  totalHabits:     number;
}

export default function DailyProgressBanner(
  { tasksCompleted, totalTasks, habitsChecked, totalHabits }: DailyProgressBannerProps,
) {
  const taskPct  = totalTasks  ? tasksCompleted / totalTasks  : 0;
  const habitPct = totalHabits ? habitsChecked  / totalHabits : 0;

  return (
    <BlurView intensity={45} style={{ borderRadius: 16, overflow: 'hidden' }}>
      <Box px="$4" py="$3">
        <HStack space="$6" alignItems="center">
          {/* Tasks */}
          <VStack flex={1} space="$1">
            <Text size="sm" fontWeight="$medium">Tasks</Text>
            <Progress value={taskPct * 100} />
            <Text size="xs" color="$muted">
              {tasksCompleted}/{totalTasks} done
            </Text>
          </VStack>

          {/* Habits */}
          <VStack flex={1} space="$1">
            <Text size="sm" fontWeight="$medium">Habits</Text>
            <Progress value={habitPct * 100} />
            <Text size="xs" color="$muted">
              {habitsChecked}/{totalHabits} checked
            </Text>
          </VStack>
        </HStack>
      </Box>
    </BlurView>
  );
}
