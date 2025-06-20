import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock data generators
export const mockMemory = (overrides: Partial<Memory> = {}): Memory => ({
  id: 'test-memory-1',
  title: 'Test Memory',
  content: 'This is a test memory content',
  tags: ['test', 'mock'],
  created_at: '2024-12-20T10:00:00Z',
  updated_at: '2024-12-20T10:00:00Z',
  collection_id: 'test-collection',
  metadata: {},
  ...overrides
})

export const mockCollection = (overrides: Partial<Collection> = {}): Collection => ({
  id: 'test-collection-1',
  name: 'Test Collection',
  description: 'A test collection',
  created_at: '2024-12-20T10:00:00Z',
  updated_at: '2024-12-20T10:00:00Z',
  memory_count: 5,
  ...overrides
})

export const mockEntity = (overrides: Partial<Entity> = {}): Entity => ({
  id: 'test-entity-1',
  name: 'Test Entity',
  type: 'concept',
  description: 'A test entity',
  connections: [],
  ...overrides
})

export const mockGraphNode = (overrides: Partial<GraphNode> = {}): GraphNode => ({
  id: 'node-1',
  label: 'Test Node',
  type: 'memory',
  size: 10,
  color: '#3b82f6',
  x: 100,
  y: 100,
  ...overrides
})

export const mockGraphEdge = (overrides: Partial<GraphEdge> = {}): GraphEdge => ({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  weight: 0.5,
  type: 'related',
  ...overrides
})

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  queryClient?: QueryClient
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialEntries = ['/'], queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  }), ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(BrowserRouter, null, children)
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// API mock helpers
export const createMockApiResponse = <T>(data: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

export const createMockApiError = (message: string, status = 500, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(message)
      ;(error as any).response = { status, data: { message } }
      reject(error)
    }, delay)
  })
}

// DOM testing utilities
export const waitForElement = async (selector: string, timeout = 1000) => {
  return new Promise<Element>((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`))
      } else {
        setTimeout(check, 50)
      }
    }
    
    check()
  })
}

// Form testing helpers
export const fillForm = async (formData: Record<string, string>) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  
  for (const [name, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      await user.clear(input)
      await user.type(input, value)
    }
  }
}

// Performance testing
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  await new Promise(resolve => setTimeout(resolve, 0)) // Wait for render
  const end = performance.now()
  return end - start
}

// Local storage mocking
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => Object.keys(store).forEach(key => delete store[key]),
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null
  }
}

// Network mocking
export const mockFetch = (responses: Record<string, any>) => {
  const originalFetch = global.fetch
  
  global.fetch = jest.fn((url: string) => {
    const response = responses[url]
    if (response) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response))
      } as Response)
    }
    return Promise.reject(new Error(`No mock response for ${url}`))
  })
  
  return () => { global.fetch = originalFetch }
}

// Type definitions for mocked data
interface Memory {
  id: string
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
  collection_id?: string
  metadata: Record<string, any>
}

interface Collection {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  memory_count: number
}

interface Entity {
  id: string
  name: string
  type: string
  description: string
  connections: string[]
}

interface GraphNode {
  id: string
  label: string
  type: string
  size: number
  color: string
  x: number
  y: number
}

interface GraphEdge {
  id: string
  source: string
  target: string
  weight: number
  type: string
}