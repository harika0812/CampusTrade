const { test, expect } = require('@playwright/test');

test.describe('Auth flow shells', () => {
  test('register shows verification message after successful submit', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Registration successful',
        }),
      });
    });

    await page.goto('/register');

    await page.getByPlaceholder('Full name').fill('Test Student');
    await page.getByPlaceholder('College email').fill('test@gnits.ac.in');
    await page.getByPlaceholder('Password').fill('Passw0rd!');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Verification email sent')).toBeVisible();
    await expect(page.getByText('test@gnits.ac.in')).toBeVisible();
  });

  test('login posts credentials and navigates to marketplace', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            _id: 'user-1',
            name: 'Test Student',
            email: 'test@gnits.ac.in',
          },
        }),
      });
    });

    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/login');

    await page.getByPlaceholder('College email').fill('test@gnits.ac.in');
    await page.getByPlaceholder('Password').fill('Passw0rd!');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/marketplace$/);
    await expect(page.getByText('No listings match your search')).toBeVisible();
  });
});