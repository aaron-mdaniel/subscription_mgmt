"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Product } from "@/types/domain";
import { X, Tag, Plus, Trash2 } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
  product?: Product | null;
}

interface VariantInput {
  name: string;
  price_adjustment: number;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const [name, setName] = useState("");
  const [productType, setProductType] = useState("Software Service");
  const [description, setDescription] = useState("");
  const [salesPrice, setSalesPrice] = useState<number>(10000);
  const [costPrice, setCostPrice] = useState<number>(3000);
  const [notes, setNotes] = useState("");
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setProductType(product.product_type);
      setDescription(product.description || "");
      setSalesPrice(product.sales_price);
      setCostPrice(product.cost_price || 0);
      setNotes(product.notes || "");
      setVariants(
        (product.variants || []).map((v) => ({
          name: v.name,
          price_adjustment: v.price_adjustment,
        }))
      );
    } else {
      setName("");
      setProductType("Software Service");
      setDescription("");
      setSalesPrice(10000);
      setCostPrice(3000);
      setNotes("");
      setVariants([
        { name: "Standard Edition", price_adjustment: 0 },
        { name: "Odoo Enterprise Brand Integration", price_adjustment: 560 }, // Hackathon variant example
      ]);
    }
    setErrors({});
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", price_adjustment: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: "name" | "price_adjustment",
    value: any
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Product name is required.";
    if (!productType.trim()) errs.productType = "Product category is required.";
    if (isNaN(salesPrice) || salesPrice < 0) {
      errs.salesPrice = "Base sales price must be a non-negative number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const cleanedVariants = variants
        .filter((v) => v.name.trim() !== "")
        .map((v) => ({
          name: v.name.trim(),
          price_adjustment: Number(v.price_adjustment) || 0,
        }));

      if (product) {
        const updated = subscriptionOps.updateProduct(product.id, {
          name: name.trim(),
          product_type: productType.trim(),
          description: description.trim() || null,
          sales_price: Number(salesPrice),
          cost_price: Number(costPrice) || null,
          notes: notes.trim() || null,
        });
        onSuccess(updated);
      } else {
        const created = subscriptionOps.createProduct({
          name: name.trim(),
          product_type: productType.trim(),
          description: description.trim() || undefined,
          sales_price: Number(salesPrice),
          cost_price: Number(costPrice) || undefined,
          notes: notes.trim() || undefined,
          variants: cleanedVariants,
        });
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to save product." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-card shadow-xl border border-border p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-brand">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {product ? "Edit Product" : "Add New Catalogue Item"}
              </h2>
              <p className="text-xs text-text-secondary">
                Configure base pricing, variants, and price adjustments
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
          <FormField label="Product Name" required error={errors.name}>
            <Input
              placeholder="e.g. BrightLoop QMS (Quality Management System)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Category / Type" required error={errors.productType}>
              <select
                className="w-full h-10 px-3 text-sm bg-white border border-border rounded-control focus:outline-none focus:ring-2 focus:ring-brand/40 text-text-primary"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                <option value="Software Service">Software Service</option>
                <option value="Software Platform">Software Platform</option>
                <option value="Add-on">Modular Add-on</option>
                <option value="Development Service">Development Service</option>
              </select>
            </FormField>

            <FormField label="Base Sales Price (₹)" required error={errors.salesPrice}>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="10000"
                value={salesPrice}
                onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                error={errors.salesPrice}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Cost Price / COGS (₹)" helperText="Visible only to internal staff/admin">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="3000"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              />
            </FormField>

            <FormField label="Description">
              <Input
                placeholder="Brief product description for quotations"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>
          </div>

          {/* Product Variants Section */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Configured Variants & Price Adjustments
                </h3>
                <p className="text-xs text-text-secondary">
                  Example: Odoo brand integration adds ₹560 to base price
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddVariant}
              >
                Add Variant
              </Button>
            </div>

            <div className="space-y-2.5">
              {variants.map((v, idx) => {
                const previewPrice = Math.max(0, (salesPrice || 0) + Number(v.price_adjustment || 0));
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-control flex flex-col sm:flex-row items-center gap-3"
                  >
                    <div className="flex-1 w-full">
                      <Input
                        placeholder="Variant name (e.g. Odoo Brand Integration)"
                        value={v.name}
                        onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <Input
                        type="number"
                        placeholder="Price +/-"
                        value={v.price_adjustment}
                        onChange={(e) =>
                          handleVariantChange(idx, "price_adjustment", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="text-xs shrink-0 font-medium text-slate-600 sm:text-right">
                      Result: <span className="font-bold text-brand"><MoneyDisplay amount={previewPrice} /></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-slate-400 hover:text-status-danger p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {product ? "Update Product" : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
