"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { mockCustomers, mockInvoices } from "@/lib/mock-data";
import { Printer } from "lucide-react";

export default function CustomerInvoicesPage() {
  const currentCustomer = mockCustomers[0];
  const myInvoices = mockInvoices.filter(
    (inv) => inv.customer_id === currentCustomer.id
  );

  const columns = [
    {
      key: "invoice_number",
      header: "Invoice #",
      render: (row: (typeof myInvoices)[0]) => (
        <span className="font-semibold text-text-primary">
          {row.invoice_number}
        </span>
      ),
    },
    {
      key: "billing_period",
      header: "Billing Period",
      render: (row: (typeof myInvoices)[0]) => (
        <span className="text-xs">
          {row.billing_period_start} &rarr; {row.billing_period_end}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (row: (typeof myInvoices)[0]) => <DateDisplay date={row.due_date} />,
    },
    {
      key: "total",
      header: "Total Due",
      render: (row: (typeof myInvoices)[0]) => (
        <MoneyDisplay amount={row.total} />
      ),
    },
    {
      key: "balance_due",
      header: "Remaining Balance",
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
      header: "Invoice PDF",
      render: (row: (typeof myInvoices)[0]) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Printer className="w-3.5 h-3.5" />}
          onClick={() => alert(`Downloading PDF for ${row.invoice_number}...`)}
        >
          Download PDF
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Billing Invoices"
        description="Review all generated recurring invoices, check outstanding dues, and download PDF receipts."
      />
      <DataTable columns={columns} data={myInvoices} />
    </div>
  );
}
