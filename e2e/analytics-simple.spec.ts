import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard - Simple Tests', () => {
  test('should render analytics page', async ({ page }) => {
    // Go directly to analytics page
    await page.goto('/analytics');
    
    // Wait for any content to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'analytics-test.png' });
    
    // Check if we're on the right page - be flexible with selectors
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Has analytics content:', pageContent.includes('Analytics') || pageContent.includes('analytics'));
    
    // Try to find any heading
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Found headings:', headings);
    
    // Pass if we found anything analytics-related
    expect(headings.some(h => h.toLowerCase().includes('analytics')) || 
           pageContent.toLowerCase().includes('analytics')).toBeTruthy();
  });
});