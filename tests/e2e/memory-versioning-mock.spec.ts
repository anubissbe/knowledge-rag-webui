import { test, expect } from '@playwright/test';

// Mock memory data with versions
const mockMemory = {
  id: '1',
  title: 'Test Memory with Versions',
  content: 'This is the current content of the memory',
  summary: 'A test memory for version history',
  tags: ['test', 'versioning'],
  userId: 'user-1',
  collectionId: null,
  entities: [],
  metadata: {
    wordCount: 8,
    readingTime: 1,
    language: 'en'
  },
  relatedMemories: [],
  version: 3,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-03T15:00:00Z'
};

const mockVersions = {
  versions: [
    {
      id: 'v3',
      memoryId: '1',
      version: 3,
      title: 'Test Memory with Versions',
      content: 'This is the current content of the memory',
      changeType: 'updated',
      changeDescription: 'Updated content for better clarity',
      changedFields: ['content'],
      createdAt: '2024-01-03T15:00:00Z',
      createdBy: 'user-1'
    },
    {
      id: 'v2',
      memoryId: '1',
      version: 2,
      title: 'Test Memory with Versions',
      content: 'This is the second version content',
      changeType: 'updated',
      changeDescription: 'Added more details',
      changedFields: ['content', 'summary'],
      createdAt: '2024-01-02T12:00:00Z',
      createdBy: 'user-1'
    },
    {
      id: 'v1',
      memoryId: '1',
      version: 1,
      title: 'Test Memory with Versions',
      content: 'This is the original content',
      changeType: 'created',
      changeDescription: null,
      changedFields: [],
      createdAt: '2024-01-01T10:00:00Z',
      createdBy: 'user-1'
    }
  ]
};

test.describe('Memory Versioning with Mocked Data', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API calls
    await page.route('**/api/memories/1', route => 
      route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify(mockMemory)
      })
    );
    
    await page.route('**/api/memories/1/versions', route => 
      route.fulfill({ 
        status: 200,
        contentType: 'application/json', 
        body: JSON.stringify(mockVersions)
      })
    );
    
    // Navigate directly to the memory detail page
    await page.goto('/memories/1');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Test Memory with Versions');
  });

  test('should display version history button', async ({ page }) => {
    // Check that version history button exists
    const versionHistoryButton = page.locator('button[aria-label="Version history"]');
    await expect(versionHistoryButton).toBeVisible();
  });

  test('should open version history sidebar', async ({ page }) => {
    // Click version history button
    await page.click('button[aria-label="Version history"]');
    
    // Wait for sidebar to appear
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
    
    // Should show version count
    await expect(page.locator('text=3 versions')).toBeVisible();
  });

  test('should display all versions in correct order', async ({ page }) => {
    // Open version history
    await page.click('button[aria-label="Version history"]');
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
    
    // Get all version elements
    const versionElements = page.locator('span:has-text("Version")').filter({ hasText: /^Version \d+$/ });
    
    // Should have 3 versions
    await expect(versionElements).toHaveCount(3);
    
    // Check order (newest first)
    await expect(versionElements.nth(0)).toContainText('Version 3');
    await expect(versionElements.nth(1)).toContainText('Version 2');
    await expect(versionElements.nth(2)).toContainText('Version 1');
  });

  test('should show current version badge', async ({ page }) => {
    // Open version history
    await page.click('button[aria-label="Version history"]');
    
    // Version 3 should be marked as current
    const version3Section = page.locator('div').filter({ hasText: 'Version 3' }).first();
    await expect(version3Section.locator('span:has-text("Current")')).toBeVisible();
  });

  test('should display version metadata', async ({ page }) => {
    // Open version history
    await page.click('button[aria-label="Version history"]');
    
    // Check version 2 metadata
    const version2Section = page.locator('div').filter({ hasText: 'Version 2' }).filter({ hasText: 'Added more details' });
    
    // Should show change type
    await expect(version2Section.locator('text=Updated')).toBeVisible();
    
    // Should show change description
    await expect(version2Section.locator('text=Added more details')).toBeVisible();
    
    // Should show changed fields
    await expect(version2Section.locator('text=Changed: content, summary')).toBeVisible();
  });

  test('should show action buttons for non-current versions', async ({ page }) => {
    // Open version history
    await page.click('button[aria-label="Version history"]');
    
    // Version 1 should have view, restore, and compare buttons
    const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
    
    await expect(version1Section.locator('button[title="View this version"]')).toBeVisible();
    await expect(version1Section.locator('button[title="Restore to this version"]')).toBeVisible();
    await expect(version1Section.locator('button[title="Compare with current"]')).toBeVisible();
    
    // Current version (3) should not have restore button
    const version3Section = page.locator('div').filter({ hasText: 'Version 3' }).first();
    await expect(version3Section.locator('button[title="Restore to this version"]')).not.toBeVisible();
  });

  test('should open version viewer modal', async ({ page }) => {
    // Mock version API call
    await page.route('**/api/memories/1/versions/1', route => 
      route.fulfill({ 
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'v1',
          memoryId: '1',
          version: 1,
          title: 'Test Memory with Versions',
          content: 'This is the original content',
          summary: 'Original summary',
          tags: ['test'],
          metadata: mockMemory.metadata,
          changeType: 'created',
          createdAt: '2024-01-01T10:00:00Z',
          createdBy: 'user-1'
        })
      })
    );
    
    // Open version history
    await page.click('button[aria-label="Version history"]');
    
    // Click view button on version 1
    const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
    await version1Section.locator('button[title="View this version"]').click();
    
    // Should show version viewer
    await expect(page.locator('text=Viewing Version 1')).toBeVisible();
    await expect(page.locator('text=This is the original content')).toBeVisible();
  });

  test('should show restore confirmation dialog', async ({ page }) => {
    // Open version history
    await page.click('button[aria-label="Version history"]');
    
    // Click restore button on version 1
    const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
    await version1Section.locator('button[title="Restore to this version"]').click();
    
    // Should show confirmation dialog
    await expect(page.locator('text=Restore Version')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to restore')).toBeVisible();
    await expect(page.locator('button:has-text("Restore")')).toBeVisible();
  });

  test('should handle version comparison', async ({ page }) => {
    // Mock comparison API
    await page.route('**/api/memories/1/versions/compare?from=1&to=3', route => 
      route.fulfill({ 
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          memoryId: '1',
          fromVersion: 1,
          toVersion: 3,
          differences: [
            {
              field: 'content',
              changeType: 'modified',
              oldValue: 'This is the original content',
              newValue: 'This is the current content of the memory'
            }
          ],
          summary: {
            totalChanges: 1,
            fieldsChanged: ['content'],
            addedContent: 10,
            removedContent: 5
          }
        })
      })
    );
    
    // Open version history
    await page.click('button[aria-label="Version history"]');
    
    // Click compare button on version 1
    const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
    await version1Section.locator('button[title="Compare with current"]').click();
    
    // For now, just check if the toast appears (since compare is marked as TODO)
    await expect(page.locator('text=Compare feature coming soon')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Override the versions API to return an error
    await page.route('**/api/memories/1/versions', route => 
      route.fulfill({ status: 500, body: 'Server error' })
    );
    
    // Reload page to trigger the error
    await page.reload();
    await expect(page.locator('h1')).toContainText('Test Memory with Versions');
    
    // Try to open version history
    await page.click('button[aria-label="Version history"]');
    
    // Should show error toast
    await expect(page.locator('text=Failed to load version history')).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Open version history
    await page.click('button[aria-label="Version history"]');
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
    
    // Focus should be manageable with keyboard
    await page.keyboard.press('Tab');
    
    // Check if we can close with Escape
    await page.keyboard.press('Escape');
    
    // Version history should close (sidebar should not be visible)
    await expect(page.locator('h2:has-text("Version History")')).not.toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Version history button should still be visible
    await expect(page.locator('button[aria-label="Version history"]')).toBeVisible();
    
    // Open version history
    await page.click('button[aria-label="Version history"]');
    
    // Sidebar should adapt to mobile
    await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
    
    // Should still show versions
    await expect(page.locator('text=Version 3')).toBeVisible();
    await expect(page.locator('text=Version 2')).toBeVisible();
    await expect(page.locator('text=Version 1')).toBeVisible();
  });
});