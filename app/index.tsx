// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/index.tsx
import { Redirect } from 'expo-router';

export default function RootIndex() {
  // Redirect directly to a specific tab without causing infinite redirects
  // Use the path that matches how it's accessed in the proper format
  // TypeScript suggests this is the correct format for Expo Router
  return <Redirect href="/(tabs)/home" />;
}
