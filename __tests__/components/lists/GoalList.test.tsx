import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GoalList, GoalCard } from '@/components/lists/GoalList';
import { router } from 'expo-router';

// Mock router.push
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Define sample mock data that matches our Supabase schema via tRPC
const mockGoals = [
  {
    id: 'goal-1',
    title: 'Complete Project',
    description: 'Finish the Aether app refactoring',
    progress: 75,
    target_date: '2025-05-15',
    user_id: 'user-123',
  },
  {
    id: 'goal-2',
    title: 'Learn TypeScript',
    description: 'Master advanced TypeScript concepts',
    progress: 30,
    target_date: '2025-06-30',
    user_id: 'user-123',
  },
];

describe('GoalCard Component', () => {
  it('renders goal information correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GoalCard goal={mockGoals[0]} onPress={onPressMock} />
    );
    
    expect(getByText('Complete Project')).toBeTruthy();
    expect(getByText('Finish the Aether app refactoring')).toBeTruthy();
    expect(getByText('75%')).toBeTruthy();
    expect(getByText('May 15')).toBeTruthy();
  });
  
  it('handles press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GoalCard goal={mockGoals[0]} onPress={onPressMock} />
    );
    
    // Find the card and press it
    const card = getByText('Complete Project').parent.parent.parent;
    fireEvent.press(card);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});

describe('GoalList Component', () => {
  it('renders loading state correctly', () => {
    const { getByTestId } = render(
      <GoalList isLoading={true} refetch={jest.fn()} />
    );
    
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });
  
  it('renders error state correctly', () => {
    const refetchMock = jest.fn();
    const { getByText } = render(
      <GoalList isLoading={false} isError={true} refetch={refetchMock} />
    );
    
    expect(getByText('Unable to load goals')).toBeTruthy();
    
    // Test retry functionality
    fireEvent.press(getByText('Retry'));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
  
  it('renders empty state correctly', () => {
    const { getByText } = render(
      <GoalList isLoading={false} goals={[]} refetch={jest.fn()} />
    );
    
    expect(getByText('No goals yet')).toBeTruthy();
    
    // Test create action
    fireEvent.press(getByText('Create a goal'));
    expect(router.push).toHaveBeenCalledWith('/planner/add-goal');
  });
  
  it('renders goals correctly', () => {
    const { getAllByText } = render(
      <GoalList isLoading={false} goals={mockGoals} refetch={jest.fn()} />
    );
    
    // Should render both goals
    expect(getAllByText(/Complete Project|Learn TypeScript/).length).toBe(2);
  });
  
  it('navigates to goal detail on press', () => {
    const { getByText } = render(
      <GoalList isLoading={false} goals={mockGoals} refetch={jest.fn()} />
    );
    
    // Press the first goal
    const goalTitle = getByText('Complete Project');
    fireEvent.press(goalTitle.parent.parent.parent);
    
    // Should navigate to the goal detail page
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/planner/goal/[id]',
      params: { id: 'goal-1' }
    });
  });
  
  it('calls onSelectGoal when provided', () => {
    const onSelectMock = jest.fn();
    const { getByText } = render(
      <GoalList 
        isLoading={false} 
        goals={mockGoals} 
        refetch={jest.fn()} 
        onSelectGoal={onSelectMock} 
      />
    );
    
    // Press the first goal
    const goalTitle = getByText('Complete Project');
    fireEvent.press(goalTitle.parent.parent.parent);
    
    // Should call the onSelectGoal callback
    expect(onSelectMock).toHaveBeenCalledWith(mockGoals[0]);
    // Should not navigate (router.push should not be called)
    expect(router.push).not.toHaveBeenCalled();
  });
});
