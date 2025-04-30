// Compass screen with Principles and States tabs
import React, { useState } from 'react';
import { YStack, XStack, Text, Tabs, Button, ScrollView } from 'tamagui'; 
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc, type RouterOutputs } from '@/utils/trpc'; 
import { useColorScheme } from '@/hooks/useColorScheme'; 
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { router, type Href } from 'expo-router'; 
import { PrincipleCard } from '@/components/compass/PrincipleCard';
import PrinciplesTab from '@/components/compass/PrinciplesTab';
import { StateDefinitionCard } from '@/components/compass/StateDefinitionCard'; 

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

  const handleAddPress = () => {
    const route = `/compose?type=${activeTab === 'principles' ? 'value' : 'state'}` as Href;
    router.push(route);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize={24} fontWeight="bold">Compass</Text>
          <Button
            size="$3"
            circular
            onPress={handleAddPress} 
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
                  {React.cloneElement(tab.icon as React.ReactElement, { color: activeTab === tab.key ? '$colorFocus' : '$color' })}
                  <Text color={activeTab === tab.key ? '$colorFocus' : '$color'}>{tab.title}</Text>
                </XStack>
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {/* Tab Content */}
          <Tabs.Content value="principles" flex={1} key="principles-content">
            <ScrollView>
              <PrinciplesTab />
            </ScrollView>
          </Tabs.Content>

          <Tabs.Content value="states" flex={1} key="states-content">
            <ScrollView>
              <StatesTab />
            </ScrollView>
          </Tabs.Content>
        </Tabs>
      </YStack>
    </SafeAreaView>
  );
}

// Define the specific types from RouterOutputs
// Types are now defined in the PrinciplesTab component
type StateDefinition = RouterOutputs['state']['getDefinitions'][number]; 

// Principles Tab Component is now imported from '@/components/compass/PrinciplesTab'

// States Tab Component (manages data fetching and list rendering)
function StatesTab() {
  const { data: states, isLoading, error, refetch } = trpc.state.getDefinitions.useQuery(); 

  if (isLoading) {
    return <EmptyOrSkeleton isLoading={true} count={3} type="card" />;
  }

  if (error) {
    return (
      <EmptyOrSkeleton
        isEmpty={false}
        isError={true}
        onRetry={refetch}
        text="Failed to load tracked state definitions"
      />
    );
  }

  if (!states || states.length === 0) {
    return (
      <EmptyOrSkeleton
        isEmpty={true}
        text="No state definitions found"
        actionText="Define Your First State"
        onAction={() => router.push('/compose?type=state' as Href)}
      />
    );
  }

  return (
    <YStack space="$3"> 
      {states.map((state: StateDefinition) => (
        <StateDefinitionCard
          key={state.id}
          state={state}
          onPress={() => router.push(`/states/${state.id}` as Href)}
        />
      ))}
    </YStack>
  );
}

// 
// Removed inline PrincipleCard definition (extracted to components/compass/PrincipleCard.tsx)
// 

// 
// Removed inline StateDefinitionCard definition (extracted to components/compass/StateDefinitionCard.tsx)
// 
