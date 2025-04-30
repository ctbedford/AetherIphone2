// server/src/routers/principleRouter.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { createPrincipleInput, updatePrincipleInput } from '../types/trpc-types'; // These now expect 'title' and 'body'

// Define fields for consistent selection, using 'title' and 'body'
const PRINCIPLE_FIELDS = 'id, user_id, title, body, sort_order, created_at, updated_at';

export const principleRouter = router({
  getPrinciples: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: principles, error } = await ctx.supabaseAdmin
          .from('principles')
          .select(PRINCIPLE_FIELDS) // Use the constant with 'title' and 'body'
          .eq('user_id', ctx.userId)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Principle schema from trpc-types?
        return principles || []; // Return empty array if null
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
          .select(PRINCIPLE_FIELDS) // Use the constant with 'title' and 'body'
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) {
           if (error.code === 'PGRST116') { // Handle not found specifically
             throw new TRPCError({ code: 'NOT_FOUND', message: 'Principle not found' });
           }
           throw error; // Rethrow other errors
        }
        // No need for !principle check if .single() is used and error isn't PGRST116

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
    .input(createPrincipleInput) // This Zod schema now expects 'title' and 'body'
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: principle, error } = await ctx.supabaseAdmin
          .from('principles')
          .insert({
            ...input, // Spread validated input, already contains 'title' and 'body'
            user_id: ctx.userId,
          })
          .select(PRINCIPLE_FIELDS) // Use the constant
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
    .input(updatePrincipleInput) // This Zod schema now expects 'title' and 'body' (optional)
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

        if (fetchError) {
           if (fetchError.code === 'PGRST116') {
             throw new TRPCError({ code: 'NOT_FOUND', message: 'Principle not found or you do not have permission to update it' });
           }
           throw fetchError;
        }

        // Update
        const { data: updatedPrinciple, error } = await ctx.supabaseAdmin
          .from('principles')
          .update(updateData) // updateData contains validated 'title'/'body' if provided
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(PRINCIPLE_FIELDS) // Use the constant
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

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
             throw new TRPCError({ code: 'NOT_FOUND', message: 'Principle not found or you do not have permission to delete it' });
           }
           throw fetchError;
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