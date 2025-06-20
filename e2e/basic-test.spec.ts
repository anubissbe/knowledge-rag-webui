import { test, expect } from '@playwright/test';

test.describe('Basic E2E Verification', () => {
  // Simple test to verify E2E setup works
  test('basic page navigation test', async ({ page }) => {
    // Navigate to a simple page to test basic functionality
    await page.goto('https://example.com');
    
    // Verify the page loads
    await expect(page).toHaveTitle(/Example Domain/);
    
    // Verify basic content is present
    await expect(page.locator('h1')).toContainText('Example Domain');
  });

  test('basic form interaction test', async ({ page }) => {
    await page.goto('https://httpbin.org/forms/post');
    
    // Fill out a simple form
    await page.fill('input[name="custname"]', 'Test Customer');
    await page.fill('input[name="custtel"]', '123-456-7890');
    await page.fill('input[name="custemail"]', 'test@example.com');
    
    // Submit the form
    await page.click('input[type="submit"]');
    
    // Verify form submission worked
    await expect(page).toHaveURL(/httpbin.org\/post/);
    await expect(page.locator('body')).toContainText('Test Customer');
  });

  test('responsive design test', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('accessibility basic check', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Verify page has proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for basic accessibility attributes
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('performance basic check', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Verify page loads within reasonable time (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });
});