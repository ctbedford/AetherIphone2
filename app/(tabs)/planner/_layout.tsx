// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/planner/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function PlannerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The index screen is the default for the planner tab */}
      <Stack.Screen name="index" />
      {/* Add screens for the sub-pages */}
      <Stack.Screen name="add-task" options={{ presentation: 'modal', title: 'Add Task' }} />
      <Stack.Screen name="add-habit" options={{ presentation: 'modal', title: 'Add Habit' }} />
      <Stack.Screen name="add-goal" options={{ presentation: 'modal', title: 'Add Goal' }} />
      <Stack.Screen name="goal/[id]" options={{ title: 'Goal Details' }} />
      <Stack.Screen name="habit/[id]" options={{ title: 'Habit Details' }} />
    </Stack>
  );
}
