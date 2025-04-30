/* app/(tabs)/home/index.tsx */
import React from 'react';
import { RefreshControl } from 'react-native';
import { Stack, Text, ScrollView, Button } from '@/design-system/Primitives';
import { useDashboardQuery } from '@/app/lib/useDashboardQuery';
import { useToggleTaskStatus } from '@/app/lib/useToggleTaskStatus';
import { SwipeableRow } from '@/app/components/SwipeableRow';
import { TaskRow } from '@/app/components/TaskRow';
import { SectionCard } from '@/app/components/SectionCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorModeValue } from '@gluestack-ui/themed';

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useDashboardQuery();
  const toggleTask = useToggleTaskStatus();

  const parchment = useColorModeValue('#FDFFE0', '#1A2E3A');

  return (
    <ScrollView
      className="flex-1 px-4"
      style={{ backgroundColor: parchment }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <Text className="text-2xl font-heading text-darkText mt-6 mb-4">
        Good morning, Link!
      </Text>

      {/* Tasks Section */}
      <SectionCard
        title="Tasks for today"
        action={
          <Button
            className="flex-row items-center"
            onPress={() => router.push('/(tabs)/planner/add-task')}
          >
            <Ionicons name="add" size={18} color="#86A5A9" />
            <Text className="ml-1 text-sheikahCyan">New</Text>
          </Button>
        }
      >
        {isLoading && <Text>Loading…</Text>}
        {!isLoading && (!data?.tasks?.length ? (
          <Text className="text-ios-gray-3">No tasks 🎉</Text>
        ) : (
          data.tasks.map((task) => (
            <SwipeableRow
              key={task.id}
              onComplete={() =>
                toggleTask.mutate({ taskId: task.id, completed: task.status !== 'done' })
              }
            >
              <TaskRow task={task} />
            </SwipeableRow>
          ))
        ))}
      </SectionCard>

      {/* You can add Habits / Goals sections here following the same pattern */}
    </ScrollView>
  );
}
