"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { mockCustomers, mockPayments } from "@/lib/mock-data";

export default function CustomerPaymentsPage() {
  const currentCustomer = mockCustomers[0];
  const myPayments = mockPayments.filter(
    (p) => p.customer_id === currentCustomer.id
  );

  const columns = [
    {
      key: "payment_reference",
      header: "Payment Reference #",
      render: (row: (typeof myPayments)[0]) => (
        <span className="font-semibold text-brand">
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
      header: "Payment Method",
      render: (row: (typeof myPayments)[0]) => (
        <span className="text-xs font-medium text-slate-700">
          {row.payment_method}
        </span>
      ),
    },
    {
      key: "payment_date",
      header: "Payment Date",
      render: (row: (typeof myPayments)[0]) => <DateDisplay date={row.payment_date} />,
    },
    {
      key: "note",
      header: "Bank UTR / Transaction Note",
      render: (row: (typeof myPayments)[0]) => (
        <span className="font-mono text-xs text-text-secondary">{row.note}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Receipts & History"
        description="View settled payments and bank reconciliation receipts allocated to your invoices."
      />
      <DataTable columns={columns} data={myPayments} />
    </div>
  );
}
