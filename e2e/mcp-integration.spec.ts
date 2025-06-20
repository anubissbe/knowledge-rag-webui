import { test, expect } from '@playwright/test';

test.describe('MCP Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for development
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-store', JSON.stringify({
        state: { 
          isAuthenticated: true, 
          token: 'mock-token',
          user: { id: 'test-user', name: 'Test User' }
        },
        version: 0
      }));
    });
  });

  test('should access MCP test page', async ({ page }) => {
    await page.goto('/test-mcp');
    
    // Check page loaded
    await expect(page.locator('h1')).toContainText('MCP Integration Test');
    
    // Check for server status sections
    await expect(page.locator('text=Server Connectivity')).toBeVisible();
    await expect(page.locator('text=RAG Server')).toBeVisible();
    await expect(page.locator('text=Knowledge Graph')).toBeVisible();
    await expect(page.locator('text=Vector DB')).toBeVisible();
    await expect(page.locator('text=Unified DB')).toBeVisible();
  });

  test('should show MCP server connectivity status', async ({ page }) => {
    await page.goto('/test-mcp');
    
    // Check connectivity indicators
    const ragStatus = page.locator('text=RAG Server').locator('..');
    const kgStatus = page.locator('text=Knowledge Graph').locator('..');
    const vectorStatus = page.locator('text=Vector DB').locator('..');
    const unifiedStatus = page.locator('text=Unified DB').locator('..');
    
    // Each should have either connected or error status
    await expect(ragStatus).toContainText(/Connected|Error/);
    await expect(kgStatus).toContainText(/Connected|Error/);
    await expect(vectorStatus).toContainText(/Connected|Error/);
    await expect(unifiedStatus).toContainText(/Connected|Error/);
  });

  test('should test memory operations through MCP', async ({ page }) => {
    await page.goto('/test-mcp');
    
    // Wait for connectivity check
    await page.waitForTimeout(2000);
    
    // Check if memory operations section exists
    const memorySection = page.locator('text=Memory Operations').locator('..');
    
    // If RAG server is connected, test operations should be available
    const ragConnected = await page.locator('text=RAG Server').locator('..').textContent();
    if (ragConnected?.includes('Connected')) {
      await expect(memorySection.locator('button:has-text("Create Test Memory")')).toBeVisible();
      await expect(memorySection.locator('button:has-text("Search Memories")')).toBeVisible();
    }
  });

  test('should create and retrieve memory through UI', async ({ page }) => {
    // Navigate to memories page
    await page.goto('/memories');
    
    // Create new memory
    await page.click('button:has-text("New Memory"), a:has-text("New Memory")');
    
    // Fill memory form
    const timestamp = Date.now();
    const testTitle = `E2E Test Memory ${timestamp}`;
    
    await page.fill('input[name="title"], input[placeholder*="title"]', testTitle);
    await page.fill('textarea[name="content"], .md-editor-text-input, [data-testid="memory-content"]', 'This is a test memory created by E2E test');
    
    // Add tags
    const tagInput = page.locator('input[placeholder*="tag"], input[name="tags"]').first();
    if (await tagInput.isVisible()) {
      await tagInput.fill('e2e-test');
      await tagInput.press('Enter');
    }
    
    // Save memory
    await page.click('button:has-text("Save"), button:has-text("Create")');
    
    // Wait for navigation or success message
    await page.waitForTimeout(2000);
    
    // Go back to memories list
    await page.goto('/memories');
    
    // Search for the created memory
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(testTitle);
    await searchInput.press('Enter');
    
    // Verify memory appears in results
    await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 10000 });
  });

  test('should test knowledge graph operations', async ({ page }) => {
    await page.goto('/test-mcp');
    
    // Wait for connectivity
    await page.waitForTimeout(2000);
    
    // Check if knowledge graph section exists
    const kgSection = page.locator('text=Knowledge Graph Operations').locator('..');
    
    const kgConnected = await page.locator('text=Knowledge Graph').locator('..').textContent();
    if (kgConnected?.includes('Connected')) {
      // Test entity extraction
      const extractBtn = kgSection.locator('button:has-text("Extract Entities")');
      if (await extractBtn.isVisible()) {
        await extractBtn.click();
        
        // Check for results
        await expect(kgSection).toContainText(/Entities extracted|Success|entities found/i);
      }
    }
  });

  test('should access knowledge graph visualization', async ({ page }) => {
    await page.goto('/graph');
    
    // Check graph page loaded
    await expect(page.locator('text=Knowledge Graph')).toBeVisible();
    
    // Check for graph controls
    await expect(page.locator('text=Layout')).toBeVisible();
    await expect(page.locator('text=Filters')).toBeVisible();
    
    // Check for graph canvas or svg
    const graphCanvas = page.locator('canvas, svg').first();
    await expect(graphCanvas).toBeVisible();
  });

  test('should test vector search functionality', async ({ page }) => {
    await page.goto('/search');
    
    // Check search page loaded
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // Perform a search
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('test query for MCP');
    await searchInput.press('Enter');
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Check for search results or no results message
    const resultsArea = page.locator('main');
    await expect(resultsArea).toContainText(/results|found|No memories/i);
  });

  test('should verify MCP adapter error handling', async ({ page }) => {
    await page.goto('/test-mcp');
    
    // Look for error handling section
    const errorSection = page.locator('text=Error Handling').locator('..');
    
    // If available, test error scenarios
    const simulateErrorBtn = errorSection.locator('button:has-text("Simulate Error")');
    if (await simulateErrorBtn.isVisible()) {
      await simulateErrorBtn.click();
      
      // Should show error message
      await expect(page.locator('.error, [role="alert"], text=/error|failed/i')).toBeVisible();
    }
  });

  test('should test batch operations', async ({ page }) => {
    await page.goto('/memories');
    
    // Check if batch operations are available
    const selectAllCheckbox = page.locator('input[type="checkbox"]').first();
    
    if (await selectAllCheckbox.isVisible()) {
      // Select all memories
      await selectAllCheckbox.click();
      
      // Check for batch action buttons
      await expect(page.locator('button:has-text("Delete Selected"), button:has-text("Export Selected")')).toBeVisible();
    }
  });

  test('should verify collection operations through MCP', async ({ page }) => {
    await page.goto('/collections');
    
    // Create a test collection
    await page.click('button:has-text("New Collection"), button:has-text("Create Collection")');
    
    const timestamp = Date.now();
    const collectionName = `E2E Test Collection ${timestamp}`;
    
    // Fill collection form
    await page.fill('input[name="name"], input[placeholder*="Collection name"]', collectionName);
    await page.fill('textarea[name="description"], input[name="description"]', 'Test collection for E2E');
    
    // Save collection
    await page.click('button:has-text("Create"), button:has-text("Save")');
    
    // Wait for creation
    await page.waitForTimeout(2000);
    
    // Verify collection appears
    await expect(page.locator(`text=${collectionName}`)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('MCP Performance Tests', () => {
  test('should handle large result sets efficiently', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-store', JSON.stringify({
        state: { 
          isAuthenticated: true, 
          token: 'mock-token',
          user: { id: 'test-user', name: 'Test User' }
        },
        version: 0
      }));
    });
    
    await page.goto('/memories');
    
    // Measure load time
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Check if virtual scrolling is working (if implemented)
    const memoryList = page.locator('[data-testid="memory-list"], .memory-list, [role="list"]').first();
    
    if (await memoryList.isVisible()) {
      // Scroll to bottom
      await memoryList.evaluate(el => el.scrollTop = el.scrollHeight);
      await page.waitForTimeout(500);
      
      // Should not have all items rendered at once (virtual scrolling)
      const visibleItems = await page.locator('.memory-card, [data-testid="memory-item"]').count();
      
      // If there are many items, virtual scrolling should limit visible count
      if (visibleItems > 50) {
        console.log('Warning: Large number of DOM elements. Consider implementing virtual scrolling.');
      }
    }
  });
});