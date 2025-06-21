# Component Architecture Documentation

## Overview

This document provides a comprehensive guide to the component architecture of the Knowledge RAG WebUI, including component hierarchies, data flow patterns, state management strategies, and development guidelines.

## 🏗️ Architecture Principles

### 1. **Component Composition**
- Favor composition over inheritance
- Build complex UI from simple, reusable components
- Use compound components for related functionality

### 2. **Unidirectional Data Flow**
- Props flow down from parent to child components
- Events bubble up through callback functions
- State management centralized where appropriate

### 3. **Separation of Concerns**
- Presentation components handle UI rendering
- Container components manage state and business logic
- Custom hooks abstract reusable logic

### 4. **Performance Optimization**
- Lazy loading for non-critical components
- Memoization for expensive computations
- Efficient re-rendering strategies

## 📊 Component Hierarchy

### Application Structure

```
App.tsx
├── ThemeProvider (Context)
├── Layout.tsx
│   ├── Header
│   │   ├── Navigation
│   │   ├── SearchBar (Global)
│   │   └── UserMenu
│   ├── Main Content Area
│   │   └── Router Outlet
│   │       ├── Memories Page
│   │       ├── Search Page
│   │       ├── Memory Detail Page
│   │       └── Settings Page
│   └── Footer
└── Global Components
    ├── ToastNotifications
    ├── ModalContainer
    └── ErrorBoundary
```

### Page-Level Components

#### 1. Memories Page (`/memories`)
```
Memories.tsx
├── MemoriesHeader
│   ├── PageTitle
│   ├── CreateMemoryButton
│   └── ViewModeToggle
├── MemoriesFilters
│   ├── SearchInput
│   ├── TagFilters
│   └── SortOptions
├── BulkOperations (Conditional)
│   ├── BulkSelectionHeader
│   ├── BulkSelectionToolbar
│   └── BulkActionModals
├── MemoriesContent
│   ├── GridView / ListView Toggle
│   ├── MemoryCard[] / MemoryListItem[]
│   └── LoadingStates / EmptyStates
└── MobileFloatingActionButton
```

#### 2. Search Page (`/search`)
```
Search.tsx
├── SearchHeader
│   ├── SearchInput (Enhanced)
│   └── SearchMetrics
├── SearchLayout
│   ├── SearchSidebar
│   │   ├── SearchFilters
│   │   ├── SearchStats
│   │   └── SavedSearches
│   └── SearchResults
│       ├── ResultsList
│       ├── SearchResultCard[]
│       └── Pagination
└── SearchStates
    ├── EmptyState
    ├── NoResultsState
    └── LoadingState
```

#### 3. Memory Detail Page (`/memories/:id`)
```
MemoryDetail.tsx
├── MemoryHeader
│   ├── BackButton
│   ├── MemoryTitle
│   └── ActionMenu
├── MemoryContent
│   ├── MarkdownContent / TextContent
│   ├── EntityList
│   └── TagList
├── MemorySidebar
│   ├── MemoryMetadata
│   ├── CollectionInfo
│   └── RelatedMemories
└── MemoryActions
    ├── EditButton
    ├── ShareButton
    └── DeleteButton
```

#### 4. Settings Page (`/settings`)
```
Settings.tsx
├── SettingsNavigation
│   └── TabList
├── SettingsContent
│   ├── ProfileSettings
│   ├── PreferencesSettings
│   ├── PrivacySettings
│   ├── NotificationSettings
│   ├── ApiKeysSettings
│   └── DataExportSettings
└── SettingsActions
    ├── SaveButton
    └── ResetButton
```

## 🧩 Component Categories

### 1. Layout Components

#### Layout.tsx
```tsx
interface LayoutProps {
  children: React.ReactNode;
}

// Provides consistent page structure
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
```

**Responsibilities:**
- Overall page structure and layout
- Global navigation and branding
- Theme context and dark mode support
- Responsive breakpoint handling

### 2. Feature Components

#### Memory Components

##### MemoryCard.tsx
```tsx
interface MemoryCardProps {
  memory: Memory;
  variant?: 'default' | 'compact' | 'detailed';
  onSelect?: (memoryId: string) => void;
  isSelected?: boolean;
}

// Displays memory information in card format
const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  variant = 'default',
  onSelect,
  isSelected = false
}) => {
  // Component implementation
};
```

**Features:**
- Multiple display variants
- Selection state management
- Touch-optimized interactions
- Accessibility support

##### BulkSelectionToolbar.tsx
```tsx
interface BulkSelectionToolbarProps {
  selectedCount: number;
  selectedMemories: Memory[];
  onClearSelection: () => void;
  onBulkDelete: (memoryIds: string[]) => Promise<void>;
  onBulkExport: (memoryIds: string[], format: ExportFormat) => void;
  onBulkMoveToCollection: (memoryIds: string[], collectionId: string) => Promise<void>;
  onBulkAddTags: (memoryIds: string[], tags: string[]) => Promise<void>;
}

// Handles bulk operations on selected memories
const BulkSelectionToolbar: React.FC<BulkSelectionToolbarProps> = (props) => {
  // Component implementation with state management for modals and actions
};
```

**Features:**
- Multiple bulk operations
- Confirmation modals
- Loading states
- Progress feedback

#### Search Components

##### SearchResultCard.tsx
```tsx
interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  onSelect: (result: SearchResult) => void;
  showRelevanceScore?: boolean;
}

// Displays search result with highlighting
const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  query,
  onSelect,
  showRelevanceScore = true
}) => {
  // Implement search term highlighting and relevance display
};
```

**Features:**
- Search term highlighting
- Relevance score display
- Snippet extraction
- Quick actions

### 3. UI Components

#### Button Component System
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

// Reusable button component with variants
const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  loading = false,
  disabled = false,
  children,
  onClick,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
    xl: 'px-6 py-3 text-base'
  };
  
  // Component implementation
};
```

#### Modal Component System
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Accessible modal component with focus management
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer
}) => {
  // Implementation with focus trapping, escape key handling, and backdrop click
};
```

### 4. Mobile Components

#### MobileFloatingActionButton.tsx
```tsx
interface MobileFloatingActionButtonProps {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Mobile-specific floating action button
const MobileFloatingActionButton: React.FC<MobileFloatingActionButtonProps> = ({
  to,
  label,
  icon: Icon = Plus
}) => {
  const { isMobile } = useResponsive();
  
  if (!isMobile) return null;
  
  return (
    <Link
      to={to}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
    </Link>
  );
};
```

## 🔄 State Management Patterns

### 1. Local Component State
```tsx
// Simple component state for UI interactions
const [isOpen, setIsOpen] = useState(false);
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [formData, setFormData] = useState(initialFormData);
```

### 2. Custom Hooks for Logic Abstraction
```tsx
// useBulkSelection.ts - Reusable selection logic
export function useBulkSelection(allItemIds: string[]) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const isAllSelected = selectedItems.length === allItemIds.length && allItemIds.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < allItemIds.length;
  
  const toggleItem = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);
  
  const toggleAll = useCallback(() => {
    setSelectedItems(isAllSelected ? [] : [...allItemIds]);
  }, [allItemIds, isAllSelected]);
  
  return {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    selectAll: () => setSelectedItems([...allItemIds]),
    clearSelection: () => setSelectedItems([]),
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length
  };
}
```

### 3. Context for Global State
```tsx
// ThemeContext.tsx - Global theme management
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as any) || 'system';
  });
  
  const effectiveTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);
  
  // Implementation with system preference detection and persistence
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## 📡 Data Flow Patterns

### 1. Props Down, Events Up
```tsx
// Parent component manages state
const MemoriesPage: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  
  const handleMemorySelect = (memoryId: string) => {
    setSelectedMemories(prev => 
      prev.includes(memoryId) 
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    );
  };
  
  return (
    <div>
      {memories.map(memory => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          isSelected={selectedMemories.includes(memory.id)}
          onSelect={handleMemorySelect}
        />
      ))}
    </div>
  );
};
```

### 2. Compound Components
```tsx
// BulkOperations compound component pattern
const BulkOperations = ({ children }: { children: React.ReactNode }) => {
  return <div className="bulk-operations">{children}</div>;
};

BulkOperations.Header = BulkSelectionHeader;
BulkOperations.Toolbar = BulkSelectionToolbar;
BulkOperations.Content = ({ children }: { children: React.ReactNode }) => (
  <div className="bulk-content">{children}</div>
);

// Usage
<BulkOperations>
  <BulkOperations.Header 
    selectedCount={selectedCount}
    onToggleAll={toggleAll}
  />
  <BulkOperations.Toolbar
    selectedMemories={selectedMemories}
    onBulkDelete={handleBulkDelete}
  />
  <BulkOperations.Content>
    {/* Memory cards with selection */}
  </BulkOperations.Content>
</BulkOperations>
```

### 3. Render Props Pattern
```tsx
// SearchProvider with render props
interface SearchProviderProps {
  children: (props: SearchState) => React.ReactNode;
}

const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search logic implementation
  
  return children({
    query,
    setQuery,
    results,
    loading,
    error,
    search: performSearch
  });
};

// Usage
<SearchProvider>
  {({ query, setQuery, results, loading, error, search }) => (
    <div>
      <SearchInput value={query} onChange={setQuery} onSearch={search} />
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      <SearchResults results={results} />
    </div>
  )}
</SearchProvider>
```

## 🎨 Styling Architecture

### 1. Tailwind CSS Integration
```tsx
// Component with Tailwind classes
const MemoryCard: React.FC<MemoryCardProps> = ({ memory, isSelected }) => {
  return (
    <article className={`
      bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md
      transition-all duration-200 overflow-hidden
      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
    `}>
      {/* Card content */}
    </article>
  );
};
```

### 2. CSS Modules for Complex Styles
```css
/* MemoryCard.module.css */
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm;
  transition: all 0.2s ease-in-out;
}

.card:hover {
  @apply shadow-md;
  transform: translateY(-1px);
}

.cardSelected {
  @apply ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20;
}
```

### 3. Styled Components with CSS-in-JS
```tsx
import styled from 'styled-components';

const StyledMemoryCard = styled.article<{ isSelected: boolean }>`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  
  ${props => props.isSelected && `
    border: 2px solid ${props.theme.colors.primary};
    background: ${props.theme.colors.selectedBackground};
  `}
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;
```

## 🧪 Testing Architecture

### 1. Component Testing Strategy
```tsx
// MemoryCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryCard } from './MemoryCard';

describe('MemoryCard', () => {
  const mockMemory: Memory = {
    id: '1',
    title: 'Test Memory',
    content: 'Test content',
    // ... other properties
  };
  
  it('renders memory information correctly', () => {
    render(<MemoryCard memory={mockMemory} />);
    
    expect(screen.getByText('Test Memory')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('handles selection state correctly', () => {
    const onSelect = jest.fn();
    
    render(
      <MemoryCard 
        memory={mockMemory} 
        isSelected={false}
        onSelect={onSelect}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### 2. Hook Testing
```tsx
// useBulkSelection.test.ts
import { renderHook, act } from '@testing-library/react';
import { useBulkSelection } from './useBulkSelection';

describe('useBulkSelection', () => {
  const itemIds = ['1', '2', '3'];
  
  it('initializes with empty selection', () => {
    const { result } = renderHook(() => useBulkSelection(itemIds));
    
    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.selectionCount).toBe(0);
  });
  
  it('toggles item selection correctly', () => {
    const { result } = renderHook(() => useBulkSelection(itemIds));
    
    act(() => {
      result.current.toggleItem('1');
    });
    
    expect(result.current.selectedItems).toEqual(['1']);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.selectionCount).toBe(1);
  });
});
```

### 3. Integration Testing
```tsx
// BulkOperations.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulkOperationsPage } from './BulkOperationsPage';

describe('Bulk Operations Integration', () => {
  it('completes full bulk delete workflow', async () => {
    const mockMemories = [/* mock data */];
    const onDelete = jest.fn();
    
    render(
      <BulkOperationsPage 
        memories={mockMemories}
        onBulkDelete={onDelete}
      />
    );
    
    // Enter bulk mode
    fireEvent.click(screen.getByText('Select'));
    
    // Select memories
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    
    // Initiate delete
    fireEvent.click(screen.getByText('Delete'));
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Delete', { selector: '[data-testid="confirm-delete"]' }));
    
    // Verify API call
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(['1', '2']);
    });
  });
});
```

## 📈 Performance Optimization

### 1. Code Splitting
```tsx
// Lazy loading for non-critical components
const MemoryDetail = lazy(() => import('./pages/MemoryDetail'));
const Settings = lazy(() => import('./pages/Settings'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/memories/:id" element={<MemoryDetail />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
```

### 2. Memoization
```tsx
// React.memo for expensive components
const MemoryCard = React.memo<MemoryCardProps>(({ memory, isSelected, onSelect }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.memory.id === nextProps.memory.id &&
    prevProps.isSelected === nextProps.isSelected
  );
});

// useMemo for expensive calculations
const sortedAndFilteredMemories = useMemo(() => {
  return memories
    .filter(memory => memory.title.includes(searchQuery))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}, [memories, searchQuery]);

// useCallback for stable function references
const handleMemorySelect = useCallback((memoryId: string) => {
  setSelectedMemories(prev => 
    prev.includes(memoryId) 
      ? prev.filter(id => id !== memoryId)
      : [...prev, memoryId]
  );
}, []);
```

### 3. Virtual Scrolling
```tsx
// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedMemoryList: React.FC<{ memories: Memory[] }> = ({ memories }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <MemoryCard memory={memories[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={memories.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## 🔧 Development Guidelines

### 1. Component Creation Checklist
- [ ] Define clear TypeScript interfaces
- [ ] Implement accessibility features (ARIA labels, keyboard navigation)
- [ ] Add proper error boundaries
- [ ] Include loading and empty states
- [ ] Write unit tests
- [ ] Document props and usage examples
- [ ] Ensure mobile responsiveness
- [ ] Optimize for performance

### 2. Code Quality Standards
```tsx
// Good: Clear prop interfaces
interface MemoryCardProps {
  memory: Memory;
  variant?: 'default' | 'compact';
  isSelected?: boolean;
  onSelect?: (memoryId: string) => void;
  className?: string;
}

// Good: Default props with TypeScript
const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  variant = 'default',
  isSelected = false,
  onSelect,
  className = ''
}) => {
  // Implementation
};

// Good: Custom hooks for reusable logic
const useMemoryActions = (memory: Memory) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const deleteMemory = useCallback(async () => {
    setIsDeleting(true);
    try {
      await api.deleteMemory(memory.id);
    } finally {
      setIsDeleting(false);
    }
  }, [memory.id]);
  
  return { deleteMemory, isDeleting };
};
```

### 3. Accessibility Guidelines
```tsx
// ARIA labels and roles
<button
  role="button"
  aria-label={`Select memory: ${memory.title}`}
  aria-pressed={isSelected}
  onClick={() => onSelect(memory.id)}
>
  <Checkbox checked={isSelected} />
</button>

// Screen reader announcements
<div aria-live="polite" className="sr-only">
  {selectedCount} memories selected
</div>

// Keyboard navigation
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onSelect(memory.id);
  }
};
```

This component architecture provides a solid foundation for building scalable, maintainable, and accessible React applications with the Knowledge RAG WebUI.