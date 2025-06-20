import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { webSocketService } from '../services/websocket';
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
    subscribeWithSelector((set) => ({
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
          useUIStore.getState().addNotification({
            type: 'success',
            title: 'Connection Status',
            message: 'Real-time sync connected',
          });
        });

        webSocketService.on('disconnected' as any, (reason: string) => {
          set({ isConnected: false });
          if (reason !== 'io client disconnect') {
            useUIStore.getState().addNotification({
              type: 'warning',
              title: 'Connection Status',
              message: 'Real-time sync disconnected',
            });
          }
        });

        webSocketService.on('error', (error) => {
          useUIStore.getState().addNotification({
            type: 'error',
            title: 'Connection Error',
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
    // Directly add memory to the store without API call
    useMemoryStore.setState(state => ({
      memories: [memory, ...state.memories],
      totalCount: state.totalCount + 1,
    }));
    uiStore.addNotification({
      type: 'info',
      title: 'Memory Update',
      message: 'New memory created',
    });
  });

  webSocketService.on('memory:updated', (memory) => {
    // Directly update memory in the store without API call
    useMemoryStore.setState(state => ({
      memories: state.memories.map(m => 
        m.id === memory.id ? memory : m
      ),
      selectedMemory: state.selectedMemory?.id === memory.id ? memory : state.selectedMemory,
    }));
  });

  webSocketService.on('memory:deleted', (memoryId) => {
    // Directly remove memory from the store without API call
    useMemoryStore.setState(state => ({
      memories: state.memories.filter(m => m.id !== memoryId),
      selectedMemory: state.selectedMemory?.id === memoryId ? null : state.selectedMemory,
      selectedMemories: state.selectedMemories.filter(mId => mId !== memoryId),
      totalCount: state.totalCount - 1,
    }));
    uiStore.addNotification({
      type: 'info',
      title: 'Memory Update',
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
    // Directly add collection to the store without API call
    useCollectionStore.setState(state => ({
      collections: [...state.collections, collection],
    }));
    uiStore.addNotification({
      type: 'info',
      title: 'Collection Update',
      message: `Collection "${collection.name}" created`,
    });
  });

  webSocketService.on('collection:updated', (collection) => {
    // Directly update collection in the store without API call
    useCollectionStore.setState(state => ({
      collections: state.collections.map(c => 
        c.id === collection.id ? collection : c
      ),
      selectedCollection: state.selectedCollection?.id === collection.id ? collection : state.selectedCollection,
    }));
  });

  webSocketService.on('collection:deleted', (collectionId) => {
    // Directly remove collection from the store without API call
    useCollectionStore.setState(state => ({
      collections: state.collections.filter(c => c.id !== collectionId),
      selectedCollection: state.selectedCollection?.id === collectionId ? null : state.selectedCollection,
    }));
  });

  webSocketService.on('collection:memory-added', ({ collectionId }) => {
    // Update the collection's memory count
    collectionStore.fetchCollection(collectionId);
  });

  webSocketService.on('collection:memory-removed', ({ collectionId }) => {
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