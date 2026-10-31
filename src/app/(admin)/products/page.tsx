"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { Button } from "@/components/ui/Button";
import { ProductModal } from "@/components/modals/ProductModal";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Product } from "@/types/domain";
import { Plus, Tag, Edit } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(subscriptionOps.getProducts());
    const unsubscribe = subscriptionOps.subscribe(() => {
      setProducts(subscriptionOps.getProducts());
    });
    return unsubscribe;
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: "name",
      header: "Product Name",
      render: (row: Product) => (
        <div>
          <p className="font-semibold text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary">{row.description || "No description provided"}</p>
        </div>
      ),
    },
    {
      key: "product_type",
      header: "Category",
      render: (row: Product) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
          <Tag className="w-3 h-3 text-slate-500" />
          {row.product_type}
        </span>
      ),
    },
    {
      key: "sales_price",
      header: "Base Sales Price",
      render: (row: Product) => <MoneyDisplay amount={row.sales_price} />,
    },
    {
      key: "cost_price",
      header: "Cost Price (COGS)",
      render: (row: Product) => (
        <MoneyDisplay amount={row.cost_price} variant="muted" />
      ),
    },
    {
      key: "variants",
      header: "Configured Variants & Price Deltas",
      render: (row: Product) => (
        <div className="space-y-1">
          {row.variants && row.variants.length > 0 ? (
            row.variants.map((v) => (
              <div key={v.id} className="text-xs flex items-center gap-2">
                <span className="font-medium text-slate-700">{v.name}:</span>
                <span className={v.price_adjustment > 0 ? "text-indigo-600 font-bold" : "text-slate-500"}>
                  {v.price_adjustment > 0
                    ? `+₹${v.price_adjustment}`
                    : v.price_adjustment < 0
                    ? `-₹${Math.abs(v.price_adjustment)}`
                    : "Base"}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-text-muted">Standard Only</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Product) => (
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
        title="Product & Variant Catalogue"
        description="Configure software services, modular add-ons, and pricing tier variants."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={handleOpenAdd}
          >
            New Product
          </Button>
        }
      />

      <DataTable columns={columns} data={products} />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSuccess={() => {
          setProducts(subscriptionOps.getProducts());
        }}
      />
    </div>
  );
}
