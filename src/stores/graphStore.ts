import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { GraphData, GraphNode, GraphEdge, Entity, Memory } from '../types'
import { mcpAdapter } from '../services/api/mcp-adapter'

interface GraphState {
  // State
  graphData: GraphData | null
  selectedNode: GraphNode | null
  selectedEdge: GraphEdge | null
  hoveredNode: GraphNode | null
  highlightedNodes: Set<string>
  highlightedEdges: Set<string>
  
  // View options
  layoutType: 'force' | 'radial' | 'tree' | 'cluster'
  nodeColorBy: 'type' | 'cluster' | 'degree'
  edgeThickness: 'uniform' | 'weight' | 'type'
  showLabels: boolean
  showEdgeLabels: boolean
  
  // Filters
  nodeTypeFilter: Set<string>
  edgeTypeFilter: Set<string>
  minNodeDegree: number
  maxDepth: number
  
  // Loading and error states
  loading: boolean
  error: string | null
  
  // Actions
  fetchGraphData: (params?: { entityId?: string; memoryId?: string; depth?: number }) => Promise<void>
  fetchEntityRelationships: (entityId: string) => Promise<void>
  
  // Selection actions
  selectNode: (node: GraphNode | null) => void
  selectEdge: (edge: GraphEdge | null) => void
  hoverNode: (node: GraphNode | null) => void
  
  // Highlight actions
  highlightPath: (sourceId: string, targetId: string) => void
  highlightNeighbors: (nodeId: string) => void
  clearHighlights: () => void
  
  // View actions
  setLayoutType: (layout: GraphState['layoutType']) => void
  setNodeColorBy: (colorBy: GraphState['nodeColorBy']) => void
  setEdgeThickness: (thickness: GraphState['edgeThickness']) => void
  toggleLabels: () => void
  toggleEdgeLabels: () => void
  
  // Filter actions
  toggleNodeTypeFilter: (type: string) => void
  toggleEdgeTypeFilter: (type: string) => void
  setMinNodeDegree: (degree: number) => void
  setMaxDepth: (depth: number) => void
  resetFilters: () => void
  
  // Utility actions
  transformMemoriesToGraph: (memories: Memory[], entities: Entity[]) => GraphData
  calculateNodePositions: (data: GraphData, layoutType: GraphState['layoutType']) => GraphData
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  graphData: null,
  selectedNode: null,
  selectedEdge: null,
  hoveredNode: null,
  highlightedNodes: new Set<string>(),
  highlightedEdges: new Set<string>(),
  
  layoutType: 'force' as const,
  nodeColorBy: 'type' as const,
  edgeThickness: 'weight' as const,
  showLabels: true,
  showEdgeLabels: false,
  
  nodeTypeFilter: new Set<string>(),
  edgeTypeFilter: new Set<string>(),
  minNodeDegree: 0,
  maxDepth: 3,
  
  loading: false,
  error: null,
}

export const useGraphStore = create<GraphState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchGraphData: async (params) => {
        set({ loading: true, error: null })
        try {
          const data = await mcpAdapter.knowledgeGraph.buildGraph({
            entity_name: params?.entityId,
            max_depth: params?.depth || get().maxDepth,
          })
          
          // Calculate positions based on layout type
          const positionedData = get().calculateNodePositions(data, get().layoutType)
          
          set({
            graphData: positionedData,
            loading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch graph data',
            loading: false,
          })
        }
      },

      fetchEntityRelationships: async (entityId: string) => {
        set({ loading: true, error: null })
        try {
          // Get entity info and build graph around it
          const entity = await mcpAdapter.knowledgeGraph.getEntity(entityId)
          if (!entity) throw new Error('Entity not found')
          
          const relationships = await mcpAdapter.knowledgeGraph.buildGraph({
            entity_name: entity.name,
            max_depth: 1,
          })
          
          // The relationships is already a GraphData object from buildGraph
          const positionedData = get().calculateNodePositions(relationships, get().layoutType)
          
          set({
            graphData: positionedData,
            loading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch entity relationships',
            loading: false,
          })
        }
      },

      selectNode: (node) => {
        set({ selectedNode: node })
        if (node) {
          get().highlightNeighbors(node.id)
        } else {
          get().clearHighlights()
        }
      },

      selectEdge: (edge) => {
        set({ selectedEdge: edge })
      },

      hoverNode: (node) => {
        set({ hoveredNode: node })
      },

      highlightPath: (sourceId, targetId) => {
        const { graphData } = get()
        if (!graphData) return
        
        // Simple BFS to find path
        const visited = new Set<string>()
        const queue: { node: string; path: string[] }[] = [{ node: sourceId, path: [sourceId] }]
        const nodeSet = new Set<string>()
        const edgeSet = new Set<string>()
        
        while (queue.length > 0) {
          const { node, path } = queue.shift()!
          
          if (node === targetId) {
            // Found path, highlight it
            path.forEach(n => nodeSet.add(n))
            for (let i = 0; i < path.length - 1; i++) {
              const edge = graphData.edges.find(
                e => (e.source === path[i] && e.target === path[i + 1]) ||
                     (e.target === path[i] && e.source === path[i + 1])
              )
              if (edge) edgeSet.add(edge.id)
            }
            break
          }
          
          if (!visited.has(node)) {
            visited.add(node)
            
            const neighbors = graphData.edges
              .filter(e => e.source === node || e.target === node)
              .map(e => e.source === node ? e.target : e.source)
            
            neighbors.forEach(neighbor => {
              if (!visited.has(neighbor)) {
                queue.push({ node: neighbor, path: [...path, neighbor] })
              }
            })
          }
        }
        
        set({
          highlightedNodes: nodeSet,
          highlightedEdges: edgeSet,
        })
      },

      highlightNeighbors: (nodeId) => {
        const { graphData } = get()
        if (!graphData) return
        
        const nodeSet = new Set<string>([nodeId])
        const edgeSet = new Set<string>()
        
        graphData.edges.forEach(edge => {
          if (edge.source === nodeId || edge.target === nodeId) {
            edgeSet.add(edge.id)
            nodeSet.add(edge.source)
            nodeSet.add(edge.target)
          }
        })
        
        set({
          highlightedNodes: nodeSet,
          highlightedEdges: edgeSet,
        })
      },

      clearHighlights: () => {
        set({
          highlightedNodes: new Set(),
          highlightedEdges: new Set(),
        })
      },

      setLayoutType: (layout) => {
        set({ layoutType: layout })
        const { graphData } = get()
        if (graphData) {
          const positionedData = get().calculateNodePositions(graphData, layout)
          set({ graphData: positionedData })
        }
      },

      setNodeColorBy: (colorBy) => set({ nodeColorBy: colorBy }),
      
      setEdgeThickness: (thickness) => set({ edgeThickness: thickness }),
      
      toggleLabels: () => set(state => ({ showLabels: !state.showLabels })),
      
      toggleEdgeLabels: () => set(state => ({ showEdgeLabels: !state.showEdgeLabels })),

      toggleNodeTypeFilter: (type) => {
        set(state => {
          const newFilter = new Set(state.nodeTypeFilter)
          if (newFilter.has(type)) {
            newFilter.delete(type)
          } else {
            newFilter.add(type)
          }
          return { nodeTypeFilter: newFilter }
        })
      },

      toggleEdgeTypeFilter: (type) => {
        set(state => {
          const newFilter = new Set(state.edgeTypeFilter)
          if (newFilter.has(type)) {
            newFilter.delete(type)
          } else {
            newFilter.add(type)
          }
          return { edgeTypeFilter: newFilter }
        })
      },

      setMinNodeDegree: (degree) => set({ minNodeDegree: degree }),
      
      setMaxDepth: (depth) => set({ maxDepth: depth }),

      resetFilters: () => {
        set({
          nodeTypeFilter: new Set(),
          edgeTypeFilter: new Set(),
          minNodeDegree: 0,
          maxDepth: 3,
        })
      },

      transformMemoriesToGraph: (memories, entities) => {
        const nodes: GraphNode[] = []
        const edges: GraphEdge[] = []
        const nodeMap = new Map<string, GraphNode>()
        
        // Add memory nodes
        memories.forEach(memory => {
          const node: GraphNode = {
            id: `memory-${memory.id}`,
            label: memory.title,
            type: 'memory',
            properties: {
              preview: memory.preview || '',
              tagCount: memory.tags.length,
              created_at: memory.created_at,
            },
            size: 15,
            color: '#3B82F6', // Blue for memories
          }
          nodes.push(node)
          nodeMap.set(node.id, node)
        })
        
        // Add entity nodes
        entities.forEach(entity => {
          const node: GraphNode = {
            id: `entity-${entity.id}`,
            label: entity.name,
            type: 'entity',
            properties: entity.properties,
            size: 10 + (entity.frequency || 1) * 2,
            color: '#10B981', // Green for entities
          }
          nodes.push(node)
          nodeMap.set(node.id, node)
        })
        
        // Add collection nodes if memories have collections
        const collections = new Set<string>()
        memories.forEach(memory => {
          if (memory.collection) {
            collections.add(memory.collection)
          }
        })
        
        collections.forEach(collection => {
          const node: GraphNode = {
            id: `collection-${collection}`,
            label: collection,
            type: 'collection',
            properties: {},
            size: 20,
            color: '#F59E0B', // Yellow for collections
          }
          nodes.push(node)
          nodeMap.set(node.id, node)
        })
        
        // Create edges between memories and their entities
        memories.forEach(memory => {
          if (memory.entities) {
            memory.entities.forEach(entity => {
              edges.push({
                id: `${memory.id}-${entity.id}`,
                source: `memory-${memory.id}`,
                target: `entity-${entity.id}`,
                type: 'contains',
                weight: 1,
              })
            })
          }
          
          // Create edges between memories and collections
          if (memory.collection) {
            edges.push({
              id: `${memory.id}-collection-${memory.collection}`,
              source: `memory-${memory.id}`,
              target: `collection-${memory.collection}`,
              type: 'belongs_to',
              weight: 1,
            })
          }
        })
        
        // Create edges between related entities
        entities.forEach(entity => {
          if (entity.memoryIds && entity.memoryIds.length > 1) {
            // Connect entities that appear in the same memories
            entities.forEach(otherEntity => {
              if (entity.id !== otherEntity.id && otherEntity.memoryIds) {
                const sharedMemories = entity.memoryIds!.filter(id => 
                  otherEntity.memoryIds!.includes(id)
                )
                if (sharedMemories.length > 0) {
                  const edgeId = `entity-${entity.id}-entity-${otherEntity.id}`
                  if (!edges.find(e => e.id === edgeId || e.id === `entity-${otherEntity.id}-entity-${entity.id}`)) {
                    edges.push({
                      id: edgeId,
                      source: `entity-${entity.id}`,
                      target: `entity-${otherEntity.id}`,
                      type: 'related',
                      weight: sharedMemories.length,
                    })
                  }
                }
              }
            })
          }
        })
        
        return {
          nodes,
          edges,
          metadata: {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            depth: 1,
          },
        }
      },

      calculateNodePositions: (data, layoutType) => {
        const { nodes } = data
        
        // Simple positioning algorithms
        switch (layoutType) {
          case 'radial': {
            const radius = 300
            const angleStep = (2 * Math.PI) / nodes.length
            
            nodes.forEach((node, index) => {
              node.x = radius * Math.cos(index * angleStep)
              node.y = radius * Math.sin(index * angleStep)
            })
            break
          }
          
          case 'tree': {
            // Group nodes by type
            const groups: { [key: string]: GraphNode[] } = {}
            nodes.forEach(node => {
              if (!groups[node.type]) groups[node.type] = []
              groups[node.type].push(node)
            })
            
            let yOffset = 0
            Object.entries(groups).forEach(([, groupNodes]) => {
              groupNodes.forEach((node, index) => {
                node.x = index * 100 - (groupNodes.length * 50)
                node.y = yOffset
              })
              yOffset += 150
            })
            break
          }
          
          case 'cluster': {
            // Simple clustering by node type
            const clusters: { [key: string]: { x: number; y: number } } = {
              memory: { x: -200, y: 0 },
              entity: { x: 200, y: 0 },
              collection: { x: 0, y: -200 },
            }
            
            const counts: { [key: string]: number } = {}
            
            nodes.forEach(node => {
              const cluster = clusters[node.type] || { x: 0, y: 0 }
              const count = counts[node.type] || 0
              const angle = (count * 2 * Math.PI) / 8
              const radius = 50 + Math.floor(count / 8) * 30
              
              node.x = cluster.x + radius * Math.cos(angle)
              node.y = cluster.y + radius * Math.sin(angle)
              
              counts[node.type] = count + 1
            })
            break
          }
          
          case 'force':
          default: {
            // Random initial positions, D3 force simulation will handle the rest
            nodes.forEach(node => {
              node.x = Math.random() * 800 - 400
              node.y = Math.random() * 600 - 300
            })
            break
          }
        }
        
        return { ...data, nodes }
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: 'GraphStore' }
  )
)