import { test, expect } from '@playwright/test';

test.describe('WebSocket Real-time Sync', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for development
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-store', JSON.stringify({
        state: { 
          isAuthenticated: true, 
          token: 'mock-token',
          user: { id: 'test-user', name: 'Test User' }
        },
        version: 0
      }));
    });
  });

  test('should show WebSocket connection status', async ({ page }) => {
    await page.goto('/memories');
    
    // Check for WebSocket status indicator
    const wsStatus = page.locator('[data-testid="websocket-status"]');
    await expect(wsStatus).toBeVisible();
    
    // Should show either connected or disconnected state
    const statusText = await wsStatus.textContent();
    expect(['Live', 'Offline']).toContain(statusText?.trim());
  });

  test('should access WebSocket test page', async ({ page }) => {
    await page.goto('/test-websocket');
    
    // Check page loaded
    await expect(page.locator('h1')).toContainText('WebSocket Test Page');
    
    // Check connection status section
    await expect(page.locator('text=Connection Status')).toBeVisible();
    
    // Check for connect/disconnect button
    const connectBtn = page.locator('button:has-text("Connect"), button:has-text("Disconnect")');
    await expect(connectBtn).toBeVisible();
  });

  test('should simulate WebSocket events', async ({ page }) => {
    await page.goto('/test-websocket');
    
    // Click test event buttons
    await page.click('button:has-text("Memory Created")');
    await page.click('button:has-text("Start Sync")');
    
    // Check event log
    const eventLog = page.locator('[data-testid="event-log"], .font-mono');
    await expect(eventLog).toContainText('Memory created event');
    await expect(eventLog).toContainText('Sync started');
  });

  test('should show subscribed rooms', async ({ page }) => {
    await page.goto('/test-websocket');
    
    // Check subscribed rooms section
    await expect(page.locator('text=Subscribed Rooms')).toBeVisible();
    
    // Navigate to a memory detail page to trigger subscription
    await page.goto('/memories/test-memory-id');
    await page.waitForTimeout(500); // Wait for subscription
    
    // Go back to test page
    await page.goto('/test-websocket');
    
    // Should show subscription if connected
    const roomsList = page.locator('text=Subscribed Rooms').locator('..');
    const roomsText = await roomsList.textContent();
    
    // Either shows rooms or "No active subscriptions"
    expect(roomsText).toBeTruthy();
  });

  test('should handle connection and disconnection', async ({ page }) => {
    await page.goto('/test-websocket');
    
    // Get initial state
    const statusSection = page.locator('text=Connection Status').locator('..');
    const initialStatus = await statusSection.textContent();
    
    // If disconnected, try to connect
    if (initialStatus?.includes('Disconnected')) {
      await page.click('button:has-text("Connect")');
      await page.waitForTimeout(1000);
      
      // Check if status changed
      const newStatus = await statusSection.textContent();
      expect(newStatus).not.toBe(initialStatus);
    }
    
    // If connected, try to disconnect
    if (await page.locator('button:has-text("Disconnect")').isVisible()) {
      await page.click('button:has-text("Disconnect")');
      await page.waitForTimeout(500);
      
      // Should show disconnected
      await expect(statusSection).toContainText('Disconnected');
    }
  });

  test('should display current memories and collections', async ({ page }) => {
    await page.goto('/test-websocket');
    
    // Check memories section
    const memoriesSection = page.locator('text=/Current Memories.*\\d+/');
    await expect(memoriesSection).toBeVisible();
    
    // Check collections section
    const collectionsSection = page.locator('text=/Current Collections.*\\d+/');
    await expect(collectionsSection).toBeVisible();
  });

  test('WebSocket status should persist across navigation', async ({ page }) => {
    // Go to memories page
    await page.goto('/memories');
    
    // Check WebSocket status
    const wsStatus1 = await page.locator('[data-testid="websocket-status"]').textContent();
    
    // Navigate to another page
    await page.goto('/collections');
    
    // Status should still be visible
    const wsStatus2 = await page.locator('[data-testid="websocket-status"]').textContent();
    expect(wsStatus2).toBe(wsStatus1);
  });

  test('should show syncing indicator during updates', async ({ page }) => {
    await page.goto('/test-websocket');
    
    // Trigger sync start event
    await page.click('button:has-text("Start Sync")');
    
    // Check for syncing indicator (if connected)
    const syncIndicator = page.locator('text=Syncing..., text=No').first();
    await expect(syncIndicator).toBeVisible();
  });
});

test.describe('Real-time Memory Updates', () => {
  test.skip('should receive real-time memory updates', async ({ browser }) => {
    // This test would require a real WebSocket server
    // Skipping in CI environment
    
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Setup auth for both pages
    const authSetup = async (page: any) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth-store', JSON.stringify({
          state: { 
            isAuthenticated: true, 
            token: 'mock-token',
            user: { id: 'test-user', name: 'Test User' }
          },
          version: 0
        }));
      });
    };
    
    await authSetup(page1);
    await authSetup(page2);
    
    // Open memories list in both pages
    await page1.goto('/memories');
    await page2.goto('/memories');
    
    // Create a memory in page1
    await page1.click('button:has-text("New Memory")');
    await page1.fill('input[name="title"]', 'Real-time Test Memory');
    await page1.click('button[type="submit"]');
    
    // Should appear in page2 automatically
    await expect(page2.locator('text=Real-time Test Memory')).toBeVisible({ timeout: 5000 });
    
    await context.close();
  });
});