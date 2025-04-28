import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin } from '../test-helpers';
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
      // Mock data for habits
      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Morning Run',
          streak: 3,
          best_streak: 5,
          created_at: '2024-04-20T12:00:00Z'
        }
      ];

      // Mock data for goals
      const mockGoals = [
        {
          id: 'goal-1',
          name: 'Learn TypeScript',
          progress: 0.5,
          created_at: '2024-04-15T10:00:00Z'
        }
      ];

      // Mock data for tasks
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Complete TypeScript course',
          status: 'in-progress',
          due: '2024-05-01T00:00:00Z',
          goal_id: 'goal-1',
          priority: 2
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

      // Setup mock responses
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        if (table === 'habits') {
          return {
            ...mockSupabaseAdmin,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnValue({ 
              data: mockHabits, 
              error: null 
            }),
          };
        }
        if (table === 'goals') {
          return {
            ...mockSupabaseAdmin,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnValue({ 
              data: mockGoals, 
              error: null 
            }),
          };
        }
        if (table === 'tasks') {
          return {
            ...mockSupabaseAdmin,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnValue({ 
              data: mockTasks, 
              error: null 
            }),
          };
        }
        if (table === 'tracked_state_defs') {
          return {
            ...mockSupabaseAdmin,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnValue({ 
              data: mockTrackedStates, 
              error: null 
            }),
          };
        }
        if (table === 'habit_entries') {
          return {
            ...mockSupabaseAdmin,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnValue({ 
              data: mockHabitEntries, 
              error: null 
            }),
          };
        }
        return mockSupabaseAdmin;
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

      // Verify limits were passed correctly
      expect(mockSupabaseAdmin.limit).toHaveBeenCalledWith(5); // Default habit limit
      expect(mockSupabaseAdmin.limit).toHaveBeenCalledWith(10); // Default task limit
    });

    it('should fetch dashboard data with custom limits', async () => {
      // Setup similar mocks as the previous test
      // Simplified for brevity
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        return {
          ...mockSupabaseAdmin,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          neq: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnValue({ 
            data: [], 
            error: null 
          }),
        };
      });

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
