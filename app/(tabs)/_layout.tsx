// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Example icon library
import { useThemeColor } from '@/hooks/useThemeColor'; // Assuming path alias is set

export default function TabLayout() {
  const tabBarActiveTintColor = useThemeColor({}, 'tabIconSelected');
  const tabBarInactiveTintColor = useThemeColor({}, 'tabIconDefault');
  const backgroundColor = useThemeColor({}, 'background'); // Use standard background color

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          // Add other styles like borderTopColor if needed
        },
        headerShown: false, // We might handle headers inside each screen or using Stack
      }}
    >
      <Tabs.Screen
        name="home" // Just the folder name, not the path with index
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner" // Just the folder name, not the path with index
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compass" // Just the folder name, not the path with index
        options={{
          title: 'Compass',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards" // Just the folder name, not the path with index
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings" // Just the folder name, not the path with index
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
