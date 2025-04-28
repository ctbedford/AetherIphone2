import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const dashboardRouter = router({
  getDashboardData: protectedProcedure
    .input(
      z.object({
        habitLimit: z.number().min(1).default(5),
        goalLimit: z.number().min(1).default(5),
        taskLimit: z.number().min(1).default(10)
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get limits from input or use defaults
        const habitLimit = input?.habitLimit || 5;
        const goalLimit = input?.goalLimit || 5;
        const taskLimit = input?.taskLimit || 10;

        // --- Fetch Habits ---
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select('id, name, streak, best_streak, created_at') // Only select needed fields for better performance
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(habitLimit);
        if (habitsError) throw habitsError;

        // --- Fetch Goals ---
        const { data: goals, error: goalsError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id, name, progress, created_at') // Only select needed fields
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(goalLimit);
        if (goalsError) throw goalsError;

        // --- Fetch Upcoming Tasks (focus on upcoming tasks and prioritize those due soon) ---
        const today = new Date();
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(today.getDate() + 14);
        
        // We want to fetch tasks that are:
        // 1. Not completed
        // 2. Due within the next two weeks, or overdue
        // 3. Either unassigned or associated with the dashboard goals
        const { data: tasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, title, status, due, goal_id, priority')
          .eq('user_id', ctx.userId)
          .neq('status', 'completed')
          .or(`due.lte.${twoWeeksFromNow.toISOString()},due.is.null`)
          .order('due', { ascending: true, nullsFirst: false })
          .limit(taskLimit);
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
        console.error('Dashboard data fetch error:', error);
        
        // Handle specific error types with appropriate error codes
        if (error.code === '42P01') { // Table doesn't exist
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database schema error',
          });
        }
        
        if (error.code === '23505') { // Unique violation
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Resource already exists',
          });
        }
        
        // Default error handling
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch dashboard data',
        });
      }
    }),
  
  getWeeklyProgress: protectedProcedure
    .input(
      z.object({
        daysToInclude: z.number().min(1).max(30).default(7),
        includeRawData: z.boolean().default(false)
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        // Calculate date range based on input or default to past week
        const daysToInclude = input?.daysToInclude || 7;
        const includeRawData = input?.includeRawData || false;
        
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        const startDate = new Date();
        startDate.setDate(today.getDate() - (daysToInclude - 1));
        startDate.setHours(0, 0, 0, 0); // Start of the first day
        
        const todayStr = today.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // Generate array of all dates in the range for daily aggregation
        const dateRange: string[] = [];
        const tempDate = new Date(startDate);
        while (tempDate <= today) {
          dateRange.push(tempDate.toISOString().split('T')[0]);
          tempDate.setDate(tempDate.getDate() + 1);
        }
        
        // Get all habit entries for the specified date range
        const { data: habitEntries, error: entriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('id, habit_id, date, completed, habits:habit_id(id, name, frequency)')
          .eq('user_id', ctx.userId)
          .gte('date', startDateStr)
          .lte('date', todayStr)
          .order('date', { ascending: true });
          
        if (entriesError) throw entriesError;
        
        // Get task completion data for the specified date range
        const { data: completedTasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, title, status, updated_at, goal_id')
          .eq('user_id', ctx.userId)
          .eq('status', 'completed')
          .gte('updated_at', startDate.toISOString())
          .lte('updated_at', today.toISOString())
          .order('updated_at', { ascending: true });
          
        if (tasksError) throw tasksError;
        
        // Get total tasks count for completion rate
        const { count: totalTasks, error: countError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ctx.userId);
          
        if (countError) throw countError;
        
        // Get all habits for the user
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select('id, name, frequency, streak, best_streak')
          .eq('user_id', ctx.userId)
          .eq('active', true) // Only include active habits
          .order('created_at', { ascending: false });
          
        if (habitsError) throw habitsError;
        
        // Get goal progress snapshots for the period
        const { data: goalSnapshots, error: goalSnapshotsError } = await ctx.supabaseAdmin
          .from('goal_progress_snapshots') // Assuming we have this table
          .select('goal_id, progress, created_at')
          .eq('user_id', ctx.userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', today.toISOString())
          .order('created_at', { ascending: true });
          
        if (goalSnapshotsError) throw goalSnapshotsError;

        // -- AGGREGATE DATA BY DAY --
        
        // Create daily habit completion structure
        const habitsByDay: Record<string, { completed: number; total: number; entries: any[] }> = {};
        dateRange.forEach(date => {
          habitsByDay[date] = { completed: 0, total: 0, entries: [] };
        });
        
        // Process habit entries into daily stats
        (habitEntries || []).forEach(entry => {
          const dateStr = (entry.date as string).split('T')[0];
          if (habitsByDay[dateStr]) {
            habitsByDay[dateStr].total++;
            if (entry.completed) {
              habitsByDay[dateStr].completed++;
            }
            habitsByDay[dateStr].entries.push(entry);
          }
        });
        
        // Create daily task completion structure
        const tasksByDay: Record<string, { completed: number; entries: any[] }> = {};
        dateRange.forEach(date => {
          tasksByDay[date] = { completed: 0, entries: [] };
        });
        
        // Process completed tasks into daily stats
        (completedTasks || []).forEach(task => {
          const completedDate = (task.updated_at as string).split('T')[0];
          if (tasksByDay[completedDate]) {
            tasksByDay[completedDate].completed++;
            tasksByDay[completedDate].entries.push(task);
          }
        });
        
        // Format into daily progress reports
        const dailyProgress = dateRange.map(date => {
          const habitStats = habitsByDay[date];
          const taskStats = tasksByDay[date];
          
          const habitCompletionRate = habitStats.total > 0 
            ? habitStats.completed / habitStats.total 
            : 0;
            
          return {
            date,
            habits: {
              total: habitStats.total,
              completed: habitStats.completed,
              completionRate: habitCompletionRate
            },
            tasks: {
              completed: taskStats.completed
            },
            // Optionally include raw entries if requested
            ...(includeRawData ? {
              habitEntries: habitStats.entries,
              completedTasks: taskStats.entries
            } : {})
          };
        });
        
        // Calculate overall metrics
        const totalHabitEntries = Object.values(habitsByDay).reduce(
          (sum, day) => sum + day.total, 0);
        const completedHabitEntries = Object.values(habitsByDay).reduce(
          (sum, day) => sum + day.completed, 0);
        const totalCompletedTasks = Object.values(tasksByDay).reduce(
          (sum, day) => sum + day.completed, 0);
          
        const taskCompletionRate = totalTasks ? totalCompletedTasks / totalTasks : 0;
        const habitConsistency = totalHabitEntries > 0 
          ? completedHabitEntries / totalHabitEntries 
          : 0;
          
        // Calculate habit streaks (could be moved to a separate helper function)
        const habitStreaks = (habits || []).map(habit => ({
          id: habit.id,
          name: habit.name,
          currentStreak: habit.streak || 0,
          bestStreak: habit.best_streak || 0
        }));
        
        // Prepare goal progress data
        const goalProgress: Record<string, { snapshots: any[]; startProgress?: number; endProgress?: number }> = {};
        
        (goalSnapshots || []).forEach(snapshot => {
          if (!goalProgress[snapshot.goal_id]) {
            goalProgress[snapshot.goal_id] = { snapshots: [] };
          }
          goalProgress[snapshot.goal_id].snapshots.push({
            progress: snapshot.progress,
            date: (snapshot.created_at as string).split('T')[0]
          });
        });
        
        // Calculate start and end progress for each goal
        Object.keys(goalProgress).forEach(goalId => {
          const snapshots = goalProgress[goalId].snapshots;
          if (snapshots.length > 0) {
            // Sort by date
            snapshots.sort((a, b) => a.date.localeCompare(b.date));
            goalProgress[goalId].startProgress = snapshots[0].progress;
            goalProgress[goalId].endProgress = snapshots[snapshots.length - 1].progress;
          }
        });
        
        return {
          dailyProgress,
          overallMetrics: {
            totalHabitEntries,
            completedHabitEntries,
            habitCompletionRate: habitConsistency,
            completedTasksCount: totalCompletedTasks,
            taskCompletionRate,
            // Trend indicators (compared to previous period)
            trends: {
              habitsImproving: true, // Placeholder - would compare to previous period
              tasksImproving: false // Placeholder - would compare to previous period
            }
          },
          habitStreaks,
          goalProgress: Object.entries(goalProgress).map(([goalId, data]) => ({
            goalId,
            progressChange: (data.endProgress || 0) - (data.startProgress || 0),
            currentProgress: data.endProgress || 0
          })),
          dateRange: {
            start: startDateStr,
            end: todayStr,
            days: dateRange
          }
        };
      } catch (error: any) {
        console.error('Weekly progress fetch error:', error);
        
        // Handle specific error types with appropriate error codes
        if (error.code === '42P01') { // Table doesn't exist
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database schema error',
          });
        }
        
        if (error.code === '22P02') { // Invalid text representation
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid input format',
          });
        }
        
        // Default error handling
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch weekly progress',
        });
      }
    }),
}); 