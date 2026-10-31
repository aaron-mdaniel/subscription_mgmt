/**
-- ========================================================================
-- BrightLoop Subscription Management System - Database Type Definitions
-- Generated to match supabase/migrations/001_initial_schema.sql
-- ========================================================================
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'staff' | 'customer';
export type PlanFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type SubscriptionStatus = 'draft' | 'quotation' | 'confirmed' | 'active' | 'closed';
export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';
export type DiscountType = 'fixed' | 'percentage';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          customer_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          customer_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          customer_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          customer_code: string;
          name: string;
          email: string;
          phone: string | null;
          address: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_code: string;
          name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_code?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          product_type: string;
          description: string | null;
          sales_price: number;
          cost_price: number | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          product_type: string;
          description?: string | null;
          sales_price: number;
          cost_price?: number | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          product_type?: string;
          description?: string | null;
          sales_price?: number;
          cost_price?: number | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price_adjustment: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price_adjustment?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          price_adjustment?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          frequency: PlanFrequency;
          minimum_quantity: number;
          available_from: string | null;
          available_until: string | null;
          auto_close: boolean;
          allow_early_close: boolean;
          allow_pause: boolean;
          renewal_rule: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          frequency: PlanFrequency;
          minimum_quantity?: number;
          available_from?: string | null;
          available_until?: string | null;
          auto_close?: boolean;
          allow_early_close?: boolean;
          allow_pause?: boolean;
          renewal_rule?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          frequency?: PlanFrequency;
          minimum_quantity?: number;
          available_from?: string | null;
          available_until?: string | null;
          auto_close?: boolean;
          allow_early_close?: boolean;
          allow_pause?: boolean;
          renewal_rule?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      taxes: {
        Row: {
          id: string;
          name: string;
          rate: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          rate: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          rate?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string;
          quotation_number: string;
          customer_id: string;
          template_id: string | null;
          created_by: string | null;
          quotation_date: string;
          valid_until: string;
          status: QuotationStatus;
          subtotal: number;
          discount_total: number;
          tax_total: number;
          total: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quotation_number: string;
          customer_id: string;
          template_id?: string | null;
          created_by?: string | null;
          quotation_date?: string;
          valid_until: string;
          status?: QuotationStatus;
          subtotal?: number;
          discount_total?: number;
          tax_total?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quotation_number?: string;
          customer_id?: string;
          template_id?: string | null;
          created_by?: string | null;
          quotation_date?: string;
          valid_until?: string;
          status?: QuotationStatus;
          subtotal?: number;
          discount_total?: number;
          tax_total?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotation_lines: {
        Row: {
          id: string;
          quotation_id: string;
          product_id: string | null;
          variant_id: string | null;
          plan_id: string | null;
          description_snapshot: string;
          quantity: number;
          unit_price: number;
          tax_rate_snapshot: number;
          line_subtotal: number;
          line_tax: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          plan_id?: string | null;
          description_snapshot: string;
          quantity: number;
          unit_price: number;
          tax_rate_snapshot?: number;
          line_subtotal?: number;
          line_tax?: number;
          line_total?: number;
        };
        Update: {
          id?: string;
          quotation_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          plan_id?: string | null;
          description_snapshot?: string;
          quantity?: number;
          unit_price?: number;
          tax_rate_snapshot?: number;
          line_subtotal?: number;
          line_tax?: number;
          line_total?: number;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          subscription_number: string;
          customer_id: string;
          plan_id: string | null;
          quotation_id: string | null;
          start_date: string;
          expiry_date: string | null;
          next_billing_date: string | null;
          payment_terms: string | null;
          status: SubscriptionStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subscription_number: string;
          customer_id: string;
          plan_id?: string | null;
          quotation_id?: string | null;
          start_date?: string;
          expiry_date?: string | null;
          next_billing_date?: string | null;
          payment_terms?: string | null;
          status?: SubscriptionStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subscription_number?: string;
          customer_id?: string;
          plan_id?: string | null;
          quotation_id?: string | null;
          start_date?: string;
          expiry_date?: string | null;
          next_billing_date?: string | null;
          payment_terms?: string | null;
          status?: SubscriptionStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscription_lines: {
        Row: {
          id: string;
          subscription_id: string;
          product_id: string | null;
          variant_id: string | null;
          plan_id: string | null;
          description_snapshot: string;
          quantity: number;
          unit_price: number;
          tax_rate_snapshot: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          plan_id?: string | null;
          description_snapshot: string;
          quantity: number;
          unit_price: number;
          tax_rate_snapshot?: number;
          line_total: number;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          plan_id?: string | null;
          description_snapshot?: string;
          quantity?: number;
          unit_price?: number;
          tax_rate_snapshot?: number;
          line_total?: number;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_id: string;
          subscription_id: string | null;
          invoice_date: string;
          due_date: string;
          billing_period_start: string | null;
          billing_period_end: string | null;
          status: InvoiceStatus;
          subtotal: number;
          discount_total: number;
          tax_total: number;
          total: number;
          amount_paid: number;
          balance_due: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          customer_id: string;
          subscription_id?: string | null;
          invoice_date?: string;
          due_date: string;
          billing_period_start?: string | null;
          billing_period_end?: string | null;
          status?: InvoiceStatus;
          subtotal?: number;
          discount_total?: number;
          tax_total?: number;
          total?: number;
          amount_paid?: number;
          balance_due?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          customer_id?: string;
          subscription_id?: string | null;
          invoice_date?: string;
          due_date?: string;
          billing_period_start?: string | null;
          billing_period_end?: string | null;
          status?: InvoiceStatus;
          subtotal?: number;
          discount_total?: number;
          tax_total?: number;
          total?: number;
          amount_paid?: number;
          balance_due?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_lines: {
        Row: {
          id: string;
          invoice_id: string;
          product_id: string | null;
          description_snapshot: string;
          quantity: number;
          unit_price: number;
          discount_amount: number;
          tax_rate_snapshot: number;
          tax_amount: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          product_id?: string | null;
          description_snapshot: string;
          quantity: number;
          unit_price: number;
          discount_amount?: number;
          tax_rate_snapshot?: number;
          tax_amount?: number;
          line_total: number;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          product_id?: string | null;
          description_snapshot?: string;
          quantity?: number;
          unit_price?: number;
          discount_amount?: number;
          tax_rate_snapshot?: number;
          tax_amount?: number;
          line_total?: number;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          payment_reference: string;
          customer_id: string;
          payment_method: string;
          amount: number;
          payment_date: string;
          note: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_reference: string;
          customer_id: string;
          payment_method: string;
          amount: number;
          payment_date?: string;
          note?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_reference?: string;
          customer_id?: string;
          payment_method?: string;
          amount?: number;
          payment_date?: string;
          note?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payment_allocations: {
        Row: {
          id: string;
          payment_id: string;
          invoice_id: string;
          amount_allocated: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          invoice_id: string;
          amount_allocated: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          invoice_id?: string;
          amount_allocated?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      discounts: {
        Row: {
          id: string;
          name: string;
          discount_type: DiscountType;
          value: number;
          minimum_purchase: number | null;
          minimum_quantity: number | null;
          starts_at: string | null;
          ends_at: string | null;
          usage_limit: number | null;
          usage_count: number;
          scope_type: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          discount_type: DiscountType;
          value: number;
          minimum_purchase?: number | null;
          minimum_quantity?: number | null;
          starts_at?: string | null;
          ends_at?: string | null;
          usage_limit?: number | null;
          usage_count?: number;
          scope_type?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          discount_type?: DiscountType;
          value?: number;
          minimum_purchase?: number | null;
          minimum_quantity?: number | null;
          starts_at?: string | null;
          ends_at?: string | null;
          usage_limit?: number | null;
          usage_count?: number;
          scope_type?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscription_change_requests: {
        Row: {
          id: string;
          subscription_id: string;
          customer_id: string;
          request_type: string;
          request_details: Json;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          customer_id: string;
          request_type: string;
          request_details?: Json;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          customer_id?: string;
          request_type?: string;
          request_details?: Json;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
