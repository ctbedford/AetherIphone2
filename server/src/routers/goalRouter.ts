import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const goalRouter = router({
  getGoals: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: goals, error } = await ctx.supabaseAdmin
          .from('goals')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Format goals to align with client expectations
        const formattedGoals = (goals || []).map(g => ({
          ...g, // Keep other original fields
          title: g.name, // Map name to title
          dueDate: g.target_date // Map target_date to dueDate
        }));

        return formattedGoals;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goals',
        });
      }
    }),

  getGoalById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: goal, error } = await ctx.supabaseAdmin
          .from('goals')
          .select('*')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!goal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Goal not found',
          });
        }

        return goal;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goal',
        });
      }
    }),

  createGoal: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      target_date: z.string().optional(),
      status: z.string().default('active'),
      value_id: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: goal, error } = await ctx.supabaseAdmin
          .from('goals')
          .insert({
            title: input.title,
            description: input.description,
            target_date: input.target_date,
            status: input.status,
            value_id: input.value_id,
            user_id: ctx.userId,
          })
          .select()
          .single();

        if (error) throw error;
        return goal;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create goal',
        });
      }
    }),

  updateGoal: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      target_date: z.string().optional(),
      status: z.string().optional(),
      value_id: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the goal exists and belongs to user
        const { data: existingGoal, error: fetchError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingGoal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Goal not found or you do not have permission to update it',
          });
        }

        // Update the goal
        const { data: updatedGoal, error } = await ctx.supabaseAdmin
          .from('goals')
          .update({
            title: input.title,
            description: input.description,
            target_date: input.target_date,
            status: input.status,
            value_id: input.value_id,
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select()
          .single();

        if (error) throw error;
        return updatedGoal;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update goal',
        });
      }
    }),

  deleteGoal: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the goal exists and belongs to user
        const { data: existingGoal, error: fetchError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingGoal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Goal not found or you do not have permission to delete it',
          });
        }

        // Delete the goal
        const { error } = await ctx.supabaseAdmin
          .from('goals')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete goal',
        });
      }
    }),

  // ---- Stubs for client compatibility ----
  listActive: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: Implement actual logic - filter status = 'active'?
      // For now, return all goals like getGoals
      try {
        const { data: goals, error } = await ctx.supabaseAdmin
          .from('goals')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        console.log("[goalRouter.listActive] Stub called, returning all goals");
        return goals || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goals (in listActive stub)',
        });
      }
    }),
    
  // Note: Client calls state.getLatest, not goal.getLatest.
  // Adding stub here seems incorrect based on client calls.
  getLatest: protectedProcedure 
    .query(async ({ ctx }) => {
      console.log("[goalRouter.getLatest] STUB CALLED - LIKELY INCORRECT ROUTER");
      return [];
    }),
}); 