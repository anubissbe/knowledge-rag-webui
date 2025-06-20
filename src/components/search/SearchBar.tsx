import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Filter, Settings, Sparkles } from 'lucide-react'
import { useSearchStore } from '../../stores'
import { SearchSuggestions } from './SearchSuggestions'
import { SearchFilters } from './SearchFilters'

interface SearchBarProps {
  placeholder?: string
  className?: string
  showFilters?: boolean
  showSettings?: boolean
  autoFocus?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search memories...",
  className = "",
  showFilters = true,
  showSettings = true,
  autoFocus = false,
}) => {
  const {
    query,
    suggestions,
    searchType,
    filters,
    loading,
    recentSearches,
    setQuery,
    getSuggestions,
    clearSuggestions,
    searchWithQuery,
  } = useSearchStore()

  const [inputValue, setInputValue] = useState(query)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [focused, setFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Sync with store
  useEffect(() => {
    setInputValue(query)
  }, [query])

  // Get suggestions when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length >= 2) {
        getSuggestions(inputValue)
      } else {
        clearSuggestions()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, getSuggestions, clearSuggestions])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowFiltersPanel(false)
        setFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setQuery(value)
    setShowSuggestions(true)
  }

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || inputValue
    if (!queryToSearch.trim()) return

    setShowSuggestions(false)
    await searchWithQuery(queryToSearch)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setShowFiltersPanel(false)
      inputRef.current?.blur()
    }
  }

  const handleFocus = () => {
    setFocused(true)
    if (inputValue.length >= 2 || recentSearches.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleClear = () => {
    setInputValue('')
    setQuery('')
    clearSuggestions()
    inputRef.current?.focus()
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion)
    setQuery(suggestion)
    setShowSuggestions(false)
    handleSearch(suggestion)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof typeof filters]
    return Array.isArray(value) ? value.length > 0 : value != null
  })

  const getSearchTypeIcon = () => {
    switch (searchType) {
      case 'vector':
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'fulltext':
        return <Search className="w-4 h-4 text-blue-500" />
      default:
        return <Search className="w-4 h-4 text-green-500" />
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div
        className={`
          relative flex items-center bg-white dark:bg-gray-800 border rounded-lg
          transition-all duration-200 ease-in-out
          ${focused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600'}
          ${loading ? 'opacity-50' : ''}
        `}
      >
        {/* Search Type Indicator */}
        <div className="pl-3 pr-2">
          {getSearchTypeIcon()}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={loading}
          data-testid="search-input"
          className={`
            flex-1 py-3 px-1 bg-transparent border-none outline-none
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            disabled:cursor-not-allowed
          `}
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            onClick={handleClear}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Filter Button */}
        {showFilters && (
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            disabled={loading}
            className={`
              p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors
              ${hasActiveFilters ? 'text-blue-500' : ''}
            `}
          >
            <Filter className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
        )}

        {/* Settings Button */}
        {showSettings && (
          <button
            onClick={() => {/* Handle settings */}}
            disabled={loading}
            className="p-2 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          disabled={loading || !inputValue.trim()}
          className={`
            px-4 py-2 mr-2 rounded-md transition-colors
            ${inputValue.trim() 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
            }
          `}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <SearchSuggestions
          suggestions={suggestions}
          recentSearches={recentSearches}
          onSelect={handleSuggestionSelect}
          className="absolute top-full left-0 right-0 z-50 mt-1"
        />
      )}

      {/* Filters Panel */}
      {showFiltersPanel && (
        <SearchFilters
          onClose={() => setShowFiltersPanel(false)}
          className="absolute top-full left-0 right-0 z-40 mt-1"
        />
      )}
    </div>
  )
}