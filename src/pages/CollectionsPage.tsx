import React, { useState, useEffect } from 'react'
import { Plus, Search, Grid, List, SortAsc, SortDesc } from 'lucide-react'
import { CollectionCard, CollectionForm } from '../components/collections'
import { useCollectionStore } from '../stores'
import type { Collection, CreateCollectionDto } from '../types'

type ViewMode = 'grid' | 'list'
type SortField = 'name' | 'created_at' | 'memoryCount'
type SortOrder = 'asc' | 'desc'

export const CollectionsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const {
    collections,
    loading,
    error,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
  } = useCollectionStore()

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const handleCreateCollection = async (data: CreateCollectionDto) => {
    try {
      await createCollection(data)
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create collection:', error)
    }
  }

  const handleUpdateCollection = async (data: CreateCollectionDto) => {
    if (!editingCollection) return
    
    try {
      await updateCollection(editingCollection.id, data)
      setEditingCollection(null)
    } catch (error) {
      console.error('Failed to update collection:', error)
    }
  }

  const handleDeleteCollection = async (collection: Collection) => {
    if (window.confirm(`Are you sure you want to delete "${collection.name}"? This will remove the collection but keep the memories.`)) {
      try {
        await deleteCollection(collection.id)
      } catch (error) {
        console.error('Failed to delete collection:', error)
      }
    }
  }

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection)
  }

  const handleSelectCollection = (collection: Collection) => {
    // Navigate to collection detail view or memories filtered by collection
    // For now, we'll just log it
    console.log('Selected collection:', collection)
  }

  const handleShareCollection = (collection: Collection) => {
    // Implement sharing functionality
    navigator.clipboard.writeText(`Check out my "${collection.name}" collection!`)
    // You could show a toast notification here
  }

  // Filter and sort collections
  const filteredAndSortedCollections = collections
    .filter(collection =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'memoryCount':
          aValue = a.memoryCount
          bValue = b.memoryCount
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  if (loading && collections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Collections
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organize your memories into collections
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Collection
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Options */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => handleSortChange('name')}
                className={`px-3 py-1 text-sm rounded ${
                  sortField === 'name'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Name {sortField === 'name' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3" /> : <SortDesc className="inline w-3 h-3" />)}
              </button>
              <button
                onClick={() => handleSortChange('created_at')}
                className={`px-3 py-1 text-sm rounded ${
                  sortField === 'created_at'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Date {sortField === 'created_at' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3" /> : <SortDesc className="inline w-3 h-3" />)}
              </button>
              <button
                onClick={() => handleSortChange('memoryCount')}
                className={`px-3 py-1 text-sm rounded ${
                  sortField === 'memoryCount'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Size {sortField === 'memoryCount' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3" /> : <SortDesc className="inline w-3 h-3" />)}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Collections Grid/List */}
        {filteredAndSortedCollections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? 'No collections found' : 'No collections yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first collection to organize your memories'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Collection
              </button>
            )}
          </div>
        ) : (
          <div 
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredAndSortedCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={handleEditCollection}
                onDelete={handleDeleteCollection}
                onShare={handleShareCollection}
                onSelect={handleSelectCollection}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Collection Modal */}
        {(showCreateForm || editingCollection) && (
          <CollectionForm
            collection={editingCollection || undefined}
            onSubmit={editingCollection ? handleUpdateCollection : handleCreateCollection}
            onCancel={() => {
              setShowCreateForm(false)
              setEditingCollection(null)
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}