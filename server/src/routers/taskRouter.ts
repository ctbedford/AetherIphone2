import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const taskRouter = router({
  getTasks: protectedProcedure
    .input(z.object({
      goalId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('tasks')
          .select('*')
          .eq('user_id', ctx.userId);
          
        if (input.goalId) {
          query = query.eq('goal_id', input.goalId);
        }
        
        const { data: tasks, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return tasks;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tasks',
        });
      }
    }),

  getTaskById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: task, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*')
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
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      due_date: z.string().optional(),
      status: z.string().default('pending'),
      priority: z.string().optional(),
      goal_id: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // If goal_id is provided, verify it belongs to user
        if (input.goal_id) {
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .select('id')
            .eq('id', input.goal_id)
            .eq('user_id', ctx.userId)
            .single();
            
          if (goalError || !goal) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid goal ID or goal does not belong to user',
            });
          }
        }

        const { data: task, error } = await ctx.supabaseAdmin
          .from('tasks')
          .insert({
            title: input.title,
            description: input.description,
            due_date: input.due_date,
            status: input.status,
            priority: input.priority,
            goal_id: input.goal_id,
            user_id: ctx.userId,
          })
          .select()
          .single();

        if (error) throw error;
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
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      due_date: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      goal_id: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the task exists and belongs to user
        const { data: existingTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          });
        }

        // If goal_id is provided, verify it belongs to user
        if (input.goal_id) {
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .select('id')
            .eq('id', input.goal_id)
            .eq('user_id', ctx.userId)
            .single();
            
          if (goalError || !goal) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid goal ID or goal does not belong to user',
            });
          }
        }

        // Update the task
        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update({
            title: input.title,
            description: input.description,
            due_date: input.due_date,
            status: input.status,
            priority: input.priority,
            goal_id: input.goal_id,
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select()
          .single();

        if (error) throw error;
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
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the task exists and belongs to user
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

        // Delete the task
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

  updateTaskStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the task exists and belongs to user
        const { data: existingTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          });
        }

        // Update just the status
        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update({
            status: input.status,
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select()
          .single();

        if (error) throw error;
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update task status',
        });
      }
    }),

  // ---- Stubs for client compatibility ----
  listToday: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: Implement actual logic - filter by due_date === today
      console.log("[taskRouter.listToday] Stub called");
      return []; // Return empty array for now
    }),

  listActive: protectedProcedure // Note: client calls task.listToday, not task.listActive
    .query(async ({ ctx }) => {
      // TODO: Implement actual logic - filter by status != completed?
      console.log("[taskRouter.listActive] Stub called");
      return []; // Return empty array for now
    }),
    
  // Note: client calls habit.toggleCompleted, not task.toggleCompleted
  // Adding stub here just in case, but likely not the right place
  toggleCompleted: protectedProcedure 
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      console.log("[taskRouter.toggleCompleted] Stub called with:", input);
      // TODO: Implement actual logic if this belongs here
      return { id: input.id, completed: input.completed }; // Mock success
    }),
}); 