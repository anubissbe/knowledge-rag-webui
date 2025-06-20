# Component Architecture Documentation

## 🏗️ Architecture Overview

The Knowledge RAG Web UI follows a hierarchical component architecture with clear separation of concerns and reusable design patterns.

## 📁 Directory Structure

```
src/
├── components/
│   ├── common/           # Shared utility components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── WebSocketStatus.tsx
│   ├── ui/              # Base UI primitives
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Dialog.tsx
│   │   └── Tooltip.tsx
│   ├── layout/          # Layout components
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   ├── memory/          # Memory-related components
│   │   ├── MemoryCard.tsx
│   │   ├── MemoryList.tsx
│   │   ├── MemoryEditor.tsx
│   │   ├── MemoryDetail.tsx
│   │   └── BulkOperationsToolbar.tsx
│   ├── search/          # Search functionality
│   │   ├── SearchBar.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchSuggestions.tsx
│   ├── graph/           # Knowledge graph components
│   │   ├── GraphVisualization.tsx
│   │   ├── GraphControls.tsx
│   │   └── GraphSidebar.tsx
│   ├── collections/     # Collection management
│   │   ├── CollectionCard.tsx
│   │   ├── CollectionForm.tsx
│   │   └── CollectionList.tsx
│   ├── analytics/       # Analytics and insights
│   │   ├── AnalyticsCard.tsx
│   │   ├── ChartContainer.tsx
│   │   └── MetricsDisplay.tsx
│   ├── settings/        # Settings and preferences
│   │   ├── AccountSettings.tsx
│   │   ├── MemoryPreferences.tsx
│   │   ├── ApiKeysSection.tsx
│   │   └── LanguageSettings.tsx
│   ├── auth/            # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── accessibility/   # Accessibility components
│   │   ├── AccessibilityComponents.tsx
│   │   └── SkipToMain.tsx
│   ├── performance/     # Performance components
│   │   ├── LazyLoadWrapper.tsx
│   │   └── VirtualizedList.tsx
│   ├── providers/       # Context providers
│   │   ├── WebSocketProvider.tsx
│   │   └── KeyboardShortcutsProvider.tsx
│   └── onboarding/      # User onboarding
│       ├── OnboardingOverlay.tsx
│       └── OnboardingTrigger.tsx
```

## 🧩 Component Hierarchy

### Level 1: Foundation Components

#### Common Components
```typescript
// Button - Primary interaction element
interface ButtonProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

// Card - Content container
interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  interactive?: boolean
}

// Input - Form input element
interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

### Level 2: Layout Components

#### Layout Component
```typescript
interface LayoutProps {
  children: ReactNode
  className?: string
}

// Component Structure:
<Layout>
  <Header />          // Top navigation
  <Sidebar />         // Side navigation (desktop)
  <main>              // Content area
    {children}        // Page content
  </main>
</Layout>
```

#### Header Component
```typescript
interface HeaderProps {
  // No props - uses global state
}

// Features:
// - Search bar with suggestions
// - User menu with avatar
// - Theme toggle
// - WebSocket status indicator
// - Keyboard shortcut hints
```

#### Sidebar Component
```typescript
interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

// Features:
// - Navigation links with icons
// - Collapsible sections
// - Active state indicators
// - Keyboard navigation
// - Persistence of state
```

### Level 3: Feature Components

#### Memory Components

##### MemoryCard
```typescript
interface MemoryCardProps {
  memory: Memory
  variant?: 'compact' | 'detailed' | 'grid'
  selectable?: boolean
  selected?: boolean
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
}

// Visual Elements:
// - Title with truncation
// - Content preview
// - Tags with colors
// - Metadata (date, collection, entities)
// - Action menu (edit, delete, share)
// - Selection checkbox (when selectable)
```

##### MemoryEditor
```typescript
interface MemoryEditorProps {
  memory?: Memory
  mode: 'create' | 'edit'
  onSave: (memory: Partial<Memory>) => Promise<void>
  onCancel: () => void
  autoSave?: boolean
  showPreview?: boolean
}

// Features:
// - Rich markdown editor with toolbar
// - Live preview pane
// - Auto-save functionality
// - Tag input with suggestions
// - Collection selector
// - Metadata management
// - Keyboard shortcuts
```

##### MemoryList
```typescript
interface MemoryListProps {
  memories: Memory[]
  layout: 'grid' | 'list' | 'compact'
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
  isLoading?: boolean
  error?: string
}

// Features:
// - Virtual scrolling for performance
// - Multiple layout modes
// - Bulk selection support
// - Search highlighting
// - Loading skeletons
// - Empty states
```

#### Search Components

##### SearchBar
```typescript
interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: (query: string) => void
  placeholder?: string
  showSuggestions?: boolean
  showFilters?: boolean
  variant?: 'simple' | 'advanced'
}

// Features:
// - Real-time suggestions
// - Search history
// - Keyboard shortcuts (/)
// - Search type selector
// - Recent searches
// - Entity suggestions (@mentions)
```

##### SearchFilters
```typescript
interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset: () => void
  collapsed?: boolean
  availableTags: string[]
  availableCollections: Collection[]
}

// Features:
// - Date range picker
// - Tag multi-select
// - Collection filter
// - Sort options
// - Filter persistence
// - Clear all filters
```

#### Graph Components

##### GraphVisualization
```typescript
interface GraphVisualizationProps {
  data: GraphData
  layout: LayoutType
  colorScheme: ColorScheme
  selectedNode?: string
  onNodeSelect: (nodeId: string) => void
  onNodeDoubleClick: (nodeId: string) => void
  showLabels?: boolean
  showEdgeLabels?: boolean
  interactive?: boolean
  width?: number
  height?: number
}

// Features:
// - D3.js force-directed layout
// - Zoom and pan interactions
// - Node/edge filtering
// - Multiple color schemes
// - Responsive sizing
// - Export functionality
```

### Level 4: Page Components

#### Pages as Composition Roots
```typescript
// MemoriesPage - Composes memory management features
const MemoriesPage = () => (
  <Layout>
    <SearchBar />
    <BulkOperationsToolbar />
    <MemoryList />
  </Layout>
)

// GraphPage - Composes knowledge graph features
const GraphPage = () => (
  <Layout>
    <GraphControls />
    <GraphVisualization />
    <GraphSidebar />
  </Layout>
)

// AnalyticsPage - Composes analytics features
const AnalyticsPage = () => (
  <Layout>
    <TimeRangeSelector />
    <MetricsGrid />
    <ChartsContainer />
  </Layout>
)
```

## 🔧 Component Patterns

### 1. Container/Presenter Pattern
```typescript
// Container Component (handles logic)
const MemoryListContainer = () => {
  const { memories, loading, error } = useMemories()
  const { selectedIds, toggleSelection } = useBulkSelection()
  
  return (
    <MemoryListPresenter
      memories={memories}
      loading={loading}
      error={error}
      selectedIds={selectedIds}
      onToggleSelection={toggleSelection}
    />
  )
}

// Presenter Component (handles display)
const MemoryListPresenter = ({ memories, loading, error, selectedIds, onToggleSelection }) => {
  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} />
  if (!memories.length) return <EmptyState />
  
  return (
    <div className="memory-grid">
      {memories.map(memory => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          selected={selectedIds.includes(memory.id)}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </div>
  )
}
```

### 2. Compound Components Pattern
```typescript
// SearchBox as compound component
const SearchBox = ({ children }) => (
  <div className="search-box">{children}</div>
)

SearchBox.Input = SearchInput
SearchBox.Suggestions = SearchSuggestions
SearchBox.Filters = SearchFilters

// Usage:
<SearchBox>
  <SearchBox.Input placeholder="Search memories..." />
  <SearchBox.Suggestions />
  <SearchBox.Filters />
</SearchBox>
```

### 3. Render Props Pattern
```typescript
// VirtualizedList with render props
interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  renderEmpty?: () => React.ReactNode
}

// Usage:
<VirtualizedList
  items={memories}
  itemHeight={120}
  renderItem={(memory) => <MemoryCard memory={memory} />}
  renderEmpty={() => <EmptyState />}
/>
```

### 4. Higher-Order Components
```typescript
// withBulkSelection HOC
const withBulkSelection = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const bulkSelection = useBulkSelection()
    return <Component {...props} {...bulkSelection} />
  }
}

// Usage:
const MemoryListWithSelection = withBulkSelection(MemoryList)
```

## 🎯 State Management Integration

### Component State Flow
```typescript
// State flows from stores to components
Store (Zustand) → Hook → Component → UI

// Example:
useMemoryStore() → MemoryListContainer → MemoryList → MemoryCard
```

### Prop Drilling Solutions
```typescript
// Context for deeply nested props
const BulkSelectionContext = createContext<BulkSelectionContextType>()

// Provider at app level
<BulkSelectionProvider>
  <MemoryListContainer />
</BulkSelectionProvider>

// Consumer in nested component
const { selectedIds, toggleSelection } = useContext(BulkSelectionContext)
```

## 🧪 Testing Strategy

### Component Testing Levels
```typescript
// Unit Tests - Individual components
describe('MemoryCard', () => {
  it('displays memory title and preview', () => {
    render(<MemoryCard memory={mockMemory} />)
    expect(screen.getByText(mockMemory.title)).toBeInTheDocument()
  })
})

// Integration Tests - Component interactions
describe('MemoryList with BulkSelection', () => {
  it('selects multiple items and shows bulk actions', () => {
    render(<MemoryListWithBulkSelection memories={mockMemories} />)
    // Test selection interactions
  })
})

// E2E Tests - Full user workflows
test('user can create, edit, and delete memories', async ({ page }) => {
  // Test complete workflows
})
```

## 🔄 Component Lifecycle

### Performance Optimization
```typescript
// Memoization for expensive components
const MemoizedMemoryCard = React.memo(MemoryCard, (prev, next) => {
  return prev.memory.id === next.memory.id && 
         prev.memory.updated_at === next.memory.updated_at
})

// Lazy loading for code splitting
const GraphPage = lazy(() => import('./pages/GraphPage'))

// Virtual scrolling for large lists
const VirtualizedMemoryList = () => {
  const { memories } = useMemories()
  return (
    <FixedSizeList
      height={600}
      itemCount={memories.length}
      itemSize={120}
      itemData={memories}
    >
      {MemoryCardRenderer}
    </FixedSizeList>
  )
}
```

## 📚 Best Practices

### 1. Component Design Principles
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Build complex UI from simple parts
- **Prop Interface Design**: Clear, minimal, well-typed props
- **Accessibility First**: ARIA labels, keyboard support, screen readers

### 2. Performance Guidelines
- Use React.memo for pure components
- Implement virtualization for large lists
- Lazy load heavy components
- Optimize re-renders with useMemo/useCallback

### 3. Maintainability Rules
- Consistent naming conventions
- Clear prop interfaces with TypeScript
- Comprehensive error boundaries
- Automated testing coverage
- Documentation with examples

This component architecture provides a scalable, maintainable foundation for the Knowledge RAG Web UI while ensuring performance, accessibility, and developer experience.