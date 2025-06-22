import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger';

interface WSClient {
  id: string;
  userId?: string;
  ws: WebSocket;
  isAlive: boolean;
  lastActivity: Date;
}

class WebSocketService {
  private clients: Map<string, WSClient> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;

  initialize(wss: WebSocketServer) {
    wss.on('connection', (ws) => {
      const clientId = this.generateClientId();
      const client: WSClient = {
        id: clientId,
        ws,
        isAlive: true,
        lastActivity: new Date(),
      };

      this.clients.set(clientId, client);
      logger.info(`WebSocket client connected: ${clientId}`);

      // Send initial connection success
      this.sendToClient(clientId, {
        type: 'connection',
        status: 'connected',
        clientId,
        timestamp: new Date().toISOString(),
      });

      // Handle messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(clientId, data);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
        }
      });

      // Handle pong
      ws.on('pong', () => {
        client.isAlive = true;
        client.lastActivity = new Date();
      });

      // Handle close
      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info(`WebSocket client disconnected: ${clientId}`);
      });

      // Handle error
      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
      });
    });

    // Start heartbeat
    this.startHeartbeat();
  }

  private generateClientId(): string {
    return `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startHeartbeat() {
    const interval = parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000');
    
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          logger.info(`Terminating inactive client: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      });
    }, interval);
  }

  private handleMessage(clientId: string, data: Record<string, unknown>) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = new Date();

    switch (data.type) {
      case 'auth':
        this.handleAuth(clientId, data.token);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        logger.warn(`Unknown message type: ${data.type}`);
    }
  }

  private handleAuth(clientId: string, _token: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // In production, verify JWT token
    // For now, just mock authentication
    client.userId = 'user-1';
    
    this.sendToClient(clientId, {
      type: 'auth',
      status: 'authenticated',
      userId: client.userId,
    });
  }

  sendToClient(clientId: string, data: Record<string, unknown>) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  broadcastToUser(userId: string, data: Record<string, unknown>) {
    this.clients.forEach((client) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(data));
      }
    });
  }

  broadcast(data: Record<string, unknown>) {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(data));
      }
    });
  }

  // Notify clients of memory events
  notifyMemoryCreated(userId: string, memory: Record<string, unknown>) {
    this.broadcastToUser(userId, {
      type: 'memory:created',
      data: memory,
      timestamp: new Date().toISOString(),
    });
  }

  notifyMemoryUpdated(userId: string, memory: Record<string, unknown>) {
    this.broadcastToUser(userId, {
      type: 'memory:updated',
      data: memory,
      timestamp: new Date().toISOString(),
    });
  }

  notifyMemoryDeleted(userId: string, memoryId: string) {
    this.broadcastToUser(userId, {
      type: 'memory:deleted',
      data: { id: memoryId },
      timestamp: new Date().toISOString(),
    });
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  getActiveUsers(): number {
    const uniqueUsers = new Set(
      Array.from(this.clients.values())
        .filter(client => client.userId)
        .map(client => client.userId)
    );
    return uniqueUsers.size;
  }

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.forEach((client) => {
      client.ws.close();
    });
    this.clients.clear();
  }
}

export const wsService = new WebSocketService();

export function initializeWebSocket(wss: WebSocketServer) {
  wsService.initialize(wss);
}