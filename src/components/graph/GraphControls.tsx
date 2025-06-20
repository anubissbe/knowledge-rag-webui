import React from 'react'
import { 
  Settings, 
  Eye, 
  EyeOff, 
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Download,
  GitBranch,
  Circle,
  Hexagon,
  Triangle
} from 'lucide-react'
import { useGraphStore } from '../../stores'

interface GraphControlsProps {
  className?: string
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetView?: () => void
  onExport?: () => void
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  className = '',
  onZoomIn,
  onZoomOut,
  onResetView,
  onExport,
}) => {
  const {
    layoutType,
    nodeColorBy,
    edgeThickness,
    showLabels,
    showEdgeLabels,
    nodeTypeFilter,
    edgeTypeFilter,
    minNodeDegree,
    maxDepth,
    setLayoutType,
    setNodeColorBy,
    setEdgeThickness,
    toggleLabels,
    toggleEdgeLabels,
    toggleNodeTypeFilter,
    toggleEdgeTypeFilter,
    setMinNodeDegree,
    setMaxDepth,
    resetFilters,
  } = useGraphStore()

  const [showSettings, setShowSettings] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)

  const layoutIcons = {
    force: <GitBranch className="w-4 h-4" />,
    radial: <Circle className="w-4 h-4" />,
    tree: <Triangle className="w-4 h-4" />,
    cluster: <Hexagon className="w-4 h-4" />,
  }

  return (
    <div className={`absolute top-4 right-4 flex flex-col gap-2 ${className}`}>
      {/* Main Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-1">
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={onResetView}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
        <button
          onClick={() => toggleLabels()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title={showLabels ? "Hide Labels" : "Show Labels"}
        >
          {showLabels ? (
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ${
            showSettings ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ${
            showFilters ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
          title="Filters"
        >
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        {onExport && (
          <>
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            <button
              onClick={onExport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Export Graph"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Graph Settings
          </h3>
          
          {/* Layout Type */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Layout
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(['force', 'radial', 'tree', 'cluster'] as const).map((layout) => (
                <button
                  key={layout}
                  onClick={() => setLayoutType(layout)}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
                    layoutType === layout
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {layoutIcons[layout]}
                  <span className="capitalize">{layout}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Node Color */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Node Color By
            </label>
            <select
              value={nodeColorBy}
              onChange={(e) => setNodeColorBy(e.target.value as any)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="type">Type</option>
              <option value="cluster">Cluster</option>
              <option value="degree">Degree</option>
            </select>
          </div>

          {/* Edge Thickness */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Edge Thickness
            </label>
            <select
              value={edgeThickness}
              onChange={(e) => setEdgeThickness(e.target.value as any)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="uniform">Uniform</option>
              <option value="weight">By Weight</option>
              <option value="type">By Type</option>
            </select>
          </div>

          {/* Show Edge Labels */}
          <div className="flex items-center gap-2">
            <input
              id="edge-labels"
              type="checkbox"
              checked={showEdgeLabels}
              onChange={() => toggleEdgeLabels()}
              className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="edge-labels" className="text-xs text-gray-700 dark:text-gray-300">
              Show Edge Labels
            </label>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Filters
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Node Type Filter */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Hide Node Types
            </label>
            <div className="space-y-1">
              {['memory', 'entity', 'collection'].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={nodeTypeFilter.has(type)}
                    onChange={() => toggleNodeTypeFilter(type)}
                    className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Edge Type Filter */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Hide Edge Types
            </label>
            <div className="space-y-1">
              {['contains', 'belongs_to', 'related'].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={edgeTypeFilter.has(type)}
                    onChange={() => toggleEdgeTypeFilter(type)}
                    className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Min Node Degree */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Min Connections: {minNodeDegree}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={minNodeDegree}
              onChange={(e) => setMinNodeDegree(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Max Depth */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Max Depth: {maxDepth}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  )
}