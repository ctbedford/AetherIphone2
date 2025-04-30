// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/home/index.tsx
import React, { useCallback, useMemo } from 'react';
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
import DailyProgressBanner from '@/components/dashboard/DailyProgressBanner'; // Import Banner
import EmptyOrSkeleton from '@/components/ui/EmptyOrSkeleton';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useSkeleton } from '@/hooks/useSkeleton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useToastController } from '@tamagui/toast';
import { BlurView } from 'expo-blur';
import { Plus } from '@tamagui/lucide-icons';
import LottieView from 'lottie-react-native';
import SwipeableRow from '@/components/ui/SwipeableRow'; // Import SwipeableRow

// Types inferred from tRPC Router
type RouterOutput = RouterOutputs['dashboard']['getDashboardData'];
// --- Define types for the STRUCTURE AFTER mapping in useMemo ---
export type DashboardGoal = {
  id: string;
  title: string;
  progress: number;
  tasks: { completed: number; total: number };
  // Include other relevant fields if needed by GoalSummaryCard
  status?: string | null; 
  priority?: number | null;
};
export type DashboardHabit = {
  id: string;
  name: string;
  description?: string | null;
  completed: boolean; // Mapped from completedToday
  streak: number;
  last_entry_id?: string; // Mapped from habit.last_entry_id (null -> undefined)
  habit_type?: string | null;
};
export type DashboardTask = {
  id: string;
  name: string;
  status: string | null; // Allow null
  due_date?: Date | string | null;
  // Include other relevant fields if needed by TaskItem
};
export type DashboardState = {
  id: string;
  name: string | null;
  unit: string | null;
  currentValue: number | string | null;
  lastUpdated: string | null;
  lastEntry: { value: number | null; created_at: Date | string } | null; // Explicitly include lastEntry
};
// --- End mapped type definitions ---

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const toast = useToastController();
  const utils = trpc.useUtils(); // Get tRPC utils for mutations
  
  // Define types using RouterOutputs for clarity and safety
  // type DashboardGoal = RouterOutputs['dashboard']['getDashboardData']['goals'][number];
  // type DashboardHabit = RouterOutputs['dashboard']['getDashboardData']['habits'][number];
  // type DashboardTask = RouterOutputs['dashboard']['getDashboardData']['tasks'][number];

  // Use tRPC hooks to fetch data - Types are inferred but can be explicitly used
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = trpc.dashboard.getDashboardData.useQuery();

  // Define the habit entry mutation hook
  const createHabitEntryMutation = trpc.habit.createHabitEntry.useMutation({
    onSuccess: () => {
      refetch(); // Refresh data after successful mutation
      // Optional: Add success toast
      // toast.show('Habit updated!', { type: 'success' });
    },
    onError: (error) => {
      // Handle tRPC client error
      toast.show(error.message || 'Failed to update habit', { type: 'error' });
    }
  });

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

  const dashboardDataMemo = useMemo(() => {
    // Fix: Add check to ensure dashboardData exists before accessing properties
    if (!dashboardData) {
      return null; // Or return default structure: { goals: [], habits: [], tasks: [], trackedStates: [] }
    }

    // Map and filter data, ensuring structure matches exported types
    return {
      // Filter goals to ensure they have an ID before mapping
      // Fix: Use nullish coalescing and optional chaining
      goals: (dashboardData.goals ?? [])
        .filter((goal): goal is typeof goal & { id: string } => !!goal?.id)
        .map((goal) => ({
        // Map to DashboardGoal structure
        id: goal.id, 
        title: goal.title ?? 'Untitled Goal', // Provide default for title
        progress: goal.progress ?? 0, 
        tasks: goal.tasks ?? { completed: 0, total: 0 }, 
        status: goal.status,
        priority: goal.priority,
      })),
      // Filter habits to ensure they have an ID before mapping
      // Fix: Use nullish coalescing and optional chaining
      habits: (dashboardData.habits ?? [])
        .filter((habit): habit is typeof habit & { id: string } => !!habit?.id)
        .map((habit) => ({
        // Map to DashboardHabit structure
        id: habit.id, 
        name: habit.name ?? 'Unnamed Habit', // Provide default for name
        description: habit.description,
        completed: habit.completedToday ?? false, // Map completedToday to completed
        streak: habit.streak ?? 0, 
        last_entry_id: habit.last_entry_id ?? undefined, // Map null to undefined
        habit_type: habit.habit_type,
      })),
      // Filter tasks to ensure they have an ID before mapping
      // Fix: Use nullish coalescing and optional chaining
      tasks: (dashboardData.tasks ?? [])
        .filter((task): task is typeof task & { id: string } => !!task?.id)
        .map((task) => ({
        // Map to DashboardTask structure
        id: task.id,
        name: task.name ?? 'Untitled Task', // Provide default name
        status: task.status,
        due_date: task.due_date,
      })),
      // Map trackedStates, ensuring lastEntry is preserved
      // Fix: Use nullish coalescing and optional chaining
      trackedStates: (dashboardData.trackedStates ?? [])
        .filter((state): state is typeof state & { id: string } => !!state?.id)
        .map((trackedState) => ({
        // Map to DashboardState structure
        id: trackedState.id,
        name: trackedState.name,
        unit: trackedState.unit,
        currentValue: trackedState.currentValue,
        lastUpdated: trackedState.lastUpdated,
        // Ensure lastEntry structure matches definition or is null
        lastEntry: trackedState.lastEntry ?? null, 
      })),
    };
  }, [dashboardData]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="transparent" // Hide default spinner
            colors={['transparent']} // Hide default spinner (Android)
            progressBackgroundColor="transparent" // Hide default bg (Android)
            refreshingComponent={
              <LottieView
                source={require('@/assets/refresh-sheikah.json')} // ASSUMES this file exists
                autoPlay
                loop
                style={{ width: 48, height: 48, alignSelf: 'center' }} // Center the animation
              />
            }
          />
        }
      >
        <YStack space="$4" paddingHorizontal="$4">
          {/* Header */}
          <YStack space="$1">
            <H1>{greeting}</H1>
            <Text color="$gray10">{currentDate}</Text>
          </YStack>

          {/* Daily Progress Banner */}
          <DailyProgressBanner 
            // tasksCompleted={...} 
            // totalTasks={...} 
            // habitsChecked={...} 
            // totalHabits={...} 
          />

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
            ) : !dashboardDataMemo?.goals || dashboardDataMemo.goals.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No goals yet"
                actionText="Create a goal"
                onAction={() => router.push('/planner/add-goal')}
              />
            ) : (
              <YStack space="$3">
                {dashboardDataMemo.goals.slice(0, 3).map((goal) => (
                  <SwipeableRow
                    key={goal.id}
                    onDelete={() => {
                      // TODO: Add confirmation dialog?
                      // Assuming mutation exists: utils.goal.delete.mutate({ id: goal.id })
                      console.log('Attempting to delete goal:', goal.id); // Placeholder
                      // utils.goal.delete.mutate({ id: goal.id });
                    }}
                  >
                    <GoalSummaryCard
                      goal={goal}
                      onPress={() => router.push(`/planner/goal/${goal.id}`)}
                    />
                  </SwipeableRow>
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
            ) : !dashboardDataMemo?.habits || dashboardDataMemo.habits.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No habits for today"
                actionText="Create a habit"
                onAction={() => router.push('/planner/add-habit')}
              />
            ) : (
              <YStack space="$2">
                {dashboardDataMemo.habits.slice(0, 4).map((habit) => (
                  <SwipeableRow
                    key={habit.id}
                    onDelete={() => {
                      // TODO: Add confirmation dialog?
                      // Assuming mutation exists: utils.habit.delete.mutate({ id: habit.id })
                      console.log('Attempting to delete habit:', habit.id); // Placeholder
                      // utils.habit.delete.mutate({ id: habit.id });
                    }}
                  >
                    <HabitCheckItem habit={habit} />
                  </SwipeableRow>
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
            ) : !dashboardDataMemo?.trackedStates || dashboardDataMemo.trackedStates.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No states being tracked"
                actionText="Track a state"
                // TODO: Navigate to state definition creation screen
                onAction={() => console.log('Navigate to Add State screen')}
              />
            ) : (
              <XStack space="$3" flexWrap="wrap"> 
                {dashboardDataMemo.trackedStates.map((stateData) => (
                  <StateIndicator
                    key={stateData.id}
                    state={stateData} // Pass the whole state object which includes lastEntry
                    lastEntry={stateData.lastEntry} // Pass lastEntry explicitly
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
            ) : !dashboardDataMemo?.tasks || dashboardDataMemo.tasks.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No upcoming tasks"
                actionText="Create a task"
                onAction={() => {/* Navigate to create task */}}
              />
            ) : (
              <YStack space="$2">
                {dashboardDataMemo.tasks.slice(0, 5).map((task) => (
                  <SwipeableRow
                    key={task.id}
                    onDelete={() => {
                      // TODO: Add confirmation dialog?
                      // Assuming mutation exists: utils.task.delete.mutate({ id: task.id })
                      console.log('Attempting to delete task:', task.id); // Placeholder
                      // utils.task.delete.mutate({ id: task.id });
                    }}
                  >
                    <TaskItem
                      task={{
                        // Explicitly pass props matching DashboardTask type
                        id: task.id, // Ensure id is passed
                        name: task.name, // Already defaulted in map
                        status: task.status, // Pass status
                        due_date: task.due_date, // Pass due_date
                      }}
                      isLast={false} // Adjust if needed for styling
                      onPress={() => console.log('Task Item Pressed:', task.id)}
                    />
                  </SwipeableRow>
                ))}
              </YStack>
            )}
          </DashboardSection>
        </YStack>
      </ScrollView>
      <QuickAddFAB />
    </SafeAreaView>
  );
}

// Helper function for greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good evening';
}

// Quick Add FAB Component
function QuickAddFAB() {
  return (
    <BlurView intensity={40} tint="default" style={{ position:'absolute', bottom:24, right:24, borderRadius:32, overflow: 'hidden' }}>
      <Button
        circular
        size="$5"
        backgroundColor="$accent"
        icon={Plus}
        elevate
        shadowColor="$shadowColor"
        shadowRadius={5}
        shadowOffset={{ width: 0, height: 2 }}
        pressStyle={{ scale: 0.95, opacity: 0.9 }}
        onPress={() => {
          router.push('/planner/add-task');
        }}
      />
    </BlurView>
  );
}
