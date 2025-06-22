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

// Helper to get memory ID from URL
function getMemoryIdFromUrl(url: string): string {
  const match = url.match(/\/memories\/(\d+)/);
  return match ? match[1] : '';
}

test.describe('Memory Versioning Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test.describe('Version Creation and History', () => {
    test('should create initial version when creating a new memory', async ({ page }) => {
      // Create a new memory
      const memoryUrl = await createMemory(page, 'Test Memory for Versioning', 'Initial content for version testing');
      
      // Click on version history button (using aria-label)
      await page.click('button[aria-label="Version history"]');
      
      // Wait for version history sidebar to appear
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Should show version 1 as current
      await expect(page.locator('text=Version 1')).toBeVisible();
      await expect(page.locator('text=Current')).toBeVisible();
      await expect(page.locator('text=Created')).toBeVisible();
    });

    test('should create new version when editing memory', async ({ page }) => {
      // Create a memory first
      const memoryUrl = await createMemory(page, 'Memory to Edit', 'Original content');
      
      // Click edit button (it's a link in the actual UI)
      await page.click('a[aria-label="Edit memory"]');
      
      // Wait for edit page to load
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      
      // Update content
      await page.fill('textarea#content', 'Updated content for version 2');
      // Note: changeDescription field might not exist in edit form, need to check
      
      // Save changes
      await page.click('button:has-text("Save Changes")');
      
      // Wait for navigation back to detail page
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      
      // Wait for success toast
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      
      // Wait for sidebar
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Should now show two versions
      await expect(page.locator('text=Version 2')).toBeVisible();
      await expect(page.locator('text=Version 1')).toBeVisible();
      
      // Version 2 should be current
      const version2Element = page.locator('div:has-text("Version 2")').first();
      await expect(version2Element.locator('text=Current')).toBeVisible();
      await expect(version2Element.locator('text=Updated')).toBeVisible();
      
      // Should show change description
      await expect(page.locator('text=Updated content for clarity')).toBeVisible();
    });

    test('should display version timeline correctly', async ({ page }) => {
      // Create a memory with multiple edits
      const memoryUrl = await createMemory(page, 'Timeline Test Memory', 'Version 1 content');
      
      // Edit 1
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'Version 2 content');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Edit 2
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'Version 3 content');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      
      // Wait for sidebar
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Should show all three versions in reverse chronological order
      const versions = page.locator('text=/Version \\d+/');
      await expect(versions).toHaveCount(3);
      
      // Verify order (newest first)
      await expect(versions.nth(0)).toContainText('Version 3');
      await expect(versions.nth(1)).toContainText('Version 2');
      await expect(versions.nth(2)).toContainText('Version 1');
    });
  });

  test.describe('Version Viewing', () => {
    test('should view specific version content', async ({ page }) => {
      // Create a memory with edits
      const memoryUrl = await createMemory(page, 'View Version Test', 'Original content for viewing');
      
      // Edit the memory
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'Updated content for version 2');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      
      // Wait for sidebar
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Click view button on version 1
      const version1Row = page.locator('div:has-text("Version 1")').first();
      await version1Row.locator('button[title="View this version"]').click();
      
      // Should display version viewer modal/panel
      await expect(page.locator('text=Viewing Version 1')).toBeVisible();
      await expect(page.locator('text=Original content for viewing')).toBeVisible();
      
      // Should show read-only indicator
      await expect(page.locator('text=Read-only')).toBeVisible();
    });

    test('should navigate between versions', async ({ page }) => {
      // Create memory with multiple versions
      const memoryUrl = await createMemory(page, 'Navigation Test', 'V1 content');
      
      // Create version 2
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'V2 content');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Create version 3
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'V3 content');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open version history and view version 1
      await page.click('button[aria-label="Version history"]');
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      await page.locator('div:has-text("Version 1")').first().locator('button[title="View this version"]').click();
      
      // Should be able to navigate to next version
      await page.click('button:has-text("Next Version")');
      await expect(page.locator('text=Viewing Version 2')).toBeVisible();
      await expect(page.locator('text=V2 content')).toBeVisible();
      
      // Navigate to previous version
      await page.click('button:has-text("Previous Version")');
      await expect(page.locator('text=Viewing Version 1')).toBeVisible();
      await expect(page.locator('text=V1 content')).toBeVisible();
    });
  });

  test.describe('Version Comparison', () => {
    test('should compare two versions', async ({ page }) => {
      // Create memory with changes
      const memoryUrl = await createMemory(page, 'Compare Test', 'Initial content\nLine 2\nLine 3');
      
      // Edit to create version 2
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'Modified content\nLine 2 updated\nLine 3\nLine 4 added');
      // Note: summary field might not be editable in edit form
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      
      // Wait for sidebar
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Click compare button on version 1
      const version1Row = page.locator('div:has-text("Version 1")').first();
      await version1Row.locator('button[title="Compare with current"]').click();
      
      // Should show comparison view
      await expect(page.locator('text=Version Comparison')).toBeVisible();
      await expect(page.locator('text=Version 1')).toBeVisible();
      await expect(page.locator('text=Version 2')).toBeVisible();
      
      // Should show summary stats
      await expect(page.locator('text=Total Changes')).toBeVisible();
      await expect(page.locator('text=Added')).toBeVisible();
      await expect(page.locator('text=Removed')).toBeVisible();
      await expect(page.locator('text=Fields Changed')).toBeVisible();
      
      // Should highlight differences
      await expect(page.locator('text=content')).toBeVisible();
      await expect(page.locator('text=summary')).toBeVisible();
      
      // Should show old and new values
      await expect(page.locator('text=Initial content')).toBeVisible();
      await expect(page.locator('text=Modified content')).toBeVisible();
    });

    test('should show accurate diff highlighting', async ({ page }) => {
      // Create memory
      const memoryUrl = await createMemory(page, 'Diff Test', 'Hello world');
      
      // Add tags in version 2
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('input#tags', 'new-tag');
      await page.keyboard.press('Enter');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open comparison
      await page.click('button[aria-label="Version history"]');
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      await page.locator('div:has-text("Version 1")').first().locator('button[title="Compare with current"]').click();
      
      // Should show tags as added
      await expect(page.locator('text=tags')).toBeVisible();
      await expect(page.locator('text=Added tags')).toBeVisible();
      await expect(page.locator('text=new-tag')).toBeVisible();
    });
  });

  test.describe('Version Restoration', () => {
    test('should restore to previous version', async ({ page }) => {
      // Create memory with multiple versions
      const memoryUrl = await createMemory(page, 'Restore Test', 'Version 1 original content');
      
      // Create version 2
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'Version 2 modified content');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Create version 3
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'Version 3 latest content');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      
      // Wait for sidebar
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Click restore on version 1
      const version1Row = page.locator('div:has-text("Version 1")').first();
      await version1Row.locator('button[title="Restore to this version"]').click();
      
      // Should show confirmation dialog
      await expect(page.locator('text=Restore Version')).toBeVisible();
      await expect(page.locator('text=Are you sure you want to restore')).toBeVisible();
      
      // Confirm restoration
      await page.click('button:has-text("Restore")');
      
      // Should show success message
      await expect(page.locator('text=Version restored')).toBeVisible();
      
      // Should create version 4 with restored content
      await expect(page.locator('text=Version 4')).toBeVisible();
      await expect(page.locator('text=Restored from version 1')).toBeVisible();
      
      // Current content should match version 1
      await expect(page.locator('text=Version 1 original content')).toBeVisible();
    });

    test('should maintain version history after restoration', async ({ page }) => {
      // Create and edit memory
      const memoryUrl = await createMemory(page, 'History Test', 'Original');
      
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'Modified');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Restore to version 1
      await page.click('button[aria-label="Version history"]');
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      await page.locator('div:has-text("Version 1")').first().locator('button[title="Restore to this version"]').click();
      await page.click('button:has-text("Restore")');
      await expect(page.locator('text=Version restored')).toBeVisible();
      
      // Should now have 3 versions
      const versions = page.locator('text=/Version \\d+/');
      await expect(versions).toHaveCount(3);
      
      // Version 3 should be marked as restored
      const version3Row = page.locator('div:has-text("Version 3")').first();
      await expect(version3Row.locator('text=Restored')).toBeVisible();
      await expect(version3Row.locator('text=Current')).toBeVisible();
    });
  });

  test.describe('UI Components and Interactions', () => {
    test('should handle loading states properly', async ({ page }) => {
      // Slow down network to see loading states
      await page.route('**/api/memories/*/versions', async route => {
        await page.waitForTimeout(1000); // Simulate slow network
        await route.continue();
      });
      
      const memoryUrl = await createMemory(page, 'Loading Test', 'Content');
      
      // Click version history - should show loading spinner
      await page.click('button[aria-label="Version history"]');
      await expect(page.locator('.animate-spin')).toBeVisible();
      
      // Eventually should load
      await expect(page.locator('text=Version 1')).toBeVisible({ timeout: 10000 });
    });

    test('should handle errors gracefully', async ({ page }) => {
      // Simulate API error
      await page.route('**/api/memories/*/versions', route => 
        route.fulfill({ status: 500, body: 'Server error' })
      );
      
      const memoryUrl = await createMemory(page, 'Error Test', 'Content');
      
      // Try to load version history
      await page.click('button[aria-label="Version history"]');
      
      // Should show error message
      await expect(page.locator('text=Failed to load version history')).toBeVisible();
    });

    test('should be accessible with keyboard navigation', async ({ page }) => {
      const memoryUrl = await createMemory(page, 'Keyboard Test', 'Content for keyboard nav');
      
      // Edit to create version 2
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      await page.fill('textarea#content', 'Updated content');
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Tab to first version's view button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Press Enter to view
      await page.keyboard.press('Enter');
      
      // Should open version viewer
      await expect(page.locator('text=Viewing Version')).toBeVisible();
      
      // Escape to close
      await page.keyboard.press('Escape');
      await expect(page.locator('text=Viewing Version')).not.toBeVisible();
    });

    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const memoryUrl = await createMemory(page, 'Mobile Test', 'Mobile content');
      
      // Edit memory
      await page.click('button[aria-label="Edit memory"]');
      await page.fill('textarea[name="content"]', 'Mobile updated content');
      await page.click('button:has-text("Save Changes")');
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Open version history
      await page.click('button:has-text("Version History")');
      
      // Should be able to see versions
      await expect(page.locator('text=Version 2')).toBeVisible();
      await expect(page.locator('text=Version 1')).toBeVisible();
      
      // Actions should be accessible
      const version1Row = page.locator('div:has-text("Version 1")').first();
      await expect(version1Row.locator('button[title="View this version"]')).toBeVisible();
      await expect(version1Row.locator('button[title="Restore to this version"]')).toBeVisible();
    });
  });

  test.describe('Edge Cases and Complex Scenarios', () => {
    test('should handle rapid consecutive edits', async ({ page }) => {
      const memoryUrl = await createMemory(page, 'Rapid Edit Test', 'Initial');
      
      // Make multiple rapid edits
      for (let i = 2; i <= 5; i++) {
        await page.click('button[aria-label="Edit memory"]');
        await page.fill('textarea[name="content"]', `Version ${i} content`);
        await page.click('button:has-text("Save Changes")');
        await expect(page.locator('text=Memory updated successfully')).toBeVisible();
        await page.waitForTimeout(100); // Small delay between edits
      }
      
      // Open version history
      await page.click('button:has-text("Version History")');
      
      // Should have all 5 versions
      const versions = page.locator('text=/Version \\d+/');
      await expect(versions).toHaveCount(5);
    });

    test('should handle very long content diffs', async ({ page }) => {
      const longContent = 'Lorem ipsum '.repeat(100);
      const memoryUrl = await createMemory(page, 'Long Content Test', longContent);
      
      // Edit with different long content
      await page.click('a[aria-label="Edit memory"]');
      await expect(page).toHaveURL(/\/memories\/\d+\/edit/);
      const newLongContent = 'Dolor sit amet '.repeat(100);
      await page.fill('textarea#content', newLongContent);
      await page.click('button:has-text("Save Changes")');
      await expect(page).toHaveURL(/\/memories\/\d+$/);
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Compare versions
      await page.click('button[aria-label="Version history"]');
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      await page.locator('div:has-text("Version 1")').first().locator('button[title="Compare with current"]').click();
      
      // Should show truncated or scrollable diff
      await expect(page.locator('text=Version Comparison')).toBeVisible();
      await expect(page.locator('.overflow-y-auto')).toBeVisible();
    });

    test('should preserve version history across page refreshes', async ({ page }) => {
      const memoryUrl = await createMemory(page, 'Refresh Test', 'Content');
      
      // Edit to create version 2
      await page.click('button[aria-label="Edit memory"]');
      await page.fill('textarea[name="content"]', 'Updated after refresh');
      await page.click('button:has-text("Save Changes")');
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
      
      // Refresh page
      await page.reload();
      
      // Open version history
      await page.click('button:has-text("Version History")');
      
      // Should still show both versions
      await expect(page.locator('text=Version 2')).toBeVisible();
      await expect(page.locator('text=Version 1')).toBeVisible();
    });
  });
});

// Performance tests
test.describe('Performance', () => {
  test('should load version history quickly for memories with many versions', async ({ page }) => {
    // This would typically be set up with test data
    // For now, we'll create a few versions and measure load time
    const memoryUrl = await createMemory(page, 'Performance Test', 'Initial');
    
    // Create 10 versions
    for (let i = 2; i <= 10; i++) {
      await page.click('button[aria-label="Edit memory"]');
      await page.fill('textarea[name="content"]', `Version ${i} content`);
      await page.click('button:has-text("Save Changes")');
      await expect(page.locator('text=Memory updated successfully')).toBeVisible();
    }
    
    // Measure version history load time
    const startTime = Date.now();
    await page.click('button:has-text("Version History")');
    await expect(page.locator('text=Version 10')).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });
});