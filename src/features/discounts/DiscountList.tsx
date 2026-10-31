'use client';

import React, { useState } from 'react';
import { Discount } from '@/types/finance';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { DateDisplay } from '@/components/ui/DateDisplay';
import { createDiscountAction } from '@/features/discounts/actions';
import { Tag, Plus, CheckCircle, Percent, DollarSign, Calendar } from 'lucide-react';

interface DiscountListProps {
  initialDiscounts: Discount[];
}

export const DiscountList: React.FC<DiscountListProps> = ({ initialDiscounts }) => {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [codeName, setCodeName] = useState('');
  const [discType, setDiscType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState<number | ''>(500);
  const [usageLimit, setUsageLimit] = useState<number | ''>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createDiscountAction({
        name: codeName,
        discount_type: discType,
        value: Number(value),
        minimum_purchase: minPurchase !== '' ? Number(minPurchase) : null,
        usage_limit: usageLimit !== '' ? Number(usageLimit) : null,
        scope_type: 'subscription',
        is_active: true,
      });

      if (res.success) {
        setDiscounts([res.data, ...discounts]);
        setShowModal(false);
        setCodeName('');
      } else {
        alert(res.error.message || 'Failed to create discount');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discounts & Promotions</h1>
          <p className="text-sm text-slate-500">
            Configure promotional codes, percentage discounts, and eligibility constraints
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Discount
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-3.5">Discount Code</th>
                <th className="px-6 py-3.5">Type & Value</th>
                <th className="px-6 py-3.5">Min Purchase</th>
                <th className="px-6 py-3.5">Usage Count / Limit</th>
                <th className="px-6 py-3.5">Scope</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                    <span className="inline-flex items-center bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                      <Tag className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                      {d.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {d.discount_type === 'percentage' ? (
                      <span className="inline-flex items-center text-blue-700">
                        <Percent className="w-3.5 h-3.5 mr-1" /> {d.value}% Off
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-emerald-700">
                        <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                        <MoneyDisplay amount={d.value} /> Flat Off
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {d.minimum_purchase != null ? (
                      <MoneyDisplay amount={d.minimum_purchase} />
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-mono text-xs">
                    {d.usage_count} / {d.usage_limit ?? '∞'} uses
                  </td>
                  <td className="px-6 py-4 capitalize text-slate-600">{d.scope_type}</td>
                  <td className="px-6 py-4">
                    {d.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Create New Discount</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Coupon / Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Discount Type</label>
                  <select
                    value={discType}
                    onChange={(e) => setDiscType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Value</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Min Purchase ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Optional"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 font-medium shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
