import React from 'react';
import { YStack, Text, Button, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <YStack
      backgroundColor="$red9"
      borderColor="$red9"
      borderWidth={1}
      borderRadius="$4"
      padding="$3"
      marginVertical="$2"
    >
      <XStack alignItems="center" space="$2">
        <Ionicons name="alert-circle-outline" size={24} color="#E53935" />
        <Text color="white" flex={1}>
          {message}
        </Text>
        {onRetry && (
          <Button
            size="$2"
            backgroundColor="$red9"
            color="white"
            onPress={onRetry}
          >
            Retry
          </Button>
        )}
      </XStack>
    </YStack>
  );
}

interface SectionErrorProps {
  message: string;
  onRetry?: () => void;
}

export function SectionError({ message, onRetry }: SectionErrorProps) {
  return (
    <YStack
      backgroundColor="$gray3"
      borderColor="$red9"
      borderWidth={1}
      borderRadius="$4"
      padding="$3"
      marginVertical="$2"
    >
      <XStack alignItems="center" space="$2">
        <Ionicons name="alert-circle-outline" size={20} color="$red9" />
        <Text color="$red9" fontSize="$3" flex={1}>
          {message}
        </Text>
        {onRetry && (
          <Button
            size="$2"
            backgroundColor="$red9"
            color="$color"
            onPress={onRetry}
          >
            Retry
          </Button>
        )}
      </XStack>
    </YStack>
  );
}
