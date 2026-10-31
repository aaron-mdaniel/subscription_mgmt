"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Subscription } from "@/types/domain";

export default function CustomerSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const currentCustomerId = "cust-001"; // Acme Cloud Technologies demo profile

  useEffect(() => {
    const loadData = () => {
      const all = subscriptionOps.getSubscriptions();
      setSubscriptions(all.filter((s) => s.customer_id === currentCustomerId));
    };
    loadData();
    const unsubscribe = subscriptionOps.subscribe(loadData);
    return unsubscribe;
  }, []);

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
      key: "plan",
      header: "Service Plan",
      render: (row: Subscription) => (
        <div>
          <p className="font-semibold text-text-primary">{row.plan?.name || "Service Plan"}</p>
          <p className="text-xs text-text-secondary capitalize">
            Recurrence: {row.plan?.frequency || "Monthly"}
          </p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Active Contract Period",
      render: (row: Subscription) => (
        <span className="text-xs">
          <DateDisplay date={row.start_date} /> &rarr;{" "}
          <DateDisplay date={row.expiry_date} />
        </span>
      ),
    },
    {
      key: "next_billing_date",
      header: "Next Scheduled Renewal",
      render: (row: Subscription) => (
        <span className="font-medium text-slate-800">
          {row.is_paused ? (
            <span className="text-amber-700 italic">Paused (Billing Suspended)</span>
          ) : (
            <DateDisplay date={row.next_billing_date} />
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Subscription) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={row.status} />
          {row.is_paused && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Paused
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Subscriptions"
        description="Active recurring commitments and scheduled renewals under your BrightLoop account."
      />
      <DataTable columns={columns} data={subscriptions} />
    </div>
  );
}
