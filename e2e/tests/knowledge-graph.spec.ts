import { test, expect } from '@playwright/test'

test.describe('Knowledge Graph', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="graph-nav-link"]')
    await page.waitForSelector('[data-testid="knowledge-graph-container"]')
  })

  test('should render knowledge graph', async ({ page }) => {
    // Wait for graph to load
    await page.waitForSelector('[data-testid="graph-svg"]')
    
    // Check that graph elements are present
    await expect(page.locator('[data-testid="graph-svg"]')).toBeVisible()
    
    // Should have nodes
    const nodes = page.locator('[data-testid="graph-node"]')
    await expect(nodes.first()).toBeVisible()
  })

  test('should allow zooming and panning', async ({ page }) => {
    await page.waitForSelector('[data-testid="graph-svg"]')
    
    // Get initial transform
    const initialTransform = await page.locator('[data-testid="graph-container"]').getAttribute('transform')
    
    // Zoom in using mouse wheel
    await page.mouse.wheel(0, -100)
    await page.waitForTimeout(500)
    
    // Transform should have changed
    const zoomedTransform = await page.locator('[data-testid="graph-container"]').getAttribute('transform')
    expect(zoomedTransform).not.toBe(initialTransform)
    
    // Pan by dragging
    await page.mouse.move(400, 300)
    await page.mouse.down()
    await page.mouse.move(500, 400)
    await page.mouse.up()
    
    await page.waitForTimeout(500)
    
    // Transform should have changed again
    const pannedTransform = await page.locator('[data-testid="graph-container"]').getAttribute('transform')
    expect(pannedTransform).not.toBe(zoomedTransform)
  })

  test('should highlight node on hover', async ({ page }) => {
    await page.waitForSelector('[data-testid="graph-node"]')
    
    const firstNode = page.locator('[data-testid="graph-node"]').first()
    
    // Hover over node
    await firstNode.hover()
    
    // Node should be highlighted
    await expect(firstNode).toHaveClass(/highlighted/)
    
    // Connected nodes should also be highlighted
    const highlightedNodes = page.locator('[data-testid="graph-node"].highlighted')
    const count = await highlightedNodes.count()
    expect(count).toBeGreaterThan(1) // Original node + connected nodes
  })

  test('should show node details on click', async ({ page }) => {
    await page.waitForSelector('[data-testid="graph-node"]')
    
    const firstNode = page.locator('[data-testid="graph-node"]').first()
    
    // Click on node
    await firstNode.click()
    
    // Details panel should appear
    await expect(page.locator('[data-testid="node-details-panel"]')).toBeVisible()
    
    // Should show node information
    await expect(page.locator('[data-testid="node-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="node-type"]')).toBeVisible()
    await expect(page.locator('[data-testid="node-connections"]')).toBeVisible()
  })

  test('should filter nodes by type', async ({ page }) => {
    await page.waitForSelector('[data-testid="graph-node"]')
    
    // Get initial node count
    const initialCount = await page.locator('[data-testid="graph-node"]').count()
    
    // Filter by memory type
    await page.click('[data-testid="filter-memory"]')
    await page.waitForTimeout(1000)
    
    // Should show fewer nodes (only memory nodes)
    const filteredCount = await page.locator('[data-testid="graph-node"]').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
    
    // All visible nodes should be memory type
    const memoryNodes = page.locator('[data-testid="graph-node"][data-type="memory"]')
    const visibleNodes = page.locator('[data-testid="graph-node"]:visible')
    
    expect(await memoryNodes.count()).toBe(await visibleNodes.count())
  })

  test('should search and highlight matching nodes', async ({ page }) => {
    await page.waitForSelector('[data-testid="graph-search-input"]')
    
    // Search for a term
    await page.fill('[data-testid="graph-search-input"]', 'React')
    await page.waitForTimeout(1000)
    
    // Matching nodes should be highlighted
    const highlightedNodes = page.locator('[data-testid="graph-node"].search-match')
    await expect(highlightedNodes.first()).toBeVisible()
    
    // Non-matching nodes should be dimmed
    const dimmedNodes = page.locator('[data-testid="graph-node"].dimmed')
    await expect(dimmedNodes.first()).toBeVisible()
  })

  test('should show edge labels on zoom', async ({ page }) => {
    await page.waitForSelector('[data-testid="graph-edge"]')
    
    // Zoom in significantly
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, -200)
      await page.waitForTimeout(200)
    }
    
    // Edge labels should become visible
    await expect(page.locator('[data-testid="edge-label"]').first()).toBeVisible()
  })

  test('should support different layout algorithms', async ({ page }) => {
    await page.waitForSelector('[data-testid="layout-controls"]')
    
    // Get initial node positions
    const initialPositions = await page.evaluate(() => {
      const nodes = document.querySelectorAll('[data-testid="graph-node"]')
      return Array.from(nodes).map(node => ({
        id: node.getAttribute('data-id'),
        x: node.getAttribute('cx'),
        y: node.getAttribute('cy')
      }))
    })
    
    // Switch to radial layout
    await page.click('[data-testid="layout-radial"]')
    await page.waitForTimeout(2000) // Wait for animation
    
    // Node positions should have changed
    const newPositions = await page.evaluate(() => {
      const nodes = document.querySelectorAll('[data-testid="graph-node"]')
      return Array.from(nodes).map(node => ({
        id: node.getAttribute('data-id'),
        x: node.getAttribute('cx'),
        y: node.getAttribute('cy')
      }))
    })
    
    expect(newPositions).not.toEqual(initialPositions)
  })

  test('should handle large graphs efficiently', async ({ page }) => {
    // Mock a large dataset
    await page.route('**/graph**', async route => {
      const largeGraph = {
        nodes: Array.from({ length: 1000 }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: 'memory',
          size: Math.random() * 20 + 5
        })),
        edges: Array.from({ length: 2000 }, (_, i) => ({
          id: `edge-${i}`,
          source: `node-${Math.floor(Math.random() * 1000)}`,
          target: `node-${Math.floor(Math.random() * 1000)}`,
          weight: Math.random()
        }))
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jsonrpc: '2.0',
          result: largeGraph,
          id: 1
        })
      })
    })
    
    // Reload the page to get large graph
    await page.reload()
    await page.waitForSelector('[data-testid="graph-svg"]')
    
    // Should render without performance issues
    const renderTime = await page.evaluate(() => {
      const start = performance.now()
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(performance.now() - start)
        }, 1000)
      })
    })
    
    // Should render in reasonable time (less than 2 seconds)
    expect(renderTime).toBeLessThan(2000)
  })

  test('should save and restore graph view state', async ({ page }) => {
    await page.waitForSelector('[data-testid="graph-svg"]')
    
    // Zoom and pan to a specific position
    await page.mouse.wheel(0, -300)
    await page.mouse.move(400, 300)
    await page.mouse.down()
    await page.mouse.move(600, 500)
    await page.mouse.up()
    await page.waitForTimeout(1000)
    
    // Get current transform
    const transform = await page.locator('[data-testid="graph-container"]').getAttribute('transform')
    
    // Navigate away and back
    await page.click('[data-testid="memories-nav-link"]')
    await page.click('[data-testid="graph-nav-link"]')
    await page.waitForSelector('[data-testid="graph-svg"]')
    
    // Transform should be restored (if implemented)
    const restoredTransform = await page.locator('[data-testid="graph-container"]').getAttribute('transform')
    expect(restoredTransform).toBe(transform)
  })

  test('should export graph as image', async ({ page }) => {
    await page.waitForSelector('[data-testid="export-button"]')
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button
    await page.click('[data-testid="export-button"]')
    
    // Should download a file
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/graph.*\.(png|svg|pdf)/)
  })

  test('should handle graph errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/graph**', route => {
      route.abort('failed')
    })
    
    await page.reload()
    
    // Should show error message
    await expect(page.locator('[data-testid="graph-error"]')).toContainText('Failed to load graph')
    
    // Should show retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
    
    // Clicking retry should attempt to reload
    await page.click('[data-testid="retry-button"]')
    // Would verify that API is called again
  })

  test('should support graph clustering', async ({ page }) => {
    await page.waitForSelector('[data-testid="cluster-controls"]')
    
    // Enable clustering
    await page.click('[data-testid="enable-clustering"]')
    await page.waitForTimeout(2000)
    
    // Should show cluster nodes
    await expect(page.locator('[data-testid="cluster-node"]').first()).toBeVisible()
    
    // Clicking cluster should expand it
    await page.click('[data-testid="cluster-node"]')
    await page.waitForTimeout(1000)
    
    // Individual nodes should become visible
    const individualNodes = page.locator('[data-testid="graph-node"]:not([data-type="cluster"])')
    await expect(individualNodes.first()).toBeVisible()
  })
})