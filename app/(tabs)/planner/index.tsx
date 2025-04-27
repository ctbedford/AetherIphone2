// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/planner/index.tsx
import React, { useState, Suspense } from 'react';
import { YStack, XStack, Text, Tabs, Button, Spinner, Card } from 'tamagui';
import { SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { trpc } from '@/utils/trpc';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { RouterOutputs } from '@/utils/api-types';
import { SectionError } from '@/components/ui/ErrorBanner';

interface TabData {
  key: string;
  title: string;
  icon: React.ReactNode;
}

// Tab configurations
const TABS: TabData[] = [
  {
    key: 'goals',
    title: 'Goals',
    icon: <Ionicons name="trophy-outline" size={18} color="currentColor" />
  },
  {
    key: 'habits',
    title: 'Habits',
    icon: <Ionicons name="repeat-outline" size={18} color="currentColor" />
  },
  {
    key: 'calendar',
    title: 'Calendar',
    icon: <Ionicons name="calendar-outline" size={18} color="currentColor" />
  }
];

export default function PlannerScreen() {
  const [activeTab, setActiveTab] = useState<string>('goals');
  const colorScheme = useColorScheme();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize={24} fontWeight="bold">Planner</Text>
          <Button
            size="$3"
            circular
            onPress={() => {/* Handle new item */}}
            icon={<Ionicons name="add" size={22} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          />
        </XStack>
        
        {/* Tabs */}
        <Tabs
          defaultValue="goals"
          orientation="horizontal"
          flexDirection="column"
          flex={1}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <Tabs.List 
            backgroundColor="$backgroundStrong"
            paddingHorizontal="$2"
            borderRadius="$4"
            marginBottom="$4"
          >
            {TABS.map((tab) => (
              <Tabs.Tab
                key={tab.key}
                flex={1}
                value={tab.key}
                padding="$3"
                borderRadius="$2"
                backgroundColor={activeTab === tab.key ? '$backgroundFocus' : 'transparent'}
              >
                <XStack space="$2" justifyContent="center" alignItems="center">
                  {tab.icon}
                  <Text>{tab.title}</Text>
                </XStack>
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {/* Tab Content */}
          <Tabs.Content value="goals" flex={1}>
            <ScrollView>
              <GoalsTab />
            </ScrollView>
          </Tabs.Content>
          
          <Tabs.Content value="habits" flex={1}>
            <ScrollView>
              <HabitsTab />
            </ScrollView>
          </Tabs.Content>
          
          <Tabs.Content value="calendar" flex={1}>
            <ScrollView>
              <CalendarTab />
            </ScrollView>
          </Tabs.Content>
        </Tabs>
      </YStack>
    </SafeAreaView>
  );
}

// Goals Tab
function GoalsTab() {
  // Fetch goals using tRPC
  const { data: goals, isLoading, error, refetch } = trpc.goal.getGoals.useQuery();
  
  // Define the inferred type for a single goal
  type PlannerGoal = RouterOutputs['goal']['getGoals'][number];

  if (isLoading) {
    return <EmptyOrSkeleton isLoading={true} count={3} type="card" />;
  }
  
  if (error) {
    return (
      <EmptyOrSkeleton 
        isEmpty={false} 
        isError={true} 
        onRetry={refetch} 
        text="Failed to load goals" 
      />
    );
  }
  
  if (!goals || goals.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty={true} 
        text="No goals yet" 
        actionText="Create a goal" 
        onAction={() => router.push('/planner/add-goal')} 
      />
    );
  }
  
  return (
    <YStack space="$4">
      {goals.map((goal: PlannerGoal) => (
        <Button 
          key={goal.id} 
          height="$12" 
          justifyContent="flex-start" 
          paddingHorizontal="$3"
          onPress={() => router.push({ pathname: '/planner/goal/[id]', params: { id: goal.id } })}
        >
          <YStack>
            <Text fontWeight="bold">{goal.title}</Text>
            <Text fontSize="$2" color="$gray10">
              {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No due date'}
            </Text>
          </YStack>
        </Button>
      ))}
    </YStack>
  );
}

// Habits Tab
function HabitsTab() {
  // Fetch habits using tRPC
  const { data: habits, isLoading, error, refetch } = trpc.habit.getHabits.useQuery();
  
  // Define the inferred type for a single habit
  type PlannerHabit = RouterOutputs['habit']['getHabits'][number];

  if (isLoading) {
    return <EmptyOrSkeleton isLoading={isLoading} count={3} type="row" />;
  }
  
  if (error) {
    return (
      <EmptyOrSkeleton 
        isEmpty={false} 
        isError={true} 
        onRetry={refetch} 
        text="Failed to load habits" 
      />
    );
  }
  
  if (!habits || habits.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty={true} 
        text="No habits yet" 
        actionText="Create a habit" 
        onAction={() => router.push('/planner/add-habit')} 
      />
    );
  }
  
  return (
    <YStack space="$3">
      {habits.map((habit: PlannerHabit) => (
        <XStack 
          key={habit.id} 
          justifyContent="space-between" 
          alignItems="center" 
          paddingVertical="$3" 
          paddingHorizontal="$3" 
          borderBottomWidth={1} 
          borderColor="$gray5"
          pressStyle={{ opacity: 0.7 }}
          tag="pressable"
          onPress={() => router.push({ pathname: '/planner/habit/[id]', params: { id: habit.id } })}
        >
          <Text>{habit.title}</Text>
          <Button
            size="$2"
            circular
            backgroundColor={habit.completed ? '$green9' : '$gray9'}
            onPress={() => {
              // Use today's date for the habit entry
              const today = new Date().toISOString().split('T')[0];
              
              // Create a mutation to toggle habit completion
              const toggleHabit = trpc.habit.createHabitEntry.useMutation({
                onSuccess: () => {
                  refetch(); // Refresh data after toggling
                },
                onError: (error) => {
                  // Show error message
                  console.error('Failed to toggle habit:', error.message);
                }
              });
              
              // Toggle the habit completion status
              toggleHabit.mutate({
                habitId: habit.id,
                completed: !habit.completed,
                date: today
              });
            }}
            icon={<Ionicons name="checkmark" size={18} color="white" />}
          />
        </XStack>
      ))}
    </YStack>
  );
}

// Calendar Tab
function CalendarTab() {
  return (
    <YStack alignItems="center" justifyContent="center" padding="$8">
      <Text fontSize="$5" textAlign="center">
        Calendar integration coming soon
      </Text>
      <Text marginTop="$2" color="$gray10" textAlign="center">
        This tab will display task and habit schedules in a calendar view
      </Text>
    </YStack>
  );
}
