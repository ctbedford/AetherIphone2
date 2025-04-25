import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QueryClient,
  Mutation,
  MutationCache,
  onlineManager,
} from '@tanstack/react-query';
import {
  persistQueryClient,
  PersistQueryClientOptions,
} from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { useNetInfo, type NetInfoSubscription } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Create a persister for React Query (AsyncStorage-based)
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

/**
 * React Query persistence options for offline support
 */
export const reactQueryPersistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: asyncStoragePersister,
  // Add custom serialization/deserialization if needed
  // We want to persist mutations especially for offline support
  buster: 'v1',
  dehydrateOptions: {
    shouldDehydrateMutation: () => true,
  },
};

/**
 * Hook to resume paused mutations when the device comes back online
 */
export function useResumeNetworkMutations(queryClient: QueryClient) {
  const netInfo = useNetInfo();
  const previousNetworkState = useRef(netInfo.isConnected);
  
  // Update React Query's online status manager
  useEffect(() => {
    onlineManager.setOnline(netInfo.isConnected === true);
  }, [netInfo.isConnected]);
  
  useEffect(() => {
    const isConnectedNow = netInfo.isConnected === true;
    const wasConnected = previousNetworkState.current === true;
    
    // If we just reconnected to the network
    if (isConnectedNow && !wasConnected) {
      console.log('Internet connection restored, resuming paused mutations');
      
      // Resume any paused mutations
      queryClient.resumePausedMutations().then(() => {
        // After resuming mutations, invalidate queries to refresh data
        queryClient.invalidateQueries();
      }).catch((error: Error) => {
        console.error('Error resuming mutations:', error.message);
      });
    }
    
    // Update our ref
    previousNetworkState.current = isConnectedNow;
  }, [netInfo.isConnected, queryClient]);
}

/**
 * Add a visual flag to offline-created items for UI feedback
 */
export function markItemAsOffline<T>(item: T): T & { isOffline: boolean } {
  return {
    ...item,
    isOffline: true,
  };
}

/**
 * Remove the offline flag from an item once it's synced
 */
export function markItemAsSynced<T extends { isOffline?: boolean }>(item: T): T {
  const result = { ...item };
  delete result.isOffline;
  return result;
}

/**
 * Get all pending mutations from the mutation cache
 */
export function getPendingMutations(mutationCache: MutationCache): Mutation[] {
  return mutationCache.getAll().filter((mutation: any) => 
    mutation?.state?.status === 'loading' || 
    (mutation?.state?.status === 'error' && mutation?.state?.isPaused)
  );
}

/**
 * Configure the query client for offline support and network state management
 */
export function configureQueryClientForOffline(queryClient: QueryClient): NetInfoSubscription {
  // Listen to network status changes and update onlineManager
  const unsubscribe = NetInfo.addEventListener(state => {
    onlineManager.setOnline(state.isConnected === true);
  });
  
  // When a mutation fails due to network error, pause it instead of failing
  queryClient.getMutationCache().config.onError = (error: unknown, _variables: unknown, _context: unknown, mutation: any) => {
    // Check if the error is a network error
    if (
      error instanceof Error && 
      (
        error.message.includes('network') || 
        error.message.includes('Network Error') ||
        error.message.includes('Failed to fetch')
      )
    ) {
      console.log('Network error detected, pausing mutation for later retry');
      
      // Pause the mutation instead of failing permanently
      mutation.state.isPaused = true;
    }
  };
  
  // Set up persistence
  persistQueryClient({
    queryClient,
    ...reactQueryPersistOptions,
  });

  // Return unsubscribe function for cleanup
  return unsubscribe;
} 