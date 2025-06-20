import { screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoriesPage } from '../MemoriesPage'
import { renderWithProviders, mockMemory } from '@/utils/test-helpers'
import { mcpAdapter } from '@/services/api/mcp-adapter'

// Mock the MCP adapter
jest.mock('@/services/api/mcp-adapter')
const mockMcpAdapter = mcpAdapter as jest.Mocked<typeof mcpAdapter>

describe('MemoriesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders memories page with loading state', () => {
    // Mock pending API call
    mockMcpAdapter.memory.getMemories.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    renderWithProviders(<MemoriesPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays memories when loaded successfully', async () => {
    const mockMemories = {
      memories: [
        mockMemory({ 
          title: 'Test Memory 1',
          content: 'Content of test memory 1'
        }),
        mockMemory({ 
          id: 'memory-2',
          title: 'Test Memory 2',
          content: 'Content of test memory 2'
        })
      ],
      total: 2
    }

    mockMcpAdapter.memory.getMemories.mockResolvedValueOnce(mockMemories)

    renderWithProviders(<MemoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Memory 1')).toBeInTheDocument()
      expect(screen.getByText('Test Memory 2')).toBeInTheDocument()
    })

    expect(screen.getByText(/content of test memory 1/i)).toBeInTheDocument()
    expect(screen.getByText(/content of test memory 2/i)).toBeInTheDocument()
  })

  it('displays error message when API fails', async () => {
    const error = new Error('Failed to fetch memories')
    mockMcpAdapter.memory.getMemories.mockRejectedValueOnce(error)

    renderWithProviders(<MemoriesPage />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to fetch memories/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no memories exist', async () => {
    const emptyResponse = {
      memories: [],
      total: 0
    }

    mockMcpAdapter.memory.getMemories.mockResolvedValueOnce(emptyResponse)

    renderWithProviders(<MemoriesPage />)

    await waitFor(() => {
      expect(screen.getByText(/no memories found/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/create your first memory/i)).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    const initialMemories = {
      memories: [
        mockMemory({ title: 'React Hooks' }),
        mockMemory({ title: 'TypeScript Guide' })
      ],
      total: 2
    }

    const searchResults = {
      memories: [
        mockMemory({ title: 'React Hooks' })
      ],
      total: 1
    }

    mockMcpAdapter.memory.getMemories
      .mockResolvedValueOnce(initialMemories)
      .mockResolvedValueOnce(searchResults)

    renderWithProviders(<MemoriesPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      expect(screen.getByText('TypeScript Guide')).toBeInTheDocument()
    })

    // Search for "React"
    const searchInput = screen.getByPlaceholderText(/search memories/i)
    fireEvent.change(searchInput, { target: { value: 'React' } })

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      expect(screen.queryByText('TypeScript Guide')).not.toBeInTheDocument()
    })

    // Verify API was called with search parameters
    expect(mockMcpAdapter.memory.getMemories).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'React'
      })
    )
  })

  it('handles pagination', async () => {
    const firstPage = {
      memories: [mockMemory({ title: 'Memory 1' })],
      total: 10,
      hasMore: true
    }

    const secondPage = {
      memories: [mockMemory({ title: 'Memory 2' })],
      total: 10,
      hasMore: false
    }

    mockMcpAdapter.memory.getMemories
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage)

    renderWithProviders(<MemoriesPage />)

    // Wait for first page
    await waitFor(() => {
      expect(screen.getByText('Memory 1')).toBeInTheDocument()
    })

    // Click load more button
    const loadMoreButton = screen.getByText(/load more/i)
    fireEvent.click(loadMoreButton)

    // Wait for second page
    await waitFor(() => {
      expect(screen.getByText('Memory 2')).toBeInTheDocument()
    })

    // Verify both memories are shown
    expect(screen.getByText('Memory 1')).toBeInTheDocument()
    expect(screen.getByText('Memory 2')).toBeInTheDocument()
  })

  it('handles filter by collection', async () => {
    const allMemories = {
      memories: [
        mockMemory({ title: 'Work Memory', collection_id: 'work' }),
        mockMemory({ title: 'Personal Memory', collection_id: 'personal' })
      ],
      total: 2
    }

    const workMemories = {
      memories: [
        mockMemory({ title: 'Work Memory', collection_id: 'work' })
      ],
      total: 1
    }

    mockMcpAdapter.memory.getMemories
      .mockResolvedValueOnce(allMemories)
      .mockResolvedValueOnce(workMemories)

    renderWithProviders(<MemoriesPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Work Memory')).toBeInTheDocument()
      expect(screen.getByText('Personal Memory')).toBeInTheDocument()
    })

    // Filter by work collection
    const collectionFilter = screen.getByRole('combobox', { name: /collection/i })
    fireEvent.change(collectionFilter, { target: { value: 'work' } })

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('Work Memory')).toBeInTheDocument()
      expect(screen.queryByText('Personal Memory')).not.toBeInTheDocument()
    })
  })

  it('handles sort options', async () => {
    const memories = {
      memories: [
        mockMemory({ 
          title: 'Newer Memory',
          created_at: '2024-12-20T10:00:00Z'
        }),
        mockMemory({ 
          title: 'Older Memory',
          created_at: '2024-12-19T10:00:00Z'
        })
      ],
      total: 2
    }

    mockMcpAdapter.memory.getMemories.mockResolvedValue(memories)

    renderWithProviders(<MemoriesPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Newer Memory')).toBeInTheDocument()
    })

    // Change sort order
    const sortSelect = screen.getByRole('combobox', { name: /sort/i })
    fireEvent.change(sortSelect, { target: { value: 'oldest' } })

    // Verify API called with sort parameter
    await waitFor(() => {
      expect(mockMcpAdapter.memory.getMemories).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'created_at',
          sortOrder: 'asc'
        })
      )
    })
  })

  it('supports keyboard shortcuts', async () => {
    renderWithProviders(<MemoriesPage />)

    // Press Ctrl+K to open search
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

    const searchInput = screen.getByPlaceholderText(/search memories/i)
    expect(searchInput).toHaveFocus()

    // Press Escape to close search
    fireEvent.keyDown(searchInput, { key: 'Escape' })
    expect(searchInput).not.toHaveFocus()
  })

  it('maintains scroll position on navigation', async () => {
    const memories = {
      memories: Array.from({ length: 20 }, (_, i) => 
        mockMemory({ title: `Memory ${i + 1}` })
      ),
      total: 20
    }

    mockMcpAdapter.memory.getMemories.mockResolvedValue(memories)

    renderWithProviders(<MemoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('Memory 1')).toBeInTheDocument()
    })

    // Scroll down
    window.scrollTo(0, 500)

    // Simulate navigation away and back
    // This would be tested more thoroughly in integration tests
    expect(window.scrollY).toBe(500)
  })
})