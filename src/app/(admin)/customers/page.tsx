"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomerModal } from "@/components/modals/CustomerModal";
import { QuotationModal } from "@/components/modals/QuotationModal";
import { CustomerDrawer } from "@/components/drawers/CustomerDrawer";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Customer } from "@/types/domain";
import { Plus, Search, Building, Edit, Eye } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationCustomerId, setQuotationCustomerId] = useState<string | undefined>();

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

  const handleOpen360 = (customer: Customer) => {
    setDrawerCustomer(customer);
  };

  const handleNewQuoteFromDrawer = (customer: Customer) => {
    setQuotationCustomerId(customer.id);
    setIsQuotationModalOpen(true);
  };

  const columns = [
    {
      key: "customer_code",
      header: "Customer Code",
      render: (row: Customer) => (
        <span
          className="font-mono text-xs font-bold text-brand hover:underline cursor-pointer"
          onClick={() => handleOpen360(row)}
        >
          {row.customer_code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Business Name",
      render: (row: Customer) => (
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleOpen360(row)}
        >
          <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-brand transition-colors">
            <Building className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-text-primary group-hover:text-brand transition-colors">
              {row.name}
            </p>
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
      render: () => (
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
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2"
            leftIcon={<Eye className="w-3 h-3 text-brand" />}
            onClick={() => handleOpen360(row)}
          >
            360° View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2"
            leftIcon={<Edit className="w-3 h-3" />}
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </Button>
        </div>
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

      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
        onSuccess={() => {
          setCustomers(subscriptionOps.getCustomers());
        }}
      />

      {/* Customer 360 Inspection Drawer */}
      <CustomerDrawer
        isOpen={!!drawerCustomer}
        onClose={() => setDrawerCustomer(null)}
        customer={drawerCustomer}
        onEditCustomer={(cust) => {
          setDrawerCustomer(null);
          handleOpenEdit(cust);
        }}
        onNewQuotationForCustomer={handleNewQuoteFromDrawer}
      />

      {/* Quick Quotation Modal triggered from Drawer */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        initialCustomerId={quotationCustomerId}
        onSuccess={() => {
          setCustomers(subscriptionOps.getCustomers());
        }}
      />
    </div>
  );
}
