// ============================================================================
// BrightLoop Subscription Management System
// Financial Calculation Engine (ESM runtime export for tests)
// ============================================================================

export function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateLineTotal(params) {
  const quantity = Math.max(0, params.quantity);
  const unit_price = Math.max(0, params.unit_price);
  const discount_amount = Math.max(0, params.discount_amount || 0);
  const tax_rate = Math.max(0, params.tax_rate || 0);

  const subtotal = roundMoney(quantity * unit_price);
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

export function isDiscountEligible(discount, params) {
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

export function calculateDiscountAmount(discount, subtotal) {
  if (discount.discount_type === 'percentage') {
    const pct = Math.min(100, Math.max(0, discount.value));
    return roundMoney(subtotal * (pct / 100));
  } else {
    return roundMoney(Math.min(subtotal, discount.value));
  }
}

export function calculateInvoiceTotals(lines) {
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

export function calculateBalanceDue(invoice_total, allocations = []) {
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

export function isInvoiceOverdue(due_date, balance_due, status, current_date) {
  if (status === 'cancelled' || status === 'paid') return false;
  if (balance_due <= 0) return false;

  const today = current_date || new Date().toISOString().split('T')[0];
  return due_date < today;
}
