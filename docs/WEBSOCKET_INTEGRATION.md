# WebSocket Integration

Knowledge RAG WebUI includes real-time updates via WebSocket for live synchronization across users.

## 🚀 Features

### Real-time Updates
- **Memory Operations**: Create, update, delete events broadcast to all connected clients
- **Collection Changes**: Live updates when collections are modified
- **Tag Management**: Real-time tag creation and updates
- **User Activity**: Track user actions across the system
- **Connection Status**: Visual indicators for connection state and latency

### Automatic Features
- **Auto-reconnection**: Reconnects automatically after connection loss
- **Event Queuing**: Offline actions sync when connection restored
- **Latency Monitoring**: Shows connection quality in real-time
- **Error Handling**: Graceful degradation when WebSocket unavailable

## 📡 Architecture

### WebSocket Service
```typescript
// Core service handles all WebSocket communication
websocketService.connect(userId?)
websocketService.on('memory:created', callback)
websocketService.sendMemoryUpdate(memory)
```

### React Context
```typescript
// WebSocketProvider wraps the app
const { isConnected, latency, on } = useWebSocket()
```

### Event Types
- `memory:created` - New memory added
- `memory:updated` - Memory modified
- `memory:deleted` - Memory removed
- `collection:created` - New collection
- `collection:updated` - Collection modified
- `collection:deleted` - Collection removed
- `tag:created` - New tag added
- `tag:updated` - Tag modified
- `tag:deleted` - Tag removed
- `user:activity` - User action tracked
- `connection:status` - Connection state change

## 🔧 Configuration

### Environment Variables
```env
VITE_WEBSOCKET_URL=ws://localhost:3001
```

### Connection Options
```typescript
{
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
}
```

## 📱 UI Components

### Connection Status
Shows live connection state in the header:
- Green indicator when connected
- Red indicator when disconnected
- Latency display (ms)

### Real-time Notifications
Toast notifications for remote changes:
- New memory created
- Memory updated
- Memory deleted
- Auto-dismiss after 5 seconds

### Live Updates
Pages automatically update when:
- Another user creates a memory
- Memory is edited elsewhere
- Memory is deleted remotely

## 🧪 Testing

### Mock Server
Development includes a mock WebSocket server that simulates events:
```typescript
// Simulates random events every 10-30 seconds
mockWebSocketServer.start()
```

### Testing Real-time Features
1. Open app in multiple browser tabs
2. Create/edit/delete memories in one tab
3. See updates appear in other tabs
4. Monitor connection status indicator
5. Test offline/online transitions

## 🔌 Integration Examples

### Using in Components
```typescript
function MyComponent() {
  const { on, isConnected } = useWebSocket();
  
  useEffect(() => {
    const unsubscribe = on('memory:created', (memory) => {
      console.log('New memory:', memory);
    });
    
    return unsubscribe;
  }, [on]);
}
```

### Sending Updates
```typescript
const { sendMemoryUpdate } = useWebSocket();

// After creating/updating a memory
sendMemoryUpdate(updatedMemory);
```

### Custom Hooks
```typescript
// Pre-built hook for memory real-time updates
useRealtimeMemories({
  onMemoryCreated: (memory) => {},
  onMemoryUpdated: (memory) => {},
  onMemoryDeleted: ({ id }) => {}
});
```

## 🚦 Connection States

### Connected
- Green indicator in header
- All features available
- Real-time updates active
- Latency displayed

### Disconnected
- Red indicator in header
- Offline mode active
- Updates queued locally
- Auto-reconnection attempts

### Reconnecting
- Yellow indicator
- Attempting to reconnect
- Limited retries
- Exponential backoff

## 📊 Performance

### Optimizations
- Event debouncing for high-frequency updates
- Selective subscriptions per component
- Automatic cleanup on unmount
- Connection pooling

### Monitoring
- Latency checks every 30 seconds
- Connection quality indicators
- Event processing metrics
- Error tracking

## 🔒 Security

### Authentication
- User ID passed on connection
- Session validation
- Secure WebSocket (WSS) in production
- Token-based auth support

### Authorization
- Event filtering by user permissions
- Private memory isolation
- Collection access control
- Admin broadcast capabilities

## 🚀 Future Enhancements

1. **Presence System**: Show who's online
2. **Collaborative Editing**: Real-time co-editing
3. **Typing Indicators**: Show when others type
4. **Read Receipts**: Track message views
5. **Push Notifications**: Browser notifications
6. **Offline Sync**: Full offline queue
7. **Binary Support**: File transfers
8. **Room System**: Isolated channels