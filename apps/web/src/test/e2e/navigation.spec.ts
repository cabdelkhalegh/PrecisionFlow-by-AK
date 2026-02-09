import { test, expect } from '@playwright/test';

test.describe('Public Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PrecisionFlow/);
  });

  test('should display the hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Campaign Execution/i)).toBeVisible();
  });

  test('should have working login link on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loginLink = page.getByRole('link', { name: /sign in|get started|login/i }).first();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should return health check OK', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});

test.describe('Protected Route Redirects', () => {
  const protectedRoutes = [
    '/dashboard',
    '/campaigns',
    '/clients',
    '/creators',
    '/briefs',
    '/approvals',
    '/finance',
    '/reports',
    '/activity',
    '/settings',
  ];

  for (const route of protectedRoutes) {
    test(`should redirect ${route} to login when not authenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});
