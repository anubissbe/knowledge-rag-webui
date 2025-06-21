import { useWebSocket } from '../hooks/useWebSocket';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export default function ConnectionStatus() {
  const { isConnected, latency } = useWebSocket();

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-600 dark:text-gray-400">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-gray-600 dark:text-gray-400">Offline</span>
          </>
        )}
      </div>
      
      {isConnected && latency !== undefined && (
        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-500">
          <Activity className="w-3 h-3" />
          <span className="text-xs">{latency}ms</span>
        </div>
      )}
    </div>
  );
}