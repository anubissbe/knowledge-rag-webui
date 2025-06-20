import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear onboarding status
    await page.evaluate(() => {
      localStorage.removeItem('knowledge-rag-onboarding')
    })
    
    await page.goto('/')
    await page.waitForSelector('[data-testid="app-container"]')
  })

  test('should show welcome card for new users', async ({ page }) => {
    // Navigate to memories page
    await page.goto('/memories')
    
    // Should see welcome card
    await expect(page.locator('[data-onboarding-welcome]')).toBeVisible()
    await expect(page.locator('text=Welcome to Knowledge RAG!')).toBeVisible()
  })

  test('should start onboarding tour from welcome card', async ({ page }) => {
    await page.goto('/memories')
    
    // Click Start Tour button
    await page.click('button:has-text("Start Tour")')
    
    // Should see onboarding overlay
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible()
    await expect(page.locator('text=Welcome to Knowledge RAG!')).toBeVisible()
    
    // Should show step counter
    await expect(page.locator('text=Step 1 of')).toBeVisible()
    
    // Should show progress bar
    await expect(page.locator('.h-1.bg-primary')).toBeVisible()
  })

  test('should navigate through onboarding steps', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Step 1: Welcome
    await expect(page.locator('text=Welcome to Knowledge RAG!')).toBeVisible()
    await page.click('button:has-text("Next")')
    
    // Step 2: Create Memory
    await expect(page.locator('text=Create Your First Memory')).toBeVisible()
    await expect(page.locator('[data-testid="create-memory-button"].onboarding-highlight')).toBeVisible()
    await page.click('button:has-text("Next")')
    
    // Step 3: Search
    await expect(page.locator('text=Powerful Search')).toBeVisible()
    await expect(page.locator('header input[placeholder*="Search"].onboarding-highlight')).toBeVisible()
    await page.click('button:has-text("Next")')
    
    // Step 4: Collections
    await expect(page.locator('text=Organize with Collections')).toBeVisible()
    await page.click('button:has-text("Next")')
    
    // Step 5: Knowledge Graph
    await expect(page.locator('text=Visualize Connections')).toBeVisible()
    await page.click('button:has-text("Next")')
    
    // Step 6: Theme Settings
    await expect(page.locator('text=Customize Your Experience')).toBeVisible()
    await page.click('button:has-text("Next")')
    
    // Final step: Completion
    await expect(page.locator('text=You\'re All Set!')).toBeVisible()
    await expect(page.locator('button:has-text("Create First Memory")')).toBeVisible()
  })

  test('should allow going back to previous steps', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Go to step 2
    await page.click('button:has-text("Next")')
    await expect(page.locator('text=Create Your First Memory')).toBeVisible()
    
    // Go back to step 1
    await page.click('button:has-text("Back")')
    await expect(page.locator('text=Welcome to Knowledge RAG!')).toBeVisible()
    
    // Back button should not be visible on first step
    await expect(page.locator('button:has-text("Back")')).not.toBeVisible()
  })

  test('should allow skipping steps', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Step 1 should have skip option
    await expect(page.locator('button:has-text("Skip")')).toBeVisible()
    await page.click('button:has-text("Skip")')
    
    // Should advance to next step
    await expect(page.locator('text=Create Your First Memory')).toBeVisible()
  })

  test('should close onboarding when X is clicked', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Click close button
    await page.click('button[aria-label="Close onboarding"]')
    
    // Onboarding should be closed
    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible()
    
    // Should mark as completed
    const isCompleted = await page.evaluate(() => {
      return localStorage.getItem('knowledge-rag-onboarding') === 'completed'
    })
    expect(isCompleted).toBe(true)
  })

  test('should complete onboarding and mark as finished', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Navigate through all steps
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next")')
    }
    
    // Click finish on last step
    await page.click('button:has-text("Create First Memory")')
    
    // Should navigate to memory creation page
    await page.waitForURL('**/memories/new')
    
    // Should mark onboarding as completed
    const isCompleted = await page.evaluate(() => {
      return localStorage.getItem('knowledge-rag-onboarding') === 'completed'
    })
    expect(isCompleted).toBe(true)
  })

  test('should not show welcome card after completion', async ({ page }) => {
    // Complete onboarding
    await page.evaluate(() => {
      localStorage.setItem('knowledge-rag-onboarding', 'completed')
    })
    
    await page.goto('/memories')
    
    // Welcome card should not be visible
    await expect(page.locator('[data-onboarding-welcome]')).not.toBeVisible()
  })

  test('should restart onboarding from help button', async ({ page }) => {
    // Complete onboarding first
    await page.evaluate(() => {
      localStorage.setItem('knowledge-rag-onboarding', 'completed')
    })
    
    await page.goto('/memories')
    
    // Click help button in header
    await page.click('button[aria-label="Start tutorial"]')
    
    // Should show onboarding overlay
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible()
    await expect(page.locator('text=Welcome to Knowledge RAG!')).toBeVisible()
  })

  test('should restart onboarding from user menu', async ({ page }) => {
    await page.goto('/memories')
    
    // Open user menu
    await page.click('[data-testid="user-menu-button"]')
    
    // Click Take Tutorial
    await page.click('button:has-text("Take Tutorial")')
    
    // Should show onboarding overlay
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible()
  })

  test('should highlight target elements correctly', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Go to create memory step
    await page.click('button:has-text("Next")')
    
    // Target element should be highlighted
    const createButton = page.locator('[data-testid="create-memory-button"]')
    await expect(createButton).toHaveClass(/onboarding-highlight/)
    
    // Should scroll target into view
    const isInViewport = await createButton.evaluate(el => {
      const rect = el.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight
    })
    expect(isInViewport).toBe(true)
  })

  test('should position tooltips correctly', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Go through steps and check tooltip positioning
    await page.click('button:has-text("Next")')
    
    // Tooltip should be positioned relative to target
    const tooltip = page.locator('.absolute.z-60.w-80')
    await expect(tooltip).toBeVisible()
    
    // Should not be cut off by viewport
    const tooltipRect = await tooltip.boundingBox()
    const viewportSize = await page.viewportSize()
    
    if (tooltipRect && viewportSize) {
      expect(tooltipRect.x).toBeGreaterThanOrEqual(0)
      expect(tooltipRect.y).toBeGreaterThanOrEqual(0)
      expect(tooltipRect.x + tooltipRect.width).toBeLessThanOrEqual(viewportSize.width)
      expect(tooltipRect.y + tooltipRect.height).toBeLessThanOrEqual(viewportSize.height)
    }
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Should be able to navigate with Tab
    await page.keyboard.press('Tab')
    
    // Should be able to close with Escape
    await page.keyboard.press('Escape')
    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible()
  })

  test('should preserve progress bar accuracy', async ({ page }) => {
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Check initial progress (step 1 of 7)
    let progressBar = page.locator('.h-1.bg-primary')
    let progressWidth = await progressBar.evaluate(el => el.style.width)
    expect(progressWidth).toBe('14.2857%') // 1/7 ≈ 14.29%
    
    // Go to step 2
    await page.click('button:has-text("Next")')
    progressWidth = await progressBar.evaluate(el => el.style.width)
    expect(progressWidth).toBe('28.5714%') // 2/7 ≈ 28.57%
    
    // Go to step 3
    await page.click('button:has-text("Next")')
    progressWidth = await progressBar.evaluate(el => el.style.width)
    expect(progressWidth).toBe('42.8571%') // 3/7 ≈ 42.86%
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/memories')
    await page.click('button:has-text("Start Tour")')
    
    // Onboarding should still work
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible()
    
    // Tooltip should be responsive
    const tooltip = page.locator('.absolute.z-60.w-80')
    await expect(tooltip).toBeVisible()
    
    // Should fit within mobile viewport
    const tooltipRect = await tooltip.boundingBox()
    if (tooltipRect) {
      expect(tooltipRect.width).toBeLessThanOrEqual(375)
    }
  })
})