// app/values/[id].tsx
import React from 'react';
import { YStack, Text, H2, Paragraph, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ValueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // TODO: Fetch value details using trpc.value.getValueById.useQuery({ id })

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" space="$4">
        <H2>Principle Detail</H2>
        <Paragraph>Details for Principle (Value) with ID: {id}</Paragraph>
        {/* TODO: Display actual value details and add edit functionality */}
        <Button onPress={() => router.back()}>Go Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
