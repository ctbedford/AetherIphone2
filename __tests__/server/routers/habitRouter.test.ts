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
    it('should fetch active habits for the user with completion status', async () => {
      // --- Arrange --- 
      const userId = 'test-user-id';
      const todayStr = new Date().toISOString().split('T')[0];
      const mockHabits: Habit[] = [
        { id: 'habit-1', user_id: userId, title: 'Habit 1', cue: 'Morning', routine: 'Exercise', reward: 'Coffee', habit_type: 'boolean', goal_quantity: null, goal_unit: null, frequency_period: 'day', goal_frequency: 1, recurrence_rule: 'RRULE:FREQ=DAILY', recurrence_end_date: null, archived_at: null, streak: 5, best_streak: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'habit-2', user_id: userId, title: 'Habit 2', cue: 'Evening', routine: 'Read', reward: 'Relax', habit_type: 'quantity', goal_quantity: 30, goal_unit: 'minutes', frequency_period: 'week', goal_frequency: 3, recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR', recurrence_end_date: null, archived_at: null, streak: 2, best_streak: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const mockEntriesToday = [
        { habit_id: 'habit-1' }, // Only habit 1 is completed today
      ];

      // Explicitly chain mocks for habits fetch
      const habitsFilterMock = jest.fn<() => Promise<{ data: Habit[] | null; error: any }>>();
      habitsFilterMock.mockResolvedValue({ data: mockHabits, error: null });
      const isNullHabitsMock = jest.fn().mockReturnValue({ filter: habitsFilterMock });
      const eqHabitsMock = jest.fn().mockReturnValue({ isNull: isNullHabitsMock });
      const selectHabitsMock = jest.fn().mockReturnValue({ eq: eqHabitsMock });

      // Explicitly chain mocks for entries fetch
      const entriesFilterMock = jest.fn<() => Promise<{ data: any[] | null; error: any }>>();
      entriesFilterMock.mockResolvedValue({ data: mockEntriesToday, error: null });
      const eqDateEntriesMock = jest.fn().mockReturnValue({ filter: entriesFilterMock });
      const eqUserEntriesMock = jest.fn().mockReturnValue({ eq: eqDateEntriesMock });
      const selectEntriesMock = jest.fn().mockReturnValue({ eq: eqUserEntriesMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock from('habits')
        select: selectHabitsMock,
      } as any).mockReturnValueOnce({ // Mock from('habit_entries')
        select: selectEntriesMock,
      } as any);
      
      // --- Act --- 
      const caller = createTestCaller(userId);
      const result = await caller.habit.getHabits();

      // --- Assert --- 
      expect(result).toHaveLength(2);
      // Check all fields, including new ones and completedToday
      expect(result[0]).toMatchObject({ 
        ...mockHabits[0], 
        frequency_period: 'day', 
        goal_frequency: 1,
        completedToday: true 
      });
      expect(result[1]).toMatchObject({ 
        ...mockHabits[1], 
        frequency_period: 'week',
        goal_frequency: 3,
        completedToday: false 
      });

      // Verify mocks - Check if specific methods were called
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(1, 'habits');
      expect(selectHabitsMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(eqHabitsMock).toHaveBeenCalledWith('user_id', userId);
      expect(isNullHabitsMock).toHaveBeenCalledWith('archived_at', null); // Check is call
      expect(habitsFilterMock).toHaveBeenCalledTimes(1); // Ensure filter was called

      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(2, 'habit_entries');
      expect(selectEntriesMock).toHaveBeenCalledWith('habit_id');
      expect(eqUserEntriesMock).toHaveBeenCalledWith('user_id', userId);
      expect(eqDateEntriesMock).toHaveBeenCalledWith('date', todayStr);
      // Check the final resolving mock was called correctly
      expect(entriesFilterMock).toHaveBeenCalledWith('habit_id', expect.arrayContaining([mockHabits[0].id, mockHabits[1].id]));
    });

    it('should return an empty array if no habits exist', async () => {
        // --- Arrange ---
      const userId = 'test-user-id';

      const habitsFilterMock = jest.fn<() => Promise<{ data: Habit[] | null; error: any }>>();
      habitsFilterMock.mockResolvedValue({ data: [], error: null }); // Resolve empty
      const isNullHabitsMock = jest.fn().mockReturnValue({ filter: habitsFilterMock });
      const eqHabitsMock = jest.fn().mockReturnValue({ isNull: isNullHabitsMock });
      const selectHabitsMock = jest.fn().mockReturnValue({ eq: eqHabitsMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectHabitsMock,
      } as any);

      // --- Act ---
      const caller = createTestCaller(userId);
      const result = await caller.habit.getHabits();

      // --- Assert ---
      expect(result).toEqual([]);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      // Ensure habit_entries was NOT called because the initial habit fetch was empty
      expect(mockSupabaseAdmin.from).toHaveBeenCalledTimes(1); 
      expect(habitsFilterMock).toHaveBeenCalledTimes(1); // Check filter was still called before resolving
    });

    it('should throw TRPCError on database error during habit fetch', async () => {
      // --- Arrange ---
      const userId = 'test-user-id';
      const dbError = { message: 'DB error fetching habits', code: '500' };
      
      const habitsFilterMock = jest.fn<() => Promise<{ data: Habit[] | null; error: any }>>();
      habitsFilterMock.mockResolvedValue({ data: null, error: dbError }); // Simulate error
      const isNullHabitsMock = jest.fn().mockReturnValue({ filter: habitsFilterMock });
      const eqHabitsMock = jest.fn().mockReturnValue({ isNull: isNullHabitsMock });
      const selectHabitsMock = jest.fn().mockReturnValue({ eq: eqHabitsMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectHabitsMock,
      } as any);
      
      // --- Act & Assert ---
      const caller = createTestCaller(userId);
      await expect(caller.habit.getHabits()).rejects.toThrowError(
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message })
      );
      expect(habitsFilterMock).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledTimes(1);
    });

    it('should throw TRPCError on database error during entry fetch', async () => {
        // --- Arrange ---
      const userId = 'test-user-id';
      const todayStr = new Date().toISOString().split('T')[0];
      const mockHabits: Habit[] = [
        { id: 'habit-1', user_id: userId, title: 'Habit 1', cue: 'Morning', routine: 'Exercise', reward: 'Coffee', habit_type: 'boolean', goal_quantity: null, goal_unit: null, frequency_period: 'day', goal_frequency: 1, recurrence_rule: 'RRULE:FREQ=DAILY', recurrence_end_date: null, archived_at: null, streak: 5, best_streak: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const dbError = { message: 'DB error fetching entries', code: '500' };

      // Mock successful habit fetch
      const habitsFilterMock = jest.fn<() => Promise<{ data: Habit[] | null; error: any }>>();
      habitsFilterMock.mockResolvedValue({ data: mockHabits, error: null });
      const isNullHabitsMock = jest.fn().mockReturnValue({ filter: habitsFilterMock });
      const eqHabitsMock = jest.fn().mockReturnValue({ isNull: isNullHabitsMock });
      const selectHabitsMock = jest.fn().mockReturnValue({ eq: eqHabitsMock });

      // Mock failing entry fetch
      const entriesFilterMock = jest.fn<() => Promise<{ data: any[] | null; error: any }>>();
      entriesFilterMock.mockResolvedValue({ data: null, error: dbError });
      const eqDateEntriesMock = jest.fn().mockReturnValue({ filter: entriesFilterMock });
      const eqUserEntriesMock = jest.fn().mockReturnValue({ eq: eqDateEntriesMock });
      const selectEntriesMock = jest.fn().mockReturnValue({ eq: eqUserEntriesMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectHabitsMock,
      } as any).mockReturnValueOnce({ // Mock for 'habit_entries'
        select: selectEntriesMock,
      } as any);
      
      // --- Act & Assert ---
      const caller = createTestCaller(userId);
      await expect(caller.habit.getHabits()).rejects.toThrowError(
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message })
      );
      expect(habitsFilterMock).toHaveBeenCalledTimes(1);
      expect(entriesFilterMock).toHaveBeenCalledTimes(1); // Ensure entry fetch was attempted
    });
  });

  describe('getHabitById', () => {
    it('should fetch a specific habit by ID', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-abc';
      const mockHabit: Habit = { id: habitId, user_id: userId, title: 'Test Habit', cue: null, routine: null, reward: null, habit_type: 'boolean', goal_quantity: null, goal_unit: null, frequency_period: 'day', goal_frequency: 1, recurrence_rule: null, recurrence_end_date: null, archived_at: null, streak: 0, best_streak: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

      // Corrected mock structure for chained eq calls
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: mockHabit, error: null });
      const userEqMock = jest.fn().mockReturnValue({ single: singleMock });
      const idEqMock = jest.fn().mockReturnValue({ eq: userEqMock });
      const selectMock = jest.fn().mockReturnValue({ eq: idEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectMock
      } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      const result = await caller.habit.getHabitById({ id: habitId });
      expect(result).toEqual(mockHabit);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(selectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at'); // Check select fields
      expect(idEqMock).toHaveBeenCalledWith('id', habitId);
      expect(userEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(singleMock).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error if habit doesnt exist or belongs to another user', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-abc';
      // Router now throws specific error, not just Supabase error
      const expectedError = new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied' });

      // Corrected mock structure for failing call
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: null, error: { message: 'Row not found', code: 'PGRST116' } });
      const userEqMock = jest.fn().mockReturnValue({ single: singleMock });
      const idEqMock = jest.fn().mockReturnValue({ eq: userEqMock });
      const selectMock = jest.fn().mockReturnValue({ eq: idEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectMock
      } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.getHabitById({ id: habitId })).rejects.toThrowError(
        expectedError
      );
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(selectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(idEqMock).toHaveBeenCalledWith('id', habitId);
      expect(userEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(singleMock).toHaveBeenCalled();
    });

     it('should throw INTERNAL_SERVER_ERROR on other database errors', async () => {
       // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-db-error';
      const dbError = { message: 'Generic DB Error', code: '500' };
      const expectedError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message });

      // Corrected mock structure for generic error
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: null, error: dbError });
      const userEqMock = jest.fn().mockReturnValue({ single: singleMock });
      const idEqMock = jest.fn().mockReturnValue({ eq: userEqMock });
      const selectMock = jest.fn().mockReturnValue({ eq: idEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectMock
      } as any);

       // Act
      const caller = createTestCaller(userId);
       // Assert
      await expect(caller.habit.getHabitById({ id: habitId })).rejects.toThrowError(
        expectedError
      );
       expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
       expect(selectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
       expect(idEqMock).toHaveBeenCalledWith('id', habitId);
       expect(userEqMock).toHaveBeenCalledWith('user_id', userId);
       expect(singleMock).toHaveBeenCalled();
     });
   });

  describe('createHabit', () => { 
    it('should create a new habit with default streaks', async () => {
      // Arrange
      const userId = 'test-user-id';
      const inputData = { title: 'New Habit', habit_type: 'boolean' as const, frequency_period: 'day' as const, goal_frequency: 1 };
      const expectedOutput: Habit = { id: 'new-id', user_id: userId, ...inputData, streak: 0, best_streak: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), cue: null, routine: null, reward: null, goal_quantity: null, goal_unit: null, recurrence_rule: null, recurrence_end_date: null, archived_at: null };

      // Correct mock structure for insert -> select -> single
      // Explicitly type the mock function to help with type inference
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: expectedOutput, error: null }); 
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        insert: insertMock
      } as any);

      // Act
      const caller = createTestCaller(userId);
      const result = await caller.habit.createHabit(inputData);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      // Check insert arguments carefully
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ 
          ...inputData,
          user_id: userId, 
          streak: 0, 
          best_streak: 0 
      }));
      expect(selectMock).toHaveBeenCalled(); // Check select was called after insert
      expect(singleMock).toHaveBeenCalled(); // Check single was called after select
    });

    it('should throw TRPCError on database error', async () => {
      // Arrange
      const userId = 'test-user-id';
      const inputData = { title: 'Fail Habit', habit_type: 'boolean' as const, frequency_period: 'day' as const, goal_frequency: 1 };
      const dbError = { message: 'Insert failed', code: '500' };
      const expectedError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message });

      // Correct mock structure for failing insert
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: null, error: dbError });
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
         insert: insertMock
      } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.createHabit(inputData)).rejects.toThrowError(
        expectedError
      );
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      // Check insert arguments
       expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ 
          ...inputData,
          user_id: userId, 
          streak: 0, 
          best_streak: 0 
      }));
      expect(selectMock).toHaveBeenCalled();
      expect(singleMock).toHaveBeenCalled();
    });
  });

  describe('updateHabit', () => { 
    it('should update an existing habit', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-to-update';
      const updateData = { title: 'Updated Title' };
      // Define the full initial and updated habit objects (need all fields for Habit type)
      const baseHabit = { id: habitId, user_id: userId, cue: null, routine: null, reward: null, habit_type: 'boolean' as const, goal_quantity: null, goal_unit: null, frequency_period: 'day' as const, goal_frequency: 1, recurrence_rule: null, recurrence_end_date: null, archived_at: null, streak: 5, best_streak: 10, created_at: new Date(Date.now() - 100000).toISOString(), updated_at: new Date(Date.now() - 50000).toISOString() }; 
      const initialHabit: Habit = { ...baseHabit, title: 'Old Title' };
      const updatedHabit: Habit = { ...initialHabit, ...updateData, updated_at: new Date().toISOString(), id: habitId, user_id: userId, cue: null, routine: null, reward: null, habit_type: 'boolean', goal_quantity: null, goal_unit: null, frequency_period: 'day', goal_frequency: 1, recurrence_rule: null, recurrence_end_date: null, archived_at: null, streak: 0, best_streak: 0, created_at: new Date().toISOString() };

      // Mock 1: Initial fetch for ownership check (getHabitById logic)
      const fetchSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      fetchSingleMock.mockResolvedValue({ data: initialHabit, error: null });
      const fetchUserEqMock = jest.fn().mockReturnValue({ single: fetchSingleMock });
      const fetchIdEqMock = jest.fn().mockReturnValue({ eq: fetchUserEqMock });
      const fetchSelectMock = jest.fn().mockReturnValue({ eq: fetchIdEqMock });

      // Mock 2: Update operation
      const updateSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      updateSingleMock.mockResolvedValue({ data: updatedHabit, error: null });
      const updateSelectMock = jest.fn().mockReturnValue({ single: updateSingleMock });
      const updateUserEqMock = jest.fn().mockReturnValue({ select: updateSelectMock });
      const updateIdEqMock = jest.fn().mockReturnValue({ eq: updateUserEqMock });
      const updateMock = jest.fn().mockReturnValue({ eq: updateIdEqMock });

      // Chain the mocks: from('habits') -> select (for fetch) -> update 
      mockSupabaseAdmin.from.mockReturnValueOnce({ select: fetchSelectMock } as any)
                             .mockReturnValueOnce({ update: updateMock } as any); // Second call to from('habits') is for update

      // Act
      const caller = createTestCaller(userId);
      const result = await caller.habit.updateHabit({ id: habitId, ...updateData });

      // Assert
      expect(result).toEqual(updatedHabit);

      // Assert fetch mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(1, 'habits');
      expect(fetchSelectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(fetchIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(fetchUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(fetchSingleMock).toHaveBeenCalled();

      // Assert update mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(2, 'habits');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(updateIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(updateUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(updateSelectMock).toHaveBeenCalled();
      expect(updateSingleMock).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error if habit doesnt exist or belongs to another user during initial fetch', async () => { // Renamed for clarity
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'non-existent-habit';
      const updateData = { title: 'Wont Update' };
      const expectedError = new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied' });

      // Mock only the initial fetch, have it return not found
      const fetchSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      fetchSingleMock.mockResolvedValue({ data: null, error: { message: 'Row not found', code: 'PGRST116' } });
      const fetchUserEqMock = jest.fn().mockReturnValue({ single: fetchSingleMock });
      const fetchIdEqMock = jest.fn().mockReturnValue({ eq: fetchUserEqMock });
      const fetchSelectMock = jest.fn().mockReturnValue({ eq: fetchIdEqMock });

      // Only mock 'from' once for the fetch
      mockSupabaseAdmin.from.mockReturnValueOnce({ select: fetchSelectMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.updateHabit({ id: habitId, ...updateData })).rejects.toThrowError(expectedError);
      // Verify fetch mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(fetchSelectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(fetchIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(fetchUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(fetchSingleMock).toHaveBeenCalled();
      // Crucially, ensure no update mock was ever created or called
    });

    it('should throw TRPCError on database error during update operation', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-to-update';
      const updateData = { title: 'Updated Title' };
      // Reuse initial habit definition
      const baseHabit = { id: habitId, user_id: userId, cue: null, routine: null, reward: null, habit_type: 'boolean' as const, goal_quantity: null, goal_unit: null, frequency_period: 'day' as const, goal_frequency: 1, recurrence_rule: null, recurrence_end_date: null, archived_at: null, streak: 5, best_streak: 10, created_at: new Date(Date.now() - 100000).toISOString(), updated_at: new Date(Date.now() - 50000).toISOString() }; 
      const initialHabit: Habit = { ...baseHabit, title: 'Old Title' };
      const dbError = { message: 'Update failed', code: '500' };
      const expectedError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message });

      // Mock 1: Initial fetch for ownership check (success)
      const fetchSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      fetchSingleMock.mockResolvedValue({ data: initialHabit, error: null });
      const fetchUserEqMock = jest.fn().mockReturnValue({ single: fetchSingleMock });
      const fetchIdEqMock = jest.fn().mockReturnValue({ eq: fetchUserEqMock });
      const fetchSelectMock = jest.fn().mockReturnValue({ eq: fetchIdEqMock });

      // Mock 2: Update operation (failure)
      const updateSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      updateSingleMock.mockResolvedValue({ data: null, error: dbError }); // Make the update return the error
      const updateSelectMock = jest.fn().mockReturnValue({ single: updateSingleMock });
      const updateUserEqMock = jest.fn().mockReturnValue({ select: updateSelectMock });
      const updateIdEqMock = jest.fn().mockReturnValue({ eq: updateUserEqMock });
      const updateMock = jest.fn().mockReturnValue({ eq: updateIdEqMock });

       // Chain the mocks: from('habits') -> select (for fetch) -> update (fails)
      mockSupabaseAdmin.from.mockReturnValueOnce({ select: fetchSelectMock } as any)
                             .mockReturnValueOnce({ update: updateMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.updateHabit({ id: habitId, ...updateData })).rejects.toThrowError(expectedError);

      // Assert fetch mock calls (should have succeeded)
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(1, 'habits');
      expect(fetchSelectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(fetchIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(fetchUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(fetchSingleMock).toHaveBeenCalled();

      // Assert update mock calls (should have been called but failed)
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(2, 'habits');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(updateIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(updateUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(updateSelectMock).toHaveBeenCalled();
      expect(updateSingleMock).toHaveBeenCalled();
    });
  });

  describe('deleteHabit', () => { 
    it('should delete an existing habit and return true', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-to-delete';

      // Mock delete -> eq(id) -> eq(user_id) -> resolves successfully
      // Explicitly type the mock function to help with type inference
      const deleteUserEqMock = jest.fn<() => Promise<{ data: null; error: any }>>();
      deleteUserEqMock.mockResolvedValue({ data: null, error: null }); // Success is indicated by no error
      const deleteIdEqMock = jest.fn().mockReturnValue({ eq: deleteUserEqMock });
      const deleteMock = jest.fn().mockReturnValue({ eq: deleteIdEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ delete: deleteMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.deleteHabit({ id: habitId })).resolves.toBe(true);
      // Verify mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(deleteMock).toHaveBeenCalled();
      expect(deleteIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(deleteUserEqMock).toHaveBeenCalledWith('user_id', userId);
    });

    it('should throw NOT_FOUND error if habit to delete doesnt exist or belongs to another user', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'non-existent-habit';
      const expectedError = new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or cannot be deleted' });

      // Mock delete -> eq(id) -> eq(user_id) -> resolves with error (or indicates 0 rows affected)
      // Simulate a 'not found' scenario, Supabase might return an error or just indicate 0 rows affected.
      // Let's mock returning an error that the router interprets as NOT_FOUND.
      const dbError = { message: 'Row not found', code: 'PGRST116' }; // Example error
      const deleteUserEqMock = jest.fn<() => Promise<{ data: null; error: any }>>();
      deleteUserEqMock.mockResolvedValue({ data: null, error: dbError });
      const deleteIdEqMock = jest.fn().mockReturnValue({ eq: deleteUserEqMock });
      const deleteMock = jest.fn().mockReturnValue({ eq: deleteIdEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ delete: deleteMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.deleteHabit({ id: habitId })).rejects.toThrowError(expectedError);
      // Verify mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(deleteMock).toHaveBeenCalled();
      expect(deleteIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(deleteUserEqMock).toHaveBeenCalledWith('user_id', userId);
    });

    it('should throw TRPCError on database error during delete operation', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-delete-error';
      const dbError = { message: 'Internal DB Error', code: '500' };
      const expectedError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message });

      // Mock delete -> eq(id) -> eq(user_id) -> resolves with a generic error
      const deleteUserEqMock = jest.fn<() => Promise<{ data: null; error: any }>>();
      deleteUserEqMock.mockResolvedValue({ data: null, error: dbError });
      const deleteIdEqMock = jest.fn().mockReturnValue({ eq: deleteUserEqMock });
      const deleteMock = jest.fn().mockReturnValue({ eq: deleteIdEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ delete: deleteMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.deleteHabit({ id: habitId })).rejects.toThrowError(expectedError);
      // Verify mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(deleteMock).toHaveBeenCalled();
      expect(deleteIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(deleteUserEqMock).toHaveBeenCalledWith('user_id', userId);
    });
  });

  // TODO: Add describe blocks for archive/unarchive and habit entry procedures
});
