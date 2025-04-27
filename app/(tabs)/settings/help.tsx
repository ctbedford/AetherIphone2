// Placeholder for Help Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Help & Support</H1>
        <Text>FAQ, contact support link, etc.</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
