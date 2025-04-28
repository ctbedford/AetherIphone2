import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .select('id, username, avatar_url, full_name, bio, time_zone, onboarding_completed, created_at, updated_at')
        .eq('id', ctx.userId)
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  updateProfile: protectedProcedure
    .input(z.object({
      full_name: z.string().optional(),
      avatar_url: z.string().optional(),
      theme: z.string().optional(),
      time_zone: z.string().optional(),
      display_name: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  getUserSettings: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('user_settings')
        .select('id, user_id, notification_preferences, ui_preferences')
        .eq('user_id', ctx.userId)
        .single();
        
      if (error) {
        // If settings don't exist, create default settings
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: createError } = await ctx.supabaseAdmin
            .from('user_settings')
            .insert({
              user_id: ctx.userId,
              notification_preferences: {
                email: true,
                push: true,
                task_reminders: true,
                goal_updates: true,
                habit_reminders: true
              },
              ui_preferences: {
                theme: 'system',
                compact_view: false,
                show_completed_tasks: true
              }
            })
            .select()
            .single();
            
          if (createError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: createError.message });
          return newSettings;
        }
        
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }
      
      return data;
    }),
    
  updateUserSettings: protectedProcedure
    .input(z.object({
      notification_preferences: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        task_reminders: z.boolean().optional(),
        goal_updates: z.boolean().optional(),
        habit_reminders: z.boolean().optional()
      }).optional(),
      ui_preferences: z.object({
        theme: z.string().optional(),
        compact_view: z.boolean().optional(),
        show_completed_tasks: z.boolean().optional()
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // First check if settings exist
      const { data: existingSettings, error: fetchError } = await ctx.supabaseAdmin
        .from('user_settings')
        .select('id')
        .eq('user_id', ctx.userId)
        .single();
        
      if (fetchError && fetchError.code === 'PGRST116') {
        // Create settings if they don't exist
        const defaultSettings = {
          user_id: ctx.userId,
          notification_preferences: {
            email: true,
            push: true,
            task_reminders: true,
            goal_updates: true,
            habit_reminders: true,
            ...input.notification_preferences
          },
          ui_preferences: {
            theme: 'system',
            compact_view: false,
            show_completed_tasks: true,
            ...input.ui_preferences
          }
        };
        
        const { data, error } = await ctx.supabaseAdmin
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      } else if (fetchError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: fetchError.message });
      }
      
      // Update existing settings
      const { data, error } = await ctx.supabaseAdmin
        .from('user_settings')
        .update(input)
        .eq('user_id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  getOnboardingStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .select('id, onboarding_completed')
        .eq('id', ctx.userId)
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { onboardingCompleted: data?.onboarding_completed || false };
    }),
    
  completeOnboarding: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { success: true };
    }),
}); 