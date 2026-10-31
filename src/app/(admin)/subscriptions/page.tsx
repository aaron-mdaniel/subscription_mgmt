"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { mockSubscriptions } from "@/lib/mock-data";
import { Subscription } from "@/types/domain";
import { Plus } from "lucide-react";

export default function SubscriptionsPage() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);

  const columns = [
    {
      key: "subscription_number",
      header: "Subscription #",
      render: (row: Subscription) => (
        <span className="font-semibold text-brand">
          {row.subscription_number}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: Subscription) => (
        <div>
          <p className="font-semibold text-text-primary">{row.customer?.name}</p>
          <p className="text-xs text-text-secondary">{row.customer?.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan & Terms",
      render: (row: Subscription) => (
        <div>
          <p className="font-medium text-text-primary">{row.plan?.name}</p>
          <p className="text-xs text-text-secondary">Terms: {row.payment_terms || "Standard"}</p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Coverage Window",
      render: (row: Subscription) => (
        <span className="text-xs">
          <DateDisplay date={row.start_date} /> &rarr;{" "}
          <DateDisplay date={row.expiry_date} />
        </span>
      ),
    },
    {
      key: "next_billing_date",
      header: "Next Billing",
      render: (row: Subscription) => (
        <DateDisplay date={row.next_billing_date} />
      ),
    },
    {
      key: "status",
      header: "Lifecycle State",
      render: (row: Subscription) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subscription Registry"
        description="Active recurring commitments following the verified state machine: Draft → Quotation → Confirmed → Active → Closed."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("New subscription dialog")}
          >
            New Subscription
          </Button>
        }
      />

      <DataTable columns={columns} data={subscriptions} />
    </div>
  );
}
