"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Plan, PlanFrequency } from "@/types/domain";
import { X, Calendar } from "lucide-react";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: Plan) => void;
  plan?: Plan | null;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  plan,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(15000);
  const [frequency, setFrequency] = useState<PlanFrequency>("monthly");
  const [minimumQuantity, setMinimumQuantity] = useState<number>(1);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [allowPause, setAllowPause] = useState(true);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);
  const [autoClose, setAutoClose] = useState(false);
  const [renewalRule, setRenewalRule] = useState("auto-renew");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description || "");
      setPrice(plan.price);
      setFrequency(plan.frequency);
      setMinimumQuantity(plan.minimum_quantity);
      setAvailableFrom(plan.available_from || "");
      setAvailableUntil(plan.available_until || "");
      setAllowPause(plan.allow_pause);
      setAllowEarlyClose(plan.allow_early_close);
      setAutoClose(plan.auto_close);
      setRenewalRule(plan.renewal_rule || "auto-renew");
    } else {
      setName("");
      setDescription("");
      setPrice(15000);
      setFrequency("monthly");
      setMinimumQuantity(1);
      setAvailableFrom("");
      setAvailableUntil("");
      setAllowPause(true);
      setAllowEarlyClose(true);
      setAutoClose(false);
      setRenewalRule("auto-renew");
    }
    setErrors({});
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Plan name is required.";
    if (isNaN(price) || price < 0) errs.price = "Price must be a non-negative number.";
    if (isNaN(minimumQuantity) || minimumQuantity < 1) {
      errs.minimumQuantity = "Minimum quantity must be at least 1.";
    }
    if (availableFrom && availableUntil && availableUntil < availableFrom) {
      errs.availableUntil = "Availability end date cannot be before start date.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (plan) {
        const updated = subscriptionOps.updatePlan(plan.id, {
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          frequency,
          minimum_quantity: Number(minimumQuantity),
          available_from: availableFrom || null,
          available_until: availableUntil || null,
          allow_pause: allowPause,
          allow_early_close: allowEarlyClose,
          auto_close: autoClose,
          renewal_rule: renewalRule,
        });
        onSuccess(updated);
      } else {
        const created = subscriptionOps.createPlan({
          name: name.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          frequency,
          minimum_quantity: Number(minimumQuantity),
          available_from: availableFrom || undefined,
          available_until: availableUntil || undefined,
          allow_pause: allowPause,
          allow_early_close: allowEarlyClose,
          auto_close: autoClose,
          renewal_rule: renewalRule,
        });
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to save plan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-card shadow-xl border border-border p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-brand">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {plan ? "Edit Subscription Plan" : "Create Subscription Plan"}
              </h2>
              <p className="text-xs text-text-secondary">
                Configure billing intervals, quantity thresholds, and lifecycle rules
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Plan Name" required error={errors.name}>
            <Input
              placeholder="e.g. Professional Monthly Tier"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Recurrence Frequency" required>
              <select
                className="w-full h-10 px-3 text-sm bg-white border border-border rounded-control focus:outline-none focus:ring-2 focus:ring-brand/40 text-text-primary"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PlanFrequency)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </FormField>

            <FormField label="Recurring Price (₹)" required error={errors.price}>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="15000"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                error={errors.price}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Minimum Quantity" required error={errors.minimumQuantity}>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(parseInt(e.target.value, 10) || 1)}
                error={errors.minimumQuantity}
              />
            </FormField>

            <FormField label="Renewal Rule">
              <select
                className="w-full h-10 px-3 text-sm bg-white border border-border rounded-control focus:outline-none focus:ring-2 focus:ring-brand/40 text-text-primary"
                value={renewalRule}
                onChange={(e) => setRenewalRule(e.target.value)}
              >
                <option value="auto-renew">Automatic Renewal</option>
                <option value="manual-approval">Staff Approval Required</option>
                <option value="expire-on-end">Do Not Renew (Expire)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Available From (Optional)">
              <Input
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </FormField>

            <FormField label="Available Until (Optional)" error={errors.availableUntil}>
              <Input
                type="date"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                error={errors.availableUntil}
              />
            </FormField>
          </div>

          <FormField label="Description">
            <Input
              placeholder="e.g. Standard recurring subscription plan for mid-sized teams"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          {/* Lifecycle Toggles */}
          <div className="pt-3 border-t border-border space-y-2.5">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Allowed Lifecycle Operations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-control cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={allowPause}
                  onChange={(e) => setAllowPause(e.target.checked)}
                  className="rounded text-brand focus:ring-brand"
                />
                <span className="font-medium text-slate-700">Allow Pause</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-control cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={allowEarlyClose}
                  onChange={(e) => setAllowEarlyClose(e.target.checked)}
                  className="rounded text-brand focus:ring-brand"
                />
                <span className="font-medium text-slate-700">Allow Early Close</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-control cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={autoClose}
                  onChange={(e) => setAutoClose(e.target.checked)}
                  className="rounded text-brand focus:ring-brand"
                />
                <span className="font-medium text-slate-700">Auto Close</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {plan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
