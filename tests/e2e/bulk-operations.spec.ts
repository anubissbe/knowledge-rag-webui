import { test, expect } from '@playwright/test';

test.describe('Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/memories');
  });

  test('should enable bulk selection mode', async ({ page }) => {
    // Check if memories are present
    await expect(page.locator('[data-testid="memory-card"]').first()).toBeVisible();
    
    // Click Select button to enable bulk mode
    await page.click('button:has-text("Select")');
    
    // Should show Cancel button instead of Select
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    
    // Should show selection checkboxes
    await expect(page.locator('[data-testid="bulk-checkbox"]').first()).toBeVisible();
  });

  test('should select and deselect individual memories', async ({ page }) => {
    // Enable bulk mode
    await page.click('button:has-text("Select")');
    
    // Click first memory checkbox
    await page.locator('[data-testid="bulk-checkbox"]').first().click();
    
    // Should show bulk toolbar
    await expect(page.locator(':has-text("1 memory selected")')).toBeVisible();
    
    // Should show bulk actions
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
    
    // Click checkbox again to deselect
    await page.locator('[data-testid="bulk-checkbox"]').first().click();
    
    // Toolbar should disappear
    await expect(page.locator(':has-text("selected")')).not.toBeVisible();
  });

  test('should select all memories', async ({ page }) => {
    // Enable bulk mode
    await page.click('button:has-text("Select")');
    
    // Click select all
    await page.click('button:has-text("Select all")');
    
    // Should show bulk toolbar with correct count
    await expect(page.locator(':has-text("memories selected")')).toBeVisible();
    
    // All checkboxes should be checked
    const checkboxes = page.locator('[data-testid="bulk-checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('should export memories as JSON', async ({ page }) => {
    // Enable bulk mode and select first memory
    await page.click('button:has-text("Select")');
    await page.locator('[data-testid="bulk-checkbox"]').first().click();
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Click JSON export option
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export as JSON")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('memories.json');
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    // Enable bulk mode and select first memory
    await page.click('button:has-text("Select")');
    await page.locator('[data-testid="bulk-checkbox"]').first().click();
    
    // Click delete button
    await page.click('button:has-text("Delete")');
    
    // Should show confirmation modal
    await expect(page.locator(':has-text("Delete Memories")')).toBeVisible();
    await expect(page.locator(':has-text("This action cannot be undone")')).toBeVisible();
    
    // Should have Cancel and Delete buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete"):not(:has-text("Memories"))')).toBeVisible();
  });

  test('should add tags to selected memories', async ({ page }) => {
    // Enable bulk mode and select first memory
    await page.click('button:has-text("Select")');
    await page.locator('[data-testid="bulk-checkbox"]').first().click();
    
    // Click add tags button
    await page.click('button:has-text("Add Tags")');
    
    // Should show tags input form
    await expect(page.locator('input[placeholder="tag1, tag2, tag3"]')).toBeVisible();
    
    // Type tags and submit
    await page.fill('input[placeholder="tag1, tag2, tag3"]', 'test, bulk');
    await page.click('button:has-text("Add Tags"):not(:has-text("Add Tags"))');
    
    // Menu should close
    await expect(page.locator('input[placeholder="tag1, tag2, tag3"]')).not.toBeVisible();
  });

  test('should show collection assignment menu', async ({ page }) => {
    // Enable bulk mode and select first memory
    await page.click('button:has-text("Select")');
    await page.locator('[data-testid="bulk-checkbox"]').first().click();
    
    // Click add to collection button
    await page.click('button:has-text("Add to Collection")');
    
    // Should show collection options
    await expect(page.locator(':has-text("Personal")')).toBeVisible();
    await expect(page.locator(':has-text("Work")')).toBeVisible();
    await expect(page.locator(':has-text("Research")')).toBeVisible();
  });

  test('should clear selection', async ({ page }) => {
    // Enable bulk mode and select memories
    await page.click('button:has-text("Select")');
    await page.locator('[data-testid="bulk-checkbox"]').first().click();
    
    // Should show bulk toolbar
    await expect(page.locator(':has-text("1 memory selected")')).toBeVisible();
    
    // Click clear selection (X button)
    await page.locator('[aria-label="Clear selection"]').click();
    
    // Selection should be cleared
    await expect(page.locator(':has-text("selected")')).not.toBeVisible();
  });

  test('should exit bulk mode', async ({ page }) => {
    // Enable bulk mode
    await page.click('button:has-text("Select")');
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    
    // Click Cancel to exit bulk mode
    await page.click('button:has-text("Cancel")');
    
    // Should be back to normal mode
    await expect(page.locator('button:has-text("Select")')).toBeVisible();
    await expect(page.locator('[data-testid="bulk-checkbox"]')).not.toBeVisible();
  });

  test('should handle mobile bulk operations', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test');
    
    // Enable bulk mode
    await page.click('button:has-text("Select")');
    
    // Select a memory
    await page.locator('[data-testid="bulk-checkbox"]').first().click();
    
    // Bulk toolbar should be responsive on mobile
    const toolbar = page.locator(':has-text("memory selected")');
    await expect(toolbar).toBeVisible();
    
    // Actions should be accessible
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
  });
});