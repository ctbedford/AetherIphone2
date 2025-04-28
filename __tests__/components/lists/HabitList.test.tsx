import React from 'react';
import { render, fireEvent } from '../test-utils';
import { HabitList, HabitCard } from '@/components/lists/HabitList';
import { router } from 'expo-router';

// Mock router.push
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Define sample mock data that matches our Supabase schema via tRPC
const mockHabits = [
  {
    id: 'habit-1',
    title: 'Morning Meditation',
    streak: 5,
    best_streak: 21,
    cue: 'After waking up',
    routine: 'Meditate for 10 minutes',
    reward: 'Feel centered and calm',
    user_id: 'user-123',
  },
  {
    id: 'habit-2',
    title: 'Code Review',
    streak: 12,
    best_streak: 30,
    cue: 'After lunch',
    routine: 'Review code for 20 minutes',
    reward: 'Learn new patterns',
    user_id: 'user-123',
  },
];

describe('HabitCard Component', () => {
  it('renders habit information correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <HabitCard habit={mockHabits[0]} onPress={onPressMock} />
    );
    
    expect(getByText('Morning Meditation')).toBeTruthy();
    expect(getByText('Current: 5 days')).toBeTruthy();
    expect(getByText('Best: 21 days')).toBeTruthy();
  });
  
  it('handles toggle correctly', () => {
    const onPressMock = jest.fn();
    const onToggleMock = jest.fn();
    const { getByTestId } = render(
      <HabitCard 
        habit={mockHabits[0]} 
        onPress={onPressMock} 
        onToggle={onToggleMock} 
      />
    );
    
    // Find the toggle button (checkmark)
    const toggleButton = getByTestId('icon-checkmark-circle-outline');
    fireEvent.press(toggleButton.parent);
    
    // Should call onToggle with true (completed)
    expect(onToggleMock).toHaveBeenCalledWith(true);
  });
});

describe('HabitList Component', () => {
  it('renders loading state correctly', () => {
    const { getByTestId } = render(
      <HabitList isLoading={true} refetch={jest.fn()} />
    );
    
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });
  
  it('renders error state correctly', () => {
    const refetchMock = jest.fn();
    const { getByText } = render(
      <HabitList isLoading={false} isError={true} refetch={refetchMock} />
    );
    
    expect(getByText('Unable to load habits')).toBeTruthy();
    
    // Test retry functionality
    fireEvent.press(getByText('Retry'));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
  
  it('renders empty state correctly', () => {
    const { getByText } = render(
      <HabitList isLoading={false} habits={[]} refetch={jest.fn()} />
    );
    
    expect(getByText('No habits yet')).toBeTruthy();
    
    // Test create action
    fireEvent.press(getByText('Create a habit'));
    expect(router.push).toHaveBeenCalledWith('/planner/add-habit');
  });
  
  it('renders habits correctly', () => {
    const { getAllByText } = render(
      <HabitList isLoading={false} habits={mockHabits} refetch={jest.fn()} />
    );
    
    // Should render both habits
    expect(getAllByText(/Morning Meditation|Code Review/).length).toBe(2);
  });
  
  it('calls onToggleHabit when provided', () => {
    const onToggleHabitMock = jest.fn();
    const { getByText, getAllByTestId } = render(
      <HabitList 
        isLoading={false} 
        habits={mockHabits} 
        refetch={jest.fn()} 
        onToggleHabit={onToggleHabitMock} 
      />
    );
    
    // Find the first habit's toggle button
    const toggleButtons = getAllByTestId('icon-checkmark-circle-outline');
    fireEvent.press(toggleButtons[0].parent);
    
    // Should call onToggleHabit with the habit ID and completion status
    expect(onToggleHabitMock).toHaveBeenCalledWith('habit-1', true);
  });
});
