import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin, MockableTableOperations } from '../test-helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';

// Using mockSupabaseAdmin from test-helpers

// Type for database table names to avoid 'any' parameter type errors
type TableName = 'tasks' | 'goals' | 'habits' | 'habit_entries' | 'tracked_state_defs' | string;

/**
 * Create a test tRPC caller with proper context
 */
function createTestCaller(userId: string | null = 'test-user-id') {
  const ctx = createInnerTRPCContext({
    userId,
    supabase: mockSupabaseAdmin,
  });
  return appRouter.createCaller(ctx);
}

describe('dashboardRouter', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('should fetch dashboard data with default limits', async () => {
      // Mock data for habits aligned with updated schema
      const mockHabits = [
        {
          id: 'habit-1',
          user_id: 'test-user-id',
          title: 'Morning Run',
          cue: 'Wake up',
          routine: 'Go for a jog',
          reward: 'Coffee',
          streak: 3,
          best_streak: 5,
          created_at: '2024-04-20T12:00:00Z',
          updated_at: '2024-04-20T12:00:00Z'
        }
      ];

      // Mock data for goals aligned with updated schema
      const mockGoals = [
        {
          id: 'goal-1',
          user_id: 'test-user-id',
          title: 'Learn TypeScript',
          description: 'Master TypeScript for web development',
          progress: 0.5,
          target_date: '2024-06-01T00:00:00Z',
          created_at: '2024-04-15T10:00:00Z',
          updated_at: '2024-04-15T10:00:00Z'
        }
      ];

      // Mock data for tasks aligned with updated schema
      const mockTasks = [
        {
          id: 'task-1',
          user_id: 'test-user-id',
          title: 'Complete TypeScript course',
          notes: 'Focus on advanced types',
          status: 'in-progress',
          priority: 2,
          due: '2024-05-01T00:00:00Z',
          goal_id: 'goal-1',
          created_at: '2024-04-20T12:00:00Z',
          updated_at: '2024-04-20T12:00:00Z'
        }
      ];

      // Mock data for tracked states
      const mockTrackedStates: any[] = [];

      // Mock habit entries
      const mockHabitEntries = [
        {
          habit_id: 'habit-1',
          completed: true
        }
      ];

      // Create typed mock objects for each table, using our helper from test-helpers.ts
      function createTableMockWithData<T>(data: T) {
        const mock = mockDeep<MockableTableOperations>();
        
        // Configure chainable methods to return this (for method chaining)
        mock.select.mockReturnThis();
        mock.eq.mockReturnThis();
        mock.is.mockReturnThis();
        mock.neq.mockReturnThis();
        mock.or.mockReturnThis();
        mock.in.mockReturnThis();
        mock.order.mockReturnThis();
        mock.limit.mockReturnThis();
        
        // Make the mock awaitable with the provided data
        // Using a proper Promise interface implementation
        const response = { data, error: null, status: 200 };
        const mockPromise = Promise.resolve(response);
        
        // Add then/catch/finally methods to make the mock awaitable
        (mock as any).then = mockPromise.then.bind(mockPromise);
        (mock as any).catch = mockPromise.catch.bind(mockPromise);
        (mock as any).finally = mockPromise.finally.bind(mockPromise);
        
        return mock;
      }
      
      // Create mocks with the appropriate data
      const habitsTableMock = createTableMockWithData(mockHabits);
      const goalsTableMock = createTableMockWithData(mockGoals);
      const tasksTableMock = createTableMockWithData(mockTasks);
      const trackedStatesTableMock = createTableMockWithData(mockTrackedStates);
      const habitEntriesTableMock = createTableMockWithData(mockHabitEntries);

      // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        if (table === 'habits') return habitsTableMock;
        if (table === 'goals') return goalsTableMock;
        if (table === 'tasks') return tasksTableMock;
        if (table === 'tracked_state_defs') return trackedStatesTableMock;
        if (table === 'habit_entries') return habitEntriesTableMock;
        
        // Default fallback - empty result mock
        return createTableMockWithData([]);
      });

      const caller = createTestCaller();
      const result = await caller.dashboard.getDashboardData();

      // Verify the result structure
      expect(result).toHaveProperty('habits');
      expect(result).toHaveProperty('goals');
      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('trackedStates');

      // Verify habits were formatted correctly
      expect(result.habits[0]).toEqual(expect.objectContaining({
        id: 'habit-1',
        title: 'Morning Run',
        streak: 3,
        completed: true
      }));

      // Verify goals were formatted correctly
      expect(result.goals[0]).toEqual(expect.objectContaining({
        id: 'goal-1',
        title: 'Learn TypeScript',
        progress: 0.5
      }));

      // Verify limits were passed correctly - now targeting the specific table mocks
      expect(habitsTableMock.limit).toHaveBeenCalledWith(5); // Default habit limit
      expect(tasksTableMock.limit).toHaveBeenCalledWith(10); // Default task limit
    });

    it('should fetch dashboard data with custom limits', async () => {
      // Create typed mock objects for each table
      const habitsTableMock = mockDeep<MockableTableOperations>();
      const goalsTableMock = mockDeep<MockableTableOperations>();
      const tasksTableMock = mockDeep<MockableTableOperations>();
      const trackedStatesTableMock = mockDeep<MockableTableOperations>();
      const habitEntriesTableMock = mockDeep<MockableTableOperations>();

      // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        if (table === 'habits') return habitsTableMock;
        if (table === 'goals') return goalsTableMock;
        if (table === 'tasks') return tasksTableMock;
        if (table === 'tracked_state_defs') return trackedStatesTableMock;
        if (table === 'habit_entries') return habitEntriesTableMock;
        
        // Default case - should not happen in this test
        return mockDeep<MockableTableOperations>();
      });

      // No need to configure these mocks further - they already have their Promise behavior set
      // through the createTableMockWithData function with proper awaitable responses

      // Add specific behaviors needed for tasks
      tasksTableMock.neq.mockReturnThis();
      tasksTableMock.or.mockReturnThis();

      const caller = createTestCaller();
      await caller.dashboard.getDashboardData({
        habitLimit: 10,
        goalLimit: 15,
        taskLimit: 20
      });

      // Verify the custom limits were passed
      expect(mockSupabaseAdmin.limit).toHaveBeenCalledWith(10); // Custom habit limit
      expect(mockSupabaseAdmin.limit).toHaveBeenCalledWith(15); // Custom goal limit
      expect(mockSupabaseAdmin.limit).toHaveBeenCalledWith(20); // Custom task limit
    });

    it('should handle database errors properly', async () => {
      // Setup mock to simulate a database error
      mockSupabaseAdmin.from.mockImplementation(() => {
        return {
          ...mockSupabaseAdmin,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnValue({ 
            data: null, 
            error: { 
              message: 'Database error', 
              code: '42P01' // Table doesn't exist
            } 
          }),
        };
      });

      const caller = createTestCaller();
      
      // Expect the call to throw an INTERNAL_SERVER_ERROR
      await expect(caller.dashboard.getDashboardData()).rejects.toThrow(TRPCError);
    });

    it('should throw unauthorized error if no user is authenticated', async () => {
      const caller = createTestCaller(null);
      
      // Expect the call to throw an UNAUTHORIZED error
      await expect(caller.dashboard.getDashboardData()).rejects.toThrow(TRPCError);
    });
  });
});
