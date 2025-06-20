import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MemoriesPage } from '../../pages/MemoriesPage';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { Memory } from '../../types';

// Mock API services
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../services/api', () => ({
  apiClient: mockApiClient,
}));

// Mock memory store with real-like behavior
const mockMemories: Memory[] = [
  {
    id: '1',
    title: 'React Hooks Guide',
    content: '# React Hooks\n\nA comprehensive guide to React Hooks.',
    preview: 'A comprehensive guide to React Hooks.',
    tags: ['react', 'hooks', 'javascript'],
    collection: 'Development',
    entities: [],
    metadata: { source: 'manual' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    content: '# TypeScript\n\nBest practices for TypeScript development.',
    preview: 'Best practices for TypeScript development.',
    tags: ['typescript', 'javascript', 'development'],
    collection: 'Development',
    entities: [],
    metadata: { source: 'manual' },
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const mockMemoryStore = {
  memories: mockMemories,
  selectedMemories: new Set<string>(),
  searchQuery: '',
  filters: { collection: '', tags: [] },
  isLoading: false,
  error: null,
  
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
};

jest.mock('../../stores/memoryStore', () => ({
  useMemoryStore: () => mockMemoryStore,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

describe('Memory Management Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMemoryStore.memories = mockMemories;
    mockMemoryStore.selectedMemories = new Set();
    mockMemoryStore.searchQuery = '';
    mockMemoryStore.isLoading = false;
    mockMemoryStore.error = null;
  });

  it('displays list of memories on page load', async () => {
    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('React Hooks Guide')).toBeInTheDocument();
      expect(screen.getByText('TypeScript Best Practices')).toBeInTheDocument();
    });

    expect(mockMemoryStore.fetchMemories).toHaveBeenCalled();
  });

  it('searches memories and filters results', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search memories/i);
    await user.type(searchInput, 'React');

    await waitFor(() => {
      expect(mockMemoryStore.setSearchQuery).toHaveBeenCalledWith('React');
    });

    // Simulate filtered results
    mockMemoryStore.memories = [mockMemories[0]]; // Only React memory
    
    expect(screen.getByText('React Hooks Guide')).toBeInTheDocument();
    expect(screen.queryByText('TypeScript Best Practices')).not.toBeInTheDocument();
  });

  it('creates new memory through the full flow', async () => {
    const user = userEvent.setup();
    mockMemoryStore.createMemory.mockResolvedValue({ id: '3', ...mockMemories[0] });

    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    // Click new memory button
    const newMemoryButton = screen.getByRole('button', { name: /new memory/i });
    await user.click(newMemoryButton);

    // Fill out the form
    const titleInput = screen.getByPlaceholderText(/memory title/i);
    const contentEditor = screen.getByTestId('markdown-editor');
    const tagsInput = screen.getByPlaceholderText(/add tags/i);

    await user.type(titleInput, 'New Test Memory');
    await user.type(contentEditor, '# New Memory\n\nThis is a new memory.');
    await user.type(tagsInput, 'test, new');

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create memory/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockMemoryStore.createMemory).toHaveBeenCalledWith({
        title: 'New Test Memory',
        content: '# New Memory\n\nThis is a new memory.',
        tags: ['test', 'new'],
        collection: undefined,
        metadata: {},
      });
    });
  });

  it('edits existing memory', async () => {
    const user = userEvent.setup();
    mockMemoryStore.updateMemory.mockResolvedValue({ success: true });

    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    // Click edit button on first memory
    const editButtons = screen.getAllByTestId('edit-memory-button');
    await user.click(editButtons[0]);

    // Edit the title
    const titleInput = screen.getByDisplayValue('React Hooks Guide');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated React Hooks Guide');

    // Save changes
    const updateButton = screen.getByRole('button', { name: /update memory/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockMemoryStore.updateMemory).toHaveBeenCalledWith('1', 
        expect.objectContaining({
          title: 'Updated React Hooks Guide',
        })
      );
    });
  });

  it('bulk selects and deletes memories', async () => {
    const user = userEvent.setup();
    mockMemoryStore.bulkDelete.mockResolvedValue({ success: true });

    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    // Enable bulk selection mode
    const bulkSelectButton = screen.getByRole('button', { name: /bulk select/i });
    await user.click(bulkSelectButton);

    // Select memories
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await waitFor(() => {
      expect(mockMemoryStore.selectMemory).toHaveBeenCalledWith('1');
      expect(mockMemoryStore.selectMemory).toHaveBeenCalledWith('2');
    });

    // Delete selected memories
    const deleteButton = screen.getByRole('button', { name: /delete selected/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockMemoryStore.bulkDelete).toHaveBeenCalledWith(['1', '2']);
    });
  });

  it('filters by collection', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    // Select collection filter
    const collectionSelect = screen.getByRole('combobox', { name: /collection/i });
    await user.selectOptions(collectionSelect, 'Development');

    await waitFor(() => {
      expect(mockMemoryStore.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'Development',
        })
      );
    });
  });

  it('filters by tags', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    // Select tag filters
    const reactTagFilter = screen.getByRole('checkbox', { name: /react/i });
    await user.click(reactTagFilter);

    await waitFor(() => {
      expect(mockMemoryStore.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['react'],
        })
      );
    });
  });

  it('handles error states gracefully', async () => {
    mockMemoryStore.error = 'Failed to load memories';
    mockMemoryStore.isLoading = false;

    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    expect(screen.getByText(/failed to load memories/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows loading states', async () => {
    mockMemoryStore.isLoading = true;
    mockMemoryStore.memories = [];

    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText(/loading memories/i)).toBeInTheDocument();
  });

  it('handles empty state', async () => {
    mockMemoryStore.memories = [];
    mockMemoryStore.isLoading = false;

    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    expect(screen.getByText(/no memories found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your first memory/i })).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search memories/i);
    
    // Tab to search input
    await user.tab();
    expect(searchInput).toHaveFocus();

    // Tab to first memory card
    await user.tab();
    const firstMemoryCard = screen.getAllByTestId('memory-card')[0];
    expect(firstMemoryCard).toHaveFocus();

    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    const secondMemoryCard = screen.getAllByTestId('memory-card')[1];
    expect(secondMemoryCard).toHaveFocus();
  });

  it('maintains scroll position after actions', async () => {
    const user = userEvent.setup();
    
    // Mock scroll position
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    
    render(
      <TestWrapper>
        <MemoriesPage />
      </TestWrapper>
    );

    // Perform an action that might affect scroll
    const editButtons = screen.getAllByTestId('edit-memory-button');
    await user.click(editButtons[0]);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Scroll position should be maintained
    expect(window.scrollY).toBe(500);
  });
});