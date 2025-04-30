import { z } from "zod";
import { router, protectedProcedure } from "../router";
import { TRPCError } from "@trpc/server";
import {
  createHabitInput,
  updateHabitInput,
  createHabitEntryInput,
  updateHabitEntryInput,
} from '../types/trpc-types';
import {
  differenceInCalendarDays,
  parseISO,
  format
} from 'date-fns'; // Need date-fns

const HABIT_FIELDS =
  'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, sort_order, streak, best_streak, created_at, updated_at';

const HABIT_ENTRY_FIELDS =
  'id, user_id, habit_id, date, completed, quantity_value, notes, created_at';

async function calculateAndUpdateStreak(habitId: string, userId: string, supabase: any): Promise<{ currentStreak: number, bestStreak: number }> {
  try {
    // Fetch all entries for the habit, ordered by date descending
    const { data: entries, error: entriesError } = await supabase
      .from('habit_entries')
      .select('date, completed') // Only need date and completed status
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (entriesError) {
      console.error(`Streak Calc Error: Failed to fetch entries for habit ${habitId}:`, entriesError);
      return { currentStreak: 0, bestStreak: 0 }; // Return 0 if entries can't be fetched
    }

    if (!entries || entries.length === 0) {
      // No entries, reset streak
      const { error: updateErr } = await supabase
        .from('habits')
        .update({ streak: 0 })
        .eq('id', habitId);
      if (updateErr) console.error(`Streak Calc Error: Failed to reset streak for habit ${habitId}`, updateErr);
      // Fetch best streak to return it accurately even if current is 0
      const { data: habitData } = await supabase.from('habits').select('best_streak').eq('id', habitId).single();
      return { currentStreak: 0, bestStreak: habitData?.best_streak || 0 };
    }

    let currentStreak = 0;
    const today = new Date();
    let expectedDate = today; // Start checking from today
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayEntry = entries.find((e: any) => e.date === todayStr);

    // Determine starting point for streak check
    if (todayEntry?.completed) {
      currentStreak = 1;
      expectedDate = new Date(today.setDate(today.getDate() - 1)); // Start checking from yesterday
    } else {
      const yesterday = new Date(); // Need a fresh date object
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      const yesterdayEntry = entries.find((e: any) => e.date === yesterdayStr);
      if (yesterdayEntry?.completed) {
        currentStreak = 1;
        expectedDate = new Date(yesterday.setDate(yesterday.getDate() - 1)); // Start checking from day before yesterday
      } else {
        currentStreak = 0;
        // No need to loop if streak is already 0 based on today/yesterday
      }
    }

    // Only loop if there's a potential streak > 0
    if (currentStreak > 0) {
      // Find index of the entry *before* the expectedDate (since we check backwards)
      let startIndex = entries.findIndex((e: any) => e.date === format(expectedDate, 'yyyy-MM-dd'));
      // If expected date wasn't found (e.g., yesterday was the start), adjust index
      if (startIndex === -1) {
        // Start from the entry after the one that established the initial streak (today or yesterday)
        const initialStreakDateStr = todayEntry?.completed ? todayStr : (format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd'));
        const initialEntryIndex = entries.findIndex((e: any) => e.date === initialStreakDateStr);
        startIndex = initialEntryIndex !== -1 ? initialEntryIndex + 1 : 0;
      }

      for (let i = startIndex; i < entries.length; i++) {
        const entry = entries[i];
        const entryDate = parseISO(entry.date);
        const expectedDateStr = format(expectedDate, 'yyyy-MM-dd');

        if (entry.date === expectedDateStr) {
          if (entry.completed) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1); // Move to check previous day
          } else {
            break; // Streak broken by uncompleted entry
          }
        } else {
          // Check if the date difference breaks the streak (allowing for gaps)
          const previousDate = i > 0 ? parseISO(entries[i - 1].date) : parseISO(entries[0].date);
          const dateDiff = differenceInCalendarDays(previousDate, entryDate);

          if (dateDiff > 1) {
            break; // Gap too large, streak broken
          }

          // If gap is 1 day, but this entry wasn't completed, streak is broken
          if (!entry.completed) {
            break;
          }

          // If gap is 1 day and completed, it doesn't continue the *current* consecutive sequence
          // but doesn't necessarily break it either (e.g., completed Mon, Wed - streak is 1 from Wed).
          // For simplicity, we break the loop here, assuming the *consecutive* streak from today/yesterday is what matters.
          // A more complex implementation could find the *longest* streak ending recently.
          break;
        }
      }
    }

    // Fetch current best_streak
    const { data: habitData, error: habitFetchError } = await supabase
      .from('habits')
      .select('best_streak')
      .eq('id', habitId)
      .single();

    if (habitFetchError) {
      console.error(`Streak Calc Error: Failed to fetch habit ${habitId} for best_streak:`, habitFetchError);
      // Fallback best streak if fetch fails
      const bestStreakFallback = Math.max(currentStreak, 0); 
      const { error: updateError } = await supabase
        .from('habits')
        .update({ streak: currentStreak, best_streak: bestStreakFallback })
        .eq('id', habitId);
      if (updateError) console.error(`Streak Calc Error: Failed to update streak (fallback) for habit ${habitId}:`, updateError);
      console.log(`Streak Updated (Fallback Best) for habit ${habitId}: Current=${currentStreak}, Best=${bestStreakFallback}`);
      return { currentStreak, bestStreak: bestStreakFallback };
    }

    const bestStreak = Math.max(currentStreak, habitData?.best_streak || 0);

    // Update the habit record
    const { error: updateError } = await supabase
      .from('habits')
      .update({ streak: currentStreak, best_streak: bestStreak })
      .eq('id', habitId);

    if (updateError) {
      console.error(`Streak Calc Error: Failed to update streak for habit ${habitId}:`, updateError);
    }

    console.log(`Streak Updated for habit ${habitId}: Current=${currentStreak}, Best=${bestStreak}`);
    return { currentStreak, bestStreak };

  } catch (error) {
    console.error(`Unexpected error calculating streak for habit ${habitId}:`, error);
    // Attempt to fetch best streak even on error
    const { data: habitData } = await supabase.from('habits').select('best_streak').eq('id', habitId).single();
    return { currentStreak: 0, bestStreak: habitData?.best_streak || 0 }; // Return 0 current streak on error
  }
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
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('habit_entries')
          .insert({ ...input, user_id: ctx.userId })
          .select(HABIT_ENTRY_FIELDS)
          .single();

        if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

        // Update streak after successful insert
        if (data) {
          await calculateAndUpdateStreak(input.habit_id, ctx.userId, ctx.supabaseAdmin);
        }

        return data;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create habit entry',
        });
      }
    }),

  updateHabitEntry: protectedProcedure
    .input(updateHabitEntryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const { data: habitEntry, error: fetchError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) throw new TRPCError({ 
          code: fetchError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: "Habit entry not found or access denied" 
        });

        const { data, error } = await ctx.supabaseAdmin
          .from('habit_entries')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId) // Ensure ownership
          .select(HABIT_ENTRY_FIELDS)
          .single();

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

        // Update streak after successful update
        if (data) {
          await calculateAndUpdateStreak(data.habit_id, ctx.userId, ctx.supabaseAdmin);
        }

        return data;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update habit entry',
        });
      }
    }),

  deleteHabitEntry: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Fetch habitId *before* deleting the entry
        const { data: entryToDelete, error: fetchError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id') // Fetch habit_id
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !entryToDelete) {
          throw new TRPCError({ 
            code: fetchError?.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Habit entry not found or access denied.' 
          });
        }

        const { habit_id: habitIdForStreak } = entryToDelete; // Store before delete

        // Perform delete
        const { error } = await ctx.supabaseAdmin
          .from('habit_entries')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId); // Ensure user owns the entry being deleted

        if (error) throw error; // Throw if delete fails

        // Update streak *after* successful delete
        if (habitIdForStreak) { // Check if we got the habitId
          await calculateAndUpdateStreak(habitIdForStreak, ctx.userId, ctx.supabaseAdmin);
        }

        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete habit entry',
        });
      }
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