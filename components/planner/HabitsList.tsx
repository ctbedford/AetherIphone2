import React, { useState } from 'react';
import { StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { YStack, XStack, Text, View, Checkbox } from 'tamagui';
import { useColors } from '@/utils/colors';
import EmptyOrSkeleton from '@/components/EmptyOrSkeleton';
import * as Haptics from 'expo-haptics';

// Habit interface - this should match your API schema
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completedToday: boolean;
  streak: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitsListProps {
  /** List of habits to display */
  habits?: Habit[];
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Called when a habit's completion status is toggled */
  onToggleHabit?: (habitId: string, completed: boolean) => Promise<void>;
  /** Called when a habit item is pressed */
  onHabitPress?: (habit: Habit) => void;
  /** Called when the add button is pressed */
  onAddPress?: () => void;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Component to render a habit item with checkbox
 */
function HabitItem({
  habit,
  onToggle,
  onPress,
}: {
  habit: Habit;
  onToggle?: (habitId: string, completed: boolean) => Promise<void>;
  onPress?: (habit: Habit) => void;
}) {
  const colors = useColors();
  const [isChecked, setIsChecked] = useState(habit.completedToday);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleToggle = async () => {
    if (isUpdating || !onToggle) return;
    
    // Optimistic update
    const newValue = !isChecked;
    setIsChecked(newValue);
    
    // Provide haptic feedback
    if (newValue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      setIsUpdating(true);
      await onToggle(habit.id, newValue);
    } catch (error) {
      // Revert on error
      setIsChecked(!newValue);
      console.error('Failed to update habit:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get frequency text
  const getFrequencyText = () => {
    switch (habit.frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return '';
    }
  };
  
  return (
    <Pressable
      onPress={() => onPress?.(habit)}
      style={({ pressed }) => [
        styles.habitItem,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.default,
          opacity: isUpdating ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      disabled={isUpdating}
    >
      <XStack space="$3" flex={1} alignItems="center">
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
          borderColor="$gray8"
          backgroundColor={isChecked ? "green" : undefined}
          opacity={isUpdating ? 0.5 : 1}
          size="$5"
        />
        
        <YStack flex={1} space="$1">
          <Text 
            fontSize="$4" 
            fontWeight="$2" 
            color="$color"
            textDecorationLine={isChecked ? 'line-through' : 'none'}
            opacity={isChecked ? 0.8 : 1}
          >
            {habit.title}
          </Text>
          
          <XStack space="$3" alignItems="center">
            <Text fontSize="$2" color="$gray10">
              {getFrequencyText()}
            </Text>
            
            {habit.streak > 0 && (
              <XStack space="$1" alignItems="center">
                <Text fontSize="$2" color={colors.status.success} fontWeight="$2">
                  {habit.streak} day streak 🔥
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>
      </XStack>
    </Pressable>
  );
}

/**
 * Component to display a list of habits with checkboxes
 */
export default function HabitsList({
  habits = [],
  isLoading = false,
  onToggleHabit,
  onHabitPress,
  onAddPress,
  style,
}: HabitsListProps) {
  const colors = useColors();
  
  return (
    <YStack flex={1} style={style}>
      <EmptyOrSkeleton
        isLoading={isLoading}
        isEmpty={habits.length === 0}
        skeletonCount={4}
        skeletonHeight={80}
        skeletonBorderRadius={12}
        title="No habits yet"
        message="Create a habit to track your daily progress"
      >
        <YStack space="$2" padding="$4">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={onToggleHabit}
              onPress={onHabitPress}
            />
          ))}
        </YStack>
      </EmptyOrSkeleton>
      
      {onAddPress && (
        <Pressable
          onPress={onAddPress}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: colors.brand.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            }
          ]}
        >
          <Text fontSize="$4" fontWeight="$3" color="white">
            + Add Habit
          </Text>
        </Pressable>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  habitItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
}); 