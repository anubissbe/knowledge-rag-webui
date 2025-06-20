import { useEffect } from 'react';
import { useWebSocketStore } from '../stores/websocketStore';
import { useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to manage real-time WebSocket subscriptions based on current route
 */
export function useRealtimeSync() {
  const params = useParams();
  const location = useLocation();
  const { user } = useAuthStore();
  const { 
    isConnected,
    subscribeToMemory,
    unsubscribeFromMemory,
    subscribeToCollection,
    unsubscribeFromCollection,
    subscribeToUser,
  } = useWebSocketStore();

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to user's personal channel for global updates
    if (user?.id) {
      subscribeToUser(user.id);
    }

    // Route-specific subscriptions
    const { pathname } = location;
    
    // Memory detail page
    if (pathname.includes('/memories/') && params.id && params.id !== 'new') {
      subscribeToMemory(params.id);
      
      return () => {
        unsubscribeFromMemory(params.id!);
      };
    }
    
    // Collection page
    if (pathname.includes('/collections/') && params.id) {
      subscribeToCollection(params.id);
      
      return () => {
        unsubscribeFromCollection(params.id!);
      };
    }
  }, [
    isConnected,
    location.pathname,
    params.id,
    user?.id,
    subscribeToMemory,
    unsubscribeFromMemory,
    subscribeToCollection,
    unsubscribeFromCollection,
    subscribeToUser,
  ]);
}

/**
 * Hook to subscribe to a specific memory for real-time updates
 */
export function useMemoryRealtimeSync(memoryId: string | undefined) {
  const { isConnected, subscribeToMemory, unsubscribeFromMemory } = useWebSocketStore();

  useEffect(() => {
    if (!isConnected || !memoryId) return;

    subscribeToMemory(memoryId);
    
    return () => {
      unsubscribeFromMemory(memoryId);
    };
  }, [isConnected, memoryId, subscribeToMemory, unsubscribeFromMemory]);
}

/**
 * Hook to subscribe to a specific collection for real-time updates
 */
export function useCollectionRealtimeSync(collectionId: string | undefined) {
  const { isConnected, subscribeToCollection, unsubscribeFromCollection } = useWebSocketStore();

  useEffect(() => {
    if (!isConnected || !collectionId) return;

    subscribeToCollection(collectionId);
    
    return () => {
      unsubscribeFromCollection(collectionId);
    };
  }, [isConnected, collectionId, subscribeToCollection, unsubscribeFromCollection]);
}