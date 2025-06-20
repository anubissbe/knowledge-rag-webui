// Sample data for onboarding and demo purposes

export const sampleMemories = [
  {
    id: 'sample-1',
    title: 'React Performance Optimization',
    content: `# React Performance Optimization

## Key Techniques

### 1. Memoization
- Use \`React.memo\` for component memoization
- Use \`useMemo\` for expensive calculations
- Use \`useCallback\` for function references

### 2. Code Splitting
- Lazy load components with \`React.lazy\`
- Use dynamic imports for routes
- Bundle analysis with webpack-bundle-analyzer

### 3. Virtualization
- Implement virtual scrolling for large lists
- Use libraries like react-window or react-virtualized

## Performance Monitoring
- React DevTools Profiler
- Chrome DevTools Performance tab
- Core Web Vitals metrics

## Best Practices
- Avoid inline object creation in JSX
- Use production builds for performance testing
- Profile before optimizing
`,
    tags: ['react', 'performance', 'optimization', 'javascript'],
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    collection_id: 'sample-collection-1',
    metadata: {
      source: 'onboarding',
      difficulty: 'intermediate'
    }
  },
  {
    id: 'sample-2',
    title: 'TypeScript Advanced Types',
    content: `# TypeScript Advanced Types

## Utility Types

### Partial<T>
Makes all properties of T optional.

\`\`\`typescript
interface User {
  name: string;
  email: string;
  age: number;
}

type PartialUser = Partial<User>; // All properties optional
\`\`\`

### Pick<T, K>
Creates a type by picking specific properties from T.

\`\`\`typescript
type UserEmail = Pick<User, 'email'>; // { email: string }
\`\`\`

### Omit<T, K>
Creates a type by omitting specific properties from T.

\`\`\`typescript
type UserWithoutAge = Omit<User, 'age'>; // { name: string, email: string }
\`\`\`

## Conditional Types
\`\`\`typescript
type ApiResponse<T> = T extends string ? string : T extends number ? number : never;
\`\`\`

## Mapped Types
\`\`\`typescript
type ReadOnly<T> = {
  readonly [K in keyof T]: T[K];
}
\`\`\`
`,
    tags: ['typescript', 'types', 'programming', 'advanced'],
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    collection_id: 'sample-collection-1',
    metadata: {
      source: 'onboarding',
      difficulty: 'advanced'
    }
  },
  {
    id: 'sample-3',
    title: 'Machine Learning Fundamentals',
    content: `# Machine Learning Fundamentals

## Types of Machine Learning

### 1. Supervised Learning
- **Classification**: Predicting categories (spam/not spam)
- **Regression**: Predicting continuous values (house prices)

Examples:
- Linear Regression
- Decision Trees
- Random Forest
- Support Vector Machines

### 2. Unsupervised Learning
- **Clustering**: Grouping similar data points
- **Dimensionality Reduction**: Reducing feature space

Examples:
- K-Means Clustering
- Principal Component Analysis (PCA)
- DBSCAN

### 3. Reinforcement Learning
Learning through interaction with environment using rewards and penalties.

Examples:
- Q-Learning
- Policy Gradient Methods
- Actor-Critic Methods

## Key Concepts

### Overfitting vs Underfitting
- **Overfitting**: Model learns training data too well
- **Underfitting**: Model is too simple to capture patterns

### Cross-Validation
Technique to assess model performance and generalization.

### Feature Engineering
Process of selecting and transforming variables for your model.
`,
    tags: ['machine-learning', 'ai', 'data-science', 'algorithms'],
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    collection_id: 'sample-collection-2',
    metadata: {
      source: 'onboarding',
      difficulty: 'beginner'
    }
  },
  {
    id: 'sample-4',
    title: 'Design System Principles',
    content: `# Design System Principles

## Core Principles

### 1. Consistency
- Use consistent colors, typography, and spacing
- Establish clear patterns and stick to them
- Create reusable components

### 2. Accessibility
- Ensure proper color contrast (WCAG 2.1 AA)
- Provide keyboard navigation
- Use semantic HTML and ARIA labels

### 3. Scalability
- Design for growth and change
- Create flexible component APIs
- Document usage guidelines

## Design Tokens

### Color Palette
\`\`\`css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-success: #10b981;
  --color-error: #ef4444;
}
\`\`\`

### Typography Scale
- Headlines: 2.5rem, 2rem, 1.5rem
- Body: 1rem, 0.875rem
- Small: 0.75rem

### Spacing Scale
- 4px, 8px, 16px, 24px, 32px, 48px, 64px

## Component Library Structure
1. **Atoms**: Basic building blocks (buttons, inputs)
2. **Molecules**: Simple combinations (search box)
3. **Organisms**: Complex components (header, card)
4. **Templates**: Page-level structures
5. **Pages**: Specific implementations
`,
    tags: ['design-system', 'ui', 'ux', 'components'],
    created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 345600000).toISOString(),
    collection_id: 'sample-collection-3',
    metadata: {
      source: 'onboarding',
      difficulty: 'intermediate'
    }
  }
]

export const sampleCollections = [
  {
    id: 'sample-collection-1',
    name: 'Development Notes',
    description: 'Programming concepts, frameworks, and best practices',
    created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    memory_count: 2,
    color: '#3b82f6',
    icon: 'code'
  },
  {
    id: 'sample-collection-2',
    name: 'Learning & Research',
    description: 'Educational content and research findings',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    memory_count: 1,
    color: '#10b981',
    icon: 'book'
  },
  {
    id: 'sample-collection-3',
    name: 'Design & UX',
    description: 'Design principles, patterns, and user experience',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
    memory_count: 1,
    color: '#8b5cf6',
    icon: 'palette'
  }
]

export const sampleEntities = [
  { id: 'react', name: 'React', type: 'technology', description: 'JavaScript library for building user interfaces' },
  { id: 'typescript', name: 'TypeScript', type: 'technology', description: 'Typed superset of JavaScript' },
  { id: 'machine-learning', name: 'Machine Learning', type: 'concept', description: 'AI technique for learning from data' },
  { id: 'design-system', name: 'Design System', type: 'methodology', description: 'Collection of reusable components and guidelines' },
  { id: 'performance', name: 'Performance', type: 'concept', description: 'Optimization of software speed and efficiency' },
  { id: 'accessibility', name: 'Accessibility', type: 'concept', description: 'Designing for users with disabilities' }
]

export const sampleGraphData = {
  nodes: [
    { id: 'react', label: 'React', type: 'technology', size: 20, color: '#61dafb' },
    { id: 'typescript', label: 'TypeScript', type: 'technology', size: 18, color: '#3178c6' },
    { id: 'performance', label: 'Performance', type: 'concept', size: 16, color: '#10b981' },
    { id: 'design-system', label: 'Design System', type: 'methodology', size: 14, color: '#8b5cf6' },
    { id: 'machine-learning', label: 'ML', type: 'concept', size: 15, color: '#f59e0b' },
    { id: 'accessibility', label: 'A11y', type: 'concept', size: 12, color: '#ef4444' }
  ],
  edges: [
    { id: 'react-typescript', source: 'react', target: 'typescript', weight: 0.8 },
    { id: 'react-performance', source: 'react', target: 'performance', weight: 0.7 },
    { id: 'design-accessibility', source: 'design-system', target: 'accessibility', weight: 0.9 },
    { id: 'typescript-performance', source: 'typescript', target: 'performance', weight: 0.6 }
  ]
}

// Helper function to create sample data in the correct format
export const createSampleMemory = (overrides: Partial<typeof sampleMemories[0]> = {}) => {
  const base = sampleMemories[0]
  return { ...base, ...overrides }
}

export const createSampleCollection = (overrides: Partial<typeof sampleCollections[0]> = {}) => {
  const base = sampleCollections[0]
  return { ...base, ...overrides }
}