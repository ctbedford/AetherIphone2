import React, { useState, useEffect } from 'react';
import { Text, XStack, Button, YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/utils/trpc';
import { RouterOutputs } from '@/utils/trpc';

type DashboardHabit = RouterOutputs['dashboard']['getDashboardData']['habits'][number];

interface HabitCheckItemProps {
  habit: DashboardHabit;
  onToggle?: (habitId: string, completed: boolean) => void; // Make optional since we'll handle with tRPC
}

export default function HabitCheckItem({ habit, onToggle }: HabitCheckItemProps) {
  const [checked, setChecked] = useState(habit.completed);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get the toggleHabit mutation
  const toggleHabitMutation = trpc.habit.toggleHabit.useMutation({
    onSuccess: (updatedHabit) => {
      setIsUpdating(false);
    },
    onError: (error) => {
      // Revert UI state on error
      setChecked(!checked);
      setIsUpdating(false);
      console.error('Error toggling habit:', error);
    }
  });
  
  // Update local state if the prop changes
  useEffect(() => {
    setChecked(habit.completed);
  }, [habit.completed]);
  
  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue); // Optimistic update
    setIsUpdating(true);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Call the server via tRPC
    toggleHabitMutation.mutate({
      habitId: habit.id,
      completed: newValue
    });
    
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
      <YStack flex={1}>
        <Text fontSize="$4" fontWeight="500" color="$color">
          {habit.title}
        </Text>
        
        {habit.streak > 0 && (
          <Text color="$orange9" fontSize="$2" marginTop="$1">
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
        iconAfter={checked ? <Text>✓</Text> : undefined}
      >
        {checked ? "Done" : "Check-in"}
      </Button>
    </XStack>
  );
}