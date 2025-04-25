import { createTRPCReact } from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

// Import the real AppRouter type from our server
import { type AppRouter } from '../server/src/router';

// Import types using the updated path
import { RouterInputs as TypedRouterInputs, RouterOutputs as TypedRouterOutputs } from '../server/src/types/trpc-types';

/**
 * tRPC React client
 * The client for consuming your tRPC API from React components
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Inference helpers for input/output types
 * Use the pre-defined types from trpc-types.ts
 */
export type RouterInputs = TypedRouterInputs;
export type RouterOutputs = TypedRouterOutputs; 