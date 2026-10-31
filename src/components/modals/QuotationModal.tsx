"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { subscriptionOps } from "@/lib/services/subscription-ops";
import { Customer, Product, Quotation, QuotationTemplate } from "@/types/domain";
import { X, FileText, Plus, Trash2, BookmarkCheck } from "lucide-react";

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (quotation: Quotation) => void;
  initialCustomerId?: string;
}

interface QuotationLineInput {
  productId: string;
  variantId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCustomerId,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<QuotationLineInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const custs = subscriptionOps.getCustomers();
      const prods = subscriptionOps.getProducts();
      const tpls = subscriptionOps.getQuotationTemplates();
      setCustomers(custs);
      setProducts(prods);
      setTemplates(tpls);

      const today = new Date().toISOString().split("T")[0];
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 30);
      const validUntilStr = validDate.toISOString().split("T")[0];

      setQuotationDate(today);
      setValidUntil(validUntilStr);
      setNotes("Standard 30-day validity. Prices exclude custom hardware or external infrastructure fees.");
      setSelectedTemplateId("");

      if (initialCustomerId) {
        setSelectedCustomerId(initialCustomerId);
      } else if (custs.length > 0) {
        setSelectedCustomerId(custs[0].id);
      }

      if (prods.length > 0) {
        const p = prods[0];
        const v = p.variants && p.variants.length > 0 ? p.variants[0] : null;
        const price = p.sales_price + (v ? v.price_adjustment : 0);
        setLines([
          {
            productId: p.id,
            variantId: v ? v.id : "",
            description: `${p.name} - ${v ? v.name : "Standard"}`,
            quantity: 1,
            unitPrice: price,
            taxRate: 0.18,
          },
        ]);
      }
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    if (products.length === 0) return;
    const p = products[0];
    const v = p.variants && p.variants.length > 0 ? p.variants[0] : null;
    const price = p.sales_price + (v ? v.price_adjustment : 0);

    setLines([
      ...lines,
      {
        productId: p.id,
        variantId: v ? v.id : "",
        description: `${p.name} - ${v ? v.name : "Standard"}`,
        quantity: 1,
        unitPrice: price,
        taxRate: 0.18,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const p = products.find((prod) => prod.id === newProductId);
    if (!p) return;

    const v = p.variants && p.variants.length > 0 ? p.variants[0] : null;
    const price = p.sales_price + (v ? v.price_adjustment : 0);

    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      productId: p.id,
      variantId: v ? v.id : "",
      description: `${p.name} - ${v ? v.name : "Standard"}`,
      unitPrice: price,
    };
    setLines(updated);
  };

  const handleVariantChange = (index: number, newVariantId: string) => {
    const updated = [...lines];
    const line = updated[index];
    const p = products.find((prod) => prod.id === line.productId);
    if (!p) return;

    const v = (p.variants || []).find((varItem) => varItem.id === newVariantId);
    const adjustment = v ? v.price_adjustment : 0;
    const price = p.sales_price + adjustment;

    updated[index] = {
      ...line,
      variantId: newVariantId,
      description: `${p.name} - ${v ? v.name : "Standard"}`,
      unitPrice: price,
    };
    setLines(updated);
  };

  const handleLineFieldChange = (
    index: number,
    field: "quantity" | "unitPrice",
    val: number
  ) => {
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setLines(updated);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    const newLines: QuotationLineInput[] = tpl.lines.map((tl) => {
      const p = products.find((prod) => prod.id === tl.product_id) || products[0];
      const v = p?.variants?.find((varItem) => varItem.id === tl.variant_id) || null;
      const unitPrice = (p?.sales_price || 0) + (v ? v.price_adjustment : 0);

      return {
        productId: p?.id || "",
        variantId: v ? v.id : "",
        description: `${p?.name || "Product"} - ${v ? v.name : "Standard"}`,
        quantity: tl.quantity || 1,
        unitPrice,
        taxRate: 0.18,
      };
    });

    if (newLines.length > 0) {
      setLines(newLines);
    }
    if (tpl.default_notes) {
      setNotes(tpl.default_notes);
    }
  };

  // Compute live totals
  let subtotal = 0;
  let taxTotal = 0;
  lines.forEach((l) => {
    const lineSubtotal = (l.quantity || 1) * (l.unitPrice || 0);
    const lineTax = Math.round(lineSubtotal * (l.taxRate || 0.18) * 100) / 100;
    subtotal += lineSubtotal;
    taxTotal += lineTax;
  });
  const grandTotal = Math.round((subtotal + taxTotal) * 100) / 100;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedCustomerId) errs.customer = "Please select a customer.";
    if (!validUntil) errs.validUntil = "Validity date is required.";
    if (validUntil && quotationDate && validUntil < quotationDate) {
      errs.validUntil = "Valid until date cannot precede quotation date.";
    }
    if (lines.length === 0) errs.lines = "At least one product line is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = subscriptionOps.createQuotation({
        customer_id: selectedCustomerId,
        quotation_date: quotationDate,
        valid_until: validUntil,
        notes: notes.trim() || undefined,
        lines: lines.map((l) => ({
          product_id: l.productId,
          variant_id: l.variantId || undefined,
          description_snapshot: l.description,
          quantity: Number(l.quantity) || 1,
          unit_price: Number(l.unitPrice) || 0,
          tax_rate_snapshot: Number(l.taxRate) || 0.18,
        })),
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to create quotation." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-card shadow-xl border border-border p-6 relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-brand">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Prepare Sales Quotation
              </h2>
              <p className="text-xs text-text-secondary">
                Select customer, configure items & variants, review tax breakdown
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
          {/* Quick Template Selector */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-control flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-medium shrink-0">
              <BookmarkCheck className="w-4 h-4 text-brand" />
              <span>Start from Template:</span>
            </div>
            <select
              className="flex-1 h-8 px-2.5 text-xs bg-white border border-indigo-200 rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-slate-800 cursor-pointer"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
            >
              <option value="">Custom Quotation (No Template)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <FormField label="Target Customer" required error={errors.customer}>
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
            </div>

            <FormField label="Quotation Date" required>
              <Input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
              />
            </FormField>

            <FormField label="Valid Until" required error={errors.validUntil}>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                error={errors.validUntil}
              />
            </FormField>
          </div>

          {/* Quotation Lines Table */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Quotation Line Items
                </h3>
                <p className="text-xs text-text-secondary">
                  Choose catalogue products, select variant adjustments, and specify units
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddLine}
              >
                Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {lines.map((l, idx) => {
                const currentProduct = products.find((p) => p.id === l.productId);
                const currentVariants = currentProduct?.variants || [];
                const lineTotal = (l.quantity || 1) * (l.unitPrice || 0) * (1 + (l.taxRate || 0.18));

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-control space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Product
                        </label>
                        <select
                          className="w-full h-9 px-2 text-xs bg-white border border-border rounded focus:outline-none"
                          value={l.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Base ₹{p.sales_price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Variant
                        </label>
                        <select
                          className="w-full h-9 px-2 text-xs bg-white border border-border rounded focus:outline-none"
                          value={l.variantId}
                          onChange={(e) => handleVariantChange(idx, e.target.value)}
                        >
                          {currentVariants.length > 0 ? (
                            currentVariants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} ({v.price_adjustment >= 0 ? `+₹${v.price_adjustment}` : `-₹${Math.abs(v.price_adjustment)}`})
                              </option>
                            ))
                          ) : (
                            <option value="">Standard Edition (Base)</option>
                          )}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Qty
                        </label>
                        <Input
                          type="number"
                          min="1"
                          className="h-9 text-xs"
                          value={l.quantity}
                          onChange={(e) =>
                            handleLineFieldChange(idx, "quantity", parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-4 sm:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">Total (Incl. GST)</p>
                          <p className="text-xs font-bold text-brand">
                            <MoneyDisplay amount={lineTotal} />
                          </p>
                        </div>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-slate-400 hover:text-status-danger p-1 rounded ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Tax Summary Card */}
          <div className="bg-slate-50 p-4 rounded-card border border-slate-200">
            <div className="max-w-xs ml-auto space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net Amount):</span>
                <span className="font-medium"><MoneyDisplay amount={subtotal} /></span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax Total (18%):</span>
                <span className="font-medium"><MoneyDisplay amount={taxTotal} /></span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-brand"><MoneyDisplay amount={grandTotal} variant="positive" /></span>
              </div>
            </div>
          </div>

          <FormField label="Commercial Notes & Quotation Terms">
            <Input
              placeholder="Payment terms, delivery schedule, validity conditions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Generate Quotation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
