import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { XStack, YStack, Text, Button, H4, Separator } from "tamagui";
import StreakCalendar from './StreakCalendar';
import { Plus, Check } from "@tamagui/lucide-icons";
import { format } from "date-fns";

interface Habit {
  id: string;
  name: string;
  description?: string;
  completedDates: string[]; // ISO date strings
}

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit?: () => void;
  onToggleHabit?: (habitId: string, date: string, completed: boolean) => void;
  onHabitPress?: (habit: Habit) => void;
}

export function HabitTracker({
  habits = [],
  onAddHabit,
  onToggleHabit,
  onHabitPress,
}: HabitTrackerProps) {
  const today = format(new Date(), "yyyy-MM-dd");

  const handleToggleHabit = (habit: Habit) => {
    if (!onToggleHabit) return;
    
    const isCompleted = habit.completedDates.includes(today);
    onToggleHabit(habit.id, today, !isCompleted);
  };

  return (
    <YStack space="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <H4>Habits</H4>
        <Button 
          size="$2" 
          circular 
          icon={<Plus size={16} />} 
          onPress={onAddHabit}
        />
      </XStack>

      {habits.length === 0 ? (
        <YStack 
          p="$4"
          alignItems="center" 
          justifyContent="center" 
          backgroundColor="$gray2" 
          borderRadius="$4"
        >
          <Text color="$gray11" textAlign="center">
            No habits yet. Add your first habit to start tracking.
          </Text>
        </YStack>
      ) : (
        <YStack space="$3">
          {habits.map((habit, index) => (
            <YStack key={habit.id} space="$2">
              {index > 0 && <Separator />}
              <HabitItem 
                habit={habit} 
                onToggle={() => handleToggleHabit(habit)}
                onPress={() => onHabitPress?.(habit)} 
              />
            </YStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

interface HabitItemProps {
  habit: Habit;
  onToggle: () => void;
  onPress: () => void;
}

function HabitItem({ habit, onToggle, onPress }: HabitItemProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const isCompletedToday = habit.completedDates.includes(today);

  return (
    <XStack 
      p="$3"
      borderRadius="$4" 
      backgroundColor="$gray2"
      justifyContent="space-between"
      alignItems="center"
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
    >
      <YStack space="$1" flex={1}>
        <Text fontSize="$3" fontWeight="$5">
          {habit.name}
        </Text>
        {habit.description && (
          <Text fontSize="$2" color="$gray11">
            {habit.description}
          </Text>
        )}
        
        <YStack mt="$2">
          <StreakCalendar
            completedDates={habit.completedDates}
          />
        </YStack>
      </YStack>

      <Button
        size="$3"
        circular
        backgroundColor={isCompletedToday ? "$primary9" : "$gray4"}
        onPress={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        pressStyle={{
          backgroundColor: isCompletedToday ? "$primary8" : "$gray5",
        }}
      >
        <Check 
          size={18} 
          color={isCompletedToday ? "$gray1" : "$gray11"} 
        />
      </Button>
    </XStack>
  );
} 