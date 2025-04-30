// File: server/src/routers/trackedStateRouter.ts

import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  // Ensure all necessary input types from trpc-types are imported
  createTrackedStateDefInput,
  updateTrackedStateDefInput,
  GetTrackedStateDefByIdInput,
  DeleteTrackedStateDefInput,
  CreateStateEntryInput,      // <--- Import for createEntry
  updateStateEntryInput,      // <--- Import for updateEntry
  GetStateEntriesInput,       // <--- Import for getEntries
  DeleteStateEntryInput       // <--- Import for deleteEntry
} from '../types/trpc-types';

// Use correct field names from database.types.ts & trpc-types.ts
const TRACKED_STATE_DEF_FIELDS = 'id, user_id, name, description, scale, custom_labels, unit, icon, target_min_value, target_max_value, created_at, updated_at, active, priority';
const STATE_ENTRY_FIELDS = 'id, user_id, definition_id, value_numeric, value_text, entry_timestamp, notes';

export const trackedStateRouter = router({
  getDefinitions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('active', true)
          .order('priority', { ascending: true, nullsFirst: false }) // Corrected: nullsFirst
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
    .input(GetTrackedStateDefByIdInput) // Use correct Zod schema
    .query(async ({ ctx, input }) => {
       try {
        const { data: definition, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS)
          .eq('id', input.id) // input.id is now correctly typed
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
    .input(createTrackedStateDefInput) // Use correct Zod schema
    .mutation(async ({ ctx, input }) => {
       try {
        const { data: definition, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .insert({
            ...input, // input is now correctly typed
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
    .input(updateTrackedStateDefInput) // Use correct Zod schema
    .mutation(async ({ ctx, input }) => {
       try {
        const { id, ...updateData } = input; // input is now correctly typed

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
    .input(DeleteTrackedStateDefInput) // Use correct Zod schema
    .mutation(async ({ ctx, input }) => {
       try {
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('id')
          .eq('id', input.id) // input.id is now correctly typed
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
          .eq('id', input.id) // input.id is now correctly typed
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id }; // input.id is now correctly typed
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete tracked state definition',
        });
      }
    }),

  // --- State Entry Procedures ---

  getEntries: protectedProcedure
    .input(GetStateEntriesInput) // <<<--- ADDED .input() BINDING
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('state_entries')
          .select(STATE_ENTRY_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('definition_id', input.tracked_state_def_id); // input is now typed

        if (input.startDate) { // input is now typed
          query = query.gte('entry_timestamp', input.startDate);
        }
        if (input.endDate) { // input is now typed
          query = query.lte('entry_timestamp', input.endDate);
        }

        query = query.order('entry_timestamp', { ascending: false });

        if (input.limit) { // input is now typed
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
    .input(CreateStateEntryInput) // <<<--- ADDED .input() BINDING
    .mutation(async ({ ctx, input }) => {
      try {
        // Check definition ownership (already implemented correctly)
        const { error: defError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('id')
          .eq('id', input.tracked_state_def_id) // input is now typed
          .eq('user_id', ctx.userId)
          .single();

        if (defError) {
          throw new TRPCError({
            code: defError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Tracked state definition not found or invalid.',
          });
        }

        // Insert typed data
        const { data: entry, error } = await ctx.supabaseAdmin
          .from('state_entries')
          .insert({
            user_id: ctx.userId,
            definition_id: input.tracked_state_def_id, // input is now typed
            value_numeric: input.value_numeric,     // input is now typed
            value_text: input.value_text,         // input is now typed
            entry_timestamp: input.entry_timestamp || new Date().toISOString(), // input is now typed
            notes: input.notes,                 // input is now typed
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
    .input(updateStateEntryInput) // <<<--- ADDED .input() BINDING
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input; // input is now typed

        // Check ownership (already implemented correctly)
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('state_entries')
          .select('id')
          .eq('id', id) // Use id from destructured input
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Entry not found or access denied.',
          });
        }

        // updateData is now correctly typed from the input schema
        const { data: updatedEntry, error } = await ctx.supabaseAdmin
          .from('state_entries')
          .update(updateData)
          .eq('id', id) // Use id from destructured input
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
    .input(DeleteStateEntryInput) // <<<--- ADDED .input() BINDING
    .mutation(async ({ ctx, input }) => {
       try {
        // Check ownership (already implemented correctly)
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('state_entries')
          .select('id')
          .eq('id', input.id) // input is now typed
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
          .eq('id', input.id) // input is now typed
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id }; // input is now typed
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete state entry',
        });
      }
    }),
});