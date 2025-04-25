import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const valueRouter = router({
  getValues: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: values, error } = await ctx.supabaseAdmin
          .from('values')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return values;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch values',
        });
      }
    }),

  getValueById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: value, error } = await ctx.supabaseAdmin
          .from('values')
          .select('*')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!value) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found',
          });
        }

        return value;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch value',
        });
      }
    }),

  createValue: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: value, error } = await ctx.supabaseAdmin
          .from('values')
          .insert({
            name: input.name,
            description: input.description,
            color: input.color,
            icon: input.icon,
            user_id: ctx.userId,
          })
          .select()
          .single();

        if (error) throw error;
        return value;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create value',
        });
      }
    }),

  updateValue: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the value exists and belongs to user
        const { data: existingValue, error: fetchError } = await ctx.supabaseAdmin
          .from('values')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingValue) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found or you do not have permission to update it',
          });
        }

        // Update the value
        const { data: updatedValue, error } = await ctx.supabaseAdmin
          .from('values')
          .update({
            name: input.name,
            description: input.description,
            color: input.color,
            icon: input.icon,
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select()
          .single();

        if (error) throw error;
        return updatedValue;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update value',
        });
      }
    }),

  deleteValue: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the value exists and belongs to user
        const { data: existingValue, error: fetchError } = await ctx.supabaseAdmin
          .from('values')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingValue) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found or you do not have permission to delete it',
          });
        }

        // Delete the value
        const { error } = await ctx.supabaseAdmin
          .from('values')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete value',
        });
      }
    }),
}); 