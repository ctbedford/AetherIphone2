import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin } from '../test-helpers';
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';

// Type for database table names to avoid 'any' parameter type errors
type TableName = 'tasks' | 'goals' | 'habits' | 'habit_entries' | 'goal_progress_snapshots' | string;

// Using mockSupabaseAdmin from test-helpers

// Helper function to create test context
function createTestContext(userId: string | null = 'test-user-id') {
  return createInnerTRPCContext({
    userId,
    supabase: mockSupabaseAdmin,
  });
}

// Create test caller with context
function createTestCaller(userId: string | null = 'test-user-id') {
  const ctx = createTestContext(userId);
  return appRouter.createCaller(ctx);
}

describe('dashboardRouter.getWeeklyProgress', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should fetch weekly progress with default parameters', async () => {
    // Setup mock data
    const habits = [
      { id: 'habit-1', name: 'Morning Run', frequency: 'daily', streak: 5, best_streak: 10 },
      { id: 'habit-2', name: 'Meditation', frequency: 'daily', streak: 3, best_streak: 7 },
    ];

    const habitEntries = [
      { id: 'entry-1', habit_id: 'habit-1', date: '2025-04-25', completed: true, habits: { id: 'habit-1', name: 'Morning Run', frequency: 'daily' } },
      { id: 'entry-2', habit_id: 'habit-1', date: '2025-04-26', completed: true, habits: { id: 'habit-1', name: 'Morning Run', frequency: 'daily' } },
      { id: 'entry-3', habit_id: 'habit-2', date: '2025-04-25', completed: false, habits: { id: 'habit-2', name: 'Meditation', frequency: 'daily' } },
    ];

    const completedTasks = [
      { id: 'task-1', title: 'Complete report', status: 'completed', updated_at: '2025-04-25T10:00:00Z', goal_id: 'goal-1' },
      { id: 'task-2', title: 'Send email', status: 'completed', updated_at: '2025-04-26T14:30:00Z', goal_id: null },
    ];

    const goalSnapshots = [
      { goal_id: 'goal-1', progress: 0.3, created_at: '2025-04-21T08:00:00Z' },
      { goal_id: 'goal-1', progress: 0.5, created_at: '2025-04-27T08:00:00Z' },
    ];

    // Setup mock returns for different table queries
    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      if (table === 'habits') {
        return {
          ...mockSupabaseAdmin,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnValue({ data: habits, error: null }),
        };
      }

      if (table === 'habit_entries') {
        return {
          ...mockSupabaseAdmin,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnValue({ data: habitEntries, error: null }),
        };
      }

      if (table === 'tasks') {
        // Define a count mock that can be called later
        const countMock = jest.fn().mockReturnValue({ count: 10, error: null });
        
        // Return an object with all the needed methods
        return {
          ...mockSupabaseAdmin,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          count: countMock,
          order: jest.fn().mockReturnValue({ data: completedTasks, error: null }),
        };
      }

      if (table === 'goal_progress_snapshots') {
        return {
          ...mockSupabaseAdmin,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnValue({ data: goalSnapshots, error: null }),
        };
      }

      return mockSupabaseAdmin;
    });

    const caller = createTestCaller();
    const result = await caller.dashboard.getWeeklyProgress();

    // Verify structure of response
    expect(result).toHaveProperty('dailyProgress');
    expect(result).toHaveProperty('overallMetrics');
    expect(result).toHaveProperty('habitStreaks');
    expect(result).toHaveProperty('goalProgress');
    expect(result).toHaveProperty('dateRange');

    // Verify dates are processed correctly
    expect(result.dateRange.days.length).toBe(7); // Default is 7 days

    // Verify habit data is formatted correctly
    expect(result.habitStreaks).toContainEqual({
      id: 'habit-1',
      name: 'Morning Run',
      currentStreak: 5,
      bestStreak: 10,
    });

    // Verify goal progress is calculated correctly
    expect(result.goalProgress).toContainEqual(expect.objectContaining({
      goalId: 'goal-1',
      progressChange: 0.2, // 0.5 - 0.3
    }));
  });

  it('should handle custom date ranges', async () => {
    // Setup minimal mock data for this test
    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      return {
        ...mockSupabaseAdmin,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue({ data: [], error: null }),
      };
    });

    const caller = createTestCaller();
    const result = await caller.dashboard.getWeeklyProgress({ daysToInclude: 14 });

    // Verify date range is correct
    expect(result.dateRange.days.length).toBe(14);
  });

  it('should handle raw data inclusion when requested', async () => {
    // Setup minimal mock data
    const habitEntries = [
      { id: 'entry-1', habit_id: 'habit-1', date: '2025-04-25', completed: true },
    ];

    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      if (table === 'habit_entries') {
        return {
          ...mockSupabaseAdmin,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnValue({ data: habitEntries, error: null }),
        };
      }
      return {
        ...mockSupabaseAdmin,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue({ data: [], error: null }),
      };
    });

    const caller = createTestCaller();
    const result = await caller.dashboard.getWeeklyProgress({ includeRawData: true });

    // Find the day that should have entries
    const dayWithData = result.dailyProgress.find(day => day.date === '2025-04-25');
    
    // Verify raw data is included
    expect(dayWithData).toHaveProperty('habitEntries');
    expect(dayWithData?.habitEntries).toHaveLength(1);
  });

  it('should handle database errors properly', async () => {
    // Mock database error
    mockSupabaseAdmin.from.mockImplementation(() => {
      return {
        ...mockSupabaseAdmin,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue({ 
          data: null, 
          error: { message: 'Database error', code: '42P01' } 
        }),
      };
    });

    const caller = createTestCaller();
    
    // Expect the proper error to be thrown
    await expect(caller.dashboard.getWeeklyProgress()).rejects.toThrow(TRPCError);
  });

  it('should throw an error when user is not authenticated', async () => {
    const caller = createTestCaller(null);
    
    // Expect an unauthorized error
    await expect(caller.dashboard.getWeeklyProgress()).rejects.toThrow(TRPCError);
  });
});
