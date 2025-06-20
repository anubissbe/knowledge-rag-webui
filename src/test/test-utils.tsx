import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Memory, Collection, Entity } from '../types';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data factories
export const createMockMemory = (overrides: Partial<Memory> = {}): Memory => ({
  id: '1',
  title: 'Test Memory',
  content: '# Test Content\n\nThis is test content.',
  preview: 'This is test content.',
  tags: ['test', 'mock'],
  collection: 'Test Collection',
  entities: [],
  metadata: {
    source: 'manual',
    wordCount: 100,
    readingTime: 1,
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCollection = (overrides: Partial<Collection> = {}): Collection => ({
  id: '1',
  name: 'Test Collection',
  description: 'A test collection',
  memory_count: 5,
  color: '#3b82f6',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockEntity = (overrides: Partial<Entity> = {}): Entity => ({
  id: '1',
  name: 'Test Entity',
  type: 'Person',
  properties: {
    description: 'A test entity',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock store state helpers
export const createMockMemoryStore = (overrides = {}) => ({
  memories: [createMockMemory()],
  selectedMemories: new Set<string>(),
  searchQuery: '',
  filters: { collection: '', tags: [] },
  isLoading: false,
  error: null,
  currentMemory: null,
  
  // Actions
  fetchMemories: jest.fn(),
  createMemory: jest.fn(),
  updateMemory: jest.fn(),
  deleteMemory: jest.fn(),
  bulkDelete: jest.fn(),
  searchMemories: jest.fn(),
  selectMemory: jest.fn(),
  clearSelection: jest.fn(),
  setSearchQuery: jest.fn(),
  setFilters: jest.fn(),
  setCurrentMemory: jest.fn(),
  
  ...overrides,
});

export const createMockAuthStore = (overrides = {}) => ({
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  
  // Actions
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  updateProfile: jest.fn(),
  refreshUser: jest.fn(),
  
  ...overrides,
});

export const createMockGraphStore = (overrides = {}) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  layout: 'force' as const,
  filters: {
    nodeTypes: [],
    edgeTypes: [],
    minConnections: 0,
    maxDepth: 3,
  },
  isLoading: false,
  error: null,
  
  // Actions
  fetchGraph: jest.fn(),
  setLayout: jest.fn(),
  setFilters: jest.fn(),
  selectNode: jest.fn(),
  clearSelection: jest.fn(),
  
  ...overrides,
});

// Mock API responses
export const mockApiResponses = {
  memories: {
    list: {
      data: [createMockMemory()],
      total: 1,
      page: 1,
      limit: 20,
    },
    create: createMockMemory(),
    update: createMockMemory(),
    delete: { success: true },
  },
  
  collections: {
    list: [createMockCollection()],
    create: createMockCollection(),
    update: createMockCollection(),
    delete: { success: true },
  },
  
  search: {
    memories: [createMockMemory()],
    suggestions: ['test', 'example', 'mock'],
  },
  
  graph: {
    nodes: [],
    edges: [],
  },
  
  auth: {
    login: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    },
    register: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
    },
  },
};

// Mock localStorage
export const mockLocalStorage = () => {
  let store: Record<string, string> = {};

  const mockStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });

  return mockStorage;
};

// Mock sessionStorage
export const mockSessionStorage = () => {
  let store: Record<string, string> = {};

  const mockStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: mockStorage,
    writable: true,
  });

  return mockStorage;
};

// Mock WebSocket
export const mockWebSocket = () => {
  const mockWS = {
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    readyState: WebSocket.OPEN,
    CONNECTING: WebSocket.CONNECTING,
    OPEN: WebSocket.OPEN,
    CLOSING: WebSocket.CLOSING,
    CLOSED: WebSocket.CLOSED,
  };

  global.WebSocket = jest.fn(() => mockWS) as any;
  return mockWS;
};

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };

  global.IntersectionObserver = jest.fn(() => mockObserver) as any;
  return mockObserver;
};

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };

  global.ResizeObserver = jest.fn(() => mockObserver) as any;
  return mockObserver;
};

// Wait for async operations
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Custom matchers
export const customMatchers = {
  toBeLoading: (received: HTMLElement) => {
    const isLoading = received.getAttribute('aria-busy') === 'true' ||
                     received.querySelector('[data-testid="loading-spinner"]') !== null;
    
    return {
      message: () => `Expected element ${isLoading ? 'not ' : ''}to be loading`,
      pass: isLoading,
    };
  },
  
  toHaveErrorMessage: (received: HTMLElement, expectedMessage?: string) => {
    const errorElement = received.querySelector('[role="alert"], [data-testid="error-message"]');
    const hasError = errorElement !== null;
    const messageMatches = expectedMessage ? 
      errorElement?.textContent?.includes(expectedMessage) : true;
    
    return {
      message: () => `Expected element ${hasError ? 'not ' : ''}to have error message${expectedMessage ? ` "${expectedMessage}"` : ''}`,
      pass: hasError && messageMatches,
    };
  },
};

// Test IDs constants
export const TEST_IDS = {
  // Layout
  HEADER: 'header',
  SIDEBAR: 'sidebar',
  MAIN_CONTENT: 'main-content',
  
  // Memory components
  MEMORY_CARD: 'memory-card',
  MEMORY_LIST: 'memory-list',
  MEMORY_EDITOR: 'memory-editor',
  MEMORY_DETAIL: 'memory-detail',
  
  // Buttons
  NEW_MEMORY_BUTTON: 'new-memory-button',
  EDIT_BUTTON: 'edit-button',
  DELETE_BUTTON: 'delete-button',
  SAVE_BUTTON: 'save-button',
  CANCEL_BUTTON: 'cancel-button',
  
  // Forms
  SEARCH_INPUT: 'search-input',
  TITLE_INPUT: 'title-input',
  CONTENT_EDITOR: 'content-editor',
  TAGS_INPUT: 'tags-input',
  
  // Loading and messages
  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  SUCCESS_MESSAGE: 'success-message',
  
  // Graph
  GRAPH_CONTAINER: 'graph-container',
  GRAPH_CONTROLS: 'graph-controls',
  GRAPH_SIDEBAR: 'graph-sidebar',
} as const;

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
export { userEvent } from '@testing-library/user-event';