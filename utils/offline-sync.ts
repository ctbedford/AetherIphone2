import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { queryClient } from './query-client';
import { supabase } from './supabase';

// Keys for offline data
const OFFLINE_MUTATIONS_KEY = 'aether-offline-mutations';
const PENDING_ITEMS_KEY = 'aether-pending-items';

// Types
export interface PendingItem {
  id: string;
  type: string;
  data: any;
  createdAt: number;
  isNotSynced: boolean;
}

interface OfflineMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
}

/**
 * Save a mutation to be processed when back online
 */
export async function saveOfflineMutation(
  type: 'create' | 'update' | 'delete',
  entity: string,
  data: any
): Promise<string> {
  try {
    // Generate a temporary ID for new items
    const id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create mutation object
    const mutation: OfflineMutation = {
      id,
      type,
      entity,
      data,
      timestamp: Date.now(),
    };
    
    // Get existing mutations
    const existingMutationsStr = await AsyncStorage.getItem(OFFLINE_MUTATIONS_KEY);
    const existingMutations: OfflineMutation[] = existingMutationsStr 
      ? JSON.parse(existingMutationsStr) 
      : [];
    
    // Add new mutation
    existingMutations.push(mutation);
    
    // Save mutations back to storage
    await AsyncStorage.setItem(OFFLINE_MUTATIONS_KEY, JSON.stringify(existingMutations));
    
    // Also add to pending items for UI
    if (type === 'create' || type === 'update') {
      await addToPendingItems(id, entity, data);
    }
    
    return id;
  } catch (error) {
    console.error('Error saving offline mutation:', error);
    throw error;
  }
}

/**
 * Add an item to the pending items list for UI display
 */
async function addToPendingItems(id: string, type: string, data: any): Promise<void> {
  try {
    const existingItemsStr = await AsyncStorage.getItem(PENDING_ITEMS_KEY);
    const existingItems: PendingItem[] = existingItemsStr 
      ? JSON.parse(existingItemsStr)
      : [];
    
    // Create a pending item
    const pendingItem: PendingItem = {
      id,
      type,
      data,
      createdAt: Date.now(),
      isNotSynced: true,
    };
    
    // Add to list
    existingItems.push(pendingItem);
    
    // Save back to storage
    await AsyncStorage.setItem(PENDING_ITEMS_KEY, JSON.stringify(existingItems));
  } catch (error) {
    console.error('Error adding to pending items:', error);
  }
}

/**
 * Get all pending items for a specific type
 */
export async function getPendingItems(type: string): Promise<PendingItem[]> {
  try {
    const itemsStr = await AsyncStorage.getItem(PENDING_ITEMS_KEY);
    if (!itemsStr) return [];
    
    const items: PendingItem[] = JSON.parse(itemsStr);
    return items.filter(item => item.type === type);
  } catch (error) {
    console.error('Error getting pending items:', error);
    return [];
  }
}

/**
 * Synchronize offline mutations with the server
 */
export async function syncOfflineMutations(): Promise<boolean> {
  try {
    // Check if we're online
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
      console.log('Not connected to the internet, skipping sync');
      return false;
    }
    
    // Get all pending mutations
    const mutationsStr = await AsyncStorage.getItem(OFFLINE_MUTATIONS_KEY);
    if (!mutationsStr) return true; // Nothing to sync
    
    const mutations: OfflineMutation[] = JSON.parse(mutationsStr);
    if (!mutations.length) return true; // Nothing to sync
    
    console.log(`Syncing ${mutations.length} offline mutations...`);
    
    // Process each mutation in order
    const results = await Promise.allSettled(
      mutations.map(async (mutation) => {
        try {
          switch (mutation.type) {
            case 'create':
              return await processMutation('create', mutation);
            case 'update':
              return await processMutation('update', mutation);
            case 'delete':
              return await processMutation('delete', mutation);
            default:
              console.error('Unknown mutation type:', mutation.type);
              return false;
          }
        } catch (error) {
          console.error('Error processing mutation:', error);
          return false;
        }
      })
    );
    
    // Check results
    const allSucceeded = results.every(
      result => result.status === 'fulfilled' && result.value === true
    );
    
    if (allSucceeded) {
      // Clear pending mutations if all succeeded
      await AsyncStorage.removeItem(OFFLINE_MUTATIONS_KEY);
      await AsyncStorage.removeItem(PENDING_ITEMS_KEY);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries();
      
      return true;
    } else {
      // Some mutations failed, remove the successful ones
      const successfulMutationIndexes = results.map((result, index) => 
        result.status === 'fulfilled' && result.value === true ? index : -1
      ).filter(index => index !== -1);
      
      const remainingMutations = mutations.filter(
        (_, index) => !successfulMutationIndexes.includes(index)
      );
      
      // Save remaining mutations
      await AsyncStorage.setItem(
        OFFLINE_MUTATIONS_KEY, 
        JSON.stringify(remainingMutations)
      );
      
      // Refresh query data
      queryClient.invalidateQueries();
      
      return false;
    }
  } catch (error) {
    console.error('Error syncing offline mutations:', error);
    return false;
  }
}

/**
 * Process a single mutation against the server
 */
async function processMutation(
  type: 'create' | 'update' | 'delete',
  mutation: OfflineMutation
): Promise<boolean> {
  try {
    // Get the entity table name
    const table = mutation.entity;
    
    switch (type) {
      case 'create': {
        // For create, we remove any temp id and insert the record
        const { id, ...data } = mutation.data;
        const { data: responseData, error } = await supabase
          .from(table)
          .insert(data)
          .select();
          
        if (error) throw error;
        return true;
      }
      
      case 'update': {
        // For update, we update the record by ID
        const { id, ...data } = mutation.data;
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
        return true;
      }
      
      case 'delete': {
        // For delete, we delete the record by ID
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', mutation.data.id);
          
        if (error) throw error;
        return true;
      }
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error processing mutation:', error);
    return false;
  }
}

/**
 * Hook up background sync when app comes online
 */
export function setupBackgroundSync(): () => void {
  // Subscribe to network changes
  const unsubscribe = NetInfo.addEventListener(state => {
    // When we go from offline to online, sync mutations
    if (state.isConnected && state.isInternetReachable !== false) {
      syncOfflineMutations()
        .then(success => {
          console.log('Background sync completed:', success ? 'success' : 'with errors');
        })
        .catch(error => {
          console.error('Background sync failed:', error);
        });
    }
  });
  
  return unsubscribe;
} 