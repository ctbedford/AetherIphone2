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
  'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, sort_order, streak, best_streak, created_at, updated_at';

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

  getHabitEntriesForHabit: protectedProcedure
    .input(z.object({ habitId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // TODO: Implement logic to fetch habit entries for a specific habit
      console.log(`Fetching entries for habit: ${input.habitId}, user: ${ctx.userId}`);
      // Example fetch:
      // const { data, error } = await ctx.supabaseAdmin
      //   .from('habit_entries')
      //   .select(HABIT_ENTRY_FIELDS)
      //   .eq('habit_id', input.habitId)
      //   .eq('user_id', ctx.userId)
      //   .order('date', { ascending: false });
      // if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      // return data || [];
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Not implemented yet' });
    }),

  createHabitEntry: protectedProcedure
    .input(createHabitEntryInput)
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement creation logic
      console.log(`Creating habit entry for habit: ${input.habit_id}, date: ${input.date}`);
      // Example insert:
      // const { data, error } = await ctx.supabaseAdmin
      //   .from('habit_entries')
      //   .insert({ ...input, user_id: ctx.userId })
      //   .select(HABIT_ENTRY_FIELDS)
      //   .single();
      // if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      // await calculateAndUpdateStreak(input.habit_id, ctx.userId, input.date, ctx.supabaseAdmin);
      // return data;
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Not implemented yet' });
    }),

  updateHabitEntry: protectedProcedure
    .input(updateHabitEntryInput)
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement update logic
      const { id, ...updateData } = input;
      console.log(`Updating habit entry: ${id}`);
      // Example update:
      // const { data, error } = await ctx.supabaseAdmin
      //   .from('habit_entries')
      //   .update(updateData)
      //   .eq('id', id)
      //   .eq('user_id', ctx.userId) // Ensure ownership
      //   .select(HABIT_ENTRY_FIELDS)
      //   .single();
      // if (error) {
      //   if (error.code === 'PGRST116') throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit entry not found' });
      //   throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      // }
      // if (data?.habit_id && data?.date) {
      //   await calculateAndUpdateStreak(data.habit_id, ctx.userId, data.date, ctx.supabaseAdmin);
      // }
      // return data;
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Not implemented yet' });
    }),

  deleteHabitEntry: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement deletion logic and fetch habitId/date before delete for streak update
      console.log(`Deleting habit entry: ${input.id}`);
      // Example delete:
      // const { data: entryToDelete, error: fetchError } = await ctx.supabaseAdmin
      //   .from('habit_entries')
      //   .select('habit_id, date')
      //   .eq('id', input.id)
      //   .eq('user_id', ctx.userId)
      //   .single();
      // if (fetchError) {
      //   if (fetchError.code === 'PGRST116') throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit entry not found' });
      //   throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: fetchError.message });
      // }
      // const { error } = await ctx.supabaseAdmin
      //   .from('habit_entries')
      //   .delete()
      //   .eq('id', input.id)
      //   .eq('user_id', ctx.userId);
      // if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      // if (entryToDelete?.habit_id && entryToDelete?.date) {
      //   await calculateAndUpdateStreak(entryToDelete.habit_id, ctx.userId, entryToDelete.date, ctx.supabaseAdmin);
      // }
      // return { id: input.id };
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Not implemented yet' });
    }),

  toggleHabitEntry: protectedProcedure
    .input(z.object({ habitId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement logic to find if entry exists for habitId/date/userId.
      // If exists, delete it.
      // If not exists, create it (need default values for boolean/quantity type).
      // Call calculateAndUpdateStreak after create/delete.
      console.log(`Toggling habit entry for habit: ${input.habitId}, date: ${input.date}`);
      // Example logic:
      // const { data: existingEntry, error: findError } = await ctx.supabaseAdmin
      //   .from('habit_entries')
      //   .select('id')
      //   .eq('habit_id', input.habitId)
      //   .eq('user_id', ctx.userId)
      //   .eq('date', input.date)
      //   .maybeSingle();
      // if (findError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: findError.message });

      // if (existingEntry) {
      //   // Delete existing
      //   const { error: deleteError } = await ctx.supabaseAdmin.from('habit_entries').delete().eq('id', existingEntry.id);
      //   if (deleteError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: deleteError.message });
      //   await calculateAndUpdateStreak(input.habitId, ctx.userId, input.date, ctx.supabaseAdmin);
      //   return { status: 'deleted', habitId: input.habitId, date: input.date };
      // } else {
      //   // Create new
      //   // Need to know habit type to set default 'completed' or 'quantity_value'
      //   const { data: newEntry, error: createError } = await ctx.supabaseAdmin
      //     .from('habit_entries')
      //     .insert({ habit_id: input.habitId, user_id: ctx.userId, date: input.date, completed: true /* or quantity_value: default */ })
      //     .select(HABIT_ENTRY_FIELDS)
      //     .single();
      //   if (createError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: createError.message });
      //   await calculateAndUpdateStreak(input.habitId, ctx.userId, input.date, ctx.supabaseAdmin);
      //   return { status: 'created', entry: newEntry };
      // }
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Not implemented yet' });
    }),
});