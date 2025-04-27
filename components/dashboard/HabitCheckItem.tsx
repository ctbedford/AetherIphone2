import React, { useState, useEffect } from 'react';
import { Text, XStack, Button, YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';

interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
}

interface HabitCheckItemProps {
  habit: Habit;
  onToggle: (habitId: string, completed: boolean) => void;
}

export default function HabitCheckItem({ habit, onToggle }: HabitCheckItemProps) {
  const [checked, setChecked] = useState(habit.completedToday);
  
  // Update local state if the prop changes
  useEffect(() => {
    setChecked(habit.completedToday);
  }, [habit.completedToday]);
  
  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(habit.id, newValue);
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
          <Text color="$warning" fontSize="$2" marginTop="$1">
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