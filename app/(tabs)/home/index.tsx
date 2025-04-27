// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/home/index.tsx
import React, { useCallback } from 'react';
import { YStack, H1, Text, XStack, Button, ScrollView, Spinner } from 'tamagui';
import { RefreshControl, SafeAreaView } from 'react-native';
import { useToastController } from '@tamagui/toast';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { trpc } from '@/utils/trpc';
import DashboardSection from '@/components/dashboard/DashboardSection';
import GoalSummaryCard from '@/components/dashboard/GoalSummaryCard';
import HabitCheckItem from '@/components/dashboard/HabitCheckItem';
import TaskItem from '@/components/dashboard/TaskItem';
import StateIndicator from '@/components/dashboard/StateIndicator';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useSkeleton } from '@/hooks/useSkeleton';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const toast = useToastController();
  
  // Use tRPC hooks to fetch data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = trpc.dashboard.getDashboardData.useQuery();

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast.show(error.message || 'Failed to load dashboard data', { type: 'error' });
    }
  }, [error, toast]);

  // Set up pull-to-refresh
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Custom skeleton states from your hooks
  const { isLoading: skeletonsLoading, count: skeletonCount = 3 } = {
    isLoading,
    count: 3 // Number of skeleton items to show
  };
  
  // Generate skeleton UI based on loading state
  const renderSkeletons = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <SkeletonCard key={`skeleton-${index}`} />
    ));
  };

  // Get current date and greeting
  const greeting = getGreeting();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        }
      >
        <YStack padding="$4" space="$4">
          {/* Header */}
          <YStack space="$1">
            <H1>{greeting}</H1>
            <Text color="$gray10">{currentDate}</Text>
          </YStack>

          {/* Quick Actions */}
          <XStack space="$2" justifyContent="flex-start">
            <Button
              size="$3"
              themeInverse
              onPress={() => {
                // Use type assertion for dynamic routes
                router.push('/planner/add-task' as any);
              }}
            >
              <Ionicons name="add-outline" size={18} color="white" />
              New Task
            </Button>
            <Button
              size="$3"
              themeInverse
              onPress={() => {
                // Use type assertion for dynamic routes
                router.push('/planner/add-habit' as any);
              }}
            >
              <Ionicons name="repeat-outline" size={18} color="white" />
              New Habit
            </Button>
          </XStack>

          {/* Goals Section */}
          <DashboardSection 
            title="Goals"
            onSeeAll={() => router.push('/planner' as any)}
          >
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <EmptyOrSkeleton
                isEmpty={false}
                isError={true}
                onRetry={refetch}
                text="Failed to load goals"
              />
            ) : !dashboardData?.goals || dashboardData.goals.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No goals yet"
                actionText="Create a goal"
                onAction={() => router.push('/planner/add-goal' as any)}
              />
            ) : (
              <YStack space="$3">
                {dashboardData.goals.slice(0, 3).map((goal) => (
                  <GoalSummaryCard 
                    key={goal.id}
                    goal={{
                      id: goal.id,
                      title: goal.title,
                      progress: goal.progress || 0,
                      tasks: goal.tasks || { total: 0, completed: 0 }
                    }}
                    onPress={() => router.push({ pathname: '/planner/goal/[id]', params: { id: goal.id } } as any)}
                  />
                ))}
              </YStack>
            )}
          </DashboardSection>

          {/* Today's Habits */}
          <DashboardSection 
            title="Today's Habits"
            onSeeAll={() => router.push('/planner?tab=habits' as any)}
          >
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <EmptyOrSkeleton
                isEmpty={false}
                isError={true}
                onRetry={refetch}
                text="Failed to load habits"
              />
            ) : !dashboardData?.habits || dashboardData.habits.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No habits for today"
                actionText="Create a habit"
                onAction={() => router.push('/planner/add-habit' as any)}
              />
            ) : (
              <YStack space="$2">
                {dashboardData.habits.slice(0, 4).map((habit) => (
                  <HabitCheckItem 
                    key={habit.id}
                    habit={{
                      id: habit.id,
                      title: habit.title,
                      completedToday: habit.completed || false,
                      streak: habit.streak || 0
                    }}
                    onToggle={(habitId, completed) => {
                      // Use today's date for the habit entry
                      const today = new Date().toISOString().split('T')[0];
                      
                      // Call the tRPC mutation to create a habit entry
                      const createEntry = trpc.habit.createHabitEntry.useMutation({
                        onSuccess: () => {
                          refetch(); // Refresh data after toggling
                        },
                        onError: (error) => {
                          // Handle tRPC client error
                          toast.show(error.message || 'Failed to update habit', { type: 'error' });
                        }
                      });
                      
                      createEntry.mutate(
                        { 
                          habitId, 
                          completed, 
                          date: today
                        }
                      );
                    }}
                  />
                ))}
              </YStack>
            )}
          </DashboardSection>

          {/* Current State */}
          <DashboardSection title="Current State">
            {isLoading ? (
              <Spinner size="large" />
            ) : error ? (
              <Text color="$color" fontWeight="bold" fontSize="$3" paddingHorizontal="$2" paddingVertical="$1" marginLeft="$2">
                Failed to load state
              </Text>
            ) : dashboardData?.values && dashboardData.values.length > 0 ? (
              <StateIndicator 
                state={{
                  id: dashboardData.values[0].id || 'current-state',
                  name: dashboardData.values[0].name || 'Current State',
                  currentValue: dashboardData.values[0].value || dashboardData.values[0].description || 'Unknown',
                  lastUpdated: dashboardData.values[0].updated_at || null
                }}
                onPress={() => {/* Navigate to state details */}}
              />
            ) : (
              <Text color="$gray10">No current state defined</Text>
            )}
          </DashboardSection>

          {/* Upcoming Tasks */}
          <DashboardSection 
            title="Upcoming Tasks"
            onSeeAll={() => {/* Navigate to tasks list */}}
          >
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <EmptyOrSkeleton
                isEmpty={false}
                isError={true}
                onRetry={refetch}
                text="Failed to load tasks"
              />
            ) : !dashboardData?.tasks || dashboardData.tasks.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No upcoming tasks"
                actionText="Create a task"
                onAction={() => {/* Navigate to create task */}}
              />
            ) : (
              <YStack space="$2">
                {dashboardData.tasks.slice(0, 3).map((task) => (
                  <TaskItem 
                    key={task.id}
                    task={{
                      id: task.id,
                      title: task.title,
                      status: task.completed ? 'completed' : 'pending',
                      due: task.dueDate,
                      priority: task.priority || 0
                    }}
                    onPress={() => {/* Navigate to task details */}}
                  />
                ))}
              </YStack>
            )}
          </DashboardSection>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to determine greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}
