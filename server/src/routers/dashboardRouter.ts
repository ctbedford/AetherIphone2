import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

// Define fields for consistent selection - align with Zod schemas & table structure
const HABIT_FIELDS = 'id, user_id, name, description, habit_type, goal_quantity, goal_units, frequency_type, frequency_details, reminder_id, streak, best_streak, sort_order, created_at, updated_at'; // Added reminder_id
const GOAL_FIELDS = 'id, user_id, name, description, priority, status, target_date, sort_order, created_at, updated_at'; // Use target_date
const TASK_FIELDS = 'id, user_id, name, notes, status, priority, due_date, reminder_id, goal_id, sort_order, created_at, updated_at'; // Use due_date, reminder_id
const HABIT_ENTRY_FIELDS = 'id, habit_id, user_id, date, quantity_value, notes, created_at';
const TRACKED_STATE_DEF_FIELDS = 'id, user_id, name, description, data_type, unit, sort_order, active, notes, created_at, updated_at'; // Adjusted based on potential schema changes

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
          .select(HABIT_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .order('sort_order', { ascending: true, nullsFirst: false }) // Correct: nullsFirst: false for nulls last
          .limit(habitLimit);
        if (habitsError) throw habitsError;

        // --- Fetch Goals ---
        const { data: goals, error: goalsError } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .order('sort_order', { ascending: true, nullsFirst: false }) // Correct: nullsFirst: false for nulls last
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
          .select(TASK_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .neq('status', 'completed') // Use correct enum value
          .or(`due_date.lte.${twoWeeksFromNow.toISOString()},due_date.is.null`)
          .order('due_date', { ascending: true, nullsFirst: false }) // Use 'due_date'
          .limit(taskLimit);
        if (tasksError) throw tasksError;

        // --- Fetch Active Tracked State Definitions ---
        const { data: trackedStateDefinitions, error: statesError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .eq('active', true)
          .order('sort_order', { ascending: true, nullsFirst: false }); // Correct: nullsFirst: false for nulls last
        if (statesError) throw statesError;
        
        // --- Fetch Latest State Entries for Active Definitions ---
        let latestEntriesMap: Record<string, { value: any; created_at: string }> = {};
        const stateDefIds = (trackedStateDefinitions || []).map(s => s.id);

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
        const habitIds = (habits || []).map(h => h.id);
        const { data: habitEntriesToday, error: todayEntriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id') // Only need habit_id to check existence
          .eq('user_id', ctx.userId)
          .eq('date', todayStr) // Filter by date
          .in('habit_id', habitIds);
        if (todayEntriesError) throw todayEntriesError;

        const completedHabitIds = new Set((habitEntriesToday || []).map(e => e.habit_id));

        const formattedHabits = (habits || []).map(h => ({
          id: h.id,
          name: h.name, // Use name
          description: h.description, // Pass other potentially useful fields
          habit_type: h.habit_type,
          streak: h.streak,
          // Consider a habit completed if *any* entry exists for today
          completed: completedHabitIds.has(h.id)
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

        const formattedGoals = (goals || []).map((g) => {
          const { total = 0, completed: comp = 0 } = tasksMap[g.id] || {};
          // Calculate progress based on tasks, ignore goal.progress field for now
          const progress = total > 0 ? comp / total : 0;
          return {
            id: g.id,
            title: g.name, // Changed name to title to match frontend expectations
            status: g.status, // Pass status directly
            priority: g.priority, // Pass priority
            progress: Math.round(progress * 100) / 100, // Keep calculated progress
            tasks: { // Add tasks information expected by GoalSummaryCard
              total: total,
              completed: comp
            }
          };
        });

        // --- Format Tasks (Minimal formatting needed if TASK_FIELDS is correct) ---
        const formattedTasks = (tasks || []).map((t) => ({
          id: t.id,
          name: t.name,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date, // Use due_date
          // Add other fields as needed by the dashboard UI
        }));

        // --- Format Tracked States with Latest Values ---
        const formattedTrackedStates = (trackedStateDefinitions || []).map((def) => {
          const latestEntry = latestEntriesMap[def.id];
          return {
            id: def.id,
            name: def.name,
            unit: def.unit, // Use 'unit' field
            currentValue: latestEntry ? latestEntry.value : null, // Default to null
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
    .input(z.object({
      daysToInclude: z.number().min(1).optional().default(7),
      includeRawData: z.boolean().optional().default(false),
    }).optional())
    .query(async ({ ctx, input }) => {
      try {
        // Calculate date range based on input or default to past week
        const daysToInclude = input?.daysToInclude || 7;
        const includeRawData = input?.includeRawData || false;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (daysToInclude - 1));
        
        const todayStr = endDate.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // Generate array of all dates in the range for daily aggregation
        const dateRange: string[] = [];
        const tempDate = new Date(startDate);
        while (tempDate <= endDate) {
          dateRange.push(tempDate.toISOString().split('T')[0]);
          tempDate.setDate(tempDate.getDate() + 1);
        }
        
        // Fetch habits relevant to the date range (active during any part of the range)
        // Need to consider habits created *before* the end date and not archived *before* the start date
        const HABIT_FIELDS_FOR_PROGRESS = 'id, name, habit_type, frequency_type, frequency_details, created_at, streak, best_streak'; // Add streak fields
        const { data: relevantHabits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS_FOR_PROGRESS)
          .eq('user_id', ctx.userId)
          // Add logic here if needed to filter habits active within the date range
          // e.g., .lt('created_at', endDate.toISOString())
          //       .or(`archived_at.gte.${startDate.toISOString()},archived_at.is.null`)
          ;
        if (habitsError) throw habitsError;

        const relevantHabitIds = (relevantHabits || []).map(h => h.id);

        // Fetch habit entries within the date range for relevant habits
        const { data: habitEntries, error: entriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('id, habit_id, date, completed, quantity_value, notes')
          .eq('user_id', ctx.userId)
          .in('habit_id', relevantHabitIds.length > 0 ? relevantHabitIds : ['dummy-uuid']) // Filter by relevant habits
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });
 
        if (entriesError) throw entriesError;

        // Get all tasks completed or due within the date range
        const { data: relevantTasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .or(`due_date.gte.${startDateStr}.and.due_date.lte.${todayStr},status.eq.completed.and.updated_at.gte.${startDateStr}.and.updated_at.lte.${todayStr}`);

        if (tasksError) throw tasksError;
        
        // Get total tasks count for completion rate
        const { count: totalTasks, error: countError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ctx.userId);
          
        if (countError) throw countError;
        
        // Get goal progress snapshots for the period
        const { data: goalSnapshots, error: goalSnapshotsError } = await ctx.supabaseAdmin
          .from('goal_progress_snapshots') // Assuming we have this table
          .select('goal_id, progress, created_at')
          .eq('user_id', ctx.userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
          
        if (goalSnapshotsError) throw goalSnapshotsError;

        // -- AGGREGATE DATA BY DAY --
        
        // Create daily habit completion structure
        const habitsByDay: Record<string, { completed: number; total: number; entries: any[]; expected: number }> = {};
        dateRange.forEach(date => {
          habitsByDay[date] = { completed: 0, total: 0, entries: [], expected: 0 };
        });
        
        // Populate completed habits from entries (count existence, not completed flag)
        habitEntries?.forEach((entry: any) => {
          const dateStr = (entry.date as string).split('T')[0];
          if (habitsByDay[dateStr]) {
            // Only count one completion per habit per day
            if (!habitsByDay[dateStr].entries.some((e: any) => e.habit_id === entry.habit_id)) {
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
        relevantTasks?.forEach(task => {
          const completedDate = (task.updated_at as string).split('T')[0];
          if (tasksByDay[completedDate]) {
            tasksByDay[completedDate].completed++;
            tasksByDay[completedDate].entries.push(task);
          }
        });
        
        // Calculate expected habits per day based on frequency
        const isHabitExpected = (habit: any, date: string): boolean => {
          const dateObj = new Date(date + 'T00:00:00Z'); // Ensure UTC
          const dayOfWeek = dateObj.getUTCDay(); // 0 = Sunday, 6 = Saturday
          const dayOfMonth = dateObj.getUTCDate();
          const month = dateObj.getUTCMonth(); // 0 = January, 11 = December

          const habitCreatedDate = new Date(habit.created_at);
          if (dateObj < habitCreatedDate) {
            return false; // Cannot be expected before it was created
          }

          switch (habit.frequency_type) {
            case 'daily':
              return true;
            case 'specific_days':
              return Array.isArray(habit.frequency_details?.days) && habit.frequency_details.days.includes(dayOfWeek);
            // TODO: Add logic for 'weekly', 'monthly' etc. as needed
            default:
              return false;
          }
        };
        relevantHabits?.forEach(habit => {
          dateRange.forEach(date => {
            if (isHabitExpected(habit, date)) {
              habitsByDay[date].expected++;
            }
          });
        });
        
        // Format into daily progress reports
        const dailyProgress = dateRange.map(date => {
          const habitStats = habitsByDay[date];
          const taskStats = tasksByDay[date];
          
          const habitCompletionRate = habitStats.expected > 0 
            ? habitStats.completed / habitStats.expected 
            : 0;
            
          return {
            date,
            habits: {
              total: habitStats.total,
              completed: habitStats.completed,
              completionRate: habitCompletionRate,
              expected: habitStats.expected
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
        const habitStreaks = (relevantHabits || []).map(habit => ({
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