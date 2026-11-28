import { expect, test } from '@playwright/test';

test.describe('public auth pages', () => {
  test('login/register validation và điều hướng', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();

    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page.getByText('Email không hợp lệ')).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mật khẩu')).toBeVisible();

    await page.getByRole('link', { name: /Đăng ký miễn phí/ }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Tạo tài khoản' })).toBeVisible();

    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(page.getByText('Tên tối thiểu 2 ký tự')).toBeVisible();
    await expect(page.getByText('Email không hợp lệ')).toBeVisible();
    await expect(page.getByText(/Mật khẩu tối thiểu/)).toBeVisible();
  });
});
