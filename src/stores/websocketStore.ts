import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { webSocketService, WebSocketEvents } from '../services/websocket';
import { useMemoryStore } from './memoryStore';
import { useCollectionStore } from './collectionStore';
import { useGraphStore } from './graphStore';
import { useUIStore } from './uiStore';

interface WebSocketState {
  isConnected: boolean;
  reconnectAttempts: number;
  subscribedRooms: string[];
  lastSync: Date | null;
  isSyncing: boolean;
  
  // Actions
  connect: (url: string, token?: string) => void;
  disconnect: () => void;
  subscribeToMemory: (memoryId: string) => void;
  unsubscribeFromMemory: (memoryId: string) => void;
  subscribeToCollection: (collectionId: string) => void;
  unsubscribeFromCollection: (collectionId: string) => void;
  subscribeToUser: (userId: string) => void;
  getConnectionStatus: () => void;
}

export const useWebSocketStore = create<WebSocketState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      isConnected: false,
      reconnectAttempts: 0,
      subscribedRooms: [],
      lastSync: null,
      isSyncing: false,

      connect: (url: string, token?: string) => {
        webSocketService.connect(url, token);
        
        // Setup event handlers
        setupWebSocketEventHandlers(set);
        
        // Connection status events
        webSocketService.on('connected' as any, () => {
          set({ isConnected: true, reconnectAttempts: 0 });
          useUIStore.getState().showNotification({
            type: 'success',
            message: 'Real-time sync connected',
          });
        });

        webSocketService.on('disconnected' as any, (reason: string) => {
          set({ isConnected: false });
          if (reason !== 'io client disconnect') {
            useUIStore.getState().showNotification({
              type: 'warning',
              message: 'Real-time sync disconnected',
            });
          }
        });

        webSocketService.on('error', (error) => {
          useUIStore.getState().showNotification({
            type: 'error',
            message: `WebSocket error: ${error.message}`,
          });
        });
      },

      disconnect: () => {
        webSocketService.disconnect();
        set({ isConnected: false, subscribedRooms: [] });
      },

      subscribeToMemory: (memoryId: string) => {
        webSocketService.subscribeToMemory(memoryId);
        set(state => ({
          subscribedRooms: [...state.subscribedRooms, `memory:${memoryId}`]
        }));
      },

      unsubscribeFromMemory: (memoryId: string) => {
        webSocketService.unsubscribeFromMemory(memoryId);
        set(state => ({
          subscribedRooms: state.subscribedRooms.filter(room => room !== `memory:${memoryId}`)
        }));
      },

      subscribeToCollection: (collectionId: string) => {
        webSocketService.subscribeToCollection(collectionId);
        set(state => ({
          subscribedRooms: [...state.subscribedRooms, `collection:${collectionId}`]
        }));
      },

      unsubscribeFromCollection: (collectionId: string) => {
        webSocketService.unsubscribeFromCollection(collectionId);
        set(state => ({
          subscribedRooms: state.subscribedRooms.filter(room => room !== `collection:${collectionId}`)
        }));
      },

      subscribeToUser: (userId: string) => {
        webSocketService.subscribeToUser(userId);
        set(state => ({
          subscribedRooms: [...state.subscribedRooms, `user:${userId}`]
        }));
      },

      getConnectionStatus: () => {
        const status = webSocketService.getConnectionStatus();
        set({
          isConnected: status.isConnected,
          reconnectAttempts: status.reconnectAttempts,
          subscribedRooms: status.subscribedRooms,
        });
      },
    })),
    {
      name: 'websocket-store',
    }
  )
);

// Setup WebSocket event handlers
function setupWebSocketEventHandlers(set: any) {
  const memoryStore = useMemoryStore.getState();
  const collectionStore = useCollectionStore.getState();
  const graphStore = useGraphStore.getState();
  const uiStore = useUIStore.getState();

  // Memory events
  webSocketService.on('memory:created', (memory) => {
    memoryStore.addMemory(memory);
    uiStore.showNotification({
      type: 'info',
      message: 'New memory created',
    });
  });

  webSocketService.on('memory:updated', (memory) => {
    memoryStore.updateMemory(memory.id, memory);
  });

  webSocketService.on('memory:deleted', (memoryId) => {
    memoryStore.deleteMemory(memoryId);
    uiStore.showNotification({
      type: 'info',
      message: 'Memory deleted',
    });
  });

  webSocketService.on('memory:bulk-updated', (memoryIds) => {
    // Refresh the affected memories
    memoryIds.forEach(id => {
      memoryStore.fetchMemory(id);
    });
  });

  // Collection events
  webSocketService.on('collection:created', (collection) => {
    collectionStore.addCollection(collection);
    uiStore.showNotification({
      type: 'info',
      message: `Collection "${collection.name}" created`,
    });
  });

  webSocketService.on('collection:updated', (collection) => {
    collectionStore.updateCollection(collection.id, collection);
  });

  webSocketService.on('collection:deleted', (collectionId) => {
    collectionStore.deleteCollection(collectionId);
  });

  webSocketService.on('collection:memory-added', ({ collectionId, memoryId }) => {
    // Update the collection's memory count
    collectionStore.fetchCollection(collectionId);
  });

  webSocketService.on('collection:memory-removed', ({ collectionId, memoryId }) => {
    // Update the collection's memory count
    collectionStore.fetchCollection(collectionId);
  });

  // Graph events
  webSocketService.on('graph:node-added', (node) => {
    graphStore.addNode(node);
  });

  webSocketService.on('graph:node-updated', (node) => {
    graphStore.updateNode(node.id, node);
  });

  webSocketService.on('graph:node-removed', (nodeId) => {
    graphStore.removeNode(nodeId);
  });

  webSocketService.on('graph:edge-added', (edge) => {
    graphStore.addEdge(edge);
  });

  webSocketService.on('graph:edge-updated', (edge) => {
    graphStore.updateEdge(edge.id, edge);
  });

  webSocketService.on('graph:edge-removed', (edgeId) => {
    graphStore.removeEdge(edgeId);
  });

  // System events
  webSocketService.on('sync:start', () => {
    set({ isSyncing: true });
  });

  webSocketService.on('sync:complete', () => {
    set({ isSyncing: false, lastSync: new Date() });
  });

  webSocketService.on('user:joined', (userId) => {
    console.log('User joined:', userId);
  });

  webSocketService.on('user:left', (userId) => {
    console.log('User left:', userId);
  });
}