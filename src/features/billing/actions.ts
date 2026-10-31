'use server';

// ============================================================================
// BrightLoop Subscription Management System
// Server Actions: Recurring Billing Engine (Idempotent)
// Owner: Member 4 (Finance Operations Developer)
// ============================================================================

import { financeStore } from '@/lib/store/financeStore';
import { BillingRunInput, BillingRunResult, ApiResponse } from '@/types/finance';
import { revalidatePath } from 'next/cache';

/**
 * Executes the recurring billing run.
 * Guaranteed idempotent: Calling this multiple times for the same period
 * will skip already billed subscriptions without creating duplicates.
 */
export async function runBillingAction(
  input: BillingRunInput = {}
): Promise<ApiResponse<BillingRunResult>> {
  try {
    const result = financeStore.runRecurringBilling(input.target_date);

    revalidatePath('/invoices');
    revalidatePath('/reports');
    revalidatePath('/admin/invoices');
    revalidatePath('/admin/reports');

    return {
      success: true,
      data: result,
      message: `Billing completed: ${result.invoices_created} invoices generated, ${result.invoices_skipped_existing} skipped as already billed.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'BILLING_RUN_FAILED',
        message: err.message || 'An error occurred while running automated billing',
      },
    };
  }
}
