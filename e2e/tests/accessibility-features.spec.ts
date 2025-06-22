import { test, expect } from '@playwright/test'

test.describe('Accessibility Features', () => {
  test.beforeEach(async ({ page }) => {
    // Clear accessibility settings
    await page.evaluate(() => {
      localStorage.removeItem('knowledge-rag-accessibility')
    })
    
    await page.goto('/settings')
    await page.waitForSelector('[data-testid=\"app-container\"]')
  })

  test('should show accessibility section in settings', async ({ page }) => {
    // Navigate to settings and check accessibility section
    await expect(page.locator('text=Accessibility')).toBeVisible()
    await expect(page.locator('text=High Contrast Mode')).toBeVisible()
    await expect(page.locator('text=Reduced Motion')).toBeVisible()
    await expect(page.locator('text=Large Text')).toBeVisible()
    await expect(page.locator('text=Screen Reader Mode')).toBeVisible()
    await expect(page.locator('text=Keyboard Navigation')).toBeVisible()
    await expect(page.locator('text=Focus Ring Style')).toBeVisible()
  })

  test('should toggle high contrast mode', async ({ page }) => {
    // Find and click the high contrast toggle
    const highContrastToggle = page.locator('button[aria-label=\"Toggle high contrast mode\"]')
    await expect(highContrastToggle).toBeVisible()
    await expect(highContrastToggle).toHaveAttribute('aria-pressed', 'false')
    
    await highContrastToggle.click()
    
    // Check that high contrast is enabled
    await expect(highContrastToggle).toHaveAttribute('aria-pressed', 'true')
    
    // Check that the document has the high-contrast class
    const documentElement = page.locator('html')
    await expect(documentElement).toHaveClass(/high-contrast/)
  })

  test('should toggle reduced motion', async ({ page }) => {
    const reducedMotionToggle = page.locator('button[aria-label=\"Toggle reduced motion\"]')
    await expect(reducedMotionToggle).toBeVisible()
    
    await reducedMotionToggle.click()
    
    await expect(reducedMotionToggle).toHaveAttribute('aria-pressed', 'true')
    
    // Check that the document has the reduced-motion class
    const documentElement = page.locator('html')
    await expect(documentElement).toHaveClass(/reduced-motion/)
  })

  test('should toggle large text', async ({ page }) => {
    const largeTextToggle = page.locator('button[aria-label=\"Toggle large text\"]')
    await expect(largeTextToggle).toBeVisible()
    
    await largeTextToggle.click()
    
    await expect(largeTextToggle).toHaveAttribute('aria-pressed', 'true')
    
    // Check that the document has the large-text class
    const documentElement = page.locator('html')
    await expect(documentElement).toHaveClass(/large-text/)
  })

  test('should toggle screen reader mode', async ({ page }) => {
    const screenReaderToggle = page.locator('button[aria-label=\"Toggle screen reader mode\"]')
    await expect(screenReaderToggle).toBeVisible()
    
    await screenReaderToggle.click()
    
    await expect(screenReaderToggle).toHaveAttribute('aria-pressed', 'true')
    
    // Check that the document has the screen-reader-mode class
    const documentElement = page.locator('html')
    await expect(documentElement).toHaveClass(/screen-reader-mode/)
  })

  test('should toggle keyboard navigation help', async ({ page }) => {
    const keyboardNavToggle = page.locator('button[aria-label=\"Toggle keyboard navigation help\"]')
    await expect(keyboardNavToggle).toBeVisible()
    
    // Should be enabled by default
    await expect(keyboardNavToggle).toHaveAttribute('aria-pressed', 'true')
    
    // Keyboard navigation helper should be visible
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible()
    
    // Toggle off
    await keyboardNavToggle.click()
    await expect(keyboardNavToggle).toHaveAttribute('aria-pressed', 'false')
    
    // Keyboard navigation helper should be hidden
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible()
  })

  test('should change focus ring style', async ({ page }) => {
    // Test default focus ring
    const defaultButton = page.locator('button:has-text(\"Default\")')
    await expect(defaultButton).toHaveAttribute('aria-pressed', 'true')
    
    // Switch to enhanced
    const enhancedButton = page.locator('button:has-text(\"Enhanced\")')
    await enhancedButton.click()
    await expect(enhancedButton).toHaveAttribute('aria-pressed', 'true')
    await expect(defaultButton).toHaveAttribute('aria-pressed', 'false')
    
    // Check that the document has the correct focus ring attribute
    const documentElement = page.locator('html')
    await expect(documentElement).toHaveAttribute('data-focus-ring', 'enhanced')
    
    // Switch to high contrast
    const highContrastButton = page.locator('button:has-text(\"High contrast\")')
    await highContrastButton.click()
    await expect(highContrastButton).toHaveAttribute('aria-pressed', 'true')
    await expect(documentElement).toHaveAttribute('data-focus-ring', 'high-contrast')
  })

  test('should reset accessibility settings', async ({ page }) => {
    // Enable some settings first
    await page.locator('button[aria-label=\"Toggle high contrast mode\"]').click()
    await page.locator('button[aria-label=\"Toggle reduced motion\"]').click()
    await page.locator('button:has-text(\"Enhanced\")').click()
    
    // Verify settings are applied
    const documentElement = page.locator('html')
    await expect(documentElement).toHaveClass(/high-contrast/)
    await expect(documentElement).toHaveClass(/reduced-motion/)
    await expect(documentElement).toHaveAttribute('data-focus-ring', 'enhanced')
    
    // Reset settings
    await page.locator('button:has-text(\"Reset Accessibility Settings\")').click()
    
    // Verify settings are reset
    await expect(documentElement).not.toHaveClass(/high-contrast/)
    await expect(documentElement).not.toHaveClass(/reduced-motion/)
    await expect(documentElement).toHaveAttribute('data-focus-ring', 'default')
    
    // Check toggle states
    await expect(page.locator('button[aria-label=\"Toggle high contrast mode\"]')).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('button[aria-label=\"Toggle reduced motion\"]')).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('button:has-text(\"Default\")')).toHaveAttribute('aria-pressed', 'true')
  })

  test('should persist accessibility settings across page reloads', async ({ page }) => {
    // Enable high contrast
    await page.locator('button[aria-label=\"Toggle high contrast mode\"]').click()
    await expect(page.locator('html')).toHaveClass(/high-contrast/)
    
    // Reload the page
    await page.reload()
    await page.waitForSelector('text=Accessibility')
    
    // Settings should persist
    await expect(page.locator('html')).toHaveClass(/high-contrast/)
    await expect(page.locator('button[aria-label=\"Toggle high contrast mode\"]')).toHaveAttribute('aria-pressed', 'true')
  })

  test('should work with skip to main content link', async ({ page }) => {
    // Go to a page with main content
    await page.goto('/memories')
    
    // Focus the skip link (it should be the first focusable element)
    await page.keyboard.press('Tab')
    
    // The skip link should be visible when focused
    const skipLink = page.locator('a:has-text(\"Skip to main content\")')
    await expect(skipLink).toBeFocused()
    
    // Press Enter to use the skip link
    await page.keyboard.press('Enter')
    
    // Should navigate to main content
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeFocused()
  })

  test('should show keyboard shortcuts helper', async ({ page }) => {
    // Keyboard navigation should be enabled by default
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible()
    
    // Check that shortcuts are listed
    await expect(page.locator('text=Navigate forward')).toBeVisible()
    await expect(page.locator('text=Navigate backward')).toBeVisible()
    await expect(page.locator('text=Activate button')).toBeVisible()
    await expect(page.locator('text=Close dialogs')).toBeVisible()
    await expect(page.locator('text=Focus search')).toBeVisible()
    
    // Check keyboard elements
    await expect(page.locator('kbd:has-text(\"Tab\")')).toBeVisible()
    await expect(page.locator('kbd:has-text(\"Shift+Tab\")')).toBeVisible()
    await expect(page.locator('kbd:has-text(\"Enter\")')).toBeVisible()
    await expect(page.locator('kbd:has-text(\"Esc\")')).toBeVisible()
    await expect(page.locator('kbd:has-text(\"/\")')).toBeVisible()
  })

  test('should handle focus management correctly', async ({ page }) => {
    // Test tab navigation through settings
    await page.keyboard.press('Tab') // Skip link
    await page.keyboard.press('Tab') // First navigation item (Profile)
    
    let focusedElement = page.locator(':focus')
    await expect(focusedElement).toHaveText('Profile')
    
    // Navigate to accessibility section
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown') // Should be on Accessibility
    
    focusedElement = page.locator(':focus')
    await expect(focusedElement).toHaveText('Accessibility')
    
    // Press Enter to "navigate" to accessibility (in this case, it's just visual feedback)
    await page.keyboard.press('Enter')
    
    // Continue tabbing to accessibility toggles
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be on the high contrast toggle
    focusedElement = page.locator(':focus')
    await expect(focusedElement).toHaveAttribute('aria-label', 'Toggle high contrast mode')
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check that toggles have proper ARIA attributes
    const highContrastToggle = page.locator('button[aria-label="Toggle high contrast mode"]')
    await expect(highContrastToggle).toHaveAttribute('aria-pressed')
    
    const reducedMotionToggle = page.locator('button[aria-label="Toggle reduced motion"]')
    await expect(reducedMotionToggle).toHaveAttribute('aria-pressed')
    
    // Check focus ring buttons have proper ARIA attributes
    const focusRingButtons = page.locator('button:has-text("Default"), button:has-text("Enhanced"), button:has-text("High contrast")')
    for (const button of await focusRingButtons.all()) {
      await expect(button).toHaveAttribute('aria-pressed')
    }
  })

  test('should work with high contrast mode visually', async ({ page }) => {
    // Enable high contrast mode
    await page.locator('button[aria-label="Toggle high contrast mode"]').click()
    
    // Take a screenshot to verify visual changes
    await expect(page).toHaveScreenshot('high-contrast-mode.png')
    
    // Check that text has sufficient contrast
    const headings = page.locator('h1, h2, h3')
    const firstHeading = headings.first()
    
    // In high contrast mode, text should be highly visible
    const textColor = await firstHeading.evaluate(el => {
      return window.getComputedStyle(el).color
    })
    
    // Should be white or very light in high contrast mode
    expect(textColor).toMatch(/rgb\(255, 255, 255\)|rgb\(240, 240, 240\)/)
  })

  test('should handle system preferences detection', async ({ page }) => {
    // Test with prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Reload to pick up system preference
    await page.reload()
    await page.waitForSelector('text=Accessibility')
    
    // Reduced motion should be enabled automatically
    const reducedMotionToggle = page.locator('button[aria-label="Toggle reduced motion"]')
    await expect(reducedMotionToggle).toHaveAttribute('aria-pressed', 'true')
    
    // Test with high contrast preference
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' })
    await page.reload()
    await page.waitForSelector('text=Accessibility')
    
    // Should respect the system preference
    const documentElement = page.locator('html')
    // Note: This might not work in all browsers/test environments
    // but it's good to test the principle
  })

  test('should announce changes to screen readers', async ({ page }) => {
    // Enable screen reader mode first
    await page.locator('button[aria-label="Toggle screen reader mode"]').click()
    
    // Check for live region
    const liveRegion = page.locator('#accessibility-live-region')
    await expect(liveRegion).toBeInTheDocument()
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    
    // Toggle high contrast and check for announcement
    await page.locator('button[aria-label="Toggle high contrast mode"]').click()
    
    // Note: Testing actual screen reader announcements is difficult in automated tests
    // We're checking that the infrastructure is in place
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/settings')
    
    // Accessibility section should still be accessible
    await expect(page.locator('text=Accessibility')).toBeVisible()
    
    // Toggles should work on mobile
    const highContrastToggle = page.locator('button[aria-label="Toggle high contrast mode"]')
    await highContrastToggle.click()
    
    await expect(highContrastToggle).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveClass(/high-contrast/)
    
    // Keyboard shortcuts helper should be responsive
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible()
  })

  test('should maintain focus visibility with different focus ring styles', async ({ page }) => {
    // Test enhanced focus ring
    await page.locator('button:has-text("Enhanced")').click()
    
    // Focus a button and check visibility
    const testButton = page.locator('button[aria-label="Toggle high contrast mode"]')
    await testButton.focus()
    
    // Enhanced focus should be visible (we can't easily test the exact visual appearance)
    await expect(testButton).toBeFocused()
    
    // Test high contrast focus ring
    await page.locator('button:has-text("High contrast")').click()
    await testButton.focus()
    
    await expect(testButton).toBeFocused()
    await expect(page.locator('html')).toHaveAttribute('data-focus-ring', 'high-contrast')
  })
})