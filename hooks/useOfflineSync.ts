import { useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { saveOfflineMutation, syncOfflineMutations, getPendingItems, PendingItem, setupBackgroundSync } from '@/utils/offline-sync';
import { useState } from 'react';

/**
 * Hook to provide offline sync functionality
 */
export function useOfflineSync<T extends { id: string }>(entityType: string) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending items on mount
  useEffect(() => {
    loadPendingItems();
    
    // Set up network status listener
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(online);
      
      // If going from offline to online, try to sync
      if (online) {
        syncItems();
      }
    });
    
    // Also set up background sync (network status changes outside this component)
    const unsubscribeBackground = setupBackgroundSync();
    
    return () => {
      unsubscribe();
      unsubscribeBackground();
    };
  }, [entityType]);

  // Load pending items from storage
  const loadPendingItems = useCallback(async () => {
    const items = await getPendingItems(entityType);
    setPendingItems(items);
  }, [entityType]);

  // Create an item (works offline)
  const createItem = useCallback(async (data: Omit<T, 'id'>): Promise<{ id: string, isOffline: boolean }> => {
    try {
      // Check if we're online
      const networkState = await NetInfo.fetch();
      const online = networkState.isConnected && networkState.isInternetReachable !== false;
      
      if (online) {
        // If online, create directly
        // In a real app, you'd use your API client (like supabase) here
        // const { data: newItem, error } = await supabase.from(entityType).insert(data).select();
        // if (error) throw error;
        // return { id: newItem.id, isOffline: false };
        
        // For demo purposes, simulate success
        return { id: `server-${Date.now()}`, isOffline: false };
      } else {
        // If offline, save to be synced later
        const tempId = await saveOfflineMutation('create', entityType, data);
        await loadPendingItems(); // Reload pending items
        return { id: tempId, isOffline: true };
      }
    } catch (error) {
      console.error('Error creating item:', error);
      // If API call fails, save offline
      const tempId = await saveOfflineMutation('create', entityType, data);
      await loadPendingItems(); // Reload pending items
      return { id: tempId, isOffline: true };
    }
  }, [entityType, loadPendingItems]);

  // Update an item (works offline)
  const updateItem = useCallback(async (item: T): Promise<{ isOffline: boolean }> => {
    try {
      // Check if we're online
      const networkState = await NetInfo.fetch();
      const online = networkState.isConnected && networkState.isInternetReachable !== false;
      
      if (online) {
        // If online, update directly
        // In a real app, you'd use your API client (like supabase) here
        // const { error } = await supabase.from(entityType).update(item).eq('id', item.id);
        // if (error) throw error;
        // return { isOffline: false };
        
        // For demo purposes, simulate success
        return { isOffline: false };
      } else {
        // If offline, save to be synced later
        await saveOfflineMutation('update', entityType, item);
        await loadPendingItems(); // Reload pending items
        return { isOffline: true };
      }
    } catch (error) {
      console.error('Error updating item:', error);
      // If API call fails, save offline
      await saveOfflineMutation('update', entityType, item);
      await loadPendingItems(); // Reload pending items
      return { isOffline: true };
    }
  }, [entityType, loadPendingItems]);

  // Delete an item (works offline)
  const deleteItem = useCallback(async (id: string): Promise<{ isOffline: boolean }> => {
    try {
      // Check if we're online
      const networkState = await NetInfo.fetch();
      const online = networkState.isConnected && networkState.isInternetReachable !== false;
      
      if (online) {
        // If online, delete directly
        // In a real app, you'd use your API client (like supabase) here
        // const { error } = await supabase.from(entityType).delete().eq('id', id);
        // if (error) throw error;
        // return { isOffline: false };
        
        // For demo purposes, simulate success
        return { isOffline: false };
      } else {
        // If offline, save to be synced later
        await saveOfflineMutation('delete', entityType, { id });
        await loadPendingItems(); // Reload pending items
        return { isOffline: true };
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      // If API call fails, save offline
      await saveOfflineMutation('delete', entityType, { id });
      await loadPendingItems(); // Reload pending items
      return { isOffline: true };
    }
  }, [entityType, loadPendingItems]);

  // Manually trigger sync
  const syncItems = useCallback(async (): Promise<boolean> => {
    if (isSyncing) return false;
    
    setIsSyncing(true);
    try {
      const success = await syncOfflineMutations();
      if (success) {
        await loadPendingItems(); // Reload pending items after successful sync
      }
      return success;
    } catch (error) {
      console.error('Error syncing items:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadPendingItems]);

  // Check if an item is pending sync
  const isItemPending = useCallback((id: string): boolean => {
    return pendingItems.some(item => item.id === id);
  }, [pendingItems]);

  return {
    isOnline,
    isSyncing,
    pendingItems,
    createItem,
    updateItem,
    deleteItem,
    syncItems,
    isItemPending,
  };
} 