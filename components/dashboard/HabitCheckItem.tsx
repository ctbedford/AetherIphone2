import React, { useState, useEffect } from 'react';
import { Text, XStack, Button, YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { trpc, RouterOutputs } from '@/utils/trpc';

type DashboardHabit = RouterOutputs['dashboard']['getDashboardData']['habits'][number];

interface HabitCheckItemProps {
  habit: DashboardHabit;
  onToggle?: (habitId: string, completedToday: boolean) => void; // Update prop name
}

export default function HabitCheckItem({ habit, onToggle }: HabitCheckItemProps) {
  const [checked, setChecked] = useState(habit.completedToday);
  const [isUpdating, setIsUpdating] = useState(false);
  const utils = trpc.useUtils(); // Get tRPC context utils for invalidation

  const createEntryMutation = trpc.habit.createHabitEntry.useMutation({
    onSuccess: (updatedHabit) => {
      setIsUpdating(false);
      // Invalidate relevant queries to refetch data
      utils.habit.getHabits.invalidate();
      utils.dashboard.getDashboardData.invalidate();
      // Potentially invalidate streak data if handled separately
    },
    onError: (error) => {
      // Revert UI state on error
      setChecked(!checked);
      setIsUpdating(false);
      console.error('Error creating habit entry:', error);
    }
  });

  const deleteEntryMutation = trpc.habit.deleteHabitEntry.useMutation({
    onSuccess: () => {
      setIsUpdating(false);
      // Invalidate relevant queries to refetch data
      utils.habit.getHabits.invalidate();
      utils.dashboard.getDashboardData.invalidate();
      // Potentially invalidate streak data if handled separately
    },
    onError: (error) => {
      // Revert UI state on error
      setChecked(!checked);
      setIsUpdating(false);
      console.error('Error deleting habit entry:', error);
    }
  });

  // Update local state if the prop changes
  useEffect(() => {
    setChecked(habit.completedToday);
  }, [habit.completedToday]);

  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue); // Optimistic update
    setIsUpdating(true);

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const todayDateString = new Date().toISOString().split('T')[0];

    if (newValue) {
      // Call createHabitEntry
      createEntryMutation.mutate({
        habitId: habit.id,
        date: todayDateString,
        completed: true, // Or adjust if create implies completion
        // quantity_value: null, // Add if needed based on Zod schema
        // notes: null, // Add if needed based on Zod schema
      });
    } else {
      // Call deleteHabitEntry
      deleteEntryMutation.mutate({
        habitId: habit.id,
        date: todayDateString,
      });
    }

    // Also call the onToggle prop if provided (for compatibility)
    if (onToggle) {
      onToggle(habit.id, newValue);
    }
  };

  return (
    <XStack 
      backgroundColor="$backgroundStrong"
      padding="$3"
      borderRadius="$4"
      alignItems="center"
      justifyContent="space-between"
      space="$3"
    >
      <YStack flex={1} gap="$1">
        <Text fontSize="$4" fontWeight="500" color="$color">
          {habit.title}
        </Text>
        
        {habit.streak > 0 && (
          <Text color="$orange9" fontSize="$2">
            🔥 {habit.streak} day streak
          </Text>
        )}
      </YStack>
      
      <Button
        size="$3"
        variant={checked ? undefined : 'outlined'}
        backgroundColor={checked ? '$success' : undefined}
        color={checked ? '$backgroundStrong' : '$primary'}
        borderColor={checked ? undefined : '$primary'}
        onPress={handleToggle}
        disabled={isUpdating} // Disable button while updating
        iconAfter={checked ? <Text>✓</Text> : undefined}
      >
        {checked ? "Done" : "Check-in"}
      </Button>
    </XStack>
  );
}