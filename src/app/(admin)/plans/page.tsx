"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { Button } from "@/components/ui/Button";
import { mockPlans } from "@/lib/mock-data";
import { Plan } from "@/types/domain";
import { Plus, Check, X } from "lucide-react";

export default function PlansPage() {
  const [plans] = useState<Plan[]>(mockPlans);

  const columns = [
    {
      key: "name",
      header: "Plan Name",
      render: (row: Plan) => (
        <div>
          <p className="font-semibold text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary">{row.description}</p>
        </div>
      ),
    },
    {
      key: "frequency",
      header: "Recurrence",
      render: (row: Plan) => (
        <span className="capitalize px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-brand">
          {row.frequency}
        </span>
      ),
    },
    {
      key: "price",
      header: "Recurring Price",
      render: (row: Plan) => <MoneyDisplay amount={row.price} />,
    },
    {
      key: "minimum_quantity",
      header: "Min Quantity",
      render: (row: Plan) => (
        <span className="font-mono text-xs">{row.minimum_quantity} unit(s)</span>
      ),
    },
    {
      key: "rules",
      header: "Plan Lifecycle Policies",
      render: (row: Plan) => (
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            {row.allow_pause ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400" />
            )}
            Pausable
          </span>
          <span className="flex items-center gap-1">
            {row.allow_early_close ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400" />
            )}
            Early Close
          </span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        description="Configure billing recurrence (daily, weekly, monthly, yearly), minimum quantities, and lifecycle rules."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("Plan configuration modal")}
          >
            Create Plan
          </Button>
        }
      />

      <DataTable columns={columns} data={plans} />
    </div>
  );
}
