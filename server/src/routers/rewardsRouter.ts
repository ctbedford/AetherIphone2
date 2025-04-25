import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { supabaseAdmin } from '../context';

// Corrected relative path
import { claimLootInput, awardBadgeInput } from '../types/trpc-types';

export const rewardsRouter = router({
  // Get all rewards for current user
  getUserRewards: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: rewards, error } = await ctx.supabaseAdmin
          .from('user_rewards')
          .select('*, rewards(*)')
          .eq('user_id', ctx.userId)
          .order('earned_at', { ascending: false });

        if (error) throw error;
        return rewards || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch user rewards',
        });
      }
    }),

  // Get available rewards that can be earned
  getAvailableRewards: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Get all rewards
        const { data: allRewards, error: rewardsError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('*')
          .order('required_points', { ascending: true });

        if (rewardsError) throw rewardsError;

        // Get already earned rewards
        const { data: earnedRewards, error: earnedError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .select('reward_id')
          .eq('user_id', ctx.userId);

        if (earnedError) throw earnedError;

        // Filter out already earned one-time rewards
        const earnedIds = new Set((earnedRewards || []).map(er => er.reward_id));
        const availableRewards = allRewards?.filter(reward => 
          !earnedIds.has(reward.id) || reward.can_earn_multiple);

        return availableRewards || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch available rewards',
        });
      }
    }),

  // Get user points
  getUserPoints: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: userProfile, error } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points, lifetime_points')
          .eq('id', ctx.userId)
          .single();

        if (error) throw error;
        return {
          points: userProfile?.points || 0,
          lifetimePoints: userProfile?.lifetime_points || 0,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch user points',
        });
      }
    }),

  // Earn a reward if eligible
  earnReward: protectedProcedure
    .input(claimLootInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the reward details
        const { data: reward, error: rewardError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('*')
          .eq('id', input.lootId)
          .single();

        if (rewardError || !reward) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Reward not found',
          });
        }

        // Check if user has enough points
        const { data: userProfile, error: profileError } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points')
          .eq('id', ctx.userId)
          .single();

        if (profileError || !userProfile) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user profile',
          });
        }

        if (userProfile.points < reward.required_points) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough points to earn this reward',
          });
        }

        // If the reward is one-time, check if already earned
        if (!reward.can_earn_multiple) {
          const { data: existingReward, error: existingError } = await ctx.supabaseAdmin
            .from('user_rewards')
            .select('id')
            .eq('user_id', ctx.userId)
            .eq('reward_id', input.lootId)
            .single();

          if (existingReward) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'You have already earned this one-time reward',
            });
          }
        }

        // Begin transaction
        // 1. Deduct points from user
        const { error: updateError } = await ctx.supabaseAdmin
          .from('profiles')
          .update({
            points: userProfile.points - reward.required_points,
          })
          .eq('id', ctx.userId);

        if (updateError) throw updateError;

        // 2. Add reward to user's earned rewards
        const { data: userReward, error: insertError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .insert({
            user_id: ctx.userId,
            reward_id: input.lootId,
            earned_at: new Date().toISOString(),
            points_spent: reward.required_points,
          })
          .select()
          .single();

        if (insertError) {
          // Rollback points if adding reward failed
          await ctx.supabaseAdmin
            .from('profiles')
            .update({
              points: userProfile.points,
            })
            .eq('id', ctx.userId);

          throw insertError;
        }

        return {
          success: true,
          reward: userReward,
          remainingPoints: userProfile.points - reward.required_points,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to earn reward',
        });
      }
    }),

  // Award points to user (e.g., for completing habits, tasks)
  awardPoints: protectedProcedure
    .input(awardBadgeInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current user points
        const { data: userProfile, error: profileError } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points, lifetime_points')
          .eq('id', ctx.userId)
          .single();

        if (profileError || !userProfile) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user profile',
          });
        }

        // Get badge details
        const { data: badge, error: badgeError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('*')
          .eq('id', input.badgeId)
          .eq('type', 'badge')
          .single();

        if (badgeError || !badge) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Badge not found',
          });
        }

        // Default points to award
        const pointsToAward = 10;
        const currentPoints = userProfile.points || 0;
        const lifetimePoints = userProfile.lifetime_points || 0;
        const newPoints = currentPoints + pointsToAward;
        const newLifetimePoints = lifetimePoints + pointsToAward;

        // Update user points
        const { error: updateError } = await ctx.supabaseAdmin
          .from('profiles')
          .update({
            points: newPoints,
            lifetime_points: newLifetimePoints,
          })
          .eq('id', ctx.userId);

        if (updateError) throw updateError;

        // Record the point transaction
        const { data: pointTransaction, error: transactionError } = await ctx.supabaseAdmin
          .from('point_transactions')
          .insert({
            user_id: ctx.userId,
            points: pointsToAward,
            reason: `Earned badge: ${badge.name}`,
            source_type: 'badge',
            source_id: input.badgeId,
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Add badge to user's earned rewards
        const { data: userBadge, error: badgeInsertError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .insert({
            user_id: ctx.userId,
            reward_id: input.badgeId,
            reward_type: 'badge',
            earned_at: new Date().toISOString(),
            points_spent: 0, // Badges don't cost points
          })
          .select()
          .single();

        if (badgeInsertError) throw badgeInsertError;

        return {
          success: true,
          previousPoints: currentPoints,
          newPoints,
          pointsAdded: pointsToAward,
          transaction: pointTransaction,
          badge: userBadge,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to award badge',
        });
      }
    }),

  // Get point transaction history
  getPointHistory: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      cursor: z.string().optional(), // for pagination
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('point_transactions')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(input.limit);
          
        // Handle cursor-based pagination
        if (input.cursor) {
          query = query.lt('created_at', input.cursor);
        }
        
        const { data: transactions, error } = await query;

        if (error) throw error;
        
        // Determine if there are more results
        const lastItem = transactions && transactions.length > 0 
          ? transactions[transactions.length - 1] 
          : null;
          
        return {
          items: transactions || [],
          nextCursor: lastItem?.created_at,
          hasMore: (transactions?.length || 0) === input.limit,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch point history',
        });
      }
    }),
}); 