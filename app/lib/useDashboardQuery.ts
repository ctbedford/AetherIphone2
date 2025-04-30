import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { animateLayout } from '@/utils/animationHelpers';
import * as Haptics from 'expo-haptics';

export type DashboardTask = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
};

export interface DashboardData {
  userName: string;
  tasksTotal: number;
  tasksCompleted: number;
  tasksOpen: number;
  tasksOverdue: number;
  unreadMessages: number;
  tasks: DashboardTask[];
}

export const useDashboardQuery = () =>
  trpc.dashboard.getDashboardData.useQuery(undefined, {
    staleTime: 60 * 1_000,
    refetchOnReconnect: true
  });

export const useCompleteTask = () => {
  const utils = trpc.useContext();
  return useMutation(({ id }: { id: string }) => trpc.dashboard.completeTask.mutate({ id }), {
    onMutate: async ({ id }) => {
      await utils.dashboard.getDashboardData.cancel();
      const prev = utils.dashboard.getDashboardData.getData();
      if (!prev) return { prev };
      const idx   = prev.tasks.findIndex(t => t.id === id);
      if (idx === -1) return { prev };
      const [task] = prev.tasks.splice(idx, 1);
      animateLayout();
      utils.dashboard.getDashboardData.setData(undefined, {
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
        tasksOpen:      Math.max(prev.tasksOpen - 1, 0),
        tasksOverdue:   task.dueDate && new Date(task.dueDate) < new Date()
                        ? Math.max(prev.tasksOverdue - 1, 0)
                        : prev.tasksOverdue,
        tasks:          prev.tasks
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && utils.dashboard.getDashboardData.setData(undefined, ctx.prev),
    onSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    onSettled: () => utils.dashboard.getDashboardData.invalidate()
  });
};
