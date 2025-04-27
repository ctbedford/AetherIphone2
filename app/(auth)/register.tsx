// Register Screen
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { YStack, H1, Input, Button, Text, XStack, Spinner, Image } from 'tamagui';
import { supabase } from '@/utils/supabase';
import { useToastController } from '@tamagui/toast';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToastController();

  // Create new account with Supabase authentication
  const handleRegister = async () => {
    if (!email || !password) {
      toast.show('Please enter both email and password', { type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      toast.show('Passwords do not match', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window?.location?.origin || undefined,
        }
      });

      if (error) throw error;

      // Navigate to home screen on successful registration
      toast.show('Account created successfully!', { type: 'success' });
      router.replace('/(tabs)/home');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
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
          width={100} 
          height={100} 
          marginBottom="$6" 
          resizeMode="contain"
        />
        <H1>Create Account</H1>
        <Text color="$gray10">Sign up to get started</Text>
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
      
      <Input
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button
        onPress={handleRegister}
        disabled={loading}
        backgroundColor="$blue10"
        color="white"
        size="$5"
      >
        {loading ? <Spinner color="white" /> : 'Create Account'}
      </Button>

      <XStack justifyContent="center" paddingTop="$2">
        <Text color="$gray10">Already have an account? </Text>
        <Link href="/(auth)/login">
          <Text color="$blue10">Sign In</Text>
        </Link>
      </XStack>
    </YStack>
  );
}
