import { test, expect } from '@playwright/test';

// Mock API responses for testing
const mockMemories = [
  {
    id: '1',
    title: 'Test Memory 1',
    content: 'This is a test memory',
    tags: ['test', 'e2e'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Test Memory 2',
    content: 'Another test memory',
    tags: ['test', 'demo'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

test.describe('API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/memories*', async (route) => {
      const url = new URL(route.request().url());
      
      if (route.request().method() === 'GET' && !url.pathname.includes('/')) {
        // List memories
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            memories: mockMemories,
            total: mockMemories.length,
            page: 1,
            pageSize: 20
          })
        });
      } else if (route.request().method() === 'GET') {
        // Get single memory
        const id = url.pathname.split('/').pop();
        const memory = mockMemories.find(m => m.id === id);
        
        if (memory) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(memory)
          });
        } else {
          await route.fulfill({ status: 404 });
        }
      } else if (route.request().method() === 'DELETE') {
        // Delete memory
        await route.fulfill({ status: 204 });
      }
    });

    // Mock analytics API
    await page.route('**/api/analytics/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalMemories: 42,
          totalCollections: 5,
          totalTags: 15,
          searchCount: 156,
          lastUpdated: new Date().toISOString(),
          activities: [],
          patterns: [],
          growth: [],
          distribution: []
        })
      });
    });

    // Mock search API
    await page.route('**/api/search*', async (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get('q') || '';
      
      const filtered = mockMemories.filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.content.toLowerCase().includes(query.toLowerCase())
      );

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          memories: filtered,
          facets: {
            tags: [{ value: 'test', count: 2 }, { value: 'e2e', count: 1 }],
            entities: [],
            dates: []
          },
          total: filtered.length,
          page: 1,
          pageSize: 20,
          query,
          processingTime: 50
        })
      });
    });

    await page.goto('/');
  });

  test('should load memories from API', async ({ page }) => {
    // Navigate to memories page
    await page.click('a[href="/memories"]');
    
    // Wait for loading to complete
    await expect(page.locator('.animate-spin')).toBeVisible();
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
    
    // Check memories are displayed
    await expect(page.locator('text=Test Memory 1')).toBeVisible();
    await expect(page.locator('text=Test Memory 2')).toBeVisible();
    
    // Check total count
    await expect(page.locator('text=2 memories total')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/memories*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    // Navigate to memories page
    await page.click('a[href="/memories"]');
    
    // Should show error toast
    await expect(page.locator('text=Failed to load memories')).toBeVisible();
    await expect(page.locator('text=Please try refreshing the page')).toBeVisible();
    
    // Should show empty state
    await expect(page.locator('text=No memories yet')).toBeVisible();
  });

  test('should search memories using API', async ({ page }) => {
    // Navigate to search page
    await page.click('a[href="/search"]');
    
    // Type search query
    await page.fill('input[placeholder*="Search"]', 'test');
    
    // Wait for debounce and results
    await page.waitForTimeout(500);
    
    // Check results are displayed
    await expect(page.locator('text=Test Memory 1')).toBeVisible();
    await expect(page.locator('text=Test Memory 2')).toBeVisible();
    
    // Search for specific memory
    await page.fill('input[placeholder*="Search"]', 'Another');
    await page.waitForTimeout(500);
    
    // Only one result should show
    await expect(page.locator('text=Test Memory 2')).toBeVisible();
    await expect(page.locator('text=Test Memory 1')).not.toBeVisible();
  });

  test('should delete memory via API', async ({ page }) => {
    // Navigate to memory detail
    await page.goto('/memories/1');
    
    // Wait for memory to load
    await expect(page.locator('h1:has-text("Test Memory 1")')).toBeVisible();
    
    // Mock confirm dialog
    await page.evaluate(() => {
      window.confirm = () => true;
    });
    
    // Click delete button
    await page.click('button:has-text("Delete")');
    
    // Should show success toast
    await expect(page.locator('text=Memory deleted')).toBeVisible();
    await expect(page.locator('text=The memory has been permanently deleted')).toBeVisible();
    
    // Should navigate back to memories
    await expect(page).toHaveURL('/memories');
  });

  test('should handle bulk operations', async ({ page }) => {
    // Navigate to memories page
    await page.click('a[href="/memories"]');
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
    
    // Enable bulk mode
    await page.click('button:has-text("Bulk")');
    
    // Select memories
    const checkboxes = page.locator('input[type="checkbox"][data-memory-item]');
    await checkboxes.first().check();
    await checkboxes.nth(1).check();
    
    // Mock bulk delete API
    await page.route('**/api/memories/bulk-delete', async (route) => {
      await route.fulfill({ status: 204 });
    });
    
    // Delete selected
    await page.click('button:has-text("Delete")');
    
    // Confirm deletion
    await page.click('button:has-text("Yes, delete")');
    
    // Should show success toast
    await expect(page.locator('text=Memories deleted')).toBeVisible();
    await expect(page.locator('text=Successfully deleted 2 memories')).toBeVisible();
  });

  test('should export data via API', async ({ page }) => {
    // Mock export API
    await page.route('**/api/export*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: 'exported' })
      });
    });
    
    // Navigate to settings
    await page.click('a[href="/settings"]');
    
    // Click on Data Export tab
    await page.click('button:has-text("Data Export")');
    
    // Select JSON format
    await page.click('label:has-text("JSON")');
    
    // Click export button
    await page.click('button:has-text("Export Data")');
    
    // Should show success toast
    await expect(page.locator('text=Export complete')).toBeVisible();
    await expect(page.locator('text=Your data has been exported successfully')).toBeVisible();
  });

  test('should show dashboard analytics from API', async ({ page }) => {
    // Dashboard is the home page
    await page.goto('/');
    
    // Wait for analytics to load
    await expect(page.locator('.animate-pulse')).toBeVisible();
    await expect(page.locator('.animate-pulse')).not.toBeVisible({ timeout: 10000 });
    
    // Check stats are displayed
    await expect(page.locator('text=42')).toBeVisible(); // Total memories
    await expect(page.locator('text=5')).toBeVisible();  // Total collections
    await expect(page.locator('text=15')).toBeVisible(); // Total tags
    await expect(page.locator('text=156')).toBeVisible(); // Search count
  });

  test('should handle pagination', async ({ page }) => {
    // Mock paginated response
    await page.route('**/api/memories*', async (route) => {
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get('page') || '1';
      const page = parseInt(pageParam);
      
      // Create 50 mock memories
      const allMemories = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Memory ${i + 1}`,
        content: `Content for memory ${i + 1}`,
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Paginate
      const pageSize = 20;
      const start = (page - 1) * pageSize;
      const memories = allMemories.slice(start, start + pageSize);
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          memories,
          total: allMemories.length,
          page,
          pageSize
        })
      });
    });
    
    // Navigate to memories
    await page.click('a[href="/memories"]');
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
    
    // Should show total count
    await expect(page.locator('text=50 memories total')).toBeVisible();
    
    // Should show first page memories
    await expect(page.locator('text=Memory 1')).toBeVisible();
    await expect(page.locator('text=Memory 20')).toBeVisible();
    await expect(page.locator('text=Memory 21')).not.toBeVisible();
  });

  test('should handle real-time updates', async ({ page }) => {
    // Navigate to memories
    await page.click('a[href="/memories"]');
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
    
    // Simulate WebSocket message for new memory
    await page.evaluate(() => {
      const event = new CustomEvent('memory:created', {
        detail: {
          id: '3',
          title: 'Real-time Memory',
          content: 'Created via WebSocket',
          tags: ['realtime'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      window.dispatchEvent(event);
    });
    
    // New memory should appear
    await expect(page.locator('text=Real-time Memory')).toBeVisible();
    
    // Total count should update
    await expect(page.locator('text=3 memories total')).toBeVisible();
  });
});