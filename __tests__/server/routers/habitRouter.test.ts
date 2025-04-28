import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin } from '../test-helpers';
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';
import { habitRouter } from '../../../server/src/routers/habitRouter';

// Type for database table names to avoid 'any' parameter type errors
type TableName = 'tasks' | 'goals' | 'habits' | 'habit_entries' | string;

/**
 * Helper function to create a test context
 * This mimics how the tRPC context would be created in a real request
 */
function createTestContext(userId: string | null = 'test-user-id') {
  return createInnerTRPCContext({
    userId,
    supabase: mockSupabaseAdmin,
  });
}

/**
 * Create a test tRPC caller with proper context
 * @param userId Optional user ID for authenticated routes
 * @returns A tRPC caller that can be used to call procedures
 */
function createTestCaller(userId: string | null = 'test-user-id') {
  const ctx = createTestContext(userId);
  return appRouter.createCaller(ctx);
}

describe('habitRouter', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset mockSupabaseAdmin implementation to avoid interference between tests
    Object.keys(mockSupabaseAdmin).forEach(key => {
      const mockFn = mockSupabaseAdmin[key as keyof typeof mockSupabaseAdmin];
      if (typeof mockFn === 'function' && 'mockReset' in mockFn) {
        (mockFn as jest.Mock).mockReset().mockReturnThis();
      }
    });
  });

  describe('toggleHabit', () => {
    it('should toggle a habit to completed state', async () => {
      // Mock the habit data
      const testHabit = {
        id: 'test-habit-id',
        name: 'Test Habit',
        frequency: 'daily',
        streak: 0,
        best_streak: 0,
      };
      
      // Create mock functions with specific implementations
      // For habits table - create properly typed mock functions
      const mockHabitEq = jest.fn().mockReturnThis();
      
      // Create update mock with proper typing for method chaining
      interface UpdateMock extends jest.Mock {
        eq: jest.Mock;
      }
      
      const mockHabitUpdate = jest.fn().mockReturnThis() as UpdateMock;
      // Add eq method to update for chaining
      mockHabitUpdate.eq = mockHabitEq;
      
      const mockHabitSelect = jest.fn().mockReturnThis();
      const mockHabitSingle = jest.fn().mockReturnValue({
        data: testHabit,
        error: null,
      });
      
      // For habit_entries table
      const mockEntryEq = jest.fn().mockReturnThis();
      const mockEntrySelect = jest.fn().mockReturnThis();
      const mockEntrySingle = jest.fn().mockReturnValue({
        data: null, // No existing entry
        error: null,
      });
      const mockEntryInsert = jest.fn().mockReturnValue({
        data: { habit_id: testHabit.id, date: '2025-04-27', completed: true },
        error: null,
      });

      // Setup mock responses with table-specific implementations
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        if (table === 'habits') {
          // Return a custom object with all the methods needed
          const mockHabitsTable = {
            select: mockHabitSelect,
            eq: mockHabitEq,
            single: mockHabitSingle,
            update: mockHabitUpdate,
          };
          // After update and eq are called, mockHabitEq will return success
          mockHabitEq.mockReturnValue({
            data: { ...testHabit, streak: 1, best_streak: 1 },
            error: null,
          });
          return mockHabitsTable;
        }

        if (table === 'habit_entries') {
          return {
            select: mockEntrySelect,
            eq: mockEntryEq,
            single: mockEntrySingle,
            insert: mockEntryInsert,
          };
        }

        return mockSupabaseAdmin;
      });

      // Call the procedure
      const caller = createTestCaller();
      const result = await caller.habit.toggleHabit({
        habitId: testHabit.id,
        completed: true,
      });

      // Verify the result
      expect(result).toEqual({
        ...testHabit,
        completed: true,
      });

      // Verify that insert was called for the new habit entry
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habit_entries');
      expect(mockEntryInsert).toHaveBeenCalled();

      // Verify streak was updated
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(mockHabitUpdate).toHaveBeenCalled();
    });

    it('should toggle a habit to uncompleted state', async () => {
      // Mock the habit data
      const testHabit = {
        id: 'test-habit-id',
        name: 'Test Habit',
        user_id: 'test-user-id',
        streak: 5,
        best_streak: 10,
      };

      // Mock an existing habit entry
      const testEntry = {
        id: 'test-entry-id',
        habit_id: 'test-habit-id',
        user_id: 'test-user-id',
        date: new Date().toISOString().split('T')[0],
        completed: true,
      };

      // Setup mock responses
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        if (table === 'habits') {
          return {
            ...mockSupabaseAdmin,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnValue({ data: testHabit, error: null }),
            update: jest.fn().mockReturnThis(),
          };
        }
        if (table === 'habit_entries') {
          return {
            ...mockSupabaseAdmin,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnValue({ data: testEntry, error: null }),
            delete: jest.fn().mockReturnThis(),
          };
        }
        return mockSupabaseAdmin;
      });

      const caller = createTestCaller();
      const result = await caller.habit.toggleHabit({
        habitId: 'test-habit-id',
        completed: false,
      });

      // Verify the result
      expect(result).toEqual({
        ...testHabit,
        completed: false,
      });

      // Verify that delete was called for the habit entry
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habit_entries');
      expect(mockSupabaseAdmin.delete).toHaveBeenCalled();

      // Verify streak was reset
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(mockSupabaseAdmin.update).toHaveBeenCalled();
    });

    it('should throw an error if habit does not exist', async () => {
      // Setup mock responses to simulate a non-existent habit
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        if (table === 'habits') {
          return {
            ...mockSupabaseAdmin,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnValue({ 
              data: null, 
              error: { code: 'PGRST116', message: 'Not found' } 
            }),
          };
        }
        return mockSupabaseAdmin;
      });

      const caller = createTestCaller();
      
      // Expect the call to throw a NOT_FOUND error
      await expect(caller.habit.toggleHabit({
        habitId: 'non-existent-id',
        completed: true,
      })).rejects.toThrow(TRPCError);
    });

    it('should throw an unauthorized error if no user is authenticated', async () => {
      const caller = createTestCaller(null);
      
      // Expect the call to throw an UNAUTHORIZED error
      await expect(caller.habit.toggleHabit({
        habitId: 'test-habit-id',
        completed: true,
      })).rejects.toThrow(TRPCError);
    });
  });
});
