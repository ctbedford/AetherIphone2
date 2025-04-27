// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/_layout.tsx
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Providers } from '../providers/Providers'; // Adjust path if necessary
import { useFonts } from 'expo-font'; // Assuming you might load fonts

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Example: Load fonts here if needed
  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    // Add other fonts if you have them
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Render nothing while fonts are loading (Splash Screen is active)
  }

  return (
    <SafeAreaProvider>
      <Providers>
        <Slot />
      </Providers>
    </SafeAreaProvider>
  );
}

// It's good practice to define a RootLayoutNav for type safety if needed,
// but for basic structure, the default export is sufficient.
