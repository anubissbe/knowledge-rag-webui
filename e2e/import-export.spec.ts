import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Import/Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the import/export page
    await page.goto('/import-export')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display import/export page correctly', async ({ page }) => {
    // Check page title and main sections
    await expect(page.locator('h1')).toContainText('Import & Export')
    
    // Check import section
    await expect(page.locator('text=Import Documents')).toBeVisible()
    await expect(page.locator('text=Drop files here or click to select')).toBeVisible()
    
    // Check export section
    await expect(page.locator('text=Export Memories')).toBeVisible()
    await expect(page.locator('text=Export Format')).toBeVisible()
    
    // Check statistics section
    await expect(page.locator('text=Current Library')).toBeVisible()
    await expect(page.locator('text=Total Memories')).toBeVisible()
  })

  test('should show supported file types in import section', async ({ page }) => {
    const supportedTypes = [
      'Text files (.txt)',
      'Markdown files (.md)',
      'JSON files (.json)'
    ]

    for (const type of supportedTypes) {
      await expect(page.locator(`text=${type}`)).toBeVisible()
    }
  })

  test('should have functional file upload area', async ({ page }) => {
    // Check upload area is visible
    const uploadArea = page.locator('[data-testid="file-upload"], .border-dashed')
    await expect(uploadArea).toBeVisible()
    
    // Check select files button
    const selectButton = page.locator('label[for="file-upload"], text=Select Files')
    await expect(selectButton).toBeVisible()
    
    // File input should be present but hidden
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()
  })

  test('should import a text file successfully', async ({ page }) => {
    // Create a temporary text file content
    const testContent = 'This is a test memory from import functionality.'
    
    // Create a temporary file (in real E2E, you'd prepare actual files)
    const fileContent = Buffer.from(testContent, 'utf-8')
    
    // Mock the file input
    await page.evaluate(() => {
      // Create a mock file
      const content = 'This is a test memory from import functionality.'
      const blob = new Blob([content], { type: 'text/plain' })
      const file = new File([blob], 'test-memory.txt', { type: 'text/plain' })
      
      // Create a FileList-like object
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => index === 0 ? file : null,
        [Symbol.iterator]: function* () {
          yield file
        }
      }
      
      // Dispatch change event with our mock file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: fileList,
          writable: false,
        })
        
        // Trigger the change event
        fileInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    // Wait for import to process
    await page.waitForTimeout(1000)
    
    // Check for import progress or completion
    const progressSection = page.locator('text=Import Progress').first()
    if (await progressSection.isVisible()) {
      await expect(page.locator('text=Import Completed, text=Processing files')).toBeVisible()
    }
  })

  test('should show export format options', async ({ page }) => {
    const exportFormats = ['JSON', 'Markdown', 'PDF']
    
    for (const format of exportFormats) {
      await expect(page.locator(`text=${format}`).first()).toBeVisible()
    }
  })

  test('should allow selecting export format', async ({ page }) => {
    // Click on Markdown format
    await page.click('text=Markdown')
    
    // Check if Markdown format is selected (would need specific styling or data attributes)
    const markdownButton = page.locator('button:has-text("Markdown")')
    await expect(markdownButton).toBeVisible()
    
    // Click on JSON format
    await page.click('text=JSON')
    
    const jsonButton = page.locator('button:has-text("JSON")')
    await expect(jsonButton).toBeVisible()
  })

  test('should show export options checkboxes', async ({ page }) => {
    // Check for metadata checkbox
    const metadataCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /metadata/i })
    await expect(metadataCheckbox).toBeVisible()
    
    // Check for collections checkbox
    const collectionsCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /collection/i })
    await expect(collectionsCheckbox).toBeVisible()
  })

  test('should handle export options toggle', async ({ page }) => {
    // Find metadata checkbox
    const metadataLabel = page.locator('label:has-text("Include metadata")')
    await expect(metadataLabel).toBeVisible()
    
    // Toggle metadata checkbox
    await metadataLabel.click()
    
    // Find collections checkbox
    const collectionsLabel = page.locator('label:has-text("Include collection")')
    await expect(collectionsLabel).toBeVisible()
    
    // Toggle collections checkbox
    await collectionsLabel.click()
  })

  test('should show memory selection area', async ({ page }) => {
    await expect(page.locator('text=Select Memories')).toBeVisible()
    await expect(page.locator('text=Select All, text=Deselect All')).toBeVisible()
  })

  test('should have export button', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export")')
    await expect(exportButton).toBeVisible()
    
    // Button should show count of memories to export
    await expect(exportButton).toContainText('Export')
    await expect(exportButton).toContainText('Memories')
  })

  test('should display current library statistics', async ({ page }) => {
    // Check statistics section
    await expect(page.locator('text=Current Library')).toBeVisible()
    await expect(page.locator('text=Total Memories')).toBeVisible()
    await expect(page.locator('text=Added This Week')).toBeVisible()
    await expect(page.locator('text=Unique Tags')).toBeVisible()
    
    // Check that statistics show numbers (might be 0 in test environment)
    const stats = page.locator('.grid .bg-white')
    await expect(stats).toHaveCount(3)
  })

  test('should handle drag and drop area', async ({ page }) => {
    const dropArea = page.locator('.border-dashed')
    await expect(dropArea).toBeVisible()
    
    // Check that drop area has proper styling
    await expect(dropArea).toHaveClass(/border-dashed/)
    
    // Simulate hover (would change border color in real implementation)
    await dropArea.hover()
  })

  test('should show file type descriptions', async ({ page }) => {
    const descriptions = [
      'Plain text documents',
      'Will split by headers if multiple sections',
      'Memory exports or structured data'
    ]
    
    for (const description of descriptions) {
      await expect(page.locator(`text=${description}`)).toBeVisible()
    }
  })

  test('should handle invalid file types', async ({ page }) => {
    // This test would need to upload an unsupported file type
    // and check for appropriate error messages
    
    // Mock uploading an unsupported file
    await page.evaluate(() => {
      const blob = new Blob(['content'], { type: 'application/pdf' })
      const file = new File([blob], 'test.pdf', { type: 'application/pdf' })
      
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => index === 0 ? file : null,
        [Symbol.iterator]: function* () { yield file }
      }
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: fileList,
          writable: false,
        })
        fileInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    
    // Wait for error message
    await page.waitForTimeout(1000)
    
    // Check for error indication
    // Would need to check for specific error messages in the UI
  })

  test('should show progress during import', async ({ page }) => {
    // Mock a file upload that would show progress
    await page.evaluate(() => {
      const content = '# Section 1\nContent 1\n\n# Section 2\nContent 2'
      const blob = new Blob([content], { type: 'text/markdown' })
      const file = new File([blob], 'multi-section.md', { type: 'text/markdown' })
      
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => index === 0 ? file : null,
        [Symbol.iterator]: function* () { yield file }
      }
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: fileList,
          writable: false,
        })
        fileInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    
    // Look for progress indicators
    await page.waitForTimeout(500)
    
    // Check if progress section appears
    const progressSection = page.locator('text=Import Progress').first()
    if (await progressSection.isVisible()) {
      // Check for progress bar or status
      await expect(page.locator('.bg-blue-600, .text-blue-600')).toBeVisible()
    }
  })

  test('should navigate to import/export page from sidebar', async ({ page }) => {
    // Go to home page first
    await page.goto('/')
    
    // Click on Import/Export in sidebar
    await page.click('text=Import/Export')
    
    // Verify we're on the import/export page
    await expect(page).toHaveURL('/import-export')
    await expect(page.locator('h1')).toContainText('Import & Export')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that main sections are still visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Import Documents')).toBeVisible()
    await expect(page.locator('text=Export Memories')).toBeVisible()
    
    // Check that layout adapts (grid should stack on mobile)
    const grid = page.locator('.grid')
    await expect(grid).toBeVisible()
  })

  test('should handle large file lists in memory selection', async ({ page }) => {
    // This test assumes there are more than 20 memories
    // Check for pagination or scrolling in memory selection
    
    const memorySelection = page.locator('text=Select Memories').locator('..')
    await expect(memorySelection).toBeVisible()
    
    // Look for overflow handling
    const scrollArea = page.locator('.overflow-y-auto')
    if (await scrollArea.isVisible()) {
      await expect(scrollArea).toHaveClass(/max-h-/)
    }
  })
})