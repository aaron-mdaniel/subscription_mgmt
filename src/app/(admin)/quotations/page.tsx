"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QuotationModal } from "@/components/modals/QuotationModal";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Quotation } from "@/types/domain";
import { Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [convertTarget, setConvertTarget] = useState<Quotation | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setQuotations(subscriptionOps.getQuotations());
    const unsubscribe = subscriptionOps.subscribe(() => {
      setQuotations(subscriptionOps.getQuotations());
    });
    return unsubscribe;
  }, []);

  const handleConvert = () => {
    if (!convertTarget) return;
    setIsConverting(true);
    try {
      const sub = subscriptionOps.convertQuotationToSubscription(convertTarget.id);
      setSuccessMsg(
        `Quotation ${convertTarget.quotation_number} converted into Confirmed Subscription #${sub.subscription_number}!`
      );
      setConvertTarget(null);
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      alert(err.message || "Failed to convert quotation.");
    } finally {
      setIsConverting(false);
    }
  };

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
      render: (row: Quotation) => (
        <div>
          <p className="font-semibold text-text-primary">{row.customer?.name}</p>
          <p className="text-xs text-text-secondary">{row.customer?.customer_code}</p>
        </div>
      ),
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
        row.status !== "converted" ? (
          <Button
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => setConvertTarget(row)}
          >
            Convert to Sub
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Converted
          </span>
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
            onClick={() => setIsCreateOpen(true)}
          >
            Create Quotation
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-control flex items-center justify-between text-xs text-emerald-800">
          <span>{successMsg}</span>
          <Link
            href="/subscriptions"
            className="font-bold underline text-emerald-900 ml-3 hover:text-emerald-950"
          >
            View Subscriptions &rarr;
          </Link>
        </div>
      )}

      <DataTable columns={columns} data={quotations} />

      <QuotationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setQuotations(subscriptionOps.getQuotations());
        }}
      />

      <ConfirmDialog
        isOpen={!!convertTarget}
        title={`Convert Quotation ${convertTarget?.quotation_number}?`}
        message={`This deliberate action will convert the accepted quotation for ${convertTarget?.customer?.name} into a Confirmed Subscription, locking in all line item pricing snapshots and establishing billing terms.`}
        confirmLabel="Convert to Subscription"
        isLoading={isConverting}
        onConfirm={handleConvert}
        onCancel={() => setConvertTarget(null)}
      />
    </div>
  );
}
