"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { mockDiscounts } from "@/lib/mock-data";
import { Discount } from "@/types/domain";
import { Plus, Percent, Tag } from "lucide-react";

export default function DiscountsPage() {
  const [discounts] = useState<Discount[]>(mockDiscounts);

  const columns = [
    {
      key: "name",
      header: "Rule Name",
      render: (row: Discount) => (
        <div>
          <p className="font-semibold text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary capitalize">Scope: {row.scope_type}</p>
        </div>
      ),
    },
    {
      key: "discount_type",
      header: "Type",
      render: (row: Discount) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-brand">
          <Percent className="w-3 h-3" />
          {row.discount_type}
        </span>
      ),
    },
    {
      key: "value",
      header: "Discount Value",
      render: (row: Discount) => (
        <span className="font-mono font-bold text-emerald-600">
          {row.discount_type === "percentage" ? `${row.value}% Off` : `₹${row.value} Off`}
        </span>
      ),
    },
    {
      key: "validity",
      header: "Validity Window",
      render: (row: Discount) => (
        <span className="text-xs">
          <DateDisplay date={row.starts_at} /> &rarr; <DateDisplay date={row.ends_at} />
        </span>
      ),
    },
    {
      key: "usage",
      header: "Redemption Usage",
      render: (row: Discount) => (
        <div className="text-xs">
          <span className="font-semibold text-text-primary">{row.usage_count}</span>
          <span className="text-text-secondary"> / {row.usage_limit || "Unlimited"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Discount) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active Rule
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Promotions & Discounts"
        description="Configure fixed or percentage discounts with start/end dates, quantity thresholds, and redemption usage caps."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("Create discount rule modal")}
          >
            Create Discount Rule
          </Button>
        }
      />

      <DataTable columns={columns} data={discounts} />
    </div>
  );
}
