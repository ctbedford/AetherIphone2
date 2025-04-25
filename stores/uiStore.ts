import { create } from 'zustand';

interface UiState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Simple Zustand store for UI state (e.g., theme)
export const useUiStore = create<UiState>((set) => ({
  isDarkMode: false, // Default to light mode
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
})); 