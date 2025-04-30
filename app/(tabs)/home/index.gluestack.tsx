// app/(tabs)/home/index.gluestack.tsx
// New implementation of Home tab using Gluestack UI + NativeWind

import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Stack, Text, Button } from '@/design-system/Primitives';
import { router } from 'expo-router';
import { useDashboardQuery } from '@/app/lib/useDashboardQuery';
import { useToggleTaskStatus } from '@/app/lib/useToggleTaskStatus';
import { SectionCard } from '@/app/components/SectionCard';
import { SwipeableRow } from '@/app/components/SwipeableRow';
import { TaskRow } from '@/app/components/TaskRow';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons'; // Use Ionicons which is already in your project
import LottieView from 'lottie-react-native';

/**
 * Home Screen using Gluestack UI + NativeWind 
 * with Task Swipe → Done functionality
 */
export default function Home() {
  // Fetch dashboard data and task mutation
  const { data, isLoading, isRefetching, refetch } = useDashboardQuery();
  const toggleTaskMutation = useToggleTaskStatus();
  
  // Handle task completion with haptic feedback
  const handleCompleteTask = (taskId: string) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call mutation to mark task as complete
    toggleTaskMutation.mutate({ taskId, completed: true });
  };

  // Handle task deletion (placeholder for now)
  const handleDeleteTask = (taskId: string) => {
    console.log(`Delete task: ${taskId}`);
    // TODO: Implement delete mutation
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          // Custom refresh colors aligned with Zelda theme
          tintColor="#86A5A9" // sheikahCyan
          colors={['#86A5A9', '#92C582']} // sheikahCyan, korokGreen
        />
      }
      className="bg-parchment/30 dark:bg-darkTealBg/90"
    >
      <Stack className="p-4">
        {/* Today's Tasks Section */}
        <SectionCard title="Today's Tasks">
          {isLoading ? (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">Loading tasks...</Text>
            </Stack>
          ) : data?.tasks?.length ? (
            // Map through tasks and wrap each in SwipeableRow
            data.tasks.slice(0, 5).map((task) => (
              <SwipeableRow
                key={task.id}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              >
                <TaskRow task={task} />
              </SwipeableRow>
            ))
          ) : (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">No tasks for today</Text>
            </Stack>
          )}
          
          {/* Add Task Button */}
          <Stack className="mt-3 self-center">
            <Button
              className="bg-sheikahCyan/10 rounded-full py-2 px-4 border border-sheikahCyan/50 flex-row items-center"
              onPress={() => router.push('/(tabs)/tasks/add-task' as any)}
            >
              <Ionicons name="add-outline" size={16} color="#86A5A9" />
              <Text className="text-sheikahCyan ml-1">New Task</Text>
            </Button>
          </Stack>
        </SectionCard>
        
        {/* Additional sections can be added here */}
      </Stack>
    </ScrollView>
  );
}
