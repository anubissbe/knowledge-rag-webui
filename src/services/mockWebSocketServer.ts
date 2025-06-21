// Mock WebSocket server for development
// This simulates real-time events for testing

import { logger } from '../utils/logger';

class MockWebSocketServer {
  private intervalId: number | null = null;
  private eventCallbacks: Map<string, Set<(data: unknown) => void>> = new Map();

  start() {
    logger.debug('Mock WebSocket server started', 'MockWS');
    
    // Simulate random events every 10-30 seconds
    this.intervalId = window.setInterval(() => {
      const eventTypes = ['create', 'update', 'delete'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      switch (eventType) {
        case 'create':
          this.simulateMemoryCreated();
          break;
        case 'update':
          this.simulateMemoryUpdated();
          break;
        case 'delete':
          this.simulateMemoryDeleted();
          break;
      }
    }, Math.random() * 20000 + 10000); // 10-30 seconds
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.debug('Mock WebSocket server stopped', 'MockWS');
  }

  private simulateMemoryCreated() {
    const memory = {
      id: `mock-${Date.now()}`,
      title: `New Memory ${new Date().toLocaleTimeString()}`,
      content: 'This is a simulated memory created via WebSocket',
      contentType: 'text' as const,
      summary: 'Simulated memory for testing real-time updates',
      userId: 'user-1',
      tags: ['Simulated', 'Real-time'],
      entities: [],
      metadata: {
        wordCount: 10,
        readingTime: 1,
        language: 'en'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.emit('memory:created', memory);
  }

  private simulateMemoryUpdated() {
    // Simulate updating the first mock memory
    const memory = {
      id: '1',
      title: 'Understanding RAG Systems (Updated)',
      content: 'Retrieval-Augmented Generation (RAG) is a powerful technique... (Updated content)',
      contentType: 'markdown' as const,
      summary: 'An overview of Retrieval-Augmented Generation systems (Updated)',
      userId: 'user-1',
      tags: ['AI', 'RAG', 'Machine Learning', 'LLM', 'Updated'],
      entities: [],
      metadata: {
        wordCount: 250,
        readingTime: 2,
        language: 'en'
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: new Date().toISOString()
    };
    
    this.emit('memory:updated', memory);
  }

  private simulateMemoryDeleted() {
    // Simulate deleting a random memory
    const memoryIds = ['2', '3'];
    const id = memoryIds[Math.floor(Math.random() * memoryIds.length)];
    
    this.emit('memory:deleted', { id });
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event)!.add(callback);
  }

  private emit(event: string, data: unknown) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const mockWebSocketServer = new MockWebSocketServer();