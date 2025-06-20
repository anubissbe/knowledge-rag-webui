import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { GraphVisualization, GraphControls, GraphSidebar } from '../components/graph'
import { useGraphStore, useMemoryStore } from '../stores'

export const GraphPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [showSidebar, setShowSidebar] = useState(false)
  
  const {
    graphData,
    loading,
    error,
    selectedNode,
    selectedEdge,
    fetchGraphData,
    transformMemoriesToGraph,
    setError,
  } = useGraphStore()

  const { memories, fetchMemories } = useMemoryStore()

  // Get params from URL
  const entityId = searchParams.get('entity') || undefined
  const memoryId = searchParams.get('memory') || undefined
  const depth = Number(searchParams.get('depth')) || 3

  useEffect(() => {
    // Fetch data based on params
    if (entityId || memoryId) {
      fetchGraphData({ entityId, memoryId, depth })
    } else {
      // Load memories and transform to graph
      loadMemoriesAsGraph()
    }
  }, [entityId, memoryId, depth])

  useEffect(() => {
    // Show sidebar when node or edge is selected
    if (selectedNode || selectedEdge) {
      setShowSidebar(true)
    }
  }, [selectedNode, selectedEdge])

  const loadMemoriesAsGraph = async () => {
    try {
      await fetchMemories()
      // In a real app, we'd also fetch entities
      // For now, we'll create mock entities from memories
      const mockEntities = memories.flatMap(memory => 
        (memory.entities || []).map(entity => ({
          ...entity,
          frequency: 1,
          memoryIds: [memory.id]
        }))
      )
      
      const graphData = transformMemoriesToGraph(memories, mockEntities)
      useGraphStore.setState({ graphData })
    } catch (err) {
      setError('Failed to load graph data')
    }
  }

  const handleRefresh = () => {
    if (entityId || memoryId) {
      fetchGraphData({ entityId: entityId || undefined, memoryId: memoryId || undefined, depth })
    } else {
      loadMemoriesAsGraph()
    }
  }

  const handleZoomIn = () => {
    // This would be implemented with D3 zoom controls
    console.log('Zoom in')
  }

  const handleZoomOut = () => {
    // This would be implemented with D3 zoom controls
    console.log('Zoom out')
  }

  const handleResetView = () => {
    // This would be implemented with D3 zoom controls
    console.log('Reset view')
  }

  const handleExport = () => {
    if (!graphData) return
    
    // Export graph data as JSON
    const dataStr = JSON.stringify(graphData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `knowledge-graph-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading knowledge graph...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to load graph
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Main Graph Visualization */}
      <GraphVisualization 
        className="w-full h-full"
      />

      {/* Controls */}
      <GraphControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onExport={handleExport}
      />

      {/* Sidebar */}
      {showSidebar && (
        <GraphSidebar
          onClose={() => setShowSidebar(false)}
        />
      )}

      {/* Graph Stats */}
      {graphData && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {graphData.nodes.length}
              </span> nodes
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {graphData.edges.length}
              </span> edges
            </div>
            {graphData.metadata?.depth && (
              <div className="text-gray-600 dark:text-gray-400">
                Depth: <span className="font-medium text-gray-900 dark:text-gray-100">
                  {graphData.metadata.depth}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!graphData && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No data to display. Add some memories to see the knowledge graph.
          </p>
        </div>
      )}
    </div>
  )
}