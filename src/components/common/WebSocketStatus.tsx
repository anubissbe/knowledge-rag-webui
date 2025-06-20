import { useWebSocketStore } from '../../stores/websocketStore';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export function WebSocketStatus() {
  const { isConnected, isSyncing, lastSync, reconnectAttempts } = useWebSocketStore();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="flex items-center gap-2 text-sm" data-testid="websocket-status">
      {isSyncing && (
        <div className="flex items-center gap-1 text-blue-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing...</span>
        </div>
      )}
      
      <div
        className={cn(
          'flex items-center gap-1',
          isConnected ? 'text-green-600' : 'text-red-600'
        )}
        title={isConnected ? 'Real-time sync active' : 'Real-time sync disconnected'}
      >
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="hidden sm:inline">Offline</span>
            {reconnectAttempts > 0 && (
              <span className="text-xs">({reconnectAttempts})</span>
            )}
          </>
        )}
      </div>
      
      {lastSync && !isSyncing && (
        <span className="text-gray-500 text-xs hidden md:inline">
          Last sync: {formatLastSync(lastSync)}
        </span>
      )}
    </div>
  );
}