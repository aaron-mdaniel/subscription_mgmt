"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { mockPayments } from "@/lib/mock-data";
import { Payment } from "@/types/domain";
import { Plus } from "lucide-react";

export default function StaffPaymentsPage() {
  const [payments] = useState<Payment[]>(mockPayments);

  const columns = [
    {
      key: "payment_reference",
      header: "Payment Reference #",
      render: (row: Payment) => (
        <span className="font-semibold text-brand">
          {row.payment_reference}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: Payment) => <span>{row.customer?.name}</span>,
    },
    {
      key: "invoice",
      header: "Invoice Settled",
      render: (row: Payment) => (
        <span className="font-mono text-xs">{row.invoice?.invoice_number}</span>
      ),
    },
    {
      key: "method",
      header: "Method",
      render: (row: Payment) => (
        <span className="text-xs">{row.payment_method}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: Payment) => (
        <MoneyDisplay amount={row.amount} variant="positive" />
      ),
    },
    {
      key: "payment_date",
      header: "Date Received",
      render: (row: Payment) => <DateDisplay date={row.payment_date} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Reconciliation"
        description="Record incoming payments and allocate settlements to open invoices."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("Record payment dialog")}
          >
            Record Payment
          </Button>
        }
      />
      <DataTable columns={columns} data={payments} />
    </div>
  );
}
