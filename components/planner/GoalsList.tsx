import React from 'react';
import { StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { YStack, XStack, Text, View, Progress, ProgressIndicator } from 'tamagui';
import { useColors } from '@/utils/colors';
import EmptyOrSkeleton from '@/components/EmptyOrSkeleton';

// Goal interface - this should match your API schema
export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0 to 1
  deadline?: string; // ISO date string
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsListProps {
  /** List of goals to display */
  goals?: Goal[];
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Called when a goal is pressed */
  onGoalPress?: (goal: Goal) => void;
  /** Called when the add button is pressed */
  onAddPress?: () => void;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Component to render a goal card with progress bar
 */
function GoalCard({
  goal,
  onPress,
}: {
  goal: Goal;
  onPress?: (goal: Goal) => void;
}) {
  const colors = useColors();
  
  // Calculate remaining days if deadline is set
  const daysLeft = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Determine progress status color
  const getProgressColor = () => {
    if (goal.progress >= 1) return colors.status.success;
    if (daysLeft !== null && daysLeft < 3) return colors.status.error;
    if (daysLeft !== null && daysLeft < 7) return colors.status.warning;
    return colors.status.info;
  };
  
  const progressColor = getProgressColor();
  
  return (
    <Pressable
      onPress={() => onPress?.(goal)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.default,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <YStack space="$2" padding="$4">
        <Text fontSize="$5" fontWeight="$2" color={colors.content.primary}>
          {goal.title}
        </Text>
        
        {goal.description && (
          <Text fontSize="$3" color={colors.content.secondary} numberOfLines={2}>
            {goal.description}
          </Text>
        )}
        
        <YStack space="$1" marginTop="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" fontWeight="$2" color={colors.content.secondary}>
              Progress
            </Text>
            <Text fontSize="$3" color={colors.content.subtle}>
              {Math.round(goal.progress * 100)}%
            </Text>
          </XStack>
          
          <Progress value={goal.progress * 100} backgroundColor={colors.background.secondary}>
            <ProgressIndicator backgroundColor={progressColor} />
          </Progress>
        </YStack>
        
        {daysLeft !== null && (
          <XStack justifyContent="flex-end" marginTop="$1">
            <Text 
              fontSize="$2" 
              color={daysLeft < 0 ? colors.status.error : colors.content.subtle}
            >
              {daysLeft < 0 
                ? `Overdue by ${Math.abs(daysLeft)} days` 
                : daysLeft === 0 
                  ? "Due today" 
                  : `${daysLeft} days left`}
            </Text>
          </XStack>
        )}
      </YStack>
    </Pressable>
  );
}

/**
 * Component to display a list of goals with progress indicators
 */
export default function GoalsList({
  goals = [],
  isLoading = false,
  onGoalPress,
  onAddPress,
  style,
}: GoalsListProps) {
  const colors = useColors();
  
  return (
    <YStack flex={1} style={style}>
      <EmptyOrSkeleton
        isLoading={isLoading}
        isEmpty={goals.length === 0}
        skeletonCount={3}
        skeletonHeight={160}
        skeletonBorderRadius={12}
        title="No goals yet"
        message="Create a new goal to track your progress"
      >
        <FlashList
          data={goals}
          renderItem={({ item }) => (
            <GoalCard goal={item} onPress={onGoalPress} />
          )}
          estimatedItemSize={180}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
            + Add Goal
          </Text>
        </Pressable>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    height: 12,
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