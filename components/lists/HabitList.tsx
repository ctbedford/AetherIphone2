import React from 'react';
import { FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { YStack, XStack, Text, Stack } from 'tamagui';
import { router } from 'expo-router';
import { RouterOutputs } from '@/utils/api-types';
import { AetherCard } from '@/components/ui/primitives';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { Ionicons } from '@expo/vector-icons';

type Habit = RouterOutputs['habit']['list'][number];

interface HabitListProps {
  habits?: Habit[];
  isLoading: boolean;
  isError?: boolean;
  refetch: () => void;
  onSelectHabit?: (habit: Habit) => void;
  onToggleHabit?: (habitId: string, completed: boolean) => void;
}

/**
 * HabitCard - Individual habit card component
 */
export function HabitCard({ 
  habit, 
  onPress, 
  onToggle 
}: { 
  habit: Habit; 
  onPress: () => void; 
  onToggle?: (completed: boolean) => void;
}) {
  // Calculate progress streak display
  const streakText = habit.streak === 1 
    ? '1 day'
    : `${habit.streak} days`;

  const bestStreakText = habit.best_streak === 1
    ? '1 day'
    : `${habit.best_streak} days`;

  // Check if the habit has been completed today
  const [isCompleted, setIsCompleted] = React.useState(false); // This would come from habit entries

  const handleToggle = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    if (onToggle) {
      onToggle(newStatus);
    }
  };

  return (
    <AetherCard 
      isInteractive 
      variant="default"
      onPress={onPress}
    >
      <YStack space="$2">
        {/* Title with completion toggle */}
        <XStack space="$3" justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center" flex={1}>
            <Ionicons name="repeat-outline" size={18} color="$primary" />
            <Text fontSize="$5" fontWeight="bold" color="$color" numberOfLines={1} flex={1}>
              {habit.title}
            </Text>
          </XStack>
          
          {/* Toggle button for completing today's habit */}
          <Stack 
            onPress={handleToggle}
            pressStyle={{ opacity: 0.8 }}
          >
            <Ionicons 
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={26} 
              color={isCompleted ? "$success" : "$colorMuted"} 
            />
          </Stack>
        </XStack>
        
        {/* Streak information */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center">
            <Ionicons name="flame-outline" size={16} color="$colorMuted" />
            <Text fontSize="$2" color="$colorMuted">
              Current: {streakText}
            </Text>
          </XStack>
          
          <XStack space="$2" alignItems="center">
            <Ionicons name="trophy-outline" size={16} color="$colorMuted" />
            <Text fontSize="$2" color="$colorMuted">
              Best: {bestStreakText}
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </AetherCard>
  );
}

/**
 * HabitList - List component for displaying habits
 */
export function HabitList({ 
  habits, 
  isLoading, 
  isError, 
  refetch, 
  onSelectHabit,
  onToggleHabit 
}: HabitListProps) {
  const renderHabitItem: ListRenderItem<Habit> = ({ item }) => (
    <HabitCard 
      habit={item} 
      onPress={() => {
        if (onSelectHabit) {
          onSelectHabit(item);
        } else {
          // Default navigation
          router.push({ 
            pathname: '/planner/habit/[id]', 
            params: { id: item.id } 
          });
        }
      }}
      onToggle={(completed) => {
        if (onToggleHabit) {
          onToggleHabit(item.id, completed);
        }
      }}
    />
  );

  if (isLoading) {
    return <EmptyOrSkeleton isLoading count={3} type="card" />;
  }

  if (isError) {
    return (
      <YStack padding="$4" space="$4" alignItems="center" justifyContent="center">
        <Ionicons name="alert-circle-outline" size={48} color="$error" />
        <YStack>
          <YStack alignItems="center">
            <Text fontSize="$5" fontWeight="bold" color="$color" textAlign="center">
              Unable to load habits
            </Text>
            <Text fontSize="$3" color="$colorMuted" textAlign="center" marginTop="$2">
              Please check your connection and try again
            </Text>
          </YStack>
        </YStack>
        <AetherCard onPress={refetch} isInteractive padding="$3" paddingHorizontal="$5">
          <XStack alignItems="center" space="$2">
            <Ionicons name="refresh-outline" size={18} color="$primary" />
            <Text fontSize="$4" fontWeight="500" color="$primary">
              Retry
            </Text>
          </XStack>
        </AetherCard>
      </YStack>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty 
        text="No habits yet" 
        actionText="Create a habit" 
        onAction={() => router.push('/planner/add-habit')} 
      />
    );
  }

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item.id}
      renderItem={renderHabitItem}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      ItemSeparatorComponent={() => <YStack height="$4" />}
      refreshControl={
        <RefreshControl 
          refreshing={isLoading} 
          onRefresh={refetch} 
        />
      }
    />
  );
}
