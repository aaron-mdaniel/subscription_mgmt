"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { mockCustomers, mockSubscriptions } from "@/lib/mock-data";

export default function CustomerSubscriptionsPage() {
  const currentCustomer = mockCustomers[0];
  const mySubscriptions = mockSubscriptions.filter(
    (s) => s.customer_id === currentCustomer.id
  );

  const columns = [
    {
      key: "subscription_number",
      header: "Subscription #",
      render: (row: (typeof mySubscriptions)[0]) => (
        <span className="font-semibold text-brand">
          {row.subscription_number}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Service Plan",
      render: (row: (typeof mySubscriptions)[0]) => (
        <div>
          <p className="font-semibold text-text-primary">{row.plan?.name}</p>
          <p className="text-xs text-text-secondary capitalize">
            Recurrence: {row.plan?.frequency}
          </p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Active Contract Period",
      render: (row: (typeof mySubscriptions)[0]) => (
        <span className="text-xs">
          <DateDisplay date={row.start_date} /> &rarr;{" "}
          <DateDisplay date={row.expiry_date} />
        </span>
      ),
    },
    {
      key: "next_billing_date",
      header: "Next Scheduled Renewal",
      render: (row: (typeof mySubscriptions)[0]) => (
        <DateDisplay date={row.next_billing_date} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof mySubscriptions)[0]) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Subscriptions"
        description="Inspect all active, confirmed, and past subscriptions associated with your account."
      />
      <DataTable columns={columns} data={mySubscriptions} />
    </div>
  );
}
