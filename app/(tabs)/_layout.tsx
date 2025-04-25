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
        name="home" // Matches the 'home' folder name
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner" // Matches the 'planner' folder name
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compass" // Matches the 'compass' folder name
        options={{
          title: 'Compass',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards" // Matches the 'rewards' folder name
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings" // Matches the 'settings' folder name
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
