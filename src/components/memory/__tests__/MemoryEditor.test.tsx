import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryEditor } from '../MemoryEditor';
import { Memory } from '../../../types';

// Mock the memory store
const mockUpdateMemory = jest.fn();
const mockCreateMemory = jest.fn();
const mockMemoryStore = {
  updateMemory: mockUpdateMemory,
  createMemory: mockCreateMemory,
  isLoading: false,
  error: null,
};

jest.mock('../../../stores/memoryStore', () => ({
  useMemoryStore: () => mockMemoryStore,
}));

// Mock the markdown editor
jest.mock('@uiw/react-md-editor', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, ...props }: any) => (
      <textarea
        data-testid="markdown-editor"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    ),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockMemory: Memory = {
  id: '1',
  title: 'Test Memory',
  content: '# Test Content\n\nThis is a test memory.',
  preview: 'This is a test memory.',
  tags: ['test', 'example'],
  collection: 'Test Collection',
  entities: [],
  metadata: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('MemoryEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMemoryStore.isLoading = false;
    mockMemoryStore.error = null;
  });

  it('renders in create mode', () => {
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText(/memory title/i)).toBeInTheDocument();
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create memory/i })).toBeInTheDocument();
  });

  it('renders in edit mode with existing memory', () => {
    render(
      <TestWrapper>
        <MemoryEditor mode="edit" memory={mockMemory} />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Test Memory')).toBeInTheDocument();
    expect(screen.getByDisplayValue('# Test Content\n\nThis is a test memory.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update memory/i })).toBeInTheDocument();
  });

  it('handles title input', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText(/memory title/i);
    await user.type(titleInput, 'New Memory Title');

    expect(titleInput).toHaveValue('New Memory Title');
  });

  it('handles content input', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const contentEditor = screen.getByTestId('markdown-editor');
    await user.type(contentEditor, '# New Content\n\nThis is new content.');

    expect(contentEditor).toHaveValue('# New Content\n\nThis is new content.');
  });

  it('handles tags input', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const tagsInput = screen.getByPlaceholderText(/add tags/i);
    await user.type(tagsInput, 'tag1, tag2, tag3');

    expect(tagsInput).toHaveValue('tag1, tag2, tag3');
  });

  it('handles collection selection', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const collectionSelect = screen.getByRole('combobox', { name: /collection/i });
    await user.selectOptions(collectionSelect, 'Work');

    expect(collectionSelect).toHaveValue('Work');
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create memory/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });

    expect(mockCreateMemory).not.toHaveBeenCalled();
  });

  it('creates new memory with valid data', async () => {
    const user = userEvent.setup();
    mockCreateMemory.mockResolvedValue({ success: true });

    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText(/memory title/i);
    const contentEditor = screen.getByTestId('markdown-editor');
    const tagsInput = screen.getByPlaceholderText(/add tags/i);
    const submitButton = screen.getByRole('button', { name: /create memory/i });

    await user.type(titleInput, 'New Memory');
    await user.type(contentEditor, '# New Content');
    await user.type(tagsInput, 'test, new');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateMemory).toHaveBeenCalledWith({
        title: 'New Memory',
        content: '# New Content',
        tags: ['test', 'new'],
        collection: undefined,
        metadata: {},
      });
    });
  });

  it('updates existing memory', async () => {
    const user = userEvent.setup();
    mockUpdateMemory.mockResolvedValue({ success: true });

    render(
      <TestWrapper>
        <MemoryEditor mode="edit" memory={mockMemory} />
      </TestWrapper>
    );

    const titleInput = screen.getByDisplayValue('Test Memory');
    const submitButton = screen.getByRole('button', { name: /update memory/i });

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Memory');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateMemory).toHaveBeenCalledWith('1', {
        title: 'Updated Memory',
        content: '# Test Content\n\nThis is a test memory.',
        tags: ['test', 'example'],
        collection: 'Test Collection',
        metadata: {},
      });
    });
  });

  it('shows loading state during submission', async () => {
    mockMemoryStore.isLoading = true;

    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /creating/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays error message', () => {
    mockMemoryStore.error = 'Failed to save memory';

    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    expect(screen.getByText(/failed to save memory/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('handles cancel action', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <TestWrapper>
        <MemoryEditor mode="create" onCancel={onCancel} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows preview mode', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const previewTab = screen.getByRole('button', { name: /preview/i });
    await user.click(previewTab);

    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('handles auto-save in edit mode', async () => {
    const user = userEvent.setup();
    jest.useFakeTimers();

    render(
      <TestWrapper>
        <MemoryEditor mode="edit" memory={mockMemory} autoSave />
      </TestWrapper>
    );

    const titleInput = screen.getByDisplayValue('Test Memory');
    await user.type(titleInput, ' Updated');

    // Fast-forward time to trigger auto-save
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockUpdateMemory).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('parses tags correctly', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const tagsInput = screen.getByPlaceholderText(/add tags/i);
    
    // Test different tag formats
    await user.type(tagsInput, 'tag1, tag2 ; tag3,tag4');

    const titleInput = screen.getByPlaceholderText(/memory title/i);
    const contentEditor = screen.getByTestId('markdown-editor');
    const submitButton = screen.getByRole('button', { name: /create memory/i });

    await user.type(titleInput, 'Test');
    await user.type(contentEditor, 'Content');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3', 'tag4'],
        })
      );
    });
  });

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MemoryEditor mode="create" />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText(/memory title/i);
    const contentEditor = screen.getByTestId('markdown-editor');

    await user.type(titleInput, 'Test');
    await user.type(contentEditor, 'Content');

    // Test Ctrl+S for save
    await user.keyboard('{Control>}s{/Control}');

    await waitFor(() => {
      expect(mockCreateMemory).toHaveBeenCalled();
    });
  });

  it('warns about unsaved changes', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <TestWrapper>
        <MemoryEditor mode="create" onCancel={onCancel} />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText(/memory title/i);
    await user.type(titleInput, 'Unsaved changes');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should show confirmation dialog
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
  });
});