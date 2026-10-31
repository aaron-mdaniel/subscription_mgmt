"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Customer } from "@/types/domain";
import { X, Building } from "lucide-react";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  customer?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      setCustomerCode(customer.customer_code);
      setPhone(customer.phone || "");
      setAddress(customer.address || "");
      setNotes(customer.notes || "");
    } else {
      setName("");
      setEmail("");
      setCustomerCode("");
      setPhone("");
      setAddress("");
      setNotes("");
    }
    setErrors({});
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Business name is required.";
    if (!email.trim()) {
      errs.email = "Billing email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (customer) {
        const updated = subscriptionOps.updateCustomer(customer.id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          customer_code: customerCode.trim() || customer.customer_code,
          phone: phone.trim() || null,
          address: address.trim() || null,
          notes: notes.trim() || null,
        });
        onSuccess(updated);
      } else {
        const created = subscriptionOps.createCustomer({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          customer_code: customerCode.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to save customer." });
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
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {customer ? "Edit Customer Record" : "Add New Customer"}
              </h2>
              <p className="text-xs text-text-secondary">
                Commercial account profile for BrightLoop subscriptions
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
          <FormField label="Business / Company Name" required error={errors.name}>
            <Input
              placeholder="e.g. Acme Technologies Pvt Ltd"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Billing Email" required error={errors.email}>
              <Input
                type="email"
                placeholder="billing@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </FormField>

            <FormField label="Customer Code" helperText="Auto-generated if left blank">
              <Input
                placeholder="e.g. CUST-ACME-01"
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Phone Number">
              <Input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormField>

            <FormField label="Address / Location">
              <Input
                placeholder="Kochi, Kerala"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Internal Notes" helperText="Not visible on customer invoices">
            <textarea
              className="w-full px-3 py-2 text-sm border border-border rounded-control focus:outline-none focus:ring-2 focus:ring-brand/40 text-text-primary resize-none h-20"
              placeholder="Key stakeholders, service requirements, special terms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {customer ? "Update Customer" : "Save Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
