import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { websocketService } from '../services/websocket';
import type { WebSocketEvent, WebSocketEventData } from '../services/websocket';
import type { Memory, Collection } from '../types';
import { WebSocketContext, type WebSocketContextValue } from './WebSocketContextExport';

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState<number | undefined>();

  useEffect(() => {
    // Auto-connect on mount
    websocketService.connect().catch(error => {
      console.error('Failed to connect to WebSocket:', error);
    });

    // Listen for connection status changes
    const unsubscribe = websocketService.on('connection:status', (data) => {
      setIsConnected(data.connected);
      setLatency(data.latency);
    });

    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  const connect = useCallback(async (userId?: string) => {
    try {
      await websocketService.connect(userId);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setLatency(undefined);
  }, []);

  const on = useCallback(<T extends WebSocketEvent>(
    event: T,
    callback: (data: WebSocketEventData[T]) => void
  ) => {
    return websocketService.on(event, callback);
  }, []);

  const sendMemoryUpdate = useCallback((memory: Memory) => {
    websocketService.sendMemoryUpdate(memory);
  }, []);

  const sendCollectionUpdate = useCallback((collection: Collection) => {
    websocketService.sendCollectionUpdate(collection);
  }, []);

  const sendUserActivity = useCallback((action: string) => {
    websocketService.sendUserActivity(action);
  }, []);

  const value: WebSocketContextValue = {
    isConnected,
    latency,
    connect,
    disconnect,
    on,
    sendMemoryUpdate,
    sendCollectionUpdate,
    sendUserActivity,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}