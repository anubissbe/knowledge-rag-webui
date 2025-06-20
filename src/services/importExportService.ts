import type { Memory, CreateMemoryDto } from '../types'

export interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: string[]
  memories: Memory[]
}

export interface ExportOptions {
  format: 'json' | 'markdown' | 'pdf'
  includeMetadata: boolean
  includeCollections: boolean
  selectedMemories?: string[]
}

export interface ImportProgress {
  total: number
  processed: number
  current: string
  status: 'processing' | 'completed' | 'error'
}

// File type detection
export const detectFileType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'txt':
      return 'text/plain'
    case 'md':
    case 'markdown':
      return 'text/markdown'
    case 'json':
      return 'application/json'
    case 'pdf':
      return 'application/pdf'
    case 'doc':
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    default:
      return file.type || 'application/octet-stream'
  }
}

// Import functionality
export class ImportService {
  async importFiles(
    files: FileList,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
      memories: []
    }

    const totalFiles = files.length

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i]
      
      onProgress?.({
        total: totalFiles,
        processed: i,
        current: file.name,
        status: 'processing'
      })

      try {
        const memories = await this.processFile(file)
        result.memories.push(...memories)
        result.imported += memories.length
      } catch (error) {
        result.failed++
        result.errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        result.success = false
      }
    }

    onProgress?.({
      total: totalFiles,
      processed: totalFiles,
      current: '',
      status: result.success ? 'completed' : 'error'
    })

    return result
  }

  private async processFile(file: File): Promise<Memory[]> {
    const fileType = detectFileType(file)
    
    switch (fileType) {
      case 'text/plain':
      case 'text/markdown':
        return this.importTextFile(file)
      case 'application/json':
        return this.importJsonFile(file)
      case 'application/pdf':
        return this.importPdfFile(file)
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.importWordFile(file)
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  private async importTextFile(file: File): Promise<Memory[]> {
    const content = await this.readFileAsText(file)
    const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown')
    
    // Split content into sections if it contains headers
    if (isMarkdown && content.includes('# ')) {
      return this.splitMarkdownSections(content, file.name)
    }
    
    // Create single memory from file
    const memory: CreateMemoryDto = {
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      content: content,
      userId: 'imported-user',
      metadata: {
        source: 'import',
        originalFile: file.name,
        importDate: new Date().toISOString(),
        fileType: isMarkdown ? 'markdown' : 'text'
      }
    }

    // In a real implementation, this would call the API
    return [memory as Memory]
  }

  private async importJsonFile(file: File): Promise<Memory[]> {
    const content = await this.readFileAsText(file)
    
    try {
      const data = JSON.parse(content)
      
      // Handle different JSON formats
      if (Array.isArray(data)) {
        // Array of memories
        return data.map((item, index) => this.normalizeJsonMemory(item, file.name, index))
      } else if (data.memories && Array.isArray(data.memories)) {
        // Export format with memories property
        return data.memories.map((item: Record<string, unknown>, index: number) => 
          this.normalizeJsonMemory(item, file.name, index)
        )
      } else {
        // Single memory object
        return [this.normalizeJsonMemory(data, file.name, 0)]
      }
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Parse error'}`)
    }
  }

  private normalizeJsonMemory(item: Record<string, unknown>, fileName: string, index: number): Memory {
    return {
      id: item.id || `imported-${Date.now()}-${index}`,
      title: item.title || `Imported from ${fileName} (${index + 1})`,
      content: item.content || JSON.stringify(item, null, 2),
      userId: item.userId || item.user || 'imported-user',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      metadata: {
        ...item.metadata,
        source: 'import',
        originalFile: fileName,
        importDate: new Date().toISOString()
      },
      tags: item.tags || [],
      collectionId: item.collectionId || item.collection_ids?.[0]
    }
  }

  private async importPdfFile(_file: File): Promise<Memory[]> {
    // For PDF import, we'd need a PDF parsing library
    // This is a simplified implementation
    throw new Error('PDF import requires additional setup. Please convert to text or markdown first.')
  }

  private async importWordFile(_file: File): Promise<Memory[]> {
    // For Word document import, we'd need a DOCX parsing library
    // This is a simplified implementation
    throw new Error('Word document import requires additional setup. Please convert to text or markdown first.')
  }

  private splitMarkdownSections(content: string, fileName: string): Memory[] {
    const sections = content.split(/^# /m).filter(section => section.trim())
    
    return sections.map((section, index) => {
      const lines = section.split('\n')
      const title = lines[0].trim() || `Section ${index + 1} from ${fileName}`
      const content = lines.slice(1).join('\n').trim()
      
      return {
        id: `imported-${Date.now()}-${index}`,
        title,
        content,
        userId: 'imported-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          source: 'import',
          originalFile: fileName,
          importDate: new Date().toISOString(),
          section: index + 1
        },
        tags: [],
        collection_ids: []
      } as Memory
    })
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}

// Export functionality
export class ExportService {
  async exportMemories(memories: Memory[], options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'json':
        return this.exportAsJson(memories, options)
      case 'markdown':
        return this.exportAsMarkdown(memories, options)
      case 'pdf':
        return this.exportAsPdf(memories, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  private exportAsJson(memories: Memory[], options: ExportOptions): Blob {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalMemories: memories.length,
      includeMetadata: options.includeMetadata,
      includeCollections: options.includeCollections,
      memories: memories.map(memory => ({
        id: memory.id,
        title: memory.title,
        content: memory.content,
        userId: memory.userId,
        created_at: memory.created_at,
        updated_at: memory.updated_at,
        tags: memory.tags,
        ...(options.includeCollections && { collectionId: memory.collectionId }),
        ...(options.includeMetadata && { metadata: memory.metadata })
      }))
    }

    const content = JSON.stringify(exportData, null, 2)
    return new Blob([content], { type: 'application/json' })
  }

  private exportAsMarkdown(memories: Memory[], options: ExportOptions): Blob {
    let content = `# Memory Export\n\n`
    content += `Export Date: ${new Date().toLocaleDateString()}\n`
    content += `Total Memories: ${memories.length}\n\n`
    content += `---\n\n`

    memories.forEach((memory) => {
      content += `# ${memory.title}\n\n`
      content += `${memory.content}\n\n`
      
      if (options.includeMetadata) {
        content += `**Created:** ${new Date(memory.created_at).toLocaleDateString()}\n`
        content += `**User:** ${memory.userId}\n`
        
        if (memory.tags && memory.tags.length > 0) {
          content += `**Tags:** ${memory.tags.join(', ')}\n`
        }
        
        if (memory.metadata) {
          content += `**Metadata:** ${JSON.stringify(memory.metadata, null, 2)}\n`
        }
      }
      
      content += `\n---\n\n`
    })

    return new Blob([content], { type: 'text/markdown' })
  }

  private async exportAsPdf(memories: Memory[], options: ExportOptions): Promise<Blob> {
    // For PDF export, we'd need a PDF generation library like jsPDF
    // This is a simplified implementation that creates a basic PDF
    throw new Error('PDF export requires additional setup. Please use JSON or Markdown format.')
  }

  generateFileName(format: string, count: number): string {
    const timestamp = new Date().toISOString().split('T')[0]
    const countSuffix = count > 1 ? `_${count}_memories` : '_memory'
    return `knowledge_export_${timestamp}${countSuffix}.${format}`
  }
}

// Singleton instances
export const importService = new ImportService()
export const exportService = new ExportService()