import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Basic Tests', () => {
  test('Mobile navigation works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu button is visible
    const mobileMenuButton = page.locator('[aria-label="Toggle menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Click mobile menu button
    await mobileMenuButton.click();
    
    // Check navigation items are visible
    await expect(page.locator('text=Memories')).toBeVisible();
    await expect(page.locator('text=Search')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('Touch interactions work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/memories');
    
    // Test search input touch interaction
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.click();
    await expect(searchInput).toBeFocused();
    
    // Test new memory button
    const newMemoryButton = page.locator('text=New').or(page.locator('text=New Memory'));
    await expect(newMemoryButton).toBeVisible();
  });

  test('Settings adapts to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/settings');
    
    // Check for mobile dropdown
    await expect(page.locator('select#mobile-settings-nav')).toBeVisible();
    
    // Test dropdown functionality
    await page.selectOption('select#mobile-settings-nav', 'api-keys');
    await expect(page.locator('text=API Keys')).toBeVisible();
  });

  test('Search page works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');
    
    // Test search input
    const searchInput = page.locator('input[placeholder*="Search your memories"]');
    await expect(searchInput).toBeVisible();
    
    // Test filter button
    const filterButton = page.locator('button:has-text("Filters")');
    await expect(filterButton).toBeVisible();
  });

  test('Tablet layout works', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/memories');
    
    // Check navigation is still visible (not mobile menu for tablet)
    await expect(page.locator('[aria-label="Toggle menu"]')).not.toBeVisible();
    
    // Check grid layout
    const memoryGrid = page.locator('[class*="grid"]').first();
    await expect(memoryGrid).toBeVisible();
  });
});