// ============================================================================
// BrightLoop Subscription Management System
// Type Definitions: Finance Domain
// Owner: Member 4 (Finance Operations Developer)
// ============================================================================

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';

export type DiscountType = 'fixed' | 'percentage';

export type DiscountScope = 'product' | 'subscription' | 'global';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'upi' | 'other';

export interface Tax {
  id: string;
  name: string;
  rate: number; // e.g., 0.18 for 18%
  is_active: boolean;
  created_at: string;
}

export interface Discount {
  id: string;
  name: string;
  discount_type: DiscountType;
  value: number;
  minimum_purchase?: number | null;
  minimum_quantity?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  usage_limit?: number | null;
  usage_count: number;
  scope_type: DiscountScope;
  is_active: boolean;
  created_at: string;
}

export interface DiscountApplication {
  id: string;
  discount_id: string;
  invoice_id: string;
  discount_name_snapshot: string;
  discount_type_snapshot: DiscountType;
  discount_value_snapshot: number;
  amount_applied: number;
  created_at: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  product_id?: string | null;
  description_snapshot: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_rate_snapshot: number;
  tax_amount: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  subscription_id?: string | null;
  subscription_number?: string | null;
  invoice_date: string; // YYYY-MM-DD
  due_date: string;     // YYYY-MM-DD
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  status: InvoiceStatus;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  lines?: InvoiceLine[];
  discounts_applied?: DiscountApplication[];
  allocations?: PaymentAllocation[];
}

export interface Payment {
  id: string;
  payment_reference: string;
  customer_id: string;
  customer_name?: string;
  payment_method: PaymentMethod;
  amount: number;
  payment_date: string;
  note?: string | null;
  recorded_by?: string | null;
  created_at: string;
  allocations?: PaymentAllocation[];
}

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  invoice_id: string;
  invoice_number?: string;
  amount_allocated: number;
  created_at: string;
}

// Input Types for Server Operations
export interface CreateInvoiceLineInput {
  product_id?: string | null;
  description_snapshot: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_rate_snapshot?: number;
}

export interface CreateInvoiceInput {
  customer_id: string;
  subscription_id?: string | null;
  invoice_date: string;
  due_date: string;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  lines: CreateInvoiceLineInput[];
  discount_id?: string | null;
  notes?: string | null;
}

export interface CreateDiscountInput {
  name: string;
  discount_type: DiscountType;
  value: number;
  minimum_purchase?: number | null;
  minimum_quantity?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  usage_limit?: number | null;
  scope_type: DiscountScope;
  is_active?: boolean;
}

export interface RecordPaymentInput {
  customer_id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date?: string;
  note?: string | null;
}

export interface BillingRunInput {
  target_date?: string; // Date to run billing for (defaults to today)
  dry_run?: boolean;
}

export interface BillingRunResult {
  run_date: string;
  subscriptions_evaluated: number;
  invoices_created: number;
  invoices_skipped_existing: number;
  errors: Array<{ subscription_id: string; error: string }>;
  created_invoice_ids: string[];
}

// Dashboard and Report Metrics
export interface FinancialDashboardMetrics {
  active_subscriptions_count: number;
  revenue_received: number;      // Sum of payments
  total_outstanding: number;     // Sum of positive balances (excl. cancelled)
  overdue_amount: number;        // Sum of positive balances where due_date < today
  overdue_invoices_count: number;
  total_invoiced_period: number; // Sum of confirmed invoice totals in period
}

export interface RevenueReportPoint {
  date: string;
  revenue: number;
  invoiced: number;
}

// Standard API response shape
export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: { code: string; message: string; fields?: Record<string, string> } };
