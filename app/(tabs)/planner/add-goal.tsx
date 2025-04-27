// Placeholder for Add Goal Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AddGoalScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Add New Goal</H1>
        <Text>Goal details form will go here.</Text>
        <Button onPress={() => router.back()}>Cancel</Button>
      </YStack>
    </SafeAreaView>
  );
}
