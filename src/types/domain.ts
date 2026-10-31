/**
 * BrightLoop Subscription Management System - Shared Domain Types
 * Reference: Document 04 (Database & API Contract)
 */

export type UserRole = "admin" | "staff" | "customer";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  customer_id?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  product_type: string;
  description?: string | null;
  sales_price: number;
  cost_price?: number | null;
  notes?: string | null;
  is_active: boolean;
  variants?: ProductVariant[];
  created_at: string;
}

export type PlanFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  frequency: PlanFrequency;
  minimum_quantity: number;
  available_from?: string | null;
  available_until?: string | null;
  auto_close: boolean;
  allow_early_close: boolean;
  allow_pause: boolean;
  renewal_rule?: string | null;
  is_active: boolean;
  created_at: string;
}

export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted";

export interface QuotationLine {
  id: string;
  quotation_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  plan_id?: string | null;
  description_snapshot: string;
  quantity: number;
  unit_price: number;
  tax_rate_snapshot: number;
  line_subtotal: number;
  line_tax: number;
  line_total: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  customer?: Customer;
  template_id?: string | null;
  quotation_date: string;
  valid_until: string;
  status: QuotationStatus;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  notes?: string | null;
  lines?: QuotationLine[];
  created_at: string;
}

export type SubscriptionStatus =
  | "draft"
  | "quotation"
  | "confirmed"
  | "active"
  | "closed";

export interface SubscriptionLine {
  id: string;
  subscription_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  plan_id?: string | null;
  description_snapshot: string;
  quantity: number;
  unit_price: number;
  tax_rate_snapshot: number;
  line_total: number;
}

export interface Subscription {
  id: string;
  subscription_number: string;
  customer_id: string;
  customer?: Customer;
  plan_id?: string | null;
  plan?: Plan;
  quotation_id?: string | null;
  start_date: string;
  expiry_date?: string | null;
  next_billing_date?: string | null;
  payment_terms?: string | null;
  status: SubscriptionStatus;
  is_paused?: boolean;
  created_by?: string;
  lines?: SubscriptionLine[];
  created_at: string;
}

export type InvoiceStatus = "draft" | "confirmed" | "paid" | "cancelled";

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
  customer?: Customer;
  subscription_id?: string | null;
  subscription?: Subscription;
  invoice_date: string;
  due_date: string;
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
  lines?: InvoiceLine[];
  created_at: string;
}

export interface Payment {
  id: string;
  payment_reference: string;
  customer_id: string;
  customer?: Customer;
  invoice_id: string;
  invoice?: Invoice;
  payment_method: string;
  amount: number;
  payment_date: string;
  note?: string | null;
  created_at: string;
}

export interface Discount {
  id: string;
  name: string;
  discount_type: "fixed" | "percentage";
  value: number;
  minimum_purchase?: number | null;
  minimum_quantity?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  usage_limit?: number | null;
  usage_count: number;
  scope_type: "product" | "subscription" | "global";
  is_active: boolean;
  created_at: string;
}

export interface DashboardSummary {
  activeSubscriptions: number;
  revenueReceived: number;
  outstandingAmount: number;
  overdueInvoicesCount: number;
  overdueInvoicesAmount: number;
  totalCustomers: number;
}
