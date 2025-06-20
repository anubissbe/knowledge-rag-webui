import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

  test('should show keyboard shortcuts help on Shift+?', async ({ page }) => {
    await page.goto('/memories');
    
    // Press Shift+?
    await page.keyboard.press('Shift+?');
    
    // Check if help modal appears
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    await expect(page.locator('text=Global Shortcuts')).toBeVisible();
    await expect(page.locator('text=Context Shortcuts')).toBeVisible();
    
    // Close with ESC
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
  });

  test('should navigate using keyboard shortcuts', async ({ page }) => {
    await page.goto('/memories');
    
    // Navigate to home
    await page.keyboard.press('h');
    await expect(page).toHaveURL('/');
    
    // Navigate to memories
    await page.keyboard.press('m');
    await expect(page).toHaveURL('/memories');
    
    // Navigate to collections
    await page.keyboard.press('c');
    await expect(page).toHaveURL('/collections');
    
    // Navigate to graph
    await page.keyboard.press('g');
    await expect(page).toHaveURL('/graph');
    
    // Navigate to analytics
    await page.keyboard.press('a');
    await expect(page).toHaveURL('/analytics');
    
    // Navigate to settings
    await page.keyboard.press('s');
    await expect(page).toHaveURL('/settings');
  });

  test('should focus search on "/" key', async ({ page }) => {
    await page.goto('/memories');
    
    // Ensure search input exists
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // Press "/" to focus search
    await page.keyboard.press('/');
    
    // Check if search is focused
    await expect(searchInput).toBeFocused();
    
    // Type in search
    await page.keyboard.type('test search');
    await expect(searchInput).toHaveValue('test search');
    
    // Clear with Escape
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeFocused();
  });

  test('should create new memory with "n" key', async ({ page }) => {
    await page.goto('/memories');
    
    // Press "n" to create new memory
    await page.keyboard.press('n');
    
    // Should navigate to new memory page
    await expect(page).toHaveURL('/memories/new');
  });

  test('should toggle sidebar with Ctrl+B', async ({ page }) => {
    await page.goto('/memories');
    
    // Check if sidebar is visible
    const sidebar = page.locator('[data-testid="sidebar"]');
    const initialVisibility = await sidebar.isVisible();
    
    // Toggle sidebar
    await page.keyboard.press('Control+b');
    
    // Sidebar visibility should change
    await page.waitForTimeout(300); // Wait for animation
    const newVisibility = await sidebar.isVisible();
    expect(newVisibility).not.toBe(initialVisibility);
  });

  test('should not trigger shortcuts when typing in input', async ({ page }) => {
    await page.goto('/memories');
    
    // Focus search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.click();
    
    // Type "h" - should not navigate to home
    await page.keyboard.type('h');
    await expect(page).toHaveURL('/memories');
    await expect(searchInput).toHaveValue('h');
  });

  test('should save with Ctrl+S when editing', async ({ page }) => {
    await page.goto('/memories/new');
    
    // Fill in some content
    const titleInput = page.locator('input[name="title"], input[placeholder*="title"]').first();
    await titleInput.fill('Test Memory');
    
    const contentArea = page.locator('textarea[name="content"], .md-editor-text-input').first();
    await contentArea.fill('Test content');
    
    // Mock save button click
    const saveButton = page.locator('[data-testid="save-button"], button:has-text("Save")').first();
    let saveClicked = false;
    await page.evaluateHandle((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          window.saveClicked = true;
        });
      }
    }, await saveButton.elementHandle());
    
    // Press Ctrl+S
    await page.keyboard.press('Control+s');
    
    // Check if save was triggered
    const wasSaveClicked = await page.evaluate(() => window.saveClicked);
    expect(wasSaveClicked).toBeTruthy();
  });

  test('should show floating keyboard shortcuts button', async ({ page }) => {
    await page.goto('/memories');
    
    // Check for floating button
    const floatingButton = page.locator('button[aria-label="Keyboard shortcuts"]');
    await expect(floatingButton).toBeVisible();
    
    // Hover to show tooltip
    await floatingButton.hover();
    await expect(page.locator('text=Keyboard Shortcuts (Shift+?)')).toBeVisible();
    
    // Click to open help
    await floatingButton.click();
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
  });

  test('keyboard shortcuts should be listed in settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Click on keyboard shortcuts section
    await page.click('button:has-text("Keyboard Shortcuts")');
    
    // Should scroll to shortcuts section
    await expect(page.locator('#shortcuts')).toBeVisible();
    await expect(page.locator('text=Global Shortcuts')).toBeVisible();
    await expect(page.locator('text=Context Shortcuts')).toBeVisible();
    
    // Check for some shortcuts
    await expect(page.locator('text=Go to home')).toBeVisible();
    await expect(page.locator('text=Focus search')).toBeVisible();
    await expect(page.locator('text=Create new memory')).toBeVisible();
  });

  test('should navigate between list items with j/k keys', async ({ page }) => {
    await page.goto('/memories');
    
    // Wait for memory cards to load
    await page.waitForSelector('[data-testid="memory-card"]');
    
    // Get all memory cards
    const memoryCards = page.locator('[data-testid="memory-card"]');
    const count = await memoryCards.count();
    
    if (count > 1) {
      // Focus first card
      await memoryCards.first().focus();
      
      // Press "j" to go to next
      await page.keyboard.press('j');
      
      // Second card should be focused
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBe('memory-card');
      
      // Press "k" to go back
      await page.keyboard.press('k');
      
      // First card should be focused again
      await expect(memoryCards.first()).toBeFocused();
    }
  });
});