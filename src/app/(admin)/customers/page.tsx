"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomerModal } from "@/components/modals/CustomerModal";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Customer } from "@/types/domain";
import { Plus, Search, Building, Edit } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(subscriptionOps.getCustomers());
    const unsubscribe = subscriptionOps.subscribe(() => {
      setCustomers(subscriptionOps.getCustomers());
    });
    return unsubscribe;
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_code.toLowerCase().includes(search.toLowerCase())
  );

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
      header: "Customer Code",
      render: (row: Customer) => (
        <span className="font-mono text-xs font-bold text-brand">
          {row.customer_code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Business Name",
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
      header: "Billing Email",
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
      header: "Registered",
      render: (row: Customer) => <DateDisplay date={row.created_at} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row: Customer) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active Account
        </span>
      ),
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
        title="Customer Directory"
        description="Manage business accounts, contact details, and customer billing profiles."
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

      <div className="mb-4 max-w-sm relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
        <Input
          placeholder="Search by code, company, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable columns={columns} data={filtered} />

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
