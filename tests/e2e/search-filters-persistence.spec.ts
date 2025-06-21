import { test, expect } from '@playwright/test';

test.describe('Search Filters Persistence', () => {
  const FRONTEND_URL = 'http://localhost:5173';
  const API_URL = 'http://localhost:5002/api';

  test.beforeEach(async ({ page }) => {
    // Navigate to the app and login
    await page.goto(FRONTEND_URL);
    
    // Check if already logged in, if not, login
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      // Wait for redirect to login page or click login
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      
      if (!currentUrl.includes('/login')) {
        // Navigate to login page
        await page.goto(`${FRONTEND_URL}/login`);
      }

      // Login with demo account
      await page.fill('[data-testid="email-input"]', 'demo@example.com');
      await page.fill('[data-testid="password-input"]', 'demo');
      await page.click('[data-testid="login-button"]');

      // Wait for login to complete
      await page.waitForURL(/\/(dashboard|memories|search)/);
    }
  });

  test('saves and loads search filter preferences', async ({ page }) => {
    // Navigate to search page
    await page.goto(`${FRONTEND_URL}/search`);
    await page.waitForLoadState('networkidle');

    // Open filters panel
    await page.click('button:has-text("Filters")');
    await page.waitForSelector('[data-testid="search-filters"]', { state: 'visible' });

    // Set some filter preferences
    await page.selectOption('select:has-option("Last 30 days")', '30days');
    await page.selectOption('select:has-option("Markdown")', 'markdown');
    await page.selectOption('select:has-option("Date")', 'date');

    // Add some tags by clicking on them in the facets (if available)
    const tagCheckboxes = await page.locator('input[type="checkbox"]').all();
    if (tagCheckboxes.length > 0) {
      await tagCheckboxes[0].check();
      if (tagCheckboxes.length > 1) {
        await tagCheckboxes[1].check();
      }
    }

    // Wait for preferences to be saved (1 second debounce)
    await page.waitForTimeout(1500);

    // Refresh the page to test persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open filters panel again
    const filtersButton = page.locator('button:has-text("Filters")');
    await filtersButton.click();
    await page.waitForSelector('[data-testid="search-filters"]', { state: 'visible' });

    // Verify that the preferences were restored
    const dateRangeSelect = page.locator('select:has-option("Last 30 days")');
    await expect(dateRangeSelect).toHaveValue('30days');

    const contentTypeSelect = page.locator('select:has-option("Markdown")');
    await expect(contentTypeSelect).toHaveValue('markdown');

    const sortSelect = page.locator('select:has-option("Date")');
    await expect(sortSelect).toHaveValue('date');

    // Check that previously selected tags are still selected
    const checkedBoxes = await page.locator('input[type="checkbox"]:checked').count();
    expect(checkedBoxes).toBeGreaterThan(0);
  });

  test('preferences API endpoints work correctly', async ({ request }) => {
    // Login to get token
    const loginResponse = await request.post(`${API_URL}/v1/auth/login`, {
      data: {
        email: 'demo@example.com',
        password: 'demo'
      }
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Test saving preferences
    const saveResponse = await request.put(`${API_URL}/v1/preferences/search`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        filters: {
          tags: ['AI', 'Machine Learning'],
          entities: [],
          collections: ['work'],
          dateRange: '7days',
          contentType: 'text',
          sortBy: 'relevance'
        }
      }
    });
    expect(saveResponse.ok()).toBeTruthy();

    const saveData = await saveResponse.json();
    expect(saveData).toHaveProperty('message', 'Search preferences updated successfully');
    expect(saveData.preferences).toHaveProperty('filters');
    expect(saveData.preferences).toHaveProperty('savedAt');

    // Test retrieving preferences
    const getResponse = await request.get(`${API_URL}/v1/preferences/search`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    expect(getResponse.ok()).toBeTruthy();

    const getData = await getResponse.json();
    expect(getData.preferences).toMatchObject({
      filters: {
        tags: ['AI', 'Machine Learning'],
        entities: [],
        collections: ['work'],
        dateRange: '7days',
        contentType: 'text',
        sortBy: 'relevance'
      }
    });
  });

  test('preferences are user-specific', async ({ request }) => {
    // This test would require multiple users, but with our current demo setup
    // we can at least verify that unauthorized requests are rejected
    
    const getResponse = await request.get(`${API_URL}/v1/preferences/search`);
    expect(getResponse.status()).toBe(401);

    const saveResponse = await request.put(`${API_URL}/v1/preferences/search`, {
      data: {
        filters: {
          tags: ['test'],
          entities: [],
          collections: [],
          dateRange: '',
          contentType: '',
          sortBy: 'relevance'
        }
      }
    });
    expect(saveResponse.status()).toBe(401);
  });

  test('invalid filter data is rejected', async ({ request }) => {
    // Login to get token
    const loginResponse = await request.post(`${API_URL}/v1/auth/login`, {
      data: {
        email: 'demo@example.com',
        password: 'demo'
      }
    });
    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Test invalid sortBy value
    const invalidResponse = await request.put(`${API_URL}/v1/preferences/search`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        filters: {
          tags: ['AI'],
          entities: [],
          collections: [],
          dateRange: '',
          contentType: '',
          sortBy: 'invalid-sort-option'
        }
      }
    });
    expect(invalidResponse.status()).toBe(400);
  });
});