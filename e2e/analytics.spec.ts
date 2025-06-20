import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

  test('should display analytics dashboard', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    
    // Check for key metrics cards
    await expect(page.locator('text=Total Memories')).toBeVisible();
    await expect(page.locator('text=Collections')).toBeVisible();
    await expect(page.locator('text=Total Tags')).toBeVisible();
    await expect(page.locator('text=Entities')).toBeVisible();
  });

  test('should show time range selector', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check for time range buttons
    await expect(page.locator('button:has-text("Week")')).toBeVisible();
    await expect(page.locator('button:has-text("Month")')).toBeVisible();
    await expect(page.locator('button:has-text("Year")')).toBeVisible();
    
    // Test clicking different ranges
    await page.click('button:has-text("Week")');
    await expect(page.locator('button:has-text("Week")')).toHaveClass(/bg-primary/);
    
    await page.click('button:has-text("Year")');
    await expect(page.locator('button:has-text("Year")')).toHaveClass(/bg-primary/);
  });

  test('should display charts', async ({ page }) => {
    await page.goto('/analytics');
    
    // Wait for charts to load
    await page.waitForTimeout(1000);
    
    // Check for chart sections
    await expect(page.locator('text=Memory Growth')).toBeVisible();
    await expect(page.locator('text=Collection Distribution')).toBeVisible();
    await expect(page.locator('text=Most Used Tags')).toBeVisible();
    await expect(page.locator('text=Entity Types')).toBeVisible();
    
    // Check for SVG elements (charts)
    const charts = page.locator('svg.recharts-surface');
    await expect(charts).toHaveCount(4, { timeout: 5000 });
  });

  test('should show recent activity', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check for activity section
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    
    // Check for activity metrics
    await expect(page.locator('text=Memories this month')).toBeVisible();
    await expect(page.locator('text=Average memory length')).toBeVisible();
    await expect(page.locator('text=Most active day')).toBeVisible();
    await expect(page.locator('text=Peak hour')).toBeVisible();
  });

  test('should display popular searches', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check for search queries section
    await expect(page.locator('text=Popular Searches')).toBeVisible();
    
    // Check for search query items
    const searchQueries = page.locator('text=project updates, text=meeting notes').first();
    await expect(searchQueries).toBeVisible();
  });

  test('should show storage usage', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check for storage section
    await expect(page.locator('text=Storage Usage')).toBeVisible();
    
    // Check for storage bar
    const storageBar = page.locator('.bg-blue-600.h-3.rounded-full');
    await expect(storageBar).toBeVisible();
    
    // Check for memory type breakdown
    await expect(page.locator('text=Note')).toBeVisible();
    await expect(page.locator('text=Document')).toBeVisible();
  });

  test('should display performance metrics', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check for performance section
    await expect(page.locator('text=Performance Metrics')).toBeVisible();
    
    // Check for metrics
    await expect(page.locator('text=Search Success Rate')).toBeVisible();
    await expect(page.locator('text=Avg Response Time')).toBeVisible();
    await expect(page.locator('text=API Calls Today')).toBeVisible();
    await expect(page.locator('text=Cache Hit Rate')).toBeVisible();
    await expect(page.locator('text=Uptime')).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    // Clear local data
    await page.evaluate(() => {
      localStorage.removeItem('memory-store');
      localStorage.removeItem('collection-store');
    });
    
    await page.goto('/analytics');
    
    // Should still show dashboard structure
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    
    // Metrics should show zero
    const totalMemories = page.locator('text=Total Memories').locator('..').locator('.text-2xl');
    await expect(totalMemories).toContainText('0');
  });

  test('analytics data should update when memories change', async ({ page }) => {
    await page.goto('/analytics');
    
    // Get initial memory count
    const memoryCount = page.locator('text=Total Memories').locator('..').locator('.text-2xl');
    const initialCount = await memoryCount.textContent();
    
    // Navigate to memories and create one
    await page.goto('/memories/new');
    await page.fill('input[name="title"], input[placeholder*="title"]', 'Analytics Test Memory');
    await page.fill('textarea[name="content"], .md-editor-text-input', 'Test content for analytics');
    await page.click('button:has-text("Save"), button:has-text("Create")');
    
    // Go back to analytics
    await page.goto('/analytics');
    
    // Count should have increased
    const newCount = await memoryCount.textContent();
    expect(parseInt(newCount || '0')).toBeGreaterThan(parseInt(initialCount || '0'));
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/analytics');
    
    // Check that content is still visible
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    await expect(page.locator('text=Total Memories')).toBeVisible();
    
    // Charts should stack vertically
    const chartContainers = page.locator('.lg\\:grid-cols-2');
    for (const container of await chartContainers.all()) {
      await expect(container).toHaveClass(/grid-cols-1/);
    }
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Content should adjust
    await expect(page.locator('h1')).toBeVisible();
  });
});