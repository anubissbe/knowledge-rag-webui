import { createContext } from 'react';
import type { WebSocketEvent, WebSocketEventData } from '../services/websocket';
import type { Memory, Collection } from '../types';

export interface WebSocketContextValue {
  isConnected: boolean;
  latency?: number;
  connect: (userId?: string) => Promise<void>;
  disconnect: () => void;
  on: <T extends WebSocketEvent>(
    event: T,
    callback: (data: WebSocketEventData[T]) => void
  ) => () => void;
  sendMemoryUpdate: (memory: Memory) => void;
  sendCollectionUpdate: (collection: Collection) => void;
  sendUserActivity: (action: string) => void;
}

export const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);