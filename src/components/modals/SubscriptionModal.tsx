"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Customer, Plan, Product, Subscription, SubscriptionStatus } from "@/types/domain";
import { X, Layers, CheckCircle, Play, ShieldAlert, ArrowRight } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subscription: Subscription) => void;
  subscription?: Subscription | null; // If viewing/transitioning an existing one
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subscription,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Creation state
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const custs = subscriptionOps.getCustomers();
      const plns = subscriptionOps.getPlans();
      const prods = subscriptionOps.getProducts();

      setCustomers(custs);
      setPlans(plns);
      setProducts(prods);

      if (subscription) {
        // Viewing mode
      } else {
        // Creation mode
        const today = new Date().toISOString().split("T")[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const nextYearStr = nextYear.toISOString().split("T")[0];

        setStartDate(today);
        setExpiryDate(nextYearStr);
        setPaymentTerms("Net 30 Days");

        if (custs.length > 0) setSelectedCustomerId(custs[0].id);
        if (plns.length > 0) setSelectedPlanId(plns[0].id);
      }
      setErrors({});
    }
  }, [isOpen, subscription]);

  if (!isOpen) return null;

  // Lifecycle transition handler for existing subscription
  const handleTransition = (nextStatus: SubscriptionStatus) => {
    if (!subscription) return;
    setIsSubmitting(true);
    try {
      const updated = subscriptionOps.transitionSubscription(subscription.id, nextStatus);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to transition subscription status." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!selectedCustomerId) errs.customer = "Customer is required.";
    if (!startDate) errs.startDate = "Start date is required.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      const defaultProduct = products.length > 0 ? products[0] : null;

      const lines = [
        {
          product_id: defaultProduct?.id,
          plan_id: selectedPlan?.id,
          description_snapshot: `${selectedPlan?.name || "Recurring Plan"} - Core Subscription`,
          quantity: selectedPlan?.minimum_quantity || 1,
          unit_price: selectedPlan?.price || 15000,
          tax_rate_snapshot: 0.18,
        },
      ];

      const created = subscriptionOps.createSubscription({
        customer_id: selectedCustomerId,
        plan_id: selectedPlanId || undefined,
        start_date: startDate,
        expiry_date: expiryDate || undefined,
        payment_terms: paymentTerms,
        status: "confirmed",
        lines,
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to create subscription." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-card shadow-xl border border-border p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-brand">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {subscription
                  ? `Subscription #${subscription.subscription_number}`
                  : "Create Active Subscription"}
              </h2>
              <p className="text-xs text-text-secondary">
                {subscription
                  ? "Inspect commitment, manage state transitions, and review billing intervals"
                  : "Provision recurring subscription linked to catalogue plan"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-control hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 rounded text-xs bg-red-50 text-status-danger border border-red-200">
            {errors.form}
          </div>
        )}

        {/* VIEW / LIFECYCLE TRANSITION MODE */}
        {subscription ? (
          <div className="space-y-5">
            {/* Current Status Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-card flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Current Lifecycle State</p>
                <div className="mt-1">
                  <StatusBadge status={subscription.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary">Next Due Billing Date</p>
                <p className="text-sm font-semibold text-text-primary">
                  <DateDisplay date={subscription.next_billing_date} />
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Customer Account</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {subscription.customer?.name}
                </span>
                <span className="text-slate-500 block">{subscription.customer?.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Recurring Plan</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {subscription.plan?.name || "Custom Plan"}
                </span>
                <span className="text-slate-500 block capitalize">
                  Frequency: {subscription.plan?.frequency || "Monthly"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Active Period</span>
                <span className="font-medium text-slate-700">
                  <DateDisplay date={subscription.start_date} /> &rarr;{" "}
                  <DateDisplay date={subscription.expiry_date} />
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Payment Terms</span>
                <span className="font-medium text-slate-700">
                  {subscription.payment_terms || "Standard Terms"}
                </span>
              </div>
            </div>

            {/* Subscription Line Items */}
            <div className="pt-3 border-t border-border">
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">
                Preserved Line Snapshots
              </h4>
              <div className="space-y-2">
                {(subscription.lines || []).map((l, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-control border border-slate-200 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{l.description_snapshot}</p>
                      <p className="text-slate-500">
                        {l.quantity} unit(s) &times; <MoneyDisplay amount={l.unit_price} /> (+18% GST)
                      </p>
                    </div>
                    <p className="font-bold text-brand">
                      <MoneyDisplay amount={l.line_total} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* State Machine Transition Actions */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                Verified State Transitions (M3-05)
              </h4>

              <div className="flex flex-wrap items-center gap-2.5">
                {subscription.status === "draft" && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => handleTransition("confirmed")}
                      isLoading={isSubmitting}
                    >
                      Confirm Terms &rarr; Confirmed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTransition("quotation")}
                      isLoading={isSubmitting}
                    >
                      Issue as Quotation
                    </Button>
                  </>
                )}

                {subscription.status === "quotation" && (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleTransition("confirmed")}
                    isLoading={isSubmitting}
                  >
                    Accept Quotation &rarr; Confirmed
                  </Button>
                )}

                {subscription.status === "confirmed" && (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Play className="w-4 h-4" />}
                    onClick={() => handleTransition("active")}
                    isLoading={isSubmitting}
                  >
                    Activate Subscription &rarr; Active
                  </Button>
                )}

                {subscription.status === "active" && (
                  <Button
                    size="sm"
                    variant="danger"
                    leftIcon={<ShieldAlert className="w-4 h-4" />}
                    onClick={() => handleTransition("closed")}
                    isLoading={isSubmitting}
                  >
                    Close Subscription &rarr; Closed
                  </Button>
                )}

                {subscription.status === "closed" && (
                  <p className="text-xs text-text-muted italic">
                    This subscription is in terminal Closed status. No further transitions permitted.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* CREATION MODE */
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Customer" required error={errors.customer}>
                <select
                  className="w-full h-10 px-3 text-sm bg-white border border-border rounded-control focus:outline-none focus:ring-2 focus:ring-brand/40 text-text-primary"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customer_code})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Subscription Plan" required>
                <select
                  className="w-full h-10 px-3 text-sm bg-white border border-border rounded-control focus:outline-none focus:ring-2 focus:ring-brand/40 text-text-primary"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price}/{p.frequency})
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Start Date" required error={errors.startDate}>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  error={errors.startDate}
                />
              </FormField>

              <FormField label="Expiry Date">
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Payment Terms">
              <Input
                placeholder="e.g. Net 30 Days"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </FormField>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-control text-xs text-indigo-900 leading-relaxed">
              <strong>Workflow Note:</strong> Direct subscription creation establishes a commitment in <strong>Confirmed</strong> status. You can activate it to start billing runs once contract signatures or verifications are confirmed.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Create Subscription
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
