// ============================================================================
// BrightLoop Subscription Management System
// Financial Calculation Engine
// Contract: doc/04_Database_API_Contract.md Section 14
// Owner: Member 4 (Finance Operations Developer)
// ============================================================================

import { Discount, InvoiceLine, PaymentAllocation } from '@/types/finance';

/**
 * Rounds a number to exactly 2 decimal places to avoid floating point precision issues.
 */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates line-level figures based on the tax-exclusive contract:
 * line_subtotal = quantity * unit_price
 * discounted_taxable_amount = line_subtotal - line_discount
 * line_tax = discounted_taxable_amount * tax_rate
 * line_total = discounted_taxable_amount + line_tax
 */
export function calculateLineTotal(params: {
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_rate?: number;
}): {
  subtotal: number;
  discounted_amount: number;
  tax_amount: number;
  total: number;
} {
  const quantity = Math.max(0, params.quantity);
  const unit_price = Math.max(0, params.unit_price);
  const discount_amount = Math.max(0, params.discount_amount || 0);
  const tax_rate = Math.max(0, params.tax_rate || 0);

  const subtotal = roundMoney(quantity * unit_price);
  // Discount cannot exceed the subtotal
  const effective_discount = Math.min(subtotal, discount_amount);
  const discounted_amount = roundMoney(subtotal - effective_discount);
  const tax_amount = roundMoney(discounted_amount * tax_rate);
  const total = roundMoney(discounted_amount + tax_amount);

  return {
    subtotal,
    discounted_amount,
    tax_amount,
    total,
  };
}

/**
 * Validates discount eligibility against purchase constraints and usage limits
 */
export function isDiscountEligible(
  discount: Discount,
  params: {
    purchase_subtotal: number;
    quantity: number;
    reference_date?: Date;
  }
): { eligible: boolean; reason?: string } {
  if (!discount.is_active) {
    return { eligible: false, reason: 'Discount is inactive' };
  }

  const now = params.reference_date || new Date();

  if (discount.starts_at && new Date(discount.starts_at) > now) {
    return { eligible: false, reason: 'Discount has not started yet' };
  }

  if (discount.ends_at && new Date(discount.ends_at) < now) {
    return { eligible: false, reason: 'Discount has expired' };
  }

  if (discount.usage_limit != null && discount.usage_count >= discount.usage_limit) {
    return { eligible: false, reason: 'Discount usage limit reached' };
  }

  if (discount.minimum_purchase != null && params.purchase_subtotal < discount.minimum_purchase) {
    return {
      eligible: false,
      reason: `Minimum purchase of ${discount.minimum_purchase} required`,
    };
  }

  if (discount.minimum_quantity != null && params.quantity < discount.minimum_quantity) {
    return {
      eligible: false,
      reason: `Minimum quantity of ${discount.minimum_quantity} required`,
    };
  }

  return { eligible: true };
}

/**
 * Evaluates the discount amount based on discount type (fixed vs percentage)
 */
export function calculateDiscountAmount(
  discount: Discount,
  subtotal: number
): number {
  if (discount.discount_type === 'percentage') {
    const pct = Math.min(100, Math.max(0, discount.value));
    return roundMoney(subtotal * (pct / 100));
  } else {
    // Fixed discount cannot exceed subtotal
    return roundMoney(Math.min(subtotal, discount.value));
  }
}

/**
 * Computes invoice header aggregates from its line items
 */
export function calculateInvoiceTotals(lines: Array<{
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_rate_snapshot?: number;
}>): {
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
} {
  let subtotal = 0;
  let discount_total = 0;
  let tax_total = 0;
  let total = 0;

  for (const line of lines) {
    const calc = calculateLineTotal({
      quantity: line.quantity,
      unit_price: line.unit_price,
      discount_amount: line.discount_amount,
      tax_rate: line.tax_rate_snapshot,
    });

    subtotal = roundMoney(subtotal + calc.subtotal);
    discount_total = roundMoney(discount_total + (line.discount_amount || 0));
    tax_total = roundMoney(tax_total + calc.tax_amount);
    total = roundMoney(total + calc.total);
  }

  return {
    subtotal,
    discount_total,
    tax_total,
    total,
  };
}

/**
 * Computes remaining balance due:
 * balance_due = invoice_total - sum(allocations)
 */
export function calculateBalanceDue(
  invoice_total: number,
  allocations: Array<{ amount_allocated: number }> = []
): { amount_paid: number; balance_due: number; is_settled: boolean } {
  const amount_paid = roundMoney(
    allocations.reduce((sum, a) => sum + (a.amount_allocated || 0), 0)
  );
  const balance_due = roundMoney(Math.max(0, invoice_total - amount_paid));
  const is_settled = balance_due === 0 && invoice_total > 0;

  return {
    amount_paid,
    balance_due,
    is_settled,
  };
}

/**
 * Checks whether an invoice is overdue:
 * due_date < current_date AND balance_due > 0 AND status != 'cancelled'
 */
export function isInvoiceOverdue(
  due_date: string,
  balance_due: number,
  status: string,
  current_date?: string
): boolean {
  if (status === 'cancelled' || status === 'paid') return false;
  if (balance_due <= 0) return false;

  const today = current_date || new Date().toISOString().split('T')[0];
  return due_date < today;
}
