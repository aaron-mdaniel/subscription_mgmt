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
  mockCustomers,
  mockQuotations,
  mockInvoices,
  mockSubscriptions,
} from "@/lib/mock-data";
import {
  FileSpreadsheet,
  Users,
  Repeat,
  CreditCard,
  PlusCircle,
  CheckCircle,
} from "lucide-react";

export default function StaffDashboardPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const handleRecordPayment = () => {
    setShowPaymentModal(false);
    setPaymentSuccessMessage(
      "Payment of ₹16,524.72 recorded and allocated to Invoice INV-2026-1003. Outstanding balance updated to ₹0.00."
    );
  };

  const quoteColumns = [
    {
      key: "quotation_number",
      header: "Quotation #",
      render: (row: (typeof mockQuotations)[0]) => (
        <span className="font-semibold text-brand">
          {row.quotation_number}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: (typeof mockQuotations)[0]) => (
        <span>{row.customer?.name}</span>
      ),
    },
    {
      key: "valid_until",
      header: "Valid Until",
      render: (row: (typeof mockQuotations)[0]) => (
        <DateDisplay date={row.valid_until} />
      ),
    },
    {
      key: "total",
      header: "Total Value",
      render: (row: (typeof mockQuotations)[0]) => (
        <MoneyDisplay amount={row.total} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof mockQuotations)[0]) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  const unpaidInvoicesColumns = [
    {
      key: "invoice_number",
      header: "Invoice #",
      render: (row: (typeof mockInvoices)[0]) => (
        <span className="font-semibold text-text-primary">
          {row.invoice_number}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: (typeof mockInvoices)[0]) => (
        <span>{row.customer?.name}</span>
      ),
    },
    {
      key: "balance_due",
      header: "Outstanding Balance",
      render: (row: (typeof mockInvoices)[0]) => (
        <MoneyDisplay amount={row.balance_due} variant="negative" />
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
      key: "action",
      header: "Action",
      render: () => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPaymentModal(true)}
        >
          Record Payment
        </Button>
      ),
    },
  ];

  const unpaidInvoices = mockInvoices.filter((inv) => inv.balance_due > 0);

  return (
    <div>
      <PageHeader
        title="Staff Operations Workspace"
        description="Daily operational tasks: prepare quotations, manage customer subscriptions, issue invoices, and record incoming payments."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CreditCard className="w-3.5 h-3.5 text-brand" />}
              onClick={() => setShowPaymentModal(true)}
            >
              Record Payment
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={() => alert("Creating quotation from standardized template...")}
            >
              New Quotation
            </Button>
          </div>
        }
      />

      {paymentSuccessMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-start gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-900">
              Payment Allocation Successful
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {paymentSuccessMessage}
            </p>
          </div>
          <button
            onClick={() => setPaymentSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Staff Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Accounts"
          value={mockCustomers.length}
          subtitle="Customers under management"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Quotes"
          value={mockQuotations.filter((q) => q.status === "draft").length}
          subtitle="Quotes awaiting review/acceptance"
          variant="warning"
          icon={<FileSpreadsheet className="w-5 h-5" />}
        />
        <StatCard
          label="Active Subscriptions"
          value={mockSubscriptions.filter((s) => s.status === "active").length}
          subtitle="Generating live billing runs"
          icon={<Repeat className="w-5 h-5" />}
        />
        <StatCard
          label="Receivables Queue"
          value={unpaidInvoices.length}
          subtitle="Invoices pending settlement"
          variant="danger"
          icon={<CreditCard className="w-5 h-5" />}
        />
      </div>

      {/* Operations Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Quotations */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
            Quotations In Progress
          </h3>
          <DataTable
            columns={quoteColumns}
            data={mockQuotations}
          />
        </div>

        {/* Invoices Pending Payment */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
            Receivables & Payment Recording
          </h3>
          <DataTable
            columns={unpaidInvoicesColumns}
            data={unpaidInvoices}
          />
        </div>
      </div>

      {/* Modal for Recording Payment */}
      <ConfirmDialog
        isOpen={showPaymentModal}
        title="Record Payment for Invoice INV-2026-1003"
        message="Record Bank Transfer (NEFT/RTGS) payment of ₹16,524.72 received from Acme Cloud Technologies. This will mark the invoice as Paid."
        confirmLabel="Confirm & Settle Invoice"
        onConfirm={handleRecordPayment}
        onCancel={() => setShowPaymentModal(false)}
      />
    </div>
  );
}
