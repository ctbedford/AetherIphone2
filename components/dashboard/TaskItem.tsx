import React from 'react';
// Use Tamagui components
import { Text, XStack, YStack, Checkbox, Spinner } from 'tamagui'; 
import { trpc, RouterOutputs, RouterInputs } from '@/utils/trpc';
import { Check } from '@tamagui/lucide-icons';

// Custom Task type that matches the actual format returned from the backend
type Task = {
  id: string;
  name: string;  // Backend returns 'name' not 'title'
  status: string;
  priority?: number;
  due_date?: string; // Backend returns 'due_date' not 'due'
  notes?: string;
  goal_id?: string;
  // Include other fields as needed
};

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

export default function TaskItem({ task, onPress }: TaskItemProps) {
  
  // Setup toggleTask mutation with optimistic updates
  const utils = trpc.useContext();
  // Setup mutation for task toggling
  const toggleTaskMutation = trpc.task.toggleTask.useMutation({
    // Optimistically update the UI
    onMutate: async ({ taskId, completed }: { taskId: string; completed?: boolean }) => {
      // Default to toggling the current state if completed is not provided
      const newCompleted = completed !== undefined ? completed : !isCompleted;
      // Cancel outgoing fetches that might overwrite our optimistic update
      await utils.task.getTasks.cancel();
      await utils.dashboard.getDashboardData.cancel();
      
      // Get previous data for potential rollback
      const prevTasksData = utils.task.getTasks.getData();
      const prevDashboardData = utils.dashboard.getDashboardData.getData();
      
      // Optimistically update tasks data if present
      if (prevTasksData) {
        utils.task.getTasks.setData({ goalId: undefined } as any, (old: any) => {
          if (!old) return old;
          return old.map((t: any) => {
            if (t.id === taskId) {
              return {
                ...t,
                status: completed ? 'completed' : 'in-progress'
              };
            }
            return t;
          });
        });
      }
      
      // Optimistically update dashboard data if present
      if (prevDashboardData) {
        utils.dashboard.getDashboardData.setData({ goalId: undefined } as any, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((t: any) => {
              if (t.id === task_id) {
                return {
                  ...t,
                  status: completed ? 'completed' : 'in-progress'
                };
              }
              return t;
            }),
          };
        });
      }
      
      // Return previous data for rollback
      return { prevTasksData, prevDashboardData };
    },
    
    // If something goes wrong, rollback optimistic updates
    onError: (err: any, variables: any, context: any) => {
      if (context?.prevTasksData) {
        utils.task.getTasks.setData(undefined, context.prevTasksData);
      }
      if (context?.prevDashboardData) {
        utils.dashboard.getDashboardData.setData(undefined, context.prevDashboardData);
      }
      console.error('Error toggling task:', err);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      utils.task.getTasks.invalidate();
      utils.dashboard.getDashboardData.invalidate();
    }
  });

  // Handle checkbox toggle
  const handleToggle = () => {
    toggleTaskMutation.mutate({
      taskId: task.id, // Using taskId as expected by the backend
      completed: !isCompleted
    });
  };

  // Map priority to color
  const priorityColor = task.priority === 1 ? '$brandRed' : 
                        task.priority === 2 ? '$brandYellow' : 
                        '$brandGreen';
  
  // Format due date
  const formattedDate = task.due_date 
    ? new Date(task.due_date).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      })
    : null;
    
  // Determine task completion status
  const isCompleted = task.status === 'completed';
  // No need for text style object since we use Tamagui props directly

  
  // Use YStack as the base component
  return (
    <YStack 
      backgroundColor="$backgroundStrong"
      padding="$3"
      borderRadius="$4"
      space="$1" // Add space between XStack and Date Text
    >
      <XStack alignItems="center" space="$2"> {/* Use XStack for horizontal layout */}
        {/* Checkbox for task completion */}
        <Checkbox
          size="$4"
          checked={isCompleted}
          onCheckedChange={handleToggle}
          disabled={toggleTaskMutation.isPending}
        >
          {toggleTaskMutation.isPending ? (
            <Spinner size="small" color="$brandPrimary" />
          ) : (
            <Checkbox.Indicator>
              <Check size={16} />
            </Checkbox.Indicator>
          )}
        </Checkbox>

        {/* Container for task details (clickable) */}
        <XStack flex={1} tag="pressable" onPress={onPress} pressStyle={{ opacity: 0.7 }}>
          {/* Priority Dot using YStack */}
          <YStack 
            width="$2" // Use size token for width
            height="$2" // Use size token for height
            borderRadius="$10" // Use a large radius token
            backgroundColor={priorityColor} 
            marginRight="$2" // Use space token for margin
          />
          <Text 
            fontSize="$4" // Use font size token
            fontWeight={task.priority === 1 ? '600' : '400'} // Keep fontWeight
            color="$color"
            flex={1} // Allow text to take remaining space
            opacity={isCompleted ? 0.7 : 1}
            textDecorationLine={isCompleted ? 'line-through' : undefined} // Proper Tamagui text decoration
          >
            {task.name}
          </Text>
        </XStack>
      </XStack>
      
      {formattedDate && (
        // Removed explicit margin, rely on outer YStack space
        <Text color="$gray9" fontSize="$2">
          Due: {formattedDate}
        </Text>
      )}
    </YStack>
  );
} 