import { useState } from 'react';
import { useWebSocketStore } from '../stores/websocketStore';
import { useMemoryStore } from '../stores/memoryStore';
import { useCollectionStore } from '../stores/collectionStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Wifi, WifiOff, Send, RefreshCw } from 'lucide-react';

export function TestWebSocketPage() {
  const { isConnected, isSyncing, lastSync, subscribedRooms, connect, disconnect } = useWebSocketStore();
  const { memories } = useMemoryStore();
  const { collections } = useCollectionStore();
  const [testMessage, setTestMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const handleConnect = () => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8005';
    connect(wsUrl);
    addLog(`Attempting to connect to ${wsUrl}`);
  };

  const handleDisconnect = () => {
    disconnect();
    addLog('Disconnected from WebSocket');
  };

  const sendTestEvent = (eventType: string) => {
    // In a real implementation, this would send via WebSocket
    addLog(`Simulating ${eventType} event`);
    
    // Simulate different events
    switch (eventType) {
      case 'memory:created':
        addLog('Memory created event would update the memory list');
        break;
      case 'collection:updated':
        addLog('Collection updated event would refresh the collection');
        break;
      case 'sync:start':
        addLog('Sync started - UI would show syncing indicator');
        break;
      case 'sync:complete':
        addLog('Sync completed - data is up to date');
        break;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">WebSocket Test Page</h1>
      
      {/* Connection Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Status:</span>
            <div className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Syncing:</span>
            <div className="flex items-center gap-1">
              {isSyncing && <RefreshCw size={16} className="animate-spin text-blue-600" />}
              <span className="font-medium">{isSyncing ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium">
              {lastSync ? lastSync.toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          {!isConnected ? (
            <Button onClick={handleConnect} variant="primary">
              Connect
            </Button>
          ) : (
            <Button onClick={handleDisconnect} variant="outline">
              Disconnect
            </Button>
          )}
        </div>
      </Card>
      
      {/* Subscribed Rooms */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Subscribed Rooms</h2>
        {subscribedRooms.length > 0 ? (
          <ul className="space-y-1">
            {subscribedRooms.map((room, index) => (
              <li key={index} className="text-sm text-gray-600">
                • {room}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No active subscriptions</p>
        )}
      </Card>
      
      {/* Test Events */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test Events</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            onClick={() => sendTestEvent('memory:created')}
            variant="outline"
            size="sm"
          >
            Memory Created
          </Button>
          <Button
            onClick={() => sendTestEvent('memory:updated')}
            variant="outline"
            size="sm"
          >
            Memory Updated
          </Button>
          <Button
            onClick={() => sendTestEvent('collection:updated')}
            variant="outline"
            size="sm"
          >
            Collection Updated
          </Button>
          <Button
            onClick={() => sendTestEvent('sync:start')}
            variant="outline"
            size="sm"
          >
            Start Sync
          </Button>
          <Button
            onClick={() => sendTestEvent('sync:complete')}
            variant="outline"
            size="sm"
          >
            Complete Sync
          </Button>
          <Button
            onClick={() => sendTestEvent('error')}
            variant="outline"
            size="sm"
          >
            Trigger Error
          </Button>
        </div>
      </Card>
      
      {/* Current State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Current Memories ({memories.length})
          </h2>
          <div className="space-y-2 max-h-60 overflow-auto">
            {memories.slice(0, 5).map(memory => (
              <div key={memory.id} className="text-sm">
                <span className="font-medium">{memory.title}</span>
                <span className="text-gray-500 ml-2">
                  {new Date(memory.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {memories.length > 5 && (
              <p className="text-sm text-gray-500">
                ...and {memories.length - 5} more
              </p>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Current Collections ({collections.length})
          </h2>
          <div className="space-y-2 max-h-60 overflow-auto">
            {collections.slice(0, 5).map(collection => (
              <div key={collection.id} className="text-sm">
                <span className="font-medium">{collection.name}</span>
                <span className="text-gray-500 ml-2">
                  {collection.memoryCount || 0} memories
                </span>
              </div>
            ))}
            {collections.length > 5 && (
              <p className="text-sm text-gray-500">
                ...and {collections.length - 5} more
              </p>
            )}
          </div>
        </Card>
      </div>
      
      {/* Event Log */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Event Log</h2>
        <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-auto font-mono text-xs">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="py-0.5">
                {log}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events logged yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}