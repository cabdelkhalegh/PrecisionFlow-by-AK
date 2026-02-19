import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('health endpoint returns correct structure', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('environment');
    expect(body).toHaveProperty('database');
  });

  test('tRPC endpoint responds to batch requests', async ({ request }) => {
    // tRPC batch endpoint should return a valid response (even if unauthorized)
    const response = await request.get(
      '/api/trpc/campaigns.list?batch=1&input=%7B%220%22%3A%7B%7D%7D'
    );
    // Should get a response (401, error, or 500 if DB not configured)
    expect([401, 500]).toContain(response.status());
  });

  test('unknown API routes return appropriate status', async ({ request }) => {
    const response = await request.get('/api/nonexistent', { maxRedirects: 0 });
    const status = response.status();
    // Middleware redirects unauthenticated non-public routes to /login (302/307)
    // or Next.js returns 404 for truly unknown API routes
    if (status === 404) {
      expect(status).toBe(404);
      return;
    }

    expect([302, 307]).toContain(status);
    const location = response.headers()['location'];
    expect(location).toBeTruthy();
    expect(location).toContain('/login');
  });
});

test.describe('API Security', () => {
  test('tRPC endpoints require authentication', async ({ request }) => {
    // Calling a protected procedure without auth should fail
    const response = await request.get(
      '/api/trpc/campaigns.list?batch=1&input=%7B%220%22%3A%7B%7D%7D'
    );
    // Should not return 200 with valid data (should be 401, error, or 500 if DB not configured)
    const body = await response.text();
    // tRPC returns errors in its own format
    expect([401, 500]).toContain(response.status());
  });

  test('health endpoint does not leak sensitive info', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();

    // Should not contain credentials or connection strings
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).not.toContain('password');
    expect(bodyStr).not.toContain('secret');
    expect(bodyStr).not.toContain('service_role');
  });
});
