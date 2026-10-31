'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Invoice } from '@/types/finance';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { DateDisplay } from '@/components/ui/DateDisplay';
import { isInvoiceOverdue } from '@/lib/calculations/finance';
import { runBillingAction, createInvoiceAction } from '@/features/invoices/actions';
import { RefreshCw, Plus, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InvoiceListProps {
  initialInvoices: Invoice[];
  portalMode?: boolean; // When true, customer portal view (scoped, no admin actions)
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  initialInvoices,
  portalMode = false,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingNotification, setBillingNotification] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating a new invoice manually
  const [newCustomer, setNewCustomer] = useState('Acme Enterprise Ltd');
  const [newDesc, setNewDesc] = useState('BrightLoop Dev Consulting Services');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(2500);
  const [newTaxRate, setNewTaxRate] = useState(0.18);
  const [isCreating, setIsCreating] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = inv.invoice_number.toLowerCase().includes(q);
      const matchCust = inv.customer_name?.toLowerCase().includes(q);
      if (!matchNum && !matchCust) return false;
    }
    return true;
  });

  const handleRunBilling = async () => {
    setIsBillingLoading(true);
    setBillingNotification(null);
    try {
      const res = await (await import('@/features/billing/actions')).runBillingAction();
      if (res.success && res.data) {
        setBillingNotification(
          `Billing executed: ${res.data.invoices_created} invoices generated, ${res.data.invoices_skipped_existing} skipped (idempotent / duplicate-safe).`
        );
        // Refresh invoices list
        const refreshed = await (await import('@/features/invoices/actions')).getInvoicesAction();
        if (refreshed.success) {
          setInvoices(refreshed.data);
        }
      }
    } catch (err: any) {
      setBillingNotification(`Error: ${err.message}`);
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await createInvoiceAction({
        customer_id: 'cust-manual',
        invoice_date: today,
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: 'Manual invoice created via Admin Portal',
        lines: [
          {
            description_snapshot: newDesc,
            quantity: Number(newQty),
            unit_price: Number(newPrice),
            tax_rate_snapshot: Number(newTaxRate),
          },
        ],
      });

      if (res.success && res.data) {
        setInvoices([res.data, ...invoices]);
        setShowCreateModal(false);
      }
    } catch (err: any) {
      alert(`Error creating invoice: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {portalMode ? 'My Invoices' : 'Invoices & Billing'}
          </h1>
          <p className="text-sm text-slate-500">
            {portalMode
              ? 'View and monitor your subscription billing history and payments'
              : 'Manage recurring billing, track outstanding balances, and invoice lifecycles'}
          </p>
        </div>

        {!portalMode && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunBilling}
              disabled={isBillingLoading}
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isBillingLoading ? 'animate-spin' : ''}`} />
              Run Billing
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Invoice
            </button>
          </div>
        )}
      </div>

      {/* Notification Banner */}
      {billingNotification && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{billingNotification}</span>
          </div>
          <button
            onClick={() => setBillingNotification(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or customer..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold uppercase text-slate-400 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1" /> Status:
          </span>
          {['all', 'draft', 'confirmed', 'paid', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                {!portalMode && <th className="px-6 py-3.5">Customer</th>}
                <th className="px-6 py-3.5">Invoice Date</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Total</th>
                <th className="px-6 py-3.5 text-right">Paid</th>
                <th className="px-6 py-3.5 text-right">Balance Due</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={portalMode ? 8 : 9} className="px-6 py-12 text-center text-slate-400">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const overdue = isInvoiceOverdue(inv.due_date, inv.balance_due, inv.status, today);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-indigo-600">
                        <Link href={`/admin/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      {!portalMode && (
                        <td className="px-6 py-4 font-medium text-slate-900">{inv.customer_name}</td>
                      )}
                      <td className="px-6 py-4">
                        <DateDisplay date={inv.invoice_date} />
                      </td>
                      <td className="px-6 py-4">
                        <DateDisplay date={inv.due_date} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} isOverdue={overdue} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        <MoneyDisplay amount={inv.total} />
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                        <MoneyDisplay amount={inv.amount_paid} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <MoneyDisplay
                          amount={inv.balance_due}
                          className={inv.balance_due > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/invoices/${inv.id}`}
                          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-900 hover:underline"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Create New Invoice</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tax Rate</label>
                  <select
                    value={newTaxRate}
                    onChange={(e) => setNewTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={0.18}>18% GST</option>
                    <option value={0.10}>10% VAT</option>
                    <option value={0.00}>0% Exempt</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 font-medium shadow-sm"
                >
                  {isCreating ? 'Saving...' : 'Save Draft Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
