process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oil-parts-test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateRequestedItems } = require('../services/orderService');
const { validatePaymentInput } = require('../controllers/paymentController');

test('order item validation normalizes positive whole-number quantities', () => {
  const items = validateRequestedItems([{ productId: 'product-1', quantity: '3' }]);
  assert.deepEqual(items, [{ productId: 'product-1', quantity: 3 }]);
});

test('order item validation rejects duplicate products', () => {
  assert.throws(
    () => validateRequestedItems([
      { productId: 'product-1', quantity: 1 },
      { productId: 'product-1', quantity: 2 },
    ]),
    /Duplicate product/
  );
});

test('order item validation rejects non-positive quantities', () => {
  assert.throws(
    () => validateRequestedItems([{ productId: 'product-1', quantity: 0 }]),
    /positive whole number/
  );
});

test('payment validation normalizes amount and date', () => {
  const payment = validatePaymentInput({
    shopId: 'shop-1',
    amount: '5000',
    method: 'upi',
    date: '2026-07-03',
  });

  assert.equal(payment.shopId, 'shop-1');
  assert.equal(payment.amount, 5000);
  assert.equal(payment.method, 'upi');
  assert.ok(payment.date instanceof Date);
});

test('payment validation rejects invalid amount, method, and date', () => {
  assert.throws(
    () => validatePaymentInput({ shopId: 'shop-1', amount: -1, method: 'cash' }),
    /amount must be greater than 0/
  );

  assert.throws(
    () => validatePaymentInput({ shopId: 'shop-1', amount: 1, method: 'cheque' }),
    /method must be one of/
  );

  assert.throws(
    () => validatePaymentInput({ shopId: 'shop-1', amount: 1, method: 'cash', date: 'not-a-date' }),
    /valid date/
  );
});

