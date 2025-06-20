import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Tag, FolderOpen, MoreVertical, Edit, Trash2, Share } from 'lucide-react'
import { type Memory } from '@/types'
import { cn } from '@/lib/utils'

interface MemoryCardProps {
  memory: Memory
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
  className?: string
}

export const MemoryCard: FC<MemoryCardProps> = ({
  memory,
  onDelete,
  onShare,
  className,
}) => {
  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault()
    e.stopPropagation()
    action()
  }

  return (
    <article
      className={cn(
        "group relative p-6 rounded-lg border",
        "bg-card hover:shadow-md transition-all duration-200",
        "hover:border-primary/50",
        className
      )}
    >
      <Link to={`/memories/${memory.id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold line-clamp-2 flex-1 pr-2">
            {memory.title}
          </h3>
          
          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={(e) => e.preventDefault()}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
            >
              <MoreVertical size={18} className="text-muted-foreground" />
            </button>
            
            {/* Dropdown menu - would be implemented with a proper dropdown component */}
            <div className="hidden absolute right-0 top-full mt-1 w-48 rounded-lg border bg-background shadow-lg z-10">
              <div className="p-1">
                <Link
                  to={`/memories/${memory.id}/edit`}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Link>
                {onShare && (
                  <button
                    onClick={(e) => handleAction(e, () => onShare(memory.id))}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                  >
                    <Share size={16} />
                    <span>Share</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => handleAction(e, () => onDelete(memory.id))}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-destructive"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview content */}
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {memory.preview || memory.content.replace(/[#*`]/g, '').slice(0, 150)}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <time dateTime={memory.updatedAt ? memory.updatedAt.toISOString() : memory.updated_at}>
              {formatDate(memory.updatedAt || new Date(memory.updated_at))}
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
          {memory.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag size={14} />
              <div className="flex gap-1">
                {memory.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
                {memory.tags.length > 3 && (
                  <span className="px-2 py-0.5">
                    +{memory.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Entity indicators */}
        {memory.entities && memory.entities.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {memory.entities.length} {memory.entities.length === 1 ? 'entity' : 'entities'} extracted
            </span>
          </div>
        )}
      </Link>
    </article>
  )
}