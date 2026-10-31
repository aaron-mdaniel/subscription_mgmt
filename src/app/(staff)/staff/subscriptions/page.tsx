"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SubscriptionModal } from "@/components/modals/SubscriptionModal";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Subscription, SubscriptionStatus } from "@/types/domain";
import { Plus, Eye, Play, CheckCircle, ShieldAlert, Search } from "lucide-react";

export default function StaffSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "confirmed" | "closed">("all");
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

  const filtered = subscriptions.filter((s) => {
    const matchesSearch =
      s.subscription_number.toLowerCase().includes(search.toLowerCase()) ||
      (s.customer?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.customer?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.plan?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "paused"
        ? s.is_paused
        : statusFilter === "active"
        ? s.status === "active" && !s.is_paused
        : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "subscription_number",
      header: "Subscription #",
      render: (row: Subscription) => (
        <span
          className="font-semibold text-brand hover:underline cursor-pointer"
          onClick={() => handleInspect(row)}
        >
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
          {row.is_paused ? (
            <span className="text-amber-700 italic text-xs">Suspended (Paused)</span>
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
            <>
              {row.is_paused ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] px-2 text-amber-800 border-amber-300 hover:bg-amber-50"
                  onClick={() => subscriptionOps.resumeSubscription(row.id)}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] px-2 text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => subscriptionOps.pauseSubscription(row.id)}
                >
                  Pause
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                leftIcon={<ShieldAlert className="w-3 h-3" />}
                onClick={() => handleQuickTransition(row, "closed")}
              >
                Close
              </Button>
            </>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Active ({subscriptions.filter((s) => s.status === "active" && !s.is_paused).length})
          </button>
          <button
            onClick={() => setStatusFilter("paused")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "paused"
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Paused ({subscriptions.filter((s) => s.is_paused).length})
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "confirmed"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Confirmed ({subscriptions.filter((s) => s.status === "confirmed").length})
          </button>
          <button
            onClick={() => setStatusFilter("closed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "closed"
                ? "bg-slate-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Closed ({subscriptions.filter((s) => s.status === "closed").length})
          </button>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
          <Input
            placeholder="Search sub #, customer, plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

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
