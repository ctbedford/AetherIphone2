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
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useSkeleton } from '@/hooks/useSkeleton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useToastController } from '@tamagui/toast';

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
            ) : !dashboardDataMemo?.goals || dashboardDataMemo.goals.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No goals yet"
                actionText="Create a goal"
                onAction={() => router.push('/planner/add-goal')}
              />
            ) : (
              <YStack space="$3">
                {dashboardDataMemo.goals.slice(0, 3).map((goal: DashboardGoal) => (
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
            ) : !dashboardDataMemo?.habits || dashboardDataMemo.habits.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No habits for today"
                actionText="Create a habit"
                onAction={() => router.push('/planner/add-habit')}
              />
            ) : (
              <YStack space="$2">
                {dashboardDataMemo.habits.slice(0, 4).map((habit: DashboardHabit) => (
                  <HabitCheckItem 
                    key={habit.id} 
                    habit={habit}
                    onToggle={(habitId, completed) => {
                      // Use today's date for the habit entry
                      const today = new Date().toISOString().split('T')[0];
                      
                      // Call the mutation hook defined above
                      createHabitEntryMutation.mutate(
                        { 
                          habit_id: habitId, 
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
                {dashboardDataMemo.trackedStates.map((stateData: DashboardState) => (
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
                {dashboardDataMemo.tasks.slice(0, 5).map((task: DashboardTask) => (
                  <TaskItem
                    key={task.id}
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
