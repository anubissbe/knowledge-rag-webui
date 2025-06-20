import { type FC } from 'react'
import { MemoryCard } from './MemoryCard'
import { type Memory } from '@/types'
import { cn } from '@/lib/utils'

interface MemoryListProps {
  memories: Memory[]
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
  isLoading?: boolean
  className?: string
  layout?: 'grid' | 'list'
}

export const MemoryList: FC<MemoryListProps> = ({
  memories,
  onDelete,
  onShare,
  isLoading = false,
  className,
  layout = 'grid',
}) => {
  if (isLoading) {
    return (
      <div className={cn(
        layout === 'grid' 
          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4",
        className
      )}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-lg border bg-card animate-pulse"
          >
            <div className="h-6 bg-muted rounded mb-3 w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="h-3 bg-muted rounded w-16"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (memories.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        layout === 'grid' 
          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4",
        className
      )}
    >
      {memories.map((memory) => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          onDelete={onDelete}
          onShare={onShare}
        />
      ))}
    </div>
  )
}