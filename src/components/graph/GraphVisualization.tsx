import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { useGraphStore } from '../../stores'
import type { GraphNode, GraphEdge } from '../../types'

interface GraphVisualizationProps {
  width?: number
  height?: number
  className?: string
}

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  width = 800,
  height = 600,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  
  const {
    graphData,
    selectedNode,
    highlightedNodes,
    highlightedEdges,
    layoutType,
    nodeColorBy,
    edgeThickness,
    showLabels,
    showEdgeLabels,
    nodeTypeFilter,
    edgeTypeFilter,
    minNodeDegree,
    selectNode,
    hoverNode,
    selectEdge,
  } = useGraphStore()

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width: w, height: h } = svgRef.current.getBoundingClientRect()
        setDimensions({ width: w || width, height: h || height })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [width, height])

  // Main D3 visualization effect
  useEffect(() => {
    if (!svgRef.current || !graphData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous render

    // Filter nodes and edges based on active filters
    let filteredNodes = graphData.nodes
    let filteredEdges = graphData.edges

    // Apply node type filter
    if (nodeTypeFilter.size > 0) {
      filteredNodes = filteredNodes.filter(node => !nodeTypeFilter.has(node.type))
    }

    // Apply edge type filter
    if (edgeTypeFilter.size > 0) {
      filteredEdges = filteredEdges.filter(edge => !edgeTypeFilter.has(edge.type))
    }

    // Calculate node degrees
    const nodeDegrees = new Map<string, number>()
    filteredNodes.forEach(node => nodeDegrees.set(node.id, 0))
    filteredEdges.forEach(edge => {
      nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1)
      nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1)
    })

    // Filter by minimum node degree
    if (minNodeDegree > 0) {
      filteredNodes = filteredNodes.filter(node => 
        (nodeDegrees.get(node.id) || 0) >= minNodeDegree
      )
      const nodeIds = new Set(filteredNodes.map(n => n.id))
      filteredEdges = filteredEdges.filter(edge => 
        nodeIds.has(edge.source) && nodeIds.has(edge.target)
      )
    }

    // Create main group for zoom/pan
    const g = svg.append('g')

    // Define arrow markers for directed edges
    const defs = svg.append('defs')
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#6B7280')

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Color scales
    const typeColors = d3.scaleOrdinal<string>()
      .domain(['memory', 'entity', 'collection'])
      .range(['#3B82F6', '#10B981', '#F59E0B'])

    const getNodeColor = (node: GraphNode) => {
      if (nodeColorBy === 'type') {
        return node.color || typeColors(node.type)
      }
      // Add other color schemes here (cluster, degree)
      return node.color || '#6B7280'
    }

    // Edge thickness scale
    const edgeWeightScale = d3.scaleLinear()
      .domain([0, d3.max(filteredEdges, d => d.weight || 1) || 1])
      .range([1, 5])

    const getEdgeThickness = (edge: GraphEdge) => {
      if (edgeThickness === 'uniform') return 2
      if (edgeThickness === 'weight') return edgeWeightScale(edge.weight || 1)
      // Add type-based thickness here
      return 2
    }

    // Create force simulation based on layout type
    let simulation: d3.Simulation<GraphNode, GraphEdge> | null = null

    if (layoutType === 'force') {
      simulation = d3.forceSimulation(filteredNodes)
        .force('link', d3.forceLink<GraphNode, GraphEdge>(filteredEdges)
          .id(d => d.id)
          .distance(50))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
        .force('collision', d3.forceCollide().radius(d => ((d as any).size || 10) + 5))
    }

    // Create edge elements
    const edges = g.append('g')
      .attr('class', 'edges')
      .selectAll('line')
      .data(filteredEdges)
      .enter().append('line')
      .attr('stroke', d => {
        if (highlightedEdges.has(d.id)) return '#EF4444'
        return '#6B7280'
      })
      .attr('stroke-width', d => getEdgeThickness(d))
      .attr('stroke-opacity', d => {
        if (highlightedEdges.size > 0 && !highlightedEdges.has(d.id)) return 0.2
        return 0.6
      })
      .attr('marker-end', 'url(#arrowhead)')
      .on('click', (event, d) => {
        event.stopPropagation()
        selectEdge(d)
      })

    // Create edge labels if enabled
    const edgeLabels = showEdgeLabels ? g.append('g')
      .attr('class', 'edge-labels')
      .selectAll('text')
      .data(filteredEdges)
      .enter().append('text')
      .attr('font-size', '10px')
      .attr('fill', '#6B7280')
      .attr('text-anchor', 'middle')
      .text(d => d.type)
      .style('pointer-events', 'none') : null

    // Create node groups
    const nodes = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(filteredNodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        selectNode(d)
      })
      .on('mouseenter', (_, d) => {
        hoverNode(d)
      })
      .on('mouseleave', () => {
        hoverNode(null)
      })

    // Add circles to nodes
    nodes.append('circle')
      .attr('r', d => d.size || 10)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => {
        if (selectedNode?.id === d.id) return '#1F2937'
        if (highlightedNodes.has(d.id)) return '#EF4444'
        return '#E5E7EB'
      })
      .attr('stroke-width', d => {
        if (selectedNode?.id === d.id) return 3
        if (highlightedNodes.has(d.id)) return 2
        return 1
      })
      .attr('fill-opacity', d => {
        if (highlightedNodes.size > 0 && !highlightedNodes.has(d.id)) return 0.2
        return 0.9
      })

    // Add labels to nodes if enabled
    if (showLabels) {
      nodes.append('text')
        .attr('dx', d => (d.size || 10) + 5)
        .attr('dy', 3)
        .attr('font-size', '12px')
        .attr('fill', '#1F2937')
        .text(d => d.label)
        .style('pointer-events', 'none')
    }

    // Add hover tooltip
    nodes.append('title')
      .text(d => {
        let text = `${d.label} (${d.type})`
        if (d.properties && Object.keys(d.properties).length > 0) {
          text += '\n' + JSON.stringify(d.properties, null, 2)
        }
        return text
      })

    // Position nodes based on layout or simulation
    if (layoutType === 'force' && simulation) {
      // Set initial positions if available
      filteredNodes.forEach(node => {
        if (node.x !== undefined) (node as any).fx = node.x
        if (node.y !== undefined) (node as any).fy = node.y
      })

      // Update positions on simulation tick
      simulation.on('tick', () => {
        edges
          .attr('x1', d => (d.source as any).x)
          .attr('y1', d => (d.source as any).y)
          .attr('x2', d => (d.target as any).x)
          .attr('y2', d => (d.target as any).y)

        if (edgeLabels) {
          edgeLabels
            .attr('x', d => ((d.source as any).x + (d.target as any).x) / 2)
            .attr('y', d => ((d.source as any).y + (d.target as any).y) / 2)
        }

        nodes.attr('transform', d => `translate(${(d as any).x},${(d as any).y})`)
      })

      // Enable dragging for force layout
      const drag = d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
          ;(d as any).fx = (d as any).x
          ;(d as any).fy = (d as any).y
        })
        .on('drag', (event, d) => {
          ;(d as any).fx = event.x
          ;(d as any).fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active && simulation) simulation.alphaTarget(0)
          ;(d as any).fx = null
          ;(d as any).fy = null
        })

      nodes.call(drag)
    } else {
      // Use pre-calculated positions
      edges
        .attr('x1', d => {
          const source = filteredNodes.find(n => n.id === (d.source as any).id || n.id === d.source)
          return source?.x || 0
        })
        .attr('y1', d => {
          const source = filteredNodes.find(n => n.id === (d.source as any).id || n.id === d.source)
          return source?.y || 0
        })
        .attr('x2', d => {
          const target = filteredNodes.find(n => n.id === (d.target as any).id || n.id === d.target)
          return target?.x || 0
        })
        .attr('y2', d => {
          const target = filteredNodes.find(n => n.id === (d.target as any).id || n.id === d.target)
          return target?.y || 0
        })

      if (edgeLabels) {
        edgeLabels
          .attr('x', d => {
            const source = filteredNodes.find(n => n.id === (d.source as any).id || n.id === d.source)
            const target = filteredNodes.find(n => n.id === (d.target as any).id || n.id === d.target)
            return ((source?.x || 0) + (target?.x || 0)) / 2
          })
          .attr('y', d => {
            const source = filteredNodes.find(n => n.id === (d.source as any).id || n.id === d.source)
            const target = filteredNodes.find(n => n.id === (d.target as any).id || n.id === d.target)
            return ((source?.y || 0) + (target?.y || 0)) / 2
          })
      }

      nodes.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
    }

    // Click on background to deselect
    svg.on('click', () => {
      selectNode(null)
      selectEdge(null)
    })

    // Center view on selected node
    if (selectedNode) {
      const node = filteredNodes.find(n => n.id === selectedNode.id)
      if (node && node.x !== undefined && node.y !== undefined) {
        const scale = 1.5
        const transform = d3.zoomIdentity
          .translate(dimensions.width / 2, dimensions.height / 2)
          .scale(scale)
          .translate(-node.x, -node.y)
        
        svg.transition()
          .duration(750)
          .call(zoom.transform, transform)
      }
    }

    // Cleanup
    return () => {
      if (simulation) simulation.stop()
    }
  }, [
    graphData,
    dimensions,
    selectedNode,
    highlightedNodes,
    highlightedEdges,
    layoutType,
    nodeColorBy,
    edgeThickness,
    showLabels,
    showEdgeLabels,
    nodeTypeFilter,
    edgeTypeFilter,
    minNodeDegree,
  ])

  if (!graphData) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-500 dark:text-gray-400">No graph data available</p>
      </div>
    )
  }

  return (
    <svg
      ref={svgRef}
      className={`w-full h-full bg-gray-50 dark:bg-gray-900 ${className}`}
      style={{ width, height }}
    />
  )
}