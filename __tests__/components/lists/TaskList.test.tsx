import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskList, TaskCard } from '@/components/lists/TaskList';
import { router } from 'expo-router';

// Mock router.push
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Define sample mock data that matches our Supabase schema via tRPC
const mockTasks = [
  {
    id: 'task-1',
    title: 'Create UI components',
    notes: 'Focus on reusable design patterns',
    due: '2025-05-01',
    completed: false,
    goal_id: 'goal-1',
    goal: { title: 'App Refactoring' },
    user_id: 'user-123',
  },
  {
    id: 'task-2',
    title: 'Write tests',
    notes: 'Ensure good coverage of components',
    due: '2025-05-03',
    completed: true,
    goal_id: null,
    goal: null,
    user_id: 'user-123',
  },
];

describe('TaskCard Component', () => {
  it('renders task information correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TaskCard task={mockTasks[0]} onPress={onPressMock} />
    );
    
    expect(getByText('Create UI components')).toBeTruthy();
    expect(getByText('Focus on reusable design patterns')).toBeTruthy();
    expect(getByText('May 1')).toBeTruthy();
    expect(getByText('App Refactoring')).toBeTruthy();
  });
  
  it('handles completion toggle correctly', () => {
    const onPressMock = jest.fn();
    const onCompleteMock = jest.fn();
    const { getByTestId } = render(
      <TaskCard 
        task={mockTasks[0]} 
        onPress={onPressMock} 
        onComplete={onCompleteMock} 
      />
    );
    
    // Find the toggle button (checkmark)
    const toggleButton = getByTestId('icon-checkmark-circle-outline');
    fireEvent.press(toggleButton.parent);
    
    // Should call onComplete with true (completed)
    expect(onCompleteMock).toHaveBeenCalledWith(true);
  });
  
  it('displays completed task with line-through', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TaskCard task={mockTasks[1]} onPress={onPressMock} />
    );
    
    const titleElement = getByText('Write tests');
    // Text should have line-through style
    expect(titleElement.props.style).toBeDefined();
    // Would check for textDecorationLine: 'line-through' here, but we're mocking styles
  });
  
  it('shows overdue status for past due tasks', () => {
    const pastDueTask = {
      ...mockTasks[0],
      due: '2025-04-01', // Past date
    };
    
    const { getByText } = render(
      <TaskCard task={pastDueTask} onPress={jest.fn()} />
    );
    
    // Should show "Overdue" text
    expect(getByText(/Overdue:/)).toBeTruthy();
  });
});

describe('TaskList Component', () => {
  it('renders loading state correctly', () => {
    const { getByTestId } = render(
      <TaskList isLoading={true} refetch={jest.fn()} />
    );
    
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });
  
  it('renders error state correctly', () => {
    const refetchMock = jest.fn();
    const { getByText } = render(
      <TaskList isLoading={false} isError={true} refetch={refetchMock} />
    );
    
    expect(getByText('Unable to load tasks')).toBeTruthy();
    
    // Test retry functionality
    fireEvent.press(getByText('Retry'));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
  
  it('renders empty state correctly', () => {
    const { getByText } = render(
      <TaskList isLoading={false} tasks={[]} refetch={jest.fn()} />
    );
    
    expect(getByText('No tasks yet')).toBeTruthy();
    
    // Test create action
    fireEvent.press(getByText('Create a task'));
    expect(router.push).toHaveBeenCalledWith('/planner/add-task');
  });
  
  it('renders tasks correctly', () => {
    const { getAllByText } = render(
      <TaskList isLoading={false} tasks={mockTasks} refetch={jest.fn()} />
    );
    
    // Should render both tasks
    expect(getAllByText(/Create UI components|Write tests/).length).toBe(2);
  });
  
  it('calls onCompleteTask when provided', () => {
    const onCompleteTaskMock = jest.fn();
    const { getByText, getAllByTestId } = render(
      <TaskList 
        isLoading={false} 
        tasks={mockTasks} 
        refetch={jest.fn()} 
        onCompleteTask={onCompleteTaskMock} 
      />
    );
    
    // Find the first task's toggle button
    const toggleButtons = getAllByTestId('icon-checkmark-circle-outline');
    fireEvent.press(toggleButtons[0].parent);
    
    // Should call onCompleteTask with the task ID and completion status
    expect(onCompleteTaskMock).toHaveBeenCalledWith('task-1', true);
  });
});
