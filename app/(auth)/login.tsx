// Login Screen
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { YStack, H1, Input, Button, Text, XStack, Spinner } from 'tamagui';
import { Image } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useToastController } from '@tamagui/toast';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToastController();

  // Sign in with Supabase authentication
  const handleLogin = async () => {
    if (!email || !password) {
      toast.show('Please enter both email and password', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Navigate to home screen on successful login
      router.replace('/(tabs)/home');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.show(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} padding="$4" justifyContent="center" space="$4" backgroundColor="$background">
      <YStack alignItems="center" marginBottom="$6">
        {/* Replace with your app logo */}
        <Image 
          source={require('@/assets/images/icon.png')} 
          style={{ width: 100, height: 100, marginBottom: 24 }} 
          resizeMode="contain"
        />
        <H1>Welcome to Aether</H1>
        <Text color="$gray10">Sign in to your account</Text>
      </YStack>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        onPress={handleLogin}
        disabled={loading}
        backgroundColor="$blue10"
        color="white"
        size="$5"
      >
        {loading ? <Spinner color="white" /> : 'Sign In'}
      </Button>

      <XStack justifyContent="space-between" paddingTop="$2">
        <Link href="/(auth)/forgot-password">
          <Text color="$blue10">Forgot Password?</Text>
        </Link>

        <Link href="/(auth)/register">
          <Text color="$blue10">Create Account</Text>
        </Link>
      </XStack>
    </YStack>
  );
}
