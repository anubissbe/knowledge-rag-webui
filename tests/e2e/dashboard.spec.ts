import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays dashboard with stats cards', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check stats cards are present using more specific selectors
    await expect(page.locator('p:has-text("Total Memories") >> nth=0')).toBeVisible();
    await expect(page.locator('text=Collections >> nth=0')).toBeVisible();
    await expect(page.locator('text=Unique Tags')).toBeVisible();
    await expect(page.locator('text=Searches >> nth=0')).toBeVisible();
  });

  test('displays memory growth chart', async ({ page }) => {
    await expect(page.locator('text=Memory Growth')).toBeVisible();
    
    // Check for chart container (recharts creates SVG)
    await expect(page.locator('svg')).toBeVisible();
  });

  test('shows recent activity feed', async ({ page }) => {
    await expect(page.locator('h3:has-text("Recent Activity")')).toBeVisible();
  });

  test('displays top tags section', async ({ page }) => {
    await expect(page.locator('text=Top Tags')).toBeVisible();
  });

  test('shows search insights', async ({ page }) => {
    await expect(page.locator('text=Search Insights')).toBeVisible();
  });

  test('displays usage metrics', async ({ page }) => {
    await expect(page.locator('text=Usage Metrics')).toBeVisible();
    await expect(page.locator('text=Avg Memory Length')).toBeVisible();
    await expect(page.locator('text=This Week >> nth=0')).toBeVisible();
    await expect(page.locator('text=Total Content')).toBeVisible();
    await expect(page.locator('text=Reading Time')).toBeVisible();
  });

  test('time range selector works', async ({ page }) => {
    const timeRangeSelect = page.locator('select');
    await expect(timeRangeSelect).toBeVisible();
    
    // Change time range
    await timeRangeSelect.selectOption('7d');
    await expect(timeRangeSelect).toHaveValue('7d');
    
    await timeRangeSelect.selectOption('90d');
    await expect(timeRangeSelect).toHaveValue('90d');
  });

  test('performance insights section is visible', async ({ page }) => {
    await expect(page.locator('text=Performance Insights')).toBeVisible();
    await expect(page.locator('text=Memories created this week')).toBeVisible();
    await expect(page.locator('text=Average words per memory')).toBeVisible();
    await expect(page.locator('text=Memories per tag average')).toBeVisible();
  });

  test('loading state is handled properly', async ({ page }) => {
    // Check that dashboard loads without errors
    await page.waitForLoadState('networkidle');
    
    // Verify no error messages
    await expect(page.locator('text=Error')).not.toBeVisible();
    await expect(page.locator('text=Failed')).not.toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that dashboard is still functional
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Total Memories')).toBeVisible();
    
    // Stats cards should stack on mobile
    const statsCards = page.locator('[class*="grid-cols-1"]');
    await expect(statsCards).toBeVisible();
  });

  test('dark mode compatibility', async ({ page }) => {
    // Toggle to dark mode (assuming theme toggle exists)
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }
    
    // Check that dashboard still functions in dark mode
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Total Memories')).toBeVisible();
  });

  test('accessibility requirements', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for proper ARIA labels
    const timeRangeSelect = page.locator('select');
    if (await timeRangeSelect.isVisible()) {
      await expect(timeRangeSelect).toHaveAttribute('aria-label');
    }
    
    // Check that interactive elements are keyboard accessible
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});