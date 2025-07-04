import { type FC, useState } from 'react'
import { Plus, Brain, LayoutGrid, List } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MemoryList } from '@/components/memory/MemoryList'
import { BulkOperationsToolbar } from '@/components/memory/BulkOperationsToolbar'
import { type Memory } from '@/types'
import { cn } from '@/lib/utils'
import { useBulkOperationsStore } from '@/stores/bulkOperationsStore'
import { useUIStore } from '@/stores/uiStore'

export const MemoriesPage: FC = () => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [selectedCollection, setSelectedCollection] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'relevant'>('recent')
  const queryClient = useQueryClient()
  const { addNotification } = useUIStore()
  const { clearSelection } = useBulkOperationsStore()

  // Mock data for now - will be replaced with API calls
  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories', selectedCollection, sortBy],
    queryFn: async () => {
      // Mock implementation - will call api.getMemories()
      const mockMemories: Memory[] = [
        {
          id: '1',
          title: 'Getting Started with React Hooks',
          content: '# React Hooks\n\nReact Hooks revolutionized how we write functional components...',
          preview: 'React Hooks revolutionized how we write functional components by allowing us to use state and other React features without writing a class.',
          tags: ['react', 'javascript', 'hooks'],
          collection: 'Web Development',
          entities: [
            { 
              id: 'e1', 
              name: 'React', 
              type: 'Technology', 
              properties: {},
              created_at: '2024-01-15T00:00:00Z',
              updated_at: '2024-01-15T00:00:00Z'
            },
            { 
              id: 'e2', 
              name: 'JavaScript', 
              type: 'Language', 
              properties: {},
              created_at: '2024-01-15T00:00:00Z',
              updated_at: '2024-01-15T00:00:00Z'
            },
          ],
          metadata: { source: 'manual', category: 'tutorial' },
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        },
        {
          id: '2',
          title: 'Understanding TypeScript Generics',
          content: '# TypeScript Generics\n\nGenerics provide a way to make components work with any data type...',
          preview: 'Generics provide a way to make components work with any data type while still maintaining type safety.',
          tags: ['typescript', 'programming', 'generics'],
          collection: 'Programming',
          entities: [
            { 
              id: 'e3', 
              name: 'TypeScript', 
              type: 'Language', 
              properties: {},
              created_at: '2024-01-10T00:00:00Z',
              updated_at: '2024-01-10T00:00:00Z'
            },
          ],
          metadata: { source: 'web', url: 'https://example.com' },
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-12T00:00:00Z',
        },
        {
          id: '3',
          title: 'Machine Learning Fundamentals',
          content: '# Machine Learning Basics\n\nMachine learning is a subset of artificial intelligence...',
          preview: 'Machine learning is a subset of artificial intelligence that focuses on building systems that learn from data.',
          tags: ['ml', 'ai', 'data-science'],
          collection: 'AI & ML',
          entities: [],
          metadata: { source: 'manual', difficulty: 'beginner' },
          created_at: '2024-01-05T00:00:00Z',
          updated_at: '2024-01-05T00:00:00Z',
        },
      ]
      
      // Apply filters and sorting
      let filtered = mockMemories
      if (selectedCollection !== 'all') {
        filtered = filtered.filter(m => m.collection === selectedCollection)
      }
      
      // Sort
      if (sortBy === 'recent') {
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      }
      
      return filtered
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation - will call api.deleteMemory(id)
      console.log('Deleting memory:', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleShare = (id: string) => {
    // Mock implementation
    console.log('Sharing memory:', id)
  }

  // Bulk operation handlers
  const handleBulkDelete = async (ids: string[]) => {
    // Mock implementation - will call api.bulkDeleteMemories(ids)
    console.log('Bulk deleting memories:', ids)
    queryClient.invalidateQueries({ queryKey: ['memories'] })
  }

  const handleBulkTag = async (ids: string[], tags: string[]) => {
    // Mock implementation - will call api.bulkAddTags(ids, tags)
    console.log('Bulk tagging memories:', ids, tags)
    queryClient.invalidateQueries({ queryKey: ['memories'] })
  }

  const handleBulkMove = async (ids: string[], collectionId: string) => {
    // Mock implementation - will call api.bulkMoveToCollection(ids, collectionId)
    console.log('Bulk moving memories:', ids, 'to collection:', collectionId)
    queryClient.invalidateQueries({ queryKey: ['memories'] })
  }

  const handleBulkExport = async (ids: string[], format: 'json' | 'csv' | 'markdown') => {
    // Mock implementation - will call api.exportMemories(ids, format)
    console.log('Bulk exporting memories:', ids, 'as', format)
    
    // Simulate export
    const exportData = memories?.filter(m => ids.includes(m.id)) || []
    let content = ''
    let filename = `memories-export-${new Date().toISOString().split('T')[0]}`
    let mimeType = ''

    switch (format) {
      case 'json':
        content = JSON.stringify(exportData, null, 2)
        filename += '.json'
        mimeType = 'application/json'
        break
      case 'csv':
        // Simple CSV export
        const headers = ['Title', 'Content', 'Tags', 'Collection', 'Created', 'Updated']
        const rows = exportData.map(m => [
          m.title,
          m.content.replace(/[\n\r,]/g, ' '),
          m.tags.join(';'),
          m.collection || '',
          m.created_at,
          m.updated_at
        ])
        content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
        filename += '.csv'
        mimeType = 'text/csv'
        break
      case 'markdown':
        content = exportData.map(m => `# ${m.title}\n\n${m.content}\n\n**Tags:** ${m.tags.join(', ')}\n**Collection:** ${m.collection || 'None'}\n**Created:** ${m.created_at}\n\n---\n`).join('\n')
        filename += '.md'
        mimeType = 'text/markdown'
        break
    }

    // Create download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Memories</h1>
          <p className="text-muted-foreground">
            All your thoughts and knowledge in one place
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Layout toggle */}
          <div className="flex rounded-lg border p-1">
            <button
              onClick={() => setLayout('grid')}
              className={cn(
                "p-1.5 rounded transition-colors",
                layout === 'grid' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={cn(
                "p-1.5 rounded transition-colors",
                layout === 'list' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>

          <Link
            to="/memories/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            <span>New Memory</span>
          </Link>
        </div>
      </div>

      {/* Bulk Operations Toolbar */}
      <BulkOperationsToolbar
        totalItems={memories?.length || 0}
        onBulkDelete={handleBulkDelete}
        onBulkTag={handleBulkTag}
        onBulkMove={handleBulkMove}
        onBulkExport={handleBulkExport}
      />

      {/* Filters */}
      <div className="flex gap-4 mb-6 mt-4">
        <select 
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Collections</option>
          <option value="Web Development">Web Development</option>
          <option value="Programming">Programming</option>
          <option value="AI & ML">AI & ML</option>
        </select>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'relevant')}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="recent">Recent First</option>
          <option value="oldest">Oldest First</option>
          <option value="relevant">Most Relevant</option>
        </select>
      </div>

      {/* Memory list or empty state */}
      {!isLoading && memories?.length === 0 ? (
        <div className="rounded-lg border bg-muted/50 p-12 text-center">
          <Brain className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your knowledge base by creating your first memory
          </p>
          <Link
            to="/memories/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            <span>Create Your First Memory</span>
          </Link>
        </div>
      ) : (
        <MemoryList
          memories={memories || []}
          onDelete={handleDelete}
          onShare={handleShare}
          isLoading={isLoading}
          layout={layout}
        />
      )}
    </div>
  )
}