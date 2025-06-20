import { renderHook, act } from '@testing-library/react';
import { useMemoryEditor } from '../useMemoryEditor';
import { createMockMemory } from '../../test/test-utils';

// Mock the memory store
const mockUpdateMemory = jest.fn();
const mockCreateMemory = jest.fn();

jest.mock('../../stores/memoryStore', () => ({
  useMemoryStore: () => ({
    updateMemory: mockUpdateMemory,
    createMemory: mockCreateMemory,
    isLoading: false,
    error: null,
  }),
}));

// Mock debounce
jest.mock('lodash.debounce', () => (fn: Function) => {
  const debounced = (...args: any[]) => fn(...args);
  debounced.cancel = jest.fn();
  return debounced;
});

describe('useMemoryEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with empty state for create mode', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    expect(result.current.formData).toEqual({
      title: '',
      content: '',
      tags: [],
      collection: '',
      metadata: {},
    });
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('initializes with memory data for edit mode', () => {
    const mockMemory = createMockMemory({
      title: 'Test Memory',
      content: '# Test Content',
      tags: ['test', 'memory'],
      collection: 'Test Collection',
    });

    const { result } = renderHook(() => 
      useMemoryEditor({ mode: 'edit', memory: mockMemory })
    );

    expect(result.current.formData.title).toBe('Test Memory');
    expect(result.current.formData.content).toBe('# Test Content');
    expect(result.current.formData.tags).toEqual(['test', 'memory']);
    expect(result.current.formData.collection).toBe('Test Collection');
    expect(result.current.isDirty).toBe(false);
  });

  it('updates form data and marks as dirty', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    act(() => {
      result.current.updateField('title', 'New Title');
    });

    expect(result.current.formData.title).toBe('New Title');
    expect(result.current.isDirty).toBe(true);
  });

  it('validates required fields', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    // Initially invalid (empty title and content)
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.title).toBe('Title is required');
    expect(result.current.errors.content).toBe('Content is required');

    // Add title
    act(() => {
      result.current.updateField('title', 'Test Title');
    });

    expect(result.current.errors.title).toBeUndefined();
    expect(result.current.isValid).toBe(false); // Still invalid due to content

    // Add content
    act(() => {
      result.current.updateField('content', 'Test content');
    });

    expect(result.current.errors.content).toBeUndefined();
    expect(result.current.isValid).toBe(true);
  });

  it('validates title length', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    // Too short
    act(() => {
      result.current.updateField('title', 'A');
    });

    expect(result.current.errors.title).toBe('Title must be at least 2 characters');

    // Too long
    act(() => {
      result.current.updateField('title', 'A'.repeat(201));
    });

    expect(result.current.errors.title).toBe('Title cannot exceed 200 characters');

    // Valid length
    act(() => {
      result.current.updateField('title', 'Valid Title');
    });

    expect(result.current.errors.title).toBeUndefined();
  });

  it('validates content length', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    // Too short
    act(() => {
      result.current.updateField('content', 'A');
    });

    expect(result.current.errors.content).toBe('Content must be at least 10 characters');

    // Valid content
    act(() => {
      result.current.updateField('content', 'Valid content that is long enough');
    });

    expect(result.current.errors.content).toBeUndefined();
  });

  it('handles tags as array and string', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    // Update with array
    act(() => {
      result.current.updateField('tags', ['tag1', 'tag2']);
    });

    expect(result.current.formData.tags).toEqual(['tag1', 'tag2']);

    // Update with string
    act(() => {
      result.current.updateField('tags', 'tag3, tag4, tag5');
    });

    expect(result.current.formData.tags).toEqual(['tag3', 'tag4', 'tag5']);
  });

  it('saves memory in create mode', async () => {
    mockCreateMemory.mockResolvedValue({ id: '123', success: true });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => 
      useMemoryEditor({ mode: 'create', onSuccess })
    );

    // Set valid data
    act(() => {
      result.current.updateField('title', 'Test Memory');
      result.current.updateField('content', 'Test content that is long enough');
    });

    // Save
    await act(async () => {
      await result.current.save();
    });

    expect(mockCreateMemory).toHaveBeenCalledWith({
      title: 'Test Memory',
      content: 'Test content that is long enough',
      tags: [],
      collection: '',
      metadata: {},
    });
    expect(onSuccess).toHaveBeenCalledWith({ id: '123', success: true });
    expect(result.current.isDirty).toBe(false);
  });

  it('saves memory in edit mode', async () => {
    const mockMemory = createMockMemory({ id: '123' });
    mockUpdateMemory.mockResolvedValue({ success: true });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => 
      useMemoryEditor({ mode: 'edit', memory: mockMemory, onSuccess })
    );

    // Update title
    act(() => {
      result.current.updateField('title', 'Updated Title');
    });

    // Save
    await act(async () => {
      await result.current.save();
    });

    expect(mockUpdateMemory).toHaveBeenCalledWith('123', {
      title: 'Updated Title',
      content: mockMemory.content,
      tags: mockMemory.tags,
      collection: mockMemory.collection,
      metadata: mockMemory.metadata,
    });
    expect(onSuccess).toHaveBeenCalledWith({ success: true });
    expect(result.current.isDirty).toBe(false);
  });

  it('handles save errors', async () => {
    const error = new Error('Save failed');
    mockCreateMemory.mockRejectedValue(error);
    const onError = jest.fn();

    const { result } = renderHook(() => 
      useMemoryEditor({ mode: 'create', onError })
    );

    // Set valid data
    act(() => {
      result.current.updateField('title', 'Test Memory');
      result.current.updateField('content', 'Test content that is long enough');
    });

    // Save
    await act(async () => {
      await result.current.save();
    });

    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.isDirty).toBe(true); // Should remain dirty on error
  });

  it('prevents save when invalid', async () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    // Try to save without valid data
    await act(async () => {
      await result.current.save();
    });

    expect(mockCreateMemory).not.toHaveBeenCalled();
  });

  it('auto-saves when enabled', async () => {
    const mockMemory = createMockMemory({ id: '123' });
    mockUpdateMemory.mockResolvedValue({ success: true });

    const { result } = renderHook(() => 
      useMemoryEditor({ 
        mode: 'edit', 
        memory: mockMemory, 
        autoSave: true,
        autoSaveDelay: 100 
      })
    );

    // Update title
    act(() => {
      result.current.updateField('title', 'Auto-saved Title');
    });

    // Advance timers to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for auto-save
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockUpdateMemory).toHaveBeenCalled();
  });

  it('cancels auto-save when component unmounts', () => {
    const mockMemory = createMockMemory({ id: '123' });
    
    const { result, unmount } = renderHook(() => 
      useMemoryEditor({ 
        mode: 'edit', 
        memory: mockMemory, 
        autoSave: true 
      })
    );

    // Update to trigger auto-save
    act(() => {
      result.current.updateField('title', 'Updated Title');
    });

    // Unmount before auto-save triggers
    unmount();

    // Auto-save should be cancelled
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockUpdateMemory).not.toHaveBeenCalled();
  });

  it('resets form data', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    // Update some fields
    act(() => {
      result.current.updateField('title', 'Test Title');
      result.current.updateField('content', 'Test content');
    });

    expect(result.current.isDirty).toBe(true);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.formData.title).toBe('');
    expect(result.current.formData.content).toBe('');
    expect(result.current.isDirty).toBe(false);
  });

  it('resets to original data in edit mode', () => {
    const mockMemory = createMockMemory({
      title: 'Original Title',
      content: 'Original content',
    });

    const { result } = renderHook(() => 
      useMemoryEditor({ mode: 'edit', memory: mockMemory })
    );

    // Update fields
    act(() => {
      result.current.updateField('title', 'Modified Title');
    });

    expect(result.current.isDirty).toBe(true);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.formData.title).toBe('Original Title');
    expect(result.current.isDirty).toBe(false);
  });

  it('tracks word count and reading time', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    act(() => {
      result.current.updateField('content', 'This is a test content with multiple words to count.');
    });

    expect(result.current.wordCount).toBeGreaterThan(0);
    expect(result.current.readingTime).toBeGreaterThan(0);
  });

  it('generates preview from content', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));

    act(() => {
      result.current.updateField('content', '# Heading\n\nThis is the preview content.');
    });

    expect(result.current.preview).toBe('This is the preview content.');
  });

  it('handles keyboard shortcuts', () => {
    const { result } = renderHook(() => useMemoryEditor({ mode: 'create' }));
    
    // Set valid data
    act(() => {
      result.current.updateField('title', 'Test Memory');
      result.current.updateField('content', 'Test content that is long enough');
    });

    // Simulate Ctrl+S
    const saveShortcut = result.current.keyboardShortcuts.find(
      shortcut => shortcut.key === 'mod+s'
    );

    expect(saveShortcut).toBeDefined();
    expect(typeof saveShortcut?.handler).toBe('function');
  });
});