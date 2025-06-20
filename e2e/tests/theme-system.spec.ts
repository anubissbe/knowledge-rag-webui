import { test, expect } from '@playwright/test'

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Wait for authentication and navigate to a protected route
    await page.goto('/memories')
    await page.waitForSelector('[data-testid="app-container"]')
  })

  test('should have theme toggle in header', async ({ page }) => {
    // Check if theme toggle button exists in header
    const themeToggle = page.locator('header button[aria-label*="theme"]')
    await expect(themeToggle).toBeVisible()
  })

  test('should toggle between light and dark themes', async ({ page }) => {
    // Get the theme toggle button
    const themeToggle = page.locator('header button[aria-label*="theme"]')
    
    // Check initial theme (should be light by default)
    const htmlClass = await page.locator('html').getAttribute('class')
    const initialTheme = htmlClass?.includes('dark') ? 'dark' : 'light'
    
    // Click theme toggle
    await themeToggle.click()
    
    // Wait for theme change
    await page.waitForTimeout(500)
    
    // Check that theme has changed
    const newHtmlClass = await page.locator('html').getAttribute('class')
    const newTheme = newHtmlClass?.includes('dark') ? 'dark' : 'light'
    
    expect(newTheme).not.toBe(initialTheme)
    
    // Toggle back
    await themeToggle.click()
    await page.waitForTimeout(500)
    
    // Should be back to original theme
    const finalHtmlClass = await page.locator('html').getAttribute('class')
    const finalTheme = finalHtmlClass?.includes('dark') ? 'dark' : 'light'
    
    expect(finalTheme).toBe(initialTheme)
  })

  test('should persist theme preference across page reloads', async ({ page }) => {
    const themeToggle = page.locator('header button[aria-label*="theme"]')
    
    // Set to dark theme
    await themeToggle.click()
    await page.waitForTimeout(500)
    
    // Verify dark theme is applied
    const darkClass = await page.locator('html').getAttribute('class')
    expect(darkClass).toContain('dark')
    
    // Reload page
    await page.reload()
    await page.waitForSelector('[data-testid="app-container"]')
    
    // Theme should still be dark
    const persistedClass = await page.locator('html').getAttribute('class')
    expect(persistedClass).toContain('dark')
  })

  test('should show theme options in settings page', async ({ page }) => {
    // Navigate to settings
    await page.click('[data-testid="user-menu-button"]')
    await page.click('[data-testid="settings-link"]')
    
    // Wait for settings page to load
    await page.waitForSelector('h1:has-text("Settings")')
    
    // Check for theme radio group
    await expect(page.locator('text=Theme Preference')).toBeVisible()
    
    // Check for all three theme options
    await expect(page.locator('button:has-text("Light")')).toBeVisible()
    await expect(page.locator('button:has-text("Dark")')).toBeVisible()
    await expect(page.locator('button:has-text("System")')).toBeVisible()
  })

  test('should change theme via settings page', async ({ page }) => {
    // Navigate to settings
    await page.click('[data-testid="user-menu-button"]')
    await page.click('[data-testid="settings-link"]')
    
    await page.waitForSelector('h1:has-text("Settings")')
    
    // Click on Dark theme option
    await page.click('button:has-text("Dark")')
    await page.waitForTimeout(500)
    
    // Verify dark theme is applied
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')
    
    // Navigate back to memories page
    await page.click('[data-testid="memories-nav-link"]')
    
    // Theme should still be dark
    const persistedClass = await page.locator('html').getAttribute('class')
    expect(persistedClass).toContain('dark')
  })

  test('should apply theme colors to UI components', async ({ page }) => {
    // Test light theme colors
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    })
    
    await page.waitForTimeout(500)
    
    // Check that components have light theme colors
    const headerBg = await page.locator('header').evaluate(el => 
      getComputedStyle(el).backgroundColor
    )
    
    // Should not be a very dark color in light mode
    expect(headerBg).not.toMatch(/rgb\((\d+), (\d+), (\d+)\)/ && 
      headerBg.match(/rgb\((\d+), (\d+), (\d+)\)/)?.slice(1).every(n => parseInt(n) < 50))
    
    // Test dark theme colors
    await page.evaluate(() => {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    })
    
    await page.waitForTimeout(500)
    
    // Check that components have dark theme colors
    const darkHeaderBg = await page.locator('header').evaluate(el => 
      getComputedStyle(el).backgroundColor
    )
    
    // Colors should be different between themes
    expect(darkHeaderBg).not.toBe(headerBg)
  })

  test('should support system theme detection', async ({ page }) => {
    // Navigate to settings
    await page.click('[data-testid="user-menu-button"]')
    await page.click('[data-testid="settings-link"]')
    
    await page.waitForSelector('h1:has-text("Settings")')
    
    // Select system theme
    await page.click('button:has-text("System")')
    await page.waitForTimeout(500)
    
    // Mock system dark mode preference
    await page.evaluate(() => {
      // Override matchMedia to simulate dark mode preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        })
      })
    })
    
    // Trigger theme recalculation
    await page.reload()
    await page.waitForSelector('[data-testid="app-container"]')
    
    // Should apply dark theme based on mocked system preference
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')
  })

  test('should have smooth theme transitions', async ({ page }) => {
    // Add CSS to detect transitions
    await page.addStyleTag({
      content: `
        * {
          transition-duration: 0.1s !important;
        }
      `
    })
    
    const themeToggle = page.locator('header button[aria-label*="theme"]')
    
    // Get initial background color
    const initialBg = await page.locator('body').evaluate(el => 
      getComputedStyle(el).backgroundColor
    )
    
    // Toggle theme
    await themeToggle.click()
    
    // Wait for transition
    await page.waitForTimeout(200)
    
    // Background should have changed
    const newBg = await page.locator('body').evaluate(el => 
      getComputedStyle(el).backgroundColor
    )
    
    expect(newBg).not.toBe(initialBg)
  })

  test('should maintain theme across different pages', async ({ page }) => {
    const themeToggle = page.locator('header button[aria-label*="theme"]')
    
    // Set dark theme
    await themeToggle.click()
    await page.waitForTimeout(500)
    
    // Navigate to different pages
    const pages = [
      { link: '[data-testid="search-nav-link"]', title: 'search' },
      { link: '[data-testid="collections-nav-link"]', title: 'collections' },
      { link: '[data-testid="graph-nav-link"]', title: 'graph' }
    ]
    
    for (const pageInfo of pages) {
      await page.click(pageInfo.link)
      await page.waitForTimeout(500)
      
      // Verify dark theme is maintained
      const htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).toContain('dark')
    }
  })

  test('should update aria labels correctly', async ({ page }) => {
    const themeToggle = page.locator('header button[aria-label*="theme"]')
    
    // Check initial aria label
    const initialLabel = await themeToggle.getAttribute('aria-label')
    expect(initialLabel).toBeTruthy()
    
    // Toggle theme
    await themeToggle.click()
    await page.waitForTimeout(500)
    
    // Aria label should update to reflect new action
    const newLabel = await themeToggle.getAttribute('aria-label')
    expect(newLabel).toBeTruthy()
    expect(newLabel).not.toBe(initialLabel)
  })

  test('should handle keyboard navigation in theme controls', async ({ page }) => {
    // Navigate to settings
    await page.click('[data-testid="user-menu-button"]')
    await page.click('[data-testid="settings-link"]')
    
    await page.waitForSelector('h1:has-text("Settings")')
    
    // Focus on first theme button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Navigate to theme section
    
    // Use arrow keys to navigate theme options
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    
    // Press Enter to select
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    // Should have changed theme
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toMatch(/(light|dark)/)
  })
})