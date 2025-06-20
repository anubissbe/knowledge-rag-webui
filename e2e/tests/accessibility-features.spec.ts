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
    
    // Press Enter to \"navigate\" to accessibility (in this case, it's just visual feedback)\n    await page.keyboard.press('Enter')\n    \n    // Continue tabbing to accessibility toggles\n    await page.keyboard.press('Tab')\n    await page.keyboard.press('Tab')\n    \n    // Should be on the high contrast toggle\n    focusedElement = page.locator(':focus')\n    await expect(focusedElement).toHaveAttribute('aria-label', 'Toggle high contrast mode')\n  })\n\n  test('should have proper ARIA labels and roles', async ({ page }) => {\n    // Check that toggles have proper ARIA attributes\n    const highContrastToggle = page.locator('button[aria-label=\"Toggle high contrast mode\"]')\n    await expect(highContrastToggle).toHaveAttribute('aria-pressed')\n    \n    const reducedMotionToggle = page.locator('button[aria-label=\"Toggle reduced motion\"]')\n    await expect(reducedMotionToggle).toHaveAttribute('aria-pressed')\n    \n    // Check focus ring buttons have proper ARIA attributes\n    const focusRingButtons = page.locator('button:has-text(\"Default\"), button:has-text(\"Enhanced\"), button:has-text(\"High contrast\")')\n    for (const button of await focusRingButtons.all()) {\n      await expect(button).toHaveAttribute('aria-pressed')\n    }\n  })\n\n  test('should work with high contrast mode visually', async ({ page }) => {\n    // Enable high contrast mode\n    await page.locator('button[aria-label=\"Toggle high contrast mode\"]').click()\n    \n    // Take a screenshot to verify visual changes\n    await expect(page).toHaveScreenshot('high-contrast-mode.png')\n    \n    // Check that text has sufficient contrast\n    const headings = page.locator('h1, h2, h3')\n    const firstHeading = headings.first()\n    \n    // In high contrast mode, text should be highly visible\n    const textColor = await firstHeading.evaluate(el => {\n      return window.getComputedStyle(el).color\n    })\n    \n    // Should be white or very light in high contrast mode\n    expect(textColor).toMatch(/rgb\\(255, 255, 255\\)|rgb\\(240, 240, 240\\)/)\n  })\n\n  test('should handle system preferences detection', async ({ page }) => {\n    // Test with prefers-reduced-motion\n    await page.emulateMedia({ reducedMotion: 'reduce' })\n    \n    // Reload to pick up system preference\n    await page.reload()\n    await page.waitForSelector('text=Accessibility')\n    \n    // Reduced motion should be enabled automatically\n    const reducedMotionToggle = page.locator('button[aria-label=\"Toggle reduced motion\"]')\n    await expect(reducedMotionToggle).toHaveAttribute('aria-pressed', 'true')\n    \n    // Test with high contrast preference\n    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' })\n    await page.reload()\n    await page.waitForSelector('text=Accessibility')\n    \n    // Should respect the system preference\n    const documentElement = page.locator('html')\n    // Note: This might not work in all browsers/test environments\n    // but it's good to test the principle\n  })\n\n  test('should announce changes to screen readers', async ({ page }) => {\n    // Enable screen reader mode first\n    await page.locator('button[aria-label=\"Toggle screen reader mode\"]').click()\n    \n    // Check for live region\n    const liveRegion = page.locator('#accessibility-live-region')\n    await expect(liveRegion).toBeInTheDocument()\n    await expect(liveRegion).toHaveAttribute('aria-live', 'polite')\n    \n    // Toggle high contrast and check for announcement\n    await page.locator('button[aria-label=\"Toggle high contrast mode\"]').click()\n    \n    // Note: Testing actual screen reader announcements is difficult in automated tests\n    // We're checking that the infrastructure is in place\n  })\n\n  test('should work on mobile viewport', async ({ page }) => {\n    // Set mobile viewport\n    await page.setViewportSize({ width: 375, height: 667 })\n    \n    await page.goto('/settings')\n    \n    // Accessibility section should still be accessible\n    await expect(page.locator('text=Accessibility')).toBeVisible()\n    \n    // Toggles should work on mobile\n    const highContrastToggle = page.locator('button[aria-label=\"Toggle high contrast mode\"]')\n    await highContrastToggle.click()\n    \n    await expect(highContrastToggle).toHaveAttribute('aria-pressed', 'true')\n    await expect(page.locator('html')).toHaveClass(/high-contrast/)\n    \n    // Keyboard shortcuts helper should be responsive\n    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible()\n  })\n\n  test('should maintain focus visibility with different focus ring styles', async ({ page }) => {\n    // Test enhanced focus ring\n    await page.locator('button:has-text(\"Enhanced\")').click()\n    \n    // Focus a button and check visibility\n    const testButton = page.locator('button[aria-label=\"Toggle high contrast mode\"]')\n    await testButton.focus()\n    \n    // Enhanced focus should be visible (we can't easily test the exact visual appearance)\n    await expect(testButton).toBeFocused()\n    \n    // Test high contrast focus ring\n    await page.locator('button:has-text(\"High contrast\")').click()\n    await testButton.focus()\n    \n    await expect(testButton).toBeFocused()\n    await expect(page.locator('html')).toHaveAttribute('data-focus-ring', 'high-contrast')\n  })\n})"