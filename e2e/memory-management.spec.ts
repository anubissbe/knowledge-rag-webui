import { test, expect, Page } from '@playwright/test';

class MemoryManagementPage {
  constructor(private page: Page) {}

  async navigateToMemories() {
    await this.page.goto('/memories');
    await this.page.waitForLoadState('networkidle');
  }

  async createNewMemory(title: string, content: string, tags: string[] = []) {
    await this.page.click('[data-testid="new-memory-button"]');
    await this.page.fill('[placeholder*="memory title"]', title);
    await this.page.fill('[data-testid="markdown-editor"]', content);
    
    if (tags.length > 0) {
      await this.page.fill('[placeholder*="add tags"]', tags.join(', '));
    }
    
    await this.page.click('button:has-text("Create Memory")');
    await this.page.waitForLoadState('networkidle');
  }

  async searchMemories(query: string) {
    await this.page.fill('[placeholder*="search memories"]', query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async selectMemory(memoryTitle: string) {
    await this.page.click(`[data-testid="memory-card"]:has-text("${memoryTitle}")`);
  }

  async editMemory(originalTitle: string, newTitle: string) {
    await this.page.click(`[data-testid="memory-card"]:has-text("${originalTitle}") [data-testid="edit-button"]`);
    await this.page.fill('[placeholder*="memory title"]', '');
    await this.page.fill('[placeholder*="memory title"]', newTitle);
    await this.page.click('button:has-text("Update Memory")');
    await this.page.waitForLoadState('networkidle');
  }

  async deleteMemory(memoryTitle: string) {
    await this.page.click(`[data-testid="memory-card"]:has-text("${memoryTitle}") [data-testid="delete-button"]`);
    await this.page.click('button:has-text("Confirm Delete")');
    await this.page.waitForLoadState('networkidle');
  }

  async bulkSelectMemories(memoryTitles: string[]) {
    await this.page.click('[data-testid="bulk-select-button"]');
    
    for (const title of memoryTitles) {
      await this.page.click(`[data-testid="memory-card"]:has-text("${title}") input[type="checkbox"]`);
    }
  }

  async bulkDeleteSelected() {
    await this.page.click('[data-testid="bulk-delete-button"]');
    await this.page.click('button:has-text("Confirm Delete")');
    await this.page.waitForLoadState('networkidle');
  }

  async getMemoryCards() {
    return this.page.locator('[data-testid="memory-card"]');
  }

  async getMemoryCount() {
    return await this.getMemoryCards().count();
  }

  async isMemoryVisible(title: string) {
    return await this.page.locator(`[data-testid="memory-card"]:has-text("${title}")`).isVisible();
  }
}

test.describe('Memory Management E2E', () => {
  let memoryPage: MemoryManagementPage;

  test.beforeEach(async ({ page }) => {
    memoryPage = new MemoryManagementPage(page);
    
    // Setup test data or clear existing data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display memories list on page load', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    // Should show the memories page
    await expect(page).toHaveTitle(/memories/i);
    await expect(page.locator('h1')).toContainText('Memories');
    
    // Should have the main UI elements
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-memory-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="filters-button"]')).toBeVisible();
  });

  test('should create a new memory', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    const title = 'Test Memory E2E';
    const content = '# Test Memory\n\nThis is a test memory created via E2E testing.';
    const tags = ['test', 'e2e', 'automation'];

    await memoryPage.createNewMemory(title, content, tags);
    
    // Should redirect back to memories list
    await expect(page).toHaveURL(/\/memories/);
    
    // Should display the new memory
    await expect(memoryPage.isMemoryVisible(title)).resolves.toBe(true);
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Memory created successfully');
  });

  test('should search and filter memories', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    // Create test memories first
    await memoryPage.createNewMemory('React Hooks Guide', '# React Hooks\n\nGuide content', ['react', 'hooks']);
    await memoryPage.createNewMemory('Vue Components', '# Vue Components\n\nVue content', ['vue', 'components']);
    
    // Search for React memories
    await memoryPage.searchMemories('React');
    
    // Should only show React-related memories
    await expect(memoryPage.isMemoryVisible('React Hooks Guide')).resolves.toBe(true);
    await expect(memoryPage.isMemoryVisible('Vue Components')).resolves.toBe(false);
    
    // Clear search
    await page.fill('[placeholder*="search memories"]', '');
    await page.keyboard.press('Enter');
    
    // Should show all memories again
    await expect(memoryPage.isMemoryVisible('React Hooks Guide')).resolves.toBe(true);
    await expect(memoryPage.isMemoryVisible('Vue Components')).resolves.toBe(true);
  });

  test('should edit existing memory', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    const originalTitle = 'Original Title';
    const updatedTitle = 'Updated Title';
    
    // Create a memory to edit
    await memoryPage.createNewMemory(originalTitle, '# Original Content');
    
    // Edit the memory
    await memoryPage.editMemory(originalTitle, updatedTitle);
    
    // Should show updated memory
    await expect(memoryPage.isMemoryVisible(updatedTitle)).resolves.toBe(true);
    await expect(memoryPage.isMemoryVisible(originalTitle)).resolves.toBe(false);
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Memory updated successfully');
  });

  test('should delete memory', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    const title = 'Memory to Delete';
    
    // Create a memory to delete
    await memoryPage.createNewMemory(title, '# Content to delete');
    
    // Verify memory exists
    await expect(memoryPage.isMemoryVisible(title)).resolves.toBe(true);
    
    // Delete the memory
    await memoryPage.deleteMemory(title);
    
    // Should no longer be visible
    await expect(memoryPage.isMemoryVisible(title)).resolves.toBe(false);
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Memory deleted successfully');
  });

  test('should bulk select and delete memories', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    const titles = ['Bulk Test 1', 'Bulk Test 2', 'Bulk Test 3'];
    
    // Create multiple memories
    for (const title of titles) {
      await memoryPage.createNewMemory(title, `# ${title}\n\nContent for ${title}`);
    }
    
    // Bulk select memories
    await memoryPage.bulkSelectMemories(titles.slice(0, 2)); // Select first 2
    
    // Delete selected memories
    await memoryPage.bulkDeleteSelected();
    
    // Should only show the unselected memory
    await expect(memoryPage.isMemoryVisible(titles[0])).resolves.toBe(false);
    await expect(memoryPage.isMemoryVisible(titles[1])).resolves.toBe(false);
    await expect(memoryPage.isMemoryVisible(titles[2])).resolves.toBe(true);
  });

  test('should handle memory collections and tags', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    // Create memories with different collections and tags
    await page.click('[data-testid="new-memory-button"]');
    await page.fill('[placeholder*="memory title"]', 'Work Memory');
    await page.fill('[data-testid="markdown-editor"]', '# Work Content');
    await page.selectOption('[data-testid="collection-select"]', 'Work');
    await page.fill('[placeholder*="add tags"]', 'work, important');
    await page.click('button:has-text("Create Memory")');
    
    // Filter by collection
    await page.click('[data-testid="filters-button"]');
    await page.selectOption('[data-testid="collection-filter"]', 'Work');
    await page.click('[data-testid="apply-filters"]');
    
    // Should only show work memories
    await expect(memoryPage.isMemoryVisible('Work Memory')).resolves.toBe(true);
    
    // Filter by tag
    await page.click('[data-testid="tag-filter-work"]');
    
    // Should still show the work memory
    await expect(memoryPage.isMemoryVisible('Work Memory')).resolves.toBe(true);
  });

  test('should maintain responsive design on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test');
    
    await memoryPage.navigateToMemories();
    
    // Create a test memory
    await memoryPage.createNewMemory('Mobile Test', '# Mobile Content');
    
    // Should have mobile-friendly layout
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Memory cards should stack vertically
    const memoryCards = await memoryPage.getMemoryCards();
    const firstCard = memoryCards.first();
    const firstCardBox = await firstCard.boundingBox();
    
    if (firstCardBox) {
      // Cards should take most of the screen width on mobile
      expect(firstCardBox.width).toBeGreaterThan(300);
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/memories', route => route.abort());
    
    await memoryPage.navigateToMemories();
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load memories');
    
    // Should have retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    
    // Remove network mock and retry
    await page.unroute('**/api/memories');
    await page.click('[data-testid="retry-button"]');
    
    // Should load successfully after retry
    await expect(page.locator('[data-testid="memories-container"]')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    // Create test memory
    await memoryPage.createNewMemory('Keyboard Test', '# Keyboard Navigation Test');
    
    // Focus on search input with keyboard
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
    
    // Navigate to memory cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate memory with Enter
    await page.keyboard.press('Enter');
    
    // Should open memory detail or edit mode
    await expect(page.locator('[data-testid="memory-detail"]').or(page.locator('[data-testid="memory-editor"]'))).toBeVisible();
  });

  test('should auto-save draft when creating memory', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    await page.click('[data-testid="new-memory-button"]');
    
    // Type some content
    await page.fill('[placeholder*="memory title"]', 'Draft Memory');
    await page.fill('[data-testid="markdown-editor"]', '# Draft Content');
    
    // Wait for auto-save
    await page.waitForTimeout(3000);
    
    // Should show auto-save indicator
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('Draft saved');
    
    // Refresh page
    await page.reload();
    
    // Should restore draft
    await page.click('[data-testid="new-memory-button"]');
    await expect(page.locator('[placeholder*="memory title"]')).toHaveValue('Draft Memory');
    await expect(page.locator('[data-testid="markdown-editor"]')).toHaveValue('# Draft Content');
  });

  test('should support undo/redo in memory editor', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    await page.click('[data-testid="new-memory-button"]');
    
    // Type initial content
    const editor = page.locator('[data-testid="markdown-editor"]');
    await editor.fill('Initial content');
    
    // Type additional content
    await editor.fill('Initial content\nSecond line');
    
    // Undo with Ctrl+Z
    await page.keyboard.press('Control+z');
    await expect(editor).toHaveValue('Initial content');
    
    // Redo with Ctrl+Y
    await page.keyboard.press('Control+y');
    await expect(editor).toHaveValue('Initial content\nSecond line');
  });

  test('should validate form inputs', async ({ page }) => {
    await memoryPage.navigateToMemories();
    
    await page.click('[data-testid="new-memory-button"]');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Memory")');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="title-error"]')).toContainText('Title is required');
    await expect(page.locator('[data-testid="content-error"]')).toContainText('Content is required');
    
    // Form should not submit
    await expect(page).toHaveURL(/\/memories\/new/);
  });
});