"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { CustomerModal } from "@/components/modals/CustomerModal";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Customer } from "@/types/domain";
import { Plus, Building, Edit } from "lucide-react";

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(subscriptionOps.getCustomers());
    const unsubscribe = subscriptionOps.subscribe(() => {
      setCustomers(subscriptionOps.getCustomers());
    });
    return unsubscribe;
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

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
            <p className="text-xs text-text-secondary">{row.address || "No address provided"}</p>
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
    {
      key: "actions",
      header: "Actions",
      render: (row: Customer) => (
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<Edit className="w-3.5 h-3.5" />}
          onClick={() => handleOpenEdit(row)}
        >
          Edit
        </Button>
      ),
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
            onClick={handleOpenAdd}
          >
            Add Customer
          </Button>
        }
      />
      <DataTable columns={columns} data={customers} />

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
        onSuccess={() => {
          setCustomers(subscriptionOps.getCustomers());
        }}
      />
    </div>
  );
}
