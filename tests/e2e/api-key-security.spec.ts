import { test, expect } from '@playwright/test';

test.describe('API Key Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Navigate to settings and then API keys
    await page.click('[data-testid="settings-link"]');
    await page.click('text=API Keys');
    
    // Wait for API keys to load
    await page.waitForSelector('[data-testid="api-keys-list"]', { timeout: 10000 });
  });

  test('should mask API keys by default', async ({ page }) => {
    // Check that API keys are masked by default
    const apiKeyElements = await page.locator('code[class*="font-mono"]').all();
    
    for (const element of apiKeyElements) {
      const text = await element.textContent();
      
      // Should not show full key, should be masked
      expect(text).not.toContain('sk-prod-1234567890abcdef1234567890abcdef');
      expect(text).not.toContain('sk-dev-abcdef1234567890abcdef1234567890');
      
      // Should show masked format with last 4 characters
      expect(text).toMatch(/sk-•+[a-z0-9]{4}/);
    }
  });

  test('should show full API key when eye button is clicked', async ({ page }) => {
    // Click the first eye button to show the key
    const firstEyeButton = page.locator('button[aria-label*="Show full API key"]').first();
    await firstEyeButton.click();
    
    // Check that full key is now visible
    const apiKeyElement = page.locator('code[class*="font-mono"]').first();
    const text = await apiKeyElement.textContent();
    
    expect(text).toContain('sk-prod-1234567890abcdef1234567890abcdef');
    
    // Check that security warning is displayed
    await expect(page.locator('text=Security Warning')).toBeVisible();
    await expect(page.locator('text=It will auto-hide in 30 seconds')).toBeVisible();
  });

  test('should hide API key when eye-off button is clicked', async ({ page }) => {
    // First show the key
    const firstEyeButton = page.locator('button[aria-label*="Show full API key"]').first();
    await firstEyeButton.click();
    
    // Wait for key to be visible
    await expect(page.locator('text=sk-prod-1234567890abcdef1234567890abcdef')).toBeVisible();
    
    // Now hide it
    const eyeOffButton = page.locator('button[aria-label*="Hide API key"]').first();
    await eyeOffButton.click();
    
    // Check that key is masked again
    const apiKeyElement = page.locator('code[class*="font-mono"]').first();
    const text = await apiKeyElement.textContent();
    
    expect(text).not.toContain('sk-prod-1234567890abcdef1234567890abcdef');
    expect(text).toMatch(/sk-•+[a-z0-9]{4}/);
    
    // Security warning should be hidden
    await expect(page.locator('text=Security Warning')).not.toBeVisible();
  });

  test('should auto-hide API key after 30 seconds', async ({ page }) => {
    // Show the key
    const firstEyeButton = page.locator('button[aria-label*="Show full API key"]').first();
    await firstEyeButton.click();
    
    // Verify key is visible
    await expect(page.locator('text=sk-prod-1234567890abcdef1234567890abcdef')).toBeVisible();
    
    // Wait for auto-hide (30 seconds + buffer)
    // Using shorter timeout for testing - in real implementation we'd mock timers
    await page.evaluate(() => {
      // Fast-forward all timers by 30 seconds
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = ((callback: () => void, delay: number) => {
        if (delay === 30000) {
          // Immediately execute the 30-second timeout
          callback();
          return 0;
        }
        return originalSetTimeout(callback, delay);
      }) as typeof setTimeout;
    });
    
    // Trigger a re-render to see the auto-hide effect
    await page.click('body');
    
    // Check if toast notification appears (auto-hide notification)
    await expect(page.locator('text=Auto-hidden')).toBeVisible({ timeout: 1000 });
    
    // Verify key is masked again
    const apiKeyElement = page.locator('code[class*="font-mono"]').first();
    const text = await apiKeyElement.textContent();
    expect(text).toMatch(/sk-•+[a-z0-9]{4}/);
  });

  test('should copy full API key to clipboard when copy button is clicked', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Click copy button for first API key
    const firstCopyButton = page.locator('button[aria-label*="Copy full API key"]').first();
    await firstCopyButton.click();
    
    // Check that toast notification appears
    await expect(page.locator('text=Copied!')).toBeVisible();
    
    // Verify clipboard contains the full API key
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('sk-prod-1234567890abcdef1234567890abcdef');
  });

  test('should create new API key with proper masking', async ({ page }) => {
    // Fill in new key name
    await page.fill('input[placeholder*="Enter key name"]', 'Test API Key');
    
    // Click create button
    await page.click('button:has-text("Create Key")');
    
    // Wait for toast notification
    await expect(page.locator('text=API key created')).toBeVisible();
    
    // Check that new key appears in the list and is masked
    const apiKeys = await page.locator('code[class*="font-mono"]').all();
    expect(apiKeys.length).toBe(3); // Original 2 + new 1
    
    // Check the last (newest) API key is properly masked
    const newKeyElement = apiKeys[apiKeys.length - 1];
    const text = await newKeyElement.textContent();
    expect(text).toMatch(/sk-•+[a-z0-9]{4}/);
  });

  test('should handle delete confirmation for API keys', async ({ page }) => {
    // Count initial API keys
    const initialKeys = await page.locator('code[class*="font-mono"]').count();
    
    // Click delete button for first API key
    const firstDeleteButton = page.locator('button[aria-label*="Delete"]').first();
    
    // Handle the confirmation dialog
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Are you sure you want to delete this API key?');
      dialog.accept();
    });
    
    await firstDeleteButton.click();
    
    // Wait for toast notification
    await expect(page.locator('text=API key deleted')).toBeVisible();
    
    // Verify one less API key exists
    const finalKeys = await page.locator('code[class*="font-mono"]').count();
    expect(finalKeys).toBe(initialKeys - 1);
  });

  test('should show proper button tooltips', async ({ page }) => {
    // Check show key tooltip
    const showButton = page.locator('button[aria-label*="Show full API key"]').first();
    await expect(showButton).toHaveAttribute('title', 'Show full API key');
    
    // Show the key to check hide tooltip
    await showButton.click();
    
    const hideButton = page.locator('button[aria-label*="Hide API key"]').first();
    await expect(hideButton).toHaveAttribute('title', 'Hide API key (auto-hides in 30s)');
    
    // Check copy button tooltip
    const copyButton = page.locator('button[aria-label*="Copy full API key"]').first();
    await expect(copyButton).toHaveAttribute('title', 'Copy full API key to clipboard');
  });

  test('should display permissions correctly', async ({ page }) => {
    // Check that permissions are displayed for each API key
    const permissionElements = await page.locator('span:has-text("read"), span:has-text("write")').all();
    
    expect(permissionElements.length).toBeGreaterThan(0);
    
    // Verify permission styling
    for (const element of permissionElements) {
      await expect(element).toHaveClass(/bg-green-100.*text-green-700/);
    }
  });

  test('should maintain masked state when navigating away and back', async ({ page }) => {
    // Show a key
    await page.locator('button[aria-label*="Show full API key"]').first().click();
    await expect(page.locator('text=sk-prod-1234567890abcdef1234567890abcdef')).toBeVisible();
    
    // Navigate away
    await page.click('text=Dashboard');
    await page.waitForSelector('h1:has-text("Dashboard")');
    
    // Navigate back to API keys
    await page.click('[data-testid="settings-link"]');
    await page.click('text=API Keys');
    await page.waitForSelector('[data-testid="api-keys-list"]');
    
    // Verify keys are masked again (state reset)
    const apiKeyElements = await page.locator('code[class*="font-mono"]').all();
    
    for (const element of apiKeyElements) {
      const text = await element.textContent();
      expect(text).toMatch(/sk-•+[a-z0-9]{4}/);
    }
  });
});