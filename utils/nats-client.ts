import { QueryClient } from '@tanstack/react-query';
import { connect, type ConnectionOptions, type NatsConnection, StringCodec } from 'nats.ws';

// Codec for encoding/decoding NATS messages
const sc = StringCodec();

// Type for cache update handlers
type CacheUpdateHandler = (data: any) => void;

// Global handlers for different subjects
const handlers: Record<string, CacheUpdateHandler[]> = {};

// Connection state
let natsConnection: NatsConnection | null = null;
let queryClient: QueryClient | null = null;
let isConnecting = false;

/**
 * Initialize the NATS client and connect to the server
 */
export async function initNatsClient(
  url: string, 
  qc: QueryClient,
  options: Partial<ConnectionOptions> = {}
): Promise<NatsConnection> {
  if (natsConnection) {
    return natsConnection;
  }
  
  if (isConnecting) {
    throw new Error('NATS connection is already in progress');
  }
  
  isConnecting = true;
  
  try {
    // Set the query client for cache updates
    queryClient = qc;
    
    // Connect to NATS server
    natsConnection = await connect({
      servers: url,
      // Add required polyfills for React Native
      // These would need to be properly implemented in a real app
      ...options,
    });
    
    console.log('Connected to NATS server');
    
    // Setup ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (natsConnection && !natsConnection.isClosed) {
        // Note: Using a custom ping mechanism instead of the built-in one
        try {
          const start = Date.now();
          // Simple ping using a request to a dummy subject
          natsConnection.request('_PING_', undefined, { timeout: 1000 })
            .then(() => {
              const latency = Date.now() - start;
              console.log(`NATS server latency: ${latency}ms`);
            })
            .catch((err: Error) => {
              console.error('NATS ping error:', err.message);
            });
        } catch (err) {
          const error = err as Error;
          console.error('NATS ping error:', error.message);
        }
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
    
    // Handle connection close
    natsConnection.closed().then(() => {
      console.log('NATS connection closed');
      natsConnection = null;
      clearInterval(pingInterval);
      // Could implement reconnection logic here
    });
    
    return natsConnection;
  } catch (error) {
    console.error('Failed to connect to NATS server:', error);
    isConnecting = false;
    throw error;
  }
}

/**
 * Subscribe to a NATS subject and update the React Query cache
 */
export async function subscribeWithCache(
  subject: string,
  queryKey: unknown[],
  updateType: 'invalidate' | 'setData' = 'invalidate'
): Promise<() => void> {
  if (!natsConnection) {
    throw new Error('NATS client not initialized');
  }
  
  if (!queryClient) {
    throw new Error('QueryClient not set');
  }
  
  // Create subscription
  const subscription = natsConnection.subscribe(subject);
  
  // Setup message handler
  (async () => {
    for await (const msg of subscription) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        
        if (updateType === 'invalidate') {
          // Invalidate the cache for this query key
          queryClient.invalidateQueries({ queryKey });
        } else {
          // Update the cache directly
          queryClient.setQueryData(queryKey, data);
        }
        
        // Call any custom handlers
        if (handlers[subject]) {
          handlers[subject].forEach(handler => handler(data));
        }
      } catch (error) {
        const err = error as Error;
        console.error(`Error handling message for ${subject}:`, err.message);
      }
    }
  })();
  
  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Add a custom handler for a subject
 */
export function addSubjectHandler(subject: string, handler: CacheUpdateHandler): () => void {
  if (!handlers[subject]) {
    handlers[subject] = [];
  }
  
  handlers[subject].push(handler);
  
  // Return a function to remove the handler
  return () => {
    if (handlers[subject]) {
      handlers[subject] = handlers[subject].filter(h => h !== handler);
    }
  };
}

/**
 * Get the NATS connection
 */
export function getNatsConnection(): NatsConnection | null {
  return natsConnection;
}

/**
 * Close the NATS connection
 */
export async function closeNatsConnection(): Promise<void> {
  if (natsConnection) {
    await natsConnection.close();
    natsConnection = null;
  }
} 