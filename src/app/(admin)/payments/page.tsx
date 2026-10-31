"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { mockPayments } from "@/lib/mock-data";
import { Payment } from "@/types/domain";
import { Plus, CreditCard } from "lucide-react";

export default function PaymentsPage() {
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
      render: (row: Payment) => (
        <div>
          <p className="font-semibold text-text-primary">{row.customer?.name}</p>
          <p className="text-xs text-text-secondary">{row.customer?.email}</p>
        </div>
      ),
    },
    {
      key: "invoice",
      header: "Allocated Invoice",
      render: (row: Payment) => (
        <span className="font-mono text-xs font-semibold">
          {row.invoice?.invoice_number || row.invoice_id}
        </span>
      ),
    },
    {
      key: "payment_method",
      header: "Method",
      render: (row: Payment) => (
        <span className="text-xs font-medium text-slate-700">
          {row.payment_method}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount Allocated",
      render: (row: Payment) => (
        <MoneyDisplay amount={row.amount} variant="positive" />
      ),
    },
    {
      key: "payment_date",
      header: "Received Date",
      render: (row: Payment) => <DateDisplay date={row.payment_date} />,
    },
    {
      key: "note",
      header: "Audit Note / UTR",
      render: (row: Payment) => (
        <span className="text-xs text-text-secondary font-mono">{row.note}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Transactions"
        description="Manual payment entries allocated to invoices with transactional balance reconciliation."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("Payment allocation form")}
          >
            Record Payment
          </Button>
        }
      />

      <DataTable columns={columns} data={payments} />
    </div>
  );
}
