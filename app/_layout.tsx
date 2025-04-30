// app/_layout.tsx
import React, { useCallback, useEffect, useState, ReactNode } from 'react';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import { Providers } from '@/providers/Providers';
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
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Core Providers (Tamagui, QueryClient, tRPC) */}
        <Providers>
          {/* Auth Provider manages session state */}
          <AuthProvider>
            {/* Root handles splash, font loading, and redirects */}
            <Root />
          </AuthProvider>
        </Providers>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
