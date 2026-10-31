'use server';

// ============================================================================
// BrightLoop Subscription Management System
// Server Actions: Payments & Allocations
// Owner: Member 4 (Finance Operations Developer)
// ============================================================================

import { financeStore } from '@/lib/store/financeStore';
import { Payment, RecordPaymentInput, ApiResponse } from '@/types/finance';
import { revalidatePath } from 'next/cache';

export async function getPaymentsAction(filters?: {
  customer_id?: string;
}): Promise<ApiResponse<Payment[]>> {
  try {
    const payments = financeStore.getPayments(filters);
    return { success: true, data: payments };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch payments' },
    };
  }
}

export async function recordPaymentAction(
  input: RecordPaymentInput
): Promise<ApiResponse<Payment>> {
  try {
    if (!input.customer_id || !input.invoice_id) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Customer ID and Invoice ID are required' },
      };
    }
    if (input.amount <= 0) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Payment amount must be greater than zero' },
      };
    }

    const res = financeStore.recordPayment({
      customer_id: input.customer_id,
      invoice_id: input.invoice_id,
      amount: input.amount,
      payment_method: input.payment_method,
      payment_date: input.payment_date,
      note: input.note,
    });

    if (!res.success || !res.payment) {
      return {
        success: false,
        error: { code: 'PAYMENT_FAILED', message: res.error || 'Failed to record payment' },
      };
    }

    revalidatePath('/invoices');
    revalidatePath('/payments');
    revalidatePath('/reports');
    revalidatePath('/admin/invoices');
    revalidatePath('/admin/payments');
    revalidatePath('/my-invoices');
    revalidatePath('/my-payments');

    return {
      success: true,
      data: res.payment,
      message: `Payment ${res.payment.payment_reference} recorded and allocated successfully`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    };
  }
}
