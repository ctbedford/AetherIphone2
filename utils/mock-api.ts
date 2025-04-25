import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Initialize tRPC for our mock API
const t = initTRPC.create();

// Export a procedure builder
const router = t.router;
const publicProcedure = t.procedure;

// Example router with some procedures
export const appRouter = router({
  greeting: {
    hello: publicProcedure
      .input(z.object({ name: z.string().optional() }))
      .query(({ input }) => {
        return {
          greeting: `Hello ${input.name ?? 'world'}`,
        };
      }),
    goodbye: publicProcedure
      .query(() => {
        return {
          greeting: 'Goodbye!',
        };
      }),
  },
  user: {
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        return {
          id: input.id,
          name: 'Mock User',
        };
      }),
    list: publicProcedure
      .query(() => {
        return [
          { id: '1', name: 'Mock User 1' },
          { id: '2', name: 'Mock User 2' },
        ];
      }),
  },
  auth: {
    refreshToken: publicProcedure
      .input(z.object({ refreshToken: z.string() }))
      .mutation(async ({ input }) => {
        console.log('Mock API: refreshToken called with', input.refreshToken);
        // Simulate checking refresh token and issuing new ones
        await new Promise(resolve => setTimeout(resolve, 300));
        if (input.refreshToken === 'valid-refresh-token') { // Example valid token
          return {
            accessToken: `mock-access-${Date.now()}`,
            refreshToken: `mock-refresh-${Date.now()}`,
          };
        } else {
          // Throw error for invalid refresh token
          throw new Error('Invalid refresh token'); 
        }
      }),
    // Add login/logout mutations here later
  },
  item: {
    add: publicProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input }) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real backend, save to DB
        console.log('Mock API: Adding item', input);
        return {
          id: Math.random().toString(36).substring(7), // Generate random ID
          name: input.name,
          status: 'added'
        };
      }),
  },
});

// Export type router type
export type AppRouter = typeof appRouter; 