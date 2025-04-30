// app/_layout.tsx
import '../tamagui.config'; // Import config first!

import React, { useCallback, useEffect, useState, ReactNode, createContext, useContext } from 'react';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui'; // Will be gradually removed
import { GluestackProvider } from '@/providers/GluestackProvider'; // New UI provider
// tamagui config is already imported at the top of the file
import type { ThemeName } from '@tamagui/core'; // Ensure ThemeName is imported from @tamagui/core
import * as SecureStore from 'expo-secure-store'; // Import SecureStore

import { supabase } from '@/utils/supabase';

import type { Session } from '@supabase/supabase-js';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/* ------------------------------------------------------------------ */
/*  1. Simple Auth-aware context                                       */
/* ------------------------------------------------------------------ */
interface AuthCtx {
  session: Session | null;
  isLoading: boolean;
}
export const AuthContext = React.createContext<AuthCtx>({
  session: null,
  isLoading: true,
});
export const useAuth = () => React.useContext(AuthContext);

/* ------------------------------------------------------------------ */
/*  2. The actual Provider                                             */
/* ------------------------------------------------------------------ */
function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setIsLoading(false);
      console.log('Initial session check:', data.session ? 'Session found' : 'No session');
    }).catch(error => {
        console.error("Error getting initial session:", error);
        setIsLoading(false);
    });

    // Subscribe to auth changes (login / logout / token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        console.log('Auth state changed:', _event, newSession ? 'New session' : 'No session');
        setSession(newSession ?? null);
        // If the event is SIGNED_IN or TOKEN_REFRESHED, loading might briefly be true again
        // depending on how you handle redirects, but usually setting session is enough.
        // If SIGNED_OUT, ensure loading is false.
        if (_event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Enforce splash-screen logic & route guarding                    */
/* ------------------------------------------------------------------ */
function Root() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments(); // e.g., ["(tabs)", "home"] or ["(auth)", "login"]

  /* Load Fonts ----------------------------------------------------- */
  const [fontsLoaded, fontError] = useFonts({
    // Ensure font names match those used in tamagui.config.ts
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  /* Handle Font Loading & Errors ----------------------------------- */
  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
      // Decide how to handle font errors - maybe show an error message?
      // For now, we still need to hide splash eventually.
      SplashScreen.hideAsync();
    }
  }, [fontError]);

  /* Redirect Logic ------------------------------------------------- */
  useEffect(() => {
    // Wait until auth state is confirmed AND fonts are potentially loaded
    if (isLoading || !fontsLoaded && !fontError) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log(`Auth State: isLoading=${isLoading}, session=${!!session}, inAuthGroup=${inAuthGroup}, segments=${segments.join('/')}`);

    if (!session && !inAuthGroup) {
      console.log('Redirecting to login...');
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      console.log('Redirecting to home...');
      router.replace('/(tabs)/home');
    } else {
        console.log('No redirect needed.');
    }
  }, [isLoading, session, segments, router, fontsLoaded, fontError]);

  /* Hide splash only when fonts loaded/error AND auth check done ---- */
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
        console.log('Hiding SplashScreen...');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  /* Show loading indicator until ready ----------------------------- */
  if (!fontsLoaded && !fontError || isLoading) {
    // Optionally, return the Splash Screen component itself or a custom loading view
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' /* Approx dark bg */ }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // Once loaded and auth checked, render the content based on route
  return (
    <>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Slot />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Wrap everything with SafeArea, Providers, etc.                  */
/* ------------------------------------------------------------------ */
import { ToastProvider, Toast, useToastState, ToastViewport } from '@tamagui/toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from '@tamagui/lucide-icons';
import { YStack, XStack } from 'tamagui';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

const ACCENT_COLOR_KEY = 'userAccentColor';
const DEFAULT_ACCENT = 'blue'; // Set your default accent color theme name here

// Context to provide accent update function down the tree
const AccentContext = createContext({
  setAccent: (color: string) => {},
});
export const useAccent = () => useContext(AccentContext);

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const themeMode = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <ToastProvider swipeDirection="horizontal" duration={6000}>
      <Slot />
      <CurrentToast />
      <ToastViewport name="DefaultViewport" top={40} left={0} right={0} /> 
    </ToastProvider>
  );
}

function CurrentToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) {
    return null;
  }

  const toastType = currentToast.customData?.type || 'info'; // Default to 'info'
  let themeName = 'toast_info'; // Default theme
  let IconComponent = Info;

  switch (toastType) {
    case 'success':
      themeName = 'toast_success';
      IconComponent = CheckCircle;
      break;
    case 'error':
      themeName = 'toast_error';
      IconComponent = AlertCircle;
      break;
    case 'warning':
      themeName = 'toast_warning';
      IconComponent = AlertTriangle;
      break;
  }

  return (
    <Theme name={themeName as ThemeName}> {/* Cast themeName to ThemeName */}
      <Toast
        key={currentToast.id}
        duration={currentToast.duration}
        enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
        exitStyle={{ opacity: 0, scale: 0.95, y: -10 }} // Adjusted exit style slightly
        y={0}
        opacity={1}
        scale={1}
        animation="bouncy" // Apply bouncy animation
        viewportName={currentToast.viewportName ?? 'DefaultViewport'}
        backgroundColor="$background" // Use background from the wrapped theme
        padding="$3"
        borderRadius="$4"
        marginHorizontal="$4"
        elevate
        shadowColor="$shadowColor"
      >
        <YStack space="$1">
          <XStack space="$2" alignItems="center">
            <IconComponent size={18} color="$color" /> {/* Use color from the wrapped theme */}
            <Toast.Title color="$color">{currentToast.title}</Toast.Title> {/* Use color from the wrapped theme */}
          </XStack>
          {!!currentToast.message && (
            <Toast.Description color="$color"> {/* Use color from the wrapped theme */}
              {currentToast.message}
            </Toast.Description>
          )}
        </YStack>
      </Toast>
    </Theme>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);

  // Load accent color on mount
  useEffect(() => {
    const loadAccent = async () => {
      try {
        const savedAccent = await SecureStore.getItemAsync(ACCENT_COLOR_KEY);
        if (savedAccent) {
          setAccentColor(savedAccent);
        }
      } catch (error) {
        console.error('Failed to load accent color:', error);
      }
    };
    loadAccent();
  }, []);

  // Function to update and save accent color
  const handleSetAccent = useCallback(async (newColor: string) => {
    try {
      await SecureStore.setItemAsync(ACCENT_COLOR_KEY, newColor);
      setAccentColor(newColor);
    } catch (error) {
      console.error('Failed to save accent color:', error);
    }
  }, []);

  return (
    <AccentContext.Provider value={{ setAccent: handleSetAccent }}>
      <Theme name={accentColor as ThemeName}> {/* Cast accentColor to ThemeName */}
        {children}
      </Theme>
    </AccentContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Gluestack Provider (wraps everything for migration) */}
        <GluestackProvider>
          {/* Core Providers (Tamagui, QueryClient, tRPC) */}
          <Providers>
            {/* Auth Provider manages session state */}
            <AuthProvider>
              {/* Root handles splash, font loading, and redirects */}
              <RootLayoutNav />
            </AuthProvider>
          </Providers>
        </GluestackProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
