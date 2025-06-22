import { test, expect, type Page } from '@playwright/test';

// Helper to login with demo account
async function loginWithDemoAccount(page: Page) {
  await page.goto('/');
  
  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
  
  if (!isLoggedIn) {
    // Wait for redirect to login page
    await page.waitForURL('/login');
    
    // Click "Try demo account" button if available
    const demoButton = page.getByText('Try demo account');
    if (await demoButton.isVisible()) {
      await demoButton.click();
    } else {
      // Manual login
      await page.fill('[data-testid="email-input"], input[type="email"]', 'demo@example.com');
      await page.fill('[data-testid="password-input"], input[type="password"]', 'demo');
      await page.click('[data-testid="login-button"], button:has-text("Sign in")');
    }
    
    // Wait for login to complete
    await page.waitForURL(/\/(dashboard|memories|search|$)/);
  }
}

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
      createdBy: 'demo@example.com'
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
      createdBy: 'demo@example.com'
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
      createdBy: 'demo@example.com'
    }
  ]
};

test.describe('Memory Versioning E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await loginWithDemoAccount(page);
    
    // Mock the API calls for memory and versions
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
  });

  test.describe('Version History UI', () => {
    test('should display version history button on memory detail page', async ({ page }) => {
      // Navigate to memory detail page
      await page.goto('/memories/1');
      
      // Wait for page to load
      await expect(page.locator('h1')).toContainText('Test Memory with Versions');
      
      // Check that version history button exists
      const versionHistoryButton = page.locator('button[aria-label="Version history"]');
      await expect(versionHistoryButton).toBeVisible();
    });

    test('should open and close version history sidebar', async ({ page }) => {
      await page.goto('/memories/1');
      await expect(page.locator('h1')).toContainText('Test Memory with Versions');
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      
      // Wait for sidebar to appear
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Should show version count
      await expect(page.locator('text=3 versions')).toBeVisible();
      
      // Close sidebar
      await page.keyboard.press('Escape');
      
      // Sidebar should be hidden
      await expect(page.locator('h2:has-text("Version History")')).not.toBeVisible();
    });

    test('should display all versions in correct order', async ({ page }) => {
      await page.goto('/memories/1');
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Check all versions are displayed
      await expect(page.locator('text=Version 3')).toBeVisible();
      await expect(page.locator('text=Version 2')).toBeVisible();
      await expect(page.locator('text=Version 1')).toBeVisible();
      
      // Check they appear in the right order (newest first)
      const versionTexts = await page.locator('span:has-text("Version")').filter({ hasText: /^Version \d+$/ }).allTextContents();
      expect(versionTexts[0]).toBe('Version 3');
      expect(versionTexts[1]).toBe('Version 2');
      expect(versionTexts[2]).toBe('Version 1');
    });

    test('should show current version badge', async ({ page }) => {
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // Version 3 should be marked as current
      const version3Section = page.locator('div').filter({ hasText: 'Version 3' }).first();
      await expect(version3Section.locator('span:has-text("Current")')).toBeVisible();
      
      // Other versions should not have current badge
      const version2Section = page.locator('div').filter({ hasText: 'Version 2' }).first();
      await expect(version2Section.locator('span:has-text("Current")')).not.toBeVisible();
    });

    test('should display version metadata correctly', async ({ page }) => {
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // Check version 2 metadata
      const version2Section = page.locator('div').filter({ hasText: 'Version 2' }).filter({ hasText: 'Added more details' });
      
      // Should show change type
      await expect(version2Section.locator('text=Updated')).toBeVisible();
      
      // Should show change description
      await expect(version2Section.locator('text=Added more details')).toBeVisible();
      
      // Should show changed fields
      await expect(version2Section.locator('text=Changed: content, summary')).toBeVisible();
      
      // Should show created by
      await expect(version2Section.locator('text=demo@example.com')).toBeVisible();
    });

    test('should show appropriate action buttons', async ({ page }) => {
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // For non-current versions, should have view, restore, and compare buttons
      const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
      await expect(version1Section.locator('button[title="View this version"]')).toBeVisible();
      await expect(version1Section.locator('button[title="Restore to this version"]')).toBeVisible();
      await expect(version1Section.locator('button[title="Compare with current"]')).toBeVisible();
      
      // Current version should only have view button
      const version3Section = page.locator('div').filter({ hasText: 'Version 3' }).first();
      await expect(version3Section.locator('button[title="View this version"]')).toBeVisible();
      await expect(version3Section.locator('button[title="Restore to this version"]')).not.toBeVisible();
    });
  });

  test.describe('Version Actions', () => {
    test('should open version viewer when clicking view button', async ({ page }) => {
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
            createdBy: 'demo@example.com'
          })
        })
      );
      
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // Click view button on version 1
      const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
      await version1Section.locator('button[title="View this version"]').click();
      
      // Should show version viewer
      await expect(page.locator('text=Viewing Version 1')).toBeVisible();
      await expect(page.locator('text=This is the original content')).toBeVisible();
      await expect(page.locator('text=Read-only')).toBeVisible();
    });

    test('should show restore confirmation dialog', async ({ page }) => {
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // Click restore button on version 1
      const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
      await version1Section.locator('button[title="Restore to this version"]').click();
      
      // Should show confirmation dialog
      await expect(page.locator('text=Restore Version')).toBeVisible();
      await expect(page.locator('text=Are you sure you want to restore')).toBeVisible();
      await expect(page.locator('text=version 1')).toBeVisible();
      await expect(page.locator('button:has-text("Restore")')).toBeVisible();
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    });

    test('should handle compare functionality', async ({ page }) => {
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // Click compare button on version 1
      const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
      await version1Section.locator('button[title="Compare with current"]').click();
      
      // Since compare is marked as TODO in the code, it should show a toast
      await expect(page.locator('text=Compare feature coming soon')).toBeVisible();
    });

    test('should restore version successfully', async ({ page }) => {
      // Mock restore API
      await page.route('**/api/memories/1/versions/1/restore', route => 
        route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, newVersion: 4 })
        })
      );
      
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // Click restore on version 1
      const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
      await version1Section.locator('button[title="Restore to this version"]').click();
      
      // Confirm restoration
      await page.click('button:has-text("Restore")');
      
      // Should show success message
      await expect(page.locator('text=Version restored')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle version history loading errors', async ({ page }) => {
      // Override the versions API to return an error
      await page.route('**/api/memories/1/versions', route => 
        route.fulfill({ status: 500, body: 'Server error' })
      );
      
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // Should show error toast
      await expect(page.locator('text=Failed to load version history')).toBeVisible();
    });

    test('should show loading state while fetching versions', async ({ page }) => {
      // Slow down the API response
      await page.route('**/api/memories/1/versions', async route => {
        await page.waitForTimeout(1000); // 1 second delay
        await route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockVersions)
        });
      });
      
      await page.goto('/memories/1');
      await page.click('button[aria-label="Version history"]');
      
      // Should show loading spinner
      await expect(page.locator('.animate-spin')).toBeVisible();
      
      // Eventually should load
      await expect(page.locator('text=Version 1')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Accessibility and Responsive Design', () => {
    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('/memories/1');
      
      // Tab to version history button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Open with Enter
      await page.keyboard.press('Enter');
      
      // Should open version history
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Close with Escape
      await page.keyboard.press('Escape');
      
      // Should be closed
      await expect(page.locator('h2:has-text("Version History")')).not.toBeVisible();
    });

    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/memories/1');
      
      // Version history button should be visible
      await expect(page.locator('button[aria-label="Version history"]')).toBeVisible();
      
      // Open version history
      await page.click('button[aria-label="Version history"]');
      
      // Sidebar should adapt to mobile
      await expect(page.locator('h2:has-text("Version History")')).toBeVisible();
      
      // Should still show all versions
      await expect(page.locator('text=Version 3')).toBeVisible();
      await expect(page.locator('text=Version 2')).toBeVisible();
      await expect(page.locator('text=Version 1')).toBeVisible();
      
      // Action buttons should be accessible
      const version1Section = page.locator('div').filter({ hasText: 'Version 1' }).first();
      await expect(version1Section.locator('button[title="View this version"]')).toBeVisible();
    });
  });
});