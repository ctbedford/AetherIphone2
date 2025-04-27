// Forgot Password Screen
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { YStack, H1, Input, Button, Text, Spinner, Image } from 'tamagui';
import { supabase } from '@/utils/supabase';
import { useToastController } from '@tamagui/toast';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToastController();

  // Send password reset email via Supabase
  const handleResetPassword = async () => {
    if (!email) {
      toast.show('Please enter your email', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window?.location?.origin ? `${window.location.origin}/update-password` : undefined,
      });

      if (error) throw error;

      setSuccess(true);
      toast.show('Password reset email sent!', { type: 'success' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
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
        <H1>Reset Password</H1>
        <Text color="$gray10" textAlign="center">
          {success 
            ? 'Check your email for reset instructions' 
            : 'Enter your email to receive reset instructions'}
        </Text>
      </YStack>

      {!success ? (
        <>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Button
            onPress={handleResetPassword}
            disabled={loading}
            backgroundColor="$blue10"
            color="white"
            size="$5"
          >
            {loading ? <Spinner color="white" /> : 'Send Reset Link'}
          </Button>
        </>
      ) : null}

      <YStack paddingTop="$6" alignItems="center">
        <Link href="/(auth)/login">
          <Text color="$blue10">Back to Sign In</Text>
        </Link>
      </YStack>
    </YStack>
  );
}
