// import { v4 as uuidv4 } from 'uuid'; // Removed - not used
import { Memory } from '../models/Memory';
import { Collection } from '../models/Collection';
import { User } from '../models/User';

// In-memory database for development
// In production, this would be replaced with PostgreSQL + pgvector
class InMemoryDatabase {
  private memories: Map<string, Memory> = new Map();
  private collections: Map<string, Collection> = new Map();
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create a default user
    const defaultUser: User = {
      id: 'user-1',
      email: 'demo@example.com',
      username: 'demo',
      name: 'Demo User',
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showActivity: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(defaultUser.id, defaultUser);
    this.usersByEmail.set(defaultUser.email, defaultUser.id);

    // Create default collections
    const collections: Collection[] = [
      {
        id: 'default',
        name: 'General',
        description: 'Default collection for uncategorized memories',
        icon: '📝',
        color: '#6B7280',
        userId: 'user-1',
        memoryCount: 0,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'work',
        name: 'Work',
        description: 'Work-related memories and notes',
        icon: '💼',
        color: '#3B82F6',
        userId: 'user-1',
        memoryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    collections.forEach(c => this.collections.set(c.id, c));

    // Create sample memories
    const memories: Memory[] = [
      {
        id: '1',
        title: 'Understanding RAG Systems',
        content: `# Understanding RAG Systems

Retrieval-Augmented Generation (RAG) is a powerful technique that combines the benefits of retrieval-based and generative AI systems.

## Key Components

1. **Document Store**: Where your knowledge base is stored
2. **Embeddings**: Vector representations of your documents
3. **Retrieval**: Finding relevant documents based on queries
4. **Generation**: Using LLMs to generate responses based on retrieved context`,
        contentType: 'markdown',
        summary: 'An overview of Retrieval-Augmented Generation systems, their components, and benefits.',
        userId: 'user-1',
        collectionId: 'work',
        tags: ['AI', 'RAG', 'Machine Learning', 'LLM'],
        entities: [],
        metadata: {
          source: 'Personal Notes',
          author: 'Demo User',
          wordCount: 245,
          readingTime: 2,
          language: 'en',
        },
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
      },
      {
        id: '2',
        title: 'Vector Databases Comparison',
        content: `# Vector Databases Comparison

A comprehensive comparison of popular vector databases for AI applications.

## Databases Reviewed
- Pinecone
- Weaviate
- Milvus
- Qdrant
- Chroma

Each has unique strengths for different use cases...`,
        contentType: 'markdown',
        summary: 'Comparison of popular vector databases for AI and machine learning applications.',
        userId: 'user-1',
        collectionId: 'work',
        tags: ['Database', 'Vector Search', 'AI Infrastructure'],
        entities: [],
        metadata: {
          source: 'Research',
          author: 'Demo User',
          wordCount: 180,
          readingTime: 1,
          language: 'en',
        },
        createdAt: new Date('2024-01-18').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString(),
      },
    ];
    memories.forEach(m => {
      this.memories.set(m.id, m);
      const collection = this.collections.get(m.collectionId!);
      if (collection) {
        collection.memoryCount++;
      }
    });
  }

  // Memory operations
  async getMemories(userId: string, limit = 20, offset = 0): Promise<Memory[]> {
    const userMemories = Array.from(this.memories.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return userMemories.slice(offset, offset + limit);
  }

  async getMemoryById(id: string, userId: string): Promise<Memory | null> {
    const memory = this.memories.get(id);
    return memory && memory.userId === userId ? memory : null;
  }

  async createMemory(memory: Memory): Promise<Memory> {
    this.memories.set(memory.id, memory);
    
    // Update collection count
    if (memory.collectionId) {
      const collection = this.collections.get(memory.collectionId);
      if (collection) {
        collection.memoryCount++;
        collection.updatedAt = new Date().toISOString();
      }
    }
    
    return memory;
  }

  async updateMemory(id: string, updates: Partial<Memory>, userId: string): Promise<Memory | null> {
    const memory = await this.getMemoryById(id, userId);
    if (!memory) return null;

    const updatedMemory = {
      ...memory,
      ...updates,
      id: memory.id,
      userId: memory.userId,
      createdAt: memory.createdAt,
      updatedAt: new Date().toISOString(),
      version: (memory.version || 0) + 1,
    };

    this.memories.set(id, updatedMemory);
    return updatedMemory;
  }

  async deleteMemory(id: string, userId: string): Promise<boolean> {
    const memory = await this.getMemoryById(id, userId);
    if (!memory) return false;

    // Update collection count
    if (memory.collectionId) {
      const collection = this.collections.get(memory.collectionId);
      if (collection) {
        collection.memoryCount--;
        collection.updatedAt = new Date().toISOString();
      }
    }

    return this.memories.delete(id);
  }

  async searchMemories(userId: string, query: string, filters?: any): Promise<Memory[]> {
    const userMemories = Array.from(this.memories.values())
      .filter(m => m.userId === userId);

    // Simple text search - in production, this would use vector search
    const results = userMemories.filter(memory => {
      const searchText = `${memory.title} ${memory.content} ${memory.tags.join(' ')}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    return results;
  }

  // Collection operations
  async getCollections(userId: string): Promise<Collection[]> {
    return Array.from(this.collections.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCollectionById(id: string, userId: string): Promise<Collection | null> {
    const collection = this.collections.get(id);
    return collection && collection.userId === userId ? collection : null;
  }

  async createCollection(collection: Collection): Promise<Collection> {
    this.collections.set(collection.id, collection);
    return collection;
  }

  // User operations
  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = this.usersByEmail.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user.id);
    return user;
  }

  // Analytics operations
  async getAnalytics(userId: string): Promise<any> {
    const memories = Array.from(this.memories.values())
      .filter(m => m.userId === userId);
    
    const totalMemories = memories.length;
    const totalCollections = Array.from(this.collections.values())
      .filter(c => c.userId === userId).length;
    
    const allTags = memories.flatMap(m => m.tags);
    const uniqueTags = [...new Set(allTags)];
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const memoriesThisWeek = memories.filter(m => 
      new Date(m.createdAt) > weekAgo
    ).length;
    
    const memoriesThisMonth = memories.filter(m => 
      new Date(m.createdAt) > monthAgo
    ).length;

    const totalWords = memories.reduce((sum, m) => 
      sum + (m.metadata.wordCount || 0), 0
    );
    
    const averageMemoryLength = totalMemories > 0 
      ? Math.round(totalWords / totalMemories)
      : 0;

    return {
      totalMemories,
      totalCollections,
      totalTags: uniqueTags.length,
      memoriesThisWeek,
      memoriesThisMonth,
      averageMemoryLength,
      searchCount: Math.floor(Math.random() * 100) + 50, // Mock data
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const db = new InMemoryDatabase();