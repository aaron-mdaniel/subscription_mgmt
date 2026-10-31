"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Briefcase,
  User,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  Repeat,
  DollarSign,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Zap,
} from "lucide-react";
import { mockDashboardSummary, mockSubscriptions, mockInvoices } from "@/lib/mock-data";

export default function Home() {
  const [activePreviewTab, setActivePreviewTab] = useState<"admin" | "staff" | "customer">("admin");

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            BL
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              BrightLoop
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
              Subscription Suite
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#preview" className="hover:text-indigo-600 transition-colors">
            Interactive Showcase
          </a>
          <a href="#comparison" className="hover:text-indigo-600 transition-colors">
            Current State vs Solution
          </a>
          <a href="#specs" className="hover:text-indigo-600 transition-colors">
            Architecture & SLA
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition-all duration-150 hover:shadow flex items-center gap-1.5"
          >
            Launch Console <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-50/80 text-indigo-700 border border-indigo-200/60 mb-6 shadow-subtle">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            The unified subscription engine for modern SaaS businesses.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate spreadsheets and manual billing errors. BrightLoop delivers state-driven subscriptions, idempotent recurring batch billing, dynamic discounts, and isolated customer portals.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md"
            >
              Explore Live Admin Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/portal"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 shadow-subtle transition-colors"
            >
              <User className="w-4 h-4 text-emerald-600" /> View Customer Portal
            </Link>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-subtle">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active MRR Base</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">₹95,360</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">● 100% Reconciled Cash</p>
            </div>
            <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-subtle">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duplicate Billing</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">0.0%</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Guaranteed Idempotency</p>
            </div>
            <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-subtle">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Query Latency</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">&lt; 200 ms</p>
              <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Sub-2s SLA Compliant</p>
            </div>
            <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-subtle">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Isolation</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">Strict RLS</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Database Layer Protected</p>
            </div>
          </div>
        </section>

        {/* Interactive Showcase Preview */}
        <section id="preview" className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Interactive System Showcase
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Select an operational role to experience real user interfaces and workflows
            </p>

            {/* Interactive Tab Switcher */}
            <div className="inline-flex p-1 mt-6 rounded-xl bg-slate-200/80 border border-slate-300/80 text-xs font-semibold">
              <button
                onClick={() => setActivePreviewTab("admin")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activePreviewTab === "admin"
                    ? "bg-white text-indigo-700 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" /> Admin Executive Console
              </button>
              <button
                onClick={() => setActivePreviewTab("staff")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activePreviewTab === "staff"
                    ? "bg-white text-indigo-700 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-sky-600" /> Staff Billing & Quotes
              </button>
              <button
                onClick={() => setActivePreviewTab("customer")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activePreviewTab === "customer"
                    ? "bg-white text-indigo-700 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" /> Customer Self-Service
              </button>
            </div>
          </div>

          {/* Interactive Mock Window */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-dropdown overflow-hidden transition-all duration-200">
            {/* Browser chrome header */}
            <div className="h-10 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  {activePreviewTab === "admin"
                    ? "https://app.brightloop.in/dashboard"
                    : activePreviewTab === "staff"
                    ? "https://app.brightloop.in/staff/dashboard"
                    : "https://portal.brightloop.in/portal"}
                </span>
              </div>
              <Link
                href={
                  activePreviewTab === "admin"
                    ? "/dashboard"
                    : activePreviewTab === "staff"
                    ? "/staff/dashboard"
                    : "/portal"
                }
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Open Full Screen <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Simulated Live Viewport */}
            <div className="p-6 bg-slate-50/50">
              {activePreviewTab === "admin" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Executive Finance Dashboard
                      </h3>
                      <p className="text-xs text-slate-500">
                        Real-time revenue received vs outstanding balance reconciliation
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg shadow-subtle hover:bg-indigo-700"
                    >
                      Run Batch Billing
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Revenue Collected</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">₹95,360.80</p>
                      <p className="text-[11px] text-slate-500 mt-1">Bank NEFT / Corporate Wire</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Total Outstanding</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">₹1,16,524.72</p>
                      <p className="text-[11px] text-slate-500 mt-1">Awaiting settlement</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Overdue Balance</p>
                      <p className="text-2xl font-bold text-rose-600 mt-1">₹1,00,000.00</p>
                      <p className="text-[11px] text-rose-600 font-medium mt-1">1 Invoice requiring chasing</p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === "staff" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Staff Operations Workspace
                      </h3>
                      <p className="text-xs text-slate-500">
                        Prepare quotes, confirm conversions, and allocate incoming payments
                      </p>
                    </div>
                    <Link
                      href="/staff/dashboard"
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg shadow-subtle hover:bg-slate-800"
                    >
                      Record Payment
                    </Link>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 flex justify-between">
                      <span>Operational Receivables Queue</span>
                      <span className="text-indigo-600 font-bold">Action Required</span>
                    </div>
                    <div className="p-4 divide-y divide-slate-100">
                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">INV-2026-1002 &bull; Nexus Global Logistics</p>
                          <p className="text-[11px] text-slate-500">Event Management Platform (Enterprise Tier)</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-rose-600">₹1,00,000 Due</p>
                          <span className="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200">
                            Past Due (Net 30)
                          </span>
                        </div>
                      </div>
                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">INV-2026-1003 &bull; Acme Cloud Technologies</p>
                          <p className="text-[11px] text-slate-500">QMS + Odoo Integration (+560 delta)</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-slate-900">₹16,524.72</p>
                          <span className="inline-block px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold border border-sky-200">
                            Confirmed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === "customer" && (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Acme Cloud Technologies — Verified Account
                      </h4>
                      <p className="text-xs text-emerald-700">
                        Viewing only authorized subscriptions & invoices under Customer Isolation Policy
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white text-emerald-800 text-xs font-semibold border border-emerald-200">
                      Account: CUST-ACME-01
                    </span>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        My Active Subscription
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active & Billable
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          SUB-2026-0001: BrightLoop QMS (Odoo Enterprise)
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          Renews automatically on <strong className="text-slate-800">Nov 01, 2026</strong>
                        </p>
                      </div>
                      <Link
                        href="/portal"
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        Request Upgrade / Pause
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* The Problem vs The Solution Comparison Table */}
        <section id="comparison" className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Why BrightLoop? Current Operational Bottlenecks Solved
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Direct mapping of hackathon failure modes to system capabilities
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-subtle overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Failure Modes */}
              <div className="p-6 bg-rose-50/20">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  How Recurring Revenue Runs Today
                </p>
                <div className="space-y-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Subscriptions in Spreadsheets</p>
                    <p className="text-slate-500 mt-0.5">Lost customer records, inconsistent pricing, and no central source of truth.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Renewals Remembered by Memory</p>
                    <p className="text-slate-500 mt-0.5">Whoever notices first follows up. Result: missed expirations and lost revenue.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Invoices Typed Manually Every Month</p>
                    <p className="text-slate-500 mt-0.5">Typos, duplicate bills, and invoices sent late to customers.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Bank Statement Scrolling</p>
                    <p className="text-slate-500 mt-0.5">Matching payments manually against bank lines creates untracked receivables.</p>
                  </div>
                </div>
              </div>

              {/* BrightLoop Solution */}
              <div className="p-6 bg-emerald-50/20">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  The BrightLoop Solution
                </p>
                <div className="space-y-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Unified Relational Database & State Machine</p>
                    <p className="text-slate-600 mt-0.5">Strict Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed lifecycle.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Automated Renewal Rules & Expiry Alerts</p>
                    <p className="text-slate-600 mt-0.5">Configurable plan rules: auto-close, early closure, and pausable contracts.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">One-Click Recurring Billing with Idempotency</p>
                    <p className="text-slate-600 mt-0.5">Composite unique constraint prevents duplicate invoices for the same period.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Direct Payment Allocation & Real-Time Balance</p>
                    <p className="text-slate-600 mt-0.5">Invoices become Paid only when balance reaches zero. Automatic overdue tracking.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="font-semibold text-slate-800">BrightLoop Subscription Management System</span>
          </div>
          <p>
            Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026 &bull; Member 2 (UI/UX)
          </p>
        </div>
      </footer>
    </div>
  );
}
