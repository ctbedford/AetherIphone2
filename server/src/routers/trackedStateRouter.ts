import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const trackedStateRouter = router({
  getTrackedStates: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('tracked_states')
          .select('*')
          .eq('user_id', ctx.userId);
          
        if (input.category) {
          query = query.eq('category', input.category);
        }
        
        const { data: states, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
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
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: state, error } = await ctx.supabaseAdmin
          .from('tracked_states')
          .select('*')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!state) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tracked state not found',
          });
        }

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
    .input(z.object({
      name: z.string(),
      category: z.string(),
      value: z.number(),
      unit: z.string().optional(),
      timestamp: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: state, error } = await ctx.supabaseAdmin
          .from('tracked_states')
          .insert({
            name: input.name,
            category: input.category,
            value: input.value,
            unit: input.unit,
            timestamp: input.timestamp || new Date().toISOString(),
            notes: input.notes,
            user_id: ctx.userId,
          })
          .select()
          .single();

        if (error) throw error;
        return state;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create tracked state',
        });
      }
    }),

  updateTrackedState: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      category: z.string().optional(),
      value: z.number().optional(),
      unit: z.string().optional(),
      timestamp: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the tracked state exists and belongs to user
        const { data: existingState, error: fetchError } = await ctx.supabaseAdmin
          .from('tracked_states')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingState) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tracked state not found or you do not have permission to update it',
          });
        }

        // Update the tracked state
        const { data: updatedState, error } = await ctx.supabaseAdmin
          .from('tracked_states')
          .update({
            name: input.name,
            category: input.category,
            value: input.value,
            unit: input.unit,
            timestamp: input.timestamp,
            notes: input.notes,
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select()
          .single();

        if (error) throw error;
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
      id: z.string(),
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

        if (fetchError || !existingState) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tracked state not found or you do not have permission to delete it',
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
        let query = ctx.supabaseAdmin
          .from('tracked_states')
          .select('*')
          .eq('user_id', ctx.userId)
          .eq('name', input.name)
          .eq('category', input.category);
          
        if (input.startDate) {
          query = query.gte('timestamp', input.startDate);
        }
        
        if (input.endDate) {
          query = query.lte('timestamp', input.endDate);
        }
        
        query = query.order('timestamp', { ascending: false });
        
        if (input.limit) {
          query = query.limit(input.limit);
        }
        
        const { data: history, error } = await query;

        if (error) throw error;
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