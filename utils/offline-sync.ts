import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

/** call once in _layout.tsx */
export function configureOffline(queryClient: QueryClient) {
  // tie React Query to RN connectivity
  onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => setOnline(!!state.isConnected));
  });

  // cache to AsyncStorage
  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'RQ_CACHE',
  });
  persistQueryClient({
    queryClient,
    persister,
    maxAge: 24 * 60 * 60 * 1000      // 24 h
  });
}
