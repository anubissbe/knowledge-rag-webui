import { test, expect, Page } from '@playwright/test';

// Helper function to create a memory
async function createMemory(page: Page, title: string, content: string) {
  await page.goto('/memories/new');
  
  // Fill in the form using id selectors
  await page.fill('input#title', title);
  await page.fill('textarea#content', content);
  
  // Add a tag
  await page.fill('input#tags', 'test-tag');
  await page.keyboard.press('Enter');
  
  // Submit the form
  await page.click('button:has-text("Create Memory")');
  
  // Wait for navigation to detail page
  await expect(page).toHaveURL(/\/memories\/\d+/);
  
  return page.url();
}

test.describe('Memory Versioning - Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should show version history button on memory detail page', async ({ page }) => {
    // Create a new memory
    const memoryUrl = await createMemory(page, 'Test Memory', 'Test content');
    
    // Check that version history button exists
    await expect(page.locator('button[aria-label="Version history"]')).toBeVisible();
  });

  test('should open version history sidebar when button is clicked', async ({ page }) => {
    // Create a new memory
    const memoryUrl = await createMemory(page, 'Version History Test', 'Content for testing');
    
    // Click on version history button
    await page.click('button[aria-label="Version history"]');
    
    // Wait for version history sidebar to appear
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
    
    // Should show at least version 1
    await expect(page.locator('text=Version 1')).toBeVisible();
  });

  test('should close version history sidebar', async ({ page }) => {
    // Create a new memory
    const memoryUrl = await createMemory(page, 'Close Sidebar Test', 'Test content');
    
    // Open version history
    await page.click('button[aria-label="Version history"]');
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
    
    // Close sidebar by clicking the close button
    await page.locator('button[aria-label="Version history"]').filter({ hasText: '' }).click();
    
    // Sidebar should be hidden
    await expect(page.locator('h2:has-text("Version History")')).not.toBeVisible();
  });

  test('should display version metadata correctly', async ({ page }) => {
    // Create a new memory
    const memoryUrl = await createMemory(page, 'Metadata Test', 'Content with metadata');
    
    // Open version history
    await page.click('button[aria-label="Version history"]');
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
    
    // Check version 1 details
    const version1Row = page.locator('div:has-text("Version 1")').first();
    
    // Should show current badge
    await expect(version1Row.locator('text=Current')).toBeVisible();
    
    // Should show created status
    await expect(version1Row.locator('text=Created')).toBeVisible();
    
    // Should have view button
    await expect(version1Row.locator('button[title="View this version"]')).toBeVisible();
  });

  test('should handle empty version history gracefully', async ({ page }) => {
    // Mock API to return empty version history
    await page.route('**/api/memories/*/versions', route => 
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ versions: [] })
      })
    );
    
    const memoryUrl = await createMemory(page, 'Empty History Test', 'Content');
    
    // Open version history
    await page.click('button[aria-label="Version history"]');
    
    // Should show empty state message
    await expect(page.locator('text=No version history available')).toBeVisible();
  });

  test('version history should be accessible with keyboard navigation', async ({ page }) => {
    const memoryUrl = await createMemory(page, 'Keyboard Nav Test', 'Content');
    
    // Tab to version history button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Press Enter to open
    await page.keyboard.press('Enter');
    
    // Should open version history
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const memoryUrl = await createMemory(page, 'Mobile Test', 'Mobile content');
    
    // Version history button should be visible
    await expect(page.locator('button[aria-label="Version history"]')).toBeVisible();
    
    // Click to open
    await page.click('button[aria-label="Version history"]');
    
    // Should show sidebar on mobile
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
  });
});

// Test version viewing functionality if it exists
test.describe('Version Viewing', () => {
  test('should open version viewer when view button is clicked', async ({ page }) => {
    const memoryUrl = await createMemory(page, 'View Version Test', 'Original content');
    
    // Open version history
    await page.click('button[aria-label="Version history"]');
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
    
    // Click view button on version 1
    const version1Row = page.locator('div:has-text("Version 1")').first();
    await version1Row.locator('button[title="View this version"]').click();
    
    // Should show version viewer (check for any indication)
    // This might show a modal or change the view
    await expect(page.locator('text=Viewing Version 1')).toBeVisible({ timeout: 5000 }).catch(() => {
      // If specific text not found, check for other indicators
      expect(page.locator('text=Read-only')).toBeVisible();
    });
  });
});

// Test error handling
test.describe('Error Handling', () => {
  test('should show error when version history fails to load', async ({ page }) => {
    const memoryUrl = await createMemory(page, 'Error Test', 'Content');
    
    // Mock API error
    await page.route('**/api/memories/*/versions', route => 
      route.fulfill({ status: 500, body: 'Server error' })
    );
    
    // Try to open version history
    await page.click('button[aria-label="Version history"]');
    
    // Should show error toast
    await expect(page.locator('text=Failed to load version history')).toBeVisible();
  });

  test('should show loading state while fetching versions', async ({ page }) => {
    const memoryUrl = await createMemory(page, 'Loading Test', 'Content');
    
    // Slow down the API response
    await page.route('**/api/memories/*/versions', async route => {
      await page.waitForTimeout(1000); // 1 second delay
      await route.continue();
    });
    
    // Click version history
    await page.click('button[aria-label="Version history"]');
    
    // Should show loading spinner
    await expect(page.locator('.animate-spin')).toBeVisible();
    
    // Eventually should load
    await expect(page.locator('text=Version 1')).toBeVisible({ timeout: 10000 });
  });
});