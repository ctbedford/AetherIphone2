import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const dashboardRouter = router({
  getDashboardData: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Fetch recent habits
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (habitsError) throw habitsError;

        // Fetch recent goals
        const { data: goals, error: goalsError } = await ctx.supabaseAdmin
          .from('goals')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (goalsError) throw goalsError;

        // Fetch upcoming tasks
        const { data: tasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('due_date', { ascending: true })
          .limit(10);

        if (tasksError) throw tasksError;

        // Fetch user values
        const { data: values, error: valuesError } = await ctx.supabaseAdmin
          .from('values')
          .select('*')
          .eq('user_id', ctx.userId);

        if (valuesError) throw valuesError;

        // Fetch recent habit entries
        const { data: habitEntries, error: entriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('*, habits(name)')
          .in('habit_id', habits?.map(h => h.id) || [])
          .eq('user_id', ctx.userId)
          .order('entry_date', { ascending: false })
          .limit(20);

        if (entriesError) throw entriesError;

        return {
          habits,
          goals,
          tasks,
          values,
          habitEntries,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch dashboard data',
        });
      }
    }),
  
  getWeeklyProgress: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Calculate date range for the past week
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        const todayStr = today.toISOString().split('T')[0];
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        
        // Get all habit entries for the past week
        const { data: habitEntries, error: entriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('*, habits(name, frequency)')
          .eq('user_id', ctx.userId)
          .gte('entry_date', sevenDaysAgoStr)
          .lte('entry_date', todayStr)
          .order('entry_date', { ascending: true });
          
        if (entriesError) throw entriesError;
        
        // Get completed tasks for the past week
        const { data: completedTasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*')
          .eq('user_id', ctx.userId)
          .eq('status', 'completed')
          .gte('updated_at', sevenDaysAgo.toISOString())
          .lte('updated_at', today.toISOString());
          
        if (tasksError) throw tasksError;
        
        // Get total tasks count for completion rate
        const { count: totalTasks, error: countError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ctx.userId);
          
        if (countError) throw countError;
        
        // Calculate habit streak for each habit
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select('*')
          .eq('user_id', ctx.userId);
          
        if (habitsError) throw habitsError;
        
        // Simple metric calculations
        const taskCompletionRate = totalTasks ? (completedTasks?.length || 0) / totalTasks : 0;
        const habitConsistency = habits?.length ? (habitEntries?.length || 0) / (habits.length * 7) : 0;
        
        return {
          habitEntries,
          completedTasks,
          metrics: {
            totalHabitEntries: habitEntries?.length || 0,
            completedTasksCount: completedTasks?.length || 0,
            taskCompletionRate,
            habitConsistency: Math.min(habitConsistency, 1), // Cap at 100%
          },
          dateRange: {
            start: sevenDaysAgoStr,
            end: todayStr,
          }
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch weekly progress',
        });
      }
    }),
}); 