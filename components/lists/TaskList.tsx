import React from 'react';
import { FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { YStack, XStack, Text, Stack } from 'tamagui';
import { router } from 'expo-router';
import { RouterOutputs } from '@/utils/api-types';
import { AetherCard } from '@/components/ui/primitives';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { Ionicons } from '@expo/vector-icons';

type Task = RouterOutputs['task']['list'][number];

interface TaskListProps {
  tasks?: Task[];
  isLoading: boolean;
  isError?: boolean;
  refetch: () => void;
  onSelectTask?: (task: Task) => void;
  onCompleteTask?: (taskId: string, completed: boolean) => void;
}

/**
 * TaskCard - Individual task card component
 */
export function TaskCard({ 
  task, 
  onPress, 
  onComplete 
}: { 
  task: Task; 
  onPress: () => void; 
  onComplete?: (completed: boolean) => void;
}) {
  // Get the completion status of the task
  const [isCompleted, setIsCompleted] = React.useState(Boolean(task.completed));
  
  // Format the due date
  const formattedDate = task.due
    ? new Date(task.due).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';
    
  // Check if task is overdue
  const isOverdue = task.due && new Date(task.due) < new Date() && !isCompleted;

  const handleToggle = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    if (onComplete) {
      onComplete(newStatus);
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
            <Text 
              fontSize="$5" 
              fontWeight="bold" 
              color={isCompleted ? "$colorMuted" : "$color"} 
              numberOfLines={1} 
              flex={1}
              textDecorationLine={isCompleted ? 'line-through' : 'none'}
            >
              {task.title}
            </Text>
          </XStack>
        </XStack>
        
        {/* Notes if available */}
        {task.notes && !isCompleted && (
          <Text color="$colorMuted" fontSize="$3" numberOfLines={2} paddingLeft="$7">
            {task.notes}
          </Text>
        )}
        
        {/* Footer with due date and goal information */}
        <XStack justifyContent="space-between" alignItems="center" paddingLeft="$7">
          <XStack space="$2" alignItems="center">
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={isOverdue ? "$error" : "$colorMuted"} 
            />
            <Text 
              fontSize="$2" 
              color={isOverdue ? "$error" : "$colorMuted"}
              fontWeight={isOverdue ? "bold" : "normal"}
            >
              {isOverdue ? "Overdue: " : ""}{formattedDate}
            </Text>
          </XStack>
          
          {/* If task is linked to a goal, show goal name */}
          {task.goal_id && (
            <XStack 
              backgroundColor="$backgroundStrong" 
              paddingHorizontal="$2" 
              paddingVertical="$1" 
              borderRadius="$2"
            >
              <Text fontSize="$2" color="$primary">
                {task.goal?.title || 'Linked goal'}
              </Text>
            </XStack>
          )}
        </XStack>
      </YStack>
    </AetherCard>
  );
}

/**
 * TaskList - List component for displaying tasks
 */
export function TaskList({ 
  tasks, 
  isLoading, 
  isError, 
  refetch, 
  onSelectTask,
  onCompleteTask 
}: TaskListProps) {
  const renderTaskItem: ListRenderItem<Task> = ({ item }) => (
    <TaskCard 
      task={item} 
      onPress={() => {
        if (onSelectTask) {
          onSelectTask(item);
        } else {
          // Default navigation
          router.push({ 
            pathname: '/planner/task/[id]', 
            params: { id: item.id } 
          });
        }
      }}
      onComplete={(completed) => {
        if (onCompleteTask) {
          onCompleteTask(item.id, completed);
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
              Unable to load tasks
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

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty 
        text="No tasks yet" 
        actionText="Create a task" 
        onAction={() => router.push('/planner/add-task')} 
      />
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderTaskItem}
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
