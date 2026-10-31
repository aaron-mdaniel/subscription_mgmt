-- ========================================================================
-- BrightLoop Subscription Management System
-- Migration 002: Row Level Security (RLS) & Access Policies
-- Authority: Document 04 (Database & API Contract) & Phase 8
-- ========================================================================

-- Enable Row Level Security on all core business tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_change_requests ENABLE ROW LEVEL SECURITY;

-- Helper Functions to read current user role and linked customer ID cleanly
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_customer_id()
RETURNS UUID AS $$
  SELECT customer_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ------------------------------------------------------------------------
-- Users can view their own profile; Admin can view all profiles; Staff can view staff/customers
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.current_user_role() = 'admin'
    OR (public.current_user_role() = 'staff' AND role IN ('staff', 'customer'))
  );

-- Users can update their own display name, but CANNOT change their role or customer_id
CREATE POLICY "Users can update own profile name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND customer_id IS NOT DISTINCT FROM (SELECT customer_id FROM public.profiles WHERE id = auth.uid())
  );

-- STRICT REQUIREMENT: Only Admin can create or modify staff accounts or elevate roles
CREATE POLICY "Admin has full profile management"
  ON public.profiles FOR ALL
  USING (public.current_user_role() = 'admin');

-- ------------------------------------------------------------------------
-- 2. CUSTOMERS POLICIES
-- ------------------------------------------------------------------------
-- Admin & Staff can read all customers; Customer can ONLY read their own record
CREATE POLICY "Customer isolation policy for customers table"
  ON public.customers FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR id = public.current_customer_id()
  );

-- Admin & Staff can insert and update customer records
CREATE POLICY "Admin and staff can manage customers"
  ON public.customers FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin and staff can update customers"
  ON public.customers FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------------------
-- 3. PRODUCTS & PLANS POLICIES (Catalogue)
-- ------------------------------------------------------------------------
-- All authenticated users can view active products/variants/plans
CREATE POLICY "Authenticated users can view active products"
  ON public.products FOR SELECT
  USING (
    is_active = true
    OR public.current_user_role() IN ('admin', 'staff')
  );

CREATE POLICY "Authenticated users can view active variants"
  ON public.product_variants FOR SELECT
  USING (
    is_active = true
    OR public.current_user_role() IN ('admin', 'staff')
  );

CREATE POLICY "Authenticated users can view active plans"
  ON public.plans FOR SELECT
  USING (
    is_active = true
    OR public.current_user_role() IN ('admin', 'staff')
  );

CREATE POLICY "Authenticated users can view taxes"
  ON public.taxes FOR SELECT
  USING (true);

-- Only Admin can manage products, variants, plans, and taxes
CREATE POLICY "Admin can manage products"
  ON public.products FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Admin can manage variants"
  ON public.product_variants FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Admin can manage plans"
  ON public.plans FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Admin can manage taxes"
  ON public.taxes FOR ALL
  USING (public.current_user_role() = 'admin');

-- ------------------------------------------------------------------------
-- 4. QUOTATIONS POLICIES
-- ------------------------------------------------------------------------
CREATE POLICY "Quotations read access"
  ON public.quotations FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR customer_id = public.current_customer_id()
  );

CREATE POLICY "Quotation lines read access"
  ON public.quotation_lines FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR quotation_id IN (SELECT id FROM public.quotations WHERE customer_id = public.current_customer_id())
  );

CREATE POLICY "Admin and staff can manage quotations"
  ON public.quotations FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin and staff can manage quotation lines"
  ON public.quotation_lines FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------------------
-- 5. SUBSCRIPTIONS POLICIES (Customer Isolation Enforced)
-- ------------------------------------------------------------------------
CREATE POLICY "Subscriptions customer isolation read"
  ON public.subscriptions FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR customer_id = public.current_customer_id()
  );

CREATE POLICY "Subscription lines customer isolation read"
  ON public.subscription_lines FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR subscription_id IN (SELECT id FROM public.subscriptions WHERE customer_id = public.current_customer_id())
  );

CREATE POLICY "Subscription events read access"
  ON public.subscription_events FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR subscription_id IN (SELECT id FROM public.subscriptions WHERE customer_id = public.current_customer_id())
  );

CREATE POLICY "Admin and staff can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin and staff can manage subscription lines"
  ON public.subscription_lines FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin and staff can insert subscription events"
  ON public.subscription_events FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------------------
-- 6. INVOICES POLICIES (Customer Isolation & Fraud Prevention)
-- ------------------------------------------------------------------------
CREATE POLICY "Invoices customer isolation read"
  ON public.invoices FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR customer_id = public.current_customer_id()
  );

CREATE POLICY "Invoice lines customer isolation read"
  ON public.invoice_lines FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR invoice_id IN (SELECT id FROM public.invoices WHERE customer_id = public.current_customer_id())
  );

-- Customers CANNOT insert, update, or delete invoices
CREATE POLICY "Admin and staff can manage invoices"
  ON public.invoices FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin and staff can manage invoice lines"
  ON public.invoice_lines FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------------------
-- 7. PAYMENTS POLICIES
-- ------------------------------------------------------------------------
CREATE POLICY "Payments customer isolation read"
  ON public.payments FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR customer_id = public.current_customer_id()
  );

CREATE POLICY "Payment allocations customer isolation read"
  ON public.payment_allocations FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR invoice_id IN (SELECT id FROM public.invoices WHERE customer_id = public.current_customer_id())
  );

-- Only Admin & Staff can record payments
CREATE POLICY "Admin and staff can record payments"
  ON public.payments FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin and staff can record payment allocations"
  ON public.payment_allocations FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------------------
-- 8. DISCOUNTS POLICIES
-- ------------------------------------------------------------------------
CREATE POLICY "Authenticated users can view active discounts"
  ON public.discounts FOR SELECT
  USING (is_active = true OR public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admin can manage discounts"
  ON public.discounts FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Admin and staff can manage discount applications"
  ON public.discount_applications FOR ALL
  USING (public.current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------------------
-- 9. CUSTOMER CHANGE REQUESTS POLICIES
-- ------------------------------------------------------------------------
CREATE POLICY "Customers can view own change requests"
  ON public.subscription_change_requests FOR SELECT
  USING (
    public.current_user_role() IN ('admin', 'staff')
    OR customer_id = public.current_customer_id()
  );

CREATE POLICY "Customers can insert change requests for own subscriptions"
  ON public.subscription_change_requests FOR INSERT
  WITH CHECK (
    customer_id = public.current_customer_id()
    AND subscription_id IN (SELECT id FROM public.subscriptions WHERE customer_id = public.current_customer_id())
  );

CREATE POLICY "Admin and staff can review change requests"
  ON public.subscription_change_requests FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'staff'));
