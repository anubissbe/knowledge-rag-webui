import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...')
  
  // Check if dev server is running
  const baseURL = config.use?.baseURL || 'http://localhost:5173'
  
  try {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    console.log(`📡 Checking application at ${baseURL}`)
    await page.goto(baseURL, { timeout: 30000 })
    
    // Wait for app to be ready
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 30000 })
    
    console.log('✅ Application is ready')
    
    // Set up test data if needed
    await setupTestData(page)
    
    await browser.close()
    
    console.log('🎯 E2E test setup complete')
    
  } catch (error) {
    console.error('❌ E2E setup failed:', error)
    throw error
  }
}

async function setupTestData(page: any) {
  console.log('📝 Setting up test data...')
  
  try {
    // Create some test memories for E2E tests
    const testMemories = [
      {
        title: 'React Testing Best Practices',
        content: `
# React Testing Best Practices

## Key Principles
- Test behavior, not implementation
- Use React Testing Library
- Write integration tests over unit tests

## Common Patterns
- Render components with providers
- Use userEvent for interactions
- Test accessibility
        `,
        tags: ['react', 'testing', 'frontend', 'best-practices']
      },
      {
        title: 'MCP Protocol Overview',
        content: `
# Model Context Protocol (MCP)

## What is MCP?
The Model Context Protocol enables secure connections between host applications and data sources.

## Key Features
- Standardized communication
- Security built-in
- Extensible architecture
        `,
        tags: ['mcp', 'protocol', 'architecture', 'backend']
      },
      {
        title: 'TypeScript Advanced Types',
        content: `
# TypeScript Advanced Types

## Utility Types
- Partial<T>
- Required<T> 
- Pick<T, K>
- Omit<T, K>

## Conditional Types
Use conditional types for flexible type definitions.
        `,
        tags: ['typescript', 'types', 'advanced', 'programming']
      }
    ]
    
    // Check if test data already exists
    const existingMemories = await page.locator('[data-testid="memory-card"]').count()
    
    if (existingMemories === 0) {
      console.log('Creating test memories...')
      
      for (const memory of testMemories) {
        try {
          // Navigate to create memory
          await page.click('[data-testid="create-memory-button"]')
          
          // Fill form
          await page.fill('[data-testid="memory-title-input"]', memory.title)
          await page.fill('[data-testid="memory-content-input"]', memory.content)
          await page.fill('[data-testid="memory-tags-input"]', memory.tags.join(', '))
          
          // Save memory
          await page.click('[data-testid="save-memory-button"]')
          
          // Wait for creation to complete
          await page.waitForTimeout(1000)
          
        } catch (error) {
          console.warn(`Failed to create test memory "${memory.title}":`, error)
        }
      }
      
      console.log(`✅ Created ${testMemories.length} test memories`)
    } else {
      console.log(`ℹ️  Found ${existingMemories} existing memories, skipping test data creation`)
    }
    
  } catch (error) {
    console.warn('⚠️  Failed to set up test data (tests will still run):', error)
  }
}

export default globalSetup