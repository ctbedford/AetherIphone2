import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  CreateTrackedStateDefInput,
  UpdateTrackedStateDefInput,
  GetTrackedStateDefByIdInput,
  DeleteTrackedStateDefInput,
  CreateStateEntryInput,
  UpdateStateEntryInput,
  GetStateEntriesInput,
  DeleteStateEntryInput
} from '../types/trpc-types';

const TRACKED_STATE_DEF_FIELDS = 'id, user_id, name, category, unit, icon, target_min_value, target_max_value, created_at, updated_at';
const STATE_ENTRY_FIELDS = 'id, user_id, tracked_state_def_id, value, timestamp, notes';

export const trackedStateRouter = router({
  getDefinitions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS)
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data ?? [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tracked state definitions',
        });
      } 
    }),

  getDefinitionById: protectedProcedure
    .input(GetTrackedStateDefByIdInput)
    .query(async ({ ctx, input }) => {
      try {
        const { data: definition, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS)
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Tracked state definition not found.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return definition;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tracked state definition',
        });
      }
    }),

  createDefinition: protectedProcedure
    .input(CreateTrackedStateDefInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: definition, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select(TRACKED_STATE_DEF_FIELDS)
          .single();

        if (error) throw error;
        return definition;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create tracked state definition',
        });
      }
    }),

  updateDefinition: protectedProcedure
    .input(UpdateTrackedStateDefInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const { error: fetchError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Definition not found or access denied.',
          });
        }

        const { data: updatedDefinition, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(TRACKED_STATE_DEF_FIELDS)
          .single();

        if (error) throw error;
        return updatedDefinition;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update tracked state definition',
        });
      }
    }),

  deleteDefinition: protectedProcedure
    .input(DeleteTrackedStateDefInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Definition not found or access denied.',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete tracked state definition',
        });
      }
    }),

  getEntries: protectedProcedure
    .input(GetStateEntriesInput)
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('state_entries')
          .select(STATE_ENTRY_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('tracked_state_def_id', input.tracked_state_def_id);

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

        const { data: entries, error } = await query;

        if (error) throw error;
        return entries ?? [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch state entries',
        });
      }
    }),

  createEntry: protectedProcedure
    .input(CreateStateEntryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { error: defError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('id')
          .eq('id', input.tracked_state_def_id)
          .eq('user_id', ctx.userId)
          .single();

        if (defError) {
          throw new TRPCError({
            code: defError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Tracked state definition not found or invalid.',
          });
        }

        const { data: entry, error } = await ctx.supabaseAdmin
          .from('state_entries')
          .insert({
            ...input,
            user_id: ctx.userId,
            timestamp: input.timestamp || new Date().toISOString(),
          })
          .select(STATE_ENTRY_FIELDS)
          .single();

        if (error) throw error;
        return entry;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create state entry',
        });
      }
    }),

  updateEntry: protectedProcedure
    .input(UpdateStateEntryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const { error: fetchError } = await ctx.supabaseAdmin
          .from('state_entries')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Entry not found or access denied.',
          });
        }

        const { data: updatedEntry, error } = await ctx.supabaseAdmin
          .from('state_entries')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(STATE_ENTRY_FIELDS)
          .single();

        if (error) throw error;
        return updatedEntry;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update state entry',
        });
      }
    }),

  deleteEntry: protectedProcedure
    .input(DeleteStateEntryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('state_entries')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Entry not found or access denied.',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('state_entries')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete state entry',
        });
      }
    }),
});