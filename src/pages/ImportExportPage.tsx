import React, { useState, useCallback } from 'react'
import { Upload, Download, FileText, CheckCircle, XCircle, Loader2, File, Archive } from 'lucide-react'
import { useMemoryStore } from '../stores/memoryStore'
import { importService, exportService, type ImportResult, type ImportProgress, type ExportOptions } from '../services/importExportService'
import type { Memory } from '../types'

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void
  isProcessing: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isProcessing }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && !isProcessing) {
      onFilesSelected(e.dataTransfer.files)
    }
  }, [onFilesSelected, isProcessing])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files)
    }
  }, [onFilesSelected])

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200 hover:border-gray-400"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
    >
      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
      <div className="mb-4">
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to select
        </p>
        <p className="text-sm text-gray-500">
          Supports: .txt, .md, .json files
        </p>
      </div>
      <input
        type="file"
        multiple
        accept=".txt,.md,.markdown,.json"
        onChange={handleFileSelect}
        disabled={isProcessing}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
        } transition-colors duration-200`}
      >
        <Upload className="mr-2" size={16} />
        Select Files
      </label>
    </div>
  )
}

interface ImportProgressProps {
  progress: ImportProgress | null
  result: ImportResult | null
}

const ImportProgressDisplay: React.FC<ImportProgressProps> = ({ progress, result }) => {
  if (!progress && !result) return null

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Import Progress</h3>
      
      {progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Processing: {progress.current || 'Preparing...'}
            </span>
            <span className="text-sm text-gray-600">
              {progress.processed} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.processed / progress.total) * 100}%` }}
            />
          </div>
          {progress.status === 'processing' && (
            <div className="flex items-center mt-2 text-blue-600">
              <Loader2 className="animate-spin mr-2" size={16} />
              <span className="text-sm">Processing files...</span>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center">
            {result.success ? (
              <CheckCircle className="text-green-600 mr-2" size={20} />
            ) : (
              <XCircle className="text-red-600 mr-2" size={20} />
            )}
            <span className="font-medium">
              {result.success ? 'Import Completed' : 'Import Completed with Errors'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-green-600">
              <CheckCircle size={16} className="mr-1" />
              <span>{result.imported} imported</span>
            </div>
            {result.failed > 0 && (
              <div className="flex items-center text-red-600">
                <XCircle size={16} className="mr-1" />
                <span>{result.failed} failed</span>
              </div>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="break-words">• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ExportSectionProps {
  memories: Memory[]
}

const ExportSection: React.FC<ExportSectionProps> = ({ memories }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeCollections: true
  })
  const [isExporting, setIsExporting] = useState(false)
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])

  const handleExport = async () => {
    if (memories.length === 0) {
      alert('No memories to export')
      return
    }

    setIsExporting(true)

    try {
      const memoriesToExport = selectedMemories.length > 0 
        ? memories.filter(m => selectedMemories.includes(m.id))
        : memories

      const options = {
        ...exportOptions,
        selectedMemories: selectedMemories.length > 0 ? selectedMemories : undefined
      }

      const blob = await exportService.exportMemories(memoriesToExport, options)
      const fileName = exportService.generateFileName(options.format, memoriesToExport.length)
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedMemories.length === memories.length) {
      setSelectedMemories([])
    } else {
      setSelectedMemories(memories.map(m => m.id))
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Download className="mr-2" size={20} />
        Export Memories
      </h3>

      <div className="space-y-6">
        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'json', label: 'JSON', icon: FileText },
              { value: 'markdown', label: 'Markdown', icon: File },
              { value: 'pdf', label: 'PDF', icon: Archive }
            ].map((format) => {
              const Icon = format.icon
              return (
                <button
                  key={format.value}
                  onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                  className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                    exportOptions.format === format.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {format.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  includeMetadata: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include metadata</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeCollections}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  includeCollections: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include collection information</span>
            </label>
          </div>
        </div>

        {/* Memory Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Memories ({memories.length} total)
            </label>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedMemories.length === memories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
            {memories.slice(0, 20).map((memory) => (
              <label key={memory.id} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedMemories.includes(memory.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMemories(prev => [...prev, memory.id])
                    } else {
                      setSelectedMemories(prev => prev.filter(id => id !== memory.id))
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 truncate">{memory.title}</span>
              </label>
            ))}
            {memories.length > 20 && (
              <p className="text-xs text-gray-500 italic">
                Showing first 20 memories. Use "Select All" to include all {memories.length} memories.
              </p>
            )}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || memories.length === 0}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isExporting || memories.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } transition-colors duration-200`}
        >
          {isExporting ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2" size={16} />
              Export {selectedMemories.length > 0 ? selectedMemories.length : memories.length} Memories
            </>
          )}
        </button>
      </div>
    </div>
  )
}

const ImportExportPage: React.FC = () => {
  const { memories, addMemory } = useMemoryStore()
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesSelected = async (files: FileList) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setImportResult(null)
    
    try {
      const result = await importService.importFiles(files, setImportProgress)
      setImportResult(result)
      
      // Add imported memories to store
      result.memories.forEach(memory => {
        addMemory(memory)
      })
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: false,
        imported: 0,
        failed: files.length,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        memories: []
      })
    } finally {
      setIsProcessing(false)
      setImportProgress(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Import & Export</h1>
        <p className="text-gray-600">
          Import your existing documents or export your memories for backup and sharing.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Import Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="mr-2" size={20} />
              Import Documents
            </h2>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>Text files (.txt)</strong> - Plain text documents</p>
                <p>• <strong>Markdown files (.md)</strong> - Will split by headers if multiple sections</p>
                <p>• <strong>JSON files (.json)</strong> - Memory exports or structured data</p>
              </div>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          <ImportProgressDisplay progress={importProgress} result={importResult} />
        </div>

        {/* Export Section */}
        <div>
          <ExportSection memories={memories} />
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Current Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{memories.length}</div>
            <div className="text-sm text-gray-600">Total Memories</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {memories.filter(m => m.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).length}
            </div>
            <div className="text-sm text-gray-600">Added This Week</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(memories.flatMap(m => m.tags || [])).size}
            </div>
            <div className="text-sm text-gray-600">Unique Tags</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportExportPage