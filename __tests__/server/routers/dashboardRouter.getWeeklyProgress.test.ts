import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin, MockableTableOperations } from '../test-helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
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

    // Create typed mock objects for each table
    const habitsTableMock = mockDeep<MockableTableOperations>();
    const habitEntriesTableMock = mockDeep<MockableTableOperations>();
    const tasksTableMock = mockDeep<MockableTableOperations>();
    const goalSnapshotsTableMock = mockDeep<MockableTableOperations>();

    // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      if (table === 'habits') return habitsTableMock;
      if (table === 'habit_entries') return habitEntriesTableMock;
      if (table === 'tasks') return tasksTableMock;
      if (table === 'goal_progress_snapshots') return goalSnapshotsTableMock;
      
      // Default case - should not happen in this test
      return mockDeep<MockableTableOperations>();
    });

    // Configure each table mock's behavior
    // Habits table
    habitsTableMock.select.mockReturnThis();
    habitsTableMock.eq.mockReturnThis();
    habitsTableMock.order.mockReturnThis();
    habitsTableMock.limit.mockResolvedValue({ data: habits, error: null });

    // Habit entries table
    habitEntriesTableMock.select.mockReturnThis();
    habitEntriesTableMock.eq.mockReturnThis();
    habitEntriesTableMock.gte.mockReturnThis();
    habitEntriesTableMock.lte.mockReturnThis();
    habitEntriesTableMock.order.mockResolvedValue({ data: habitEntries, error: null });

    // Tasks table
    tasksTableMock.select.mockReturnThis();
    tasksTableMock.eq.mockReturnThis();
    tasksTableMock.gte.mockReturnThis();
    tasksTableMock.lte.mockReturnThis();
    // Add count method mock
    tasksTableMock.count.mockResolvedValue({ count: 10, error: null });
    tasksTableMock.order.mockResolvedValue({ data: completedTasks, error: null });

    // Goal progress snapshots table
    goalSnapshotsTableMock.select.mockReturnThis();
    goalSnapshotsTableMock.eq.mockReturnThis();
    goalSnapshotsTableMock.gte.mockReturnThis();
    goalSnapshotsTableMock.lte.mockReturnThis();
    goalSnapshotsTableMock.order.mockResolvedValue({ data: goalSnapshots, error: null });

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
    // Create typed mock objects for each table
    const tableMock = mockDeep<MockableTableOperations>();
    
    // Configure mockSupabaseAdmin.from to return the mock for any table
    mockSupabaseAdmin.from.mockImplementation(() => tableMock);
    
    // Configure basic behavior
    tableMock.select.mockReturnThis();
    tableMock.eq.mockReturnThis();
    tableMock.gte.mockReturnThis();
    tableMock.lte.mockReturnThis();
    tableMock.order.mockResolvedValue({ data: [], error: null });

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

    // Helper function to create mock table with data and thenable capability
    function createTableMockWithData<T>(data: T) {
      const mock = mockDeep<MockableTableOperations>();
      
      // Configure chainable methods to return this (for method chaining)
      mock.select.mockReturnThis();
      mock.eq.mockReturnThis();
      mock.gte.mockReturnThis();
      mock.lte.mockReturnThis();
      mock.order.mockReturnThis();
      
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
    
    // Create typed mock objects with proper data
    const habitEntriesTableMock = createTableMockWithData(habitEntries);
    const defaultTableMock = createTableMockWithData([]);
    
    // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      if (table === 'habit_entries') return habitEntriesTableMock;
      return defaultTableMock;
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
    // Create typed mock object for tables that will return an error
    const errorTableMock = mockDeep<MockableTableOperations>();
    
    // Configure mockSupabaseAdmin.from to return the error mock
    mockSupabaseAdmin.from.mockImplementation(() => errorTableMock);
    
    // Configure the mocked behavior to return an error
    errorTableMock.select.mockReturnThis();
    errorTableMock.eq.mockReturnThis();
    errorTableMock.gte.mockReturnThis();
    errorTableMock.lte.mockReturnThis();
    errorTableMock.order.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error', code: '42P01' } 
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
