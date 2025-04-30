import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  createReminderInput,
  updateReminderInput,
  GetRemindersForEntityInput,
  DeleteReminderInput,
} from '../types/trpc-types';

// Define fields for consistent selection
const REMINDER_FIELDS = 'id, user_id, related_entity_type, related_entity_id, reminder_time, message, is_active, created_at, updated_at';

export const reminderRouter = router({
  // Get all active reminders for the user (might need refinement later)
  getActiveReminders: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('reminders')
          .select(REMINDER_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('is_active', true)
          .order('reminder_time', { ascending: true });

        if (error) throw error;
        return data ?? [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch active reminders',
        });
      }
    }),

  // Get reminders linked to a specific entity
  getRemindersForEntity: protectedProcedure
    .input(GetRemindersForEntityInput)
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('reminders')
          .select(REMINDER_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('related_entity_type', input.related_entity_type)
          .eq('related_entity_id', input.related_entity_id)
          .order('reminder_time', { ascending: true });

        if (error) throw error;
        return data ?? [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch reminders for entity',
        });
      }
    }),

  createReminder: protectedProcedure
    .input(createReminderInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Potentially validate that related_entity_id exists and belongs to user?
        // This requires knowing the related_entity_type and querying the correct table.
        // For now, assume valid input.
        const { data: reminder, error } = await ctx.supabaseAdmin
          .from('reminders')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select(REMINDER_FIELDS)
          .single();

        if (error) throw error;
        return reminder;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create reminder',
        });
      }
    }),

  updateReminder: protectedProcedure
    .input(updateReminderInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check existence and ownership
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('reminders')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Reminder not found or access denied.',
          });
        }

        const { data: updatedReminder, error } = await ctx.supabaseAdmin
          .from('reminders')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(REMINDER_FIELDS)
          .single();

        if (error) throw error;
        return updatedReminder;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update reminder',
        });
      }
    }),

  deleteReminder: protectedProcedure
    .input(DeleteReminderInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check existence and ownership
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('reminders')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Reminder not found or access denied.',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('reminders')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete reminder',
        });
      }
    }),
});
