import React from 'react';
import { render, fireEvent, act } from '../test-utils';
import HabitCheckItem from '@/components/dashboard/HabitCheckItem';
import { trpc } from '@/utils/trpc';

// Mock the trpc hook
jest.mock('@/utils/trpc', () => ({
  trpc: {
    habit: {
      createHabitEntry: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
          isLoading: false,
          isError: false,
          error: null,
        }),
      },
      deleteHabitEntry: {
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
    completedToday: false,
    best_streak: 5,
    user_id: 'user-1',
    cue: 'Wake up',
    routine: 'Run 5k',
    reward: 'Coffee',
    habit_type: 'do',
    frequency_period: 'daily',
    goal_frequency: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with uncompleted habit', () => {
    const { getByText } = render(<HabitCheckItem habit={mockHabit} />);
    
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText(' 3 day streak')).toBeTruthy();
    expect(getByText('Check-in')).toBeTruthy();
  });

  it('renders correctly with completed habit for today', () => {
    const completedHabit = { ...mockHabit, completedToday: true };
    const { getByText } = render(<HabitCheckItem habit={completedHabit} />);
    
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText(' 3 day streak')).toBeTruthy();
    expect(getByText('Done')).toBeTruthy();
  });

  it('calls createHabitEntry mutation when checking in', () => {
    const mockOnToggle = jest.fn();
    const mockCreateMutate = jest.fn();

    // Setup the mock create mutation
    (trpc.habit.createHabitEntry.useMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isLoading: false,
      isError: false,
      error: null,
    });

    const { getByText } = render(
      <HabitCheckItem habit={{...mockHabit, completedToday: false}} onToggle={mockOnToggle} />
    );

    // Press the check-in button
    fireEvent.press(getByText('Check-in'));

    // Verify the create mutation was called
    expect(mockCreateMutate).toHaveBeenCalledWith(expect.objectContaining({
      habitId: 'habit-1',
      date: expect.any(String),
      completed: true,
    }));

    // Verify the onToggle prop was called if provided
    expect(mockOnToggle).toHaveBeenCalledWith('habit-1', true);
  });

  it('calls deleteHabitEntry mutation when unchecking', () => {
    const mockOnToggle = jest.fn();
    const mockDeleteMutate = jest.fn();

    // Setup the mock delete mutation
    (trpc.habit.deleteHabitEntry.useMutation as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isLoading: false,
      isError: false,
      error: null,
    });

    const { getByText } = render(
      <HabitCheckItem habit={{...mockHabit, completedToday: true}} onToggle={mockOnToggle} />
    );

    // Press the done button
    fireEvent.press(getByText('Done'));

    // Verify the delete mutation was called
    expect(mockDeleteMutate).toHaveBeenCalledWith(expect.objectContaining({
      habitId: 'habit-1',
      date: expect.any(String),
    }));

    // Verify the onToggle prop was called if provided
    expect(mockOnToggle).toHaveBeenCalledWith('habit-1', false);
  });

  it('handles error state from mutation', async () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Assume createHabitEntry for error testing, could be delete too
    let errorCallback: (error: any) => void = () => {};
    
    (trpc.habit.createHabitEntry.useMutation as jest.Mock).mockImplementation(({ onError }) => {
      errorCallback = onError;
      return {
        mutate: jest.fn(),
        isLoading: false,
        isError: true,
      };
    });

    const { getByText } = render(<HabitCheckItem habit={mockHabit} />);

    // Press the check-in button (assuming initial state is not completed)
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
