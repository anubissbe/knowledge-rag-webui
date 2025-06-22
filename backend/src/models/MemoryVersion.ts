export interface MemoryVersion {
  id: string;
  memoryId: string;
  version: number;
  title: string;
  content: string;
  contentType: 'text' | 'markdown' | 'code' | 'link';
  summary?: string;
  tags: string[];
  metadata: MemoryVersionMetadata;
  changeType: 'created' | 'updated' | 'restored';
  changeDescription?: string;
  userId: string;
  createdAt: string;
  createdBy: string;
}

export interface MemoryVersionMetadata {
  source?: string;
  author?: string;
  url?: string;
  wordCount: number;
  readingTime: number;
  language: string;
  changedFields: string[];
  previousVersion?: number;
  [key: string]: unknown;
}

export interface MemoryVersionSummary {
  id: string;
  version: number;
  changeType: 'created' | 'updated' | 'restored';
  changeDescription?: string;
  createdAt: string;
  createdBy: string;
  changedFields: string[];
}

export interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'added' | 'removed' | 'modified';
}

export interface MemoryVersionComparison {
  memoryId: string;
  fromVersion: number;
  toVersion: number;
  differences: VersionDiff[];
  summary: {
    totalChanges: number;
    fieldsChanged: string[];
    addedContent: number;
    removedContent: number;
  };
}

export interface CreateVersionDto {
  memoryId: string;
  changeType: 'created' | 'updated' | 'restored';
  changeDescription?: string;
  restoredFromVersion?: number;
}

export interface VersionListQuery {
  memoryId: string;
  limit?: number;
  offset?: number;
  includeContent?: boolean;
}