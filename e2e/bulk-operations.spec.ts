import { test, expect } from '@playwright/test';

test.describe('Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/memories');
  });

  test('should enable and disable selection mode', async ({ page }) => {
    // Initially, selection mode should be off
    await expect(page.locator('[data-testid="select-checkbox"]')).toHaveCount(0);
    
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Selection checkboxes should appear
    await expect(page.locator('[data-testid="select-checkbox"]')).toHaveCount(3); // Assuming 3 memory cards
    
    // Bulk operations toolbar should be visible
    await expect(page.locator('[data-testid="cancel-selection"]')).toBeVisible();
    
    // Disable selection mode
    await page.click('[data-testid="cancel-selection"]');
    
    // Selection checkboxes should disappear
    await expect(page.locator('[data-testid="select-checkbox"]')).toHaveCount(0);
  });

  test('should select and deselect items', async ({ page }) => {
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Select first item
    const firstCheckbox = page.locator('[data-testid="select-checkbox"]').first();
    await firstCheckbox.click();
    
    // Check that item is selected
    await expect(page.locator('text=/1 of \\d+ selected/')).toBeVisible();
    
    // Select second item
    const secondCheckbox = page.locator('[data-testid="select-checkbox"]').nth(1);
    await secondCheckbox.click();
    
    // Check that 2 items are selected
    await expect(page.locator('text=/2 of \\d+ selected/')).toBeVisible();
    
    // Deselect first item
    await firstCheckbox.click();
    
    // Check that 1 item is selected
    await expect(page.locator('text=/1 of \\d+ selected/')).toBeVisible();
  });

  test('should perform bulk delete', async ({ page }) => {
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Select two items
    await page.locator('[data-testid="select-checkbox"]').first().click();
    await page.locator('[data-testid="select-checkbox"]').nth(1).click();
    
    // Click bulk delete
    await page.click('[data-testid="bulk-delete"]');
    
    // Confirm deletion in dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Check success notification
    await expect(page.locator('text=/Items deleted/')).toBeVisible();
    
    // Selection mode should be cleared
    await expect(page.locator('[data-testid="select-checkbox"]')).toHaveCount(0);
  });

  test('should add tags to selected items', async ({ page }) => {
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Select items
    await page.locator('[data-testid="select-checkbox"]').first().click();
    await page.locator('[data-testid="select-checkbox"]').nth(1).click();
    
    // Click bulk tag
    await page.click('[data-testid="bulk-tag"]');
    
    // Enter tags
    await page.fill('input[placeholder*="tags"]', 'important, review');
    await page.keyboard.press('Enter');
    
    // Check success notification
    await expect(page.locator('text=/Tags added/')).toBeVisible();
  });

  test('should move items to collection', async ({ page }) => {
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Select items
    await page.locator('[data-testid="select-checkbox"]').first().click();
    
    // Click bulk move
    await page.click('[data-testid="bulk-move"]');
    
    // Select collection from dropdown
    await page.click('text=/Web Development/');
    
    // Check success notification
    await expect(page.locator('text=/Items moved/')).toBeVisible();
  });

  test('should export selected items', async ({ page }) => {
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Select items
    await page.locator('[data-testid="select-checkbox"]').first().click();
    await page.locator('[data-testid="select-checkbox"]').nth(1).click();
    
    // Click bulk export
    await page.click('[data-testid="bulk-export"]');
    
    // Test each export format
    const formats = ['JSON', 'CSV', 'Markdown'];
    
    for (const format of formats) {
      // Start download promise before clicking
      const downloadPromise = page.waitForEvent('download');
      
      // Click export format
      await page.click(`text=/Export as ${format}/`);
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download filename
      expect(download.suggestedFilename()).toMatch(new RegExp(`memories-export-.*\\.${format.toLowerCase() === 'markdown' ? 'md' : format.toLowerCase()}`));
      
      // Re-open export menu for next format
      if (formats.indexOf(format) < formats.length - 1) {
        await page.click('[data-testid="bulk-export"]');
      }
    }
    
    // Check success notification
    await expect(page.locator('text=/Export started/')).toBeVisible();
  });

  test('should disable bulk operations when no items selected', async ({ page }) => {
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Bulk operation buttons should be disabled when no items selected
    await expect(page.locator('[data-testid="bulk-delete"]')).toBeDisabled();
    await expect(page.locator('[data-testid="bulk-tag"]')).toBeDisabled();
    await expect(page.locator('[data-testid="bulk-move"]')).toBeDisabled();
    await expect(page.locator('[data-testid="bulk-export"]')).toBeDisabled();
    
    // Select an item
    await page.locator('[data-testid="select-checkbox"]').first().click();
    
    // Buttons should now be enabled
    await expect(page.locator('[data-testid="bulk-delete"]')).toBeEnabled();
    await expect(page.locator('[data-testid="bulk-tag"]')).toBeEnabled();
    await expect(page.locator('[data-testid="bulk-move"]')).toBeEnabled();
    await expect(page.locator('[data-testid="bulk-export"]')).toBeEnabled();
  });

  test('should show visual feedback for selected items', async ({ page }) => {
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Get first memory card
    const firstCard = page.locator('[data-testid="memory-card"]').first();
    
    // Card should not have selection styling initially
    await expect(firstCard).not.toHaveClass(/ring-2/);
    
    // Select the card
    await page.locator('[data-testid="select-checkbox"]').first().click();
    
    // Card should now have selection styling
    await expect(firstCard).toHaveClass(/ring-2.*ring-primary/);
  });

  test('should prevent navigation when in selection mode', async ({ page }) => {
    // Enable selection mode
    await page.click('[data-testid="enable-bulk-operations"]');
    
    // Try to click on a memory card link
    const firstCardLink = page.locator('[data-testid="memory-card"] a').first();
    await firstCardLink.click();
    
    // Should still be on memories page (not navigated)
    await expect(page).toHaveURL(/\/memories$/);
  });
});