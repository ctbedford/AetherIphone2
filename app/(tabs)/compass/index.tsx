// Compass screen with Principles and States tabs
import React, { useState } from 'react';
import { YStack, XStack, Text, Tabs, Button, ScrollView, Card, useTheme } from 'tamagui';
import { SafeAreaView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '@/utils/trpc';
import { useColorScheme } from '@/hooks/useColorScheme';
import EmptyOrSkeleton from '@/components/EmptyOrSkeleton';

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
  // In a real implementation, you would fetch principles from tRPC
  // const { data: principles, isLoading, error, refetch } = trpc.value.list.useQuery();
  
  // For now, we'll use mock data
  const principles = [
    { id: '1', title: 'Be Present', description: 'Focus on the now, not the past or future' },
    { id: '2', title: 'Choose Growth', description: 'Embrace challenges as opportunities to learn' },
    { id: '3', title: 'Practice Gratitude', description: 'Appreciate what you have in your life' },
  ];
  
  const isLoading = false;
  const error = null;
  
  if (isLoading) {
    return <EmptyOrSkeleton isLoading={true} />;
  }
  
  if (error) {
    return (
      <Text color="$red9">Failed to load principles</Text>
    );
  }
  
  if (!principles || principles.length === 0) {
    return (
      <YStack alignItems="center" justifyContent="center" padding="$8">
        <Ionicons name="compass-outline" size={60} color={theme.gray8?.val} />
        <Text textAlign="center" color="$gray9" marginTop="$4">
          No principles defined yet
        </Text>
        <Button marginTop="$4">
          Add Your First Principle
        </Button>
      </YStack>
    );
  }
  
  return (
    <YStack space="$4">
      {principles.map((principle) => (
        <Card key={principle.id} padding="$4" bordered elevation="$1">
          <Text fontSize="$5" fontWeight="bold">{principle.title}</Text>
          <Text color="$gray10" marginTop="$2">{principle.description}</Text>
        </Card>
      ))}
    </YStack>
  );
}

// States Tab
function StatesTab() {
  const theme = useTheme();
  // In a real implementation, you would fetch states from tRPC
  // const { data: states, isLoading, error, refetch } = trpc.trackedState.list.useQuery();
  
  // For now, we'll use mock data
  const states = [
    { id: '1', title: 'Focused', description: 'Deep concentration on a single task' },
    { id: '2', title: 'Creative', description: 'Open to new ideas and thinking broadly' },
    { id: '3', title: 'Reflective', description: 'Thinking about past experiences and learning' },
  ];
  
  const isLoading = false;
  const error = null;
  
  if (isLoading) {
    return <EmptyOrSkeleton isLoading={true} />;
  }
  
  if (error) {
    return (
      <Text color="$red9">Failed to load states</Text>
    );
  }
  
  if (!states || states.length === 0) {
    return (
      <YStack alignItems="center" justifyContent="center" padding="$8">
        <Ionicons name="pulse-outline" size={60} color={theme.gray8?.val} />
        <Text textAlign="center" color="$gray9" marginTop="$4">
          No states defined yet
        </Text>
        <Button marginTop="$4">
          Add Your First State
        </Button>
      </YStack>
    );
  }
  
  return (
    <YStack space="$4">
      {states.map((state) => (
        <Card key={state.id} padding="$4" bordered elevation="$1">
          <XStack alignItems="center" space="$3">
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.blue9?.val }} />
            <Text fontSize="$5" fontWeight="bold">{state.title}</Text>
          </XStack>
          <Text color="$gray10" marginTop="$2">{state.description}</Text>
        </Card>
      ))}
    </YStack>
  );
}
