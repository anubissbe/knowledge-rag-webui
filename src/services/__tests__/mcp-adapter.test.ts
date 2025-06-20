import axios from 'axios'
import { mcpAdapter } from '../api/mcp-adapter'
import { createMockApiResponse, createMockApiError } from '@/utils/test-helpers'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('MCP Adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  describe('Memory Operations', () => {
    it('creates memory successfully', async () => {
      const mockResponse = {
        data: {
          jsonrpc: '2.0',
          result: {
            id: 'memory-1',
            title: 'Test Memory',
            content: 'Test content'
          },
          id: 1
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await mcpAdapter.memory.createMemory({
        title: 'Test Memory',
        content: 'Test content',
        tags: ['test']
      })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8002',
        {
          jsonrpc: '2.0',
          method: 'create_memory',
          params: {
            title: 'Test Memory',
            content: 'Test content',
            tags: ['test']
          },
          id: expect.any(Number)
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      )

      expect(result).toEqual(mockResponse.data.result)
    })

    it('handles memory creation error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        mcpAdapter.memory.createMemory({
          title: 'Test Memory',
          content: 'Test content',
          tags: []
        })
      ).rejects.toThrow('Network error')
    })

    it('gets memories with filters', async () => {
      const mockResponse = {
        data: {
          jsonrpc: '2.0',
          result: {
            memories: [
              { id: '1', title: 'Memory 1' },
              { id: '2', title: 'Memory 2' }
            ],
            total: 2
          },
          id: 1
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await mcpAdapter.memory.getMemories({
        tags: ['test'],
        limit: 10,
        offset: 0
      })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8002',
        {
          jsonrpc: '2.0',
          method: 'get_memories',
          params: {
            tags: ['test'],
            limit: 10,
            offset: 0
          },
          id: expect.any(Number)
        },
        expect.any(Object)
      )

      expect(result).toEqual(mockResponse.data.result)
    })

    it('searches memories', async () => {
      const mockResponse = {
        data: {
          jsonrpc: '2.0',
          result: {
            results: [
              { id: '1', title: 'Matching Memory', score: 0.95 }
            ],
            total: 1
          },
          id: 1
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await mcpAdapter.memory.searchMemories('test query')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8002',
        {
          jsonrpc: '2.0',
          method: 'search_memories',
          params: { query: 'test query' },
          id: expect.any(Number)
        },
        expect.any(Object)
      )

      expect(result).toEqual(mockResponse.data.result)
    })
  })

  describe('Knowledge Graph Operations', () => {
    it('gets graph data', async () => {
      const mockResponse = {
        data: {
          jsonrpc: '2.0',
          result: {
            nodes: [
              { id: 'node1', label: 'Entity 1', type: 'concept' }
            ],
            edges: [
              { id: 'edge1', source: 'node1', target: 'node2' }
            ]
          },
          id: 1
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await mcpAdapter.knowledgeGraph.getGraph()

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8001',
        {
          jsonrpc: '2.0',
          method: 'get_graph',
          params: {},
          id: expect.any(Number)
        },
        expect.any(Object)
      )

      expect(result).toEqual(mockResponse.data.result)
    })

    it('gets entity details', async () => {
      const mockResponse = {
        data: {
          jsonrpc: '2.0',
          result: {
            id: 'entity-1',
            name: 'Test Entity',
            type: 'concept',
            connections: ['entity-2', 'entity-3']
          },
          id: 1
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await mcpAdapter.knowledgeGraph.getEntity('entity-1')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8001',
        {
          jsonrpc: '2.0',
          method: 'get_entity',
          params: { entity_id: 'entity-1' },
          id: expect.any(Number)
        },
        expect.any(Object)
      )

      expect(result).toEqual(mockResponse.data.result)
    })
  })

  describe('Authentication', () => {
    it('includes auth token when available', async () => {
      const mockGetItem = jest.fn().mockReturnValue('test-token')
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true,
      })

      const mockResponse = {
        data: { jsonrpc: '2.0', result: {}, id: 1 }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      await mcpAdapter.memory.getMemories()

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          timeout: 30000
        }
      )
    })

    it('works without auth token', async () => {
      const mockGetItem = jest.fn().mockReturnValue(null)
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true,
      })

      const mockResponse = {
        data: { jsonrpc: '2.0', result: {}, id: 1 }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      await mcpAdapter.memory.getMemories()

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      )
    })
  })

  describe('Error Handling', () => {
    it('handles network timeout', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded')
      timeoutError.name = 'AxiosError'
      ;(timeoutError as any).code = 'ECONNABORTED'

      mockedAxios.post.mockRejectedValueOnce(timeoutError)

      await expect(
        mcpAdapter.memory.getMemories()
      ).rejects.toThrow('timeout of 30000ms exceeded')
    })

    it('handles server error responses', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal error'
            },
            id: 1
          }
        }
      }

      mockedAxios.post.mockRejectedValueOnce(serverError)

      await expect(
        mcpAdapter.memory.getMemories()
      ).rejects.toMatchObject(serverError)
    })

    it('handles malformed responses', async () => {
      const mockResponse = {
        data: {
          // Missing jsonrpc field
          result: {},
          id: 1
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await mcpAdapter.memory.getMemories()
      expect(result).toEqual({})
    })
  })

  describe('Request Validation', () => {
    it('generates unique request IDs', async () => {
      const mockResponse = {
        data: { jsonrpc: '2.0', result: {}, id: 1 }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      // Make multiple requests
      await Promise.all([
        mcpAdapter.memory.getMemories(),
        mcpAdapter.memory.getMemories(),
        mcpAdapter.memory.getMemories()
      ])

      const calls = mockedAxios.post.mock.calls
      const ids = calls.map(call => call[1].id)
      
      // All IDs should be different
      expect(new Set(ids).size).toBe(3)
    })

    it('validates required parameters', async () => {
      await expect(
        mcpAdapter.memory.createMemory({
          title: '',
          content: 'test',
          tags: []
        })
      ).rejects.toThrow()
    })
  })
})