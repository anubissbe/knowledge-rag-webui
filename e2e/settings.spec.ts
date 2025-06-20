import { test, expect } from '@playwright/test';

test.describe('User Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-store', JSON.stringify({
        state: { 
          isAuthenticated: true, 
          token: 'mock-token',
          user: { 
            id: 'test-user', 
            name: 'Test User',
            email: 'test@example.com',
            bio: 'Test bio'
          }
        },
        version: 0
      }));
      
      // Mock some API keys
      localStorage.setItem('user-store', JSON.stringify({
        state: {
          apiKeys: [
            {
              id: '1',
              name: 'Test API Key',
              key: 'rag_test123_key456',
              createdAt: new Date().toISOString(),
              permissions: ['read']
            }
          ],
          preferences: {
            theme: 'light',
            defaultView: 'grid',
            autoSave: true
          }
        },
        version: 0
      }));
    });
  });

  test('should navigate between settings sections', async ({ page }) => {
    await page.goto('/settings');
    
    // Check default section
    await expect(page.locator('h2:has-text("Account")')).toBeVisible();
    
    // Navigate to different sections
    await page.click('button:has-text("Memory Preferences")');
    await expect(page.locator('h2:has-text("Memory Preferences")')).toBeVisible();
    
    await page.click('button:has-text("API Keys")');
    await expect(page.locator('h2:has-text("API Keys")')).toBeVisible();
    
    await page.click('button:has-text("Language")');
    await expect(page.locator('h2:has-text("Language & Region")')).toBeVisible();
  });

  test('should update profile information', async ({ page }) => {
    await page.goto('/settings');
    
    // Click edit profile
    await page.click('text=Edit Profile');
    
    // Update fields
    await page.fill('input[value="Test User"]', 'Updated User');
    await page.fill('textarea', 'Updated bio text');
    
    // Save changes
    await page.click('text=Save Changes');
    
    // Verify update (in real app, would check API call)
    await expect(page.locator('input[value="Updated User"]')).toBeVisible();
  });

  test('should manage API keys', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button:has-text("API Keys")');
    
    // Check existing key
    await expect(page.locator('text=Test API Key')).toBeVisible();
    
    // Create new key
    await page.click('button:has-text("Create New Key")');
    await page.fill('input[placeholder*="Mobile App"]', 'New Test Key');
    await page.check('input[type="checkbox"][value="write"]');
    await page.click('button:has-text("Create Key")');
    
    // Verify new key
    await expect(page.locator('text=New Test Key')).toBeVisible();
    
    // Test key visibility toggle
    const keyDisplay = page.locator('code').first();
    const maskedKey = await keyDisplay.textContent();
    expect(maskedKey).toContain('...');
    
    // Show key
    await page.click('button[aria-label="Show API key"]').first();
    const fullKey = await keyDisplay.textContent();
    expect(fullKey).not.toContain('...');
    
    // Copy key
    await page.click('button[aria-label="Copy API key"]').first();
    await expect(page.locator('.text-green-500')).toBeVisible();
  });

  test('should update memory preferences', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button:has-text("Memory Preferences")');
    
    // Change default view
    await page.selectOption('select:near(:text("Default Memory View"))', 'list');
    
    // Change sort order
    await page.selectOption('select:near(:text("Default Sort Order"))', 'alphabetical');
    
    // Toggle auto-save
    const autoSaveToggle = page.locator('button[aria-pressed]').filter({ hasText: /Auto-save/ });
    await autoSaveToggle.click();
    
    // Change items per page
    await page.selectOption('select:near(:text("Items Per Page"))', '50');
    
    // Verify changes persisted (would check store in real app)
    await page.reload();
    await page.click('button:has-text("Memory Preferences")');
    await expect(page.locator('select:near(:text("Default Memory View"))')).toHaveValue('list');
  });

  test('should update language settings', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button:has-text("Language")');
    
    // Select Spanish
    await page.click('button:has-text("Spanish")');
    await expect(page.locator('text=Español')).toBeVisible();
    await expect(page.locator('.text-primary').filter({ hasText: 'Check' })).toBeVisible();
    
    // Change date format
    await page.selectOption('select:near(:text("Date Format"))', 'DD/MM/YYYY');
    
    // Change time format
    await page.selectOption('select:near(:text("Time Format"))', '24h');
    
    // Change timezone
    await page.selectOption('select:near(:text("Timezone"))', 'Europe/London');
  });

  test('should handle account deletion', async ({ page }) => {
    await page.goto('/settings');
    
    // Scroll to danger zone
    await page.locator('text=Danger Zone').scrollIntoViewIfNeeded();
    
    // Click delete account
    await page.click('button:has-text("Delete Account")');
    
    // Modal should appear
    await expect(page.locator('text=This will permanently delete')).toBeVisible();
    
    // Try to delete without confirmation
    await page.click('button:has-text("Delete Account")').last();
    
    // Should still be on modal (not deleted)
    await expect(page.locator('text=Type DELETE to confirm')).toBeVisible();
    
    // Type DELETE
    await page.fill('input[placeholder="Type DELETE to confirm"]', 'DELETE');
    
    // Delete button should be enabled
    const deleteButton = page.locator('button:has-text("Delete Account")').last();
    await expect(deleteButton).not.toBeDisabled();
    
    // Cancel instead
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text=This will permanently delete')).not.toBeVisible();
  });

  test('should update appearance settings', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button:has-text("Appearance")');
    
    // Change theme
    await page.click('label:has-text("Dark")');
    
    // Use theme toggle
    const themeToggle = page.locator('button[aria-label*="theme"]').first();
    await themeToggle.click();
    
    // Check theme preview
    await expect(page.locator('.bg-primary').first()).toBeVisible();
  });

  test('should update accessibility settings', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button:has-text("Accessibility")');
    
    // Toggle high contrast
    await page.click('button[aria-label="Toggle high contrast mode"]');
    
    // Toggle reduced motion
    await page.click('button[aria-label="Toggle reduced motion"]');
    
    // Change focus ring style
    await page.click('button:has-text("enhanced")');
    await expect(page.locator('button:has-text("enhanced")')).toHaveClass(/bg-primary/);
    
    // Reset settings
    await page.click('button:has-text("Reset Accessibility Settings")');
  });

  test('should be responsive', async ({ page }) => {
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/settings');
    
    // Navigation should be visible
    await expect(page.locator('nav').first()).toBeVisible();
    
    // Content should stack
    const grid = page.locator('.grid').first();
    await expect(grid).toHaveClass(/grid-cols-1/);
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Should have 2 column layout
    await expect(grid).toHaveClass(/md:grid-cols-3/);
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/settings');
    
    // Mock API error
    await page.route('**/api/user/profile', route => {
      route.abort('failed');
    });
    
    // Try to update profile
    await page.click('text=Edit Profile');
    await page.fill('input[value="Test User"]', 'Failed Update');
    await page.click('text=Save Changes');
    
    // Should show error notification
    await expect(page.locator('text=Failed to update profile')).toBeVisible();
  });
});