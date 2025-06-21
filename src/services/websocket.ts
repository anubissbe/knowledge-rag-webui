import { io, Socket } from 'socket.io-client';
import type { Memory, Collection, Tag } from '../types';

export type WebSocketEvent = 
  | 'memory:created'
  | 'memory:updated'
  | 'memory:deleted'
  | 'collection:created'
  | 'collection:updated'
  | 'collection:deleted'
  | 'tag:created'
  | 'tag:updated'
  | 'tag:deleted'
  | 'user:activity'
  | 'connection:status';

export interface WebSocketEventData {
  'memory:created': Memory;
  'memory:updated': Memory;
  'memory:deleted': { id: string };
  'collection:created': Collection;
  'collection:updated': Collection;
  'collection:deleted': { id: string };
  'tag:created': Tag;
  'tag:updated': Tag;
  'tag:deleted': { id: string };
  'user:activity': { userId: string; action: string; timestamp: string };
  'connection:status': { connected: boolean; latency?: number };
}

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private isConnecting = false;
  private url: string;

  constructor(url?: string) {
    this.url = url || import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
  }

  connect(userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for ongoing connection
        const checkConnection = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;

      try {
        this.socket = io(this.url, {
          transports: ['websocket', 'polling'],
          query: userId ? { userId } : {},
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.emit('connection:status', { connected: true });
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          this.isConnecting = false;
          this.emit('connection:status', { connected: false });
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.reconnectAttempts++;
          this.isConnecting = false;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Failed to connect to WebSocket server'));
          }
        });

        // Register event listeners for all event types
        const events: WebSocketEvent[] = [
          'memory:created',
          'memory:updated',
          'memory:deleted',
          'collection:created',
          'collection:updated',
          'collection:deleted',
          'tag:created',
          'tag:updated',
          'tag:deleted',
          'user:activity',
        ];

        events.forEach(event => {
          this.socket!.on(event, (data: unknown) => {
            this.emit(event, data as WebSocketEventData[typeof event]);
          });
        });

        // Latency monitoring
        setInterval(() => {
          if (this.socket?.connected) {
            const start = Date.now();
            this.socket.emit('ping', () => {
              const latency = Date.now() - start;
              this.emit('connection:status', { connected: true, latency });
            });
          }
        }, 30000); // Check every 30 seconds

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on<T extends WebSocketEvent>(event: T, callback: (data: WebSocketEventData[T]) => void): () => void {
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

  private emit<T extends WebSocketEvent>(event: T, data: WebSocketEventData[T]): void {
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

  // Utility methods for sending events to server
  sendMemoryUpdate(memory: Memory): void {
    if (this.socket?.connected) {
      this.socket.emit('memory:update', memory);
    }
  }

  sendCollectionUpdate(collection: Collection): void {
    if (this.socket?.connected) {
      this.socket.emit('collection:update', collection);
    }
  }

  sendUserActivity(action: string): void {
    if (this.socket?.connected) {
      this.socket.emit('user:activity', { action, timestamp: new Date().toISOString() });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): { connected: boolean; latency?: number } {
    return {
      connected: this.isConnected(),
    };
  }
}

// Singleton instance
export const websocketService = new WebSocketService();