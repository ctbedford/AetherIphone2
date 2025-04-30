// app/states/[id].tsx
import React from 'react';
import { YStack, Text, H2, Paragraph, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function StateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // TODO: Fetch state definition details using trpc.state.getDefinitionById.useQuery({ id })

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" space="$4">
        <H2>State Definition Detail</H2>
        <Paragraph>Details for State Definition with ID: {id}</Paragraph>
        {/* TODO: Display actual state definition details and add edit functionality */}
        <Button onPress={() => router.back()}>Go Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
