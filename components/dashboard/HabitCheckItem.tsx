import React, { useState, useEffect } from 'react';
import { Text, XStack, Button, YStack, useTheme } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { trpc, RouterOutputs } from '@/utils/trpc';

// Custom types that match the backend expectations
type DashboardHabit = {
  id: string;
  name: string;  // Backend returns 'name'
  description?: string;
  habit_type?: string;
  streak?: number;
  completed: boolean; // Backend returns 'completed'
  duration_minutes?: number;
  last_entry_id?: string; // Add last_entry_id property
};

// Types for habit entry mutations
type CreateHabitEntryInput = {
  habit_id: string;
  date: string;
  completed?: boolean;
  quantity_value?: number | null;
  notes?: string | null;
};

type DeleteHabitEntryInput = {
  id: string; // Update property name
};

interface HabitCheckItemProps {
  habit: DashboardHabit;
  onToggle?: (habitId: string, completedToday: boolean) => void; 
}

export default function HabitCheckItem({ habit, onToggle }: HabitCheckItemProps) {
  const [checked, setChecked] = useState(habit.completed);
  const [isUpdating, setIsUpdating] = useState(false);
  const theme = useTheme(); 
  const utils = trpc.useUtils(); 

  // Define specific theme colors with safe access and fallbacks to theme variables
  const green10 = theme?.green10?.val ?? '$green10'; 
  const gray10 = theme?.gray10?.val ?? '$gray10'; 
  const orange10 = theme?.orange10?.val ?? '$orange10'; 


  const createEntryMutation = trpc.habit.createHabitEntry.useMutation({
    onSuccess: (updatedHabit) => {
      setIsUpdating(false);
      utils.habit.getHabits.invalidate();
      utils.dashboard.getDashboardData.invalidate();
    },
    onError: (error) => {
      setChecked(!checked);
      setIsUpdating(false);
      console.error('Error creating habit entry:', error);
    }
  });

  const deleteEntryMutation = trpc.habit.deleteHabitEntry.useMutation({
    onSuccess: () => {
      setIsUpdating(false);
      utils.habit.getHabits.invalidate();
      utils.dashboard.getDashboardData.invalidate();
    },
    onError: (error) => {
      setChecked(!checked);
      setIsUpdating(false);
      console.error('Error deleting habit entry:', error);
    }
  });

  useEffect(() => {
    setChecked(habit.completed);
  }, [habit.completed]);

  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue); 
    setIsUpdating(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const todayDateString = new Date().toISOString().split('T')[0];

    if (newValue) {
      const createInput: CreateHabitEntryInput = {
        habit_id: habit.id,
        date: todayDateString,
        completed: true, 
        quantity_value: null, 
        notes: null, 
      };
      createEntryMutation.mutate(createInput);
    } else {
      if (habit.last_entry_id) { 
        const deleteInput: DeleteHabitEntryInput = {
          id: habit.last_entry_id, 
        };
        deleteEntryMutation.mutate(deleteInput);
      } else {
        console.warn("Attempted to delete habit entry, but last_entry_id is missing.");
      }
    }

    if (onToggle) {
      onToggle(habit.id, newValue);
    }
  };

  const streakColor = checked ? green10 : gray10; // Use safe theme value
  const habitTypeColor = orange10; // Use safe theme value

  return (
    <XStack 
      backgroundColor="$backgroundStrong" // Use theme variable
      padding="$3"
      borderRadius="$4"
      alignItems="center"
      justifyContent="space-between"
      space="$3"
    >
      <YStack flex={1} gap="$1">
        <Text fontSize="$4" fontWeight="500" color="$color"> // Use theme variable
          {habit.name}
        </Text>
        
        {habit.streak != null && habit.streak > 0 && ( // Add null check
          <Text fontSize="$2" color={streakColor}> 
            Streak: {habit.streak ?? 0}
          </Text>
        )}
        {habit.habit_type && (
          <Text fontSize="$2" color={habitTypeColor}> // Use safe theme value
            ({habit.habit_type})
          </Text>
        )}
      </YStack>
      
      <Button
        size="$3"
        variant={checked ? undefined : 'outlined'} // Let variant handle appearance
        // Remove explicit colors - rely on theme/variant
        theme={checked ? 'green' : undefined} // Apply green theme when checked
        onPress={handleToggle}
        disabled={isUpdating} 
        iconAfter={checked ? <Text>✓</Text> : undefined}
      >
        {checked ? "Done" : "Check-in"}
      </Button>
    </XStack>
  );
}