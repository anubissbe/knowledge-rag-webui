import { test, expect } from '@playwright/test';

test.describe('Memory Detail View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to memories list', async ({ page }) => {
    // Click on View Memories button
    await page.click('text=View Memories');
    
    // Should be on memories page
    await expect(page).toHaveURL('/memories');
    await expect(page.locator('h1')).toContainText('My Memories');
  });

  test('should display memory cards in grid view', async ({ page }) => {
    await page.goto('/memories');
    
    // Should show memory cards
    const memoryCards = page.locator('article');
    await expect(memoryCards).toHaveCount(3);
    
    // First memory should have correct title
    await expect(memoryCards.first()).toContainText('Understanding RAG Systems');
  });

  test('should switch between grid and list view', async ({ page }) => {
    await page.goto('/memories');
    
    // Click list view button
    await page.click('button[aria-label="List view"]');
    
    // Should show list items
    const listItems = page.locator('article');
    await expect(listItems.first()).toContainText('Understanding RAG Systems');
    
    // Switch back to grid
    await page.click('button[aria-label="Grid view"]');
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('should filter memories by search', async ({ page }) => {
    await page.goto('/memories');
    
    // Search for "Vector"
    await page.fill('input[placeholder="Search memories..."]', 'Vector');
    
    // Should only show one result
    const memoryCards = page.locator('article');
    await expect(memoryCards).toHaveCount(1);
    await expect(memoryCards.first()).toContainText('Vector Databases Explained');
  });

  test('should filter memories by tags', async ({ page }) => {
    await page.goto('/memories');
    
    // Click on "Search" tag
    await page.click('button:has-text("Search")');
    
    // Should show filtered results
    const memoryCards = page.locator('article');
    await expect(memoryCards).toHaveCount(2);
  });

  test('should navigate to memory detail page', async ({ page }) => {
    await page.goto('/memories');
    
    // Click on first memory
    await page.click('article:first-child a');
    
    // Should be on detail page
    await expect(page).toHaveURL(/\/memories\/\d+/);
    await expect(page.locator('h1')).toContainText('Understanding RAG Systems');
  });

  test('should display memory content and metadata', async ({ page }) => {
    await page.goto('/memories/1');
    
    // Check title
    await expect(page.locator('h1')).toContainText('Understanding RAG Systems');
    
    // Check summary
    await expect(page.locator('text=An overview of Retrieval-Augmented Generation')).toBeVisible();
    
    // Check metadata
    await expect(page.locator('text=2 min read')).toBeVisible();
    await expect(page.locator('text=245 words')).toBeVisible();
    
    // Check content
    await expect(page.locator('text=Key Components')).toBeVisible();
  });

  test('should display tags and entities', async ({ page }) => {
    await page.goto('/memories/1');
    
    // Check tags
    await expect(page.locator('a:has-text("AI")')).toBeVisible();
    await expect(page.locator('a:has-text("RAG")')).toBeVisible();
    
    // Check entities
    await expect(page.locator('text=RAG').nth(1)).toBeVisible();
    await expect(page.locator('text=LangChain')).toBeVisible();
  });

  test('should display related memories', async ({ page }) => {
    await page.goto('/memories/1');
    
    // Check related memories section
    await expect(page.locator('h2:has-text("Related Memories")')).toBeVisible();
    await expect(page.locator('a:has-text("Vector Databases Explained")')).toBeVisible();
  });

  test('should handle memory actions', async ({ page, context }) => {
    await page.goto('/memories/1');
    
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Test copy button
    await page.click('button[aria-label="Copy content"]');
    
    // Test share button (if available)
    const shareButton = page.locator('button[aria-label="Share memory"]');
    if (await shareButton.isVisible()) {
      await shareButton.click();
    }
  });

  test('should navigate back to memories list', async ({ page }) => {
    await page.goto('/memories/1');
    
    // Click back button
    await page.click('a:has-text("Back")');
    
    // Should be on memories page
    await expect(page).toHaveURL('/memories');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/memories/1');
    
    // Check that content is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Sidebar should be below content on mobile
    const tags = page.locator('h2:has-text("Tags")');
    const content = page.locator('h1:has-text("Understanding RAG Systems")');
    
    const tagsBox = await tags.boundingBox();
    const contentBox = await content.boundingBox();
    
    if (tagsBox && contentBox) {
      expect(tagsBox.y).toBeGreaterThan(contentBox.y);
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/memories');
    
    // Check navigation
    await expect(page.locator('nav[aria-label="Settings navigation"]')).toBeVisible();
    
    // Check buttons have labels
    await expect(page.locator('button[aria-label="Grid view"]')).toBeVisible();
    await expect(page.locator('button[aria-label="List view"]')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/memories');
    
    // Tab to search input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should focus search input
    const searchInput = page.locator('input[placeholder="Search memories..."]');
    await expect(searchInput).toBeFocused();
    
    // Tab to first memory card
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Press Enter to navigate
    await page.keyboard.press('Enter');
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/memories\/\d+/);
  });

  test('should work with screen reader', async ({ page }) => {
    await page.goto('/memories/1');
    
    // Check that images have alt text
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check skip to main content link
    await page.goto('/');
    const skipLink = page.locator('a:has-text("Skip to main content")');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});