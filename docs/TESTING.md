# Knowledge RAG Web UI - Testing Guide

## Overview

This guide covers the comprehensive testing strategy for the Knowledge RAG Web UI, including unit tests, integration tests, E2E tests, and manual testing procedures.

## Testing Philosophy

- **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
- **Coverage Goal**: Minimum 70% code coverage, 100% for critical paths
- **Test Early**: Write tests alongside or before implementation (TDD)
- **Test Behavior**: Focus on user behavior, not implementation details

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Jest + MSW (Mock Service Worker)
- **E2E Testing**: Playwright
- **Visual Testing**: Storybook + Chromatic
- **Performance Testing**: Lighthouse CI
- **Accessibility Testing**: jest-axe + Playwright

## Quick Start

### Running Tests

```bash
# Run all tests with our custom test runner
node scripts/test-runner.js

# Run specific test types
node scripts/test-runner.js --unit-only
node scripts/test-runner.js --integration-only
node scripts/test-runner.js --e2e-only

# Run with coverage
node scripts/test-runner.js --coverage

# Run E2E tests with UI
node scripts/test-runner.js --e2e-only --headed

# Individual commands
npm test                    # Unit tests
npm run test:watch         # Unit tests in watch mode
npm run test:coverage      # Unit tests with coverage
npm run test:e2e          # E2E tests
npm run test:e2e:headed   # E2E tests with browser UI
npm run test:all          # All tests
```

## Recently Added Tests

### ✅ New Component Tests
- **Button Component**: Complete test coverage for all variants, sizes, and states
- **Layout Component**: Navigation, sidebar toggle, responsive behavior
- **LoginForm Component**: Form validation, authentication flow, error handling
- **MemoryEditor Component**: Create/edit modes, validation, auto-save

### ✅ New Integration Tests
- **Memory Management Flow**: End-to-end memory CRUD operations
- **Search Integration**: Search functionality with filters and real-time results

### ✅ New E2E Tests
- **Memory Management Workflow**: Complete user journey testing
- **Mobile Responsive Tests**: Touch gestures, mobile navigation
- **Error Handling**: Network failures, retry mechanisms

### ✅ Testing Infrastructure
- **MSW Integration**: API mocking for consistent testing
- **Test Utilities**: Comprehensive helper functions and mock data factories
- **Custom Test Runner**: Unified test execution with detailed reporting

## Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # Component tests
│   ├── hooks/             # Hook tests
│   ├── utils/             # Utility tests
│   └── stores/            # Store tests
├── integration/            # Integration tests
│   ├── features/          # Feature-level tests
│   └── api/               # API integration tests
├── e2e/                    # End-to-end tests
│   ├── workflows/         # User workflow tests
│   └── smoke/             # Smoke tests
├── fixtures/               # Test data
├── mocks/                  # Mock implementations
└── utils/                  # Test utilities
```

## Unit Testing

### Component Testing

```typescript
// MemoryCard.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { MemoryCard } from '@/components/memories/MemoryCard';
import { mockMemory } from '@/tests/fixtures/memories';

describe('MemoryCard', () => {
  it('renders memory information correctly', () => {
    render(<MemoryCard memory={mockMemory} />);
    
    expect(screen.getByText(mockMemory.title)).toBeInTheDocument();
    expect(screen.getByText(mockMemory.preview)).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<MemoryCard memory={mockMemory} onEdit={onEdit} />);
    
    await userEvent.click(screen.getByLabelText('Edit memory'));
    expect(onEdit).toHaveBeenCalledWith(mockMemory.id);
  });
  
  it('shows loading state during operations', () => {
    render(<MemoryCard memory={mockMemory} isLoading />);
    expect(screen.getByTestId('memory-card-skeleton')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// useSearch.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '@/hooks/useSearch';
import { wrapper } from '@/tests/utils/wrapper';

describe('useSearch', () => {
  it('debounces search input', async () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    
    act(() => {
      result.current.setQuery('test');
    });
    
    expect(result.current.isSearching).toBe(false);
    
    // Wait for debounce
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    expect(result.current.isSearching).toBe(true);
  });
  
  it('cancels previous search on new input', async () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    
    act(() => {
      result.current.setQuery('first');
    });
    
    act(() => {
      result.current.setQuery('second');
    });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    expect(result.current.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ query: 'second' })
      ])
    );
  });
});
```

### Store Testing

```typescript
// memoryStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMemoryStore } from '@/stores/memoryStore';
import { mockMemories } from '@/tests/fixtures/memories';

describe('memoryStore', () => {
  beforeEach(() => {
    useMemoryStore.getState().reset();
  });
  
  it('fetches memories successfully', async () => {
    const { result } = renderHook(() => useMemoryStore());
    
    await act(async () => {
      await result.current.fetchMemories();
    });
    
    expect(result.current.memories).toHaveLength(mockMemories.length);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('handles fetch errors gracefully', async () => {
    // Mock API error
    server.use(
      rest.get('/api/memories', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    const { result } = renderHook(() => useMemoryStore());
    
    await act(async () => {
      await result.current.fetchMemories();
    });
    
    expect(result.current.memories).toHaveLength(0);
    expect(result.current.error).toBe('Failed to fetch memories');
  });
});
```

## Integration Testing

### API Integration Tests

```typescript
// api.integration.test.ts
import { ragApi } from '@/services/api';
import { server } from '@/tests/mocks/server';
import { rest } from 'msw';

describe('RAG API Integration', () => {
  it('handles authentication correctly', async () => {
    const token = 'test-token';
    localStorage.setItem('auth-token', token);
    
    let capturedHeaders: Headers;
    server.use(
      rest.get('/api/memories', (req, res, ctx) => {
        capturedHeaders = req.headers;
        return res(ctx.json({ memories: [] }));
      })
    );
    
    await ragApi.getMemories();
    
    expect(capturedHeaders.get('Authorization')).toBe(`Bearer ${token}`);
  });
  
  it('retries failed requests', async () => {
    let attempts = 0;
    server.use(
      rest.get('/api/memories', (req, res, ctx) => {
        attempts++;
        if (attempts < 3) {
          return res(ctx.status(500));
        }
        return res(ctx.json({ memories: [] }));
      })
    );
    
    const result = await ragApi.getMemories();
    
    expect(attempts).toBe(3);
    expect(result.memories).toEqual([]);
  });
});
```

### Feature Integration Tests

```typescript
// search.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFeature } from '@/features/search';
import { wrapper } from '@/tests/utils/wrapper';

describe('Search Feature Integration', () => {
  it('performs search and displays results', async () => {
    render(<SearchFeature />, { wrapper });
    
    const searchInput = screen.getByPlaceholderText('Search memories...');
    await userEvent.type(searchInput, 'test query');
    
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Found 5 results')).toBeInTheDocument();
    expect(screen.getAllByTestId('search-result')).toHaveLength(5);
  });
  
  it('shows filters and applies them correctly', async () => {
    render(<SearchFeature />, { wrapper });
    
    await userEvent.click(screen.getByText('Filters'));
    await userEvent.click(screen.getByLabelText('Collections'));
    await userEvent.selectOptions(
      screen.getByLabelText('Collection'),
      'work'
    );
    
    const searchInput = screen.getByPlaceholderText('Search memories...');
    await userEvent.type(searchInput, 'test');
    
    await waitFor(() => {
      const results = screen.getAllByTestId('search-result');
      results.forEach(result => {
        expect(result).toHaveTextContent('work');
      });
    });
  });
});
```

## E2E Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// memory-workflow.e2e.ts
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Memory Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password');
  });
  
  test('complete memory lifecycle', async ({ page }) => {
    // Create memory
    await page.click('text=New Memory');
    await page.fill('[name=title]', 'E2E Test Memory');
    await page.fill('[name=content]', 'This is an E2E test memory content');
    await page.selectOption('[name=collection]', 'personal');
    await page.click('text=Save');
    
    // Verify creation
    await expect(page.locator('text=Memory created successfully')).toBeVisible();
    await expect(page.locator('h3:has-text("E2E Test Memory")')).toBeVisible();
    
    // Edit memory
    await page.click('[aria-label="Edit E2E Test Memory"]');
    await page.fill('[name=title]', 'Updated E2E Test Memory');
    await page.click('text=Save Changes');
    
    // Verify update
    await expect(page.locator('text=Memory updated successfully')).toBeVisible();
    await expect(page.locator('h3:has-text("Updated E2E Test Memory")')).toBeVisible();
    
    // Search for memory
    await page.fill('[placeholder="Search memories..."]', 'Updated E2E');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid=search-result]')).toHaveCount(1);
    
    // Delete memory
    await page.click('[aria-label="Delete Updated E2E Test Memory"]');
    await page.click('text=Confirm Delete');
    
    // Verify deletion
    await expect(page.locator('text=Memory deleted successfully')).toBeVisible();
    await expect(page.locator('h3:has-text("Updated E2E Test Memory")')).not.toBeVisible();
  });
  
  test('knowledge graph interaction', async ({ page }) => {
    await page.goto('/graph');
    
    // Wait for graph to load
    await page.waitForSelector('[data-testid=knowledge-graph]');
    
    // Interact with nodes
    await page.click('[data-node-id="1"]');
    await expect(page.locator('[data-testid=node-details]')).toBeVisible();
    
    // Test zoom controls
    await page.click('[aria-label="Zoom in"]');
    await page.click('[aria-label="Zoom out"]');
    await page.click('[aria-label="Reset zoom"]');
    
    // Test filtering
    await page.fill('[placeholder="Filter entities..."]', 'person');
    await expect(page.locator('[data-node-type="person"]')).toBeVisible();
    await expect(page.locator('[data-node-type="organization"]')).not.toBeVisible();
  });
});
```

### Mobile E2E Tests

```typescript
// mobile.e2e.ts
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] });

test.describe('Mobile Experience', () => {
  test('responsive navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check hamburger menu is visible
    await expect(page.locator('[aria-label="Menu"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[aria-label="Menu"]');
    await expect(page.locator('[data-testid=mobile-nav]')).toBeVisible();
    
    // Navigate to search
    await page.click('text=Search');
    await expect(page).toHaveURL('/search');
    
    // Check search is mobile-optimized
    const searchInput = page.locator('[placeholder="Search memories..."]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveCSS('font-size', '16px'); // Prevents zoom on iOS
  });
  
  test('touch gestures', async ({ page }) => {
    await page.goto('/');
    
    // Test swipe to delete
    const memoryCard = page.locator('[data-testid=memory-card]').first();
    await memoryCard.swipe({ direction: 'left', distance: 100 });
    await expect(page.locator('[aria-label="Delete"]')).toBeVisible();
    
    // Test pull to refresh
    await page.touchscreen.swipe({
      from: { x: 200, y: 200 },
      to: { x: 200, y: 400 },
      steps: 10
    });
    await expect(page.locator('[data-testid=refresh-indicator]')).toBeVisible();
  });
});
```

## Visual Testing

### Storybook Setup

```typescript
// MemoryCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryCard } from '@/components/memories/MemoryCard';

const meta: Meta<typeof MemoryCard> = {
  title: 'Components/MemoryCard',
  component: MemoryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    memory: {
      id: '1',
      title: 'Sample Memory',
      content: 'This is a sample memory content for testing.',
      createdAt: new Date(),
      tags: ['test', 'sample'],
    },
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const WithLongContent: Story = {
  args: {
    memory: {
      ...Default.args.memory,
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
    },
  },
};
```

### Visual Regression Tests

```typescript
// visual.test.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('memory list page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('memory-list.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
  
  test('dark mode', async ({ page }) => {
    await page.goto('/');
    await page.click('[aria-label="Toggle theme"]');
    await page.waitForTimeout(300); // Wait for transition
    await expect(page).toHaveScreenshot('dark-mode.png');
  });
  
  test('responsive layouts', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await expect(page).toHaveScreenshot(`layout-${viewport.name}.png`);
    }
  });
});
```

## Performance Testing

### Performance Test Suite

```typescript
// performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('initial page load performance', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      return JSON.stringify(window.performance.getEntriesByType('navigation')[0]);
    });
    
    const perf = JSON.parse(metrics);
    expect(perf.domContentLoadedEventEnd).toBeLessThan(1500);
    expect(perf.loadEventEnd).toBeLessThan(3000);
  });
  
  test('memory list rendering performance', async ({ page }) => {
    await page.goto('/');
    
    const renderTime = await page.evaluate(() => {
      const start = performance.now();
      // Trigger re-render with 1000 items
      window.testUtils.renderManyItems(1000);
      return performance.now() - start;
    });
    
    expect(renderTime).toBeLessThan(100); // Should render in under 100ms
  });
  
  test('search responsiveness', async ({ page }) => {
    await page.goto('/search');
    
    const input = page.locator('[placeholder="Search memories..."]');
    const startTime = Date.now();
    
    await input.type('test query', { delay: 10 });
    await page.waitForSelector('[data-testid=search-results]');
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(500); // Results should appear within 500ms
  });
});
```

## Accessibility Testing

### Automated Accessibility Tests

```typescript
// accessibility.test.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });
  
  test('memory list page', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });
  
  test('keyboard navigation', async ({ page }) => {
    // Tab through interface
    await page.keyboard.press('Tab');
    const firstFocus = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocus).toBe('A'); // Skip to content link
    
    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Check focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveCSS('outline-style', 'solid');
  });
  
  test('screen reader labels', async ({ page }) => {
    const buttons = await page.$$('button');
    
    for (const button of buttons) {
      const hasLabel = await button.evaluate(el => {
        return !!(el.getAttribute('aria-label') || el.textContent?.trim());
      });
      expect(hasLabel).toBe(true);
    }
  });
});
```

## Test Data Management

### Fixtures

```typescript
// fixtures/memories.ts
export const mockMemory = {
  id: '1',
  title: 'Test Memory',
  content: 'This is test memory content',
  preview: 'This is test memory...',
  tags: ['test', 'mock'],
  collection: 'default',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  entities: [
    { id: 'e1', name: 'Entity 1', type: 'person' },
  ],
};

export const mockMemories = Array.from({ length: 10 }, (_, i) => ({
  ...mockMemory,
  id: `${i + 1}`,
  title: `Test Memory ${i + 1}`,
}));
```

### Test Utilities

```typescript
// utils/test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## CI/CD Test Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
  
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
  
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build-storybook
      - run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

## Testing Checklist

### Before Committing
- [ ] All unit tests pass
- [ ] New code has tests
- [ ] Coverage hasn't decreased
- [ ] No console errors/warnings

### Before PR
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Visual regression tests pass
- [ ] Accessibility tests pass
- [ ] Performance benchmarks met

### Before Release
- [ ] Full test suite passes
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile testing completed
- [ ] Load testing performed

---

Remember: Good tests enable confidence in changes and catch bugs before users do!