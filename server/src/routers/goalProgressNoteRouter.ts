import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  CreateGoalProgressNoteInput,
  UpdateGoalProgressNoteInput,
  GetGoalProgressNotesInput,
  DeleteGoalProgressNoteInput,
} from '../types/trpc-types';

// Define fields for consistent selection
const GOAL_PROGRESS_NOTE_FIELDS = 'id, goal_id, user_id, note, created_at';

export const goalProgressNoteRouter = router({
  // Get all notes for a specific goal
  getNotesForGoal: protectedProcedure
    .input(GetGoalProgressNotesInput)
    .query(async ({ ctx, input }) => {
      try {
        // First, ensure the goal exists and belongs to the user
        const { error: goalError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', input.goal_id)
          .eq('user_id', ctx.userId)
          .single();

        if (goalError) {
          throw new TRPCError({
            code: goalError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Goal not found or access denied.',
          });
        }

        // Fetch the notes for that goal
        const { data, error } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .select(GOAL_PROGRESS_NOTE_FIELDS)
          .eq('user_id', ctx.userId) // Redundant check, but good practice
          .eq('goal_id', input.goal_id)
          .order('created_at', { ascending: false }); // Newest first

        if (error) throw error;
        return data ?? [];
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goal progress notes',
        });
      }
    }),

  createNote: protectedProcedure
    .input(CreateGoalProgressNoteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure the goal exists and belongs to the user before adding a note
        const { error: goalError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', input.goal_id)
          .eq('user_id', ctx.userId)
          .single();

        if (goalError) {
          throw new TRPCError({
            code: goalError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Goal not found or access denied.',
          });
        }

        const { data: note, error } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select(GOAL_PROGRESS_NOTE_FIELDS)
          .single();

        if (error) throw error;
        return note;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create goal progress note',
        });
      }
    }),

  updateNote: protectedProcedure
    .input(UpdateGoalProgressNoteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check existence and ownership of the note
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Note not found or access denied.',
          });
        }

        const { data: updatedNote, error } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(GOAL_PROGRESS_NOTE_FIELDS)
          .single();

        if (error) throw error;
        return updatedNote;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update goal progress note',
        });
      }
    }),

  deleteNote: protectedProcedure
    .input(DeleteGoalProgressNoteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check existence and ownership
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Note not found or access denied.',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete goal progress note',
        });
      }
    }),
});
