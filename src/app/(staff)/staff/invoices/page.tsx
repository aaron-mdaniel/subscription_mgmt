"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { mockInvoices } from "@/lib/mock-data";
import { Invoice } from "@/types/domain";

export default function StaffInvoicesPage() {
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
      render: (row: Invoice) => <span>{row.customer?.name}</span>,
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
  ];

  return (
    <div>
      <PageHeader
        title="Invoices & Receivables"
        description="Monitor invoice statuses, overdue receivables, and payment settlement states."
      />
      <DataTable columns={columns} data={invoices} />
    </div>
  );
}
