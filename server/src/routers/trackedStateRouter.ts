import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { CreateTrackedStateInput, UpdateTrackedStateInput } from '../types/trpc-types';

// Define fields for consistent selection
const TRACKED_STATE_FIELDS = 'id, user_id, name, category, value, unit, notes, timestamp, created_at, updated_at';

export const trackedStateRouter = router({
  getTrackedStates: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('tracked_states')
          .select(TRACKED_STATE_FIELDS) // Use constant
          .eq('user_id', ctx.userId);

        if (input.category) {
          query = query.eq('category', input.category);
        }

        // Order by timestamp (most recent measurement first) or created_at?
        const { data: states, error } = await query.order('timestamp', { ascending: false });

        if (error) throw error;
        // TODO: Parse with TrackedState schema?
        return states;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tracked states',
        });
      }
    }),

  getTrackedStateById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(), // Use UUID validation
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: state, error } = await ctx.supabaseAdmin
          .from('tracked_states')
          .select(TRACKED_STATE_FIELDS)
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Tracked state not found.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }

        // TODO: Parse with TrackedState schema?
        return state;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tracked state',
        });
      }
    }),

  createTrackedState: protectedProcedure
    .input(CreateTrackedStateInput) // Use imported Zod schema
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: state, error } = await ctx.supabaseAdmin
          .from('tracked_states')
          .insert({
            ...input,
            user_id: ctx.userId,
            timestamp: input.timestamp || new Date().toISOString(), // Handle default timestamp
          })
          .select(TRACKED_STATE_FIELDS)
          .single();

        if (error) throw error;
        // TODO: Parse with TrackedState schema?
        return state;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create tracked state',
        });
      }
    }),

  updateTrackedState: protectedProcedure
    .input(UpdateTrackedStateInput) // Use imported Zod schema
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // First check if the tracked state exists and belongs to user
        const { data: existingState, error: fetchError } = await ctx.supabaseAdmin
          .from('tracked_states')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Tracked state not found or access denied.',
          });
        }

        // Update the tracked state
        const { data: updatedState, error } = await ctx.supabaseAdmin
          .from('tracked_states')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(TRACKED_STATE_FIELDS)
          .single();

        if (error) throw error;
        // TODO: Parse with TrackedState schema?
        return updatedState;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update tracked state',
        });
      }
    }),

  deleteTrackedState: protectedProcedure
    .input(z.object({
      id: z.string().uuid(), // Use UUID validation
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the tracked state exists and belongs to user
        const { data: existingState, error: fetchError } = await ctx.supabaseAdmin
          .from('tracked_states')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Tracked state not found or access denied.',
          });
        }

        // Delete the tracked state
        const { error } = await ctx.supabaseAdmin
          .from('tracked_states')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete tracked state',
        });
      }
    }),

  getStateHistory: protectedProcedure
    .input(z.object({
      name: z.string(),
      category: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // Assuming history comes from the same table for now
        // If a separate history table exists, this needs adjustment
        let query = ctx.supabaseAdmin
          .from('tracked_states')
          .select(TRACKED_STATE_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .eq('name', input.name)
          .eq('category', input.category);

        if (input.startDate) {
          query = query.gte('timestamp', input.startDate); // Filter by measurement timestamp
        }

        if (input.endDate) {
          query = query.lte('timestamp', input.endDate);
        }

        const { data: history, error } = await query.order('timestamp', { ascending: false }).limit(input.limit || 50);

        if (error) throw error;
        // TODO: Parse with TrackedState schema?
        return history;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch state history',
        });
      }
    }),

  // ---- Stubs for client compatibility ----
  getLatest: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: Implement actual logic - maybe get distinct names/categories and latest timestamp/value for each?
      // For now, return all states like getTrackedStates
      try {
        const { data: states, error } = await ctx.supabaseAdmin
          .from('tracked_states')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('timestamp', { ascending: false }); // Order by timestamp to potentially get latest easily

        if (error) throw error;
        console.log("[trackedStateRouter.getLatest] Stub called, returning all states");
        // Maybe limit to first N distinct states here if needed later
        return states || []; 
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tracked states (in getLatest stub)',
        });
      }
    }),
}); 