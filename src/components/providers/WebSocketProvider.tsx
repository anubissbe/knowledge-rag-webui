import { useEffect, type ReactNode } from 'react';
import { useWebSocketStore } from '../../stores/websocketStore';
import { useAuthStore } from '../../stores/authStore';

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
}

export function WebSocketProvider({ children, url = 'ws://localhost:8005' }: WebSocketProviderProps) {
  const { connect, disconnect } = useWebSocketStore();
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only connect if authenticated or in development mode
    if (isAuthenticated || import.meta.env.DEV) {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || url;
      console.log('Connecting to WebSocket:', wsUrl);
      connect(wsUrl, token || undefined);
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect, url]);

  return <>{children}</>;
}