import React from 'react';
import { YStack, Text, Button, XStack, H4, useTheme } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ title, message, onRetry }: ErrorBannerProps) {
  const theme = useTheme();

  const red3 = theme?.red3?.val ?? '#fee2e2';
  const red5 = theme?.red5?.val ?? '#f87171';
  const red6 = theme?.red6?.val ?? '#ef4444';
  const red7 = theme?.red7?.val ?? '#dc2626';
  const red10 = theme?.red10?.val ?? '#991b1b';
  const red11 = theme?.red11?.val ?? '#7f1d1d';

  return (
    <YStack 
      backgroundColor={red3} 
      borderColor={red7} 
      borderWidth={1} 
      borderRadius="$3"
      padding="$3"
      space="$2"
      alignItems="center"
    >
      <XStack width="100%" justifyContent="space-between" alignItems="center">
        <H4 color={red11}>{title || 'Error'}</H4> 
        {/* Optional: Add an icon */} 
        {/* <Ionicons name="alert-circle-outline" size={20} color={red10} /> */} 
      </XStack>
      <Text color={red11}>{message}</Text> 
      {onRetry && (
        <Button 
          // theme="red" 
          icon={<Ionicons name="refresh" size={16} color={red11} />} 
          onPress={onRetry}
          size="$2"
          backgroundColor={red5} 
          borderColor={red7} 
          borderWidth={1}
          pressStyle={{ backgroundColor: red6 }}
        >
          <Text color={red11}>Retry</Text>
        </Button>
      )}
    </YStack>
  );
}

interface SectionErrorProps {
  message: string;
  onRetry?: () => void;
}

export function SectionError({ message, onRetry }: SectionErrorProps) {
  const theme = useTheme();

  const red3 = theme?.red3?.val ?? '#fee2e2';
  const red5 = theme?.red5?.val ?? '#f87171';
  const red6 = theme?.red6?.val ?? '#ef4444';
  const red7 = theme?.red7?.val ?? '#dc2626';
  const red10 = theme?.red10?.val ?? '#991b1b';
  const red11 = theme?.red11?.val ?? '#7f1d1d';

  return (
    <YStack 
      padding="$3" 
      borderRadius="$3" 
      borderWidth={1} 
      borderColor={red7} 
      backgroundColor={red3} 
      alignItems="center" 
      space="$2"
    >
      <Ionicons name="warning-outline" size={24} color={red10} /> 
      <Text color={red11} textAlign="center"> 
        {message || 'Failed to load this section.'}
      </Text>
      {onRetry && (
        <Button 
          size="$2" 
          // theme="red"
          backgroundColor={red5} 
          icon={<Ionicons name="refresh" size={16} color={red11} />} 
          onPress={onRetry}
          pressStyle={{ backgroundColor: red6 }}
          borderColor={red7} 
          borderWidth={1} 
        >
          <Text color={red11}>Retry</Text>
        </Button>
      )}
    </YStack>
  );
}
