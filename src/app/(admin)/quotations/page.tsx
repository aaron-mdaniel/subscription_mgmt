"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QuotationModal } from "@/components/modals/QuotationModal";
import { QuotationPrintModal } from "@/components/modals/QuotationPrintModal";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Quotation } from "@/types/domain";
import { Plus, ArrowRight, CheckCircle2, Search, Printer, FileText } from "lucide-react";
import Link from "next/link";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "converted">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [convertTarget, setConvertTarget] = useState<Quotation | null>(null);
  const [printTarget, setPrintTarget] = useState<Quotation | null>(null);
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

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
      (q.customer?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (q.customer?.customer_code || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "converted" ? q.status === "converted" : q.status !== "converted";

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "quotation_number",
      header: "Quotation #",
      render: (row: Quotation) => (
        <span
          className="font-semibold text-brand hover:underline cursor-pointer flex items-center gap-1.5"
          onClick={() => setPrintTarget(row)}
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
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
      render: (row: Quotation) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2 text-slate-600 hover:text-slate-900"
            leftIcon={<Printer className="w-3 h-3" />}
            onClick={() => setPrintTarget(row)}
          >
            Print
          </Button>

          {row.status !== "converted" ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2"
              rightIcon={<ArrowRight className="w-3 h-3" />}
              onClick={() => setConvertTarget(row)}
            >
              Convert
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              Converted
            </span>
          )}
        </div>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Quotes ({quotations.length})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "draft"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Active / Draft ({quotations.filter((q) => q.status !== "converted").length})
          </button>
          <button
            onClick={() => setStatusFilter("converted")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "converted"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Converted ({quotations.filter((q) => q.status === "converted").length})
          </button>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
          <Input
            placeholder="Search quotation or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      <QuotationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setQuotations(subscriptionOps.getQuotations());
        }}
      />

      <QuotationPrintModal
        isOpen={!!printTarget}
        onClose={() => setPrintTarget(null)}
        quotation={printTarget}
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
