import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { createValueInput, updateValueInput } from '../types/trpc-types';

export const valueRouter = router({
  getValues: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: values, error } = await ctx.supabaseAdmin
          .from('values')
          .select('id, user_id, name, description, color, icon, sort_order, created_at, updated_at')
          .eq('user_id', ctx.userId)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Value schema from trpc-types?
        return values;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch values',
        });
      }
    }),

  getValueById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: value, error } = await ctx.supabaseAdmin
          .from('values')
          .select('id, user_id, name, description, color, icon, sort_order, created_at, updated_at')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!value) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found',
          });
        }

        // TODO: Parse with Value schema from trpc-types?
        return value;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch value',
        });
      }
    }),

  createValue: protectedProcedure
    .input(createValueInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: value, error } = await ctx.supabaseAdmin
          .from('values')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select('id, user_id, name, description, color, icon, sort_order, created_at, updated_at')
          .single();

        if (error) throw error;
        // TODO: Parse with Value schema from trpc-types?
        return value;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create value',
        });
      }
    }),

  updateValue: protectedProcedure
    .input(updateValueInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // First check if the value exists and belongs to user
        const { data: existingValue, error: fetchError } = await ctx.supabaseAdmin
          .from('values')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingValue) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found or you do not have permission to update it',
          });
        }

        // Update the value
        const { data: updatedValue, error } = await ctx.supabaseAdmin
          .from('values')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select('id, user_id, name, description, color, icon, sort_order, created_at, updated_at')
          .single();

        if (error) throw error;
        // TODO: Parse with Value schema from trpc-types?
        return updatedValue;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update value',
        });
      }
    }),

  deleteValue: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the value exists and belongs to user
        const { data: existingValue, error: fetchError } = await ctx.supabaseAdmin
          .from('values')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingValue) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found or you do not have permission to delete it',
          });
        }

        // Delete the value
        const { error } = await ctx.supabaseAdmin
          .from('values')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete value',
        });
      }
    }),
});