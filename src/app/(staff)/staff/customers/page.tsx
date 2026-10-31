"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { mockCustomers } from "@/lib/mock-data";
import { Customer } from "@/types/domain";
import { Plus, Building } from "lucide-react";

export default function StaffCustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);

  const columns = [
    {
      key: "customer_code",
      header: "Code",
      render: (row: Customer) => (
        <span className="font-mono text-xs font-bold text-brand">
          {row.customer_code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Customer Name",
      render: (row: Customer) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-500">
            <Building className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{row.name}</p>
            <p className="text-xs text-text-secondary">{row.address}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row: Customer) => (
        <span className="text-xs text-text-secondary">{row.email}</span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row: Customer) => (
        <span className="text-xs text-text-secondary">{row.phone || "—"}</span>
      ),
    },
    {
      key: "created_at",
      header: "Created Date",
      render: (row: Customer) => <DateDisplay date={row.created_at} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customer Management"
        description="Operational customer accounts and contact management."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("Add customer form")}
          >
            Add Customer
          </Button>
        }
      />
      <DataTable columns={columns} data={customers} />
    </div>
  );
}
