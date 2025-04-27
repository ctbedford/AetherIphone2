// Rewards screen with grid/list toggle and claim functionality
import React, { useState, useCallback } from 'react';
import { YStack, XStack, Text, Button, ScrollView, Card, Checkbox, useTheme, H1 } from 'tamagui';
import { SafeAreaView, View, FlatList, ImageBackground, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '@/utils/trpc';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RouterOutputs } from '@/utils/trpc'; // Import RouterOutputs
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton'; // Import helper component

// Define inferred type for rewards
type RewardItem = RouterOutputs['rewards']['getAvailableRewards'][number];

enum ViewMode {
  Grid = 'grid',
  List = 'list'
}

export default function RewardsScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const colorScheme = useColorScheme();
  const theme = useTheme();
  
  // Fetch available rewards from tRPC
  const { 
    data: rewards, 
    isLoading, 
    error, 
    refetch 
  } = trpc.rewards.getAvailableRewards.useQuery();

  // Mutation for claiming rewards
  const claimMutation = trpc.rewards.earnReward.useMutation({
    onSuccess: (data) => {
      console.log('Reward claimed successfully:', data);
      // Maybe show confetti?
      Alert.alert('Reward Claimed!', `You spent ${data.reward.points_spent} points. Remaining: ${data.remainingPoints}`);
      refetch(); // Refetch the list of available rewards
    },
    onError: (err) => {
      console.error('Failed to claim reward:', err);
      Alert.alert('Claim Failed', err.message || 'Could not claim reward.');
    }
  });
  
  const handleClaimReward = useCallback((id: string) => {
    if (claimMutation.isPending) return; // Prevent double-clicks
    
    Alert.alert(
      'Confirm Claim',
      'Are you sure you want to spend points on this reward?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Claim', 
          onPress: () => {
            claimMutation.mutate({ lootId: id });
          },
          style: 'default'
        }
      ]
    );
  }, [claimMutation]);
  
  const renderItem = ({ item }: { item: RewardItem }) => { // Use inferred type
    // Assuming backend field is image_url, map to imagePath
    const imagePath = item.image_url; 
    // All items from getAvailableRewards are considered claimable (not yet claimed)
    const claimed = false; 
    // Map required_points to pointCost
    const pointCost = item.required_points;

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
          opacity={claimed ? 0.7 : 1}
        >
          <ImageBackground
            source={{ uri: imagePath }}
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
                {pointCost} pts
              </Text>
            </View>
          </ImageBackground>
          
          <YStack padding="$2" flex={1} justifyContent="space-between">
            <Text fontSize="$4" fontWeight="bold" numberOfLines={1}>
              {item.name}
            </Text>
            
            <Button
              size="$2"
              themeInverse={claimed}
              backgroundColor={claimed ? undefined : theme.green9.val}
              onPress={() => handleClaimReward(item.id)}
              disabled={claimed || claimMutation.isPending} // Disable if claimed or mutation pending
            >
              {claimMutation.isPending && claimMutation.variables?.lootId === item.id ? 'Claiming...' : (claimed ? 'Claimed' : 'Claim')}
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
          opacity={claimed ? 0.7 : 1}
        >
          <XStack space="$3" alignItems="center">
            {imagePath && (
              <View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 8, 
                overflow: 'hidden',
                backgroundColor: theme.gray3.val
              }}>
                <ImageBackground
                  source={{ uri: imagePath }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            )}
            
            <YStack flex={1} space="$1">
              <Text fontSize="$5" fontWeight="bold">{item.name}</Text>
              <Text fontSize="$3" color="$gray11" numberOfLines={2}>{item.description}</Text>
              <Text fontSize="$3" color="$blue10" fontWeight="500">{pointCost} points</Text>
            </YStack>
            
            <Button
              size="$3"
              backgroundColor={claimed ? undefined : theme.green9.val}
              themeInverse={claimed}
              onPress={() => handleClaimReward(item.id)}
              disabled={claimed || claimMutation.isPending} // Disable if claimed or mutation pending
            >
              {claimMutation.isPending && claimMutation.variables?.lootId === item.id ? 'Claiming...' : (claimed ? 'Claimed' : 'Claim')}
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
        
        {/* Content Area */} 
        <EmptyOrSkeleton 
          isLoading={isLoading}
          isError={!!error}
          isEmpty={!rewards || rewards.length === 0}
          count={viewMode === ViewMode.Grid ? 4 : 3}
          type={viewMode === ViewMode.Grid ? 'card' : 'row'} // Adjust skeleton type
          text={error ? error.message : "No rewards available right now."}
          actionText="Refresh"
          onRetry={refetch}
          onAction={refetch} // Action for empty state could also be refresh
        >
          <FlatList
            data={rewards}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === ViewMode.Grid ? 2 : 1}
            key={viewMode} // Change key on viewMode switch to force re-render
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </EmptyOrSkeleton>

      </YStack>
    </SafeAreaView>
  );
}
