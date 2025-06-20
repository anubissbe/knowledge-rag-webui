import { ImportService, ExportService, detectFileType } from '../importExportService'
import type { Memory } from '../../types'

// Helper to read blob content in tests
const readBlobAsText = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

// Mock file creation helpers
const createMockFile = (content: string, filename: string, type?: string): File => {
  const detectedType = type || (
    filename.endsWith('.txt') ? 'text/plain' :
    filename.endsWith('.md') || filename.endsWith('.markdown') ? 'text/markdown' :
    filename.endsWith('.json') ? 'application/json' :
    filename.endsWith('.pdf') ? 'application/pdf' :
    'application/octet-stream'
  )
  const blob = new Blob([content], { type: detectedType })
  return new File([blob], filename, { type: detectedType })
}

describe('detectFileType', () => {
  it('should detect text files correctly', () => {
    const txtFile = createMockFile('content', 'test.txt')
    expect(detectFileType(txtFile)).toBe('text/plain')
  })

  it('should detect markdown files correctly', () => {
    const mdFile = createMockFile('# Content', 'test.md')
    expect(detectFileType(mdFile)).toBe('text/markdown')
    
    const markdownFile = createMockFile('# Content', 'test.markdown')
    expect(detectFileType(markdownFile)).toBe('text/markdown')
  })

  it('should detect JSON files correctly', () => {
    const jsonFile = createMockFile('{}', 'test.json')
    expect(detectFileType(jsonFile)).toBe('application/json')
  })

  it('should detect PDF files correctly', () => {
    const pdfFile = createMockFile('', 'test.pdf')
    expect(detectFileType(pdfFile)).toBe('application/pdf')
  })

  it('should handle unknown file types', () => {
    const unknownFile = createMockFile('', 'test.xyz', '')
    expect(detectFileType(unknownFile)).toBe('application/octet-stream')
  })
})

describe('ImportService', () => {
  let importService: ImportService

  beforeEach(() => {
    importService = new ImportService()
  })

  describe('importFiles', () => {
    it('should import a single text file', async () => {
      const content = 'This is a test memory content.'
      const file = createMockFile(content, 'test.txt')
      const fileList = [file] as unknown as FileList

      const result = await importService.importFiles(fileList)

      expect(result.success).toBe(true)
      expect(result.imported).toBe(1)
      expect(result.failed).toBe(0)
      expect(result.memories).toHaveLength(1)
      expect(result.memories[0].title).toBe('test')
      expect(result.memories[0].content).toBe(content)
      expect(result.memories[0].metadata?.source).toBe('import')
    })

    it('should import markdown file with sections', async () => {
      const content = `# First Section
Content of first section

# Second Section
Content of second section`
      
      const file = createMockFile(content, 'test.md')
      const fileList = [file] as unknown as FileList

      const result = await importService.importFiles(fileList)

      expect(result.success).toBe(true)
      expect(result.imported).toBe(2)
      expect(result.memories).toHaveLength(2)
      expect(result.memories[0].title).toBe('First Section')
      expect(result.memories[1].title).toBe('Second Section')
    })

    it('should import JSON file with memory array', async () => {
      const memories = [
        {
          id: '1',
          title: 'Test Memory 1',
          content: 'Content 1',
          userId: 'user1',
          tags: ['tag1']
        },
        {
          id: '2',
          title: 'Test Memory 2',
          content: 'Content 2',
          userId: 'user2',
          tags: ['tag2']
        }
      ]
      
      const content = JSON.stringify(memories)
      const file = createMockFile(content, 'memories.json', 'application/json')
      const fileList = [file] as unknown as FileList

      const result = await importService.importFiles(fileList)

      expect(result.success).toBe(true)
      expect(result.imported).toBe(2)
      expect(result.memories).toHaveLength(2)
      expect(result.memories[0].title).toBe('Test Memory 1')
      expect(result.memories[1].title).toBe('Test Memory 2')
    })

    it('should import JSON file with export format', async () => {
      const exportData = {
        exportDate: '2024-01-01',
        memories: [
          {
            id: '1',
            title: 'Test Memory',
            content: 'Content',
            user: 'user1'
          }
        ]
      }
      
      const content = JSON.stringify(exportData)
      const file = createMockFile(content, 'export.json', 'application/json')
      const fileList = [file] as unknown as FileList

      const result = await importService.importFiles(fileList)

      expect(result.success).toBe(true)
      expect(result.imported).toBe(1)
      expect(result.memories[0].title).toBe('Test Memory')
    })

    it('should handle invalid JSON files', async () => {
      const content = 'invalid json {'
      const file = createMockFile(content, 'invalid.json', 'application/json')
      const fileList = [file] as unknown as FileList

      const result = await importService.importFiles(fileList)

      expect(result.success).toBe(false)
      expect(result.imported).toBe(0)
      expect(result.failed).toBe(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('invalid.json')
    })

    it('should handle unsupported file types', async () => {
      const file = createMockFile('content', 'test.pdf', 'application/pdf')
      const fileList = [file] as unknown as FileList

      const result = await importService.importFiles(fileList)

      expect(result.success).toBe(false)
      expect(result.imported).toBe(0)
      expect(result.failed).toBe(1)
      expect(result.errors[0]).toContain('PDF import requires additional setup')
    })

    it('should track progress during import', async () => {
      const files = [
        createMockFile('content1', 'test1.txt'),
        createMockFile('content2', 'test2.txt')
      ]
      const fileList = files as unknown as FileList

      const progressUpdates: any[] = []
      const onProgress = (progress: any) => progressUpdates.push(progress)

      await importService.importFiles(fileList, onProgress)

      expect(progressUpdates.length).toBeGreaterThan(0)
      expect(progressUpdates[0].total).toBe(2)
      expect(progressUpdates[0].processed).toBe(0)
      
      const finalUpdate = progressUpdates[progressUpdates.length - 1]
      expect(finalUpdate.processed).toBe(2)
      expect(finalUpdate.status).toBe('completed')
    })
  })
})

describe('ExportService', () => {
  let exportService: ExportService
  let mockMemories: Memory[]

  beforeEach(() => {
    exportService = new ExportService()
    mockMemories = [
      {
        id: '1',
        title: 'Test Memory 1',
        content: 'This is the first memory content.',
        userId: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        tags: ['tag1', 'tag2'],
        collectionId: 'col1',
        metadata: { source: 'manual' }
      },
      {
        id: '2',
        title: 'Test Memory 2',
        content: 'This is the second memory content.',
        userId: 'user2',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        tags: ['tag3'],
        collectionId: 'col2',
        metadata: { source: 'import' }
      }
    ]
  })

  describe('exportMemories', () => {
    it('should export as JSON format', async () => {
      const options = {
        format: 'json' as const,
        includeMetadata: true,
        includeCollections: true
      }

      const blob = await exportService.exportMemories(mockMemories, options)
      const content = await readBlobAsText(blob)
      const data = JSON.parse(content)

      expect(data.memories).toHaveLength(2)
      expect(data.totalMemories).toBe(2)
      expect(data.includeMetadata).toBe(true)
      expect(data.memories[0].id).toBe('1')
      expect(data.memories[0].metadata).toBeDefined()
      expect(data.memories[0].collectionId).toBeDefined()
    })

    it('should export as JSON without metadata', async () => {
      const options = {
        format: 'json' as const,
        includeMetadata: false,
        includeCollections: false
      }

      const blob = await exportService.exportMemories(mockMemories, options)
      const content = await readBlobAsText(blob)
      const data = JSON.parse(content)

      expect(data.memories[0].metadata).toBeUndefined()
      expect(data.memories[0].collection_ids).toBeUndefined()
    })

    it('should export as Markdown format', async () => {
      const options = {
        format: 'markdown' as const,
        includeMetadata: true,
        includeCollections: true
      }

      const blob = await exportService.exportMemories(mockMemories, options)
      const content = await readBlobAsText(blob)

      expect(content).toContain('# Memory Export')
      expect(content).toContain('# Test Memory 1')
      expect(content).toContain('# Test Memory 2')
      expect(content).toContain('This is the first memory content.')
      expect(content).toContain('**Created:**')
      expect(content).toContain('**Tags:** tag1, tag2')
    })

    it('should export as Markdown without metadata', async () => {
      const options = {
        format: 'markdown' as const,
        includeMetadata: false,
        includeCollections: false
      }

      const blob = await exportService.exportMemories(mockMemories, options)
      const content = await readBlobAsText(blob)

      expect(content).toContain('# Test Memory 1')
      expect(content).not.toContain('**Created:**')
      expect(content).not.toContain('**Tags:**')
    })

    it('should throw error for PDF format', async () => {
      const options = {
        format: 'pdf' as const,
        includeMetadata: true,
        includeCollections: true
      }

      await expect(
        exportService.exportMemories(mockMemories, options)
      ).rejects.toThrow('PDF export requires additional setup')
    })

    it('should throw error for unsupported format', async () => {
      const options = {
        format: 'xml' as any,
        includeMetadata: true,
        includeCollections: true
      }

      await expect(
        exportService.exportMemories(mockMemories, options)
      ).rejects.toThrow('Unsupported export format: xml')
    })
  })

  describe('generateFileName', () => {
    it('should generate correct filename for single memory', () => {
      const fileName = exportService.generateFileName('json', 1)
      expect(fileName).toMatch(/knowledge_export_\d{4}-\d{2}-\d{2}_memory\.json/)
    })

    it('should generate correct filename for multiple memories', () => {
      const fileName = exportService.generateFileName('markdown', 5)
      expect(fileName).toMatch(/knowledge_export_\d{4}-\d{2}-\d{2}_5_memories\.markdown/)
    })

    it('should handle different formats', () => {
      const jsonFile = exportService.generateFileName('json', 1)
      const mdFile = exportService.generateFileName('markdown', 1)
      
      expect(jsonFile).toMatch(/\.json$/)
      expect(mdFile).toMatch(/\.markdown$/)
    })
  })
})