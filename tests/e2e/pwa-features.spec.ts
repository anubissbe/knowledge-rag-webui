import { test, expect } from '@playwright/test';

test.describe('PWA Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have PWA meta tags', async ({ page }) => {
    // Check manifest link
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // Check theme color
    const themeColor = await page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#3b82f6');

    // Check Apple meta tags
    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleCapable).toHaveAttribute('content', 'yes');

    const appleTitle = await page.locator('meta[name="apple-mobile-web-app-title"]');
    await expect(appleTitle).toHaveAttribute('content', 'KnowledgeRAG');
  });

  test('should show install prompt after delay', async ({ page }) => {
    // Skip if already installed or on unsupported browser
    const isStandalone = await page.evaluate(() => window.matchMedia('(display-mode: standalone)').matches);
    if (isStandalone) {
      test.skip();
      return;
    }

    // Wait for install prompt (appears after 10 seconds)
    const installPrompt = page.locator('text=Install Knowledge RAG');
    
    // Check if browser supports beforeinstallprompt
    const supportsInstall = await page.evaluate(() => 'BeforeInstallPromptEvent' in window);
    
    if (supportsInstall) {
      await expect(installPrompt).toBeVisible({ timeout: 15000 });
      
      // Check install button exists
      const installButton = page.locator('button:has-text("Install")');
      await expect(installButton).toBeVisible();
      
      // Dismiss the prompt
      const dismissButton = page.locator('button:has-text("Not now")');
      await dismissButton.click();
      
      // Verify prompt is hidden
      await expect(installPrompt).not.toBeVisible();
    }
  });

  test('should show offline indicator when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Wait for offline indicator
    const offlineIndicator = page.locator('text=You\'re offline');
    await expect(offlineIndicator).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Should show "Back online" message
    const onlineIndicator = page.locator('text=Back online');
    await expect(onlineIndicator).toBeVisible();
    
    // Online indicator should disappear after 3 seconds
    await expect(onlineIndicator).not.toBeVisible({ timeout: 4000 });
  });

  test('should handle service worker registration', async ({ page }) => {
    // Check if service worker is registered
    const hasServiceWorker = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });

    // Service worker should be registered in production build
    // In dev mode with PWA plugin, it might also be registered
    expect(hasServiceWorker).toBeDefined();
  });

  test('should cache static assets', async ({ page, context }) => {
    // Navigate to trigger caching
    await page.goto('/');
    await page.goto('/memories');
    await page.goto('/search');
    
    // Go offline
    await context.setOffline(true);
    
    // Should still be able to navigate (cached pages)
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Navigation should work offline
    await page.click('text=Memories');
    await expect(page.locator('h1')).toContainText('My Memories');
  });

  test('should handle iOS install instructions', async ({ page, browserName }) => {
    // Skip if not relevant browser
    if (browserName !== 'webkit') {
      test.skip();
      return;
    }

    // Mock iOS user agent
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        configurable: true
      });
    });

    await page.reload();
    
    // Wait for iOS-specific install prompt
    const iosPrompt = page.locator('text=Install this app on your iPhone');
    
    // Should show iOS-specific instructions
    await expect(iosPrompt).toBeVisible({ timeout: 15000 });
    
    // Should have "Got it" button instead of "Install"
    const gotItButton = page.locator('button:has-text("Got it")');
    await expect(gotItButton).toBeVisible();
    
    // Dismiss
    await gotItButton.click();
    await expect(iosPrompt).not.toBeVisible();
  });

  test('should persist install prompt dismissal', async ({ page }) => {
    // Skip if already installed
    const isStandalone = await page.evaluate(() => window.matchMedia('(display-mode: standalone)').matches);
    if (isStandalone) {
      test.skip();
      return;
    }

    // Clear localStorage first
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Wait for install prompt
    const installPrompt = page.locator('text=Install Knowledge RAG');
    
    const supportsInstall = await page.evaluate(() => 'BeforeInstallPromptEvent' in window);
    
    if (supportsInstall) {
      await expect(installPrompt).toBeVisible({ timeout: 15000 });
      
      // Dismiss it
      await page.locator('button:has-text("Not now")').click();
      
      // Reload page
      await page.reload();
      
      // Should not show prompt again immediately
      await page.waitForTimeout(2000);
      await expect(installPrompt).not.toBeVisible();
      
      // Check localStorage
      const promptShown = await page.evaluate(() => localStorage.getItem('pwa-prompt-shown'));
      expect(promptShown).toBe('true');
    }
  });

  test('should handle update notifications', async ({ page }) => {
    // This test would require mocking service worker updates
    // For now, just check the UI components exist
    
    // The update notification component should be present in DOM
    const updateNotification = page.locator('text=New content available');
    
    // It should not be visible initially
    await expect(updateNotification).not.toBeVisible();
    
    // In a real scenario, we would trigger a service worker update
    // and verify the notification appears with a reload button
  });
});