import React from 'react';
import { FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { YStack, Spinner, XStack, Text } from 'tamagui';
import { router } from 'expo-router';
import { RouterOutputs } from '@/utils/api-types';
import { AetherCard } from '@/components/ui/primitives';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { Ionicons } from '@expo/vector-icons';

type Goal = RouterOutputs['goal']['list'][number];

interface GoalListProps {
  goals?: Goal[];
  isLoading: boolean;
  isError?: boolean;
  refetch: () => void;
  onSelectGoal?: (goal: Goal) => void;
}

/**
 * GoalCard - Individual goal card component
 */
export function GoalCard({ goal, onPress }: { goal: Goal; onPress: () => void }) {
  // Calculate progress percentage for the progress ring
  const progressPercent = goal.progress ? goal.progress : 0;
  
  // Format the target date
  const formattedDate = goal.target_date
    ? new Date(goal.target_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';

  return (
    <AetherCard 
      isInteractive 
      variant="default"
      onPress={onPress}
    >
      <YStack space="$2">
        {/* Title */}
        <YStack>
          <XStack space="$2" alignItems="center">
            <Ionicons name="trophy-outline" size={18} color="$primary" />
            <Text fontSize="$5" fontWeight="bold" color="$color">
              {goal.title}
            </Text>
          </XStack>
        </YStack>
        
        {/* Description if available */}
        {goal.description && (
          <Text color="$colorMuted" fontSize="$3" numberOfLines={2}>
            {goal.description}
          </Text>
        )}
        
        {/* Footer with date and progress */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center">
            <Ionicons name="calendar-outline" size={16} color="$colorMuted" />
            <Text fontSize="$2" color="$colorMuted">
              {formattedDate}
            </Text>
          </XStack>
          
          {/* Progress display */}
          <XStack backgroundColor="$background" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
            <Text fontSize="$2" fontWeight="bold" color={progressPercent >= 75 ? '$success' : '$primary'}>
              {progressPercent}%
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </AetherCard>
  );
}

/**
 * GoalList - List component for displaying goals
 */
export function GoalList({ goals, isLoading, isError, refetch, onSelectGoal }: GoalListProps) {
  const renderGoalItem: ListRenderItem<Goal> = ({ item }) => (
    <GoalCard 
      goal={item} 
      onPress={() => {
        if (onSelectGoal) {
          onSelectGoal(item);
        } else {
          // Default navigation
          router.push({ 
            pathname: '/planner/goal/[id]', 
            params: { id: item.id } 
          });
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
              Unable to load goals
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

  if (!goals || goals.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty 
        text="No goals yet" 
        actionText="Create a goal" 
        onAction={() => router.push('/planner/add-goal')} 
      />
    );
  }

  return (
    <FlatList
      data={goals}
      keyExtractor={(item) => item.id}
      renderItem={renderGoalItem}
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
