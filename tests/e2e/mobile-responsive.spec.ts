import { test, expect, devices } from '@playwright/test';

// Test on common mobile devices
const mobileDevices = [
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'Pixel 5', ...devices['Pixel 5'] },
];

const tabletDevices = [
  { name: 'iPad', ...devices['iPad'] },
];

test.describe('Mobile Responsiveness', () => {
  // Test mobile navigation
  mobileDevices.forEach((device) => {
    test(`Mobile navigation works on ${device.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      
      await page.goto('/');
      
      // Check mobile menu button is visible
      const mobileMenuButton = page.locator('[aria-label="Toggle menu"]');
      await expect(mobileMenuButton).toBeVisible();
      
      // Click mobile menu button
      await mobileMenuButton.click();
      
      // Check navigation items are visible
      await expect(page.locator('text=Memories')).toBeVisible();
      await expect(page.locator('text=Search')).toBeVisible();
      await expect(page.locator('text=Settings')).toBeVisible();
      
      // Navigate to memories page
      await page.click('text=Memories');
      await expect(page.locator('h1:has-text("My Memories")')).toBeVisible();
      
      await context.close();
    });
  });

  // Test touch interactions
  test('Touch interactions work on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/memories');
    
    // Test search input touch interaction
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.tap();
    await expect(searchInput).toBeFocused();
    
    // Test button touch interaction
    const newMemoryButton = page.locator('text=New Memory').or(page.locator('text=New'));
    await expect(newMemoryButton).toBeVisible();
    
    // Check minimum touch target size (44px)
    const buttonBox = await newMemoryButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    
    await context.close();
  });

  // Test mobile search functionality
  test('Search works properly on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
    });
    const page = await context.newPage();
    
    await page.goto('/search');
    
    // Test search input
    const searchInput = page.locator('input[placeholder*="Search your memories"]');
    await expect(searchInput).toBeVisible();
    
    // Check input has proper mobile styling
    const inputBox = await searchInput.boundingBox();
    expect(inputBox?.height).toBeGreaterThanOrEqual(52); // min-h-[52px]
    
    // Test filter button
    const filterButton = page.locator('button:has-text("Filters")');
    await expect(filterButton).toBeVisible();
    await filterButton.tap();
    
    // Check filters panel appears
    await expect(page.locator('text=Tags')).toBeVisible();
    
    await context.close();
  });

  // Test mobile settings page
  test('Settings page adapts to mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/settings');
    
    // Check for mobile dropdown instead of sidebar
    await expect(page.locator('select#mobile-settings-nav')).toBeVisible();
    
    // Test dropdown functionality
    await page.selectOption('select#mobile-settings-nav', 'api-keys');
    await expect(page.locator('text=API Keys')).toBeVisible();
    
    await context.close();
  });

  // Test tablet layout
  tabletDevices.forEach((device) => {
    test(`Layout adapts properly on ${device.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      
      await page.goto('/memories');
      
      // Check grid layout adjusts for tablet
      const memoryGrid = page.locator('[class*="grid"]').first();
      await expect(memoryGrid).toBeVisible();
      
      // Check navigation is still visible (not mobile menu)
      await expect(page.locator('[aria-label="Toggle menu"]')).not.toBeVisible();
      
      await context.close();
    });
  });

  // Test orientation changes
  test('App handles orientation changes', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Test portrait mode
    await expect(page.locator('h1')).toBeVisible();
    
    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    
    // Check app still works in landscape
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigate to another page in landscape
    const mobileMenuButton = page.locator('[aria-label="Toggle menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
    }
    await page.click('text=Search');
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    await context.close();
  });

  // Test accessibility on mobile
  test('Mobile accessibility features work', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check ARIA labels are present
    await expect(page.locator('[aria-label="Toggle menu"]')).toBeVisible();
    await expect(page.locator('[aria-label="Toggle theme"]')).toBeVisible();
    
    await context.close();
  });

  // Test performance on mobile
  test('Mobile performance is acceptable', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    // Start performance monitoring
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Check page loads reasonably fast
    const startTime = Date.now();
    await page.goto('/memories');
    await page.waitForSelector('h1:has-text("My Memories")');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds on mobile
    expect(loadTime).toBeLessThan(3000);
    
    await context.close();
  });

  // Test mobile-specific UI elements
  test('Mobile-specific UI elements are present', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
    });
    const page = await context.newPage();
    
    await page.goto('/memories');
    
    // Check for mobile-optimized spacing
    const header = page.locator('header');
    await expect(header).toHaveCSS('padding', /.+/);
    
    // Check buttons have minimum touch target size
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(36); // Minimum reasonable touch target
        }
      }
    }
    
    await context.close();
  });

  // Test mobile edge cases
  test('Mobile edge cases handled properly', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Galaxy S21'],
    });
    const page = await context.newPage();
    
    // Test very long content
    await page.goto('/search');
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('This is a very long search query that might overflow on mobile devices and cause layout issues');
    
    // Should not cause horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 1); // Allow for 1px rounding
    
    await context.close();
  });
});

test.describe('Mobile Dark Mode', () => {
  test('Dark mode works properly on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Check dark mode is applied
    const body = page.locator('body');
    await expect(body).toHaveClass(/dark/);
    
    // Test theme toggle on mobile
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    
    // Should switch to light mode
    await expect(body).not.toHaveClass(/dark/);
    
    await context.close();
  });
});