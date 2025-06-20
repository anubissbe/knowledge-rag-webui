import { type FC } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Share, 
  Calendar, 
  Tag, 
  FolderOpen,
  Network,
  Info
} from 'lucide-react'
import { type Memory } from '@/types'
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'

export const MemoryDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Mock data for now - will be replaced with API calls
  const { data: memory, isLoading } = useQuery({
    queryKey: ['memory', id],
    queryFn: async () => {
      // Mock implementation - will call api.getMemory(id)
      return {
        id: id!,
        title: 'Getting Started with React Hooks',
        content: `# React Hooks

React Hooks revolutionized how we write functional components by allowing us to use state and other React features without writing a class.

## What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They don't work inside classes — they let you use React without classes.

## Basic Hooks

### useState

The State Hook lets you add React state to function components:

\`\`\`javascript
import React, { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect

The Effect Hook lets you perform side effects in function components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Rules of Hooks

1. **Only Call Hooks at the Top Level** - Don't call Hooks inside loops, conditions, or nested functions.
2. **Only Call Hooks from React Functions** - Don't call Hooks from regular JavaScript functions.`,
        tags: ['react', 'javascript', 'hooks', 'frontend'],
        collection: 'Web Development',
        entities: [
          { 
            id: 'e1', 
            name: 'React', 
            type: 'Technology', 
            properties: { version: '18+' },
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
          { 
            id: 'e3', 
            name: 'useState', 
            type: 'Hook', 
            properties: {},
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          },
          { 
            id: 'e4', 
            name: 'useEffect', 
            type: 'Hook', 
            properties: {},
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          },
        ],
        metadata: { 
          source: 'manual', 
          category: 'tutorial',
          difficulty: 'beginner',
          readTime: '5 min'
        },
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      } as Memory
    },
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Mock implementation - will call api.deleteMemory(id)
      console.log('Deleting memory:', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      navigate('/memories')
    },
  })

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this memory?')) {
      deleteMutation.mutate()
    }
  }

  const handleShare = () => {
    // Mock implementation
    console.log('Sharing memory:', id)
  }

  if (isLoading || !memory) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading memory...</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/memories"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Memories</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Share memory"
          >
            <Share size={20} />
          </button>
          <Link
            to={`/memories/${id}/edit`}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Edit memory"
          >
            <Edit size={20} />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-destructive"
            aria-label="Delete memory"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Title and metadata */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{memory.title}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <time dateTime={memory.updated_at}>
              {formatDate(new Date(memory.updated_at))}
            </time>
          </div>

          {memory.collection && (
            <div className="flex items-center gap-2">
              <FolderOpen size={16} />
              <span>{memory.collection}</span>
            </div>
          )}

          {memory.metadata.readTime && (
            <div className="flex items-center gap-2">
              <Info size={16} />
              <span>{memory.metadata.readTime} read</span>
            </div>
          )}
        </div>

        {memory.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Tag size={16} className="text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <MarkdownRenderer content={memory.content} className="mb-12" />

      {/* Entities */}
      {memory.entities && memory.entities.length > 0 && (
        <section className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Network size={20} />
            Extracted Entities
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {memory.entities.map((entity) => (
              <div
                key={entity.id}
                className="p-4 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{entity.name}</h3>
                    <p className="text-sm text-muted-foreground">{entity.type}</p>
                  </div>
                  {entity.properties && Object.keys(entity.properties).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {Object.entries(entity.properties).map(([key, value]) => (
                        <div key={key}>
                          {key}: {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Metadata */}
      {Object.keys(memory.metadata).length > 0 && (
        <section className="border-t pt-8 mt-8">
          <h2 className="text-xl font-semibold mb-4">Metadata</h2>
          <div className="space-y-2">
            {Object.entries(memory.metadata).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded bg-muted/50">
                <span className="font-medium text-sm">{key}</span>
                <span className="text-sm text-muted-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}