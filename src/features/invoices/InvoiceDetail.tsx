'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Invoice } from '@/types/finance';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { DateDisplay } from '@/components/ui/DateDisplay';
import { isInvoiceOverdue } from '@/lib/calculations/finance';
import { confirmInvoiceAction, cancelInvoiceAction } from '@/features/invoices/actions';
import { recordPaymentAction } from '@/features/payments/actions';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  CreditCard,
  Building,
  Calendar,
  Layers,
  FileCheck,
} from 'lucide-react';

interface InvoiceDetailProps {
  initialInvoice: Invoice;
  portalMode?: boolean;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  initialInvoice,
  portalMode = false,
}) => {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Payment Recording Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(invoice.balance_due);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank_transfer' | 'credit_card' | 'upi' | 'other'>('bank_transfer');
  const [payNote, setPayNote] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const overdue = isInvoiceOverdue(invoice.due_date, invoice.balance_due, invoice.status, today);

  const handleConfirm = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await confirmInvoiceAction(invoice.id);
      if (res.success && res.data) {
        setInvoice(res.data);
        setActionMessage('Invoice successfully confirmed.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Please enter the reason for cancelling this invoice:');
    if (!reason) return;

    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await cancelInvoiceAction(invoice.id, reason);
      if (res.success && res.data) {
        setInvoice(res.data);
        setActionMessage('Invoice cancelled.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPay(true);
    try {
      const res = await recordPaymentAction({
        customer_id: invoice.customer_id,
        invoice_id: invoice.id,
        amount: Number(payAmount),
        payment_method: payMethod,
        note: payNote,
      });

      if (res.success) {
        // Refresh invoice details
        const refreshed = await (await import('@/features/invoices/actions')).getInvoiceByIdAction(invoice.id);
        if (refreshed.success) {
          setInvoice(refreshed.data);
        }
        setShowPayModal(false);
        setActionMessage('Payment recorded and applied successfully!');
      } else {
        alert(res.error.message || 'Failed to record payment');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingPay(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={portalMode ? '/my-invoices' : '/admin/invoices'}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Invoices
        </Link>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Main Invoice Sheet */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {invoice.invoice_number}
              </h1>
              <StatusBadge status={invoice.status} isOverdue={overdue} />
            </div>
            <p className="text-sm text-slate-500">
              BrightLoop Technologies Pvt Ltd • AI-Native Studio Solutions
            </p>
          </div>

          {!portalMode && (
            <div className="flex items-center space-x-3">
              {invoice.status === 'draft' && (
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Confirm Invoice
                </button>
              )}

              {invoice.status === 'confirmed' && invoice.balance_due > 0 && (
                <button
                  onClick={() => {
                    setPayAmount(invoice.balance_due);
                    setShowPayModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  Record Payment
                </button>
              )}

              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="inline-flex items-center px-3 py-2 border border-rose-300 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-slate-400" /> Billed To
            </span>
            <p className="font-semibold text-slate-900 text-base">{invoice.customer_name}</p>
            <p className="text-slate-500">{invoice.customer_email || 'Verified Customer'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Billing Dates
            </span>
            <p className="text-slate-700">
              <span className="font-medium text-slate-500">Invoice Date: </span>
              <DateDisplay date={invoice.invoice_date} />
            </p>
            <p className="text-slate-700">
              <span className="font-medium text-slate-500">Due Date: </span>
              <DateDisplay date={invoice.due_date} />
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" /> Subscription & Period
            </span>
            <p className="font-mono text-slate-800">
              {invoice.subscription_number || 'Direct Contract'}
            </p>
            {invoice.billing_period_start && invoice.billing_period_end && (
              <p className="text-xs text-slate-500 font-mono">
                {invoice.billing_period_start} → {invoice.billing_period_end}
              </p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
              <tr>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-right">Discount</th>
                <th className="px-6 py-3 text-right">Tax</th>
                <th className="px-6 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {invoice.lines?.map((line) => (
                <tr key={line.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {line.description_snapshot}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">{line.quantity}</td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    <MoneyDisplay amount={line.unit_price} />
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    <MoneyDisplay amount={line.discount_amount} />
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    <MoneyDisplay amount={line.tax_amount} />
                    <span className="text-xs text-slate-400 block">
                      ({(line.tax_rate_snapshot * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    <MoneyDisplay amount={line.line_total} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Box */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <MoneyDisplay amount={invoice.subtotal} />
            </div>

            {invoice.discount_total > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied</span>
                <span>-<MoneyDisplay amount={invoice.discount_total} /></span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Tax Total</span>
              <MoneyDisplay amount={invoice.tax_total} />
            </div>

            <div className="border-t border-slate-300 pt-3 flex justify-between font-bold text-slate-900 text-base">
              <span>Invoice Total</span>
              <MoneyDisplay amount={invoice.total} />
            </div>

            <div className="flex justify-between text-emerald-700 font-medium pt-1">
              <span>Amount Paid</span>
              <MoneyDisplay amount={invoice.amount_paid} />
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-base">
              <span className={invoice.balance_due > 0 ? 'text-red-600' : 'text-slate-900'}>
                Balance Due
              </span>
              <MoneyDisplay
                amount={invoice.balance_due}
                className={invoice.balance_due > 0 ? 'text-red-600' : 'text-slate-900'}
              />
            </div>
          </div>
        </div>

        {/* Payment History / Allocations */}
        {invoice.allocations && invoice.allocations.length > 0 && (
          <div className="border-t border-slate-200 pt-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <FileCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              Payment Allocation History
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium text-left">
                  <tr>
                    <th className="px-6 py-2.5">Allocation ID</th>
                    <th className="px-6 py-2.5">Date Allocated</th>
                    <th className="px-6 py-2.5 text-right">Amount Settled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {invoice.allocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td className="px-6 py-3 font-mono text-xs text-slate-600">{alloc.id}</td>
                      <td className="px-6 py-3">
                        <DateDisplay date={alloc.created_at} includeTime />
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-emerald-600">
                        <MoneyDisplay amount={alloc.amount_allocated} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
            <p className="text-xs text-slate-500">
              Allocating payment directly against {invoice.invoice_number}.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Amount to Pay (Remaining: ${invoice.balance_due.toFixed(2)})
                </label>
                <input
                  type="number"
                  min="0.01"
                  max={invoice.balance_due}
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="upi">UPI</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Transaction Ref / Note</label>
                <input
                  type="text"
                  placeholder="e.g. UTR / Receipt Number"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 font-medium shadow-sm"
                >
                  {isSubmittingPay ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
