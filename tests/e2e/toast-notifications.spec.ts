import { test, expect } from '@playwright/test';

test.describe('Toast Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show success toast when saving profile', async ({ page }) => {
    // Navigate to settings
    await page.click('a[href="/settings"]');
    
    // Wait for settings page to load
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    
    // Click on Profile tab if needed
    const profileTab = page.locator('button:has-text("Profile")');
    if (await profileTab.isVisible()) {
      await profileTab.click();
    }
    
    // Fill in profile form
    await page.fill('input[name="name"]', 'Test User Updated');
    
    // Click save button
    await page.click('button:has-text("Save Changes")');
    
    // Check for success toast
    await expect(page.locator('text=Profile updated')).toBeVisible();
    await expect(page.locator('text=Your profile has been updated successfully.')).toBeVisible();
    
    // Verify toast auto-dismisses after 5 seconds
    await page.waitForTimeout(5500);
    await expect(page.locator('text=Profile updated')).not.toBeVisible();
  });

  test('should show error toast and persist', async ({ page }) => {
    // Navigate to settings
    await page.click('a[href="/settings"]');
    
    // Click on API Keys tab
    await page.click('button:has-text("API Keys")');
    
    // Try to create an API key without a name (simulate error)
    await page.click('button:has-text("Create New Key")');
    
    // Simulate an error by injecting it
    await page.evaluate(() => {
      // @ts-ignore
      const { toast } = window.require?.('../stores/notificationStore') || {};
      if (toast) {
        toast.error('Creation failed', 'API key name is required');
      }
    });
    
    // Check error toast appears and persists
    await expect(page.locator('text=Creation failed')).toBeVisible();
    await page.waitForTimeout(6000); // Wait longer than default duration
    await expect(page.locator('text=Creation failed')).toBeVisible(); // Should still be visible
    
    // Manually dismiss
    await page.click('[aria-label="Dismiss notification"]');
    await expect(page.locator('text=Creation failed')).not.toBeVisible();
  });

  test('should show copy success toast', async ({ page }) => {
    // Navigate to a memory detail page
    await page.goto('/memories/1');
    
    // Wait for page to load
    await expect(page.locator('h1')).toBeVisible();
    
    // Click copy button
    await page.click('button[aria-label="Copy content"]');
    
    // Check for copy success toast
    await expect(page.locator('text=Copied!')).toBeVisible();
    await expect(page.locator('text=Memory content copied to clipboard')).toBeVisible();
  });

  test('should show delete confirmation and success toast', async ({ page }) => {
    // Navigate to a memory detail page
    await page.goto('/memories/1');
    
    // Mock the confirm dialog to return true
    await page.evaluate(() => {
      window.confirm = () => true;
    });
    
    // Click delete button
    await page.click('button:has-text("Delete")');
    
    // Check for success toast
    await expect(page.locator('text=Memory deleted')).toBeVisible();
    await expect(page.locator('text=The memory has been permanently deleted')).toBeVisible();
    
    // Should navigate back to memories list
    await expect(page).toHaveURL('/memories');
  });

  test('should stack multiple notifications', async ({ page }) => {
    // Navigate to settings
    await page.click('a[href="/settings"]');
    await page.click('button:has-text("API Keys")');
    
    // Trigger multiple toasts
    await page.evaluate(() => {
      // @ts-ignore
      const { toast } = window.require?.('../stores/notificationStore') || {};
      if (toast) {
        toast.success('First notification', 'This is the first one');
        toast.info('Second notification', 'This is the second one');
        toast.warning('Third notification', 'This is the third one');
      }
    });
    
    // All should be visible
    await expect(page.locator('text=First notification')).toBeVisible();
    await expect(page.locator('text=Second notification')).toBeVisible();
    await expect(page.locator('text=Third notification')).toBeVisible();
    
    // Should be stacked vertically
    const notifications = page.locator('[role="alert"]');
    await expect(notifications).toHaveCount(3);
  });

  test('should respect dark mode styling', async ({ page }) => {
    // Toggle dark mode
    await page.click('button[aria-label="Toggle theme"]');
    
    // Trigger a toast
    await page.evaluate(() => {
      // @ts-ignore
      const { toast } = window.require?.('../stores/notificationStore') || {};
      if (toast) {
        toast.success('Dark mode test', 'Checking dark mode styles');
      }
    });
    
    // Check that dark mode classes are applied
    const notification = page.locator('[role="alert"]').first();
    const classes = await notification.getAttribute('class');
    expect(classes).toContain('dark:bg-green-900/20');
    expect(classes).toContain('dark:border-green-800');
  });

  test('should handle notification with action button', async ({ page }) => {
    let actionClicked = false;
    
    // Set up action handler
    await page.exposeFunction('handleAction', () => {
      actionClicked = true;
    });
    
    // Create notification with action
    await page.evaluate(() => {
      // @ts-ignore
      const { toast } = window.require?.('../stores/notificationStore') || {};
      if (toast) {
        toast.error('Connection lost', 'Unable to reach server', {
          duration: 0,
          action: {
            label: 'Retry',
            onClick: () => window.handleAction()
          }
        });
      }
    });
    
    // Click action button
    await page.click('button:has-text("Retry")');
    
    // Verify action was called
    expect(actionClicked).toBe(true);
  });
});