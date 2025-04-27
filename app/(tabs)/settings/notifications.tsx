// Placeholder for Notification Settings Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Notification Settings</H1>
        <Text>Granular controls for different notification types.</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
