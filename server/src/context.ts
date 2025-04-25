import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import dotenv from 'dotenv';

// Load environment variables from ./server/.env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Add checks to ensure variables are loaded
if (!supabaseUrl) {
    console.log('Attempting Supabase init. URL found: No'); // Keep log here
    throw new Error('Missing environment variable: SUPABASE_URL in server/.env');
}
if (!supabaseServiceKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY in server/.env');
}

console.log('Attempting Supabase init. URL found: Yes'); // Log success

// Initialize Supabase Admin client
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
  }
);

// Context passed to all tRPC resolvers
export interface Context {
  supabaseAdmin: typeof supabaseAdmin;
  userId: string;
}

// Build context from incoming request
export async function createContext({ req }: { req: any }): Promise<Context> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Authorization header' });
  }

  // Validate JWT and get user
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: error?.message || 'Invalid token' });
  }

  return {
    supabaseAdmin,
    userId: data.user.id,
  };
} 