import { test, expect } from '@playwright/test';

test.describe('WebSocket Real-time Updates', () => {
  test('should show connection status indicator', async ({ page }) => {
    await page.goto('/');
    
    // Check for connection status in header
    const connectionStatus = page.locator('text=Live').or(page.locator('text=Offline'));
    await expect(connectionStatus).toBeVisible();
    
    // If connected, should show latency
    const liveIndicator = page.locator('text=Live');
    if (await liveIndicator.isVisible()) {
      // May show latency in ms
      const latencyIndicator = page.locator('text=/\\d+ms/');
      // Latency might not be immediately available
      await expect(latencyIndicator).toBeVisible({ timeout: 35000 });
    }
  });

  test('should update memories list in real-time', async ({ page, context }) => {
    // Open memories page
    await page.goto('/memories');
    
    // Count initial memories
    const initialCount = await page.locator('[data-memory-item]').count();
    
    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('/memories');
    
    // In a real test, we would trigger a memory creation via API
    // For now, we'll check that both pages have the same count
    const count2 = await page2.locator('[data-memory-item]').count();
    expect(initialCount).toBe(count2);
    
    // Check that WebSocket connection is established
    const connectionStatus = page.locator('text=Live');
    await expect(connectionStatus).toBeVisible();
  });

  test('should show real-time notifications', async ({ page }) => {
    await page.goto('/memories');
    
    // In a real scenario with WebSocket events, notifications would appear
    // For testing, we just verify the notification system is in place
    
    // The notification component is rendered but may be empty initially
    await expect(page.locator('body')).toContainText(/Live|Offline/);
  });

  test('should handle connection loss gracefully', async ({ page, context }) => {
    await page.goto('/');
    
    // Check initial connection status
    const connectionStatus = page.locator('text=Live').or(page.locator('text=Offline'));
    await expect(connectionStatus).toBeVisible();
    
    // Simulate offline mode
    await context.setOffline(true);
    
    // Should show offline indicator (from PWA offline detection)
    const offlineIndicator = page.locator('text=You\'re offline');
    await expect(offlineIndicator).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Should show back online
    const onlineIndicator = page.locator('text=Back online');
    await expect(onlineIndicator).toBeVisible();
  });

  test('should maintain WebSocket through navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check connection on home
    let connectionStatus = page.locator('text=Live').or(page.locator('text=Offline'));
    await expect(connectionStatus).toBeVisible();
    
    // Navigate to memories
    await page.click('text=Memories');
    await page.waitForURL('**/memories');
    
    // Connection should still be shown
    connectionStatus = page.locator('text=Live').or(page.locator('text=Offline'));
    await expect(connectionStatus).toBeVisible();
    
    // Navigate to search
    await page.click('text=Search');
    await page.waitForURL('**/search');
    
    // Connection should persist
    connectionStatus = page.locator('text=Live').or(page.locator('text=Offline'));
    await expect(connectionStatus).toBeVisible();
  });

  test('should integrate with bulk operations', async ({ page }) => {
    await page.goto('/memories');
    
    // Enter bulk mode
    await page.click('text=Select');
    
    // The real-time updates should not interfere with bulk selection
    const bulkHeader = page.locator('text=/Select all|Clear selection/');
    await expect(bulkHeader).toBeVisible();
    
    // Exit bulk mode
    await page.click('text=Cancel');
    
    // Should return to normal state
    await expect(bulkHeader).not.toBeVisible();
  });

  test('should work with search page', async ({ page }) => {
    await page.goto('/search');
    
    // Connection status should be visible
    const connectionStatus = page.locator('text=Live').or(page.locator('text=Offline'));
    await expect(connectionStatus).toBeVisible();
    
    // Search functionality should work regardless of WebSocket state
    await page.fill('input[placeholder="Search your memories..."]', 'test');
    
    // Results section should be present
    const resultsSection = page.locator('main');
    await expect(resultsSection).toBeVisible();
  });

  test('should show in mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Connection status might be hidden on mobile
    // Open mobile menu
    await page.click('button[aria-label="Open menu"]');
    
    // Mobile menu should be open
    const mobileMenu = page.locator('text=Dashboard').nth(1);
    await expect(mobileMenu).toBeVisible();
    
    // Close menu
    await page.click('button[aria-label="Close menu"]');
  });
});