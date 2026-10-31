"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { mockSubscriptions } from "@/lib/mock-data";
import { Subscription } from "@/types/domain";

export default function StaffSubscriptionsPage() {
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
      render: (row: Subscription) => <span>{row.customer?.name}</span>,
    },
    {
      key: "plan",
      header: "Plan",
      render: (row: Subscription) => <span>{row.plan?.name}</span>,
    },
    {
      key: "period",
      header: "Active Period",
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
      header: "Status",
      render: (row: Subscription) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Monitor active recurring subscriptions and operational lifecycles."
      />
      <DataTable columns={columns} data={subscriptions} />
    </div>
  );
}
