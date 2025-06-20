import React, { useState } from 'react'
import { X, Calendar, Tag, Folder, Sliders, RotateCcw } from 'lucide-react'
import { useSearchStore, useCollectionStore } from '../../stores'
import type { SearchFilters as SearchFiltersType } from '../../types'

interface SearchFiltersProps {
  onClose: () => void
  className?: string
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onClose,
  className = "",
}) => {
  const {
    searchType,
    filters,
    sortBy,
    sortOrder,
    setSearchType,
    setFilters,
    clearFilters,
    setSorting,
  } = useSearchStore()

  const { collections } = useCollectionStore()

  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters)

  const handleApply = () => {
    setFilters(localFilters)
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({})
    clearFilters()
    onClose()
  }

  const handleTagsChange = (tags: string[]) => {
    setLocalFilters(prev => ({ ...prev, tags }))
  }

  const handleCollectionsChange = (collections: string[]) => {
    setLocalFilters(prev => ({ ...prev, collections }))
  }

  const handleDateRangeChange = (dateRange: { start?: string; end?: string }) => {
    setLocalFilters(prev => ({ ...prev, dateRange }))
  }

  const addTag = (tag: string) => {
    const currentTags = localFilters.tags || []
    if (!currentTags.includes(tag)) {
      handleTagsChange([...currentTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    const currentTags = localFilters.tags || []
    handleTagsChange(currentTags.filter(t => t !== tag))
  }

  const toggleCollection = (collectionId: string) => {
    const currentCollections = localFilters.collections || []
    if (currentCollections.includes(collectionId)) {
      handleCollectionsChange(currentCollections.filter(c => c !== collectionId))
    } else {
      handleCollectionsChange([...currentCollections, collectionId])
    }
  }

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof SearchFiltersType]
    return Array.isArray(value) ? value.length > 0 : value != null
  })

  return (
    <div className={`
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
      rounded-lg shadow-lg p-4 min-w-80
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Search Filters
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search Type
        </label>
        <div className="flex gap-2">
          {[
            { value: 'hybrid', label: 'Hybrid', desc: 'Best results' },
            { value: 'vector', label: 'Semantic', desc: 'Meaning-based' },
            { value: 'fulltext', label: 'Exact', desc: 'Text matching' },
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setSearchType(type.value as any)}
              className={`
                flex-1 p-2 text-xs rounded-md border transition-colors
                ${searchType === type.value
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              <div className="font-medium">{type.label}</div>
              <div className="text-xs opacity-75">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Date Range
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={localFilters.dateRange?.start?.split('T')[0] || ''}
            onChange={(e) => handleDateRangeChange({
              ...localFilters.dateRange,
              start: e.target.value ? new Date(e.target.value).toISOString() : undefined
            })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Start date"
          />
          <input
            type="date"
            value={localFilters.dateRange?.end?.split('T')[0] || ''}
            onChange={(e) => handleDateRangeChange({
              ...localFilters.dateRange,
              end: e.target.value ? new Date(e.target.value).toISOString() : undefined
            })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="End date"
          />
        </div>
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Folder className="w-4 h-4 inline mr-1" />
            Collections
          </label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {collections.map(collection => (
              <label
                key={collection.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFilters.collections?.includes(collection.id) || false}
                  onChange={() => toggleCollection(collection.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {collection.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({collection.memoryCount})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          Tags
        </label>
        <div className="space-y-2">
          {/* Tag Input */}
          <input
            type="text"
            placeholder="Add tag..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const value = e.currentTarget.value.trim()
                if (value) {
                  addTag(value)
                  e.currentTarget.value = ''
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          {/* Selected Tags */}
          {localFilters.tags && localFilters.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {localFilters.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sort By
        </label>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSorting(e.target.value as any, sortOrder)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSorting(sortBy, e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}