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
    
  // This procedure is deprecated - use toggleTask instead
  toggleCompleted: protectedProcedure 
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      console.log("[taskRouter.toggleCompleted] Deprecated - use toggleTask instead");
      // For backwards compatibility, just call the toggleTask logic directly
      try {
        // Get current task data to check status and goal association
        const { data: task, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, status, goal_id, title')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          });
        }
        
        // Call the same logic as in toggleTask
        const newStatus = input.completed ? 'completed' : 'in-progress';
        const wasCompleted = task.status === 'completed';
        
        if ((newStatus === 'completed') === wasCompleted) {
          return { ...task, completed: wasCompleted };
        }
        
        const { data: updatedTask, error: updateError } = await ctx.supabaseAdmin
          .from('tasks')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select('id, title, status, goal_id, updated_at')
          .single();
          
        if (updateError) throw updateError;
        
        // Simplified version without goal updates for backwards compatibility
        return {
          ...updatedTask,
          completed: newStatus === 'completed'
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to toggle task completion',
        });
      }
    }),
    
  toggleTask: protectedProcedure
    .input(z.object({ 
      taskId: z.string(), 
      completed: z.boolean() 
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current task data to check status and goal association
        const { data: task, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, status, goal_id, title')
          .eq('id', input.taskId)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          });
        }
        
        // Determine the new status based on the completed flag
        const newStatus = input.completed ? 'completed' : 'in-progress';
        const wasCompleted = task.status === 'completed';
        
        // Only update if the status is changing
        if ((newStatus === 'completed') === wasCompleted) {
          // No status change needed, return the task as is
          return { ...task, completed: wasCompleted };
        }
        
        // Update the task status
        const { data: updatedTask, error: updateError } = await ctx.supabaseAdmin
          .from('tasks')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString() // Update the timestamp
          })
          .eq('id', input.taskId)
          .eq('user_id', ctx.userId)
          .select('id, title, status, goal_id, updated_at')
          .single();
          
        if (updateError) throw updateError;
        
        // If the task is associated with a goal, update the goal progress
        let updatedGoal = null;
        if (task.goal_id) {
          // Get all tasks for this goal to calculate new progress
          const { data: goalTasks, error: tasksError } = await ctx.supabaseAdmin
            .from('tasks')
            .select('id, status')
            .eq('goal_id', task.goal_id)
            .eq('user_id', ctx.userId);
            
          if (tasksError) throw tasksError;
          
          // Calculate the new progress value
          const totalTasks = goalTasks?.length || 0;
          const completedTasks = goalTasks?.filter(t => t.status === 'completed').length || 0;
          const newProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
          
          // Update the goal progress
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .update({
              progress: newProgress,
              updated_at: new Date().toISOString()
            })
            .eq('id', task.goal_id)
            .eq('user_id', ctx.userId)
            .select('id, name, progress')
            .single();
            
          if (!goalError) {
            updatedGoal = goal;
            
            // Add a progress snapshot for tracking
            await ctx.supabaseAdmin
              .from('goal_progress_snapshots')
              .insert({
                goal_id: task.goal_id,
                progress: newProgress,
                created_at: new Date().toISOString(),
                user_id: ctx.userId
              });
          }
        }
        
        return {
          ...updatedTask,
          completed: newStatus === 'completed',
          goal: updatedGoal,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to toggle task completion',
        });
      }
    }),
}); 