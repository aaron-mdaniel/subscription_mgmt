"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { mockCustomers } from "@/lib/mock-data";
import { Building, Mail, Phone, MapPin } from "lucide-react";

export default function CustomerProfilePage() {
  const customer = mockCustomers[0];

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Customer Profile & Billing Details"
        description="Inspect and update your registered company profile and billing contact information."
      />

      <div className="bg-white border border-border rounded-card p-6 shadow-sm space-y-4">
        <FormField label="Business / Organization Name">
          <div className="relative">
            <Building className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <Input defaultValue={customer.name} className="pl-9" />
          </div>
        </FormField>

        <FormField label="Registered Billing Email">
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <Input defaultValue={customer.email} className="pl-9" disabled />
          </div>
        </FormField>

        <FormField label="Contact Phone">
          <div className="relative">
            <Phone className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <Input defaultValue={customer.phone || ""} className="pl-9" />
          </div>
        </FormField>

        <FormField label="Billing Address">
          <div className="relative">
            <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <Input defaultValue={customer.address || ""} className="pl-9" />
          </div>
        </FormField>

        <div className="pt-2">
          <Button size="sm" onClick={() => alert("Profile updated successfully")}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
