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
  mockSubscriptions,
  mockInvoices,
  mockPayments,
} from "@/lib/mock-data";
import {
  Repeat,
  Calendar,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  CreditCard,
  Building,
  Printer,
  Sparkles,
} from "lucide-react";

export default function CustomerPortalPage() {
  const currentCustomer = mockCustomers[0]; // Acme Cloud Technologies

  // Customer Isolation: Only Acme's records
  const mySubscriptions = mockSubscriptions.filter(
    (s) => s.customer_id === currentCustomer.id
  );
  const myInvoices = mockInvoices.filter(
    (inv) => inv.customer_id === currentCustomer.id
  );
  const myPayments = mockPayments.filter(
    (p) => p.customer_id === currentCustomer.id
  );

  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "payments">(
    "subscriptions"
  );
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const handleSendRequest = () => {
    setShowRequestDialog(false);
    setRequestSuccess(
      "Your change request for SUB-2026-0001 has been logged and assigned to BrightLoop Customer Success."
    );
  };

  const myOutstanding = myInvoices.reduce((sum, inv) => sum + inv.balance_due, 0);
  const unpaidCount = myInvoices.filter((inv) => inv.balance_due > 0).length;

  const subscriptionColumns = [
    {
      key: "subscription_number",
      header: "Subscription #",
      render: (row: (typeof mySubscriptions)[0]) => (
        <span className="font-semibold text-indigo-600">
          {row.subscription_number}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Service Plan",
      render: (row: (typeof mySubscriptions)[0]) => (
        <div>
          <p className="font-semibold text-slate-900">{row.plan?.name}</p>
          <p className="text-xs text-slate-500 capitalize">
            Billing Frequency: {row.plan?.frequency}
          </p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Contract Validity",
      render: (row: (typeof mySubscriptions)[0]) => (
        <span className="text-xs text-slate-700">
          <DateDisplay date={row.start_date} /> &rarr;{" "}
          <DateDisplay date={row.expiry_date} />
        </span>
      ),
    },
    {
      key: "next_billing_date",
      header: "Next Renewal",
      render: (row: (typeof mySubscriptions)[0]) => (
        <span className="font-medium text-slate-900">
          <DateDisplay date={row.next_billing_date} />
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof mySubscriptions)[0]) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  const invoiceColumns = [
    {
      key: "invoice_number",
      header: "Invoice #",
      render: (row: (typeof myInvoices)[0]) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {row.invoice_number}
        </span>
      ),
    },
    {
      key: "billing_period",
      header: "Billing Period",
      render: (row: (typeof myInvoices)[0]) => (
        <span className="text-xs text-slate-600">
          {row.billing_period_start} &rarr; {row.billing_period_end}
        </span>
      ),
    },
    {
      key: "total",
      header: "Invoice Total",
      render: (row: (typeof myInvoices)[0]) => (
        <MoneyDisplay amount={row.total} />
      ),
    },
    {
      key: "balance_due",
      header: "Outstanding Balance",
      render: (row: (typeof myInvoices)[0]) => (
        <MoneyDisplay
          amount={row.balance_due}
          variant={row.balance_due > 0 ? "negative" : "muted"}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof myInvoices)[0]) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: "action",
      header: "Receipt",
      render: (row: (typeof myInvoices)[0]) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Printer className="w-3.5 h-3.5 text-slate-500" />}
          onClick={() => alert(`Downloading official PDF for ${row.invoice_number}...`)}
        >
          PDF
        </Button>
      ),
    },
  ];

  const paymentColumns = [
    {
      key: "payment_reference",
      header: "Payment Reference #",
      render: (row: (typeof myPayments)[0]) => (
        <span className="font-semibold text-slate-900">
          {row.payment_reference}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount Paid",
      render: (row: (typeof myPayments)[0]) => (
        <MoneyDisplay amount={row.amount} variant="positive" />
      ),
    },
    {
      key: "payment_method",
      header: "Method",
      render: (row: (typeof myPayments)[0]) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.payment_method}
        </span>
      ),
    },
    {
      key: "payment_date",
      header: "Date Settled",
      render: (row: (typeof myPayments)[0]) => <DateDisplay date={row.payment_date} />,
    },
    {
      key: "note",
      header: "Bank UTR Receipt",
      render: (row: (typeof myPayments)[0]) => (
        <span className="text-xs text-slate-500 font-mono">{row.note}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Client Account Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
            <Building className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">
                {currentCustomer.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Active Client
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Account Code: <span className="font-mono text-emerald-400">{currentCustomer.customer_code}</span> &bull; {currentCustomer.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
            onClick={() => setShowRequestDialog(true)}
          >
            Change / Upgrade Plan
          </Button>
        </div>
      </div>

      {requestSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-950">
              Request Logged Successfully
            </p>
            <p className="text-xs text-emerald-800 mt-0.5">{requestSuccess}</p>
          </div>
          <button
            onClick={() => setRequestSuccess(null)}
            className="text-emerald-800 hover:text-emerald-950 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Customer Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Subscriptions"
          value={mySubscriptions.length}
          subtitle="Enterprise services billable"
          icon={<Repeat className="w-5 h-5" />}
        />
        <StatCard
          label="Next Scheduled Renewal"
          value="Nov 01, 2026"
          subtitle="Monthly recurring cycle"
          variant="default"
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          label="Unpaid Invoices"
          value={unpaidCount}
          subtitle={unpaidCount > 0 ? "Awaiting full payment" : "All invoices settled"}
          variant={unpaidCount > 0 ? "warning" : "default"}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          label="Total Balance Due"
          value={`₹${myOutstanding.toLocaleString("en-IN")}`}
          subtitle="Pending receivables"
          variant={myOutstanding > 0 ? "danger" : "success"}
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* Modern Tabs */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "subscriptions"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Repeat className="w-4 h-4 text-slate-400" />
            My Subscriptions ({mySubscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "invoices"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            My Invoices ({myInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "payments"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            Settled Payment Receipts ({myPayments.length})
          </button>
        </div>

        {activeTab === "subscriptions" && (
          <DataTable columns={subscriptionColumns} data={mySubscriptions} />
        )}
        {activeTab === "invoices" && (
          <DataTable columns={invoiceColumns} data={myInvoices} />
        )}
        {activeTab === "payments" && (
          <DataTable columns={paymentColumns} data={myPayments} />
        )}
      </div>

      {/* Self-service Change Modal */}
      <ConfirmDialog
        isOpen={showRequestDialog}
        title="Submit Subscription Plan Request"
        message="Request an upgrade, add-on storage, or pause on Subscription SUB-2026-0001. BrightLoop Operations will review and apply changes."
        confirmLabel="Submit to Operations"
        onConfirm={handleSendRequest}
        onCancel={() => setShowRequestDialog(false)}
      />
    </div>
  );
}
