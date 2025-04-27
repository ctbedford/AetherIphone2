// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/home/index.tsx
import React, { useCallback } from 'react';
import { YStack, H1, Text, XStack, Button, ScrollView, Spinner } from 'tamagui';
import { SafeAreaView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { trpc, RouterOutputs } from '@/utils/trpc';
import DashboardSection from '@/components/dashboard/DashboardSection';
import GoalSummaryCard from '@/components/dashboard/GoalSummaryCard';
import HabitCheckItem from '@/components/dashboard/HabitCheckItem';
import TaskItem from '@/components/dashboard/TaskItem';
import StateIndicator from '@/components/dashboard/StateIndicator';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useSkeleton } from '@/hooks/useSkeleton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useToastController } from '@tamagui/toast';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const toast = useToastController();
  
  // Define types using RouterOutputs for clarity and safety
  type DashboardGoal = RouterOutputs['dashboard']['getDashboardData']['goals'][number];
  type DashboardHabit = RouterOutputs['dashboard']['getDashboardData']['habits'][number];

  // Use tRPC hooks to fetch data - Types are inferred but can be explicitly used
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
        flex={1}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        }
      >
        <YStack padding="$4" space="$5">
          {/* Header */}
          <YStack space="$1">
            <H1>{greeting}</H1>
            <Text color="$gray10">{currentDate}</Text>
          </YStack>

          {/* Quick Actions */}
          <XStack space="$2" justifyContent="flex-start" flexShrink={1} alignSelf="stretch">
            <Button
              size="$2"
              themeInverse
              onPress={() => {
                router.push('/planner/add-task');
              }}
            >
              <Ionicons name="add-outline" size={18} color="white" />
              New Task
            </Button>
            <Button
              size="$2"
              themeInverse
              onPress={() => {
                router.push('/planner/add-habit');
              }}
            >
              <Ionicons name="repeat-outline" size={18} color="white" />
              New Habit
            </Button>
          </XStack>

          {/* Goals Section */}
          <DashboardSection 
            title="Goals"
            onSeeAll={() => router.push('/planner')}
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
                onAction={() => router.push('/planner/add-goal')}
              />
            ) : (
              <YStack space="$3">
                {dashboardData.goals.slice(0, 3).map((goal: DashboardGoal) => (
                  <GoalSummaryCard 
                    key={goal.id}
                    goal={goal}
                    onPress={() => router.push({ pathname: '/planner/goal/[id]', params: { id: goal.id } } as any)}
                  />
                ))}
              </YStack>
            )}
          </DashboardSection>

          {/* Today's Habits */}
          <DashboardSection 
            title="Today's Habits"
            onSeeAll={() => router.push('/planner?tab=habits')}
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
                onAction={() => router.push('/planner/add-habit')}
              />
            ) : (
              <YStack space="$2">
                {dashboardData.habits.slice(0, 4).map((habit: DashboardHabit) => (
                  <HabitCheckItem 
                    key={habit.id}
                    habit={habit}
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

          {/* Today's State */}
          <DashboardSection
            title="Today's State"
            // TODO: Add navigation to a dedicated state tracking screen
            onSeeAll={() => console.log('Navigate to State Tracking screen')}
          >
            {isLoading ? (
              renderSkeletons() // Use generic skeletons or specific state skeletons
            ) : error ? (
              <EmptyOrSkeleton
                isEmpty={false}
                isError={true}
                onRetry={refetch}
                text="Failed to load state"
              />
            ) : !dashboardData?.trackedStates || dashboardData.trackedStates.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No states being tracked"
                actionText="Track a state"
                // TODO: Navigate to state definition creation screen
                onAction={() => console.log('Navigate to Add State screen')}
              />
            ) : (
              <XStack space="$3" flexWrap="wrap"> 
                {dashboardData.trackedStates.map((stateData) => (
                  <StateIndicator
                    key={stateData.id}
                    state={stateData} // Pass the formatted state data object
                    // TODO: Handle interaction - e.g., navigate to state detail/entry screen
                    onPress={() => console.log('State pressed:', stateData.id)}
                  />
                ))}
              </XStack>
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
