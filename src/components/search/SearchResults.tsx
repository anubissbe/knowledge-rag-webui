import React from 'react'
import { Clock, Hash, Folder, Star, ExternalLink, MoreVertical } from 'lucide-react'
import { useSearchStore, useMemoryStore } from '../../stores'
import type { Memory } from '../../types'
import { MarkdownRenderer } from '../common/MarkdownRenderer'

interface SearchResultsProps {
  className?: string
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  className = "",
}) => {
  const {
    results,
    query,
    loading,
    error,
    loadMoreResults,
  } = useSearchStore()

  const { selectMemory } = useMemoryStore()

  if (loading && !results) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Search Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Ready to Search
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search query to find your memories
          </p>
        </div>
      </div>
    )
  }

  if (results.memories.length === 0) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No memories match your search for "{query}"
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Try:</p>
            <ul className="mt-2 space-y-1">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using broader search terms</li>
              <li>• Removing filters</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className={className}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Search Results
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {results.total.toLocaleString()} results for "{query}" 
            {results.searchTime && (
              <span> in {results.searchTime}ms</span>
            )}
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.memories.map((memory) => (
          <SearchResultCard
            key={memory.id}
            memory={memory}
            onSelect={selectMemory}
          />
        ))}
      </div>

      {/* Load More */}
      {results.hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMoreResults}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              'Load More Results'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

interface SearchResultCardProps {
  memory: Memory
  onSelect: (memory: Memory) => void
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  memory,
  onSelect,
}) => {
  const handleClick = () => {
    onSelect(memory)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPreviewText = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    const truncated = content.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
  }

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
          {memory.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            // Handle menu
          }}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Content Preview */}
      <div className="text-gray-600 dark:text-gray-400 mb-3">
        <MarkdownRenderer content={getPreviewText(memory.content)} />
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDate(memory.updated_at)}
        </div>
        
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Hash className="w-4 h-4" />
            <div className="flex gap-1">
              {memory.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {memory.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{memory.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {memory.collection && (
          <div className="flex items-center gap-1">
            <Folder className="w-4 h-4" />
            <span>{memory.collection}</span>
          </div>
        )}
      </div>
    </div>
  )
}