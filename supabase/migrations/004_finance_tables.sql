-- ============================================================================
-- BrightLoop Subscription Management System
-- Migration: 004_finance_tables.sql
-- Owner: Member 4 (Finance Operations Developer)
-- Tables: taxes, invoices, invoice_lines, discounts, discount_applications,
--         payments, payment_allocations
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TAXES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.taxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rate NUMERIC(7,4) NOT NULL CHECK (rate >= 0), -- e.g. 0.1800 for 18% GST
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. DISCOUNTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
    value NUMERIC(14,2) NOT NULL CHECK (value >= 0),
    minimum_purchase NUMERIC(14,2) NULL CHECK (minimum_purchase IS NULL OR minimum_purchase >= 0),
    minimum_quantity NUMERIC(12,3) NULL CHECK (minimum_quantity IS NULL OR minimum_quantity > 0),
    starts_at TIMESTAMPTZ NULL,
    ends_at TIMESTAMPTZ NULL,
    usage_limit INTEGER NULL CHECK (usage_limit IS NULL OR usage_limit > 0),
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    scope_type TEXT NOT NULL DEFAULT 'subscription' CHECK (scope_type IN ('product', 'subscription', 'global')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_discount_dates CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at),
    CONSTRAINT chk_percentage_range CHECK (discount_type != 'percentage' OR (value >= 0 AND value <= 100))
);

-- ----------------------------------------------------------------------------
-- 3. INVOICES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    subscription_id UUID NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    billing_period_start DATE NULL,
    billing_period_end DATE NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'paid', 'cancelled')),
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_total NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (discount_total >= 0),
    tax_total NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (tax_total >= 0),
    total NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
    balance_due NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (balance_due >= 0),
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Core Idempotency Constraint for Recurring Billing:
    -- Prevents generating duplicate recurring invoices for the same subscription in the same period
    CONSTRAINT uq_subscription_billing_period UNIQUE (subscription_id, billing_period_start, billing_period_end)
);

-- ----------------------------------------------------------------------------
-- 4. INVOICE LINES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID NULL,
    description_snapshot TEXT NOT NULL,
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_rate_snapshot NUMERIC(7,4) NOT NULL DEFAULT 0.0000 CHECK (tax_rate_snapshot >= 0),
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    line_total NUMERIC(14,2) NOT NULL CHECK (line_total >= 0)
);

-- ----------------------------------------------------------------------------
-- 5. DISCOUNT APPLICATIONS TABLE (Historical snapshot of applied discounts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discount_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_id UUID NOT NULL REFERENCES public.discounts(id),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    discount_name_snapshot TEXT NOT NULL,
    discount_type_snapshot TEXT NOT NULL CHECK (discount_type_snapshot IN ('fixed', 'percentage')),
    discount_value_snapshot NUMERIC(14,2) NOT NULL,
    amount_applied NUMERIC(14,2) NOT NULL CHECK (amount_applied >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. PAYMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'upi', 'other')),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note TEXT NULL,
    recorded_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. PAYMENT ALLOCATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount_allocated NUMERIC(14,2) NOT NULL CHECK (amount_allocated > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_payment_invoice_allocation UNIQUE (payment_id, invoice_id)
);

-- ----------------------------------------------------------------------------
-- 8. INDEXES FOR HIGH-PERFORMANCE DASHBOARD & QUERIES (<2s target)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);

CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON public.invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_discount_applications_invoice_id ON public.discount_applications(invoice_id);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_payment_allocations_invoice_id ON public.payment_allocations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment_id ON public.payment_allocations(payment_id);

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user customer_id
CREATE OR REPLACE FUNCTION public.get_current_user_customer_id()
RETURNS UUID AS $$
    SELECT customer_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- TAXES RLS:
-- Public/Authenticated can read active taxes; Admin can manage
CREATE POLICY "Anyone can view active taxes" ON public.taxes
    FOR SELECT TO authenticated USING (is_active = true OR public.get_current_user_role() = 'admin');

CREATE POLICY "Admin can manage taxes" ON public.taxes
    FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin');

-- DISCOUNTS RLS:
-- Authenticated users can view active discounts; Admin can manage
CREATE POLICY "View active discounts" ON public.discounts
    FOR SELECT TO authenticated USING (is_active = true OR public.get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin manage discounts" ON public.discounts
    FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin');

-- INVOICES RLS:
-- Admin & Staff: view and manage all
-- Customer: view ONLY their own invoices
CREATE POLICY "Admin and Staff can view all invoices" ON public.invoices
    FOR SELECT TO authenticated USING (public.get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customer can view own invoices" ON public.invoices
    FOR SELECT TO authenticated USING (
        public.get_current_user_role() = 'customer' AND customer_id = public.get_current_user_customer_id()
    );

CREATE POLICY "Admin and Staff can insert invoices" ON public.invoices
    FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin and Staff can update invoices" ON public.invoices
    FOR UPDATE TO authenticated USING (public.get_current_user_role() IN ('admin', 'staff'));

-- INVOICE LINES RLS:
CREATE POLICY "Admin and Staff can view all invoice lines" ON public.invoice_lines
    FOR SELECT TO authenticated USING (public.get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customer can view own invoice lines" ON public.invoice_lines
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_lines.invoice_id
            AND i.customer_id = public.get_current_user_customer_id()
        )
    );

CREATE POLICY "Admin and Staff can manage invoice lines" ON public.invoice_lines
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'staff'));

-- PAYMENTS RLS:
-- Admin & Staff: view and manage all
-- Customer: view ONLY their own payments
CREATE POLICY "Admin and Staff view all payments" ON public.payments
    FOR SELECT TO authenticated USING (public.get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customer view own payments" ON public.payments
    FOR SELECT TO authenticated USING (
        public.get_current_user_role() = 'customer' AND customer_id = public.get_current_user_customer_id()
    );

CREATE POLICY "Admin and Staff record payments" ON public.payments
    FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() IN ('admin', 'staff'));

-- PAYMENT ALLOCATIONS RLS:
CREATE POLICY "Admin and Staff view all payment allocations" ON public.payment_allocations
    FOR SELECT TO authenticated USING (public.get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customer view own payment allocations" ON public.payment_allocations
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = payment_allocations.invoice_id
            AND i.customer_id = public.get_current_user_customer_id()
        )
    );

CREATE POLICY "Admin and Staff manage payment allocations" ON public.payment_allocations
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'staff'));
