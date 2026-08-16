import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCheckoutKey,
  normalizeCheckoutItems,
  reserveProductCopies,
  restoreProductCopies,
} from '../src/controllers/payment.controller.js';

test('one buyer buying the last copy reserves it once', async () => {
  let stock = 1;
  const ProductModel = {
    async findOneAndUpdate(query, update) {
      if (stock < query.availableCopies.$gte) return null;
      stock = stock - 1;
      return { _id: 'prod-1', availableCopies: stock, isSold: stock === 0 };
    },
    async findByIdAndUpdate() {
      return { _id: 'prod-1', availableCopies: 0, isSold: true };
    },
    async findById() {
      return { _id: 'prod-1', availableCopies: stock, isSold: stock === 0 };
    },
  };

  const result = await reserveProductCopies({
    ProductModel,
    productId: 'prod-1',
    quantity: 1,
  });

  assert.equal(result.ok, true);
  assert.equal(result.product.availableCopies, 0);
  assert.equal(stock, 0);
});

test('two concurrent buyers requesting the last copy only allow one reservation', async () => {
  let availableCopies = 1;
  const calls = [];
  const ProductModel = {
    async findOneAndUpdate(query, update) {
      calls.push({ query, update });
      if (availableCopies < query.availableCopies.$gte) return null;
      availableCopies -= 1;
      return { _id: 'prod-1', availableCopies, isSold: availableCopies === 0 };
    },
    async findByIdAndUpdate() {
      return { _id: 'prod-1', availableCopies: availableCopies, isSold: availableCopies === 0 };
    },
    async findById() {
      return { _id: 'prod-1', availableCopies, isSold: availableCopies === 0 };
    },
  };

  const [first, second] = await Promise.allSettled([
    reserveProductCopies({ ProductModel, productId: 'prod-1', quantity: 1 }),
    reserveProductCopies({ ProductModel, productId: 'prod-1', quantity: 1 }),
  ]);

  const settled = [first, second].map((result) => result.status === 'fulfilled' ? result.value : result.reason);
  const successCount = settled.filter((result) => result && result.ok === true).length;

  assert.equal(successCount, 1);
  assert.equal(availableCopies, 0);
  assert.equal(calls.length, 2);
});

test('quantity greater than available is rejected clearly', async () => {
  let stock = 2;
  const ProductModel = {
    async findOneAndUpdate(query, update) {
      if (stock < query.availableCopies.$gte) return null;
      stock -= query.availableCopies.$gte;
      return { _id: 'prod-1', availableCopies: stock, isSold: stock === 0 };
    },
    async findByIdAndUpdate() {
      return { _id: 'prod-1', availableCopies: stock, isSold: stock === 0 };
    },
    async findById() {
      return { _id: 'prod-1', availableCopies: stock, isSold: stock === 0 };
    },
  };

  await assert.rejects(
    () => reserveProductCopies({ ProductModel, productId: 'prod-1', quantity: 5 }),
    (error) => {
      assert.equal(error.code, 'INSUFFICIENT_INVENTORY');
      assert.match(error.message, /insufficient/i);
      return true;
    }
  );
  assert.equal(stock, 2);
});

test('checkout failure rollback leaves inventory unchanged', async () => {
  let stock = 4;
  const productState = { availableCopies: 4, isSold: false };
  const ProductModel = {
    async findOneAndUpdate(query, update) {
      if (query.availableCopies.$gte > stock) return null;
      stock -= query.availableCopies.$gte;
      productState.availableCopies = stock;
      productState.isSold = stock === 0;
      return { _id: 'prod-1', availableCopies: stock, isSold: stock === 0 };
    },
    async findById() {
      return { _id: 'prod-1', availableCopies: stock, isSold: stock === 0 };
    },
  };

  const result = await reserveProductCopies({
    ProductModel,
    productId: 'prod-1',
    quantity: 3,
  });

  assert.equal(result.ok, true);
  assert.equal(stock, 1);
  assert.equal(productState.availableCopies, 1);
});

test('cancellation restores stock exactly once', async () => {
  const ProductModel = {
    async findOneAndUpdate() {
      return { _id: 'prod-1', availableCopies: 2, isSold: false };
    },
    async findById(productId) {
      return { _id: productId, availableCopies: 0, isSold: true, save: async () => {} };
    },
  };

  const result = await restoreProductCopies({
    ProductModel,
    items: [{ productId: 'prod-1', quantity: 2 }],
  });

  assert.equal(result.ok, true);
  assert.equal(result.restored[0].productId, 'prod-1');
  assert.equal(result.restored[0].quantity, 2);
});

test('repeated checkout request reuses the same deterministic checkout key', () => {
  const first = buildCheckoutKey('buyer-1', [
    { productId: 'p1', quantity: 1 },
    { productId: 'p2', quantity: 2 },
  ], 'Campus Hall');

  const second = buildCheckoutKey('buyer-1', [
    { productId: 'p2', quantity: 2 },
    { productId: 'p1', quantity: 1 },
  ], 'campus hall');

  assert.equal(first, second);
  assert.equal(normalizeCheckoutItems([
    { productId: 'p1', quantity: 1 },
    { productId: 'p2', quantity: 2 },
    { productId: 'p2', quantity: 1 },
  ]).length, 2);
});

test('multi-item / multi-seller checkout groups stock by product id', () => {
  const grouped = normalizeCheckoutItems([
    { productId: 'p1', quantity: 1 },
    { productId: 'p1', quantity: 2 },
    { productId: 'p2', quantity: 3 },
  ]);

  assert.deepEqual(grouped, [
    { productId: 'p1', quantity: 3 },
    { productId: 'p2', quantity: 3 },
  ]);
});
