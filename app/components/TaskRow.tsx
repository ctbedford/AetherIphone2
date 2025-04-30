// app/components/TaskRow.tsx
import React, { memo } from 'react';
import { Text, Stack } from '@/design-system/Primitives';
import { Ionicons } from '@expo/vector-icons';
import { RouterOutputs } from '@/utils/trpc';

// Use the existing task type from your tRPC output
type DashboardData = RouterOutputs['dashboard']['getDashboardData'];
type Task = DashboardData['tasks'][number];

export const TaskRow = memo(({ task }: { task: Task }) => (
  <Stack className="flex-row items-center py-3 px-4 bg-parchment/80 dark:bg-darkTealBg/50">
    {task.status === 'completed' && (
      <Ionicons 
        name="checkmark-circle" 
        size={18} 
        color="#92C582" // korokGreen
        style={{ marginRight: 8 }} 
      />
    )}
    <Text 
      className={`flex-1 ${task.status === 'completed' 
        ? 'text-darkText/50 line-through' 
        : 'text-darkText dark:text-parchment'}`}
    >
      {task.name}
    </Text>
    {task.due_date && (
      <Text className="text-xs text-darkText/70 dark:text-parchment/70">
        {new Date(task.due_date).toLocaleDateString()}
      </Text>
    )}
  </Stack>
));
