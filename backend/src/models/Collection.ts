export interface Collection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  userId: string;
  memoryCount: number;
  tags?: string[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  tags?: string[];
}