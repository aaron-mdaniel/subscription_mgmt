// ============================================================================
// BrightLoop Subscription Management System
// End-to-End Finance & Billing Acceptance Test Script
// ============================================================================

import {
  roundMoney,
  calculateLineTotal,
  calculateInvoiceTotals,
  calculateBalanceDue,
  isInvoiceOverdue,
  isDiscountEligible,
  calculateDiscountAmount,
} from '../src/lib/calculations/finance.mjs';

console.log('=================================================================');
console.log('  BRIGHTLOOP FINANCE & BILLING ACCEPTANCE TEST SUITE');
console.log('=================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failCount++;
  }
}

// ---------------------------------------------------------------------------
// TEST 1: TAX-EXCLUSIVE PRICING & LINE TOTAL CALCULATION
// ---------------------------------------------------------------------------
console.log('📌 Scenario 1: Financial Formula Validation (Doc 04 Section 14)');
const line1 = calculateLineTotal({
  quantity: 2,
  unit_price: 2500.00,
  discount_amount: 500.00,
  tax_rate: 0.18, // 18% GST
});

// subtotal: 2 * 2500 = 5000
// discounted: 5000 - 500 = 4500
// tax: 4500 * 0.18 = 810
// total: 4500 + 810 = 5310
assert(line1.subtotal === 5000.00, 'Subtotal = quantity * unit_price (5000.00)');
assert(line1.discounted_amount === 4500.00, 'Taxable amount after discount = 4500.00');
assert(line1.tax_amount === 810.00, 'Tax amount = 810.00 (18% on taxable amount)');
assert(line1.total === 5310.00, 'Line total = 5310.00');

// ---------------------------------------------------------------------------
// TEST 2: INVOICE AGGREGATION & MULTIPLE LINES
// ---------------------------------------------------------------------------
console.log('\n📌 Scenario 2: Invoice Totals Aggregation');
const invoiceTotals = calculateInvoiceTotals([
  { quantity: 2, unit_price: 2500, discount_amount: 500, tax_rate_snapshot: 0.18 }, // 5310
  { quantity: 1, unit_price: 1000, discount_amount: 0, tax_rate_snapshot: 0.18 },   // 1180
]);

assert(invoiceTotals.subtotal === 6000.00, 'Invoice Subtotal matches sum of line subtotals (6000.00)');
assert(invoiceTotals.discount_total === 500.00, 'Invoice Discount total = 500.00');
assert(invoiceTotals.tax_total === 990.00, 'Invoice Tax total = 990.00');
assert(invoiceTotals.total === 6490.00, 'Invoice Grand Total = 6490.00');

// ---------------------------------------------------------------------------
// TEST 3: PAYMENT ALLOCATION & AUTO-SETTLEMENT TO 'PAID'
// ---------------------------------------------------------------------------
console.log('\n📌 Scenario 3: Payment Recording, Balance Tracking, and Settle to Paid');
const totalInvoiceAmount = 6490.00;

// Partial payment of 3000
const partialPayment = calculateBalanceDue(totalInvoiceAmount, [{ amount_allocated: 3000.00 }]);
assert(partialPayment.amount_paid === 3000.00, 'Amount paid tracks partial allocation (3000.00)');
assert(partialPayment.balance_due === 3490.00, 'Remaining balance due matches (3490.00)');
assert(partialPayment.is_settled === false, 'Invoice is NOT yet settled/paid after partial payment');

// Final settlement payment of 3490
const fullPayment = calculateBalanceDue(totalInvoiceAmount, [
  { amount_allocated: 3000.00 },
  { amount_allocated: 3490.00 },
]);
assert(fullPayment.amount_paid === 6490.00, 'Full payment sum matches invoice total (6490.00)');
assert(fullPayment.balance_due === 0.00, 'Balance due reaches exact 0.00');
assert(fullPayment.is_settled === true, 'Invoice transitions to Paid status when balance reaches zero');

// ---------------------------------------------------------------------------
// TEST 4: DERIVED OVERDUE STATUS LOGIC
// ---------------------------------------------------------------------------
console.log('\n📌 Scenario 4: Overdue Detection Contract');
// Case A: Past due date + positive balance -> Overdue
const isOverdue1 = isInvoiceOverdue('2026-10-15', 500.00, 'confirmed', '2026-10-31');
assert(isOverdue1 === true, 'Past due date with positive balance is classified as OVERDUE');

// Case B: Past due date but already settled (balance = 0) -> NOT overdue
const isOverdue2 = isInvoiceOverdue('2026-10-15', 0.00, 'paid', '2026-10-31');
assert(isOverdue2 === false, 'Settled invoice past due date is NOT overdue');

// Case C: Cancelled invoice -> NOT overdue
const isOverdue3 = isInvoiceOverdue('2026-10-15', 500.00, 'cancelled', '2026-10-31');
assert(isOverdue3 === false, 'Cancelled invoice is NOT classified as overdue');

// ---------------------------------------------------------------------------
// TEST 5: RECURRING BILLING IDEMPOTENCY SIMULATION
// ---------------------------------------------------------------------------
console.log('\n📌 Scenario 5: Recurring Billing Idempotency (Prevent Duplicate Invoices)');
const generatedInvoices = new Map();

function simulateRecurringBillingRun(subscriptions, billingPeriodKey) {
  let created = 0;
  let skipped = 0;

  for (const sub of subscriptions) {
    const key = `${sub.id}:${billingPeriodKey}`;
    if (generatedInvoices.has(key)) {
      skipped++;
    } else {
      generatedInvoices.set(key, { invoice_number: `INV-${Date.now()}-${sub.id}` });
      created++;
    }
  }

  return { created, skipped };
}

const mockSubscriptions = [{ id: 'sub-1' }, { id: 'sub-2' }, { id: 'sub-3' }];
const periodOct2026 = '2026-10-01_2026-10-31';

// First run: all 3 should be generated
const run1 = simulateRecurringBillingRun(mockSubscriptions, periodOct2026);
assert(run1.created === 3 && run1.skipped === 0, 'First run creates invoices for all 3 subscriptions');

// Immediate Second run (e.g. user clicks "Run Billing" twice or retry after timeout)
const run2 = simulateRecurringBillingRun(mockSubscriptions, periodOct2026);
assert(run2.created === 0 && run2.skipped === 3, 'Second run skips all 3: ZERO duplicate invoices created (Idempotent!)');

// ---------------------------------------------------------------------------
// TEST 6: DISCOUNT ELIGIBILITY & USAGE LIMITS
// ---------------------------------------------------------------------------
console.log('\n📌 Scenario 6: Discount Eligibility Validation');
const sampleDiscount = {
  id: 'd1',
  name: 'SAVE20',
  discount_type: 'percentage',
  value: 20,
  minimum_purchase: 1000,
  minimum_quantity: 2,
  starts_at: '2026-01-01T00:00:00Z',
  ends_at: '2026-12-31T23:59:59Z',
  usage_limit: 5,
  usage_count: 5, // Already reached limit!
  is_active: true,
};

const checkLimit = isDiscountEligible(sampleDiscount, { purchase_subtotal: 2000, quantity: 3 });
assert(checkLimit.eligible === false && checkLimit.reason.includes('usage limit'), 'Rejects discount when usage limit is reached');

sampleDiscount.usage_count = 2; // Under limit
const checkMinSpend = isDiscountEligible(sampleDiscount, { purchase_subtotal: 500, quantity: 3 });
assert(checkMinSpend.eligible === false && checkMinSpend.reason.includes('Minimum purchase'), 'Rejects discount when minimum purchase threshold is not met');

const checkValid = isDiscountEligible(sampleDiscount, { purchase_subtotal: 2500, quantity: 3 });
assert(checkValid.eligible === true, 'Accepts discount when all criteria are satisfied');

console.log('\n=================================================================');
console.log(`  SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('=================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✨ All acceptance criteria and financial rules passed successfully!\n');
}
