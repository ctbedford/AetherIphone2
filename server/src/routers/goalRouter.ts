import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { createGoalInput, updateGoalInput } from '../types/trpc-types';

const GOAL_FIELDS = 'id, user_id, title, description, progress, target_date, archived_at, sort_order, created_at, updated_at';

export const goalRouter = router({
  getGoals: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: goals, error } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        return goals || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goals',
        });
      }
    }),

  getGoalById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: goal, error } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS)
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
    .input(createGoalInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: goal, error } = await ctx.supabaseAdmin
          .from('goals')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select(GOAL_FIELDS)
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
    .input(updateGoalInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const { data: existingGoal, error: fetchError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingGoal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Goal not found or you do not have permission to update it',
          });
        }

        const { data: updatedGoal, error } = await ctx.supabaseAdmin
          .from('goals')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(GOAL_FIELDS)
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
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
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

  listActive: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: goals, error } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        return goals || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goals (in listActive stub)',
        });
      }
    }),

  listArchived: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: goals, error } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS)
          .eq('user_id', ctx.userId)
          .not('archived_at', 'is', null)
          .order('archived_at', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        return goals || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch archived goals',
        });
      }
    }),

  archiveGoal: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: updatedGoal, error } = await ctx.supabaseAdmin
          .from('goals')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(GOAL_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { 
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Goal not found or you do not have permission to archive it.',
            });
          }
          throw error;
        }
        return updatedGoal;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to archive goal',
        });
      }
    }),

  unarchiveGoal: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: updatedGoal, error } = await ctx.supabaseAdmin
          .from('goals')
          .update({ archived_at: null })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(GOAL_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Goal not found or you do not have permission to unarchive it.',
            });
          }
          throw error;
        }
        return updatedGoal;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to unarchive goal',
        });
      }
    }),
});