import { expect, request as playwrightRequest, test } from '@playwright/test';

const API = process.env.E2E_API_URL || 'http://127.0.0.1:4100';
const password = 'Q7m!zR2pL9#x';
const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
const name = 'E2E Test';
const headers = { 'X-Requested-With': 'XMLHttpRequest' };

test.describe.configure({ mode: 'serial' });

test.afterAll(async () => {
  const api = await playwrightRequest.newContext({ baseURL: API });
  const login = await api.post('/api/auth/login', {
    data: { email, password, remember: true },
    headers,
  });
  if (login.ok()) {
    await api.delete('/api/me', { data: { password }, headers });
  }
  await api.dispose();
});

test('đăng ký, đăng nhập và mở các trang chính', async ({ page }) => {
  // Context riêng để không làm page có sẵn cookie đăng nhập.
  const api = await playwrightRequest.newContext({ baseURL: API });
  const registered = await api.post('/api/auth/register', {
    data: { name, email, password, remember: true },
    headers,
  });
  expect(registered.ok()).toBeTruthy();
  // Tài khoản mới mặc định xem trang giới thiệu trước; đánh dấu đã xem để vào app.
  const welcomeSeen = await api.post('/api/me/welcome-seen', { headers });
  expect(welcomeSeen.ok()).toBeTruthy();
  await api.dispose();

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Hôm nay' })).toBeVisible();

  await page.goto('/nutrition');
  await expect(page.getByRole('heading', { name: 'Dinh dưỡng' })).toBeVisible();

  await page.goto('/body-log');
  await expect(page.getByRole('heading', { name: 'Theo dõi cơ thể' })).toBeVisible();

  expect(pageErrors).toEqual([]);
});
