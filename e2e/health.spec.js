import { expect, test } from '@playwright/test';

const API = process.env.E2E_API_URL || 'http://127.0.0.1:4100';

test('API health báo DB up', async ({ request }) => {
  const response = await request.get(`${API}/api/health`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.data.ok).toBe(true);
  expect(body.data.db).toBe('up');
});
