// ============================================================================
// BrightLoop Subscription Management System
// Finance Operations In-Memory / Database Hybrid Store
// Owner: Member 4 (Finance Operations Developer)
// ============================================================================

import {
  Tax,
  Discount,
  Invoice,
  InvoiceLine,
  Payment,
  PaymentAllocation,
  DiscountApplication,
  FinancialDashboardMetrics,
  RevenueReportPoint,
  BillingRunResult,
} from '@/types/finance';
import {
  calculateLineTotal,
  calculateInvoiceTotals,
  calculateBalanceDue,
  isInvoiceOverdue,
  roundMoney,
} from '@/lib/calculations/finance';

// Mock/Initial Demo Data conforming to BrightLoop catalog
export const initialTaxes: Tax[] = [
  { id: 'tax-1', name: 'GST 18%', rate: 0.18, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'tax-2', name: 'Standard VAT 10%', rate: 0.10, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'tax-3', name: 'Exempt 0%', rate: 0.00, is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

export const initialDiscounts: Discount[] = [
  {
    id: 'disc-1',
    name: 'EARLYBIRD10',
    discount_type: 'percentage',
    value: 10,
    minimum_purchase: 500,
    minimum_quantity: 1,
    starts_at: '2026-01-01T00:00:00Z',
    ends_at: '2026-12-31T23:59:59Z',
    usage_limit: 100,
    usage_count: 8,
    scope_type: 'subscription',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'disc-2',
    name: 'STARTUP500',
    discount_type: 'fixed',
    value: 500,
    minimum_purchase: 2000,
    minimum_quantity: 1,
    starts_at: '2026-01-01T00:00:00Z',
    ends_at: '2026-12-31T23:59:59Z',
    usage_limit: 50,
    usage_count: 3,
    scope_type: 'subscription',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'INV-2026-0001',
    customer_id: 'cust-1',
    customer_name: 'Acme Enterprise Ltd',
    customer_email: 'finance@acme-demo.com',
    subscription_id: 'sub-1',
    subscription_number: 'SUB-2026-0001',
    invoice_date: '2026-10-01',
    due_date: '2026-10-15',
    billing_period_start: '2026-10-01',
    billing_period_end: '2026-10-31',
    status: 'paid',
    subtotal: 5000.00,
    discount_total: 0.00,
    tax_total: 900.00,
    total: 5900.00,
    amount_paid: 5900.00,
    balance_due: 0.00,
    notes: 'QMS Cloud Subscription - Monthly',
    created_at: '2026-10-01T09:00:00Z',
    updated_at: '2026-10-05T14:30:00Z',
    lines: [
      {
        id: 'line-1',
        invoice_id: 'inv-1',
        product_id: 'prod-qms',
        description_snapshot: 'BrightLoop QMS Cloud Standard (Monthly)',
        quantity: 1,
        unit_price: 5000.00,
        discount_amount: 0.00,
        tax_rate_snapshot: 0.18,
        tax_amount: 900.00,
        line_total: 5900.00,
      },
    ],
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-2026-0002',
    customer_id: 'cust-2',
    customer_name: 'Nexus Retail Tech',
    customer_email: 'billing@nexus-demo.com',
    subscription_id: 'sub-2',
    subscription_number: 'SUB-2026-0002',
    invoice_date: '2026-10-15',
    due_date: '2026-10-25', // Overdue since 2026-10-25
    billing_period_start: '2026-10-15',
    billing_period_end: '2026-11-14',
    status: 'confirmed',
    subtotal: 3500.00,
    discount_total: 350.00,
    tax_total: 567.00,
    total: 3717.00,
    amount_paid: 1500.00,
    balance_due: 2217.00,
    notes: 'Food Delivery API Platform - Active',
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-18T16:00:00Z',
    lines: [
      {
        id: 'line-2',
        invoice_id: 'inv-2',
        product_id: 'prod-food',
        description_snapshot: 'Food Delivery Ecosystem API Tier',
        quantity: 1,
        unit_price: 3500.00,
        discount_amount: 350.00,
        tax_rate_snapshot: 0.18,
        tax_amount: 567.00,
        line_total: 3717.00,
      },
    ],
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-2026-0003',
    customer_id: 'cust-3',
    customer_name: 'Starlight Media Solutions',
    customer_email: 'accounts@starlight-demo.com',
    subscription_id: 'sub-3',
    subscription_number: 'SUB-2026-0003',
    invoice_date: '2026-10-28',
    due_date: '2026-11-10',
    billing_period_start: '2026-10-28',
    billing_period_end: '2026-11-27',
    status: 'confirmed',
    subtotal: 8000.00,
    discount_total: 500.00,
    tax_total: 1350.00,
    total: 8850.00,
    amount_paid: 0.00,
    balance_due: 8850.00,
    notes: 'Event Management Suite & Ticketing Engine',
    created_at: '2026-10-28T11:00:00Z',
    updated_at: '2026-10-28T11:00:00Z',
    lines: [
      {
        id: 'line-3',
        invoice_id: 'inv-3',
        product_id: 'prod-event',
        description_snapshot: 'Event Management Suite Enterprise',
        quantity: 2,
        unit_price: 4000.00,
        discount_amount: 500.00,
        tax_rate_snapshot: 0.18,
        tax_amount: 1350.00,
        line_total: 8850.00,
      },
    ],
  },
];

export const initialPayments: Payment[] = [
  {
    id: 'pay-1',
    payment_reference: 'PAY-2026-0001',
    customer_id: 'cust-1',
    customer_name: 'Acme Enterprise Ltd',
    payment_method: 'bank_transfer',
    amount: 5900.00,
    payment_date: '2026-10-05T14:30:00Z',
    note: 'NEFT Ref #TXN9849201',
    recorded_by: 'staff-1',
    created_at: '2026-10-05T14:30:00Z',
  },
  {
    id: 'pay-2',
    payment_reference: 'PAY-2026-0002',
    customer_id: 'cust-2',
    customer_name: 'Nexus Retail Tech',
    payment_method: 'upi',
    amount: 1500.00,
    payment_date: '2026-10-18T16:00:00Z',
    note: 'UPI Payment - Partial Settlement',
    recorded_by: 'staff-1',
    created_at: '2026-10-18T16:00:00Z',
  },
];

export const initialAllocations: PaymentAllocation[] = [
  {
    id: 'alloc-1',
    payment_id: 'pay-1',
    invoice_id: 'inv-1',
    invoice_number: 'INV-2026-0001',
    amount_allocated: 5900.00,
    created_at: '2026-10-05T14:30:00Z',
  },
  {
    id: 'alloc-2',
    payment_id: 'pay-2',
    invoice_id: 'inv-2',
    invoice_number: 'INV-2026-0002',
    amount_allocated: 1500.00,
    created_at: '2026-10-18T16:00:00Z',
  },
];

// In-Memory Global Store (Persists during server lifecycle)
class FinanceStore {
  taxes: Tax[] = [...initialTaxes];
  discounts: Discount[] = [...initialDiscounts];
  invoices: Invoice[] = [...initialInvoices];
  payments: Payment[] = [...initialPayments];
  allocations: PaymentAllocation[] = [...initialAllocations];
  discountApplications: DiscountApplication[] = [];

  // ==========================================
  // INVOICE METHODS
  // ==========================================
  getInvoices(filters?: { customer_id?: string; status?: string; search?: string }): Invoice[] {
    let result = [...this.invoices];

    if (filters?.customer_id) {
      result = result.filter((i) => i.customer_id === filters.customer_id);
    }
    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(q) ||
          i.customer_name?.toLowerCase().includes(q) ||
          i.notes?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getInvoiceById(id: string): Invoice | undefined {
    const inv = this.invoices.find((i) => i.id === id);
    if (!inv) return undefined;

    const allocations = this.allocations.filter((a) => a.invoice_id === id);
    return {
      ...inv,
      allocations,
    };
  }

  createInvoice(data: {
    customer_id: string;
    customer_name?: string;
    subscription_id?: string | null;
    subscription_number?: string | null;
    invoice_date: string;
    due_date: string;
    billing_period_start?: string | null;
    billing_period_end?: string | null;
    lines: Array<{
      product_id?: string | null;
      description_snapshot: string;
      quantity: number;
      unit_price: number;
      discount_amount?: number;
      tax_rate_snapshot?: number;
    }>;
    notes?: string | null;
    status?: 'draft' | 'confirmed';
  }): Invoice {
    // 1. Check idempotency for recurring billing:
    if (data.subscription_id && data.billing_period_start && data.billing_period_end) {
      const existing = this.invoices.find(
        (i) =>
          i.subscription_id === data.subscription_id &&
          i.billing_period_start === data.billing_period_start &&
          i.billing_period_end === data.billing_period_end
      );
      if (existing) {
        return existing; // Idempotent return: do not create duplicate
      }
    }

    // 2. Compute financial totals
    const totals = calculateInvoiceTotals(data.lines);
    const invoiceId = `inv-${Date.now()}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(this.invoices.length + 1).padStart(4, '0')}`;

    const createdLines: InvoiceLine[] = data.lines.map((l, index) => {
      const lineCalc = calculateLineTotal({
        quantity: l.quantity,
        unit_price: l.unit_price,
        discount_amount: l.discount_amount,
        tax_rate: l.tax_rate_snapshot,
      });

      return {
        id: `line-${invoiceId}-${index + 1}`,
        invoice_id: invoiceId,
        product_id: l.product_id,
        description_snapshot: l.description_snapshot,
        quantity: l.quantity,
        unit_price: l.unit_price,
        discount_amount: l.discount_amount || 0,
        tax_rate_snapshot: l.tax_rate_snapshot || 0,
        tax_amount: lineCalc.tax_amount,
        line_total: lineCalc.total,
      };
    });

    const newInvoice: Invoice = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      customer_id: data.customer_id,
      customer_name: data.customer_name || 'Customer Account',
      subscription_id: data.subscription_id,
      subscription_number: data.subscription_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      billing_period_start: data.billing_period_start,
      billing_period_end: data.billing_period_end,
      status: data.status || 'draft',
      subtotal: totals.subtotal,
      discount_total: totals.discount_total,
      tax_total: totals.tax_total,
      total: totals.total,
      amount_paid: 0.00,
      balance_due: totals.total,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lines: createdLines,
    };

    this.invoices.push(newInvoice);
    return newInvoice;
  }

  confirmInvoice(id: string): { success: boolean; invoice?: Invoice; error?: string } {
    const inv = this.invoices.find((i) => i.id === id);
    if (!inv) return { success: false, error: 'Invoice not found' };
    if (inv.status !== 'draft') {
      return { success: false, error: `Cannot confirm invoice with status '${inv.status}'` };
    }

    inv.status = 'confirmed';
    inv.updated_at = new Date().toISOString();
    return { success: true, invoice: inv };
  }

  cancelInvoice(id: string, reason?: string): { success: boolean; invoice?: Invoice; error?: string } {
    const inv = this.invoices.find((i) => i.id === id);
    if (!inv) return { success: false, error: 'Invoice not found' };
    if (inv.status === 'paid') {
      return { success: false, error: 'Cannot cancel an invoice that is already paid' };
    }

    inv.status = 'cancelled';
    inv.notes = inv.notes ? `${inv.notes} | Cancelled: ${reason || 'No reason'}` : `Cancelled: ${reason}`;
    inv.updated_at = new Date().toISOString();
    return { success: true, invoice: inv };
  }

  // ==========================================
  // RECURRING BILLING ENGINE (IDEMPOTENT)
  // ==========================================
  runRecurringBilling(targetDateStr?: string): BillingRunResult {
    const targetDate = targetDateStr || new Date().toISOString().split('T')[0];
    const errors: Array<{ subscription_id: string; error: string }> = [];
    const createdInvoiceIds: string[] = [];
    let skippedCount = 0;

    // Fictional Active Subscriptions for billing demonstration
    const activeSubscriptionsToBill = [
      {
        id: 'sub-active-1',
        subscription_number: 'SUB-2026-0101',
        customer_id: 'cust-1',
        customer_name: 'Acme Enterprise Ltd',
        plan_name: 'QMS Cloud Standard',
        unit_price: 5000.00,
        quantity: 1,
        tax_rate: 0.18,
        period_start: targetDate,
        period_end: new Date(new Date(targetDate).getTime() + 30 * 86400000).toISOString().split('T')[0],
      },
      {
        id: 'sub-active-2',
        subscription_number: 'SUB-2026-0102',
        customer_id: 'cust-2',
        customer_name: 'Nexus Retail Tech',
        plan_name: 'Food Delivery Platform API',
        unit_price: 3500.00,
        quantity: 1,
        tax_rate: 0.18,
        period_start: targetDate,
        period_end: new Date(new Date(targetDate).getTime() + 30 * 86400000).toISOString().split('T')[0],
      },
    ];

    for (const sub of activeSubscriptionsToBill) {
      try {
        // Idempotency check:
        const alreadyBilled = this.invoices.find(
          (i) =>
            i.subscription_id === sub.id &&
            i.billing_period_start === sub.period_start &&
            i.billing_period_end === sub.period_end
        );

        if (alreadyBilled) {
          skippedCount++;
          continue;
        }

        const inv = this.createInvoice({
          customer_id: sub.customer_id,
          customer_name: sub.customer_name,
          subscription_id: sub.id,
          subscription_number: sub.subscription_number,
          invoice_date: targetDate,
          due_date: new Date(new Date(targetDate).getTime() + 14 * 86400000).toISOString().split('T')[0],
          billing_period_start: sub.period_start,
          billing_period_end: sub.period_end,
          status: 'confirmed',
          notes: `Automated Recurring Billing: ${sub.plan_name}`,
          lines: [
            {
              description_snapshot: `${sub.plan_name} (${sub.period_start} to ${sub.period_end})`,
              quantity: sub.quantity,
              unit_price: sub.unit_price,
              tax_rate_snapshot: sub.tax_rate,
            },
          ],
        });

        createdInvoiceIds.push(inv.id);
      } catch (err: any) {
        errors.push({ subscription_id: sub.id, error: err.message || 'Billing calculation error' });
      }
    }

    return {
      run_date: targetDate,
      subscriptions_evaluated: activeSubscriptionsToBill.length,
      invoices_created: createdInvoiceIds.length,
      invoices_skipped_existing: skippedCount,
      errors,
      created_invoice_ids: createdInvoiceIds,
    };
  }

  // ==========================================
  // PAYMENT & ALLOCATION METHODS
  // ==========================================
  getPayments(filters?: { customer_id?: string }): Payment[] {
    let result = [...this.payments];
    if (filters?.customer_id) {
      result = result.filter((p) => p.customer_id === filters.customer_id);
    }
    return result.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  }

  recordPayment(data: {
    customer_id: string;
    invoice_id: string;
    amount: number;
    payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'upi' | 'other';
    payment_date?: string;
    note?: string | null;
    recorded_by?: string | null;
  }): { success: boolean; payment?: Payment; error?: string } {
    if (data.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero' };
    }

    const inv = this.invoices.find((i) => i.id === data.invoice_id);
    if (!inv) return { success: false, error: 'Invoice not found' };
    if (inv.status === 'cancelled') {
      return { success: false, error: 'Cannot record payment for a cancelled invoice' };
    }
    if (inv.customer_id !== data.customer_id) {
      return { success: false, error: 'Payment customer does not match invoice customer' };
    }
    if (data.amount > inv.balance_due) {
      return {
        success: false,
        error: `Payment amount (${data.amount}) exceeds invoice balance due (${inv.balance_due})`,
      };
    }

    const paymentId = `pay-${Date.now()}`;
    const paymentRef = `PAY-${new Date().getFullYear()}-${String(this.payments.length + 1).padStart(4, '0')}`;
    const paymentDate = data.payment_date || new Date().toISOString();

    const newPayment: Payment = {
      id: paymentId,
      payment_reference: paymentRef,
      customer_id: data.customer_id,
      customer_name: inv.customer_name,
      payment_method: data.payment_method,
      amount: roundMoney(data.amount),
      payment_date: paymentDate,
      note: data.note,
      recorded_by: data.recorded_by || 'staff',
      created_at: new Date().toISOString(),
    };

    const newAllocation: PaymentAllocation = {
      id: `alloc-${Date.now()}`,
      payment_id: paymentId,
      invoice_id: data.invoice_id,
      invoice_number: inv.invoice_number,
      amount_allocated: roundMoney(data.amount),
      created_at: new Date().toISOString(),
    };

    // Update state
    this.payments.push(newPayment);
    this.allocations.push(newAllocation);

    // Recompute invoice balances transactionally
    const currentAllocations = this.allocations.filter((a) => a.invoice_id === inv.id);
    const balanceCalc = calculateBalanceDue(inv.total, currentAllocations);

    inv.amount_paid = balanceCalc.amount_paid;
    inv.balance_due = balanceCalc.balance_due;

    // If fully paid, transition status to 'paid'
    if (balanceCalc.is_settled) {
      inv.status = 'paid';
    }
    inv.updated_at = new Date().toISOString();

    return { success: true, payment: newPayment };
  }

  // ==========================================
  // DISCOUNTS METHODS
  // ==========================================
  getDiscounts(): Discount[] {
    return [...this.discounts];
  }

  createDiscount(data: Omit<Discount, 'id' | 'usage_count' | 'created_at'>): Discount {
    const newDiscount: Discount = {
      id: `disc-${Date.now()}`,
      name: data.name.toUpperCase().trim(),
      discount_type: data.discount_type,
      value: roundMoney(data.value),
      minimum_purchase: data.minimum_purchase != null ? roundMoney(data.minimum_purchase) : null,
      minimum_quantity: data.minimum_quantity,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      usage_limit: data.usage_limit,
      usage_count: 0,
      scope_type: data.scope_type,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
    };

    this.discounts.push(newDiscount);
    return newDiscount;
  }

  // ==========================================
  // DASHBOARD & FINANCIAL METRICS
  // Performance target: <2s via direct in-memory / indexed computation
  // ==========================================
  getDashboardMetrics(): FinancialDashboardMetrics {
    const today = new Date().toISOString().split('T')[0];

    // Active subscriptions mock count (e.g. 14 active subscriptions)
    const active_subscriptions_count = 14;

    // Total revenue received: sum of all payments
    const revenue_received = roundMoney(
      this.payments.reduce((sum, p) => sum + p.amount, 0)
    );

    // Outstanding amount: sum of positive balance_due on non-cancelled invoices
    const activeInvoices = this.invoices.filter((i) => i.status !== 'cancelled');
    const total_outstanding = roundMoney(
      activeInvoices.reduce((sum, i) => sum + i.balance_due, 0)
    );

    // Overdue invoices
    const overdueInvoices = activeInvoices.filter((i) =>
      isInvoiceOverdue(i.due_date, i.balance_due, i.status, today)
    );
    const overdue_amount = roundMoney(
      overdueInvoices.reduce((sum, i) => sum + i.balance_due, 0)
    );

    // Invoiced in period (all confirmed/paid)
    const total_invoiced_period = roundMoney(
      activeInvoices.reduce((sum, i) => sum + i.total, 0)
    );

    return {
      active_subscriptions_count,
      revenue_received,
      total_outstanding,
      overdue_amount,
      overdue_invoices_count: overdueInvoices.length,
      total_invoiced_period,
    };
  }

  getRevenueReport(): RevenueReportPoint[] {
    return [
      { date: '2026-05', revenue: 12000, invoiced: 14500 },
      { date: '2026-06', revenue: 15400, invoiced: 16800 },
      { date: '2026-07', revenue: 18200, invoiced: 19500 },
      { date: '2026-08', revenue: 21500, invoiced: 22000 },
      { date: '2026-09', revenue: 24800, invoiced: 26500 },
      { date: '2026-10', revenue: 28900, invoiced: 31000 },
    ];
  }
}

// Global singleton for Next.js dev server persistence
const globalForFinance = globalThis as unknown as { financeStore: FinanceStore };
export const financeStore = globalForFinance.financeStore || new FinanceStore();
if (process.env.NODE_ENV !== 'production') globalForFinance.financeStore = financeStore;
