# Knowledge RAG Web UI - Design System & Component Architecture

## 🎨 Design Philosophy

The Knowledge RAG Web UI follows a **clean, modern, and functional** design philosophy inspired by:
- **Mem0**: Minimalist interface focused on content
- **Notion**: Flexible layouts and intuitive interactions
- **Linear**: Keyboard-first navigation and efficiency
- **Obsidian**: Knowledge graph visualization principles

### Core Design Principles

1. **Content First**: UI elements support content consumption and creation
2. **Accessibility First**: WCAG AA compliance with customizable preferences
3. **Performance First**: Fast load times and smooth interactions
4. **Consistency**: Unified visual language across all components
5. **Flexibility**: Adaptable to different use cases and screen sizes

## 🏗️ Architecture Overview

```
Design System Architecture
├── Foundation Layer
│   ├── Design Tokens (colors, spacing, typography)
│   ├── Theme System (dark/light/system)
│   └── Accessibility Settings
├── Component Layer
│   ├── Primitive Components (buttons, inputs, cards)
│   ├── Composite Components (search, memory cards)
│   └── Layout Components (header, sidebar, main)
├── Feature Layer
│   ├── Memory Management
│   ├── Search & Discovery
│   ├── Knowledge Graph
│   └── Analytics & Insights
└── Application Layer
    ├── Page Templates
    ├── Navigation Patterns
    └── Interaction Flows
```

## 🎨 Visual Design Tokens

### Color Palette

#### Light Theme
```css
/* Primary Colors */
--primary: 222.2 84% 4.9%        /* #020617 - Rich black */
--primary-foreground: 210 40% 98% /* #f8fafc - Light gray */

/* Secondary Colors */
--secondary: 210 40% 96%         /* #f1f5f9 - Very light gray */
--secondary-foreground: 222.2 84% 4.9% /* #020617 - Rich black */

/* Accent Colors */
--accent: 210 40% 96%            /* #f1f5f9 - Light accent */
--accent-foreground: 222.2 84% 4.9% /* #020617 - Dark text */

/* Background Colors */
--background: 0 0% 100%          /* #ffffff - Pure white */
--foreground: 222.2 84% 4.9%     /* #020617 - Rich black */

/* UI Colors */
--card: 0 0% 100%                /* #ffffff - White cards */
--border: 214.3 31.8% 91.4%      /* #e2e8f0 - Light border */
--input: 214.3 31.8% 91.4%       /* #e2e8f0 - Input border */
--muted: 210 40% 96%             /* #f1f5f9 - Muted background */
--muted-foreground: 215.4 16.3% 46.9% /* #64748b - Muted text */

/* Status Colors */
--destructive: 0 72.2% 50.6%     /* #dc2626 - Error red */
--success: 142.1 76.2% 36.3%     /* #16a34a - Success green */
--warning: 32.1 81% 60.8%        /* #f59e0b - Warning amber */
--info: 221.2 83.2% 53.3%        /* #3b82f6 - Info blue */
```

#### Dark Theme
```css
/* Primary Colors */
--primary: 210 40% 98%           /* #f8fafc - Light gray */
--primary-foreground: 222.2 84% 4.9% /* #020617 - Rich black */

/* Background Colors */
--background: 222.2 84% 4.9%     /* #020617 - Rich black */
--foreground: 210 40% 98%        /* #f8fafc - Light gray */

/* UI Colors */
--card: 222.2 84% 4.9%           /* #020617 - Dark cards */
--border: 217.2 32.6% 17.5%      /* #334155 - Dark border */
--input: 217.2 32.6% 17.5%       /* #334155 - Input border */
--muted: 217.2 32.6% 17.5%       /* #334155 - Muted background */
--muted-foreground: 215 20.2% 65.1% /* #94a3b8 - Muted text */
```

### Typography Scale

```css
/* Font Families */
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### Spacing Scale

```css
/* Spacing Units (based on 4px grid) */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

## 🧩 Component Library

### 1. Foundation Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
}
```

**Variants**:
- `default`: Primary blue background
- `destructive`: Red background for delete actions
- `outline`: Transparent with border
- `secondary`: Gray background
- `ghost`: Transparent with hover effect
- `link`: Text-only with underline

#### Input Component
```typescript
interface InputProps {
  variant: 'default' | 'search' | 'password'
  size: 'default' | 'sm' | 'lg'
  error?: boolean
  disabled?: boolean
  placeholder?: string
}
```

#### Card Component
```typescript
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined'
  padding: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  interactive?: boolean
}
```

### 2. Layout Components

#### Header
- **Purpose**: Top navigation and user actions
- **Features**: Search bar, user menu, theme toggle, notifications
- **Responsive**: Collapses to hamburger menu on mobile
- **Accessibility**: Skip links, keyboard navigation

#### Sidebar
- **Purpose**: Primary navigation and quick actions
- **Features**: Collapsible, pin/unpin, keyboard shortcuts
- **Responsive**: Overlay on mobile, persistent on desktop
- **State**: Remembers collapsed/expanded preference

#### Main Content Area
- **Purpose**: Primary content display
- **Features**: Scroll container, focus management
- **Layout**: Flexible grid system
- **Performance**: Virtual scrolling for large lists

### 3. Memory Components

#### MemoryCard
```typescript
interface MemoryCardProps {
  memory: Memory
  variant: 'compact' | 'detailed' | 'grid'
  selectable?: boolean
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}
```

**Visual Design**:
```
┌─────────────────────────────────────┐
│ [•] Memory Title               [⋮]  │
├─────────────────────────────────────┤
│ Preview text with highlighted       │
│ search terms and truncation...      │
├─────────────────────────────────────┤
│ 🏷️ tag1  tag2  tag3  📁 Collection │
│ 📅 2 hours ago  👥 3 entities       │
└─────────────────────────────────────┘
```

#### MemoryEditor
```typescript
interface MemoryEditorProps {
  memory?: Memory
  mode: 'create' | 'edit'
  onSave: (memory: Memory) => void
  onCancel: () => void
  autoSave?: boolean
}
```

**Layout**:
```
┌─────────────────────────────────────┐
│ Title Input                    [⚙️] │
├─────────────────────────────────────┤
│ Markdown Editor    │ Live Preview   │
│                   │                │
│                   │                │
├─────────────────────────────────────┤
│ Tags: [input]  Collection: [select] │
│ [Cancel] [Save Draft] [Publish]     │
└─────────────────────────────────────┘
```

### 4. Search Components

#### SearchBar
```typescript
interface SearchBarProps {
  variant: 'simple' | 'advanced'
  suggestions?: boolean
  filters?: boolean
  shortcuts?: boolean
}
```

**Visual Design**:
```
┌─────────────────────────────────────┐
│ 🔍 Search memories...         [⚙️]  │
│ ┌─ Suggestions ─────────────────┐   │
│ │ Recent: "machine learning"    │   │
│ │ Popular: "react hooks"        │   │
│ │ Entities: @john-doe @openai   │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### SearchFilters
```typescript
interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  defaultFilters?: SearchFilters
  collapsed?: boolean
}
```

### 5. Graph Components

#### GraphVisualization
```typescript
interface GraphVisualizationProps {
  data: GraphData
  layout: 'force' | 'hierarchical' | 'circular'
  colorScheme: 'type' | 'cluster' | 'centrality'
  interactive?: boolean
  showLabels?: boolean
}
```

**Control Panel**:
```
┌─────────────────────────────────────┐
│ Layout: [Force ▼] Color: [Type ▼]   │
│ Labels: [●] Edges: [●] Filter: [▼]  │
│ Zoom: [-] [Reset] [+] Export: [📁]  │
└─────────────────────────────────────┘
```

## 📱 Responsive Design Patterns

### Breakpoint Strategy
```css
/* Mobile First Approach */
/* xs: 0px - 639px (mobile) */
/* sm: 640px - 767px (large mobile) */
/* md: 768px - 1023px (tablet) */
/* lg: 1024px - 1279px (desktop) */
/* xl: 1280px+ (large desktop) */
```

### Layout Patterns

#### Memory List - Responsive Grid
```css
/* Mobile: Single column */
.memory-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet: Two columns */
@media (min-width: 768px) {
  .memory-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop: Three columns */
@media (min-width: 1024px) {
  .memory-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

#### Navigation - Progressive Enhancement
```typescript
// Mobile: Bottom tab bar
// Tablet: Side rail
// Desktop: Full sidebar
```

## 🎯 Interaction Patterns

### Navigation Flow
```
Homepage → Search/Browse → Memory Detail → Edit
    ↓         ↓              ↓            ↓
Analytics   Filters       Collections   Save/Cancel
    ↓         ↓              ↓            ↓
Insights    Results      Graph View    Success
```

### Keyboard Shortcuts
```typescript
const shortcuts = {
  // Global Navigation
  'h': 'Go to home',
  'm': 'Go to memories', 
  'g': 'Go to graph',
  'c': 'Go to collections',
  'a': 'Go to analytics',
  's': 'Go to settings',
  
  // Actions
  '/': 'Focus search',
  'n': 'New memory',
  'Ctrl+k': 'Command palette',
  'Escape': 'Close modal/Clear search',
  
  // List Navigation
  'j': 'Next item',
  'k': 'Previous item',
  'Enter': 'Open item',
  
  // Editor
  'Ctrl+s': 'Save',
  'Ctrl+z': 'Undo',
  'Ctrl+y': 'Redo'
}
```

### Touch Gestures (Future Enhancement)
```typescript
const gestures = {
  'swipe-right': 'Open sidebar',
  'swipe-left': 'Close sidebar', 
  'pull-down': 'Refresh',
  'long-press': 'Context menu',
  'pinch': 'Zoom graph'
}
```

## 🎨 Visual Mockups

### 1. Memory List Page
```
┌─────────────────────────────────────────────────────────────┐
│ Knowledge RAG                    🔍 Search...        👤 ⚙️ │
├─────────────────────────────────────────────────────────────┤
│ [≡] Memories    Filters: All ▼  Sort: Recent ▼  [+ New]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │ React Hooks │ │ ML Concepts │ │ API Design  │           │
│ │ useState... │ │ Neural nets │ │ RESTful...  │           │
│ │ 🏷️ react js │ │ 🏷️ ml ai   │ │ 🏷️ api rest│           │
│ │ 📁 Dev      │ │ 📁 Learning │ │ 📁 Backend  │           │
│ │ 2h ago      │ │ 1d ago      │ │ 3d ago      │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │ TypeScript  │ │ Git Workflow│ │ Testing...  │           │
│ │ Types and...│ │ Branching...│ │ Jest setup  │           │
│ │ 🏷️ ts types │ │ 🏷️ git vcs │ │ 🏷️ test jest│           │
│ │ 📁 Dev      │ │ 📁 Tools    │ │ 📁 QA       │           │
│ │ 1w ago      │ │ 2w ago      │ │ 3w ago      │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Memory Editor
```
┌─────────────────────────────────────────────────────────────┐
│ [←] New Memory                              [Save] [Cancel] │
├─────────────────────────────────────────────────────────────┤
│ Title: [Understanding React Hooks                        ] │
├─────────────────────────────────────────────────────────────┤
│ Content:                              │ Preview:           │
│ ┌─────────────────────────┐           │ ┌─────────────────┐ │
│ │ # React Hooks           │           │ │ React Hooks     │ │
│ │                         │           │ │                 │ │
│ │ useState allows you to  │           │ │ useState allows │ │
│ │ add state to functional │    ←→     │ │ you to add state│ │
│ │ components:             │           │ │ to functional   │ │
│ │                         │           │ │ components:     │ │
│ │ ```javascript           │           │ │                 │ │
│ │ const [count, setCount] │           │ │ const [count,   │ │
│ │ = useState(0);          │           │ │ setCount] =     │ │
│ │ ```                     │           │ │ useState(0);    │ │
│ └─────────────────────────┘           │ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Tags: [react, hooks, javascript] Collection: [Development▼]│
│ Entities: @React @useState                    Privacy: [🔒] │
└─────────────────────────────────────────────────────────────┘
```

### 3. Knowledge Graph
```
┌─────────────────────────────────────────────────────────────┐
│ Knowledge Graph                     Layout:[Force▼] [⚙️]    │
├─────────────────────────────────────────────────────────────┤
│ [📊] Controls              │ Graph Visualization           │
│ ┌─────────────────────┐   │     ●─────●                   │
│ │ Layout: Force       │   │    ╱ ╲   ╱ ╲                  │
│ │ Color: By Type      │   │   ●   ● ●   ●                 │
│ │ Labels: ✓ Show      │   │    ╲ ╱   ╲ ╱                  │
│ │ Edges: ✓ Show       │   │     ●─────●                   │
│ │                     │   │                               │
│ │ Filters:            │   │   Legend:                     │
│ │ ☑ Memories (24)     │   │   ● Memory  ● Entity          │
│ │ ☑ Entities (156)    │   │   ● Collection                │
│ │ ☑ Collections (8)   │   │                               │
│ │                     │   │   Selected: React Hooks       │
│ │ Min Connections: 2  │   │   Connections: 12             │
│ │ Max Depth: 3        │   │   Type: Memory                │
│ │                     │   │   Tags: react, hooks, js      │
│ │ [Export] [Reset]    │   │   [View] [Edit] [Share]       │
│ └─────────────────────┘   │                               │
└─────────────────────────────────────────────────────────────┘
```

### 4. Analytics Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Analytics Dashboard              Week Month Year    [📊⚙️]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ 🗂️ 247  │ │ 📁 18   │ │ 🏷️ 89  │ │ 👥 156  │           │
│ │ Memories│ │ Collections│ │ Tags   │ │ Entities│           │
│ │ +12 this│ │ organized │ │ unique  │ │ extracted│           │
│ │ week    │ │ memories  │ │ tags    │ │ entities │           │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│ Memory Growth              │ Collection Distribution        │
│ ┌─────────────────────┐   │ ┌─────────────────────┐       │
│ │    📈              │   │ │      🥧             │       │
│ │      ╱╲             │   │ │   ╭─────╮           │       │
│ │     ╱  ╲            │   │ │  ╱       ╲          │       │
│ │    ╱    ╲           │   │ │ ╱         ╲         │       │
│ │   ╱      ╲          │   │ │╱           ╲        │       │
│ │  ╱        ╲         │   │ │             ╲       │       │
│ │ ╱          ╲────    │   │ │              ╲──────│       │
│ └─────────────────────┘   │ └─────────────────────┘       │
├─────────────────────────────────────────────────────────────┤
│ Most Used Tags            │ Storage Usage                  │
│ ┌─────────────────────┐   │ ┌─────────────────────┐       │
│ │ react      ████████ │   │ │ Used: 2.3GB / 5GB   │       │
│ │ javascript ██████   │   │ │ ████████████░░░░ 46% │       │
│ │ machine-learning ███│   │ │                      │       │
│ │ typescript ██       │   │ │ Memory Types:        │       │
│ │ python     █        │   │ │ ● Text (156)         │       │
│ └─────────────────────┘   │ │ ● Images (23)        │       │
│                           │ │ ● Code (89)          │       │
│                           │ │ ● Links (45)         │       │
│                           │ └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Implementation Guidelines

### Component Development Process
1. **Design Token Definition**: Define colors, spacing, typography
2. **Component Specification**: TypeScript interfaces and props
3. **Base Implementation**: Core functionality with accessibility
4. **Visual Polish**: Styling with Tailwind CSS
5. **Documentation**: Storybook stories and usage examples
6. **Testing**: Unit tests and visual regression tests

### Quality Checklist
- [ ] Responsive design (mobile-first)
- [ ] Accessibility compliance (WCAG AA)
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Focus management
- [ ] Loading states
- [ ] Error states
- [ ] TypeScript type safety
- [ ] Performance optimization

### Tools and Technologies
- **Design**: Figma for mockups and prototypes
- **Development**: React + TypeScript + Tailwind CSS
- **Documentation**: Storybook for component library
- **Testing**: Jest + React Testing Library + Playwright
- **Quality**: ESLint + Prettier + Husky pre-commit hooks

This design system provides a comprehensive foundation for the Knowledge RAG Web UI, ensuring consistency, accessibility, and maintainability across all components and features.