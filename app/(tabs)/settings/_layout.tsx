// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/settings/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The index screen is the default for the settings tab */}
      <Stack.Screen name="index" />
      {/* Add screens for the sub-pages */}
      <Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="security" options={{ title: 'Security' }} />
      <Stack.Screen name="privacy" options={{ title: 'Data & Privacy' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="about" options={{ title: 'About Aether' }} />
    </Stack>
  );
}
