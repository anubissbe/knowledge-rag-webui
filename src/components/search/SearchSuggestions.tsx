import React from 'react'
import { Clock, Search, Sparkles, Hash, Folder, TrendingUp } from 'lucide-react'

interface SearchSuggestionsProps {
  suggestions: string[]
  recentSearches: Array<{
    query: string
    timestamp: string
    resultsCount: number
  }>
  onSelect: (suggestion: string) => void
  className?: string
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  recentSearches,
  onSelect,
  className = "",
}) => {
  const hasContent = suggestions.length > 0 || recentSearches.length > 0

  if (!hasContent) return null

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return `${Math.floor(diffInDays / 7)}w ago`
  }

  const getSuggestionIcon = (suggestion: string) => {
    if (suggestion.startsWith('#')) return <Hash className="w-4 h-4 text-blue-500" />
    if (suggestion.includes('/')) return <Folder className="w-4 h-4 text-orange-500" />
    return <Search className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className={`
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
      rounded-lg shadow-lg max-h-96 overflow-y-auto
      ${className}
    `}>
      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <Sparkles className="w-3 h-3" />
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {getSuggestionIcon(suggestion)}
              <span className="flex-1 text-gray-900 dark:text-gray-100">
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Separator */}
      {suggestions.length > 0 && recentSearches.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700" />
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <Clock className="w-3 h-3" />
            Recent Searches
          </div>
          {recentSearches.slice(0, 5).map((search, index) => (
            <button
              key={index}
              onClick={() => onSelect(search.query)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 dark:text-gray-100 truncate">
                  {search.query}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTimeAgo(search.timestamp)}</span>
                  <span>•</span>
                  <span>{search.resultsCount} results</span>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
          <span className="font-medium">Pro tip:</span> Use quotes for exact phrases, # for tags
        </div>
      </div>
    </div>
  )
}