import { memo, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Tag, FolderOpen, MoreVertical, Edit, Trash2, Share } from 'lucide-react'
import { type Memory } from '@/types'
import { cn } from '@/lib/utils'
import { useStableCallback } from '@/hooks/usePerformance'

interface MemoryCardProps {
  memory: Memory
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
  className?: string
}

// Memoized date formatter to avoid recreating on every render
const formatDate = (date: Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}

// Memoized tag component
const MemoryTag = memo<{ tag: string }>(({ tag }) => (
  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
    {tag}
  </span>
))

MemoryTag.displayName = 'MemoryTag'

// Memoized tags list component
const TagsList = memo<{ tags: string[] }>(({ tags }) => {
  const visibleTags = useMemo(() => tags.slice(0, 3), [tags])
  const extraCount = useMemo(() => Math.max(0, tags.length - 3), [tags.length])

  if (tags.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      <Tag size={14} />
      <div className="flex gap-1">
        {visibleTags.map((tag) => (
          <MemoryTag key={tag} tag={tag} />
        ))}
        {extraCount > 0 && (
          <span className="px-2 py-0.5">
            +{extraCount}
          </span>
        )}
      </div>
    </div>
  )
})

TagsList.displayName = 'TagsList'

// Memoized content preview component
const ContentPreview = memo<{ content: string; preview?: string }>(({ content, preview }) => {
  const processedPreview = useMemo(() => {
    return preview || content.replace(/[#*`]/g, '').slice(0, 150)
  }, [content, preview])

  return (
    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
      {processedPreview}
    </p>
  )
})

ContentPreview.displayName = 'ContentPreview'

// Memoized actions dropdown
const ActionsDropdown = memo<{
  memoryId: string
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
}>(({ memoryId, onDelete, onShare }) => {
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDelete = useStableCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(memoryId)
  }, [onDelete, memoryId])

  const handleShare = useStableCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onShare?.(memoryId)
  }, [onShare, memoryId])

  return (
    <div className="relative">
      <button
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
        aria-label="More actions"
      >
        <MoreVertical size={18} className="text-muted-foreground" />
      </button>
      
      <div className="hidden absolute right-0 top-full mt-1 w-48 rounded-lg border bg-background shadow-lg z-10">
        <div className="p-1">
          <Link
            to={`/memories/${memoryId}/edit`}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
            onClick={handleEdit}
          >
            <Edit size={16} />
            <span>Edit</span>
          </Link>
          {onShare && (
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
            >
              <Share size={16} />
              <span>Share</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-destructive"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

ActionsDropdown.displayName = 'ActionsDropdown'

// Main component with memoization
export const OptimizedMemoryCard = memo<MemoryCardProps>(({
  memory,
  onDelete,
  onShare,
  className,
}) => {
  // Memoize expensive computations
  const formattedDate = useMemo(() => {
    const date = memory.updatedAt || new Date(memory.updated_at)
    return formatDate(date)
  }, [memory.updatedAt, memory.updated_at])

  const dateTimeString = useMemo(() => {
    return memory.updatedAt ? memory.updatedAt.toISOString() : memory.updated_at
  }, [memory.updatedAt, memory.updated_at])

  const cardClassName = useMemo(() => cn(
    "group relative p-6 rounded-lg border",
    "bg-card hover:shadow-md transition-all duration-200",
    "hover:border-primary/50",
    className
  ), [className])

  const entityText = useMemo(() => {
    if (!memory.entities || memory.entities.length === 0) return null
    const count = memory.entities.length
    return `${count} ${count === 1 ? 'entity' : 'entities'} extracted`
  }, [memory.entities])

  return (
    <article className={cardClassName}>
      <Link to={`/memories/${memory.id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold line-clamp-2 flex-1 pr-2">
            {memory.title}
          </h3>
          
          <ActionsDropdown
            memoryId={memory.id}
            onDelete={onDelete}
            onShare={onShare}
          />
        </div>

        {/* Preview content */}
        <ContentPreview content={memory.content} preview={memory.preview} />

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <time dateTime={dateTimeString}>
              {formattedDate}
            </time>
          </div>

          {/* Collection */}
          {memory.collection && (
            <div className="flex items-center gap-1">
              <FolderOpen size={14} />
              <span>{memory.collection}</span>
            </div>
          )}

          {/* Tags */}
          <TagsList tags={memory.tags} />
        </div>

        {/* Entity indicators */}
        {entityText && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {entityText}
            </span>
          </div>
        )}
      </Link>
    </article>
  )
})

OptimizedMemoryCard.displayName = 'OptimizedMemoryCard'

// Export with performance monitoring wrapper
export const MemoryCard = process.env.NODE_ENV === 'development' 
  ? OptimizedMemoryCard 
  : OptimizedMemoryCard