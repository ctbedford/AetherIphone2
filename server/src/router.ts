import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { supabaseAdmin, Context } from './context';

// Initialize tRPC with Supabase context
const t = initTRPC.context<Context>().create();

// Public procedure (no auth required)
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedures ensure user is authenticated
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { supabaseAdmin: ctx.supabaseAdmin, userId: ctx.userId } });
});

// Import individual routers
import { dashboardRouter } from './routers/dashboardRouter';
import { valueRouter } from './routers/valueRouter';
import { goalRouter } from './routers/goalRouter';
import { taskRouter } from './routers/taskRouter';
import { habitRouter } from './routers/habitRouter';
import { trackedStateRouter } from './routers/trackedStateRouter';
import { userRouter } from './routers/userRouter';
import { rewardsRouter } from './routers/rewardsRouter';

// Create the router with Supabase-backed procedures
export const appRouter = router({
  greeting: {
    hello: publicProcedure
      .input(z.object({ name: z.string().optional() }))
      .query(async ({ input }) => {
        return { greeting: `Hello ${input.name ?? 'world'}` };
      }),
    goodbye: publicProcedure
      .query(() => {
        return { greeting: 'Goodbye!' };
      }),
  },
  user: userRouter,
  dashboard: dashboardRouter,
  value: valueRouter,
  goal: goalRouter,
  task: taskRouter,
  habit: habitRouter,
  state: trackedStateRouter,
  rewards: rewardsRouter,
});

// Export type router type
export type AppRouter = typeof appRouter; 