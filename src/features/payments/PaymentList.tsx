'use client';

import React, { useState } from 'react';
import { Payment } from '@/types/finance';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { DateDisplay } from '@/components/ui/DateDisplay';
import { Search, CreditCard, ArrowDownRight } from 'lucide-react';

interface PaymentListProps {
  initialPayments: Payment[];
  portalMode?: boolean;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  initialPayments,
  portalMode = false,
}) => {
  const [payments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState('');

  const filtered = payments.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = p.payment_reference.toLowerCase().includes(q);
      const matchCust = p.customer_name?.toLowerCase().includes(q);
      const matchNote = p.note?.toLowerCase().includes(q);
      if (!matchRef && !matchCust && !matchNote) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {portalMode ? 'My Payment Receipts' : 'Payments & Collections'}
          </h1>
          <p className="text-sm text-slate-500">
            {portalMode
              ? 'View all completed payment receipts and transaction records'
              : 'Monitor recorded incoming customer payments and reconciliation records'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment reference or notes..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-3.5">Reference #</th>
                {!portalMode && <th className="px-6 py-3.5">Customer</th>}
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Date Received</th>
                <th className="px-6 py-3.5">Notes</th>
                <th className="px-6 py-3.5 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={portalMode ? 5 : 6} className="px-6 py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-indigo-600">
                      {p.payment_reference}
                    </td>
                    {!portalMode && (
                      <td className="px-6 py-4 font-medium text-slate-900">{p.customer_name}</td>
                    )}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        <CreditCard className="w-3 h-3 mr-1 text-slate-500" />
                        {p.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <DateDisplay date={p.payment_date} includeTime />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {p.note || '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono">
                      +<MoneyDisplay amount={p.amount} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
