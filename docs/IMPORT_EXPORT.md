# Import/Export Functionality

## Overview

The Knowledge RAG WebUI provides comprehensive import and export capabilities, allowing users to:
- Import documents from various formats into the memory system
- Export memories in multiple formats for backup, sharing, or migration
- Batch process multiple files with progress tracking
- Handle various file types with appropriate parsing

## Features

### Import Capabilities

#### Supported File Types
- **Text Files (.txt)** - Plain text documents converted to memories
- **Markdown Files (.md, .markdown)** - Markdown documents with section splitting
- **JSON Files (.json)** - Structured data or memory exports

#### Import Process
1. **File Selection** - Drag and drop or click to select files
2. **Automatic Detection** - File types detected by extension and content
3. **Progress Tracking** - Real-time progress display during processing
4. **Error Handling** - Clear error messages for failed imports
5. **Memory Creation** - Imported content automatically added to memory store

### Export Capabilities

#### Export Formats
- **JSON** - Structured data with full metadata
- **Markdown** - Human-readable format with optional metadata
- **PDF** - Formatted document (planned feature)

#### Export Options
- **Metadata Inclusion** - Choose whether to include creation dates, users, etc.
- **Collection Information** - Include collection associations
- **Memory Selection** - Export all memories or selected subset
- **Custom Filenames** - Automatically generated with timestamps

## Usage Guide

### Importing Files

#### Basic Import
1. Navigate to **Import/Export** page
2. Drag files to upload area or click "Select Files"
3. Choose supported file types (.txt, .md, .json)
4. Monitor progress during import
5. Review import results and any errors

#### Text File Import
```
Sample text file content:
This is a memory about project planning.
It will be imported as a single memory with the filename as title.
```

#### Markdown File Import
```markdown
# Project Overview
This section will become one memory.

# Technical Requirements  
This section will become another memory.

# Implementation Notes
Each H1 header creates a separate memory.
```

#### JSON File Import
```json
{
  "memories": [
    {
      "title": "Meeting Notes",
      "content": "Discussed project timeline and requirements.",
      "user": "john.doe",
      "tags": ["meeting", "project"],
      "metadata": {
        "source": "import",
        "category": "work"
      }
    }
  ]
}
```

### Exporting Memories

#### JSON Export
```typescript
// Export all memories as JSON with full metadata
const exportOptions = {
  format: 'json',
  includeMetadata: true,
  includeCollections: true
}
```

#### Markdown Export
```typescript
// Export selected memories as Markdown
const exportOptions = {
  format: 'markdown', 
  includeMetadata: false,
  selectedMemories: ['memory-1', 'memory-2']
}
```

## API Reference

### ImportService

```typescript
class ImportService {
  async importFiles(
    files: FileList,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult>
}
```

#### ImportResult Interface
```typescript
interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: string[]
  memories: Memory[]
}
```

#### ImportProgress Interface
```typescript
interface ImportProgress {
  total: number
  processed: number
  current: string
  status: 'processing' | 'completed' | 'error'
}
```

### ExportService

```typescript
class ExportService {
  async exportMemories(
    memories: Memory[], 
    options: ExportOptions
  ): Promise<Blob>
  
  generateFileName(format: string, count: number): string
}
```

#### ExportOptions Interface
```typescript
interface ExportOptions {
  format: 'json' | 'markdown' | 'pdf'
  includeMetadata: boolean
  includeCollections: boolean
  selectedMemories?: string[]
}
```

## Implementation Details

### File Type Detection
```typescript
export const detectFileType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'txt': return 'text/plain'
    case 'md':
    case 'markdown': return 'text/markdown'
    case 'json': return 'application/json'
    default: return file.type || 'application/octet-stream'
  }
}
```

### Markdown Section Splitting
The import service automatically splits Markdown files at H1 headers (`# Title`):

```typescript
private splitMarkdownSections(content: string, fileName: string): Memory[] {
  const sections = content.split(/^# /m).filter(section => section.trim())
  
  return sections.map((section, index) => {
    const lines = section.split('\n')
    const title = lines[0].trim() || `Section ${index + 1} from ${fileName}`
    const content = lines.slice(1).join('\n').trim()
    
    return {
      title,
      content,
      metadata: {
        source: 'import',
        originalFile: fileName,
        section: index + 1
      }
      // ... other fields
    }
  })
}
```

### Error Handling
```typescript
try {
  const memories = await this.processFile(file)
  result.memories.push(...memories)
  result.imported += memories.length
} catch (error) {
  result.failed++
  result.errors.push(`${file.name}: ${error.message}`)
  result.success = false
}
```

## Component Architecture

### ImportExportPage
Main page component that orchestrates import/export functionality:

```typescript
const ImportExportPage: React.FC = () => {
  const { memories, addMemory } = useMemoryStore()
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  
  const handleFilesSelected = async (files: FileList) => {
    const result = await importService.importFiles(files, setImportProgress)
    setImportResult(result)
    
    result.memories.forEach(memory => addMemory(memory))
  }
  
  // ... component implementation
}
```

### FileUpload Component
Handles drag-and-drop and click-to-select file uploads:

```typescript
const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isProcessing }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && !isProcessing) {
      onFilesSelected(e.dataTransfer.files)
    }
  }, [onFilesSelected, isProcessing])
  
  // ... component implementation
}
```

### ExportSection Component
Provides export format selection and options:

```typescript
const ExportSection: React.FC<ExportSectionProps> = ({ memories }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeCollections: true
  })
  
  const handleExport = async () => {
    const blob = await exportService.exportMemories(memories, exportOptions)
    // Create download link and trigger download
  }
  
  // ... component implementation
}
```

## Testing

### Unit Tests
```typescript
describe('ImportService', () => {
  it('should import a single text file', async () => {
    const content = 'This is a test memory content.'
    const file = createMockFile(content, 'test.txt')
    const result = await importService.importFiles([file])
    
    expect(result.success).toBe(true)
    expect(result.imported).toBe(1)
    expect(result.memories[0].title).toBe('test')
  })
})
```

### E2E Tests
```typescript
test('should import a text file successfully', async ({ page }) => {
  await page.goto('/import-export')
  
  // Mock file upload
  await page.evaluate(() => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    // Trigger file upload...
  })
  
  await expect(page.locator('text=Import Completed')).toBeVisible()
})
```

## Error Messages

### Import Errors
- **"Unsupported file type"** - File extension not supported
- **"Invalid JSON format"** - JSON file cannot be parsed
- **"Failed to read file"** - File reading error
- **"PDF import requires additional setup"** - PDF parser not available

### Export Errors
- **"No memories to export"** - No memories selected for export
- **"Unsupported export format"** - Invalid export format specified
- **"PDF export requires additional setup"** - PDF generation not available

## Performance Considerations

### Large File Handling
- Files are processed individually to prevent memory issues
- Progress tracking for user feedback during long operations
- Error isolation - one failed file doesn't stop others

### Memory Management
- Imported memories are added to store incrementally
- File reading uses streaming where possible
- Blob objects are properly cleaned up after download

### Batch Operations
- Multiple files processed sequentially for stability
- Progress callbacks provide real-time updates
- Import results aggregated for final summary

## Future Enhancements

### Planned Features
1. **PDF Import** - Extract text from PDF documents
2. **Word Document Import** - Parse .docx files
3. **PDF Export** - Generate formatted PDF documents
4. **Advanced Filtering** - Export memories by date range, tags, etc.
5. **Schedule Exports** - Automated periodic backups
6. **Cloud Storage Integration** - Direct import/export from cloud services

### Technical Improvements
1. **Streaming Processing** - Handle very large files
2. **Background Processing** - Web Workers for heavy operations
3. **Compression** - Compress large exports
4. **Encryption** - Secure sensitive exports
5. **Format Validation** - Enhanced file type detection

## Security Considerations

### File Safety
- File type validation before processing
- Content sanitization for imported text
- Size limits to prevent abuse
- No server-side file storage (client-side only)

### Data Privacy
- All processing happens client-side
- No files uploaded to external servers
- User controls export content and format
- Metadata can be excluded from exports

---

## Quick Reference

### Import File Types
| Extension | Type | Description |
|-----------|------|-------------|
| .txt | Text | Plain text files |
| .md, .markdown | Markdown | Markdown with section splitting |
| .json | JSON | Memory exports or structured data |

### Export Formats
| Format | Description | Use Case |
|--------|-------------|----------|
| JSON | Structured data | Backup, data exchange |
| Markdown | Human-readable | Documentation, sharing |
| PDF | Formatted document | Presentation, archival |

### Navigation
- **Page**: `/import-export`
- **Sidebar**: Import/Export (Upload icon)
- **Keyboard**: Access via Tab navigation
- **Mobile**: Responsive design with touch support