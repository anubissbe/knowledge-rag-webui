import { io, Socket } from 'socket.io-client';
import { Memory, Collection, EntityRelationship } from '../types';

export interface WebSocketEvents {
  // Memory events
  'memory:created': (memory: Memory) => void;
  'memory:updated': (memory: Memory) => void;
  'memory:deleted': (memoryId: string) => void;
  'memory:bulk-updated': (memoryIds: string[]) => void;
  
  // Collection events
  'collection:created': (collection: Collection) => void;
  'collection:updated': (collection: Collection) => void;
  'collection:deleted': (collectionId: string) => void;
  'collection:memory-added': (data: { collectionId: string; memoryId: string }) => void;
  'collection:memory-removed': (data: { collectionId: string; memoryId: string }) => void;
  
  // Graph events
  'graph:node-added': (node: any) => void;
  'graph:node-updated': (node: any) => void;
  'graph:node-removed': (nodeId: string) => void;
  'graph:edge-added': (edge: EntityRelationship) => void;
  'graph:edge-updated': (edge: EntityRelationship) => void;
  'graph:edge-removed': (edgeId: string) => void;
  
  // System events
  'user:joined': (userId: string) => void;
  'user:left': (userId: string) => void;
  'sync:start': () => void;
  'sync:complete': () => void;
  'error': (error: { message: string; code: string }) => void;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected = false;
  private subscribedRooms: Set<string> = new Set();

  constructor() {
    this.setupBeforeUnloadHandler();
  }

  connect(url: string, token?: string) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // Rejoin previously subscribed rooms
      this.subscribedRooms.forEach(room => {
        this.socket?.emit('join:room', room);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('error', { message: error.message, code: 'CONNECTION_ERROR' });
    });

    // Setup all typed event listeners
    const events: (keyof WebSocketEvents)[] = [
      'memory:created', 'memory:updated', 'memory:deleted', 'memory:bulk-updated',
      'collection:created', 'collection:updated', 'collection:deleted',
      'collection:memory-added', 'collection:memory-removed',
      'graph:node-added', 'graph:node-updated', 'graph:node-removed',
      'graph:edge-added', 'graph:edge-updated', 'graph:edge-removed',
      'user:joined', 'user:left', 'sync:start', 'sync:complete', 'error'
    ];

    events.forEach(event => {
      this.socket?.on(event, (data: any) => {
        this.emit(event, data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      this.subscribedRooms.clear();
    }
  }

  // Subscribe to specific rooms/channels
  subscribeToMemory(memoryId: string) {
    const room = `memory:${memoryId}`;
    this.subscribedRooms.add(room);
    this.socket?.emit('join:room', room);
  }

  unsubscribeFromMemory(memoryId: string) {
    const room = `memory:${memoryId}`;
    this.subscribedRooms.delete(room);
    this.socket?.emit('leave:room', room);
  }

  subscribeToCollection(collectionId: string) {
    const room = `collection:${collectionId}`;
    this.subscribedRooms.add(room);
    this.socket?.emit('join:room', room);
  }

  unsubscribeFromCollection(collectionId: string) {
    const room = `collection:${collectionId}`;
    this.subscribedRooms.delete(room);
    this.socket?.emit('leave:room', room);
  }

  subscribeToUser(userId: string) {
    const room = `user:${userId}`;
    this.subscribedRooms.add(room);
    this.socket?.emit('join:room', room);
  }

  // Event emitter functionality
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscribedRooms: Array.from(this.subscribedRooms),
    };
  }

  // Send custom events
  sendEvent(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event, WebSocket not connected:', event);
    }
  }

  private setupBeforeUnloadHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();