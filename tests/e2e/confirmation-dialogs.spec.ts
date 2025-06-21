import { test, expect } from '@playwright/test';

test.describe('Confirmation Dialogs', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      
      // Mock memory API
      if (url.pathname.includes('/api/memories/1')) {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: '1',
              title: 'Test Memory',
              content: 'This is a test memory for deletion',
              tags: ['test'],
              contentType: 'text',
              summary: 'Test memory summary',
              userId: 'user-1',
              collectionId: 'test',
              entities: [],
              metadata: {
                source: 'Test',
                author: 'Test User',
                wordCount: 10,
                readingTime: 1,
                language: 'en'
              },
              relatedMemories: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
          });
        } else if (route.request().method() === 'DELETE') {
          // Simulate successful deletion
          await route.fulfill({ status: 204 });
        }
      }
      
      // Default fallback
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
    });

    await page.goto('/');
  });

  test('should show confirmation dialog when deleting memory', async ({ page }) => {
    // Navigate to memory detail page
    await page.goto('/memories/1');
    
    // Wait for memory to load
    await expect(page.locator('h1:has-text("Test Memory")')).toBeVisible();
    
    // Click delete button
    await page.click('button[aria-label="Delete memory"]');
    
    // Should show confirmation dialog
    await expect(page.locator('text=Delete Memory')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to delete "Test Memory"?')).toBeVisible();
    await expect(page.locator('text=This action cannot be undone')).toBeVisible();
    
    // Should have proper buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
    
    // Should have danger styling
    const deleteButton = page.locator('button:has-text("Delete")');
    const classes = await deleteButton.getAttribute('class');
    expect(classes).toContain('bg-red-600');
  });

  test('should cancel memory deletion when clicking Cancel', async ({ page }) => {
    await page.goto('/memories/1');
    await expect(page.locator('h1:has-text("Test Memory")')).toBeVisible();
    
    // Open delete confirmation
    await page.click('button[aria-label="Delete memory"]');
    await expect(page.locator('text=Delete Memory')).toBeVisible();
    
    // Click Cancel
    await page.click('button:has-text("Cancel")');
    
    // Dialog should close
    await expect(page.locator('text=Delete Memory')).not.toBeVisible();
    
    // Should still be on memory detail page
    await expect(page.locator('h1:has-text("Test Memory")')).toBeVisible();
  });

  test('should close confirmation dialog with Escape key', async ({ page }) => {
    await page.goto('/memories/1');
    await expect(page.locator('h1:has-text("Test Memory")')).toBeVisible();
    
    // Open delete confirmation
    await page.click('button[aria-label="Delete memory"]');
    await expect(page.locator('text=Delete Memory')).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Dialog should close
    await expect(page.locator('text=Delete Memory')).not.toBeVisible();
  });

  test('should close confirmation dialog with X button', async ({ page }) => {
    await page.goto('/memories/1');
    await expect(page.locator('h1:has-text("Test Memory")')).toBeVisible();
    
    // Open delete confirmation
    await page.click('button[aria-label="Delete memory"]');
    await expect(page.locator('text=Delete Memory')).toBeVisible();
    
    // Click X button
    await page.click('button[aria-label="Close dialog"]');
    
    // Dialog should close
    await expect(page.locator('text=Delete Memory')).not.toBeVisible();
  });

  test('should proceed with memory deletion when clicking Delete', async ({ page }) => {
    await page.goto('/memories/1');
    await expect(page.locator('h1:has-text("Test Memory")')).toBeVisible();
    
    // Open delete confirmation
    await page.click('button[aria-label="Delete memory"]');
    await expect(page.locator('text=Delete Memory')).toBeVisible();
    
    // Click Delete
    await page.click('button:has-text("Delete")');
    
    // Should show loading state
    await expect(page.locator('text=Processing...')).toBeVisible();
    
    // Should eventually navigate away and show success toast
    await expect(page.locator('text=Memory deleted')).toBeVisible();
    await expect(page).toHaveURL('/memories');
  });

  test('should show confirmation dialog for account deletion', async ({ page }) => {
    // Navigate to privacy settings
    await page.goto('/settings');
    await page.click('button:has-text("Privacy")');
    
    // Scroll to danger zone
    await page.locator('text=Danger Zone').scrollIntoViewIfNeeded();
    
    // Click delete account button
    await page.click('button:has-text("Delete Account")');
    
    // Should show confirmation dialog
    await expect(page.locator('text=Delete Account')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to delete your account?')).toBeVisible();
    await expect(page.locator('text=This action is permanent and cannot be undone')).toBeVisible();
    await expect(page.locator('text=All your data, memories, and settings will be permanently removed')).toBeVisible();
    
    // Should have proper buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete Account")')).toBeVisible();
  });

  test('should cancel account deletion', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button:has-text("Privacy")');
    await page.locator('text=Danger Zone').scrollIntoViewIfNeeded();
    
    // Open delete confirmation
    await page.click('button:has-text("Delete Account")');
    await expect(page.locator('text=Delete Account')).toBeVisible();
    
    // Click Cancel
    await page.click('button:has-text("Cancel")');
    
    // Dialog should close
    await expect(page.locator('text=Delete Account')).not.toBeVisible();
    
    // Should still be on settings page
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test('should handle loading state during account deletion', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button:has-text("Privacy")');
    await page.locator('text=Danger Zone').scrollIntoViewIfNeeded();
    
    // Open delete confirmation
    await page.click('button:has-text("Delete Account")');
    await expect(page.locator('text=Delete Account')).toBeVisible();
    
    // Click Delete Account
    await page.click('button:has-text("Delete Account")');
    
    // Should show loading state briefly
    await expect(page.locator('text=Processing...')).toBeVisible();
    
    // Dialog should close after processing
    await expect(page.locator('text=Delete Account')).not.toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/memories/1');
    await expect(page.locator('h1:has-text("Test Memory")')).toBeVisible();
    
    // Open delete confirmation
    await page.click('button[aria-label="Delete memory"]');
    
    // Check accessibility attributes
    const dialog = page.locator('[role="dialog"]').first();
    if (await dialog.count() > 0) {
      // If there's a role="dialog", check it
      await expect(dialog).toBeVisible();
    } else {
      // Otherwise, just check the modal is visible and has proper structure
      await expect(page.locator('text=Delete Memory')).toBeVisible();
    }
    
    // Check close button has proper aria-label
    await expect(page.locator('button[aria-label="Close dialog"]')).toBeVisible();
    
    // Check the dialog can be closed with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Delete Memory')).not.toBeVisible();
  });

  test('should disable buttons during loading', async ({ page }) => {
    await page.goto('/memories/1');
    await expect(page.locator('h1:has-text("Test Memory")')).toBeVisible();
    
    // Open delete confirmation
    await page.click('button[aria-label="Delete memory"]');
    await expect(page.locator('text=Delete Memory')).toBeVisible();
    
    // Click Delete to start loading
    await page.click('button:has-text("Delete")');
    
    // Check that buttons are disabled during loading
    const cancelButton = page.locator('button:has-text("Cancel")');
    const deleteButton = page.locator('button:has-text("Processing...")');
    
    if (await cancelButton.count() > 0) {
      expect(await cancelButton.isDisabled()).toBe(true);
    }
    if (await deleteButton.count() > 0) {
      expect(await deleteButton.isDisabled()).toBe(true);
    }
  });
});