import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time of 5 minutes
      staleTime: 1000 * 60 * 5,
      // When offline, keep data fresh for 24 hours (cacheTime was renamed to gcTime)
      gcTime: 1000 * 60 * 60 * 24,
      // Retry failed queries 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for mobile
      refetchOnWindowFocus: false,
      // Show stale data while fetching new data (renamed from keepPreviousData)
      placeholderData: 'keepPrevious',
    },
    mutations: {
      // Retry failed mutations 3 times
      retry: 3,
      // Enable offline mutations
      networkMode: 'offlineFirst',
    },
  },
});

// Create a persister
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'aether-query-cache-v1',
  // Only persist queries with a longer cacheTime
  throttleTime: 1000,
  // SerDe for serializing/deserializing the data
  serialize: data => JSON.stringify(data),
  deserialize: data => JSON.parse(data),
});

/**
 * Initialize network monitoring for the query client
 * Call this on app startup to enable online/offline detection
 */
export function initializeNetworkMonitoring(): () => void {
  // Subscribe to network status changes
  const unsubscribe = NetInfo.addEventListener(state => {
    onlineManager.setOnline(
      state.isConnected != null && 
      state.isConnected && 
      Boolean(state.isInternetReachable)
    );
  });

  // Initialize once at startup - check if online
  NetInfo.fetch().then(state => {
    onlineManager.setOnline(
      state.isConnected != null && 
      state.isConnected && 
      Boolean(state.isInternetReachable)
    );
  });

  return unsubscribe;
}

/**
 * Resume any paused mutations when the app comes back online
 * 
 * @returns A promise that resolves when mutations are resumed
 */
export async function resumeMutationsAndInvalidate(): Promise<void> {
  try {
    await queryClient.resumePausedMutations();
    queryClient.invalidateQueries();
  } catch (error) {
    console.error('Error resuming mutations:', error);
  }
} 