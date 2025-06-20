import React from 'react'
import { X, ExternalLink, Hash, Calendar, FileText, Folder, Brain } from 'lucide-react'
import { useGraphStore } from '../../stores'

interface GraphSidebarProps {
  className?: string
  onClose?: () => void
}

export const GraphSidebar: React.FC<GraphSidebarProps> = ({
  className = '',
  onClose,
}) => {
  const { selectedNode, selectedEdge, selectNode, selectEdge } = useGraphStore()

  if (!selectedNode && !selectedEdge) {
    return null
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return <FileText className="w-5 h-5" />
      case 'entity':
        return <Brain className="w-5 h-5" />
      case 'collection':
        return <Folder className="w-5 h-5" />
      default:
        return <Hash className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`absolute top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl ${className}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedNode ? 'Node Details' : 'Edge Details'}
          </h2>
          <button
            onClick={() => {
              selectNode(null)
              selectEdge(null)
              onClose?.()
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedNode && (
            <div className="space-y-4">
              {/* Node Type & Label */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    selectedNode.type === 'memory' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    selectedNode.type === 'entity' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {getNodeIcon(selectedNode.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedNode.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {selectedNode.type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Node ID */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {selectedNode.id}
                </p>
              </div>

              {/* Properties */}
              {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Properties
                  </label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedNode.properties).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {key}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory-specific details */}
              {selectedNode.type === 'memory' && selectedNode.properties && (
                <div className="space-y-3">
                  {selectedNode.properties.preview && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Preview
                      </label>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {selectedNode.properties.preview as string}
                      </p>
                    </div>
                  )}
                  
                  {selectedNode.properties.tags && Array.isArray(selectedNode.properties.tags) && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tags
                      </label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(selectedNode.properties.tags as string[]).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.properties.created_at && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        Created
                      </label>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(selectedNode.properties.created_at as string)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          )}

          {selectedEdge && (
            <div className="space-y-4">
              {/* Edge Type */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Relationship Type
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">
                  {selectedEdge.type.replace('_', ' ')}
                </p>
              </div>

              {/* Edge ID */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {selectedEdge.id}
                </p>
              </div>

              {/* Source & Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedEdge.source}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Target
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedEdge.target}
                  </p>
                </div>
              </div>

              {/* Weight */}
              {selectedEdge.weight !== undefined && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Weight
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedEdge.weight}
                  </p>
                </div>
              )}

              {/* Properties */}
              {selectedEdge.properties && Object.keys(selectedEdge.properties).length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Properties
                  </label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedEdge.properties).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {key}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}