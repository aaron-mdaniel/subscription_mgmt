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

export default function StaffQuotationsPage() {
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
      key: "valid_until",
      header: "Valid Until",
      render: (row: Quotation) => <DateDisplay date={row.valid_until} />,
    },
    {
      key: "total",
      header: "Grand Total",
      render: (row: Quotation) => <MoneyDisplay amount={row.total} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row: Quotation) => <StatusBadge status={row.status} />,
    },
    {
      key: "action",
      header: "Workflow Action",
      render: (row: Quotation) =>
        row.status === "draft" ? (
          <Button
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => alert(`Converting quote ${row.quotation_number}...`)}
          >
            Convert to Subscription
          </Button>
        ) : (
          <span className="text-xs text-text-muted">Converted</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quotation Management"
        description="Draft quotes from standardized templates and convert accepted proposals into live subscriptions."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("Create quotation form")}
          >
            New Quotation
          </Button>
        }
      />
      <DataTable columns={columns} data={quotations} />
    </div>
  );
}
