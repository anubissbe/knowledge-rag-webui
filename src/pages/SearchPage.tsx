import React, { useEffect } from 'react'
import { SearchBar, SearchResults } from '../components/search'
import { useSearchStore } from '../stores'

export const SearchPage: React.FC = () => {
  const { query, clearResults } = useSearchStore()

  useEffect(() => {
    // Clear results when component mounts if no query
    if (!query) {
      clearResults()
    }
  }, [query, clearResults])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Search Memories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find the information you need using our advanced search capabilities
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            placeholder="Search through your memories..."
            showFilters={true}
            showSettings={true}
            autoFocus={true}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Search Results */}
        <SearchResults />
      </div>
    </div>
  )
}