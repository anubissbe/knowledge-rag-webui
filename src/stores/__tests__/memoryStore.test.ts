import { act, renderHook } from '@testing-library/react'
import { useMemoryStore } from '../memoryStore'
import { mockMemory } from '@/utils/test-helpers'

describe('Memory Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useMemoryStore())
    act(() => {
      result.current.clearMemories()
    })
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useMemoryStore())
    
    expect(result.current.memories).toEqual([])
    expect(result.current.selectedMemory).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.searchQuery).toBe('')
    expect(result.current.filters).toEqual({
      tags: [],
      collections: [],
      dateRange: null
    })
  })

  it('sets memories correctly', () => {
    const { result } = renderHook(() => useMemoryStore())
    const testMemories = [
      mockMemory({ title: 'Test Memory 1' }),
      mockMemory({ title: 'Test Memory 2' })
    ]

    act(() => {
      result.current.setMemories(testMemories)
    })

    expect(result.current.memories).toEqual(testMemories)
    expect(result.current.memories).toHaveLength(2)
  })

  it('adds memory correctly', () => {
    const { result } = renderHook(() => useMemoryStore())
    const newMemory = mockMemory({ title: 'New Memory' })

    act(() => {
      result.current.addMemory(newMemory)
    })

    expect(result.current.memories).toContain(newMemory)
    expect(result.current.memories).toHaveLength(1)
  })

  it('updates memory correctly', () => {
    const { result } = renderHook(() => useMemoryStore())
    const originalMemory = mockMemory({ 
      id: 'test-1',
      title: 'Original Title' 
    })

    // Set initial memory
    act(() => {
      result.current.setMemories([originalMemory])
    })

    // Update memory
    const updatedMemory = {
      ...originalMemory,
      title: 'Updated Title'
    }

    act(() => {
      result.current.updateMemory('test-1', updatedMemory)
    })

    expect(result.current.memories[0].title).toBe('Updated Title')
    expect(result.current.memories).toHaveLength(1)
  })

  it('removes memory correctly', () => {
    const { result } = renderHook(() => useMemoryStore())
    const memory1 = mockMemory({ id: 'test-1', title: 'Memory 1' })
    const memory2 = mockMemory({ id: 'test-2', title: 'Memory 2' })

    // Set initial memories
    act(() => {
      result.current.setMemories([memory1, memory2])
    })

    expect(result.current.memories).toHaveLength(2)

    // Remove one memory
    act(() => {
      result.current.removeMemory('test-1')
    })

    expect(result.current.memories).toHaveLength(1)
    expect(result.current.memories[0].id).toBe('test-2')
  })

  it('sets selected memory correctly', () => {
    const { result } = renderHook(() => useMemoryStore())
    const testMemory = mockMemory({ title: 'Selected Memory' })

    act(() => {
      result.current.setSelectedMemory(testMemory)
    })

    expect(result.current.selectedMemory).toEqual(testMemory)
  })

  it('clears selected memory', () => {
    const { result } = renderHook(() => useMemoryStore())
    const testMemory = mockMemory({ title: 'Selected Memory' })

    // Set selected memory
    act(() => {
      result.current.setSelectedMemory(testMemory)
    })

    expect(result.current.selectedMemory).toEqual(testMemory)

    // Clear selected memory
    act(() => {
      result.current.setSelectedMemory(null)
    })

    expect(result.current.selectedMemory).toBeNull()
  })

  it('manages loading state correctly', () => {
    const { result } = renderHook(() => useMemoryStore())

    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.setLoading(false)
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('manages error state correctly', () => {
    const { result } = renderHook(() => useMemoryStore())
    const testError = 'Test error message'

    expect(result.current.error).toBeNull()

    act(() => {
      result.current.setError(testError)
    })

    expect(result.current.error).toBe(testError)

    act(() => {
      result.current.setError(null)
    })

    expect(result.current.error).toBeNull()
  })

  it('manages search query correctly', () => {
    const { result } = renderHook(() => useMemoryStore())
    const testQuery = 'test search query'

    expect(result.current.searchQuery).toBe('')

    act(() => {
      result.current.setSearchQuery(testQuery)
    })

    expect(result.current.searchQuery).toBe(testQuery)
  })

  it('manages filters correctly', () => {
    const { result } = renderHook(() => useMemoryStore())
    const testFilters = {
      tags: ['react', 'typescript'],
      collections: ['work', 'personal'],
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      }
    }

    act(() => {
      result.current.setFilters(testFilters)
    })

    expect(result.current.filters).toEqual(testFilters)
  })

  it('updates individual filter properties', () => {
    const { result } = renderHook(() => useMemoryStore())

    // Update tags filter
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        tags: ['react']
      })
    })

    expect(result.current.filters.tags).toEqual(['react'])
    expect(result.current.filters.collections).toEqual([])

    // Update collections filter
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        collections: ['work']
      })
    })

    expect(result.current.filters.tags).toEqual(['react'])
    expect(result.current.filters.collections).toEqual(['work'])
  })

  it('clears all memories', () => {
    const { result } = renderHook(() => useMemoryStore())
    const testMemories = [
      mockMemory({ title: 'Memory 1' }),
      mockMemory({ title: 'Memory 2' })
    ]

    // Set memories
    act(() => {
      result.current.setMemories(testMemories)
    })

    expect(result.current.memories).toHaveLength(2)

    // Clear memories
    act(() => {
      result.current.clearMemories()
    })

    expect(result.current.memories).toEqual([])
  })

  it('finds memory by id', () => {
    const { result } = renderHook(() => useMemoryStore())
    const memory1 = mockMemory({ id: 'test-1', title: 'Memory 1' })
    const memory2 = mockMemory({ id: 'test-2', title: 'Memory 2' })

    act(() => {
      result.current.setMemories([memory1, memory2])
    })

    // Get memory by id
    const foundMemory = result.current.getMemoryById('test-1')
    expect(foundMemory).toEqual(memory1)

    // Try to get non-existent memory
    const notFound = result.current.getMemoryById('non-existent')
    expect(notFound).toBeUndefined()
  })

  it('filters memories by search query', () => {
    const { result } = renderHook(() => useMemoryStore())
    const memories = [
      mockMemory({ title: 'React Hooks Tutorial', content: 'Learn about React hooks' }),
      mockMemory({ title: 'TypeScript Guide', content: 'Complete TypeScript guide' }),
      mockMemory({ title: 'JavaScript Basics', content: 'JavaScript fundamentals' })
    ]

    act(() => {
      result.current.setMemories(memories)
    })

    // Test filtering
    const reactMemories = result.current.getFilteredMemories('React')
    expect(reactMemories).toHaveLength(1)
    expect(reactMemories[0].title).toBe('React Hooks Tutorial')

    const scriptMemories = result.current.getFilteredMemories('script')
    expect(scriptMemories).toHaveLength(2) // TypeScript and JavaScript
  })

  it('maintains state consistency after multiple operations', () => {
    const { result } = renderHook(() => useMemoryStore())
    
    // Add multiple memories
    const memory1 = mockMemory({ id: '1', title: 'Memory 1' })
    const memory2 = mockMemory({ id: '2', title: 'Memory 2' })
    const memory3 = mockMemory({ id: '3', title: 'Memory 3' })

    act(() => {
      result.current.addMemory(memory1)
      result.current.addMemory(memory2)
      result.current.addMemory(memory3)
    })

    expect(result.current.memories).toHaveLength(3)

    // Update one memory
    act(() => {
      result.current.updateMemory('2', { ...memory2, title: 'Updated Memory 2' })
    })

    expect(result.current.memories[1].title).toBe('Updated Memory 2')

    // Remove one memory
    act(() => {
      result.current.removeMemory('1')
    })

    expect(result.current.memories).toHaveLength(2)
    expect(result.current.memories.find(m => m.id === '1')).toBeUndefined()

    // Verify remaining memories
    expect(result.current.memories.find(m => m.id === '2')?.title).toBe('Updated Memory 2')
    expect(result.current.memories.find(m => m.id === '3')?.title).toBe('Memory 3')
  })
})