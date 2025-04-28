import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import HabitCheckItem from '../../../components/dashboard/HabitCheckItem';
import { trpc } from '../../../utils/trpc';

// Mock the trpc hook
jest.mock('../../../utils/trpc', () => ({
  trpc: {
    habit: {
      toggleHabit: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
          isLoading: false,
          isError: false,
          error: null,
        }),
      },
    },
  },
}));

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

describe('HabitCheckItem', () => {
  const mockHabit = {
    id: 'habit-1',
    title: 'Morning Run',
    streak: 3,
    completed: false,
    best_streak: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with uncompleted habit', () => {
    const { getByText } = render(<HabitCheckItem habit={mockHabit} />);
    
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText('🔥 3 day streak')).toBeTruthy();
    expect(getByText('Check-in')).toBeTruthy();
  });

  it('renders correctly with completed habit', () => {
    const completedHabit = { ...mockHabit, completed: true };
    const { getByText } = render(<HabitCheckItem habit={completedHabit} />);
    
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText('🔥 3 day streak')).toBeTruthy();
    expect(getByText('Done')).toBeTruthy();
  });

  it('toggles habit state on button press and calls mutation', () => {
    const mockToggle = jest.fn();
    const mockMutate = jest.fn();
    
    // Setup the mock mutation
    (trpc.habit.toggleHabit.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      isError: false,
      error: null,
    });

    const { getByText } = render(
      <HabitCheckItem habit={mockHabit} onToggle={mockToggle} />
    );

    // Press the check-in button
    fireEvent.press(getByText('Check-in'));

    // Verify the mutation was called with correct params
    expect(mockMutate).toHaveBeenCalledWith({
      habitId: 'habit-1',
      completed: true,
    });

    // Verify the onToggle prop was called if provided
    expect(mockToggle).toHaveBeenCalledWith('habit-1', true);
  });

  it('handles error state from mutation', async () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Setup the mutation with an error callback
    let errorCallback: (error: any) => void = () => {};
    
    (trpc.habit.toggleHabit.useMutation as jest.Mock).mockImplementation(({ onError }) => {
      errorCallback = onError;
      return {
        mutate: jest.fn(),
        isLoading: false,
        isError: true,
      };
    });

    const { getByText } = render(<HabitCheckItem habit={mockHabit} />);

    // Press the check-in button
    fireEvent.press(getByText('Check-in'));

    // Simulate an error from the server
    await act(async () => {
      errorCallback(new Error('Network error'));
    });

    // Check that error was logged
    expect(console.error).toHaveBeenCalled();

    // Restore console.error
    console.error = originalConsoleError;
  });
});
