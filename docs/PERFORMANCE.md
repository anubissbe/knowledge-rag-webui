# Performance Optimization Guide

Guidelines and best practices for optimizing the Knowledge RAG Web UI performance.

## 📊 Performance Targets

### Core Web Vitals Goals
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.8s

### Application-Specific Metrics
- **Initial Load**: < 3s
- **Search Response**: < 500ms
- **Memory Creation**: < 1s
- **Graph Rendering**: < 2s
- **Bundle Size**: < 500KB gzipped

## 🚀 Frontend Optimizations

### Code Splitting
Implement route-based code splitting:

```typescript
// Lazy load pages
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'))
const GraphPage = lazy(() => import('./pages/GraphPage'))

// Wrap with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/memories" element={<MemoriesPage />} />
    <Route path="/graph" element={<GraphPage />} />
  </Routes>
</Suspense>
```

### Component Optimization

#### React.memo for expensive components
```typescript
const MemoryCard = React.memo(({ memory, onEdit, onDelete }) => {
  return (
    <div className="memory-card">
      {/* Component content */}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.memory.id === nextProps.memory.id &&
         prevProps.memory.updated_at === nextProps.memory.updated_at
})
```

#### useMemo for expensive calculations
```typescript
const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      calculated: heavyCalculation(item)
    }))
  }, [data])

  return <div>{/* Render processedData */}</div>
}
```

#### useCallback for event handlers
```typescript
const MemoryList = ({ memories, onMemoryUpdate }) => {
  const handleMemoryEdit = useCallback((id, updates) => {
    onMemoryUpdate(id, updates)
  }, [onMemoryUpdate])

  return (
    <div>
      {memories.map(memory => (
        <MemoryCard 
          key={memory.id}
          memory={memory}
          onEdit={handleMemoryEdit}
        />
      ))}
    </div>
  )
}
```

### Virtual Scrolling
For large lists (1000+ items):

```typescript
import { FixedSizeList as List } from 'react-window'

const VirtualizedMemoryList = ({ memories }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <MemoryCard memory={memories[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={memories.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### Image Optimization

#### Lazy loading
```typescript
const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
```

#### WebP format with fallback
```typescript
const ResponsiveImage = ({ src, alt }) => (
  <picture>
    <source srcSet={`${src}.webp`} type="image/webp" />
    <source srcSet={`${src}.jpg`} type="image/jpeg" />
    <img src={`${src}.jpg`} alt={alt} loading="lazy" />
  </picture>
)
```

## 🔧 Build Optimizations

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@tanstack/react-query', 'zustand'],
          utils: ['axios', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  esbuild: {
    drop: ['console', 'debugger'] // Remove in production
  }
})
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Or use webpack-bundle-analyzer for detailed analysis
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js
```

### Tree Shaking
Ensure proper tree shaking:

```typescript
// Good: Named imports
import { debounce } from 'lodash'

// Bad: Default import
import _ from 'lodash'

// Good: Specific imports
import { format } from 'date-fns'

// Bad: Entire library
import * as dateFns from 'date-fns'
```

## 🗄️ State Management Optimization

### Zustand Best Practices
```typescript
// Split large stores
const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  // Only memory-related state
}))

const useUIStore = create<UIState>((set, get) => ({
  loading: false,
  // Only UI-related state
}))

// Use selectors to prevent unnecessary re-renders
const memories = useMemoryStore(state => state.memories)
const isLoading = useMemoryStore(state => state.loading)
```

### Debounced Updates
```typescript
const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: debounce((query: string) => {
    set({ query })
    // Perform search
  }, 300)
}))
```

## 🌐 Network Optimization

### API Caching
```typescript
// React Query with caching
const useMemories = () => {
  return useQuery({
    queryKey: ['memories'],
    queryFn: fetchMemories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

### Request Batching
```typescript
class APIBatcher {
  private queue: Array<{ id: string; resolve: Function; reject: Function }> = []
  private timeout: NodeJS.Timeout | null = null

  async batchedFetch(ids: string[]) {
    return new Promise((resolve, reject) => {
      ids.forEach(id => {
        this.queue.push({ id, resolve, reject })
      })

      if (this.timeout) clearTimeout(this.timeout)
      
      this.timeout = setTimeout(() => {
        this.processBatch()
      }, 50) // Batch requests for 50ms
    })
  }

  private async processBatch() {
    const batch = [...this.queue]
    this.queue = []
    
    try {
      const ids = batch.map(item => item.id)
      const results = await fetchMultipleMemories(ids)
      
      batch.forEach((item, index) => {
        item.resolve(results[index])
      })
    } catch (error) {
      batch.forEach(item => item.reject(error))
    }
  }
}
```

### Connection Optimization
```typescript
// Use HTTP/2 multiplexing
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Connection': 'keep-alive',
  }
})

// Connection pooling
apiClient.defaults.httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 20
})
```

## 📊 D3.js Graph Optimization

### Efficient Rendering
```typescript
// Use canvas for large graphs (1000+ nodes)
const renderLargeGraph = (nodes: GraphNode[], edges: GraphEdge[]) => {
  const canvas = d3.select('#graph-canvas')
  const context = canvas.node().getContext('2d')
  
  // Use requestAnimationFrame for smooth animations
  const animate = () => {
    context.clearRect(0, 0, width, height)
    
    // Render edges
    edges.forEach(edge => {
      context.beginPath()
      context.moveTo(edge.source.x, edge.source.y)
      context.lineTo(edge.target.x, edge.target.y)
      context.stroke()
    })
    
    // Render nodes
    nodes.forEach(node => {
      context.beginPath()
      context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI)
      context.fill()
    })
    
    requestAnimationFrame(animate)
  }
  
  animate()
}

// Use quadtree for collision detection
const quadtree = d3.quadtree()
  .x(d => d.x)
  .y(d => d.y)
  .addAll(nodes)
```

### Level of Detail (LOD)
```typescript
const renderGraph = (nodes: GraphNode[], zoom: number) => {
  nodes.forEach(node => {
    if (zoom < 0.5) {
      // Low detail: simple circles
      renderSimpleNode(node)
    } else if (zoom < 1.5) {
      // Medium detail: circles with labels
      renderNodeWithLabel(node)
    } else {
      // High detail: full node information
      renderDetailedNode(node)
    }
  })
}
```

## 🔍 Search Optimization

### Debounced Search
```typescript
const useSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) return
      
      const results = await searchMemories(searchQuery)
      setResults(results)
    }, 300),
    []
  )
  
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])
  
  return { query, setQuery, results }
}
```

### Search Result Caching
```typescript
const searchCache = new Map<string, SearchResult>()

const cachedSearch = async (query: string): Promise<SearchResult> => {
  if (searchCache.has(query)) {
    return searchCache.get(query)!
  }
  
  const result = await performSearch(query)
  searchCache.set(query, result)
  
  // Limit cache size
  if (searchCache.size > 100) {
    const firstKey = searchCache.keys().next().value
    searchCache.delete(firstKey)
  }
  
  return result
}
```

## 📱 Mobile Optimization

### Touch Gestures
```typescript
const useTouchGestures = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    let startY = 0
    
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      // Throttle touch move events
      throttle(() => {
        const currentY = e.touches[0].clientY
        const deltaY = currentY - startY
        // Handle gesture
      }, 16)() // 60fps
    }
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])
}
```

### Responsive Images
```css
/* Use CSS for responsive images */
.memory-image {
  width: 100%;
  height: auto;
  max-width: 800px;
}

@media (max-width: 768px) {
  .memory-image {
    max-width: 100vw;
  }
}
```

## 🔄 Real-time Optimization

### Efficient WebSocket Usage
```typescript
class OptimizedWebSocket {
  private ws: WebSocket
  private messageQueue: any[] = []
  private isConnected = false
  
  constructor(url: string) {
    this.ws = new WebSocket(url)
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    this.ws.onopen = () => {
      this.isConnected = true
      this.flushMessageQueue()
    }
    
    this.ws.onmessage = throttle((event) => {
      this.handleMessage(JSON.parse(event.data))
    }, 100) // Throttle incoming messages
    
    this.ws.onclose = () => {
      this.isConnected = false
      // Implement reconnection logic
      setTimeout(() => this.reconnect(), 1000)
    }
  }
  
  send(message: any) {
    if (this.isConnected) {
      this.ws.send(JSON.stringify(message))
    } else {
      this.messageQueue.push(message)
    }
  }
  
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }
}
```

## 📈 Monitoring Performance

### Custom Performance Metrics
```typescript
// Add to your main component
const App = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    initWebVitals()
    
    // Monitor custom metrics
    performanceMonitor.measureRender('app_init', () => {
      console.log('App initialized')
    })
    
    // Report metrics periodically
    const interval = setInterval(() => {
      const metrics = performanceMonitor.getAllMetrics()
      console.log('Performance metrics:', metrics)
      
      // Send to analytics service
      if (import.meta.env.VITE_ENABLE_ANALYTICS) {
        sendMetricsToAnalytics(metrics)
      }
    }, 60000) // Every minute
    
    return () => clearInterval(interval)
  }, [])
  
  return <Router>{/* App content */}</Router>
}
```

### Memory Usage Monitoring
```typescript
const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    console.log({
      usedJSHeapSize: formatBytes(memory.usedJSHeapSize),
      totalJSHeapSize: formatBytes(memory.totalJSHeapSize),
      jsHeapSizeLimit: formatBytes(memory.jsHeapSizeLimit)
    })
  }
}

// Run every 30 seconds
setInterval(monitorMemoryUsage, 30000)
```

## ⚡ Production Deployment

### Server Configuration
```nginx
# Nginx configuration for optimal performance
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json;
    
    # Browser caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### CDN Configuration
```javascript
// Use CDN for static assets
const CDN_URL = 'https://cdn.your-domain.com'

// In your build process
const optimizeAssets = () => {
  // Upload to CDN
  // Update asset URLs
  // Generate preload hints
}
```

---

## 📋 Performance Checklist

- [ ] Code splitting implemented
- [ ] Components memoized appropriately
- [ ] Large lists use virtual scrolling
- [ ] Images are optimized and lazy loaded
- [ ] Bundle size < 500KB gzipped
- [ ] API responses cached
- [ ] Search is debounced
- [ ] Graph rendering optimized for large datasets
- [ ] Mobile performance tested
- [ ] Core Web Vitals meet targets
- [ ] Performance monitoring enabled
- [ ] Production server optimized

Regular performance audits ensure optimal user experience!