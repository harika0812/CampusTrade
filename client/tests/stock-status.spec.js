const { test, expect } = require('@playwright/test');

test.describe('Stock and reservation status', () => {
  test('marketplace shows Available, Reserved/Taken and Sold Out states', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'p1',
            title: 'Available Book',
            description: 'Clean copy',
            price: 150,
            category: 'Books',
            images: ['uploads/mock-book.jpg'],
            availableCopies: 3,
            reservedCopies: 1,
            purchasableCopies: 2,
            stockStatus: 'available',
            isSold: false,
            sellerRollNo: 'GN123',
          },
          {
            _id: 'p2',
            title: 'Reserved Calculator',
            description: 'In demand',
            price: 500,
            category: 'Electronics',
            images: ['uploads/mock-calc.jpg'],
            availableCopies: 1,
            reservedCopies: 1,
            purchasableCopies: 0,
            stockStatus: 'reserved',
            isSold: false,
            sellerRollNo: 'GN124',
          },
          {
            _id: 'p3',
            title: 'Sold Notes',
            description: 'Already gone',
            price: 80,
            category: 'Notes',
            images: ['uploads/mock-notes.jpg'],
            availableCopies: 0,
            reservedCopies: 0,
            purchasableCopies: 0,
            stockStatus: 'sold_out',
            isSold: true,
            sellerRollNo: 'GN125',
          },
        ]),
      });
    });

    await page.goto('/marketplace');

    const availableCard = page.locator('.product-card', { hasText: 'Available Book' });
    await expect(availableCard.getByText('Available', { exact: true })).toBeVisible();
    await expect(availableCard.getByRole('button', { name: 'Add to Cart' })).toBeEnabled();

    const reservedCard = page.locator('.product-card', { hasText: 'Reserved Calculator' });
    await expect(reservedCard.getByText('Reserved/Taken')).toBeVisible();
    await expect(reservedCard.getByRole('button', { name: 'Reserved' })).toBeDisabled();

    const soldCard = page.locator('.product-card', { hasText: 'Sold Notes' });
    await expect(soldCard.getByText('Sold Out')).toBeVisible();
    await expect(soldCard.getByRole('button', { name: 'Sold Out' })).toBeDisabled();
  });

  test('product details shows reserved and available copy counts', async ({ page }) => {
    await page.route('**/api/products/p-reserved', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'p-reserved',
          title: 'Reserved Drafting Kit',
          description: 'Reserved by another buyer',
          price: 650,
          category: 'Lab Equipment',
          images: ['uploads/mock-kit.jpg'],
          availableCopies: 1,
          reservedCopies: 1,
          purchasableCopies: 0,
          stockStatus: 'reserved',
          isSold: false,
          sellerName: 'Seller A',
          sellerRollNo: 'GN200',
          seller: {
            className: 'CSE-A',
            branch: 'CSE',
            year: '3',
          },
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/products/p-reserved');

    await expect(page.getByText('Reserved/Taken')).toBeVisible();
    await expect(page.getByText('Available copies: 0')).toBeVisible();
    await expect(page.getByText('Reserved copies: 1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reserved' })).toBeDisabled();
  });
});
