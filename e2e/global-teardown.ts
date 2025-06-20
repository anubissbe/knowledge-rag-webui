import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...')
  
  try {
    const baseURL = config.use?.baseURL || 'http://localhost:5173'
    
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    console.log(`📡 Connecting to application at ${baseURL}`)
    await page.goto(baseURL, { timeout: 10000 })
    
    // Clean up test data if needed
    await cleanupTestData(page)
    
    await browser.close()
    
    console.log('✅ E2E test teardown complete')
    
  } catch (error) {
    console.warn('⚠️  E2E teardown encountered issues (this is usually okay):', error.message)
  }
}

async function cleanupTestData(page: any) {
  console.log('🗑️  Cleaning up test data...')
  
  try {
    // Navigate to memories page to clear test data - skip if not found
    try {
      await page.click('[data-testid="memories-nav-link"]', { timeout: 5000 })
    } catch (error) {
      console.log('⚠️  Could not find memories nav link, skipping test data cleanup')
      return
    }
    
    // Get all test memories (memories created during setup)
    const testMemoryTitles = [
      'React Testing Best Practices',
      'MCP Protocol Overview', 
      'TypeScript Advanced Types'
    ]
    
    for (const title of testMemoryTitles) {
      try {
        // Find memory by title and delete it
        const memoryCard = page.locator(`[data-testid="memory-card"]:has-text("${title}")`)
        
        if (await memoryCard.count() > 0) {
          await memoryCard.locator('[data-testid="delete-memory-button"]').click()
          
          // Confirm deletion
          await page.click('[data-testid="confirm-delete-button"]')
          await page.waitForTimeout(500)
          
          console.log(`🗑️  Deleted test memory: ${title}`)
        }
        
      } catch (error) {
        console.warn(`Failed to delete test memory "${title}":`, error.message)
      }
    }
    
    console.log('✅ Test data cleanup complete')
    
  } catch (error) {
    console.warn('⚠️  Failed to clean up test data (this is usually okay):', error.message)
  }
}

export default globalTeardown