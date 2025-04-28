import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { createPrincipleInput, updatePrincipleInput } from '../types/trpc-types'; // Assuming Principle schema is also imported if needed for parsing

export const principleRouter = router({
  getPrinciples: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: principles, error } = await ctx.supabaseAdmin
          .from('principles')
          .select('id, user_id, name, description, sort_order, created_at, updated_at')
          .eq('user_id', ctx.userId)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Principle schema from trpc-types?
        return principles;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch principles',
        });
      }
    }),

  getPrincipleById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: principle, error } = await ctx.supabaseAdmin
          .from('principles')
          .select('id, user_id, name, description, sort_order, created_at, updated_at')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!principle) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Principle not found',
          });
        }
        // TODO: Parse with Principle schema from trpc-types?
        return principle;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch principle',
        });
      }
    }),

  createPrinciple: protectedProcedure
    .input(createPrincipleInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: principle, error } = await ctx.supabaseAdmin
          .from('principles')
          .insert({
            ...input, // Includes name, description, sort_order
            user_id: ctx.userId,
          })
          .select('id, user_id, name, description, sort_order, created_at, updated_at')
          .single();

        if (error) throw error;
        // TODO: Parse with Principle schema from trpc-types?
        return principle;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create principle',
        });
      }
    }),

  updatePrinciple: protectedProcedure
    .input(updatePrincipleInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check ownership
        const { data: existing, error: fetchError } = await ctx.supabaseAdmin
          .from('principles')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Principle not found or you do not have permission to update it',
          });
        }

        // Update
        const { data: updatedPrinciple, error } = await ctx.supabaseAdmin
          .from('principles')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select('id, user_id, name, description, sort_order, created_at, updated_at')
          .single();

        if (error) throw error;
        // TODO: Parse with Principle schema from trpc-types?
        return updatedPrinciple;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update principle',
        });
      }
    }),

  deletePrinciple: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check ownership
        const { data: existing, error: fetchError } = await ctx.supabaseAdmin
          .from('principles')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Principle not found or you do not have permission to delete it',
          });
        }

        // Delete
        const { error } = await ctx.supabaseAdmin
          .from('principles')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete principle',
        });
      }
    }),
});
