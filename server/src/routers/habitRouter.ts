import { z } from "zod";
import { router, protectedProcedure } from "../router";
import { TRPCError } from "@trpc/server";

export const habitRouter = router({
  getHabits: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Fetch all habits for the user
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false });

        if (habitsError) throw habitsError;
        if (!habits) return [];

        // Compute today's date string for completed flag
        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch today's habit entries for completed flag
        const { data: habitEntriesToday, error: todayEntriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id')
          .eq('user_id', ctx.userId)
          .eq('entry_date', todayStr)
          .in('habit_id', habits.map(h => h.id));

        if (todayEntriesError) throw todayEntriesError;

        // Build map of completed habits for today
        const completedMap = (habitEntriesToday || []).reduce<Record<string, boolean>>((acc, entry) => {
          acc[entry.habit_id] = true;
          return acc;
        }, {});

        // Format habits with title and completed flag
        const formattedHabits = habits.map(h => ({
          ...h, // Keep other original fields
          title: h.name, // Map name to title
          completed: !!completedMap[h.id] // Add completed flag
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
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .select("*")
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
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        goal_frequency: z.number(),
        frequency_period: z.enum(["day", "week", "month"]),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .insert({
          user_id: ctx.userId,
          name: input.name,
          description: input.description,
          goal_frequency: input.goal_frequency,
          frequency_period: input.frequency_period,
          color: input.color,
          streak: 0,
          best_streak: 0
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  updateHabit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        goal_frequency: z.number().optional(),
        frequency_period: z.enum(["day", "week", "month"]).optional(),
        color: z.string().optional(),
        streak: z.number().optional(),
        best_streak: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First check if habit exists and belongs to user
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

      // Extract the id and update the remaining fields
      const { id, ...updateData } = input;

      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  deleteHabit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First check if habit exists and belongs to user
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

      // Delete all habit entries first (cascade delete would be better in the database)
      const { error: entriesError } = await ctx.supabaseAdmin
        .from("habit_entries")
        .delete()
        .eq("habit_id", input.id);

      if (entriesError) throw new TRPCError({ 
        code: "INTERNAL_SERVER_ERROR", 
        message: "Failed to delete habit entries" 
      });

      // Then delete the habit
      const { error } = await ctx.supabaseAdmin
        .from("habits")
        .delete()
        .eq("id", input.id);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { id: input.id };
    }),

  // Habit Entry procedures
  getHabitEntries: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First verify the habit belongs to the user
      const { data: habit, error: habitError } = await ctx.supabaseAdmin
        .from("habits")
        .select("id")
        .eq("id", input.habitId)
        .eq("user_id", ctx.userId)
        .single();

      if (habitError) throw new TRPCError({ 
        code: habitError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: "Habit not found or access denied" 
      });

      // Build query for habit entries
      let query = ctx.supabaseAdmin
        .from("habit_entries")
        .select("*")
        .eq("habit_id", input.habitId);

      // Add date range filters if provided
      if (input.startDate) {
        query = query.gte("date", input.startDate);
      }

      if (input.endDate) {
        query = query.lte("date", input.endDate);
      }

      const { data, error } = await query.order("date", { ascending: false });

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data || [];
    }),

  createHabitEntry: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        date: z.string(),
        completed: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the habit belongs to the user
      const { data: habit, error: habitError } = await ctx.supabaseAdmin
        .from("habits")
        .select("id")
        .eq("id", input.habitId)
        .eq("user_id", ctx.userId)
        .single();

      if (habitError) throw new TRPCError({ 
        code: habitError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: "Habit not found or access denied" 
      });

      // Insert or update the habit entry (upsert)
      const { data, error } = await ctx.supabaseAdmin
        .from("habit_entries")
        .upsert({
          habit_id: input.habitId,
          date: input.date,
          completed: input.completed,
          notes: input.notes
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      
      // Update streak if needed
      if (input.completed) {
        // Get current streak
        const { data: habitData } = await ctx.supabaseAdmin
          .from("habits")
          .select("streak, best_streak")
          .eq("id", input.habitId)
          .single();
          
        if (habitData) {
          const newStreak = (habitData.streak || 0) + 1;
          const bestStreak = Math.max(newStreak, habitData.best_streak || 0);
          
          await ctx.supabaseAdmin
            .from("habits")
            .update({ 
              streak: newStreak,
              best_streak: bestStreak
            })
            .eq("id", input.habitId);
        }
      }
      
      return data;
    }),

  updateHabitEntry: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        completed: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First get the habit entry to check ownership
      const { data: entry, error: fetchError } = await ctx.supabaseAdmin
        .from("habit_entries")
        .select("habit_id")
        .eq("id", input.id)
        .single();

      if (fetchError) throw new TRPCError({ 
        code: fetchError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: "Habit entry not found" 
      });

      // Verify the associated habit belongs to the user
      const { data: habit, error: habitError } = await ctx.supabaseAdmin
        .from("habits")
        .select("id")
        .eq("id", entry.habit_id)
        .eq("user_id", ctx.userId)
        .single();

      if (habitError) throw new TRPCError({ 
        code: "FORBIDDEN",
        message: "Access denied to this habit entry" 
      });

      // Extract the id and update the remaining fields
      const { id, ...updateData } = input;

      const { data, error } = await ctx.supabaseAdmin
        .from("habit_entries")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      
      // Update streak if needed and if completed status changed
      if ("completed" in input) {
        // Get habit details
        const { data: habitData } = await ctx.supabaseAdmin
          .from("habits")
          .select("streak, best_streak")
          .eq("id", entry.habit_id)
          .single();
          
        if (habitData) {
          if (input.completed) {
            const newStreak = (habitData.streak || 0) + 1;
            const bestStreak = Math.max(newStreak, habitData.best_streak || 0);
            
            await ctx.supabaseAdmin
              .from("habits")
              .update({ 
                streak: newStreak,
                best_streak: bestStreak
              })
              .eq("id", entry.habit_id);
          } else {
            // Reset streak if habit marked as not completed
            await ctx.supabaseAdmin
              .from("habits")
              .update({ streak: 0 })
              .eq("id", entry.habit_id);
          }
        }
      }
      
      return data;
    }),

  deleteHabitEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First get the habit entry to check ownership
      const { data: entry, error: fetchError } = await ctx.supabaseAdmin
        .from("habit_entries")
        .select("habit_id")
        .eq("id", input.id)
        .single();

      if (fetchError) throw new TRPCError({ 
        code: fetchError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: "Habit entry not found" 
      });

      // Verify the associated habit belongs to the user
      const { data: habit, error: habitError } = await ctx.supabaseAdmin
        .from("habits")
        .select("id")
        .eq("id", entry.habit_id)
        .eq("user_id", ctx.userId)
        .single();

      if (habitError) throw new TRPCError({ 
        code: "FORBIDDEN",
        message: "Access denied to this habit entry" 
      });

      // Delete the habit entry
      const { error } = await ctx.supabaseAdmin
        .from("habit_entries")
        .delete()
        .eq("id", input.id);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      
      return { id: input.id };
    }),
}); 