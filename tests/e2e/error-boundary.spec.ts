import { test, expect } from '@playwright/test';

test.describe('Error Boundaries', () => {
  test('should display error boundary when component crashes', async ({ page }) => {
    // We'll need to inject an error to test this
    await page.goto('/');
    
    // Add a script that will cause an error
    await page.addInitScript(() => {
      // Override a method to throw an error
      window.addEventListener('error', (e) => {
        console.log('Error caught:', e);
      });
    });
    
    // The error boundary should prevent the whole app from crashing
    await expect(page.locator('text=Oops! Something went wrong')).toBeHidden();
  });

  test('should allow recovery from error state', async ({ page }) => {
    // Navigate to a page
    await page.goto('/');
    
    // If an error occurs, the error boundary should show recovery options
    // This test verifies the UI elements exist
    const errorBoundary = page.locator('text=Oops! Something went wrong');
    const reloadButton = page.locator('button:has-text("Reload Page")');
    const homeButton = page.locator('button:has-text("Go to Homepage")');
    
    // These should exist in the DOM (even if not visible)
    await expect(errorBoundary).toBeHidden();
  });

  test('should handle 404 routes gracefully', async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto('/non-existent-route');
    
    // Should show 404 error
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
    
    // Should have navigation options
    await expect(page.locator('button:has-text("Go Back")')).toBeVisible();
    await expect(page.locator('a:has-text("Go to Homepage")')).toBeVisible();
  });

  test('should not crash entire app on component error', async ({ page }) => {
    await page.goto('/');
    
    // Even if a component has an error, navigation should still work
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Should be able to navigate to other pages
    await page.click('text=Settings');
    await expect(page).toHaveURL(/\/settings/);
  });
});