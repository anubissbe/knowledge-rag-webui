export interface Memory {
  id: string;
  title: string;
  content: string;
  contentType: 'text' | 'markdown' | 'code' | 'link';
  summary?: string;
  userId: string;
  collectionId?: string;
  tags: string[];
  entities: Entity[];
  metadata: MemoryMetadata;
  relatedMemories?: string[];
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface Entity {
  id: string;
  name: string;
  type: 'person' | 'place' | 'organization' | 'concept' | 'event' | 'other';
  description?: string;
  aliases?: string[];
  properties?: Record<string, unknown>;
  memoryIds: string[];
}

export interface MemoryMetadata {
  source?: string;
  author?: string;
  url?: string;
  wordCount: number;
  readingTime: number;
  language: string;
  [key: string]: unknown;
}

export interface CreateMemoryDto {
  title: string;
  content: string;
  contentType?: 'text' | 'markdown' | 'code' | 'link';
  summary?: string;
  collectionId?: string;
  tags?: string[];
  metadata?: Partial<MemoryMetadata>;
}

export interface UpdateMemoryDto extends Partial<CreateMemoryDto> {
  id: string;
}