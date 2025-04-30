import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { User, AuthError } from '@supabase/supabase-js';
import { type Context } from '@/server/src/context';
import { TRPCError } from '@trpc/server';

// --- Common Response Type --- 
// Represents the core structure of Supabase Postgrest responses
export type MockablePostgrestResponse<T> = Promise<{
  data: T | null;
  error: any;
  count?: number | null; 
  status?: number;
  statusText?: string;
}>;

// --- Interface for CHAINABLE Query Builder methods --- 
// These methods return the builder itself to allow chaining.
export interface MockableQueryBuilder {
  select: (query?: string, options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }) => MockableQueryBuilder;
  eq: (column: string, value: any) => MockableQueryBuilder;
  neq: (column: string, value: any) => MockableQueryBuilder;
  gt: (column: string, value: any) => MockableQueryBuilder;
  gte: (column: string, value: any) => MockableQueryBuilder;
  lt: (column: string, value: any) => MockableQueryBuilder;
  lte: (column: string, value: any) => MockableQueryBuilder;
  like: (column: string, pattern: string) => MockableQueryBuilder;
  ilike: (column: string, pattern: string) => MockableQueryBuilder;
  is: (column: string, value: boolean | null) => MockableQueryBuilder;
  in: (column: string, values: any[]) => MockableQueryBuilder;
  contains: (column: string, value: any) => MockableQueryBuilder;
  containedBy: (column: string, value: any) => MockableQueryBuilder;
  rangeGt: (column: string, range: string) => MockableQueryBuilder;
  rangeGte: (column: string, range: string) => MockableQueryBuilder;
  rangeLt: (column: string, range: string) => MockableQueryBuilder;
  rangeLte: (column: string, range: string) => MockableQueryBuilder;
  rangeAdjacent: (column: string, range: string) => MockableQueryBuilder;
  overlaps: (column: string, value: any) => MockableQueryBuilder;
  textSearch: (column: string, query: string, options?: { config?: string; type?: 'plain' | 'phrase' | 'websearch' }) => MockableQueryBuilder;
  match: (query: Record<string, unknown>) => MockableQueryBuilder;
  not: (column: string, operator: string, value: any) => MockableQueryBuilder;
  or: (filters: string, options?: { referencedTable?: string }) => MockableQueryBuilder;
  filter: (column: string, operator: string, value: any) => MockableQueryBuilder;
  limit: (count: number, options?: { referencedTable?: string }) => MockableQueryBuilder;
  range: (from: number, to: number, options?: { referencedTable?: string }) => MockableQueryBuilder;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean; referencedTable?: string }) => MockableQueryBuilder;
}

// --- Interface for Operations on a Table (after .from()) --- 
// Inherits chainable methods AND adds terminal methods returning Promises.
export interface MockableTableOperations extends MockableQueryBuilder {
  // Terminal methods (return Promises)
  single: <T = any>() => MockablePostgrestResponse<T>;
  maybeSingle: <T = any>() => MockablePostgrestResponse<T>;
  // Note: Insert/Update/Upsert often return arrays in Supabase v2, but the *methods* return the builder
  insert: <T = any>(values: any | any[], options?: any) => MockableTableOperations; 
  upsert: <T = any>(values: any | any[], options?: any) => MockableTableOperations; 
  update: <T = any>(values: any, options?: any) => MockableTableOperations; 
  delete: (options?: any) => MockableTableOperations; 
}

// --- Interface for the Supabase Client itself --- 
/**
 * Represents the structure of the Supabase client that we need to mock.
 * `from` returns an object combining chainable and terminal methods.
 */
export interface MockableSupabaseClient {
  // `from` now returns the object with both chainable and terminal methods
  from: (relation: string) => MockableTableOperations;

  // Top-level client methods
  auth: {
    getUser: (
      jwt?: string
    ) => Promise<{ data: { user: User | null }; error: AuthError | null }>;
    // Add other auth methods here if needed by tests (e.g., signUp, signInWithPassword)
  };
  rpc: <T = any>(fn: string, params?: object, options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }) => MockablePostgrestResponse<T>;
  // Add storage interface here if needed by tests
  // storage: { ... };
}

// --- Mock Implementation --- 

// Create a deep mock instance conforming to the refined interface
export const mockSupabaseAdmin = mockDeep<MockableSupabaseClient>();

// Helper to reset mocks
export function resetSupabaseMocks() {
  // Use mockReset for better compatibility with jest-mock-extended
  mockReset(mockSupabaseAdmin);

  // --- Re-apply default implementations after reset --- 

  // Default: Successful authentication
  mockSupabaseAdmin.auth.getUser.mockResolvedValue({
    data: { user: { id: 'test-user-id', /* other user props */ } as User },
    error: null,
  });

  // Default: Successful RPC call returning null data
  mockSupabaseAdmin.rpc.mockResolvedValue({ 
      data: null, 
      error: null, 
      count: 0, 
      status: 200, 
      statusText: 'OK' 
  });

  // Helper type to create Promise-like chain-terminating objects
  type AsyncResult<T> = Promise<{ data: T | null; error: any; count?: number; status?: number; statusText?: string; }>;

  // Helper function to create a proper mock that handles both chaining AND awaiting
  function createMockWithPromiseCapability<T>(defaultData: T | null = null): any {
    const mockObj = mockDeep<MockableTableOperations>();
    
    // Add an implicit then handler that allows awaiting the mock directly
    // This is what Supabase's actual Query Builder does
    const defaultResponse = { 
      data: defaultData, 
      error: null, 
      count: defaultData && Array.isArray(defaultData) ? defaultData.length : 0,
      status: 200, 
      statusText: 'OK' 
    };
    
    // Allow the mock to be awaited directly
    (mockObj as any).then = jest.fn((onFulfill, onReject) => {
      return Promise.resolve(defaultResponse).then(onFulfill, onReject);
    });
    
    return mockObj;
  }

  // Default behavior for 'from': Return a mock that handles chaining and terminal methods
  mockSupabaseAdmin.from.mockImplementation((relation: string) => {
    // This inner mock needs to satisfy MockableTableOperations
    // AND be awaitable like a promise for terminal operations
    const innerMock = createMockWithPromiseCapability<any[]>([]);

    // --- Configure Default CHAINABLE Methods (Return Self) --- 
    innerMock.select.mockReturnValue(innerMock);
    innerMock.eq.mockReturnValue(innerMock);
    innerMock.neq.mockReturnValue(innerMock);
    innerMock.gt.mockReturnValue(innerMock);
    innerMock.gte.mockReturnValue(innerMock);
    innerMock.lt.mockReturnValue(innerMock);
    innerMock.lte.mockReturnValue(innerMock);
    innerMock.like.mockReturnValue(innerMock);
    innerMock.ilike.mockReturnValue(innerMock);
    innerMock.is.mockReturnValue(innerMock);
    innerMock.in.mockReturnValue(innerMock);
    innerMock.contains.mockReturnValue(innerMock);
    innerMock.containedBy.mockReturnValue(innerMock);
    innerMock.rangeGt.mockReturnValue(innerMock);
    innerMock.rangeGte.mockReturnValue(innerMock);
    innerMock.rangeLt.mockReturnValue(innerMock);
    innerMock.rangeLte.mockReturnValue(innerMock);
    innerMock.rangeAdjacent.mockReturnValue(innerMock);
    innerMock.overlaps.mockReturnValue(innerMock);
    innerMock.textSearch.mockReturnValue(innerMock);
    innerMock.match.mockReturnValue(innerMock);
    innerMock.not.mockReturnValue(innerMock);
    innerMock.or.mockReturnValue(innerMock);
    innerMock.filter.mockReturnValue(innerMock);
    innerMock.limit.mockReturnValue(innerMock);
    innerMock.range.mockReturnValue(innerMock);
    innerMock.order.mockReturnValue(innerMock);

    // --- Configure Default TERMINAL Methods --- 
    // For single-returning methods, default to null
    const singleResponse = { 
      data: null, 
      error: null, 
      status: 200, 
      statusText: 'OK' 
    };
    
    innerMock.single.mockResolvedValue(singleResponse);
    innerMock.maybeSingle.mockResolvedValue(singleResponse);
    
    // For insert/update/upsert operations, return the builder that can be chained further or awaited
    innerMock.insert.mockImplementation(() => {
      const insertMock = createMockWithPromiseCapability();
      insertMock.select.mockReturnValue(insertMock);
      return insertMock;
    });
    
    innerMock.upsert.mockImplementation(() => {
      const upsertMock = createMockWithPromiseCapability();
      upsertMock.select.mockReturnValue(upsertMock);
      return upsertMock;
    });
    
    innerMock.update.mockImplementation(() => {
      const updateMock = createMockWithPromiseCapability();
      updateMock.select.mockReturnValue(updateMock);
      return updateMock;
    });
    
    innerMock.delete.mockImplementation(() => {
      const deleteMock = createMockWithPromiseCapability();
      deleteMock.select.mockReturnValue(deleteMock);
      return deleteMock;
    });

    return innerMock;
  });
}

// Initialize mocks on first load
resetSupabaseMocks();

// --- Context Creation --- 

// Expand this type as more tables are tested
export type TableName = 
  | 'users' 
  | 'user_profiles' 
  | 'user_settings'
  | 'values'
  | 'principles'
  | 'goals' 
  | 'tasks'
  | 'habits'
  | 'habit_entries'
  | 'tracked_state_defs' 
  | 'state_entries'     
  | 'reminders'         
  | 'goal_progress_notes'
  | 'rewards'           
  | 'user_badges';       

/**
 * Creates a TRPC context with a mocked Supabase client.
 * Ensures the user is authenticated unless explicitly bypassed.
 */
export function createInnerTRPCContext(opts: {
  userId: string | null;
  supabase?: any; // Keep as any for simplicity
}): Context {
  if (!opts.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User must be authenticated to access this resource',
    });
  }

  return {
    userId: opts.userId,
    supabaseAdmin: opts.supabase || mockSupabaseAdmin,
  };
}

export function createTestContext(userId: string | null = 'test-user-id', supabase?: any) {
  return createInnerTRPCContext({
    userId,
    supabase,
  });
}

// Export mockDeep so it can be used directly in tests if needed
export { mockDeep };
