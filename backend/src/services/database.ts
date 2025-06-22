// import { v4 as uuidv4 } from 'uuid'; // Removed - not used
import { Memory } from '../models/Memory';
import { Collection } from '../models/Collection';
import { User } from '../models/User';
import { MemoryVersion, MemoryVersionSummary, MemoryVersionComparison, VersionDiff, CreateVersionDto } from '../models/MemoryVersion';
import { MemoryTemplate, CreateTemplateDto, defaultTemplates } from '../models/MemoryTemplate';

// In-memory database for development
// In production, this would be replaced with PostgreSQL + pgvector
class InMemoryDatabase {
  private memories: Map<string, Memory> = new Map();
  private collections: Map<string, Collection> = new Map();
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId
  private memoryVersions: Map<string, MemoryVersion[]> = new Map(); // memoryId -> versions[]
  private memoryTemplates: Map<string, MemoryTemplate> = new Map(); // templateId -> template

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
    // Ensure memory has version 1
    const memoryWithVersion = { ...memory, version: 1 };
    this.memories.set(memory.id, memoryWithVersion);
    
    // Create initial version
    await this.createMemoryVersion(memoryWithVersion, {
      memoryId: memory.id,
      changeType: 'created',
      changeDescription: 'Initial creation',
    }, memory.userId);
    
    // Update collection count
    if (memory.collectionId) {
      const collection = this.collections.get(memory.collectionId);
      if (collection) {
        collection.memoryCount++;
        collection.updatedAt = new Date().toISOString();
      }
    }
    
    return memoryWithVersion;
  }

  async updateMemory(id: string, updates: Partial<Memory>, userId: string, changeDescription?: string): Promise<Memory | null> {
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
    
    // Create version entry for the update
    await this.createMemoryVersion(updatedMemory, {
      memoryId: id,
      changeType: 'updated',
      changeDescription: changeDescription || 'Memory updated',
    }, userId);
    
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

  async searchMemories(userId: string, query: string, _filters?: Record<string, unknown>): Promise<Memory[]> {
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

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    
    // Update email index if email changed
    if (updates.email && updates.email !== user.email) {
      this.usersByEmail.delete(user.email);
      this.usersByEmail.set(updates.email, id);
    }
    
    return updatedUser;
  }

  // Analytics operations
  async getAnalytics(userId: string): Promise<Record<string, unknown>> {
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

  // Memory Version operations
  async createMemoryVersion(memory: Memory, createVersionDto: CreateVersionDto, createdBy: string): Promise<MemoryVersion> {
    const { v4: uuidv4 } = await import('uuid');
    
    const version: MemoryVersion = {
      id: uuidv4(),
      memoryId: memory.id,
      version: memory.version || 1,
      title: memory.title,
      content: memory.content,
      contentType: memory.contentType,
      summary: memory.summary,
      tags: [...memory.tags],
      metadata: {
        ...memory.metadata,
        changedFields: this.detectChangedFields(memory, createVersionDto),
        previousVersion: createVersionDto.changeType === 'restored' ? createVersionDto.restoredFromVersion : (memory.version || 1) - 1,
      },
      changeType: createVersionDto.changeType,
      changeDescription: createVersionDto.changeDescription,
      userId: memory.userId,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    const versions = this.memoryVersions.get(memory.id) || [];
    versions.push(version);
    this.memoryVersions.set(memory.id, versions);

    return version;
  }

  async getMemoryVersions(memoryId: string, userId: string, limit = 20, offset = 0): Promise<MemoryVersionSummary[]> {
    const memory = await this.getMemoryById(memoryId, userId);
    if (!memory) return [];

    const versions = this.memoryVersions.get(memoryId) || [];
    return versions
      .sort((a, b) => b.version - a.version)
      .slice(offset, offset + limit)
      .map(v => ({
        id: v.id,
        version: v.version,
        changeType: v.changeType,
        changeDescription: v.changeDescription,
        createdAt: v.createdAt,
        createdBy: v.createdBy,
        changedFields: v.metadata.changedFields,
      }));
  }

  async getMemoryVersion(memoryId: string, version: number, userId: string): Promise<MemoryVersion | null> {
    const memory = await this.getMemoryById(memoryId, userId);
    if (!memory) return null;

    const versions = this.memoryVersions.get(memoryId) || [];
    return versions.find(v => v.version === version) || null;
  }

  async compareMemoryVersions(memoryId: string, fromVersion: number, toVersion: number, userId: string): Promise<MemoryVersionComparison | null> {
    const memory = await this.getMemoryById(memoryId, userId);
    if (!memory) return null;

    const versions = this.memoryVersions.get(memoryId) || [];
    const fromVer = versions.find(v => v.version === fromVersion);
    const toVer = versions.find(v => v.version === toVersion);

    if (!fromVer || !toVer) return null;

    const differences = this.calculateVersionDifferences(fromVer, toVer);
    
    return {
      memoryId,
      fromVersion,
      toVersion,
      differences,
      summary: {
        totalChanges: differences.length,
        fieldsChanged: [...new Set(differences.map(d => d.field))],
        addedContent: differences.filter(d => d.changeType === 'added').length,
        removedContent: differences.filter(d => d.changeType === 'removed').length,
      },
    };
  }

  async restoreMemoryVersion(memoryId: string, version: number, userId: string, restoredBy: string): Promise<Memory | null> {
    const memory = await this.getMemoryById(memoryId, userId);
    if (!memory) return null;

    const targetVersion = await this.getMemoryVersion(memoryId, version, userId);
    if (!targetVersion) return null;

    // Create a version of the current state before restoring
    await this.createMemoryVersion(memory, {
      memoryId,
      changeType: 'updated',
      changeDescription: `Before restoring to version ${version}`,
    }, restoredBy);

    // Restore the memory to the target version
    const restoredMemory: Memory = {
      ...memory,
      title: targetVersion.title,
      content: targetVersion.content,
      contentType: targetVersion.contentType,
      summary: targetVersion.summary,
      tags: [...targetVersion.tags],
      updatedAt: new Date().toISOString(),
      version: (memory.version || 0) + 1,
    };

    this.memories.set(memoryId, restoredMemory);

    // Create a version entry for the restoration
    await this.createMemoryVersion(restoredMemory, {
      memoryId,
      changeType: 'restored',
      changeDescription: `Restored from version ${version}`,
      restoredFromVersion: version,
    }, restoredBy);

    return restoredMemory;
  }

  private detectChangedFields(_memory: Memory, _createVersionDto: CreateVersionDto): string[] {
    // For now, return all major fields as potentially changed
    // In a real implementation, this would compare with the previous version
    const fields = ['title', 'content', 'summary', 'tags', 'contentType'];
    return fields;
  }

  private calculateVersionDifferences(fromVersion: MemoryVersion, toVersion: MemoryVersion): VersionDiff[] {
    const differences: VersionDiff[] = [];

    // Compare title
    if (fromVersion.title !== toVersion.title) {
      differences.push({
        field: 'title',
        oldValue: fromVersion.title,
        newValue: toVersion.title,
        changeType: 'modified',
      });
    }

    // Compare content
    if (fromVersion.content !== toVersion.content) {
      differences.push({
        field: 'content',
        oldValue: fromVersion.content,
        newValue: toVersion.content,
        changeType: 'modified',
      });
    }

    // Compare summary
    if (fromVersion.summary !== toVersion.summary) {
      differences.push({
        field: 'summary',
        oldValue: fromVersion.summary,
        newValue: toVersion.summary,
        changeType: 'modified',
      });
    }

    // Compare tags
    const fromTags = new Set(fromVersion.tags);
    const toTags = new Set(toVersion.tags);
    
    for (const tag of fromTags) {
      if (!toTags.has(tag)) {
        differences.push({
          field: 'tags',
          oldValue: tag,
          newValue: null,
          changeType: 'removed',
        });
      }
    }
    
    for (const tag of toTags) {
      if (!fromTags.has(tag)) {
        differences.push({
          field: 'tags',
          oldValue: null,
          newValue: tag,
          changeType: 'added',
        });
      }
    }

    // Compare content type
    if (fromVersion.contentType !== toVersion.contentType) {
      differences.push({
        field: 'contentType',
        oldValue: fromVersion.contentType,
        newValue: toVersion.contentType,
        changeType: 'modified',
      });
    }

    return differences;
  }

  // Memory Template Methods

  private async initializeDefaultTemplates() {
    // Initialize default system templates
    const { v4: uuidv4 } = await import('uuid');
    
    defaultTemplates.forEach((templateData) => {
      const template: MemoryTemplate = {
        id: uuidv4(),
        ...templateData,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.memoryTemplates.set(template.id, template);
    });
  }

  // Get all memory templates (system + user custom)
  async getMemoryTemplates(userId: string): Promise<MemoryTemplate[]> {
    // Initialize default templates if not already done
    if (this.memoryTemplates.size === 0) {
      await this.initializeDefaultTemplates();
    }

    const templates = Array.from(this.memoryTemplates.values())
      .filter(template => template.isSystem || template.userId === userId)
      .sort((a, b) => {
        // System templates first, then custom templates
        if (a.isSystem !== b.isSystem) {
          return a.isSystem ? -1 : 1;
        }
        // Within same type, sort by usage count (descending), then by name
        if (a.usageCount !== b.usageCount) {
          return b.usageCount - a.usageCount;
        }
        return a.name.localeCompare(b.name);
      });

    return templates;
  }

  // Get templates by category
  async getMemoryTemplatesByCategory(category: MemoryTemplate['category'], userId: string): Promise<MemoryTemplate[]> {
    const allTemplates = await this.getMemoryTemplates(userId);
    return allTemplates.filter(template => template.category === category);
  }

  // Get specific memory template
  async getMemoryTemplate(templateId: string, userId: string): Promise<MemoryTemplate | null> {
    const template = this.memoryTemplates.get(templateId);
    if (!template) {
      return null;
    }

    // Check if user has access (system templates or own custom templates)
    if (template.isSystem || template.userId === userId) {
      return template;
    }

    return null;
  }

  // Create custom memory template
  async createMemoryTemplate(createDto: CreateTemplateDto & { userId: string }, userId: string): Promise<MemoryTemplate> {
    const { v4: uuidv4 } = await import('uuid');
    
    const template: MemoryTemplate = {
      id: uuidv4(),
      name: createDto.name,
      description: createDto.description,
      category: createDto.category,
      icon: createDto.icon || '📝',
      color: createDto.color || '#6B7280',
      template: createDto.template,
      isSystem: false,
      userId: userId,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryTemplates.set(template.id, template);
    return template;
  }

  // Update memory template (only custom templates)
  async updateMemoryTemplate(templateId: string, updateData: Partial<CreateTemplateDto>, userId: string): Promise<MemoryTemplate | null> {
    const template = this.memoryTemplates.get(templateId);
    if (!template || template.isSystem || template.userId !== userId) {
      return null;
    }

    const updatedTemplate: MemoryTemplate = {
      ...template,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    this.memoryTemplates.set(templateId, updatedTemplate);
    return updatedTemplate;
  }

  // Delete memory template (only custom templates)
  async deleteMemoryTemplate(templateId: string, userId: string): Promise<boolean> {
    const template = this.memoryTemplates.get(templateId);
    if (!template || template.isSystem || template.userId !== userId) {
      return false;
    }

    return this.memoryTemplates.delete(templateId);
  }

  // Increment template usage count
  async incrementTemplateUsage(templateId: string, userId: string): Promise<void> {
    const template = this.memoryTemplates.get(templateId);
    if (template && (template.isSystem || template.userId === userId)) {
      template.usageCount++;
      template.updatedAt = new Date().toISOString();
      this.memoryTemplates.set(templateId, template);
    }
  }

  // Get template usage statistics
  async getTemplateStats(templateId: string, userId: string): Promise<{ usageCount: number; lastUsed: string } | null> {
    const template = this.memoryTemplates.get(templateId);
    if (!template || (!template.isSystem && template.userId !== userId)) {
      return null;
    }

    return {
      usageCount: template.usageCount,
      lastUsed: template.updatedAt,
    };
  }
}

// Export singleton instance
export const db = new InMemoryDatabase();