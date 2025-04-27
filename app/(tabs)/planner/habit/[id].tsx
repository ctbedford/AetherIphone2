// Placeholder for Habit Detail Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Habit Detail: {id}</H1>
        <Text>Details for habit {id} will be displayed here.</Text>
        {/* Add tRPC query to fetch habit data based on id */}
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
