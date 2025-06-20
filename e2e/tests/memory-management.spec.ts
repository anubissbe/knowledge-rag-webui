import { test, expect } from '@playwright/test'

test.describe('Memory Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-container"]')
  })

  test('should create a new memory', async ({ page }) => {
    // Click the "Create Memory" button
    await page.click('[data-testid="create-memory-button"]')
    
    // Fill in the memory form
    await page.fill('[data-testid="memory-title-input"]', 'Test Memory')
    await page.fill('[data-testid="memory-content-input"]', 'This is a test memory content')
    await page.fill('[data-testid="memory-tags-input"]', 'test, e2e, automation')
    
    // Submit the form
    await page.click('[data-testid="save-memory-button"]')
    
    // Verify the memory was created
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('Test Memory')
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('This is a test memory content')
  })

  test('should edit an existing memory', async ({ page }) => {
    // First create a memory
    await page.click('[data-testid="create-memory-button"]')
    await page.fill('[data-testid="memory-title-input"]', 'Original Title')
    await page.fill('[data-testid="memory-content-input"]', 'Original content')
    await page.click('[data-testid="save-memory-button"]')
    
    // Wait for the memory to appear
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('Original Title')
    
    // Click edit button on the memory
    await page.click('[data-testid="memory-card"] [data-testid="edit-memory-button"]')
    
    // Modify the memory
    await page.fill('[data-testid="memory-title-input"]', 'Updated Title')
    await page.fill('[data-testid="memory-content-input"]', 'Updated content')
    
    // Save changes
    await page.click('[data-testid="save-memory-button"]')
    
    // Verify the changes
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('Updated Title')
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('Updated content')
  })

  test('should delete a memory', async ({ page }) => {
    // Create a memory first
    await page.click('[data-testid="create-memory-button"]')
    await page.fill('[data-testid="memory-title-input"]', 'Memory to Delete')
    await page.fill('[data-testid="memory-content-input"]', 'This memory will be deleted')
    await page.click('[data-testid="save-memory-button"]')
    
    // Wait for the memory to appear
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('Memory to Delete')
    
    // Click delete button
    await page.click('[data-testid="memory-card"] [data-testid="delete-memory-button"]')
    
    // Confirm deletion in the modal
    await page.click('[data-testid="confirm-delete-button"]')
    
    // Verify the memory is gone
    await expect(page.locator('[data-testid="memory-card"]')).toHaveCount(0)
  })

  test('should search memories', async ({ page }) => {
    // Create multiple memories
    const memories = [
      { title: 'React Components', content: 'Information about React components' },
      { title: 'TypeScript Basics', content: 'TypeScript fundamentals and syntax' },
      { title: 'JavaScript Patterns', content: 'Common JavaScript design patterns' }
    ]

    for (const memory of memories) {
      await page.click('[data-testid="create-memory-button"]')
      await page.fill('[data-testid="memory-title-input"]', memory.title)
      await page.fill('[data-testid="memory-content-input"]', memory.content)
      await page.click('[data-testid="save-memory-button"]')
      await page.waitForTimeout(1000) // Wait between creations
    }

    // Search for "React"
    await page.fill('[data-testid="search-input"]', 'React')
    await page.waitForTimeout(1000) // Wait for debounced search

    // Should only show React-related memory
    await expect(page.locator('[data-testid="memory-card"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('React Components')

    // Clear search
    await page.fill('[data-testid="search-input"]', '')
    await page.waitForTimeout(1000)

    // Should show all memories again
    await expect(page.locator('[data-testid="memory-card"]')).toHaveCount(3)
  })

  test('should filter memories by tags', async ({ page }) => {
    // Create memories with different tags
    await page.click('[data-testid="create-memory-button"]')
    await page.fill('[data-testid="memory-title-input"]', 'Frontend Memory')
    await page.fill('[data-testid="memory-content-input"]', 'Frontend development notes')
    await page.fill('[data-testid="memory-tags-input"]', 'frontend, javascript')
    await page.click('[data-testid="save-memory-button"]')

    await page.click('[data-testid="create-memory-button"]')
    await page.fill('[data-testid="memory-title-input"]', 'Backend Memory')
    await page.fill('[data-testid="memory-content-input"]', 'Backend development notes')
    await page.fill('[data-testid="memory-tags-input"]', 'backend, api')
    await page.click('[data-testid="save-memory-button"]')

    // Click on a tag to filter
    await page.click('[data-testid="tag-filter-frontend"]')

    // Should only show frontend memory
    await expect(page.locator('[data-testid="memory-card"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('Frontend Memory')
  })

  test('should handle form validation', async ({ page }) => {
    // Try to create a memory without title
    await page.click('[data-testid="create-memory-button"]')
    await page.fill('[data-testid="memory-content-input"]', 'Content without title')
    await page.click('[data-testid="save-memory-button"]')

    // Should show validation error
    await expect(page.locator('[data-testid="title-error"]')).toContainText('Title is required')

    // Try to create a memory without content
    await page.fill('[data-testid="memory-title-input"]', 'Title without content')
    await page.fill('[data-testid="memory-content-input"]', '')
    await page.click('[data-testid="save-memory-button"]')

    // Should show validation error
    await expect(page.locator('[data-testid="content-error"]')).toContainText('Content is required')
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => {
      route.abort('failed')
    })

    // Try to create a memory
    await page.click('[data-testid="create-memory-button"]')
    await page.fill('[data-testid="memory-title-input"]', 'Network Test')
    await page.fill('[data-testid="memory-content-input"]', 'Testing network error handling')
    await page.click('[data-testid="save-memory-button"]')

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to save memory')
  })

  test('should maintain form state during navigation', async ({ page }) => {
    // Start creating a memory
    await page.click('[data-testid="create-memory-button"]')
    await page.fill('[data-testid="memory-title-input"]', 'Draft Memory')
    await page.fill('[data-testid="memory-content-input"]', 'This is a draft')

    // Navigate away and back
    await page.click('[data-testid="graph-nav-link"]')
    await page.click('[data-testid="memories-nav-link"]')

    // Form should still have the draft data (if implemented)
    const titleValue = await page.inputValue('[data-testid="memory-title-input"]')
    expect(titleValue).toBe('Draft Memory')
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Create a memory
    await page.click('[data-testid="create-memory-button"]')
    await page.fill('[data-testid="memory-title-input"]', 'Keyboard Test')
    await page.fill('[data-testid="memory-content-input"]', 'Testing keyboard navigation')
    
    // Use Tab to navigate to save button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Press Enter to save
    await page.keyboard.press('Enter')
    
    // Verify memory was created
    await expect(page.locator('[data-testid="memory-card"]').first()).toContainText('Keyboard Test')
  })
})