"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { mockQuotations } from "@/lib/mock-data";
import { Quotation } from "@/types/domain";
import { Plus, ArrowRight } from "lucide-react";

export default function QuotationsPage() {
  const [quotations] = useState<Quotation[]>(mockQuotations);

  const columns = [
    {
      key: "quotation_number",
      header: "Quotation #",
      render: (row: Quotation) => (
        <span className="font-semibold text-brand">
          {row.quotation_number}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: Quotation) => <span>{row.customer?.name}</span>,
    },
    {
      key: "quotation_date",
      header: "Date Issued",
      render: (row: Quotation) => <DateDisplay date={row.quotation_date} />,
    },
    {
      key: "valid_until",
      header: "Valid Until",
      render: (row: Quotation) => <DateDisplay date={row.valid_until} />,
    },
    {
      key: "subtotal",
      header: "Subtotal",
      render: (row: Quotation) => <MoneyDisplay amount={row.subtotal} />,
    },
    {
      key: "total",
      header: "Total (Taxes Incl.)",
      render: (row: Quotation) => (
        <MoneyDisplay amount={row.total} variant="positive" />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Quotation) => <StatusBadge status={row.status} />,
    },
    {
      key: "action",
      header: "Actions",
      render: (row: Quotation) =>
        row.status === "draft" ? (
          <Button
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => alert(`Converting Quotation ${row.quotation_number} to Confirmed Subscription...`)}
          >
            Convert
          </Button>
        ) : (
          <span className="text-xs text-text-muted">Converted</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales Quotations"
        description="Standardized quotation templates, line-item pricing snapshots, and conversion to confirmed subscriptions."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("New quotation modal")}
          >
            Create Quotation
          </Button>
        }
      />

      <DataTable columns={columns} data={quotations} />
    </div>
  );
}
