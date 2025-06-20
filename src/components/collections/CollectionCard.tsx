import React from 'react'
import { Folder, MoreHorizontal, Edit, Trash2, Share } from 'lucide-react'
import type { Collection } from '../../types'

interface CollectionCardProps {
  collection: Collection
  onEdit?: (collection: Collection) => void
  onDelete?: (collection: Collection) => void
  onShare?: (collection: Collection) => void
  onSelect?: (collection: Collection) => void
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onEdit,
  onDelete,
  onShare,
  onSelect,
}) => {
  const [showMenu, setShowMenu] = React.useState(false)

  const handleCardClick = () => {
    onSelect?.(collection)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: collection.color || '#3B82F6',
              color: 'white'
            }}
          >
            {collection.icon ? (
              <span className="text-lg">{collection.icon}</span>
            ) : (
              <Folder className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {collection.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {collection.memoryCount} {collection.memoryCount === 1 ? 'memory' : 'memories'}
            </p>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(collection)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Collection
                    </button>
                  )}
                  {onShare && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onShare(collection)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Share className="w-4 h-4" />
                      Share Collection
                    </button>
                  )}
                  {onDelete && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(collection)
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Collection
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {collection.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {collection.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Created {formatDate(collection.created_at)}
        </span>
        {collection.isPublic && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
            Public
          </span>
        )}
      </div>
    </div>
  )
}