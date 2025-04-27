import React from 'react';
import { YStack, H1, Text, Button, ScrollView } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function AddHabitScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <YStack flex={1} padding="$4" space="$4">
          <H1>Add New Habit</H1>
          <Text>Form to add a new habit will go here.</Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
