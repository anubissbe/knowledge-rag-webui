import { io, Socket } from 'socket.io-client';
import { wsLogger } from '../utils/logger';
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
  private latencyInterval: NodeJS.Timeout | null = null;
  private connectionCheckIntervals: Set<NodeJS.Timeout> = new Set();

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
            this.clearConnectionCheckInterval(checkConnection);
            resolve();
          }
        }, 100);
        
        // Store interval for cleanup and set a timeout to prevent infinite waiting
        this.connectionCheckIntervals.add(checkConnection);
        setTimeout(() => {
          if (this.connectionCheckIntervals.has(checkConnection)) {
            this.clearConnectionCheckInterval(checkConnection);
            reject(new Error('Connection timeout - another connection is in progress'));
          }
        }, 10000); // 10 second timeout
        
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
          wsLogger.info('WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.emit('connection:status', { connected: true });
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          wsLogger.info('WebSocket disconnected', { reason });
          this.isConnecting = false;
          this.clearLatencyMonitoring(); // Clear latency monitoring on disconnect
          this.emit('connection:status', { connected: false });
        });

        this.socket.on('connect_error', (error) => {
          if (import.meta.env.DEV) {
            console.error('WebSocket connection error:', error);
          }
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

        // Latency monitoring - store interval for cleanup
        this.startLatencyMonitoring();

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    // Clear all intervals
    this.clearLatencyMonitoring();
    this.clearAllConnectionCheckIntervals();
    
    // Disconnect socket and remove all listeners
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear event listeners
    this.listeners.clear();
    
    // Reset connection state
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  on<T extends WebSocketEvent>(event: T, callback: (data: WebSocketEventData[T]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback as (data: unknown) => void);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback as (data: unknown) => void);
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
          if (import.meta.env.DEV) {
            console.error(`Error in WebSocket event handler for ${event}:`, error);
          }
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

  // Helper methods for interval management
  private startLatencyMonitoring(): void {
    // Clear any existing interval first
    this.clearLatencyMonitoring();
    
    this.latencyInterval = setInterval(() => {
      if (this.socket?.connected) {
        const start = Date.now();
        this.socket.emit('ping', () => {
          const latency = Date.now() - start;
          this.emit('connection:status', { connected: true, latency });
        });
      }
    }, 30000); // Check every 30 seconds
  }

  private clearLatencyMonitoring(): void {
    if (this.latencyInterval) {
      clearInterval(this.latencyInterval);
      this.latencyInterval = null;
    }
  }

  private clearConnectionCheckInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.connectionCheckIntervals.delete(interval);
  }

  private clearAllConnectionCheckIntervals(): void {
    this.connectionCheckIntervals.forEach(interval => {
      clearInterval(interval);
    });
    this.connectionCheckIntervals.clear();
  }
}

// Singleton instance
export const websocketService = new WebSocketService();