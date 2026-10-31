-- ========================================================================
-- BrightLoop Subscription Management System - Demo Seed Data
-- Authority: Document 01 (Catalogue & Demo Data) & Document 04
-- ========================================================================

-- 1. Demo Taxes
INSERT INTO public.taxes (id, name, rate, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'GST 18%', 0.1800, true),
  ('11111111-1111-1111-1111-111111111112', 'GST 12%', 0.1200, true),
  ('11111111-1111-1111-1111-111111111113', 'Zero Tax 0%', 0.0000, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Demo Products (BrightLoop Software Products & Custom Services)
INSERT INTO public.products (id, name, product_type, description, sales_price, cost_price, notes, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222221', 'Quality Management System (QMS)', 'SaaS Product', 'ISO document control, versioning, audit management, and compliance tracker.', 12500.00, 4500.00, 'BrightLoop Flagship QMS', true),
  ('22222222-2222-2222-2222-222222222222', 'Event Management System', 'SaaS Product', 'Registration, ticketing, payment integration, attendee analytics, and mobile app.', 8500.00, 3000.00, 'BrightLoop Events', true),
  ('22222222-2222-2222-2222-222222222223', 'Food Delivery Ecosystem', 'Software Platform', 'Customer app, restaurant dashboard, driver dispatch, and routing engine.', 24000.00, 9500.00, 'BrightLoop Food Suite', true),
  ('22222222-2222-2222-2222-222222222224', 'Full-Stack Dedicated Engineering', 'Custom Development', 'Monthly dedicated software engineering sprint team.', 45000.00, 28000.00, 'BrightLoop Engineering Retainer', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Product Variants (Illustrating +560 brand adjustment from hackathon challenge)
INSERT INTO public.product_variants (id, product_id, name, price_adjustment, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', 'Standard Edition', 0.00, true),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', 'Enterprise Odoo-Integrated Brand', 560.00, true),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Standard Edition', 0.00, true),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 'Multi-Venue Enterprise Addon', 560.00, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Subscription Plans
INSERT INTO public.plans (id, name, description, price, frequency, minimum_quantity, auto_close, allow_early_close, allow_pause, is_active)
VALUES
  ('44444444-4444-4444-4444-444444444441', 'Monthly Business Standard', 'Standard monthly subscription billing cycle with automatic invoice generation.', 12500.00, 'monthly', 1.000, false, true, true, true),
  ('44444444-4444-4444-4444-444444444442', 'Annual Enterprise Saver', 'Yearly billing with priority 24/7 SLA support and discounted rate.', 135000.00, 'yearly', 1.000, false, false, true, true),
  ('44444444-4444-4444-4444-444444444443', 'Weekly Sprint Retainer', 'Weekly agile software development sprint allocation.', 15000.00, 'weekly', 1.000, true, true, false, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Demo Customers
INSERT INTO public.customers (id, customer_code, name, email, phone, address, notes, is_active)
VALUES
  ('55555555-5555-5555-5555-555555555551', 'CUST-ACME-01', 'Acme Cloud Technologies', 'billing@acmecloud.io', '+91 98765 43210', 'Infopark Phase 2, Kakkanad, Kochi, Kerala 682042', 'Key enterprise client', true),
  ('55555555-5555-5555-5555-555555555552', 'CUST-NEXUS-02', 'Nexus Logistics LLP', 'finance@nexuslogistics.in', '+91 98765 88990', 'MG Road, Ernakulam, Kochi 682016', 'Monthly QMS subscriber', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Demo Discounts
INSERT INTO public.discounts (id, name, discount_type, value, minimum_purchase, minimum_quantity, starts_at, ends_at, usage_limit, usage_count, scope_type, is_active)
VALUES
  ('66666666-6666-6666-6666-666666666661', 'Hackathon Early Adopter 10%', 'percentage', 10.00, 5000.00, 1.000, now() - interval '10 days', now() + interval '60 days', 50, 2, 'global', true),
  ('66666666-6666-6666-6666-666666666662', 'Flat ₹2000 Welcome Bonus', 'fixed', 2000.00, 10000.00, 1.000, now() - interval '5 days', now() + interval '30 days', 25, 1, 'global', true)
ON CONFLICT (id) DO NOTHING;
