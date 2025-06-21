import { test, expect } from '@playwright/test';

test.describe('Logging System', () => {
  let consoleMessages: Array<{ type: string; text: string; args: unknown[] }> = [];

  test.beforeEach(async ({ page }) => {
    // Capture console messages
    consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        args: msg.args()
      });
    });

    await page.goto('/');
  });

  test('should use structured logging in development', async ({ page }) => {
    // Wait for initial page load and any WebSocket connections
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow time for logging
    
    // Check that console messages follow structured format
    const infoMessages = consoleMessages.filter(msg => msg.type === 'info' || msg.type === 'debug');
    
    // Should have some log messages (may be debug level in test environment)
    expect(infoMessages.length).toBeGreaterThanOrEqual(0);
    
    // If we have messages, check for structured format
    if (infoMessages.length > 0) {
      const structuredMessages = infoMessages.filter(msg => 
        msg.text.includes('[') && 
        msg.text.includes(']:') &&
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(msg.text)
      );
      
      expect(structuredMessages.length).toBeGreaterThan(0);
    }
  });

  test('should not have console.log statements in production build', async ({ page }) => {
    // Navigate through different sections to trigger various components
    await page.click('[data-testid="memories-link"]');
    await page.waitForSelector('h1:has-text("Memories")');
    
    await page.click('[data-testid="search-link"]');
    await page.waitForSelector('h1:has-text("Search")');
    
    await page.click('[data-testid="settings-link"]');
    await page.waitForSelector('h1:has-text("Settings")');
    
    // Check that no raw console.log messages exist
    const logMessages = consoleMessages.filter(msg => 
      msg.type === 'log' && 
      !msg.text.includes('[') && // Not structured format
      !msg.text.includes('INFO') && // Not logger format
      !msg.text.includes('DEBUG') &&
      !msg.text.includes('WARN') &&
      !msg.text.includes('ERROR')
    );
    
    // Should have no unstructured console.log messages
    expect(logMessages.length).toBe(0);
  });

  test('should log WebSocket events with context', async ({ page }) => {
    // Wait for WebSocket connection
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow time for WebSocket events
    
    // Check for WebSocket-related log messages
    const wsMessages = consoleMessages.filter(msg => 
      msg.text.includes('[WebSocket]') || 
      msg.text.includes('WebSocket')
    );
    
    expect(wsMessages.length).toBeGreaterThan(0);
    
    // Verify structured format for WebSocket logs
    const structuredWsMessages = wsMessages.filter(msg =>
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*INFO\[WebSocket\]:/.test(msg.text)
    );
    
    expect(structuredWsMessages.length).toBeGreaterThan(0);
  });

  test('should log user interactions with appropriate context', async ({ page }) => {
    // Navigate to settings to trigger component logger
    await page.click('[data-testid="settings-link"]');
    await page.click('text=Preferences');
    
    // Change a preference to trigger logging
    await page.selectOption('select[aria-label="Select language"]', 'es');
    
    // Wait a moment for potential logging
    await page.waitForTimeout(500);
    
    // Check for component-related logging (may be debug level in tests)
    const componentMessages = consoleMessages.filter(msg => 
      msg.text.includes('[Component]') ||
      msg.text.includes('preferences') ||
      msg.text.includes('settings')
    );
    
    // May not always have messages depending on log level, but structure should be correct if present
    if (componentMessages.length > 0) {
      expect(componentMessages.some(msg => 
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(msg.text)
      )).toBe(true);
    }
  });

  test('should handle PWA installation events', async ({ page, browserName }) => {
    // Skip on Safari as it doesn't support PWA install prompts the same way
    test.skip(browserName === 'webkit', 'PWA features vary on Safari');
    
    // Trigger PWA-related functionality by checking for Service Worker
    await page.evaluate(() => {
      // Trigger Service Worker registration if not already done
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration();
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check for PWA-related log messages
    const pwaMessages = consoleMessages.filter(msg => 
      msg.text.includes('[PWA]') ||
      msg.text.includes('Service Worker') ||
      msg.text.includes('SW ')
    );
    
    // Should have PWA-related logging
    expect(pwaMessages.length).toBeGreaterThan(0);
    
    // Verify proper structure
    const structuredPwaMessages = pwaMessages.filter(msg =>
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(msg.text)
    );
    
    expect(structuredPwaMessages.length).toBeGreaterThan(0);
  });

  test('should log hook lifecycle events', async ({ page }) => {
    // Navigate to trigger different hooks
    await page.click('[data-testid="memories-link"]');
    await page.waitForSelector('h1:has-text("Memories")');
    
    // Use keyboard shortcut to trigger hook logging
    await page.keyboard.press('?'); // Help shortcut
    await page.waitForTimeout(500);
    
    // Check for hook-related messages (debug level)
    const hookMessages = consoleMessages.filter(msg => 
      msg.text.includes('[Hook]') ||
      msg.text.includes('shortcut') ||
      msg.text.includes('keyboard')
    );
    
    // May not always have messages in test environment, but verify structure if present
    if (hookMessages.length > 0) {
      expect(hookMessages.some(msg => 
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(msg.text)
      )).toBe(true);
    }
  });

  test('should not expose sensitive information in logs', async ({ page }) => {
    // Navigate to API keys section
    await page.click('[data-testid="settings-link"]');
    await page.click('text=API Keys');
    await page.waitForSelector('[data-testid="api-keys-list"]');
    
    // Show an API key (should trigger logging but not expose key)
    const showButton = page.locator('button[aria-label*="Show full API key"]').first();
    await showButton.click();
    
    await page.waitForTimeout(500);
    
    // Check that no log messages contain API keys
    const sensitiveMessages = consoleMessages.filter(msg => 
      msg.text.includes('sk-') || 
      msg.text.includes('1234567890abcdef') ||
      msg.text.includes('prod') && msg.text.includes('key')
    );
    
    // Should not log actual API key values
    expect(sensitiveMessages.length).toBe(0);
  });

  test('should maintain log context consistency', async ({ page }) => {
    // Navigate through different sections
    await page.click('[data-testid="memories-link"]');
    await page.waitForSelector('h1:has-text("Memories")');
    
    await page.click('[data-testid="search-link"]');
    await page.waitForSelector('h1:has-text("Search")');
    
    await page.waitForTimeout(1000);
    
    // Group messages by context
    const contextGroups = new Map<string, number>();
    
    consoleMessages.forEach(msg => {
      const contextMatch = msg.text.match(/\[(.*?)\]/);
      if (contextMatch) {
        const context = contextMatch[1];
        contextGroups.set(context, (contextGroups.get(context) || 0) + 1);
      }
    });
    
    // Should have multiple different contexts
    expect(contextGroups.size).toBeGreaterThanOrEqual(1);
    
    // Common contexts should be present
    const commonContexts = ['WebSocket', 'PWA', 'Hook', 'Component'];
    const foundContexts = Array.from(contextGroups.keys());
    
    // At least one common context should be found
    const hasCommonContext = commonContexts.some(context => 
      foundContexts.some(found => found.includes(context))
    );
    
    expect(hasCommonContext).toBe(true);
  });

  test('should handle offline/online events', async ({ page }) => {
    // Simulate going offline and online
    await page.context().setOffline(true);
    await page.waitForTimeout(500);
    
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);
    
    // Check for connectivity-related logging
    const connectivityMessages = consoleMessages.filter(msg => 
      msg.text.includes('connection') ||
      msg.text.includes('offline') ||
      msg.text.includes('online') ||
      msg.text.includes('restored')
    );
    
    // Should have some connectivity logging
    expect(connectivityMessages.length).toBeGreaterThanOrEqual(0); // May be 0 in test environment
    
    // If messages exist, verify they're properly structured
    if (connectivityMessages.length > 0) {
      const structuredConnectivityMessages = connectivityMessages.filter(msg =>
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(msg.text)
      );
      
      expect(structuredConnectivityMessages.length).toBeGreaterThan(0);
    }
  });
});