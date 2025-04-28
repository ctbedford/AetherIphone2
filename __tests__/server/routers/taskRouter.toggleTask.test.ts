import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  createInnerTRPCContext, 
  mockSupabaseAdmin, 
  MockableTableOperations, 
  resetSupabaseMocks, 
  MockablePostgrestResponse 
} from '../test-helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';

// Type for database table names to avoid 'any' parameter type errors
type TableName = 'tasks' | 'goals' | 'habits' | string;

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

describe('taskRouter.toggleTask', () => {
  beforeEach(() => {
    // Reset mocks before each test
    resetSupabaseMocks();
  });

  it('should toggle a task from incomplete to complete', async () => {
    const taskId = 'task-1';
    const userId = 'test-user-id';
    const initialTaskData = {
      id: taskId,
      user_id: userId,
      title: 'Test Task',
      notes: null,
      status: 'in-progress',
      priority: 2,
      due: null,
      goal_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedTaskData = {
      id: taskId,
      user_id: userId,
      title: 'Test Task',
      notes: null,
      status: 'completed', // This is the expected final status
      priority: 2,
      due: null,
      goal_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), // Include fields returned by select
    };

    // Mock setup for 'tasks' table operations
    const fetchMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(fetchMock); // Consistently return fetchMock for 'tasks'

    // Configure chainable methods to return the mock itself
    fetchMock.select.mockReturnValue(fetchMock);
    fetchMock.eq.mockReturnValue(fetchMock);
    fetchMock.update.mockReturnValue(fetchMock);

    // Configure .single() to resolve differently for fetch vs update
    fetchMock.single
      .mockResolvedValueOnce({ data: initialTaskData, error: null }) // First call (fetch)
      .mockResolvedValueOnce({ data: updatedTaskData, error: null }); // Second call (update confirmation)

    const caller = createTestCaller(userId);
    const result = await caller.task.toggleTask({
      taskId: taskId,
      completed: true,
    });

    // Verify the result
    expect(result.status).toBe('completed');

    // Verify calls
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tasks');
    expect(fetchMock.select).toHaveBeenCalledWith('id, status, goal_id, title');
    expect(fetchMock.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(fetchMock.eq).toHaveBeenCalledWith('id', taskId);
    expect(fetchMock.eq).toHaveBeenCalledWith('user_id', userId);
    expect(fetchMock.select).toHaveBeenCalledWith('id, title, status, goal_id, updated_at');
    expect(fetchMock.single).toHaveBeenCalledTimes(2); // Called for fetch and update
  });

  it('should toggle a task from complete to incomplete', async () => {
    const taskId = 'task-1';
    const userId = 'test-user-id';
    const initialTaskData = {
      id: taskId,
      title: 'Test Task',
      status: 'completed', // Starting completed
      goal_id: null,
    };
    const updatedTaskData = {
      id: taskId,
      title: 'Test Task',
      status: 'in-progress', // Expected final status
      goal_id: null,
      updated_at: new Date().toISOString(),
    };

    // Mock setup for 'tasks' table operations
    const fetchMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(fetchMock); // Consistently return fetchMock

    // Configure chainable methods
    fetchMock.select.mockReturnValue(fetchMock);
    fetchMock.eq.mockReturnValue(fetchMock);
    fetchMock.update.mockReturnValue(fetchMock);

    // Configure .single() resolutions
    fetchMock.single
      .mockResolvedValueOnce({ data: initialTaskData, error: null }) // First call (fetch)
      .mockResolvedValueOnce({ data: updatedTaskData, error: null }); // Second call (update confirmation)

    const caller = createTestCaller(userId);
    const result = await caller.task.toggleTask({
      taskId: taskId,
      completed: false, // Toggling to incomplete
    });

    // Verify the result
    expect(result.status).toBe('in-progress');

    // Verify calls
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tasks');
    expect(fetchMock.select).toHaveBeenCalledWith('id, status, goal_id, title');
    expect(fetchMock.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'in-progress' }));
    expect(fetchMock.eq).toHaveBeenCalledWith('id', taskId);
    expect(fetchMock.eq).toHaveBeenCalledWith('user_id', userId);
    expect(fetchMock.select).toHaveBeenCalledWith('id, title, status, goal_id, updated_at');
    expect(fetchMock.single).toHaveBeenCalledTimes(2); // Called for fetch and update
  });

  it('should update goal progress when toggling a task with goal association', async () => {
    const taskId = 'task-1';
    const goalId = 'goal-1';
    const userId = 'test-user-id';

    // --- Task Mocks --- 
    const taskFetchMock = mockDeep<MockableTableOperations>();
    const initialTaskData = { id: taskId, title: 'Goal Task', status: 'in-progress', goal_id: goalId };
    const updatedTaskData = { ...initialTaskData, status: 'completed', updated_at: new Date().toISOString() };
    
    taskFetchMock.select.mockReturnValue(taskFetchMock);
    taskFetchMock.eq.mockReturnValue(taskFetchMock);
    taskFetchMock.update.mockReturnValue(taskFetchMock);
    taskFetchMock.single
      .mockResolvedValueOnce({ data: initialTaskData, error: null }) // Fetch task
      .mockResolvedValueOnce({ data: updatedTaskData, error: null }); // Update task

    // --- Goal Task List Mock --- 
    const goalTasksListMock = mockDeep<MockableTableOperations>();
    // Simulate fetching tasks for the goal AFTER the toggle (one is now completed)
    const goalTasksData = [
        { id: taskId, status: 'completed' }, // The toggled task
        { id: 'task-2', status: 'in-progress' },
    ];
    goalTasksListMock.select.mockReturnValue(goalTasksListMock);
    goalTasksListMock.eq.mockReturnValue(goalTasksListMock);
    // Mock the implicit .then() for await when fetching multiple rows
    (goalTasksListMock as any).then.mockResolvedValue({ data: goalTasksData, error: null, count: goalTasksData.length }); 

    // --- Goal Update Mock --- 
    const goalUpdateMock = mockDeep<MockableTableOperations>();
    const updatedGoalData = { id: goalId, name: 'Test Goal', progress: 0.5, /* other fields */ updated_at: new Date().toISOString() }; // Example with 50% progress
    
    goalUpdateMock.update.mockReturnValue(goalUpdateMock);
    goalUpdateMock.eq.mockReturnValue(goalUpdateMock);
    goalUpdateMock.select.mockReturnValue(goalUpdateMock);
    goalUpdateMock.single.mockResolvedValue({ data: updatedGoalData, error: null }); // Update goal confirmation

    // --- Configure from() to return the right mock based on table --- 
    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      if (table === 'tasks') {
        // First call to 'tasks' is for the initial fetch/update of the specific task
        // Second call is to get all tasks for the goal
        // Need a way to differentiate... maybe check chained methods?
        // For now, let's assume the first call structure uses single(), the second doesn't directly
        // A more robust way might involve mockFn.mock.calls inspection or clearer separation.
        // Let's try returning taskFetchMock first, then goalTasksListMock.
        if (mockSupabaseAdmin.from.mock.calls.filter(c => c[0] === 'tasks').length <= 1) {
            return taskFetchMock;
        } else {
            return goalTasksListMock;
        }
      }
      if (table === 'goals') {
        return goalUpdateMock; // Only call to 'goals' is for the update
      }
      // Fallback for any other table calls in the test setup (if any)
      const defaultMock = mockDeep<MockableTableOperations>();
      defaultMock.select.mockReturnValue(defaultMock);
      defaultMock.eq.mockReturnValue(defaultMock);
      defaultMock.single.mockResolvedValue({ data: null, error: { message: 'Default mock', code: 'MOCK_ERR' } });
      return defaultMock;
    });

    const caller = createTestCaller(userId);
    const result = await caller.task.toggleTask({
      taskId: taskId,
      completed: true,
    });

    // Assertions
    expect(result.status).toBe('completed');
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tasks'); // Called multiple times
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('goals');
    
    // Verify task update
    expect(taskFetchMock.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(taskFetchMock.single).toHaveBeenCalledTimes(2); // Fetch + Update task

    // Verify fetching goal tasks
    expect(goalTasksListMock.select).toHaveBeenCalledWith('id, status');
    expect(goalTasksListMock.eq).toHaveBeenCalledWith('goal_id', goalId);

    // Verify goal update
    expect(goalUpdateMock.update).toHaveBeenCalledWith({ progress: 0.5 }); // 1 out of 2 tasks complete
    expect(goalUpdateMock.eq).toHaveBeenCalledWith('id', goalId);
    expect(goalUpdateMock.select).toHaveBeenCalledWith('id, name, progress, updated_at');
    expect(goalUpdateMock.single).toHaveBeenCalledTimes(1);

    // Reset implementation for next tests if needed (though beforeEach should handle it)
    // mockSupabaseAdmin.from.mockRestore(); // Or reset in beforeEach

  });

  it('should not change status if already in the target state', async () => {
    const taskId = 'task-1';
    const userId = 'test-user-id';
    const existingTask = {
      id: taskId,
      title: 'Test Task',
      status: 'completed',
      goal_id: null,
    };

    // --- Configure from() for tasks table --- 
    const tasksTableMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(tasksTableMock);
    tasksTableMock.select.mockReturnValue(tasksTableMock);
    tasksTableMock.eq.mockReturnValue(tasksTableMock);
    tasksTableMock.single.mockResolvedValue({ data: existingTask, error: null });

    // --- Configure from() for goals table (should not be called) ---
    const goalsTableMock = mockDeep<MockableTableOperations>();
    // ... setup mocks for goals table ...
    // This setup is complex, let's simplify if goal logic isn't tested here
    // goalsTableMock.update.mockReturnValue(goalsTableMock);
    // goalsTableMock.eq.mockReturnValue(goalsTableMock);
    // goalsTableMock.select.mockReturnValue(goalsTableMock);
    // goalsTableMock.single.mockResolvedValue({ data: null, error: null });
    // mockSupabaseAdmin.from('goals').mockReturnValue(goalsTableMock);
    const caller = createTestCaller(userId);
    const result = await caller.task.toggleTask({
      taskId: taskId,
      completed: true, // Already completed, so no change needed
    });

    // Verify the result
    expect(result.status).toBe('completed');

    // Verify no update was performed
    expect(mockSupabaseAdmin.from('tasks').update).not.toHaveBeenCalled();
    expect(mockSupabaseAdmin.from('goals').update).not.toHaveBeenCalled(); // Ensure goal not updated
  });

  it('should throw NOT_FOUND error if task does not exist', async () => {
    // Mock the initial fetch to return no data
    const fetchMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(fetchMock);
    fetchMock.select.mockReturnValue(fetchMock);
    fetchMock.eq.mockReturnValue(fetchMock);
    fetchMock.single.mockResolvedValue({ data: null, error: null }); // Simulate task not found

    const caller = createTestCaller();
    await expect(caller.task.toggleTask({ taskId: 'nonexistent-task', completed: true }))
      .rejects.toMatchObject({ code: 'NOT_FOUND' });

    // Ensure update was not called
    expect(fetchMock.update).not.toHaveBeenCalled();
  });

  it('should throw an error if the database update fails', async () => {
    const taskId = 'task-1';
    const userId = 'test-user-id';
    const initialTaskData = { id: taskId, status: 'in-progress', goal_id: null, title: 'Test' };
    const dbError = { message: 'Update failed', code: 'DB_ERROR' };

    // Mock the initial fetch
    const fetchMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(fetchMock);
    fetchMock.select.mockReturnValue(fetchMock);
    fetchMock.eq.mockReturnValue(fetchMock);
    fetchMock.update.mockReturnValue(fetchMock); // Update returns mock for chaining

    // Mock .single() for initial fetch (success) and update (failure)
    fetchMock.single
      .mockResolvedValueOnce({ data: initialTaskData, error: null }) // Fetch succeeds
      .mockResolvedValueOnce({ data: null, error: dbError });       // Update fails

    const caller = createTestCaller(userId);
    await expect(caller.task.toggleTask({ taskId: taskId, completed: true }))
      .rejects.toMatchObject({ message: 'Update failed', code: 'DB_ERROR' });

    // Verify update was attempted
    expect(fetchMock.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(fetchMock.single).toHaveBeenCalledTimes(2); // Fetch + Update attempt
  });

});
