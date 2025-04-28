import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin, resetSupabaseMocks } from '../test-helpers'; 
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';
import { Habit } from '../../../server/src/types/trpc-types'; 

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
    resetSupabaseMocks();
  });

  describe('getHabits', () => {
    it('should fetch active habits for the user', async () => {
      // --- Arrange --- 
      const userId = 'test-user-id';
      const todayStr = new Date().toISOString().split('T')[0];
      const mockHabits: Habit[] = [
        { id: 'habit-1', user_id: userId, title: 'Habit 1', cue: 'Morning', routine: 'Exercise', reward: 'Coffee', habit_type: 'boolean', goal_quantity: null, goal_unit: null, recurrence_rule: 'RRULE:FREQ=DAILY', recurrence_end_date: null, archived_at: null, sort_order: 1, streak: 5, best_streak: 10, created_at: new Date().toISOString(), updated_at: undefined },
        { id: 'habit-2', user_id: userId, title: 'Habit 2', cue: 'Evening', routine: 'Read', reward: 'Relax', habit_type: 'quantity', goal_quantity: 30, goal_unit: 'minutes', recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR', recurrence_end_date: null, archived_at: null, sort_order: 2, streak: 2, best_streak: 2, created_at: new Date().toISOString(), updated_at: undefined },
      ];
      const mockEntriesToday = [
        { habit_id: 'habit-1' }, // Only habit 1 is completed today
      ];

      // Mocks using plain objects and jest.fn()
      const habitsOrderMock = jest.fn(); // Final call for habits
      const habitsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: habitsOrderMock
      };
      // First .order call returns mock, second resolves promise
      habitsOrderMock
        .mockImplementationOnce(() => habitsMock)
        .mockResolvedValueOnce({ data: mockHabits, error: null });

      const entriesInMock = jest.fn(); // Final call for entries
      const entriesMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(), // eq returns the mock itself
        in: entriesInMock // Attach the final mock fn
      };

      // Configure the final .in() mock based on the last .eq call
      // Use spyOn AFTER the object is created
      jest.spyOn(entriesMock, 'eq').mockImplementation((col, val) => {
          if (col === 'date' && val === todayStr) {
              entriesInMock.mockResolvedValue({ data: mockEntriesToday, error: null });
          } else if (col === 'user_id' && val === userId) {
              // Do nothing special, just allow chain to continue
          } else {
              // Default empty for other/unexpected eq calls
              entriesInMock.mockResolvedValue({ data: [], error: null });
          }
          return entriesMock; // Ensure eq always returns the mock
      });

      // Configure mockSupabaseAdmin.from
      mockSupabaseAdmin.from.mockImplementation((table) => {
        if (table === 'habits') return habitsMock as any;
        if (table === 'habit_entries') return entriesMock as any;
         // Fallback: Return a basic mock that resolves empty
        return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
            single: jest.fn().mockResolvedValue({ data: null, error: null}),
        } as any;
      });
      
      // --- Act --- 
      const caller = createTestCaller(userId);
      const result = await caller.habit.getHabits();

      // --- Assert --- 
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ ...mockHabits[0], completedToday: true });
      expect(result[1]).toMatchObject({ ...mockHabits[1], completedToday: false });

      // Verify mocks - Check if specific methods were called
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(habitsMock.select).toHaveBeenCalled();
      expect(habitsMock.eq).toHaveBeenCalledWith('user_id', userId);
      expect(habitsMock.is).toHaveBeenCalledWith('archived_at', null); // Check is call
      expect(habitsMock.order).toHaveBeenCalledTimes(2); // Ensure both order calls happened

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habit_entries');
      expect(entriesMock.select).toHaveBeenCalledWith('habit_id');
      expect(entriesMock.eq).toHaveBeenCalledWith('user_id', userId);
      expect(entriesMock.eq).toHaveBeenCalledWith('date', todayStr);
      // Check the final resolving mock was called correctly
      expect(entriesInMock).toHaveBeenCalledWith('habit_id', expect.arrayContaining([mockHabits[0].id, mockHabits[1].id]));
    });

    it('should return an empty array if no habits exist', async () => {
        // --- Arrange ---
      const userId = 'test-user-id';

      const habitsOrderMock = jest.fn();
      const habitsMock = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          is: jest.fn().mockReturnThis(),
          order: habitsOrderMock
      };
      habitsOrderMock
          .mockImplementationOnce(() => habitsMock)
          .mockResolvedValueOnce({ data: [], error: null }); // Resolve empty

      // No need to mock entries chain in detail as it shouldn't be called

      mockSupabaseAdmin.from.mockImplementation((table) => {
        if (table === 'habits') return habitsMock as any;
        // Basic fallback for entries (shouldn't be called)
        return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(), // Add is for completeness if needed
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
            order: jest.fn().mockResolvedValue({ data: [], error: null }), // Add order for completeness
        } as any;
      });

      // --- Act ---
      const caller = createTestCaller(userId);
      const result = await caller.habit.getHabits();

      // --- Assert ---
      expect(result).toEqual([]);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      // Ensure habit_entries was NOT called because the initial habit fetch was empty
      expect(mockSupabaseAdmin.from).not.toHaveBeenCalledWith('habit_entries'); 
      expect(habitsMock.order).toHaveBeenCalledTimes(2); // Check order was still called twice before resolving
    });

    it('should correctly map completedToday status', async () => {
      // TODO: Implement test
    });

    it('should throw TRPCError on database error', async () => {
      // TODO: Implement test
    });
  });

  describe('getHabitById', () => {
    it('should fetch a specific habit by ID', async () => {
      // TODO: Implement test
    });

    it('should throw NOT_FOUND error if habit doesnt exist or belongs to another user', async () => {
      // TODO: Implement test
    });
  });

  describe('createHabit', () => {
    it('should create a new habit with default streaks', async () => {
      // TODO: Implement test
    });

    it('should throw TRPCError on database error', async () => {
      // TODO: Implement test
    });
  });

  describe('updateHabit', () => {
    it('should update an existing habit', async () => {
      // TODO: Implement test
    });

    it('should throw NOT_FOUND error if habit doesnt exist or belongs to another user', async () => {
      // TODO: Implement test
    });

    it('should throw TRPCError on database error during update', async () => {
      // TODO: Implement test
    });
  });

  describe('deleteHabit', () => {
    it('should delete an existing habit', async () => {
      // TODO: Implement test
    });

    it('should throw NOT_FOUND error if habit doesnt exist or belongs to another user', async () => {
      // TODO: Implement test
    });

    it('should throw TRPCError on database error during delete', async () => {
      // TODO: Implement test
    });
  });

  // TODO: Add describe blocks for archive/unarchive and habit entry procedures
});
