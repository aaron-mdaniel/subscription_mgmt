'use server';

// ============================================================================
// BrightLoop Subscription Management System
// Server Actions: Financial Reports & Dashboard Analytics
// Owner: Member 4 (Finance Operations Developer)
// ============================================================================

import { financeStore } from '@/lib/store/financeStore';
import { FinancialDashboardMetrics, RevenueReportPoint, ApiResponse } from '@/types/finance';

export async function getDashboardSummaryAction(): Promise<
  ApiResponse<FinancialDashboardMetrics>
> {
  try {
    const metrics = financeStore.getDashboardMetrics();
    return { success: true, data: metrics };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'METRICS_ERROR', message: err.message || 'Failed to compute dashboard metrics' },
    };
  }
}

export async function getRevenueReportAction(): Promise<ApiResponse<RevenueReportPoint[]>> {
  try {
    const data = financeStore.getRevenueReport();
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'REPORT_ERROR', message: err.message || 'Failed to generate report' },
    };
  }
}
