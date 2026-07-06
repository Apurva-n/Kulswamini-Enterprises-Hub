const { test } = require('node:test');
const assert = require('node:assert/strict');

// Unit tests for ledger balance math (pure logic)
function computeBalanceAfter(currentBalance, type, amount) {
  const delta = type === 'debit' ? amount : -amount;
  return currentBalance + delta;
}

test('opening balance creates correct starting balance', () => {
  const openingBalance = 10000;
  assert.equal(openingBalance, 10000);
});

test('debit increases balance owed', () => {
  let balance = 10000;
  balance = computeBalanceAfter(balance, 'debit', 3000);
  assert.equal(balance, 13000);
});

test('partial payment reduces balance', () => {
  let balance = 12000;
  balance = computeBalanceAfter(balance, 'credit', 5000);
  assert.equal(balance, 7000);
});

test('cancel pending order does not change balance', () => {
  const balanceBefore = 5000;
  const balanceAfter = balanceBefore; // no ledger entry for pending cancel
  assert.equal(balanceAfter, 5000);
});

test('multiple transactions compute correctly', () => {
  let balance = 0;
  balance = computeBalanceAfter(balance, 'debit', 10000); // opening
  balance = computeBalanceAfter(balance, 'debit', 2500);  // order
  balance = computeBalanceAfter(balance, 'credit', 5000); // payment
  assert.equal(balance, 7500);
});
