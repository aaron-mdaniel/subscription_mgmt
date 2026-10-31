"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { SubscriptionModal } from "@/components/modals/SubscriptionModal";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Subscription, SubscriptionStatus } from "@/types/domain";
import { Plus, Eye, Play, CheckCircle, ShieldAlert } from "lucide-react";

export default function StaffSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  useEffect(() => {
    setSubscriptions(subscriptionOps.getSubscriptions());
    const unsubscribe = subscriptionOps.subscribe(() => {
      setSubscriptions(subscriptionOps.getSubscriptions());
    });
    return unsubscribe;
  }, []);

  const handleOpenCreate = () => {
    setSelectedSub(null);
    setIsModalOpen(true);
  };

  const handleInspect = (sub: Subscription) => {
    setSelectedSub(sub);
    setIsModalOpen(true);
  };

  const handleQuickTransition = (sub: Subscription, nextStatus: SubscriptionStatus) => {
    try {
      subscriptionOps.transitionSubscription(sub.id, nextStatus);
    } catch (err: any) {
      alert(err.message || "Failed to update subscription status.");
    }
  };

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
          <p className="font-medium text-text-primary">{row.plan?.name || "Custom Plan"}</p>
          <p className="text-xs text-text-secondary">Terms: {row.payment_terms || "Standard"}</p>
        </div>
      ),
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
        <span className="font-semibold text-slate-800">
          <DateDisplay date={row.next_billing_date} />
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Subscription) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Subscription) => (
        <div className="flex items-center gap-1.5">
          {row.status === "confirmed" && (
            <Button
              size="sm"
              variant="primary"
              className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700"
              leftIcon={<Play className="w-3 h-3" />}
              onClick={() => handleQuickTransition(row, "active")}
            >
              Activate
            </Button>
          )}

          {row.status === "draft" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px] px-2.5"
              leftIcon={<CheckCircle className="w-3 h-3" />}
              onClick={() => handleQuickTransition(row, "confirmed")}
            >
              Confirm
            </Button>
          )}

          {row.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px] px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
              leftIcon={<ShieldAlert className="w-3 h-3" />}
              onClick={() => handleQuickTransition(row, "closed")}
            >
              Close
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[11px] px-2 text-slate-500"
            leftIcon={<Eye className="w-3 h-3" />}
            onClick={() => handleInspect(row)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Monitor active recurring subscriptions and operational lifecycles."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={handleOpenCreate}
          >
            New Subscription
          </Button>
        }
      />
      <DataTable columns={columns} data={subscriptions} />

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscription={selectedSub}
        onSuccess={() => {
          setSubscriptions(subscriptionOps.getSubscriptions());
        }}
      />
    </div>
  );
}
