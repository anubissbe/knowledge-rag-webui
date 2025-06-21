import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to search page', async ({ page }) => {
    // Click on Search button
    await page.click('text=Search');
    
    // Should be on search page
    await expect(page).toHaveURL('/search');
    await expect(page.locator('input[placeholder="Search your memories..."]')).toBeVisible();
  });

  test('should perform basic search', async ({ page }) => {
    await page.goto('/search');
    
    // Type search query
    await page.fill('input[placeholder="Search your memories..."]', 'RAG');
    
    // Should show results after debounce
    await page.waitForTimeout(500);
    await expect(page.locator('h2')).toContainText('1 result found');
    
    // Should highlight search terms
    await expect(page.locator('mark')).toBeVisible();
  });

  test('should show empty state when no query', async ({ page }) => {
    await page.goto('/search');
    
    // Should show empty state
    await expect(page.locator('text=Start searching your memories')).toBeVisible();
    await expect(page.locator('text=Enter a search term or select filters')).toBeVisible();
  });

  test('should show filters panel', async ({ page }) => {
    await page.goto('/search');
    
    // Click filters button
    await page.click('button:has-text("Filters")');
    
    // Should show filters panel
    await expect(page.locator('text=Tags')).toBeVisible();
    await expect(page.locator('text=Date Range')).toBeVisible();
    await expect(page.locator('text=Content Type')).toBeVisible();
  });

  test('should filter by tags', async ({ page }) => {
    await page.goto('/search?q=system');
    
    // Wait for initial results
    await page.waitForTimeout(500);
    
    // Click filters button
    await page.click('button:has-text("Filters")');
    
    // Select a tag filter
    await page.check('input[type="checkbox"] + span:has-text("AI")');
    
    // Should update active filter count
    await expect(page.locator('button:has-text("Filters") span')).toContainText('1');
    
    // Should show active filter tag
    await expect(page.locator('span:has-text("AI"):has(.lucide-tag)')).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    await page.goto('/search?q=RAG&tag=AI');
    
    // Should show active filter
    await expect(page.locator('span:has-text("AI"):has(.lucide-tag)')).toBeVisible();
    
    // Click clear all filters
    await page.click('text=Clear all filters');
    
    // Should remove active filters
    await expect(page.locator('span:has-text("AI"):has(.lucide-tag)')).not.toBeVisible();
  });

  test('should sort results', async ({ page }) => {
    await page.goto('/search?q=system');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Change sort order
    await page.selectOption('select[id="sort"]', 'date');
    
    // Should maintain search results
    await expect(page.locator('article')).toBeVisible();
  });

  test('should navigate to memory detail from search results', async ({ page }) => {
    await page.goto('/search?q=RAG');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Click on first result
    await page.click('article a h3');
    
    // Should navigate to memory detail
    await expect(page).toHaveURL(/\/memories\/\d+/);
    await expect(page.locator('h1')).toContainText('Understanding RAG Systems');
  });

  test('should show relevance scores', async ({ page }) => {
    await page.goto('/search?q=RAG');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Should show relevance score
    await expect(page.locator('text=% match')).toBeVisible();
    await expect(page.locator('.lucide-star')).toBeVisible();
  });

  test('should handle tag filtering from search results', async ({ page }) => {
    await page.goto('/search?q=system');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Click on a quick tag filter button
    const tagButton = page.locator('button:has-text("+AI")').first();
    if (await tagButton.isVisible()) {
      await tagButton.click();
      
      // Should add tag to active filters
      await expect(page.locator('span:has-text("AI"):has(.lucide-tag)')).toBeVisible();
    }
  });

  test('should update URL with search parameters', async ({ page }) => {
    await page.goto('/search');
    
    // Type search query
    await page.fill('input[placeholder="Search your memories..."]', 'vector');
    
    // Wait for URL update
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/search?q=vector');
  });

  test('should preserve search state on page reload', async ({ page }) => {
    await page.goto('/search?q=RAG');
    
    // Should maintain search query
    await expect(page.locator('input[placeholder="Search your memories..."]')).toHaveValue('RAG');
    
    // Reload page
    await page.reload();
    
    // Should still have search query
    await expect(page.locator('input[placeholder="Search your memories..."]')).toHaveValue('RAG');
  });

  test('should clear search query', async ({ page }) => {
    await page.goto('/search?q=test');
    
    // Should show clear button
    await expect(page.locator('button[aria-label="Clear search"]')).toBeVisible();
    
    // Click clear button
    await page.click('button[aria-label="Clear search"]');
    
    // Should clear search input
    await expect(page.locator('input[placeholder="Search your memories..."]')).toHaveValue('');
  });

  test('should show no results message', async ({ page }) => {
    await page.goto('/search');
    
    // Search for something that won't match
    await page.fill('input[placeholder="Search your memories..."]', 'nonexistentquery123');
    
    // Wait for search
    await page.waitForTimeout(500);
    
    // Should show no results message
    await expect(page.locator('text=No results found')).toBeVisible();
    await expect(page.locator('text=Try adjusting your search terms')).toBeVisible();
  });
});

test.describe('Search Results Display', () => {
  test('should highlight search terms in results', async ({ page }) => {
    await page.goto('/search?q=RAG');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Should highlight search terms with mark tags
    const highlights = page.locator('mark');
    await expect(highlights).toHaveCount({ min: 1 });
    
    // Check highlight styling
    await expect(highlights.first()).toHaveClass(/bg-yellow-200/);
  });

  test('should show search stats sidebar', async ({ page }) => {
    await page.goto('/search?q=system');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Should show stats sidebar
    await expect(page.locator('text=Search Summary')).toBeVisible();
    await expect(page.locator('text=Top Tags')).toBeVisible();
    await expect(page.locator('text=Related Entities')).toBeVisible();
  });

  test('should show content type indicators', async ({ page }) => {
    await page.goto('/search?q=system');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Should show content type icons
    await expect(page.locator('.lucide-file-text, .lucide-code, .lucide-type')).toBeVisible();
  });
});

test.describe('Search Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/search');
    
    // Tab to search input
    await page.keyboard.press('Tab');
    
    // Should focus search input
    await expect(page.locator('input[placeholder="Search your memories..."]')).toBeFocused();
    
    // Type search query
    await page.keyboard.type('RAG');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Tab through results
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate to results
    await expect(page.locator('article a:focus')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/search');
    
    // Check search input accessibility
    const searchInput = page.locator('input[placeholder="Search your memories..."]');
    await expect(searchInput).toBeVisible();
    
    // Check filter button accessibility
    await expect(page.locator('button[aria-label*="Filter"]')).toBeVisible();
  });

  test('should work with screen reader', async ({ page }) => {
    await page.goto('/search?q=RAG');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Check for semantic HTML structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
    
    // Check for proper headings hierarchy
    await expect(page.locator('h2, h3')).toHaveCount({ min: 1 });
  });
});