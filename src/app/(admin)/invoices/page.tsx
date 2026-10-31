"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { mockInvoices } from "@/lib/mock-data";
import { Invoice } from "@/types/domain";
import { FileText, Printer, CheckCircle } from "lucide-react";

export default function InvoicesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const columns = [
    {
      key: "invoice_number",
      header: "Invoice #",
      render: (row: Invoice) => (
        <span className="font-semibold text-text-primary">
          {row.invoice_number}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: Invoice) => (
        <div>
          <p className="font-semibold text-text-primary">{row.customer?.name}</p>
          <p className="text-xs text-text-secondary">{row.customer?.email}</p>
        </div>
      ),
    },
    {
      key: "billing_period",
      header: "Billing Period",
      render: (row: Invoice) => (
        <span className="text-xs">
          {row.billing_period_start || "—"} &rarr; {row.billing_period_end || "—"}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (row: Invoice) => <DateDisplay date={row.due_date} />,
    },
    {
      key: "total",
      header: "Grand Total",
      render: (row: Invoice) => <MoneyDisplay amount={row.total} />,
    },
    {
      key: "amount_paid",
      header: "Paid Amount",
      render: (row: Invoice) => (
        <MoneyDisplay amount={row.amount_paid} variant="positive" />
      ),
    },
    {
      key: "balance_due",
      header: "Balance Due",
      render: (row: Invoice) => (
        <MoneyDisplay
          amount={row.balance_due}
          variant={row.balance_due > 0 ? "negative" : "muted"}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Invoice) => {
        const isOverdue =
          row.status === "confirmed" &&
          new Date(row.due_date) < new Date("2026-10-31") &&
          row.balance_due > 0;
        return <StatusBadge status={isOverdue ? "overdue" : row.status} />;
      },
    },
    {
      key: "action",
      header: "Actions",
      render: (row: Invoice) => (
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => alert(`Printing PDF for ${row.invoice_number}`)}
            className="p-1 h-7 text-xs"
            title="Print PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invoice Ledger"
        description="Itemized billing invoices generated from active subscriptions with historical price/tax snapshots."
        action={
          <Button
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("Manual invoice drafting dialog")}
          >
            Draft Manual Invoice
          </Button>
        }
      />

      <DataTable columns={columns} data={invoices} />
    </div>
  );
}
