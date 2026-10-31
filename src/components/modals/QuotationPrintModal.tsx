"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Quotation } from "@/types/domain";
import { X, Printer, Building2, CheckCircle2 } from "lucide-react";

interface QuotationPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
}

export const QuotationPrintModal: React.FC<QuotationPrintModalProps> = ({
  isOpen,
  onClose,
  quotation,
}) => {
  if (!isOpen || !quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-card shadow-2xl border border-border p-8 relative max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">
              Document Preview: {quotation.quotation_number}
            </span>
            <StatusBadge status={quotation.status} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary p-1.5 rounded-control hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Document */}
        <div className="space-y-6 text-slate-900">
          {/* Company & Quotation Title Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  BL
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  BrightLoop Software Studio
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                BrightLoop Technologies Pvt Ltd &bull; Infopark Kochi, Kerala, India<br />
                support@brightloop.in &bull; GSTIN: 32AABCB1234D1Z5
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                Commercial Quotation
              </span>
              <p className="text-lg font-black text-slate-900 font-mono">
                {quotation.quotation_number}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue Date: <DateDisplay date={quotation.quotation_date} />
              </p>
              <p className="text-xs font-semibold text-rose-700 mt-0.5">
                Valid Until: <DateDisplay date={quotation.valid_until} />
              </p>
            </div>
          </div>

          {/* Customer / Client Info */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Client / Bill To:
              </p>
              <p className="font-bold text-sm text-slate-900">{quotation.customer?.name}</p>
              <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                Account Code: {quotation.customer?.customer_code}
              </p>
              <p className="text-slate-600 mt-0.5">{quotation.customer?.email}</p>
            </div>

            <div className="text-right sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Billing Address & Terms:
              </p>
              <p className="text-slate-700 leading-relaxed">
                {quotation.customer?.address || "Infopark Campus, Kochi, Kerala"}
              </p>
              <p className="text-slate-500 mt-1">
                Payment Terms: <strong>Due upon invoice confirmation</strong>
              </p>
            </div>
          </div>

          {/* Quotation Line Items Table */}
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description / Product & Variant</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">GST (18%)</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(quotation.lines || []).map((line, idx) => (
                  <tr key={line.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800">{line.description_snapshot}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">{line.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      <MoneyDisplay amount={line.unit_price} />
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      <MoneyDisplay amount={line.line_tax} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      <MoneyDisplay amount={line.line_total} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Box */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-xs text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Commercial Notes:</p>
              <p className="leading-relaxed">
                {quotation.notes ||
                  "Standard 30-day validity. Prices exclude custom hardware or external infrastructure fees. Conversion into an active subscription confirms acceptance of these terms."}
              </p>
            </div>

            <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net):</span>
                <span className="font-semibold"><MoneyDisplay amount={quotation.subtotal} /></span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax Total (GST 18%):</span>
                <span className="font-semibold"><MoneyDisplay amount={quotation.tax_total} /></span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-indigo-600">
                  <MoneyDisplay amount={quotation.total} variant="positive" />
                </span>
              </div>
            </div>
          </div>

          {/* Signature & Acceptance Block */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700 mb-10">Authorized Signatory (BrightLoop)</p>
              <div className="w-48 border-b border-slate-400 pb-1 font-mono text-[11px] text-slate-600">
                Arjun Sree &bull; Subscription Operations
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-700 mb-10">Client Acceptance Signature</p>
              <div className="w-48 ml-auto border-b border-slate-400 pb-1 font-mono text-[11px] text-slate-400">
                Name, Title & Date
              </div>
            </div>
          </div>
        </div>

        {/* Footer in Modal */}
        <div className="mt-8 pt-4 border-t border-border flex justify-end gap-3 print:hidden">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            Print Quotation
          </Button>
        </div>
      </div>
    </div>
  );
};
