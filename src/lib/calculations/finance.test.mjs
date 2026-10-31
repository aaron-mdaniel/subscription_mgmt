import test from 'node:test';
import assert from 'node:assert/strict';
import {
  roundMoney,
  calculateLineTotal,
  isDiscountEligible,
  calculateDiscountAmount,
  calculateInvoiceTotals,
  calculateBalanceDue,
  isInvoiceOverdue,
} from './finance.mjs';

test('roundMoney accurately rounds to 2 decimals', () => {
  assert.equal(roundMoney(10.255), 10.26);
  assert.equal(roundMoney(10.254), 10.25);
  assert.equal(roundMoney(0.0001), 0);
});

test('calculateLineTotal follows tax-exclusive formula', () => {
  // 2 units at $100, no discount, 18% tax
  const res1 = calculateLineTotal({
    quantity: 2,
    unit_price: 100,
    tax_rate: 0.18,
  });
  assert.equal(res1.subtotal, 200);
  assert.equal(res1.discounted_amount, 200);
  assert.equal(res1.tax_amount, 36);
  assert.equal(res1.total, 236);

  // 1 unit at $500 with $50 discount, 10% tax
  const res2 = calculateLineTotal({
    quantity: 1,
    unit_price: 500,
    discount_amount: 50,
    tax_rate: 0.1,
  });
  assert.equal(res2.subtotal, 500);
  assert.equal(res2.discounted_amount, 450);
  assert.equal(res2.tax_amount, 45);
  assert.equal(res2.total, 495);
});

test('calculateInvoiceTotals calculates sum of lines', () => {
  const lines = [
    { quantity: 2, unit_price: 100, discount_amount: 0, tax_rate_snapshot: 0.18 }, // total 236
    { quantity: 1, unit_price: 50, discount_amount: 10, tax_rate_snapshot: 0.1 },  // total 44
  ];
  const totals = calculateInvoiceTotals(lines);
  assert.equal(totals.subtotal, 250);
  assert.equal(totals.discount_total, 10);
  assert.equal(totals.tax_total, 40); // 36 + 4
  assert.equal(totals.total, 280);    // 236 + 44
});

test('calculateBalanceDue updates status when settled', () => {
  const result1 = calculateBalanceDue(280, [{ amount_allocated: 100 }]);
  assert.equal(result1.amount_paid, 100);
  assert.equal(result1.balance_due, 180);
  assert.equal(result1.is_settled, false);

  const result2 = calculateBalanceDue(280, [
    { amount_allocated: 100 },
    { amount_allocated: 180 },
  ]);
  assert.equal(result2.amount_paid, 280);
  assert.equal(result2.balance_due, 0);
  assert.equal(result2.is_settled, true);
});

test('isInvoiceOverdue correctly checks past due date with positive balance', () => {
  // Due yesterday with balance -> overdue
  assert.equal(isInvoiceOverdue('2026-10-30', 50, 'confirmed', '2026-10-31'), true);
  // Due tomorrow with balance -> not overdue
  assert.equal(isInvoiceOverdue('2026-11-01', 50, 'confirmed', '2026-10-31'), false);
  // Due yesterday but paid -> not overdue
  assert.equal(isInvoiceOverdue('2026-10-30', 0, 'paid', '2026-10-31'), false);
  // Due yesterday but cancelled -> not overdue
  assert.equal(isInvoiceOverdue('2026-10-30', 50, 'cancelled', '2026-10-31'), false);
});
