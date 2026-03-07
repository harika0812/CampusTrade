const { test, expect } = require('@playwright/test');

test.describe('Notifications flow', () => {
  test('supports filters and shows relative time labels', async ({ page }) => {
    const now = Date.now();

    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: 'user-1',
          id: 'user-1',
          name: 'Test Student',
          email: 'test@gnits.ac.in',
        })
      );

      localStorage.setItem(
        'campustrade_sold_notifications',
        JSON.stringify([
          {
            id: 'sold-1',
            productId: 'p-sold-1',
            title: 'Drawing Kit',
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
        ])
      );
    });

    await page.route('**/api/payment/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orders: [
            {
              _id: 'order-1',
              status: 'paid',
              paymentMode: 'online',
              createdAt: new Date(now - 12 * 60 * 1000).toISOString(),
              sellerBreakdown: [],
            },
          ],
        }),
      });
    });

    await page.route('**/api/payment/seller-orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orders: [
            {
              _id: 'seller-order-1',
              status: 'pending',
              paymentMode: 'offline',
              offlineStatus: 'placed',
              createdAt: new Date(now - 75 * 60 * 1000).toISOString(),
              buyer: { name: 'Buyer One' },
              items: [{ quantity: 1 }],
            },
          ],
        }),
      });
    });

    await page.goto('/notifications');

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(page.locator('[data-testid="notification-card"]')).toHaveCount(3);

    const timeLabels = page.locator('[data-testid="notification-time"]');
    await expect(timeLabels.first()).toContainText(/(Just now|\dm ago|\dh ago|Yesterday|\dd ago|\d{2} [A-Za-z]{3})/);

    await page.getByTestId('notifications-filter-orders').click();
    await expect(page.locator('[data-testid="notification-card"]')).toHaveCount(1);

    await page.getByTestId('notifications-filter-sales').click();
    await expect(page.locator('[data-testid="notification-card"]')).toHaveCount(2);
  });
});
