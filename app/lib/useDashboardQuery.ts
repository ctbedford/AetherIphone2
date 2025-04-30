// app/lib/useDashboardQuery.ts
import { trpc, RouterOutputs } from '@/utils/trpc';

// Export the dashboard data type for reuse
export type DashboardData = RouterOutputs['dashboard']['getDashboardData'];

/**
 * Hook to fetch dashboard data with caching
 */
export const useDashboardQuery = () =>
  trpc.dashboard.getDashboardData.useQuery(undefined, { 
    staleTime: 60_000, // 1 minute stale time
    refetchOnMount: 'always', // Always refetch when component mounts
  });
