/**
 * BrightLoop Subscription Management System - Subscription Operations Service
 * Reference: Document 04 (Database & API Contract) & Document 05 (Task Allocation)
 * 
 * Central business logic and reactive client-side store for:
 * - Customers (M3-01)
 * - Products & Variants (M3-02)
 * - Subscription Plans (M3-03)
 * - Quotations & Pricing Calculations (M3-04)
 * - Subscriptions & Lifecycle State Machine (M3-05)
 */

import {
  Customer,
  Product,
  ProductVariant,
  Plan,
  PlanFrequency,
  Quotation,
  QuotationLine,
  QuotationStatus,
  Subscription,
  SubscriptionLine,
  SubscriptionStatus,
} from "@/types/domain";

import {
  mockCustomers,
  mockProducts,
  mockPlans,
  mockQuotations,
  mockSubscriptions,
} from "@/lib/mock-data";

const STORAGE_KEYS = {
  CUSTOMERS: "brightloop_customers_v1",
  PRODUCTS: "brightloop_products_v1",
  PLANS: "brightloop_plans_v1",
  QUOTATIONS: "brightloop_quotations_v1",
  SUBSCRIPTIONS: "brightloop_subscriptions_v1",
};

// Safe localStorage loader
function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

// Safe localStorage saver
function saveStorage<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Subscription next billing date calculation
export function calculateNextBillingDate(startDateStr: string, frequency: PlanFrequency): string {
  const d = new Date(startDateStr);
  if (isNaN(d.getTime())) return startDateStr;

  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().split("T")[0];
}

// Global in-memory cache synchronized with localStorage
class SubscriptionOperationsService {
  private customers: Customer[] = [];
  private products: Product[] = [];
  private plans: Plan[] = [];
  private quotations: Quotation[] = [];
  private subscriptions: Subscription[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.customers = loadStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, mockCustomers);
    this.products = loadStorage<Product[]>(STORAGE_KEYS.PRODUCTS, mockProducts);
    this.plans = loadStorage<Plan[]>(STORAGE_KEYS.PLANS, mockPlans);
    this.quotations = loadStorage<Quotation[]>(STORAGE_KEYS.QUOTATIONS, mockQuotations);
    this.subscriptions = loadStorage<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);
    this.initialized = true;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // ==========================================
  // CUSTOMER MANAGEMENT (M3-01)
  // ==========================================

  public getCustomers(): Customer[] {
    this.init();
    return [...this.customers];
  }

  public getCustomer(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  public createCustomer(data: {
    customer_code?: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
  }): Customer {
    const code =
      data.customer_code?.trim() ||
      `CUST-${data.name.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      customer_code: code,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    this.customers.unshift(newCustomer);
    saveStorage(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer {
    const idx = this.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Customer with ID ${id} not found.`);

    this.customers[idx] = {
      ...this.customers[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    saveStorage(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
    return this.customers[idx];
  }

  // ==========================================
  // PRODUCTS & VARIANTS (M3-02)
  // ==========================================

  public getProducts(): Product[] {
    this.init();
    return [...this.products];
  }

  public getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public createProduct(data: {
    name: string;
    product_type: string;
    description?: string;
    sales_price: number;
    cost_price?: number;
    notes?: string;
    variants?: Array<{ name: string; price_adjustment: number }>;
  }): Product {
    const productId = `prod-${Date.now()}`;
    const variants: ProductVariant[] = (data.variants || []).map((v, i) => ({
      id: `var-${productId}-${i + 1}`,
      product_id: productId,
      name: v.name,
      price_adjustment: Number(v.price_adjustment) || 0,
      is_active: true,
      created_at: new Date().toISOString(),
    }));

    const newProduct: Product = {
      id: productId,
      name: data.name.trim(),
      product_type: data.product_type.trim(),
      description: data.description?.trim() || null,
      sales_price: Math.max(0, Number(data.sales_price) || 0),
      cost_price: data.cost_price !== undefined ? Math.max(0, Number(data.cost_price)) : null,
      notes: data.notes?.trim() || null,
      is_active: true,
      variants,
      created_at: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Product with ID ${id} not found.`);

    this.products[idx] = {
      ...this.products[idx],
      ...updates,
    };

    saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    return this.products[idx];
  }

  // ==========================================
  // SUBSCRIPTION PLANS (M3-03)
  // ==========================================

  public getPlans(): Plan[] {
    this.init();
    return [...this.plans];
  }

  public getPlan(id: string): Plan | undefined {
    return this.plans.find((p) => p.id === id);
  }

  public createPlan(data: {
    name: string;
    description?: string;
    price: number;
    frequency: PlanFrequency;
    minimum_quantity: number;
    available_from?: string;
    available_until?: string;
    auto_close?: boolean;
    allow_early_close?: boolean;
    allow_pause?: boolean;
    renewal_rule?: string;
  }): Plan {
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: Math.max(0, Number(data.price) || 0),
      frequency: data.frequency,
      minimum_quantity: Math.max(1, Number(data.minimum_quantity) || 1),
      available_from: data.available_from || null,
      available_until: data.available_until || null,
      auto_close: Boolean(data.auto_close),
      allow_early_close: Boolean(data.allow_early_close),
      allow_pause: Boolean(data.allow_pause),
      renewal_rule: data.renewal_rule || "auto-renew",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    this.plans.unshift(newPlan);
    saveStorage(STORAGE_KEYS.PLANS, this.plans);
    this.notify();
    return newPlan;
  }

  public updatePlan(id: string, updates: Partial<Plan>): Plan {
    const idx = this.plans.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Plan with ID ${id} not found.`);

    this.plans[idx] = {
      ...this.plans[idx],
      ...updates,
    };

    saveStorage(STORAGE_KEYS.PLANS, this.plans);
    this.notify();
    return this.plans[idx];
  }

  // ==========================================
  // QUOTATIONS (M3-04)
  // ==========================================

  public getQuotations(): Quotation[] {
    this.init();
    return [...this.quotations];
  }

  public getQuotation(id: string): Quotation | undefined {
    return this.quotations.find((q) => q.id === id);
  }

  public createQuotation(data: {
    customer_id: string;
    quotation_date: string;
    valid_until: string;
    notes?: string;
    lines: Array<{
      product_id?: string;
      variant_id?: string;
      plan_id?: string;
      description_snapshot: string;
      quantity: number;
      unit_price: number;
      tax_rate_snapshot?: number;
    }>;
  }): Quotation {
    const customer = this.getCustomer(data.customer_id);
    if (!customer) throw new Error("A valid customer is required for quotation creation.");

    if (!data.lines || data.lines.length === 0) {
      throw new Error("Quotation must have at least one line item.");
    }

    const quotationId = `quote-${Date.now()}`;
    const quotationNumber = `QUO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let subtotal = 0;
    let tax_total = 0;

    const quotationLines: QuotationLine[] = data.lines.map((l, idx) => {
      const qty = Math.max(1, Number(l.quantity) || 1);
      const unitPrice = Math.max(0, Number(l.unit_price) || 0);
      const taxRate = l.tax_rate_snapshot !== undefined ? Number(l.tax_rate_snapshot) : 0.18; // Default 18% demo GST

      const lineSubtotal = qty * unitPrice;
      const lineTax = Math.round(lineSubtotal * taxRate * 100) / 100;
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      tax_total += lineTax;

      return {
        id: `qline-${quotationId}-${idx + 1}`,
        quotation_id: quotationId,
        product_id: l.product_id || null,
        variant_id: l.variant_id || null,
        plan_id: l.plan_id || null,
        description_snapshot: l.description_snapshot,
        quantity: qty,
        unit_price: unitPrice,
        tax_rate_snapshot: taxRate,
        line_subtotal: lineSubtotal,
        line_tax: lineTax,
        line_total: lineTotal,
      };
    });

    const newQuotation: Quotation = {
      id: quotationId,
      quotation_number: quotationNumber,
      customer_id: customer.id,
      customer: customer,
      quotation_date: data.quotation_date || new Date().toISOString().split("T")[0],
      valid_until: data.valid_until,
      status: "draft",
      subtotal: Math.round(subtotal * 100) / 100,
      discount_total: 0,
      tax_total: Math.round(tax_total * 100) / 100,
      total: Math.round((subtotal + tax_total) * 100) / 100,
      notes: data.notes?.trim() || null,
      lines: quotationLines,
      created_at: new Date().toISOString(),
    };

    this.quotations.unshift(newQuotation);
    saveStorage(STORAGE_KEYS.QUOTATIONS, this.quotations);
    this.notify();
    return newQuotation;
  }

  public updateQuotationStatus(id: string, status: QuotationStatus): Quotation {
    const idx = this.quotations.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error(`Quotation ${id} not found.`);

    this.quotations[idx] = {
      ...this.quotations[idx],
      status,
    };

    saveStorage(STORAGE_KEYS.QUOTATIONS, this.quotations);
    this.notify();
    return this.quotations[idx];
  }

  // ==========================================
  // SUBSCRIPTIONS & LIFECYCLE (M3-05)
  // ==========================================

  public getSubscriptions(): Subscription[] {
    this.init();
    return [...this.subscriptions];
  }

  public getSubscription(id: string): Subscription | undefined {
    return this.subscriptions.find((s) => s.id === id);
  }

  public createSubscription(data: {
    customer_id: string;
    plan_id?: string;
    quotation_id?: string;
    start_date: string;
    expiry_date?: string;
    payment_terms?: string;
    status?: SubscriptionStatus;
    lines: Array<{
      product_id?: string;
      variant_id?: string;
      plan_id?: string;
      description_snapshot: string;
      quantity: number;
      unit_price: number;
      tax_rate_snapshot?: number;
    }>;
  }): Subscription {
    const customer = this.getCustomer(data.customer_id);
    if (!customer) throw new Error("A valid customer is required for subscription creation.");

    const plan = data.plan_id ? this.getPlan(data.plan_id) : undefined;
    const subscriptionId = `sub-${Date.now()}`;
    const subscriptionNumber = `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const frequency = plan ? plan.frequency : "monthly";
    const nextBillingDate = calculateNextBillingDate(data.start_date, frequency);

    const subscriptionLines: SubscriptionLine[] = (data.lines || []).map((l, idx) => {
      const qty = Math.max(1, Number(l.quantity) || 1);
      const unitPrice = Math.max(0, Number(l.unit_price) || 0);
      const taxRate = l.tax_rate_snapshot !== undefined ? Number(l.tax_rate_snapshot) : 0.18;
      const lineSubtotal = qty * unitPrice;
      const lineTax = Math.round(lineSubtotal * taxRate * 100) / 100;

      return {
        id: `sline-${subscriptionId}-${idx + 1}`,
        subscription_id: subscriptionId,
        product_id: l.product_id || null,
        variant_id: l.variant_id || null,
        plan_id: l.plan_id || null,
        description_snapshot: l.description_snapshot,
        quantity: qty,
        unit_price: unitPrice,
        tax_rate_snapshot: taxRate,
        line_total: lineSubtotal + lineTax,
      };
    });

    const newSub: Subscription = {
      id: subscriptionId,
      subscription_number: subscriptionNumber,
      customer_id: customer.id,
      customer: customer,
      plan_id: plan?.id || null,
      plan: plan,
      quotation_id: data.quotation_id || null,
      start_date: data.start_date,
      expiry_date: data.expiry_date || null,
      next_billing_date: nextBillingDate,
      payment_terms: data.payment_terms || "Net 30 Days",
      status: data.status || "confirmed",
      lines: subscriptionLines,
      created_at: new Date().toISOString(),
    };

    this.subscriptions.unshift(newSub);
    saveStorage(STORAGE_KEYS.SUBSCRIPTIONS, this.subscriptions);
    this.notify();
    return newSub;
  }

  /**
   * Convert an approved Quotation into a live Subscription (M3-05)
   * Preserves exact snapshot pricing, quantities, and customer association.
   */
  public convertQuotationToSubscription(quotationId: string): Subscription {
    const quote = this.getQuotation(quotationId);
    if (!quote) throw new Error(`Quotation ${quotationId} not found.`);
    if (quote.status === "converted") {
      throw new Error(`Quotation ${quote.quotation_number} has already been converted.`);
    }

    const today = new Date().toISOString().split("T")[0];
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const expiryDate = expiry.toISOString().split("T")[0];

    // Find if lines reference a plan
    let planId: string | undefined = undefined;
    if (quote.lines && quote.lines.length > 0) {
      const lineWithPlan = quote.lines.find((l) => l.plan_id);
      if (lineWithPlan?.plan_id) {
        planId = lineWithPlan.plan_id;
      }
    }
    if (!planId && this.plans.length > 0) {
      planId = this.plans[0].id;
    }

    const lines = (quote.lines || []).map((l) => ({
      product_id: l.product_id || undefined,
      variant_id: l.variant_id || undefined,
      plan_id: l.plan_id || undefined,
      description_snapshot: l.description_snapshot,
      quantity: l.quantity,
      unit_price: l.unit_price,
      tax_rate_snapshot: l.tax_rate_snapshot,
    }));

    const subscription = this.createSubscription({
      customer_id: quote.customer_id,
      plan_id: planId,
      quotation_id: quote.id,
      start_date: today,
      expiry_date: expiryDate,
      payment_terms: "Due upon receipt",
      status: "confirmed",
      lines,
    });

    // Mark quotation converted
    this.updateQuotationStatus(quote.id, "converted");

    return subscription;
  }

  /**
   * Verified State Machine Transitions (M3-05):
   * Allowed transitions:
   * - draft -> quotation / confirmed
   * - quotation -> confirmed
   * - confirmed -> active
   * - active -> closed (or paused/resumed)
   */
  public transitionSubscription(id: string, nextStatus: SubscriptionStatus): Subscription {
    const idx = this.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Subscription ${id} not found.`);

    const current = this.subscriptions[idx];
    const allowed = this.isValidTransition(current.status, nextStatus);

    if (!allowed) {
      throw new Error(
        `Invalid lifecycle transition from '${current.status}' to '${nextStatus}'.`
      );
    }

    this.subscriptions[idx] = {
      ...current,
      status: nextStatus,
    };

    saveStorage(STORAGE_KEYS.SUBSCRIPTIONS, this.subscriptions);
    this.notify();
    return this.subscriptions[idx];
  }

  public pauseSubscription(id: string): Subscription {
    const idx = this.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Subscription ${id} not found.`);
    const current = this.subscriptions[idx];
    if (current.status !== "active") {
      throw new Error("Only active subscriptions can be paused.");
    }
    if (current.plan && !current.plan.allow_pause) {
      throw new Error(`Plan ${current.plan.name} does not permit pausing.`);
    }

    this.subscriptions[idx] = {
      ...current,
      is_paused: true,
    };

    saveStorage(STORAGE_KEYS.SUBSCRIPTIONS, this.subscriptions);
    this.notify();
    return this.subscriptions[idx];
  }

  public resumeSubscription(id: string): Subscription {
    const idx = this.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Subscription ${id} not found.`);
    const current = this.subscriptions[idx];
    if (current.status !== "active") {
      throw new Error("Only active subscriptions can be resumed.");
    }

    this.subscriptions[idx] = {
      ...current,
      is_paused: false,
    };

    saveStorage(STORAGE_KEYS.SUBSCRIPTIONS, this.subscriptions);
    this.notify();
    return this.subscriptions[idx];
  }

  public renewSubscription(id: string): Subscription {
    const idx = this.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Subscription ${id} not found.`);
    const current = this.subscriptions[idx];

    const frequency = current.plan ? current.plan.frequency : "monthly";
    const baseDate = current.expiry_date || new Date().toISOString().split("T")[0];
    const newExpiry = calculateNextBillingDate(baseDate, frequency);
    const newNextBilling = calculateNextBillingDate(
      current.next_billing_date || new Date().toISOString().split("T")[0],
      frequency
    );

    this.subscriptions[idx] = {
      ...current,
      expiry_date: newExpiry,
      next_billing_date: newNextBilling,
    };

    saveStorage(STORAGE_KEYS.SUBSCRIPTIONS, this.subscriptions);
    this.notify();
    return this.subscriptions[idx];
  }

  private isValidTransition(from: SubscriptionStatus, to: SubscriptionStatus): boolean {
    const transitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
      draft: ["quotation", "confirmed"],
      quotation: ["confirmed", "closed"],
      confirmed: ["active", "closed"],
      active: ["closed"],
      closed: [], // Terminal
    };
    return transitions[from]?.includes(to) ?? false;
  }

  public resetToMock() {
    this.customers = [...mockCustomers];
    this.products = [...mockProducts];
    this.plans = [...mockPlans];
    this.quotations = [...mockQuotations];
    this.subscriptions = [...mockSubscriptions];
    saveStorage(STORAGE_KEYS.CUSTOMERS, this.customers);
    saveStorage(STORAGE_KEYS.PRODUCTS, this.products);
    saveStorage(STORAGE_KEYS.PLANS, this.plans);
    saveStorage(STORAGE_KEYS.QUOTATIONS, this.quotations);
    saveStorage(STORAGE_KEYS.SUBSCRIPTIONS, this.subscriptions);
    this.notify();
  }
}

// Singleton export
export const subscriptionOps = new SubscriptionOperationsService();
