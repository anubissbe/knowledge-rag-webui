import { apiClient } from './baseApi';

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'select' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface MemoryTemplate {
  id: string;
  name: string;
  description: string;
  category: 'meeting' | 'learning' | 'project' | 'research' | 'personal' | 'code' | 'recipe' | 'book' | 'custom';
  icon: string;
  color: string;
  template: {
    title: string;
    content: string;
    contentType: 'text' | 'markdown' | 'code';
    tags: string[];
    metadata?: {
      fields: TemplateField[];
      structure?: string;
    };
  };
  isSystem: boolean;
  userId?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  description: string;
  category: MemoryTemplate['category'];
  icon?: string;
  color?: string;
  template: {
    title: string;
    content: string;
    contentType: 'text' | 'markdown' | 'code';
    tags: string[];
    metadata?: {
      fields: TemplateField[];
      structure?: string;
    };
  };
}

export interface TemplatesResponse {
  templates: MemoryTemplate[];
}

export const memoryTemplatesApi = {
  // Get all memory templates
  async getMemoryTemplates(): Promise<TemplatesResponse> {
    return await apiClient.get<TemplatesResponse>('/templates');
  },

  // Get templates by category
  async getTemplatesByCategory(category: MemoryTemplate['category']): Promise<TemplatesResponse> {
    return await apiClient.get<TemplatesResponse>(`/templates/category/${category}`);
  },

  // Get specific template
  async getTemplate(templateId: string): Promise<MemoryTemplate> {
    return await apiClient.get<MemoryTemplate>(`/templates/${templateId}`);
  },

  // Create custom template
  async createTemplate(template: CreateTemplateDto): Promise<MemoryTemplate> {
    return await apiClient.post<MemoryTemplate>('/templates', template);
  },

  // Update template (custom only)
  async updateTemplate(templateId: string, updates: Partial<CreateTemplateDto>): Promise<MemoryTemplate> {
    return await apiClient.put<MemoryTemplate>(`/templates/${templateId}`, updates);
  },

  // Delete template (custom only)
  async deleteTemplate(templateId: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/templates/${templateId}`);
  },

  // Record template usage
  async useTemplate(templateId: string): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(`/templates/${templateId}/use`, {});
  },

  // Get template stats
  async getTemplateStats(templateId: string): Promise<{ usageCount: number; lastUsed: string }> {
    return await apiClient.get<{ usageCount: number; lastUsed: string }>(`/templates/${templateId}/stats`);
  }
};