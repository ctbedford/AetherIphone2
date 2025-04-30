import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  createTaskInput,
  updateTaskInput,
  updateTaskStatusInput,
  TaskStatusEnum, // Import the enum
  TaskPriorityEnum,
} from '../types/trpc-types';

// Define fields for selection consistency
const TASK_FIELDS =
  'id, user_id, title, notes, status, priority, due_date, goal_id, parent_task_id, recurrence_rule, recurrence_end_date, archived_at, sort_order, created_at, updated_at'; // Corrected: 'priority' instead of 'priority_enum' if that's the actual column name after migration
const GOAL_FIELDS = 'id, user_id, title, description, progress, target_date, archived_at, sort_order, created_at, updated_at';


// --- Helper function to update goal progress ---
async function updateGoalProgress(goalId: string, userId: string, supabase: any) {
  try {
    // 1. Fetch all non-archived tasks for the goal
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status') // Only need id and status
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .is('archived_at', null); // Exclude archived tasks

    if (tasksError) {
      console.error(`Error fetching tasks for goal ${goalId} during progress update:`, tasksError);
      // Decide how to handle this - maybe just log and skip update?
      return; // Exit if tasks can't be fetched
    }

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t: { status: string }) => t.status === TaskStatusEnum.enum.done).length || 0;

    // 2. Calculate progress (avoid division by zero)
    const newProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
    // Ensure progress is between 0 and 1, rounded to avoid floating point issues
    const clampedProgress = Math.round(Math.min(1, Math.max(0, newProgress)) * 100) / 100;

    // 3. Update the goal record
    const { error: updateError } = await supabase
      .from('goals')
      .update({ progress: clampedProgress })
      .eq('id', goalId)
      .eq('user_id', userId); // Ensure user owns the goal

    if (updateError) {
      console.error(`Error updating progress for goal ${goalId}:`, updateError);
      // Log error but don't necessarily throw, task toggle was successful
    } else {
        console.log(`Updated progress for goal ${goalId} to ${clampedProgress}`);
    }

  } catch (err) {
    console.error(`Unexpected error during goal progress update for goal ${goalId}:`, err);
    // Log unexpected errors
  }
}

export const taskRouter = router({
  getTasks: protectedProcedure // Gets non-archived tasks
    .input(z.object({
      goalId: z.string().uuid().optional(),
      // TODO: Add filters for status, priority, dates etc.?
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null); // Filter out archived

        if (input.goalId) {
          query = query.eq('goal_id', input.goalId);
        }

        // TODO: Add complex priority enum sorting? (e.g. high > medium > low)
        const { data: tasks, error } = await query
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('due_date', { ascending: true, nullsFirst: false }) // Order by due date (nulls last)
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tasks',
        });
      }
    }),

  getTaskById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(), // Use uuid validation
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: task, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found',
          });
        }

        // TODO: Parse with Task schema?
        return task;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch task',
        });
      }
    }),

  createTask: protectedProcedure
    .input(createTaskInput) // Use imported input type
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify goal_id if provided
        if (input.goal_id) {
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .select('id')
            .eq('id', input.goal_id)
            .eq('user_id', ctx.userId) // Ensure goal belongs to user
            .is('archived_at', null) // Ensure goal is not archived
            .single();

          if (goalError || !goal) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived goal ID',
            });
          }
        }

        // Verify parent_task_id if provided
        if (input.parent_task_id) {
          const { data: parentTask, error: parentError } = await ctx.supabaseAdmin
            .from('tasks')
            .select('id')
            .eq('id', input.parent_task_id)
            .eq('user_id', ctx.userId) // Ensure parent belongs to user
            .is('archived_at', null) // Ensure parent is not archived
            .single();

          if (parentError || !parentTask) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived parent task ID',
            });
          }
        }

        const { data: task, error } = await ctx.supabaseAdmin
          .from('tasks')
          .insert({
            ...input, // Spread validated input (includes new fields like parent_task_id, recurrence etc)
            user_id: ctx.userId,
            // Ensure due_date is used if present in input
            due_date: input.due_date ?? null, // Use correct field name
          })
          .select(TASK_FIELDS)
          .single();

        if (error) {
           // Handle specific errors like FK violations?
           console.error("Create task error:", error);
           throw error;
        }
        // TODO: Parse with Task schema?
        return task;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create task',
        });
      }
    }),

  updateTask: protectedProcedure
    .input(updateTaskInput) // Use imported input type
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input; // Separate id from update payload

        // Check ownership
        const { data: existingTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, parent_task_id') // Select parent_task_id for cycle check
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          });
        }

        // Verify goal_id if being updated
        if (updateData.goal_id) {
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .select('id')
            .eq('id', updateData.goal_id)
            .eq('user_id', ctx.userId)
            .is('archived_at', null)
            .single();

          if (goalError || !goal) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived goal ID',
            });
          }
        }
        // Handle setting goal_id to null
        if (updateData.goal_id === null) {
          updateData.goal_id = null;
        }

        // Verify parent_task_id if being updated
        if (updateData.parent_task_id) {
           // Basic cycle check
           if (updateData.parent_task_id === id) {
             throw new TRPCError({
               code: 'BAD_REQUEST',
               message: 'Task cannot be its own parent',
             });
           }
          const { data: parentTask, error: parentError } = await ctx.supabaseAdmin
            .from('tasks')
            .select('id')
            .eq('id', updateData.parent_task_id)
            .eq('user_id', ctx.userId)
            .is('archived_at', null)
            .single();

          if (parentError || !parentTask) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived parent task ID',
            });
          }
          // TODO: Add deeper cycle detection if needed (check if new parent is a descendant)
        }
         // Handle setting parent_task_id to null
        if (updateData.parent_task_id === null) {
          updateData.parent_task_id = null;
        }

        // Ensure correct field name for due date if provided
        const payload: Record<string, any> = { ...updateData };
        if ('due_date' in payload) {
          payload.due_date = payload.due_date ?? null;
        }

        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update(payload) // Pass validated update data
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
             // Handle specific errors like FK violations?
           console.error("Update task error:", error);
           throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update task',
        });
      }
    }),

  deleteTask: protectedProcedure
    .input(z.object({
      id: z.string().uuid(), // Use uuid validation
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check ownership
        const { data: existingTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to delete it',
          });
        }

        // Delete the task (consider implications for subtasks - maybe archive instead?)
        // For now, direct delete.
        const { error } = await ctx.supabaseAdmin
          .from('tasks')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete task',
        });
      }
    }),

  // ---- Archive/Unarchive ----
  listArchivedTasks: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: tasks, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .not('archived_at', 'is', null) // Filter for archived tasks
          .order('archived_at', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch archived tasks',
        });
      }
    }),

  archiveTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Consider archiving subtasks recursively?
      try {
        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found or you do not have permission to archive it.',
            });
          }
          throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to archive task',
        });
      }
    }),

  unarchiveTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
       // TODO: Consider check if parent is archived?
      try {
        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ archived_at: null })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found or you do not have permission to unarchive it.',
            });
          }
          throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to unarchive task',
        });
      }
    }),

  // ---- Status Update ----
  updateTaskStatus: protectedProcedure
    .input(updateTaskStatusInput) // Uses { id: string().uuid(), status: TaskStatusEnum }
    .mutation(async ({ ctx, input }) => {
       try {
         // Check ownership first
         const { data: existing, error: fetchErr } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

         if (fetchErr || !existing) {
           throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found or permission denied.' });
         }

         // Perform update
         const { data: updatedTask, error: updateErr } = await ctx.supabaseAdmin
           .from('tasks')
           .update({ status: input.status })
           .eq('id', input.id)
           .select(TASK_FIELDS)
           .single();

         if (updateErr) throw updateErr;
         // TODO: Parse with Task schema?
         return updatedTask;
       } catch (error: any) {
         if (error instanceof TRPCError) throw error;
         throw new TRPCError({
           code: 'INTERNAL_SERVER_ERROR',
           message: error.message || 'Failed to update task status',
         });
       }
    }),

  // ---- Refactored Stubs ----
  listToday: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data: tasks, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .gte('due_date', todayStart.toISOString())
          .lte('due_date', todayEnd.toISOString())
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('due_date', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list tasks for today' });
      }
    }),

  listUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
       try {
         const tomorrowStart = new Date();
         tomorrowStart.setDate(tomorrowStart.getDate() + 1);
         tomorrowStart.setHours(0, 0, 0, 0);

         const { data: tasks, error } = await ctx.supabaseAdmin
           .from('tasks')
           .select(TASK_FIELDS)
           .eq('user_id', ctx.userId)
           .is('archived_at', null)
           .gte('due_date', tomorrowStart.toISOString()) // Due date is tomorrow or later
           .order('due_date', { ascending: true, nullsFirst: false })
           .order('sort_order', { ascending: true, nullsFirst: false })
           .order('created_at', { ascending: false });

         if (error) throw error;
         // TODO: Parse with Task schema?
         return tasks || [];
       } catch (error: any) {
         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list upcoming tasks' });
       }
    }),

 listOverdue: protectedProcedure
    .query(async ({ ctx }) => {
       try {
         const todayStart = new Date();
         todayStart.setHours(0, 0, 0, 0);

         const { data: tasks, error } = await ctx.supabaseAdmin
           .from('tasks')
           .select(TASK_FIELDS)
           .eq('user_id', ctx.userId)
           .is('archived_at', null)
           .lt('due_date', todayStart.toISOString()) // Due date is before today
           .not('status', 'in', `('${TaskStatusEnum.enum.done}')`) // Exclude completed tasks
           .order('due_date', { ascending: true, nullsFirst: false })
           .order('sort_order', { ascending: true, nullsFirst: false })
           .order('created_at', { ascending: false });

         if (error) throw error;
         // TODO: Parse with Task schema?
         return tasks || [];
       } catch (error: any) {
         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list overdue tasks' });
       }
    }),

  toggleTask: protectedProcedure // Toggles between 'todo' and 'done'
    .input(z.object({
      taskId: z.string().uuid(),
      completed: z.boolean().optional() // Optional for backward compatibility
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Fetch the current task, including goal_id
        const { data: currentTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, status, goal_id, title') // <-- Include goal_id and title
          .eq('id', input.taskId)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !currentTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found or permission denied.' });
        }

        // 2. Determine the new status
        let newStatus;
        if (input.completed !== undefined) {
          // If completed was explicitly provided, use it
          newStatus = input.completed ? TaskStatusEnum.enum.done : TaskStatusEnum.enum.todo;
        } else {
          // Otherwise toggle the current status
          newStatus = currentTask.status === TaskStatusEnum.enum.done
            ? TaskStatusEnum.enum.todo
            : TaskStatusEnum.enum.done;
        }

        // 3. Update the task status
        const { data: updatedTask, error: updateError } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', input.taskId)
          .select(TASK_FIELDS) // Return the full updated task
          .single();

        if (updateError) throw updateError;

        // 4. *** NEW: Update goal progress if applicable ***
        if (currentTask.goal_id) {
           // Call the helper function asynchronously - no need to await here
           // unless the UI needs the updated goal immediately (unlikely for a toggle)
          updateGoalProgress(currentTask.goal_id, ctx.userId, ctx.supabaseAdmin);
        }

        // 5. Return the updated task
        return updatedTask;

      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in toggleTask:", error); // Log unexpected errors
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to toggle task status',
        });
      }
    }),

  // --- Obsolete Stubs (keep or remove based on client usage) ---
  /*
  getTasksByGoal: protectedProcedure ... // Covered by getTasks with goalId filter
  getTodaysTasks: protectedProcedure ... // Replaced by listToday
  getUpcomingTasks: protectedProcedure ... // Replaced by listUpcoming
  updateTaskStatus_OLD: protectedProcedure ... // Replaced by updateTaskStatus and toggleTask
  */

});