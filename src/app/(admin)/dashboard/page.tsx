"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  mockDashboardSummary,
  mockSubscriptions,
  mockInvoices,
} from "@/lib/mock-data";
import {
  Repeat,
  DollarSign,
  Clock,
  AlertTriangle,
  Play,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle,
  TrendingUp,
  Filter,
  Calendar,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingRunMessage, setBillingRunMessage] = useState<string | null>(null);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("oct-2026");
  const [activeTableTab, setActiveTableTab] = useState<"subscriptions" | "invoices">("subscriptions");

  const handleTriggerBilling = () => {
    setBillingRunning(true);
    setTimeout(() => {
      setBillingRunning(false);
      setShowBillingDialog(false);
      setBillingRunMessage(
        "Recurring Billing Run Completed: 1 eligible active subscription processed. Unique period key (SUB-2026-0001 / 2026-11) protected against duplicate invoice generation."
      );
    }, 900);
  };

  const subscriptionColumns = [
    {
      key: "subscription_number",
      header: "Subscription #",
      render: (row: (typeof mockSubscriptions)[0]) => (
        <span className="font-semibold text-indigo-600 hover:underline cursor-pointer">
          {row.subscription_number}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: (typeof mockSubscriptions)[0]) => (
        <div>
          <p className="font-semibold text-slate-900">{row.customer?.name}</p>
          <p className="text-xs text-slate-500">{row.customer?.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan & Terms",
      render: (row: (typeof mockSubscriptions)[0]) => (
        <div>
          <p className="font-medium text-slate-800">{row.plan?.name}</p>
          <p className="text-[11px] text-slate-400 capitalize">Frequency: {row.plan?.frequency}</p>
        </div>
      ),
    },
    {
      key: "next_billing_date",
      header: "Next Billing",
      render: (row: (typeof mockSubscriptions)[0]) => (
        <DateDisplay date={row.next_billing_date} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof mockSubscriptions)[0]) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  const invoiceColumns = [
    {
      key: "invoice_number",
      header: "Invoice #",
      render: (row: (typeof mockInvoices)[0]) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {row.invoice_number}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: (typeof mockInvoices)[0]) => (
        <span className="font-medium text-slate-800">{row.customer?.name}</span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (row: (typeof mockInvoices)[0]) => (
        <DateDisplay date={row.due_date} />
      ),
    },
    {
      key: "total",
      header: "Invoice Total",
      render: (row: (typeof mockInvoices)[0]) => (
        <MoneyDisplay amount={row.total} />
      ),
    },
    {
      key: "balance_due",
      header: "Balance Due",
      render: (row: (typeof mockInvoices)[0]) => (
        <MoneyDisplay
          amount={row.balance_due}
          variant={row.balance_due > 0 ? "negative" : "muted"}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof mockInvoices)[0]) => (
        <StatusBadge
          status={
            row.status === "confirmed" &&
            new Date(row.due_date) < new Date("2026-10-31") &&
            row.balance_due > 0
              ? "overdue"
              : row.status
          }
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Finance & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time subscription ARR, billing runs, and receivable reconciliation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-subtle">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="oct-2026">October 2026 (Active Cycle)</option>
              <option value="q4-2026">Q4 2026 (Quarter-to-Date)</option>
              <option value="fy-2026">Fiscal Year 2026</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Zap className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={() => setShowBillingDialog(true)}
          >
            Run Billing
          </Button>

          <Link href="/quotations">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Create Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Idempotent Billing Execution Notification */}
      {billingRunMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-950">
              Billing Batch Engine Verified
            </p>
            <p className="text-xs text-emerald-800 mt-0.5">
              {billingRunMessage}
            </p>
          </div>
          <button
            onClick={() => setBillingRunMessage(null)}
            className="text-emerald-800 hover:text-emerald-950 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Core Financial Stat Cards with Top Accent Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Subscriptions"
          value={mockDashboardSummary.activeSubscriptions}
          subtitle="Generating recurring revenue"
          trend={{ value: "+12.5%", positive: true }}
          icon={<Repeat className="w-5 h-5" />}
          href="/subscriptions"
        />
        <StatCard
          label="Revenue Received"
          value={`₹${mockDashboardSummary.revenueReceived.toLocaleString("en-IN")}`}
          subtitle="Net cash settled into bank"
          trend={{ value: "+18.2%", positive: true }}
          variant="success"
          icon={<DollarSign className="w-5 h-5" />}
          href="/payments"
        />
        <StatCard
          label="Total Outstanding"
          value={`₹${mockDashboardSummary.outstandingAmount.toLocaleString("en-IN")}`}
          subtitle="Confirmed invoices in progress"
          variant="warning"
          icon={<Clock className="w-5 h-5" />}
          href="/invoices"
        />
        <StatCard
          label="Overdue Receivables"
          value={`₹${mockDashboardSummary.overdueInvoicesAmount.toLocaleString("en-IN")}`}
          subtitle={`${mockDashboardSummary.overdueInvoicesCount} invoice past due (Net 30)`}
          variant="danger"
          icon={<AlertTriangle className="w-5 h-5" />}
          href="/invoices"
        />
      </div>

      {/* Dual Workspace Views with Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTableTab("subscriptions")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTableTab === "subscriptions"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Active Subscriptions ({mockSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveTableTab("invoices")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTableTab === "invoices"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Recent Invoices & Aging Receivables ({mockInvoices.length})
            </button>
          </div>

          <Link
            href={activeTableTab === "subscriptions" ? "/subscriptions" : "/invoices"}
            className="text-xs font-semibold text-indigo-600 hover:underline pb-3 hidden sm:inline"
          >
            View Full Registry &rarr;
          </Link>
        </div>

        {activeTableTab === "subscriptions" ? (
          <DataTable
            columns={subscriptionColumns}
            data={mockSubscriptions}
          />
        ) : (
          <DataTable
            columns={invoiceColumns}
            data={mockInvoices}
          />
        )}
      </div>

      {/* Billing Dialog Confirmation */}
      <ConfirmDialog
        isOpen={showBillingDialog}
        title="Trigger Batch Recurring Billing"
        message="This will evaluate all active subscriptions whose billing schedule is due for execution. The unique (subscription_id, billing_period) key guarantees zero duplicate billing."
        confirmLabel="Execute Billing Run"
        isLoading={billingRunning}
        onConfirm={handleTriggerBilling}
        onCancel={() => setShowBillingDialog(false)}
      />
    </div>
  );
}
