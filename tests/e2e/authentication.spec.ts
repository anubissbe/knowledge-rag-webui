import { test, expect, type Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    
    // Should be redirected to login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('should display login form with all elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByText('Try demo account')).toBeVisible();
    await expect(page.getByRole('link', { name: 'create a new account' })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check HTML5 validation
    const emailInput = page.getByLabel('Email address');
    const passwordInput = page.getByLabel('Password');
    
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should show password toggle functionality', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.getByLabel('Password');
    const toggleButton = page.locator('button[type="button"]').last();
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle demo login successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Click demo account button
    await page.getByText('Try demo account').click();
    
    // Wait for form to be filled
    await expect(page.getByLabel('Email address')).toHaveValue('demo@example.com');
    await expect(page.getByLabel('Password')).toHaveValue('demo');
    
    // Submit the form
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Demo User')).toBeVisible();
  });

  test('should show user menu when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByText('Try demo account').click();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/');
    
    // Check user menu exists
    const userMenuButton = page.getByRole('button', { name: 'User menu' });
    await expect(userMenuButton).toBeVisible();
    await expect(page.getByText('Demo User')).toBeVisible();
    
    // Click user menu
    await userMenuButton.click();
    
    // Check dropdown items
    await expect(page.getByText('demo@example.com')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByText('Try demo account').click();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/');
    
    // Open user menu and logout
    await page.getByRole('button', { name: 'User menu' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('should display register form correctly', async ({ page }) => {
    await page.goto('/register');
    
    // Check form elements
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'sign in to your existing account' })).toBeVisible();
  });

  test('should validate registration form', async ({ page }) => {
    await page.goto('/register');
    
    // Fill form with invalid data
    await page.getByLabel('Full Name').fill('Te'); // Too short
    await page.getByLabel('Username').fill('ab'); // Too short
    await page.getByLabel('Email address').fill('invalid-email');
    await page.getByLabel('Password').fill('short');
    await page.getByLabel('Confirm Password').fill('different');
    
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Form should not submit with invalid data
    await expect(page).toHaveURL('/register');
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    // Go to register
    await page.getByRole('link', { name: 'create a new account' }).click();
    await expect(page).toHaveURL('/register');
    
    // Go back to login
    await page.getByRole('link', { name: 'sign in to your existing account' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should protect all main routes', async ({ page }) => {
    const protectedRoutes = ['/', '/memories', '/search', '/settings'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL('/login');
    }
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try with invalid credentials
    await page.getByLabel('Email address').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show error and stay on login page
    await expect(page).toHaveURL('/login');
    // Note: Error handling depends on toast implementation
  });

  test('should maintain authentication state on refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByText('Try demo account').click();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/');
    
    // Refresh the page
    await page.reload();
    
    // Should still be authenticated
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Demo User')).toBeVisible();
  });

  test('should have accessible form labels and buttons', async ({ page }) => {
    await page.goto('/login');
    
    // Check accessibility attributes
    const emailInput = page.getByLabel('Email address');
    const passwordInput = page.getByLabel('Password');
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    await expect(submitButton).toHaveAttribute('type', 'submit');
  });
});