'use client';

import React, { useState } from 'react';
import { FinancialDashboardMetrics, RevenueReportPoint } from '@/types/finance';
import { StatCard } from '@/components/ui/StatCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { runBillingAction } from '@/features/billing/actions';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Layers,
  RefreshCw,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface FinanceDashboardProps {
  metrics: FinancialDashboardMetrics;
  revenuePoints: RevenueReportPoint[];
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  metrics: initialMetrics,
  revenuePoints,
}) => {
  const [metrics, setMetrics] = useState<FinancialDashboardMetrics>(initialMetrics);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  const handleRunBilling = async () => {
    setIsBillingLoading(true);
    setBillingResult(null);
    try {
      const res = await runBillingAction();
      if (res.success && res.data) {
        setBillingResult(
          `Billing completed: ${res.data.invoices_created} new invoices created, ${res.data.invoices_skipped_existing} skipped (duplicate prevention active).`
        );
        // Refresh metrics
        const refreshed = await (await import('@/features/reports/actions')).getDashboardSummaryAction();
        if (refreshed.success && refreshed.data) {
          setMetrics(refreshed.data);
        }
      }
    } catch (err: any) {
      setBillingResult(`Billing error: ${err.message}`);
    } finally {
      setIsBillingLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-sm text-slate-500">
            Real-time subscription collections, outstanding balances, and billing performance metrics
          </p>
        </div>

        <button
          onClick={handleRunBilling}
          disabled={isBillingLoading}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isBillingLoading ? 'animate-spin' : ''}`} />
          Run Recurring Billing
        </button>
      </div>

      {/* Billing Result Banner */}
      {billingResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{billingResult}</span>
          </div>
          <button onClick={() => setBillingResult(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Subscriptions"
          value={metrics.active_subscriptions_count}
          subtitle="Generating recurring revenue"
          icon={<Layers className="w-5 h-5 text-indigo-500" />}
          variant="default"
        />

        <StatCard
          title="Revenue Received"
          value={<MoneyDisplay amount={metrics.revenue_received} />}
          subtitle="Total settled collections"
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          variant="success"
        />

        <StatCard
          title="Total Outstanding"
          value={<MoneyDisplay amount={metrics.total_outstanding} />}
          subtitle="Unpaid confirmed invoice balance"
          icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
          variant="warning"
        />

        <StatCard
          title="Overdue Invoices"
          value={<MoneyDisplay amount={metrics.overdue_amount} />}
          subtitle={`${metrics.overdue_invoices_count} past due date`}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          variant="danger"
        />
      </div>

      {/* Revenue History Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Revenue & Invoicing Trend</h2>
            <p className="text-xs text-slate-500">Monthly progression of invoiced vs collected revenue</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-md">
            2026 Fiscal Cycle
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-left">
              <tr>
                <th className="px-6 py-3">Billing Cycle</th>
                <th className="px-6 py-3 text-right">Invoiced Amount</th>
                <th className="px-6 py-3 text-right">Collections Received</th>
                <th className="px-6 py-3 text-right">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {revenuePoints.map((pt) => {
                const rate = pt.invoiced > 0 ? ((pt.revenue / pt.invoiced) * 100).toFixed(1) : '100';
                return (
                  <tr key={pt.date} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{pt.date}</td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      <MoneyDisplay amount={pt.invoiced} />
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                      <MoneyDisplay amount={pt.revenue} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
