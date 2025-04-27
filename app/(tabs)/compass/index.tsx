// Compass screen with Principles and States tabs
import React, { useState } from 'react';
import { YStack, XStack, Text, Tabs, Button, ScrollView, Card, useTheme } from 'tamagui';
import { SafeAreaView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '@/utils/trpc';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { RouterOutputs } from '@/utils/trpc';
import { router } from 'expo-router';

interface TabData {
  key: string;
  title: string;
  icon: React.ReactNode;
}

// Tab configurations
const TABS: TabData[] = [
  {
    key: 'principles',
    title: 'Principles',
    icon: <Ionicons name="compass-outline" size={18} color="currentColor" />
  },
  {
    key: 'states',
    title: 'States',
    icon: <Ionicons name="pulse-outline" size={18} color="currentColor" />
  }
];

export default function CompassScreen() {
  const [activeTab, setActiveTab] = useState<string>('principles');
  const colorScheme = useColorScheme();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize={24} fontWeight="bold">Compass</Text>
          <Button
            size="$3"
            circular
            onPress={() => {/* Handle add principle/state */}}
            icon={<Ionicons name="add" size={22} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          />
        </XStack>
        
        {/* Tabs */}
        <Tabs
          defaultValue="principles"
          orientation="horizontal"
          flexDirection="column"
          flex={1}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <Tabs.List 
            backgroundColor="$backgroundStrong"
            paddingHorizontal="$2"
            borderRadius="$4"
            marginBottom="$4"
          >
            {TABS.map((tab) => (
              <Tabs.Tab
                key={tab.key}
                flex={1}
                value={tab.key}
                padding="$3"
                borderRadius="$2"
                backgroundColor={activeTab === tab.key ? '$backgroundFocus' : 'transparent'}
              >
                <XStack space="$2" justifyContent="center" alignItems="center">
                  {tab.icon}
                  <Text>{tab.title}</Text>
                </XStack>
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {/* Tab Content */}
          <Tabs.Content value="principles" flex={1}>
            <ScrollView>
              <PrinciplesTab />
            </ScrollView>
          </Tabs.Content>
          
          <Tabs.Content value="states" flex={1}>
            <ScrollView>
              <StatesTab />
            </ScrollView>
          </Tabs.Content>
        </Tabs>
      </YStack>
    </SafeAreaView>
  );
}

// Principles Tab
function PrinciplesTab() {
  const theme = useTheme();
  // Fetch principles (values) using tRPC
  const { data: principles, isLoading, error, refetch } = trpc.value.getValues.useQuery();
  
  // Define the inferred type
  type PrincipleValue = RouterOutputs['value']['getValues'][number];

  if (isLoading) {
    return <EmptyOrSkeleton isLoading={true} count={3} type="card" />;
  }
  
  if (error) {
    return (
      <EmptyOrSkeleton isEmpty={false} isError={true} onRetry={refetch} text="Failed to load principles" />
    );
  }
  
  if (!principles || principles.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty={true} 
        text="No principles defined yet" 
        actionText="Add Your First Principle" 
        // TODO: Create '/compass/add-value' route 
        // onAction={() => router.push('/compass/add-value')} // Navigate to add screen
      />
    );
  }
  
  return (
    <YStack space="$4">
      {principles.map((principle: PrincipleValue) => (
        <Card key={principle.id} padding="$4" bordered elevation="$1">
          <Text fontSize="$5" fontWeight="bold">{principle.name}</Text>
          {principle.description && (
            <Text color="$gray10" marginTop="$2">{principle.description}</Text>
          )}
        </Card>
      ))}
    </YStack>
  );
}

// States Tab
function StatesTab() {
  const theme = useTheme();
  // Fetch states using tRPC
  const { data: states, isLoading, error, refetch } = trpc.state.getTrackedStates.useQuery({}); // Pass empty object as input

  // Define the inferred type
  type TrackedStateItem = RouterOutputs['state']['getTrackedStates'][number];
  
  if (isLoading) {
    return <EmptyOrSkeleton isLoading={true} count={3} type="card" />;
  }
  
  if (error) {
    return (
      <EmptyOrSkeleton isEmpty={false} isError={true} onRetry={refetch} text="Failed to load states" />
    );
  }
  
  if (!states || states.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty={true} 
        text="No states defined yet" 
        actionText="Add Your First State" 
        // TODO: Create '/compass/add-state' route
        // onAction={() => router.push('/compass/add-state')} // Navigate to add screen
      />
    );
  }
  
  return (
    <YStack space="$4">
      {states.map((state: TrackedStateItem) => (
        <Card key={state.id} padding="$4" bordered elevation="$1">
          <XStack alignItems="center" space="$3">
            <Text fontSize="$5" fontWeight="bold">{state.name}</Text>
          </XStack>
          {state.category && (
            <Text color="$gray10" marginTop="$2">Category: {state.category}</Text>
          )}
        </Card>
      ))}
    </YStack>
  );
}
