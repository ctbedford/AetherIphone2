// app/lib/useToggleTaskStatus.ts
import { trpc } from '@/utils/trpc';
// Import Alert from React Native instead of using a toast library for simplicity
import { Alert } from 'react-native';

/**
 * Hook for toggling task completion status with optimistic updates
 */
export const useToggleTaskStatus = () => {
  const utils = trpc.useUtils();
  
  return trpc.task.toggleTask.useMutation({
    // Optimistically update UI before server responds
    onMutate: async ({ taskId, completed }) => {
      // Cancel any outgoing refetches
      await utils.dashboard.getDashboardData.cancel();
      
      // Snapshot current data for potential rollback
      const previous = utils.dashboard.getDashboardData.getData();
      
      // Optimistically update to the new value
      utils.dashboard.getDashboardData.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: oldData.tasks.map((task) => 
            task.id === taskId ? { ...task, status: completed ? 'completed' : 'in-progress' } : task
          ),
        };
      });
      
      return { previous };
    },
    
    // On successful mutation, show success message (silent in production)
    onSuccess: () => {
      if (__DEV__) {
        Alert.alert('Success', 'Task status updated');
      }
    },
    
    // If mutation fails, roll back optimistic update
    onError: (error, variables, context) => {
      if (context?.previous) {
        utils.dashboard.getDashboardData.setData(undefined, context.previous);
      }
      Alert.alert('Error', error.message || 'Failed to update task');
    },
    
    // Regardless of outcome, invalidate queries to refetch data
    onSettled: () => {
      utils.dashboard.getDashboardData.invalidate();
    },
  });
};
