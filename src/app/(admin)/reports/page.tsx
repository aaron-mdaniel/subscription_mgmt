import React from 'react';
import {
  getDashboardSummaryAction,
  getRevenueReportAction,
} from '@/features/reports/actions';
import { FinanceDashboard } from '@/features/reports/FinanceDashboard';

export default async function AdminReportsPage() {
  const [metricsRes, revenueRes] = await Promise.all([
    getDashboardSummaryAction(),
    getRevenueReportAction(),
  ]);

  const metrics = metricsRes.success
    ? metricsRes.data
    : {
        active_subscriptions_count: 0,
        revenue_received: 0,
        total_outstanding: 0,
        overdue_amount: 0,
        overdue_invoices_count: 0,
        total_invoiced_period: 0,
      };

  const revenuePoints = revenueRes.success ? revenueRes.data : [];

  return <FinanceDashboard metrics={metrics} revenuePoints={revenuePoints} />;
}
