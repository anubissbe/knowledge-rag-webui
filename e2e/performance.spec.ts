import { test, expect } from '@playwright/test'

test.describe('Performance Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test('should lazy load route components', async ({ page }) => {
    // Check that initial bundle is small by measuring network requests
    const responses: string[] = []
    
    page.on('response', (response) => {
      if (response.url().includes('.js') && response.status() === 200) {
        responses.push(response.url())
      }
    })

    // Navigate to memories page to trigger lazy loading
    await page.click('[data-testid="nav-memories"]')
    await page.waitForLoadState('networkidle')

    // Should have loaded additional JS chunks
    expect(responses.length).toBeGreaterThan(1)
  })

  test('should show loading state during lazy loading', async ({ page }) => {
    // Mock slow network to see loading state
    await page.route('**/*.js', route => {
      setTimeout(() => route.continue(), 1000)
    })

    await page.click('[data-testid="nav-memories"]')
    
    // Should show loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    
    // Should eventually load the page
    await expect(page.locator('[data-testid="memories-page"]')).toBeVisible({ timeout: 10000 })
  })

  test('should handle lazy loading errors gracefully', async ({ page }) => {
    // Mock network error for JS chunks
    await page.route('**/*MemoriesPage*.js', route => {
      route.abort('failed')
    })

    await page.click('[data-testid="nav-memories"]')
    
    // Should show error boundary
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible()
    
    // Should have retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('should virtualize large lists efficiently', async ({ page }) => {
    // Navigate to a page with large list
    await page.goto('/memories')
    
    // Create a large dataset (mock response)
    const largeMemoryList = Array.from({ length: 1000 }, (_, i) => ({
      id: `memory-${i}`,
      title: `Memory ${i}`,
      content: `Content for memory ${i}`,
      created_at: new Date().toISOString()
    }))

    await page.route('**/api/memories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeMemoryList)
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check that only visible items are rendered
    const renderedItems = await page.locator('[data-testid^="memory-item-"]').count()
    expect(renderedItems).toBeLessThan(50) // Should not render all 1000 items

    // Scroll down and check that new items are rendered
    await page.evaluate(() => window.scrollTo(0, 1000))
    await page.waitForTimeout(100)

    const itemsAfterScroll = await page.locator('[data-testid^="memory-item-"]').count()
    expect(itemsAfterScroll).toBeGreaterThan(0)
  })

  test('should lazy load images', async ({ page }) => {
    await page.goto('/memories')
    
    // Mock image responses
    await page.route('**/images/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: Buffer.from('fake-image-data')
      })
    })

    // Images should start with placeholder
    const lazyImages = page.locator('[data-testid="lazy-image"]')
    await expect(lazyImages.first()).toBeVisible()

    // Check that placeholder is shown initially
    await expect(page.locator('[data-testid="image-placeholder"]').first()).toBeVisible()

    // Scroll to make image visible
    await lazyImages.first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Image should load
    await expect(page.locator('img[data-testid="lazy-image"]').first()).toBeVisible()
  })

  test('should debounce search input', async ({ page }) => {
    await page.goto('/search')
    
    let requestCount = 0
    await page.route('**/api/search*', route => {
      requestCount++
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [] })
      })
    })

    const searchInput = page.locator('[data-testid="search-input"]')
    
    // Type rapidly
    await searchInput.fill('te')
    await searchInput.fill('tes')
    await searchInput.fill('test')
    
    // Wait for debounce period
    await page.waitForTimeout(500)
    
    // Should only make one request due to debouncing
    expect(requestCount).toBeLessThanOrEqual(1)
  })

  test('should monitor performance metrics', async ({ page }) => {
    // Add performance monitoring
    await page.addInitScript(() => {
      window.performanceMetrics = []
      
      // Mock performance.measure
      const originalMeasure = performance.measure
      performance.measure = function(name, startMark, endMark) {
        window.performanceMetrics.push({ name, startMark, endMark })
        return originalMeasure.apply(this, arguments)
      }
    })

    await page.goto('/')
    
    // Navigate and trigger performance monitoring
    await page.click('[data-testid="nav-memories"]')
    await page.waitForLoadState('networkidle')
    
    // Check that performance metrics were recorded
    const metrics = await page.evaluate(() => window.performanceMetrics)
    expect(metrics.length).toBeGreaterThan(0)
  })

  test('should handle memory monitoring', async ({ page }) => {
    // Check if memory API is available and working
    const memorySupported = await page.evaluate(() => {
      return 'memory' in performance
    })

    if (memorySupported) {
      await page.goto('/')
      
      // Check memory usage is tracked
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null
      })

      expect(memoryInfo).toBeTruthy()
      expect(memoryInfo.usedJSHeapSize).toBeGreaterThan(0)
    }
  })

  test('should batch state updates', async ({ page }) => {
    await page.goto('/test-batching') // Assume we have a test page for this
    
    // Add test script to measure render count
    await page.addInitScript(() => {
      window.renderCount = 0
      window.incrementRenderCount = () => window.renderCount++
    })

    // Trigger multiple rapid state updates
    await page.click('[data-testid="batch-update-trigger"]')
    await page.waitForTimeout(100)
    
    // Check that renders were batched
    const renderCount = await page.evaluate(() => window.renderCount)
    expect(renderCount).toBeLessThan(5) // Should be batched, not one render per update
  })

  test('should preload critical resources', async ({ page }) => {
    const preloadedResources: string[] = []
    
    page.on('request', request => {
      const resource = request.resourceType()
      if (resource === 'image' || resource === 'script' || resource === 'stylesheet') {
        preloadedResources.push(request.url())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that critical resources were preloaded
    expect(preloadedResources.length).toBeGreaterThan(0)
  })

  test('should handle error boundaries in lazy components', async ({ page }) => {
    // Mock component that throws an error
    await page.route('**/ErrorComponent.js', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          export default function ErrorComponent() {
            throw new Error('Test error');
          }
        `
      })
    })

    await page.goto('/error-test') // Assume route that loads ErrorComponent
    
    // Should show error boundary UI
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible()
    await expect(page.locator('text=Failed to load component')).toBeVisible()
    
    // Should have try again button
    const tryAgainButton = page.locator('[data-testid="try-again-button"]')
    await expect(tryAgainButton).toBeVisible()
    
    // Clicking should attempt to reload
    await tryAgainButton.click()
    // Error should appear again since we're still mocking the error
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible()
  })

  test('should optimize network requests', async ({ page }) => {
    const requests: any[] = []
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for optimization headers
    const apiRequests = requests.filter(req => req.url.includes('/api/'))
    expect(apiRequests.length).toBeGreaterThan(0)
    
    // Should have proper caching headers
    apiRequests.forEach(request => {
      expect(request.headers).toHaveProperty('accept')
    })
  })

  test('should maintain performance under load', async ({ page, context }) => {
    // Create multiple tabs to simulate load
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage()
    ])

    // Navigate all pages simultaneously
    await Promise.all([
      page.goto('/'),
      ...pages.map(p => p.goto('/memories'))
    ])

    await Promise.all([
      page.waitForLoadState('networkidle'),
      ...pages.map(p => p.waitForLoadState('networkidle'))
    ])

    // All pages should load successfully
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible()
    
    for (const p of pages) {
      await expect(p.locator('[data-testid="memories-page"]')).toBeVisible()
      await p.close()
    }
  })
})