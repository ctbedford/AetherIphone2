import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const dashboardRouter = router({
  getDashboardData: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // --- Fetch Habits ---
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select('*') // Select necessary fields
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(5);
        if (habitsError) throw habitsError;

        // --- Fetch Goals ---
        const { data: goals, error: goalsError } = await ctx.supabaseAdmin
          .from('goals')
          .select('*') // Select necessary fields
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(5);
        if (goalsError) throw goalsError;

        // --- Fetch Upcoming Tasks (associated with dashboard goals or unassigned) ---
        // Refine task fetching later if needed (e.g., only show tasks due soon)
        const { data: tasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*') // Select necessary fields
          .eq('user_id', ctx.userId)
          // .is('goal_id', null) // Example: Filter for unassigned tasks
          // .or(`goal_id.in.(${(goals || []).map(g => g.id).join(',')}),status.neq.completed`)
          .order('due', { ascending: true, nullsFirst: false }) // Correct syntax: nullsFirst: false means NULLs last
          .limit(10);
        if (tasksError) throw tasksError;

        // --- Fetch Tracked State Definitions ---
        const { data: trackedStates, error: statesError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('*') // Select necessary fields
          .eq('user_id', ctx.userId)
          .eq('active', true) // Only active states
          .order('priority', { ascending: true }); // Order by priority
        if (statesError) throw statesError;
        
        // --- Fetch Latest State Entries for Active Definitions ---
        let latestEntriesMap: Record<string, { value: number | string | null; created_at: string }> = {};
        const stateDefIds = (trackedStates || []).map(s => s.id);

        if (stateDefIds.length > 0) {
          // Use a CTE and ROW_NUMBER() to get the latest entry per state_id
          const { data: latestEntries, error: entriesError } = await ctx.supabaseAdmin.rpc(
            'get_latest_state_entries_for_user', 
            { p_user_id: ctx.userId, p_state_ids: stateDefIds }
          );

          if (entriesError) {
            console.error('Error fetching latest state entries:', entriesError);
            // Decide how to handle this - throw, or continue with empty/default values?
            // For now, log and continue, states will show default value
          } else {
            // Define expected type for entries from RPC
            type LatestEntry = { state_id: string; value: any; created_at: string };
            
            latestEntriesMap = (latestEntries as LatestEntry[] || []).reduce(
              (acc: Record<string, { value: any; created_at: string }>, entry: LatestEntry) => {
              acc[entry.state_id] = { value: entry.value, created_at: entry.created_at };
              return acc;
            }, {} as typeof latestEntriesMap);
          }
        }

        // --- Process Habits for 'completed' flag ---
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: habitEntriesToday, error: todayEntriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id, completed') // Select completed status
          .eq('user_id', ctx.userId)
          .eq('date', todayStr) // Use 'date' column
          .in('habit_id', (habits || []).map(h => h.id)); // Ensure habits is not null
        if (todayEntriesError) throw todayEntriesError;

        const completedMap = (habitEntriesToday || []).reduce<Record<string, boolean>>((acc, entry) => {
          if (entry.completed) { // Check the completed flag from the entry
            acc[entry.habit_id] = true;
          }
          return acc;
        }, {});

        const formattedHabits = (habits || []).map(h => ({
          // Select specific fields needed by frontend
          id: h.id,
          title: h.name, // Map name from DB to title for frontend
          streak: h.streak,
          completed: !!completedMap[h.id] // Determine completion from map
        }));

        // --- Process Goals for 'progress' ---
        const goalIds = (goals || []).map(g => g.id);
        let tasksMap: Record<string, { total: number; completed: number }> = {};
        if (goalIds.length > 0) {
          const { data: allTasksForGoals, error: tasksError2 } = await ctx.supabaseAdmin
            .from('tasks')
            .select('goal_id, status')
            .eq('user_id', ctx.userId)
            .in('goal_id', goalIds);
          if (tasksError2) throw tasksError2;

          tasksMap = (allTasksForGoals || []).reduce<Record<string, { total: number; completed: number }>>((acc, task) => {
            if (task.goal_id) { // Ensure goal_id is not null
              const gid = task.goal_id;
              if (!acc[gid]) acc[gid] = { total: 0, completed: 0 };
              acc[gid].total++;
              if (task.status === 'completed') acc[gid].completed++;
            }
            return acc;
          }, {});
        }

        const formattedGoals = (goals || []).map(g => {
          const { total = 0, completed: comp = 0 } = tasksMap[g.id] || {};
          const progress = total > 0 ? (comp / total) : (g.progress || 0); // Use calculated or stored progress
          return {
            // Select specific fields needed by frontend
            id: g.id, 
            title: g.name, // Map name from DB to title for frontend
            progress: Math.round(progress * 100) / 100, // Ensure progress is between 0 and 1, round
            tasks: { total, completed: comp } // Re-add task counts
          };
        });

        // --- Format Tracked States with Latest Values ---
        const formattedTrackedStates = (trackedStates || []).map(def => {
          const latestEntry = latestEntriesMap[def.id];
          return {
            id: def.id,
            name: def.name,
            // Include scale/custom_labels if StateIndicator needs them later
            // scale: def.scale,
            // custom_labels: def.custom_labels,
            currentValue: latestEntry ? latestEntry.value : 'N/A', // Provide default if no entry
            lastUpdated: latestEntry ? latestEntry.created_at : null,
          };
        });

        // Return formatted data including trackedStates
        return {
          habits: formattedHabits,
          goals: formattedGoals,
          tasks: tasks || [], // Ensure tasks is always an array
          trackedStates: formattedTrackedStates, // Use the newly formatted array
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