import { useState } from 'react'
import { useMemoryStore } from '../stores/memoryStore'
import { useSearchStore } from '../stores/searchStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useGraphStore } from '../stores/graphStore'
import { mcpAdapter } from '../services/api/mcp-adapter'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Loader2 } from 'lucide-react'

export function TestMCPPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    rag: boolean
    kg: boolean
    vector: boolean
    unified: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  
  const memoryStore = useMemoryStore()
  const searchStore = useSearchStore()
  const collectionStore = useCollectionStore()
  const graphStore = useGraphStore()

  const testConnections = async () => {
    setLoading(true)
    setTestResults(['Testing MCP connections...'])
    
    try {
      const status = await mcpAdapter.testConnections()
      setConnectionStatus(status)
      
      const results: string[] = []
      results.push('Connection Status:')
      results.push(`- RAG MCP (8002): ${status.rag ? '✅ Connected' : '❌ Failed'}`)
      results.push(`- Knowledge Graph MCP (8001): ${status.kg ? '✅ Connected' : '❌ Failed'}`)
      results.push(`- Vector DB MCP (8003): ${status.vector ? '✅ Connected' : '❌ Failed'}`)
      results.push(`- Unified DB MCP (8004): ${status.unified ? '✅ Connected' : '❌ Failed'}`)
      
      setTestResults(results)
    } catch (error) {
      setTestResults(['Error testing connections:', error.message])
    }
    
    setLoading(false)
  }

  const testMemoryOperations = async () => {
    setLoading(true)
    const results: string[] = ['Testing memory operations...']
    
    try {
      // Test creating a memory
      results.push('\n1. Creating test memory...')
      const newMemory = await memoryStore.createMemory({
        title: 'Test Memory from Web UI',
        content: 'This is a test memory created from the Knowledge RAG Web UI to verify MCP integration.',
        tags: ['test', 'mcp-integration'],
        metadata: { source: 'web-ui-test' }
      })
      results.push(`✅ Memory created with ID: ${newMemory.id}`)
      
      // Test searching
      results.push('\n2. Testing search...')
      await searchStore.searchWithQuery('test memory')
      results.push(`✅ Search completed, found ${searchStore.results?.total || 0} results`)
      
      // Test getting memories
      results.push('\n3. Fetching memories...')
      await memoryStore.fetchMemories()
      results.push(`✅ Fetched ${memoryStore.memories.length} memories`)
      
    } catch (error) {
      results.push(`❌ Error: ${error.message}`)
    }
    
    setTestResults(results)
    setLoading(false)
  }

  const testCollectionOperations = async () => {
    setLoading(true)
    const results: string[] = ['Testing collection operations...']
    
    try {
      // Test creating a collection
      results.push('\n1. Creating test collection...')
      const newCollection = await collectionStore.createCollection({
        name: 'Test Collection',
        description: 'A test collection for MCP integration',
        color: '#3B82F6',
        icon: '🧪',
        isPublic: false
      })
      results.push(`✅ Collection created with ID: ${newCollection.id}`)
      
      // Test fetching collections
      results.push('\n2. Fetching collections...')
      await collectionStore.fetchCollections()
      results.push(`✅ Fetched ${collectionStore.collections.length} collections`)
      
    } catch (error) {
      results.push(`❌ Error: ${error.message}`)
    }
    
    setTestResults(results)
    setLoading(false)
  }

  const testKnowledgeGraphOperations = async () => {
    setLoading(true)
    const results: string[] = ['Testing knowledge graph operations...']
    
    try {
      // Test building graph
      results.push('\n1. Building knowledge graph...')
      await graphStore.fetchGraphData({ depth: 2 })
      
      if (graphStore.graphData) {
        results.push(`✅ Graph built with ${graphStore.graphData.nodes.length} nodes and ${graphStore.graphData.edges.length} edges`)
      } else {
        results.push('❌ No graph data returned')
      }
      
      // Test entity extraction
      results.push('\n2. Testing entity extraction...')
      const entities = await mcpAdapter.knowledgeGraph.extractEntities(
        'This is a test text about React, TypeScript, and Knowledge Graphs. We are testing the MCP integration.'
      )
      results.push(`✅ Extracted ${entities.length} entities: ${entities.map(e => e.name).join(', ')}`)
      
    } catch (error) {
      results.push(`❌ Error: ${error.message}`)
    }
    
    setTestResults(results)
    setLoading(false)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">MCP Integration Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Test MCP Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={testConnections} 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connections
              </Button>
              
              <Button 
                onClick={testMemoryOperations} 
                disabled={loading || !connectionStatus?.rag}
                variant="secondary"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Memory Ops
              </Button>
              
              <Button 
                onClick={testCollectionOperations} 
                disabled={loading || !connectionStatus?.unified}
                variant="secondary"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Collections
              </Button>
              
              <Button 
                onClick={testKnowledgeGraphOperations} 
                disabled={loading || !connectionStatus?.kg}
                variant="secondary"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Knowledge Graph
              </Button>
            </div>
            
            {testResults.length > 0 && (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
                {testResults.join('\n')}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}