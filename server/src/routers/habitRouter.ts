import { z } from "zod";
import { router, protectedProcedure } from "../router";
import { TRPCError } from "@trpc/server";
import {
  createHabitInput,
  updateHabitInput,
  createHabitEntryInput,
  updateHabitEntryInput,
} from '../types/trpc-types';

const HABIT_FIELDS =
  'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, recurrence_rule, recurrence_end_date, archived_at, sort_order, streak, best_streak, created_at, updated_at';

const HABIT_ENTRY_FIELDS =
  'id, user_id, habit_id, date, completed, quantity_value, notes, created_at';

async function calculateAndUpdateStreak(habitId: string, userId: string, targetDateStr: string, supabase: any) {
  console.log(`Placeholder: Streak calculation needed for habit ${habitId} targeting ${targetDateStr}`);
  // TODO: Implement streak calculation logic
}

export const habitRouter = router({
  getHabits: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (habitsError) throw habitsError;
        if (!habits) return [];

        const todayStr = new Date().toISOString().split('T')[0];

        const { data: habitEntriesToday, error: todayEntriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id')
          .eq('user_id', ctx.userId)
          .eq('date', todayStr)
          .in('habit_id', habits.map(h => h.id));

        if (todayEntriesError) throw todayEntriesError;

        const completedMap = (habitEntriesToday || []).reduce<Record<string, boolean>>((acc, entry) => {
          acc[entry.habit_id] = true;
          return acc;
        }, {});

        const formattedHabits = habits.map(h => ({
          ...h,
          completedToday: !!completedMap[h.id]
        }));

        return formattedHabits;
      } catch (error: any) {
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: error.message || 'Failed to fetch habits'
        });
      }
    }),

  getHabitById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .select(HABIT_FIELDS)
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (error) throw new TRPCError({ 
        code: error.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: error.message 
      });
      return data;
    }),

  createHabit: protectedProcedure
    .input(createHabitInput)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .insert({
          ...input,
          user_id: ctx.userId,
          streak: 0,
          best_streak: 0
        })
        .select(HABIT_FIELDS)
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  updateHabit: protectedProcedure
    .input(updateHabitInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const { data: habit, error: fetchError } = await ctx.supabaseAdmin
        .from("habits")
        .select("id")
        .eq("id", id)
        .eq("user_id", ctx.userId)
        .single();

      if (fetchError) throw new TRPCError({ 
        code: fetchError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: "Habit not found or access denied" 
      });

      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .update(updateData)
        .eq("id", id)
        .eq('user_id', ctx.userId)
        .select(HABIT_FIELDS)
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  deleteHabit: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: habit, error: fetchError } = await ctx.supabaseAdmin
        .from("habits")
        .select("id")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (fetchError) throw new TRPCError({ 
        code: fetchError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: "Habit not found or access denied" 
      });

      const { error } = await ctx.supabaseAdmin
        .from("habits")
        .delete()
        .eq("id", input.id);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { id: input.id };
    }),

  listArchivedHabits: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: habits, error } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS)
          .eq('user_id', ctx.userId)
          .not('archived_at', 'is', null)
          .order('archived_at', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        return habits || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch archived habits',
        });
      }
    }),

  archiveHabit: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: updatedHabit, error } = await ctx.supabaseAdmin
          .from('habits')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(HABIT_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return updatedHabit;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to archive habit' });
      }
    }),

  unarchiveHabit: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: updatedHabit, error } = await ctx.supabaseAdmin
          .from('habits')
          .update({ archived_at: null })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(HABIT_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return updatedHabit;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to unarchive habit' });
      }
    }),

  getHabitEntries: protectedProcedure
    .input(z.object({
      habitId: z.string().uuid(),
      startDate: z.string().optional(), 
      endDate: z.string().optional(),   
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { error: habitError } = await ctx.supabaseAdmin
          .from("habits")
          .select("id")
          .eq("id", input.habitId)
          .eq("user_id", ctx.userId)
          .single();

        if (habitError) {
          if (habitError.code === 'PGRST116') {
             throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: habitError.message });
        }

        let query = ctx.supabaseAdmin
          .from('habit_entries')
          .select(HABIT_ENTRY_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('habit_id', input.habitId);

        if (input.startDate) query = query.gte('date', input.startDate);
        if (input.endDate) query = query.lte('date', input.endDate);

        const { data, error: entriesError } = await query.order('date', { ascending: false });

        if (entriesError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: entriesError.message });
        return data || [];
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch habit entries' });
      }
    }),

  createHabitEntry: protectedProcedure
    .input(createHabitEntryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: habit, error: habitError } = await ctx.supabaseAdmin
          .from('habits')
          .select('id, archived_at')
          .eq('id', input.habit_id)
          .eq('user_id', ctx.userId)
          .single();

        if (habitError) {
          if (habitError.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: habitError.message });
        }
        if (habit.archived_at) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot add entry to an archived habit.' });
        }

        const entryDate = input.date || new Date().toISOString().split('T')[0];

        const { data: newEntry, error: insertError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .insert({
            ...input,
            date: entryDate,
            user_id: ctx.userId,
          })
          .select(HABIT_ENTRY_FIELDS)
          .single();

        if (insertError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: insertError.message });

        await calculateAndUpdateStreak(input.habit_id, ctx.userId, entryDate, ctx.supabaseAdmin);

        return newEntry;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create habit entry' });
      }
    }),

  updateHabitEntry: protectedProcedure
    .input(updateHabitEntryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const { data: existingEntry, error: fetchError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('id, user_id, habit_id, date')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit entry not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: fetchError.message });
        }

        const { data: updatedEntry, error: updateError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .update(updateData)
          .eq('id', id)
          .select(HABIT_ENTRY_FIELDS)
          .single();

        if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message });

        if ('quantity_value' in updateData || 'date' in updateData) {
            await calculateAndUpdateStreak(existingEntry.habit_id, ctx.userId, updateData.date || existingEntry.date, ctx.supabaseAdmin);
        }

        return updatedEntry;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update habit entry' });
      }
    }),

  deleteHabitEntry: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: existingEntry, error: fetchError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('id, user_id, habit_id, date')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit entry not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: fetchError.message });
        }

        const { error: deleteError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .delete()
          .eq('id', input.id);

        if (deleteError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: deleteError.message });

        await calculateAndUpdateStreak(existingEntry.habit_id, ctx.userId, existingEntry.date, ctx.supabaseAdmin);

        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete habit entry' });
      }
    }),

  // --- Habit Toggle --- //
  toggleHabitEntry: protectedProcedure
    .input(z.object({
      habitId: z.string().uuid(),
      date: z.string().optional(), // YYYY-MM-DD, defaults to today
      quantity_value: z.number().optional(), // Optional, defaults based on habit type if needed
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const entryDate = input.date || new Date().toISOString().split('T')[0];
      const userId = ctx.userId;
      const habitId = input.habitId;
      const supabase = ctx.supabaseAdmin;

      try {
        // 1. Verify habit exists, belongs to user, and is not archived
        const { data: habit, error: habitError } = await supabase
          .from('habits')
          .select('id, archived_at') // Check archived status
          .eq('id', habitId)
          .eq('user_id', userId)
          .single();

        if (habitError) {
          if (habitError.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: habitError.message });
        }
        if (habit.archived_at) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot toggle entry for an archived habit.' });
        }

        // 2. Check for existing entry for this date
        const { data: existingEntry, error: fetchEntryError } = await supabase
          .from('habit_entries')
          .select('id')
          .eq('user_id', userId)
          .eq('habit_id', habitId)
          .eq('date', entryDate)
          .maybeSingle(); // Use maybeSingle as entry might not exist

        if (fetchEntryError) {
           throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to check for existing entry.' });
        }

        let actionResult: { action: 'created' | 'deleted'; entryId: string; };

        if (existingEntry) {
          // 3a. Entry exists - Delete it
          const { error: deleteError } = await supabase
            .from('habit_entries')
            .delete()
            .eq('id', existingEntry.id);

          if (deleteError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete existing habit entry.' });
          }
          actionResult = { action: 'deleted', entryId: existingEntry.id };

        } else {
          // 3b. Entry doesn't exist - Create it
          const { data: newEntry, error: insertError } = await supabase
            .from('habit_entries')
            .insert({
              habit_id: habitId,
              user_id: userId,
              date: entryDate,
              quantity_value: input.quantity_value, // Use input or null/default
              notes: input.notes,
            })
            .select('id') // Select only the ID
            .single();

          if (insertError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create new habit entry.' });
          }
          actionResult = { action: 'created', entryId: newEntry.id };
        }

        // 4. Call streak update placeholder (always call after toggle)
        await calculateAndUpdateStreak(habitId, userId, entryDate, supabase);

        // 5. Return result
        return actionResult;

      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in toggleHabitEntry:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to toggle habit entry' });
      }
    })
 });