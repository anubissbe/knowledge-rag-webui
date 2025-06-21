
export type ExportFormat = 'json' | 'markdown' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeTags?: boolean;
  includeRelated?: boolean;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface BulkExportOptions {
  format: ExportFormat;
  memoryIds: string[];
  includeMetadata?: boolean;
  includeTags?: boolean;
  includeRelated?: boolean;
}

class ExportApi {
  async exportAll(options: ExportOptions): Promise<Blob> {
    const params = new URLSearchParams({
      format: options.format,
      includeMetadata: options.includeMetadata?.toString() || 'true',
      includeTags: options.includeTags?.toString() || 'true',
      includeRelated: options.includeRelated?.toString() || 'false',
    });

    if (options.dateFrom) {
      params.append('dateFrom', options.dateFrom);
    }
    if (options.dateTo) {
      params.append('dateTo', options.dateTo);
    }
    if (options.tags?.length) {
      params.append('tags', options.tags.join(','));
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/export?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  async exportMemories(options: BulkExportOptions): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/export/memories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  async exportMemory(id: string, format: ExportFormat): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/export/memories/${id}?format=${format}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  getFilename(format: ExportFormat, prefix = 'memories'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = format === 'markdown' ? 'md' : format;
    return `${prefix}-${timestamp}.${extension}`;
  }
}

export const exportApi = new ExportApi();