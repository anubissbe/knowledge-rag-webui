# Development Guide - Knowledge RAG Web UI

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Access to Knowledge RAG System APIs
- Git for version control

### Initial Setup
```bash
# Navigate to project
cd /opt/projects/projects/knowledge-rag-webui

# Load environment variables
source /opt/projects/export-secrets.sh

# Install dependencies
npm install

# Verify setup
./scripts/verify-setup.sh

# Start development server
npm run dev
```

## 📁 Project Structure

```
knowledge-rag-webui/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Generic components (buttons, inputs)
│   │   ├── layout/       # Layout components (header, sidebar)
│   │   ├── memories/     # Memory-specific components
│   │   ├── search/       # Search-related components
│   │   └── collections/  # Collection components
│   ├── features/         # Feature modules
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   │   └── api/        # API client configuration
│   ├── stores/          # Zustand state management
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── lib/            # Third-party integrations
├── public/              # Static assets
├── docs/               # Documentation
├── scripts/            # Utility scripts
└── tests/             # Test files
```

## 🛠 Development Workflow

### 1. Component Development

Create new components in the appropriate directory:

```typescript
// src/components/memories/MemoryCard.tsx
import { FC } from 'react'
import { Memory } from '@/types'
import { cn } from '@/lib/utils'

interface MemoryCardProps {
  memory: Memory
  className?: string
  onClick?: () => void
}

export const MemoryCard: FC<MemoryCardProps> = ({ 
  memory, 
  className,
  onClick 
}) => {
  return (
    <div 
      className={cn(
        "rounded-lg border p-4 hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <h3 className="font-semibold">{memory.title}</h3>
      <p className="text-muted-foreground mt-2">{memory.preview}</p>
    </div>
  )
}
```

### 2. State Management with Zustand

Create stores for different features:

```typescript
// src/stores/memoryStore.ts
import { create } from 'zustand'
import { Memory } from '@/types'

interface MemoryStore {
  memories: Memory[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchMemories: () => Promise<void>
  addMemory: (memory: Memory) => void
  updateMemory: (id: string, updates: Partial<Memory>) => void
  deleteMemory: (id: string) => void
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  memories: [],
  loading: false,
  error: null,
  
  fetchMemories: async () => {
    set({ loading: true, error: null })
    try {
      // API call here
      const memories = await api.getMemories()
      set({ memories, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  // Other actions...
}))
```

### 3. API Integration

Use the configured API clients:

```typescript
// src/services/api/memories.ts
import { ragClient } from './client'
import { Memory, CreateMemoryDto } from '@/types'

export const memoriesApi = {
  async getMemories(): Promise<Memory[]> {
    const response = await ragClient.post('/', {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'list_documents',
        arguments: { limit: 100 }
      },
      id: 1
    })
    return response.data.result.documents
  },
  
  async createMemory(data: CreateMemoryDto): Promise<Memory> {
    const response = await ragClient.post('/', {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'index_document',
        arguments: data
      },
      id: 1
    })
    return response.data.result
  }
}
```

### 4. Using React Query

Implement data fetching with caching:

```typescript
// src/hooks/useMemories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { memoriesApi } from '@/services/api/memories'

export const useMemories = () => {
  return useQuery({
    queryKey: ['memories'],
    queryFn: memoriesApi.getMemories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateMemory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: memoriesApi.createMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    }
  })
}
```

## 🎨 Styling Guidelines

### Using Tailwind CSS

1. **Utility-first approach**: Use Tailwind classes directly
2. **Component variants**: Use `cn()` utility for conditional classes
3. **Dark mode**: Use `dark:` prefix for dark mode styles
4. **Responsive**: Use breakpoint prefixes (`sm:`, `md:`, `lg:`)

### Theme Colors

```css
/* Available CSS variables */
--primary: Main brand color
--secondary: Secondary brand color
--background: Page background
--foreground: Text color
--muted: Muted backgrounds
--accent: Accent color
--destructive: Error/delete actions
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run typecheck
```

## 📝 Code Style

### TypeScript
- Use explicit types for function parameters
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values

### React
- Use functional components with hooks
- Keep components small and focused
- Extract custom hooks for reusable logic

### File Naming
- Components: PascalCase (e.g., `MemoryCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase (e.g., `Memory.ts`)

## 🚦 Git Workflow

```bash
# Create feature branch
git checkout -b feature/memory-card

# Make changes and commit
git add .
git commit -m "feat: add memory card component"

# Push branch
git push origin feature/memory-card
```

## 🐛 Debugging

### Browser DevTools
- React Developer Tools for component inspection
- Network tab for API calls
- Console for debugging logs

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript React code snippets

## 📦 Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

All environment variables must be prefixed with `VITE_`:

```env
VITE_API_URL=http://localhost:3001
VITE_RAG_URL=http://localhost:8002
VITE_ENABLE_FEATURE_X=true
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query/latest)

---

For more information, see the [Architecture Documentation](./ARCHITECTURE.md)