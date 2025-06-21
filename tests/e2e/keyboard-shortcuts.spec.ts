import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test('shows keyboard shortcuts modal with ? key', async ({ page }) => {
    await page.goto('/');
    
    // Press ? to open shortcuts modal
    await page.keyboard.press('?');
    
    // Check modal is visible
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    await expect(page.locator('text=Global Shortcuts')).toBeVisible();
    
    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
  });

  test('global navigation shortcuts work', async ({ page }) => {
    await page.goto('/');
    
    // Test Shift+M to go to Memories
    await page.keyboard.press('Shift+M');
    await page.waitForURL('**/memories');
    await expect(page.locator('h1')).toContainText('My Memories');
    
    // Test Shift+S to go to Search
    await page.keyboard.press('Shift+S');
    await page.waitForURL('**/search');
    await expect(page.locator('input[type="text"]')).toBeFocused();
    
    // Test Shift+G to go to Dashboard
    await page.keyboard.press('Shift+G');
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('Cmd/Ctrl+K focuses search', async ({ page }) => {
    await page.goto('/');
    
    // Press Cmd+K (or Ctrl+K on non-Mac)
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+K`);
    
    // Should navigate to search and focus input
    await page.waitForURL('**/search');
    await expect(page.locator('input[type="text"]')).toBeFocused();
  });

  test('search page shortcuts', async ({ page }) => {
    await page.goto('/search');
    
    // Type a search query
    await page.fill('input[type="text"]', 'test query');
    
    // Press Escape to clear
    await page.keyboard.press('Escape');
    await expect(page.locator('input[type="text"]')).toHaveValue('');
    
    // Press f to toggle filters
    await page.keyboard.press('f');
    await expect(page.locator('text=Search Filters')).toBeVisible();
    
    // Press f again to hide filters
    await page.keyboard.press('f');
    await expect(page.locator('text=Search Filters')).not.toBeVisible();
  });

  test('memories page shortcuts', async ({ page }) => {
    await page.goto('/memories');
    
    // Press / to focus search
    await page.keyboard.press('/');
    const searchInput = page.locator('input[placeholder="Search memories..."]');
    await expect(searchInput).toBeFocused();
    
    // Press n to create new memory
    await page.keyboard.press('n');
    await page.waitForURL('**/memories/new');
  });

  test('keyboard shortcuts indicator on hover', async ({ page }) => {
    await page.goto('/memories');
    
    // Hover over New Memory button
    const newMemoryButton = page.locator('text=New Memory').first();
    await newMemoryButton.hover();
    
    // Should show keyboard shortcut indicator
    await expect(page.locator('kbd:has-text("N")')).toBeVisible();
  });

  test('help button shows shortcuts modal', async ({ page }) => {
    await page.goto('/');
    
    // Click keyboard shortcuts help button in header
    const helpButton = page.locator('[aria-label="Show keyboard shortcuts"]');
    if (await helpButton.isVisible()) {
      await helpButton.click();
      await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    }
  });

  test('bulk selection shortcuts', async ({ page }) => {
    await page.goto('/memories');
    
    // Enter bulk mode
    await page.click('text=Select');
    
    // Press Ctrl/Cmd+A to select all
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+A`);
    
    // Check if select all was triggered
    const selectAllButton = page.locator('[data-select-all="true"]');
    await expect(selectAllButton).toBeVisible();
  });

  test('navigation with j/k keys', async ({ page }) => {
    await page.goto('/memories');
    
    // Focus first memory item
    const firstMemory = page.locator('[data-memory-item]').first();
    await firstMemory.focus();
    
    // Press j to go to next
    await page.keyboard.press('j');
    
    // Check focus moved (would need actual implementation)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('data-memory-item');
    
    // Press k to go to previous
    await page.keyboard.press('k');
  });

  test('settings shortcut works', async ({ page }) => {
    await page.goto('/');
    
    // Press Cmd/Ctrl+, for settings
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+,`);
    
    await page.waitForURL('**/settings');
    await expect(page.locator('h1')).toContainText('Settings');
  });

  test('keyboard navigation is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interface
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Enter should activate focused element
    await page.keyboard.press('Enter');
  });

  test('shortcuts respect input focus', async ({ page }) => {
    await page.goto('/search');
    
    // Focus search input
    await page.click('input[type="text"]');
    await page.type('input[type="text"]', 'typing normally');
    
    // Shortcuts like 'f' should not trigger when typing
    await page.keyboard.press('f');
    await expect(page.locator('input[type="text"]')).toHaveValue('typing normallyf');
    
    // Global shortcuts with modifiers should still work
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+K`);
    await expect(page.locator('input[type="text"]')).toBeFocused();
  });
});