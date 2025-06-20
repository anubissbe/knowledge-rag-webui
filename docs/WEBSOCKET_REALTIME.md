# WebSocket Real-time Sync Documentation

## Overview

The Knowledge RAG Web UI implements real-time synchronization using Socket.IO to provide live updates across all connected clients. This ensures that changes made by one user are immediately reflected for all other users viewing the same data.

## Architecture

### WebSocket Service (`src/services/websocket.ts`)

The core WebSocket service handles:
- Connection management with auto-reconnect
- Room-based subscriptions for targeted updates
- Typed event system for type safety
- Event emitter pattern for decoupled communication

```typescript
// Example usage
import { webSocketService } from '@/services/websocket';

// Connect to WebSocket server
webSocketService.connect('ws://localhost:8005', authToken);

// Subscribe to memory updates
webSocketService.subscribeToMemory(memoryId);

// Listen for updates
webSocketService.on('memory:updated', (memory) => {
  console.log('Memory updated:', memory);
});
```

### WebSocket Store (`src/stores/websocketStore.ts`)

Zustand store that manages WebSocket state and integrates with other stores:

```typescript
const { 
  isConnected, 
  isSyncing, 
  lastSync,
  connect,
  disconnect,
  subscribeToMemory 
} = useWebSocketStore();
```

## Event Types

### Memory Events
- `memory:created` - New memory created
- `memory:updated` - Memory content or metadata updated
- `memory:deleted` - Memory removed
- `memory:bulk-updated` - Multiple memories updated

### Collection Events
- `collection:created` - New collection created
- `collection:updated` - Collection properties changed
- `collection:deleted` - Collection removed
- `collection:memory-added` - Memory added to collection
- `collection:memory-removed` - Memory removed from collection

### Graph Events
- `graph:node-added` - New node in knowledge graph
- `graph:node-updated` - Node properties changed
- `graph:node-removed` - Node deleted
- `graph:edge-added` - New relationship created
- `graph:edge-updated` - Relationship properties changed
- `graph:edge-removed` - Relationship deleted

### System Events
- `sync:start` - Synchronization started
- `sync:complete` - Synchronization completed
- `user:joined` - User connected
- `user:left` - User disconnected
- `error` - Error occurred

## UI Components

### WebSocket Status Indicator

Displays connection status in the header:

```tsx
import { WebSocketStatus } from '@/components/common/WebSocketStatus';

// Shows: 🟢 Live | 🔴 Offline | 🔄 Syncing...
<WebSocketStatus />
```

### WebSocket Provider

Manages WebSocket lifecycle at the app level:

```tsx
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';

<WebSocketProvider url="ws://localhost:8005">
  <App />
</WebSocketProvider>
```

## Hooks

### useRealtimeSync

Automatically subscribes to relevant entities based on current route:

```tsx
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

function Layout() {
  // Handles subscriptions automatically
  useRealtimeSync();
  
  return <div>...</div>;
}
```

### useMemoryRealtimeSync

Subscribe to specific memory updates:

```tsx
import { useMemoryRealtimeSync } from '@/hooks/useRealtimeSync';

function MemoryDetail({ memoryId }) {
  useMemoryRealtimeSync(memoryId);
  // Component will receive real-time updates
}
```

## Room-based Subscriptions

The system uses rooms to ensure clients only receive relevant updates:

- `memory:{id}` - Updates for specific memory
- `collection:{id}` - Updates for specific collection
- `user:{id}` - Updates for specific user's data

## Configuration

### Environment Variables

```env
# WebSocket server URL
VITE_WEBSOCKET_URL=ws://localhost:8005
```

### Connection Options

```typescript
const options = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
};
```

## Testing

### WebSocket Test Page

Access `/test-websocket` in development mode to:
- Monitor connection status
- View subscribed rooms
- Simulate events
- Check event logs

### E2E Testing

```typescript
// Example Playwright test
test('should receive real-time memory updates', async ({ page }) => {
  // Open app in two tabs
  const page2 = await context.newPage();
  
  // Create memory in first tab
  await page.goto('/memories/new');
  await page.fill('[name="title"]', 'Test Memory');
  await page.click('button[type="submit"]');
  
  // Verify it appears in second tab
  await page2.goto('/memories');
  await expect(page2.locator('text=Test Memory')).toBeVisible();
});
```

## Best Practices

1. **Selective Subscriptions**: Only subscribe to entities the user is actively viewing
2. **Cleanup**: Always unsubscribe when components unmount
3. **Error Handling**: Implement retry logic for failed connections
4. **Performance**: Batch updates when possible to reduce re-renders
5. **Security**: Validate all incoming events on the client

## Troubleshooting

### Connection Issues

1. Check WebSocket server is running:
   ```bash
   docker ps | grep websocket
   ```

2. Verify correct URL in environment:
   ```bash
   echo $VITE_WEBSOCKET_URL
   ```

3. Check browser console for errors

### Missing Updates

1. Verify subscription is active:
   - Check WebSocket test page
   - Look for room subscription in logs

2. Ensure event handlers are registered:
   ```typescript
   console.log('Subscribed rooms:', webSocketService.getConnectionStatus());
   ```

## Security Considerations

- Always authenticate WebSocket connections
- Validate permissions for room subscriptions
- Sanitize all incoming data
- Use HTTPS/WSS in production
- Implement rate limiting on the server

## Future Enhancements

1. **Offline Support**: Queue updates when disconnected
2. **Conflict Resolution**: Handle concurrent edits
3. **Binary Data**: Support for file uploads
4. **Compression**: Reduce bandwidth usage
5. **Presence**: Show who's viewing what