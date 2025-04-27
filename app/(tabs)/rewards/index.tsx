// Rewards screen with grid/list toggle and claim functionality
import React, { useState } from 'react';
import { YStack, XStack, Text, Button, ScrollView, Card, Checkbox, useTheme, H1 } from 'tamagui';
import { SafeAreaView, View, FlatList, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '@/utils/trpc';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  imagePath?: string;
  claimed: boolean;
}

enum ViewMode {
  Grid = 'grid',
  List = 'list'
}

export default function RewardsScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const colorScheme = useColorScheme();
  const theme = useTheme();
  
  // In a real implementation, you would fetch rewards from tRPC
  // const { data: rewards, isLoading, error, refetch } = trpc.rewards.list.useQuery();
  
  // For now, we'll use mock data
  const rewards: Reward[] = [
    { 
      id: '1', 
      title: 'Movie Night', 
      description: 'Take a break and enjoy a movie of your choice', 
      pointCost: 50, 
      claimed: false,
      imagePath: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=300&auto=format&fit=crop'
    },
    { 
      id: '2', 
      title: 'Coffee Break', 
      description: 'A nice coffee break during your workday', 
      pointCost: 20, 
      claimed: false,
      imagePath: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop'
    },
    { 
      id: '3', 
      title: 'Day Off', 
      description: 'Take a day off to recharge and rest', 
      pointCost: 200, 
      claimed: false,
      imagePath: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?q=80&w=300&auto=format&fit=crop'
    },
    { 
      id: '4', 
      title: 'Special Meal', 
      description: 'Treat yourself to a special meal at your favorite restaurant', 
      pointCost: 100, 
      claimed: false,
      imagePath: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=300&auto=format&fit=crop'
    },
    { 
      id: '5', 
      title: 'New Book', 
      description: 'Buy yourself a new book you have been wanting to read', 
      pointCost: 40, 
      claimed: true,
      imagePath: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop'
    },
  ];
  
  const handleClaimReward = (id: string) => {
    // In a real app, this would call an API
    console.log(`Claiming reward ${id}`);
    // Show confetti and haptic feedback
  };
  
  const renderItem = ({ item }: { item: Reward }) => {
    if (viewMode === ViewMode.Grid) {
      return (
        <Card
          size="$4"
          bordered
          width={160}
          height={200}
          margin="$2"
          overflow="hidden"
          elevation="$2"
          opacity={item.claimed ? 0.7 : 1}
        >
          <ImageBackground
            source={{ uri: item.imagePath }}
            style={{ width: '100%', height: 100 }}
          >
            <View style={{ 
              position: 'absolute', 
              top: 5, 
              right: 5, 
              backgroundColor: theme.blue10.val, 
              borderRadius: 10,
              padding: 4
            }}>
              <Text color="white" fontSize="$2" fontWeight="bold">
                {item.pointCost} pts
              </Text>
            </View>
          </ImageBackground>
          
          <YStack padding="$2" flex={1} justifyContent="space-between">
            <Text fontSize="$4" fontWeight="bold" numberOfLines={1}>
              {item.title}
            </Text>
            
            <Button
              size="$2"
              themeInverse={item.claimed}
              backgroundColor={item.claimed ? undefined : theme.green9.val}
              onPress={() => handleClaimReward(item.id)}
              disabled={item.claimed}
            >
              {item.claimed ? 'Claimed' : 'Claim'}
            </Button>
          </YStack>
        </Card>
      );
    } else {
      return (
        <Card
          bordered
          margin="$2"
          padding="$3"
          opacity={item.claimed ? 0.7 : 1}
        >
          <XStack space="$3" alignItems="center">
            {item.imagePath && (
              <View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 8, 
                overflow: 'hidden',
                backgroundColor: theme.gray3.val
              }}>
                <ImageBackground
                  source={{ uri: item.imagePath }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            )}
            
            <YStack flex={1} space="$1">
              <Text fontSize="$5" fontWeight="bold">{item.title}</Text>
              <Text fontSize="$3" color="$gray11" numberOfLines={2}>{item.description}</Text>
              <Text fontSize="$3" color="$blue10" fontWeight="500">{item.pointCost} points</Text>
            </YStack>
            
            <Button
              size="$3"
              backgroundColor={item.claimed ? undefined : theme.green9.val}
              themeInverse={item.claimed}
              onPress={() => handleClaimReward(item.id)}
              disabled={item.claimed}
            >
              {item.claimed ? 'Claimed' : 'Claim'}
            </Button>
          </XStack>
        </Card>
      );
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4">
        <YStack space="$4">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <H1>Rewards</H1>
            
            <XStack space="$2">
              <Button
                chromeless
                circular
                padding="$2"
                backgroundColor={viewMode === ViewMode.Grid ? theme.blue5.val : 'transparent'}
                onPress={() => setViewMode(ViewMode.Grid)}
              >
                <Ionicons 
                  name="grid-outline" 
                  size={22} 
                  color={viewMode === ViewMode.Grid ? theme.blue10.val : (colorScheme === 'dark' ? '#fff' : '#000')} 
                />
              </Button>
              
              <Button
                chromeless
                circular
                padding="$2"
                backgroundColor={viewMode === ViewMode.List ? theme.blue5.val : 'transparent'}
                onPress={() => setViewMode(ViewMode.List)}
              >
                <Ionicons 
                  name="list-outline" 
                  size={22} 
                  color={viewMode === ViewMode.List ? theme.blue10.val : (colorScheme === 'dark' ? '#fff' : '#000')} 
                />
              </Button>
            </XStack>
          </XStack>
          
          {/* Stats */}
          <Card padding="$3" backgroundColor="$blue2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="$blue11">Your Points</Text>
              <Text fontSize="$6" fontWeight="bold" color="$blue10">275</Text>
            </XStack>
          </Card>
        </YStack>
        
        {/* Rewards List/Grid */}
        {viewMode === ViewMode.Grid ? (
          <FlatList
            data={rewards}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingVertical: 10 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
          />
        ) : (
          <FlatList
            data={rewards}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
