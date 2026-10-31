"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Customer, Subscription, Quotation } from "@/types/domain";
import {
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  FileText,
  Plus,
  ArrowRight,
  Play,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";

interface CustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEditCustomer?: (customer: Customer) => void;
  onNewQuotationForCustomer?: (customer: Customer) => void;
}

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  isOpen,
  onClose,
  customer,
  onEditCustomer,
  onNewQuotationForCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "quotations">("subscriptions");

  if (!isOpen || !customer) return null;

  const subscriptions = subscriptionOps.getCustomerSubscriptions(customer.id);
  const quotations = subscriptionOps.getCustomerQuotations(customer.id);

  const activeSubCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-border flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="p-6 border-b border-border bg-slate-50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-brand font-bold">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">{customer.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-brand font-semibold">
                  {customer.customer_code}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Registered: <DateDisplay date={customer.created_at} />
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-control hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact & Summary Bar */}
        <div className="px-6 py-3.5 bg-white border-b border-border grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{customer.phone || "No phone added"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 col-span-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{customer.address || "Kochi, Kerala, India"}</span>
          </div>
        </div>

        {/* Stat Highlights */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-border grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Active Subs</p>
            <p className="text-lg font-bold text-emerald-600">{activeSubCount}</p>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Total Subs</p>
            <p className="text-lg font-bold text-slate-800">{subscriptions.length}</p>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Quotations</p>
            <p className="text-lg font-bold text-brand">{quotations.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border px-6 pt-2 bg-white">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 mr-6 ${
              activeTab === "subscriptions"
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab("quotations")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "quotations"
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Quotations ({quotations.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "subscriptions" && (
            <div className="space-y-3">
              {subscriptions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No subscriptions on record for this customer.
                </div>
              ) : (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-white border border-slate-200 rounded-card shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand">
                        {sub.subscription_number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={sub.status} />
                        {sub.is_paused && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Paused
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <p className="font-semibold text-text-primary">
                        {sub.plan?.name || "Standard Subscription Plan"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Term: {sub.payment_terms || "Net 30"} &bull; Recurrence: {sub.plan?.frequency || "Monthly"}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>
                        Next Billing:{" "}
                        <strong className="text-slate-800">
                          {sub.is_paused ? "Suspended (Paused)" : <DateDisplay date={sub.next_billing_date} />}
                        </strong>
                      </span>
                      <span>
                        Period: <DateDisplay date={sub.start_date} /> &rarr; <DateDisplay date={sub.expiry_date} />
                      </span>
                    </div>

                    {/* Quick Row Actions */}
                    <div className="flex justify-end gap-1.5 pt-1">
                      {sub.status === "confirmed" && (
                        <Button
                          size="sm"
                          className="h-6 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700"
                          leftIcon={<Play className="w-2.5 h-2.5" />}
                          onClick={() => subscriptionOps.transitionSubscription(sub.id, "active")}
                        >
                          Activate
                        </Button>
                      )}
                      {sub.status === "active" && (
                        <>
                          {sub.is_paused ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2 text-amber-800 border-amber-300"
                              onClick={() => subscriptionOps.resumeSubscription(sub.id)}
                            >
                              Resume
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2 text-amber-700 border-amber-300"
                              onClick={() => subscriptionOps.pauseSubscription(sub.id)}
                            >
                              Pause
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => subscriptionOps.transitionSubscription(sub.id, "closed")}
                          >
                            Close
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "quotations" && (
            <div className="space-y-3">
              {quotations.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No quotations prepared for this customer yet.
                </div>
              ) : (
                quotations.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 bg-white border border-slate-200 rounded-card shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand text-xs">
                        {q.quotation_number}
                      </span>
                      <StatusBadge status={q.status} />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="text-slate-400 text-[11px]">Valid Until</p>
                        <p className="font-medium text-slate-700">
                          <DateDisplay date={q.valid_until} />
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-[11px]">Grand Total (Taxes Incl.)</p>
                        <p className="font-bold text-brand">
                          <MoneyDisplay amount={q.total} />
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400">
                        {q.lines?.length || 1} line item(s)
                      </span>
                      {q.status !== "converted" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          rightIcon={<ArrowRight className="w-2.5 h-2.5" />}
                          onClick={() => {
                            subscriptionOps.convertQuotationToSubscription(q.id);
                          }}
                        >
                          Convert to Sub
                        </Button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600">
                          Converted &check;
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditCustomer && onEditCustomer(customer)}
          >
            Edit Profile
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => onNewQuotationForCustomer && onNewQuotationForCustomer(customer)}
          >
            Create Quotation
          </Button>
        </div>
      </div>
    </div>
  );
};
