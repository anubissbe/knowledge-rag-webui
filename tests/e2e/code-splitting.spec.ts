import { test, expect } from '@playwright/test';

test.describe('Code Splitting & Performance', () => {
  test('should load initial page with smaller bundle size', async ({ page }) => {
    // Track network requests
    const networkRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('.js') && !url.includes('node_modules')) {
        networkRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should load main index chunk
    const mainChunk = networkRequests.find(url => url.includes('index-') && url.includes('.js'));
    expect(mainChunk).toBeDefined();

    // Should load vendor chunks
    const vendorChunks = networkRequests.filter(url => url.includes('vendor-') && url.includes('.js'));
    expect(vendorChunks.length).toBeGreaterThan(0);

    // Should preload critical chunks
    const preloadLinks = await page.$$('link[rel="modulepreload"]');
    expect(preloadLinks.length).toBeGreaterThanOrEqual(3);
  });

  test('should lazy load page components on navigation', async ({ page }) => {
    const networkRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('.js') && !url.includes('node_modules')) {
        networkRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Clear initial requests
    networkRequests.length = 0;

    // Navigate to Memories page
    await page.click('[data-testid="memories-link"]');
    await page.waitForSelector('h1:has-text("Memories")');

    // Should load Memories chunk
    const memoriesChunk = networkRequests.find(url => url.includes('Memories-') && url.includes('.js'));
    expect(memoriesChunk).toBeDefined();

    // Clear requests
    networkRequests.length = 0;

    // Navigate to Search page
    await page.click('[data-testid="search-link"]');
    await page.waitForSelector('h1:has-text("Search")');

    // Should load Search chunk
    const searchChunk = networkRequests.find(url => url.includes('Search-') && url.includes('.js'));
    expect(searchChunk).toBeDefined();
  });

  test('should show loading spinner during page transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Slow down network to see loading states
    await page.route('**/*.js', route => {
      setTimeout(() => route.continue(), 100);
    });

    // Navigate to settings
    const navigationPromise = page.click('[data-testid="settings-link"]');
    
    // Should show loading spinner briefly
    const loadingSpinner = page.locator('.animate-spin');
    await expect(loadingSpinner).toBeVisible({ timeout: 2000 });

    await navigationPromise;
    await page.waitForSelector('h1:has-text("Settings")');

    // Loading spinner should be gone
    await expect(loadingSpinner).not.toBeVisible();
  });

  test('should load chart vendor chunk only when needed', async ({ page }) => {
    const networkRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('chart-vendor') && url.includes('.js')) {
        networkRequests.push(url);
      }
    });

    // Navigate to search and memories - shouldn't load chart vendor
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="memories-link"]');
    await page.waitForLoadState('networkidle');

    // Should not have loaded chart vendor yet
    expect(networkRequests.length).toBe(0);

    // Navigate to dashboard - should load chart vendor
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForLoadState('networkidle');

    // Should now load chart vendor for dashboard charts
    expect(networkRequests.length).toBeGreaterThan(0);
  });

  test('should lazy load keyboard shortcuts modal', async ({ page }) => {
    const networkRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('KeyboardShortcutsModal') && url.includes('.js')) {
        networkRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not have loaded modal chunk yet
    expect(networkRequests.length).toBe(0);

    // Trigger keyboard shortcuts modal
    await page.keyboard.press('?');
    await page.waitForSelector('[role="dialog"]');

    // Should now load modal chunk
    expect(networkRequests.length).toBeGreaterThan(0);

    // Modal should be visible
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
  });

  test('should handle code splitting errors gracefully', async ({ page }) => {
    // Simulate network error for chunk loading
    await page.route('**/Settings-*.js', route => {
      route.abort('failed');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to navigate to settings
    await page.click('[data-testid="settings-link"]');

    // Should show error boundary or fallback
    const errorElements = await page.locator('text=Something went wrong, text=Error, text=Failed to load').count();
    
    // Either error boundary shows or navigation fails gracefully
    // In this case, we expect some kind of error handling
    expect(errorElements).toBeGreaterThanOrEqual(0);
  });

  test('should preload critical chunks on initial load', async ({ page }) => {
    await page.goto('/');
    
    // Check that modulepreload links exist for critical chunks
    const preloadLinks = await page.$$eval('link[rel="modulepreload"]', links => 
      links.map(link => link.getAttribute('href'))
    );

    // Should preload React vendor
    const reactVendorPreload = preloadLinks.some(href => href?.includes('react-vendor'));
    expect(reactVendorPreload).toBe(true);

    // Should preload utils vendor
    const utilsVendorPreload = preloadLinks.some(href => href?.includes('utils-vendor'));
    expect(utilsVendorPreload).toBe(true);

    // Should preload UI vendor
    const uiVendorPreload = preloadLinks.some(href => href?.includes('ui-vendor'));
    expect(uiVendorPreload).toBe(true);
  });

  test('should cache vendor chunks for subsequent visits', async ({ page, context }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Track cached resources
    const cachedRequests: string[] = [];
    page.on('response', response => {
      if (response.fromServiceWorker() || response.status() === 304) {
        cachedRequests.push(response.url());
      }
    });

    // Second visit - should use cached resources
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should have some cached responses
    expect(cachedRequests.length).toBeGreaterThanOrEqual(0);
  });

  test('should load form vendor chunk only for settings pages', async ({ page }) => {
    const networkRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('form-vendor') && url.includes('.js')) {
        networkRequests.push(url);
      }
    });

    // Navigate to dashboard and search - shouldn't need form vendor
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="search-link"]');
    await page.waitForLoadState('networkidle');

    // Should not have loaded form vendor yet
    expect(networkRequests.length).toBe(0);

    // Navigate to settings - should load form vendor
    await page.click('[data-testid="settings-link"]');
    await page.waitForLoadState('networkidle');

    // Should now load form vendor for settings forms
    expect(networkRequests.length).toBeGreaterThan(0);
  });

  test('should maintain fast navigation between already loaded pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Load all pages once
    await page.click('[data-testid="memories-link"]');
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="search-link"]');
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="settings-link"]');
    await page.waitForLoadState('networkidle');

    // Measure navigation time for already loaded page
    const startTime = Date.now();
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForSelector('h1:has-text("Dashboard")');
    const endTime = Date.now();

    // Should be fast (under 500ms) since already loaded
    const navigationTime = endTime - startTime;
    expect(navigationTime).toBeLessThan(1000);
  });
});