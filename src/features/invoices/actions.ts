'use server';

// ============================================================================
// BrightLoop Subscription Management System
// Server Actions: Invoices
// Owner: Member 4 (Finance Operations Developer)
// ============================================================================

import { financeStore } from '@/lib/store/financeStore';
import { CreateInvoiceInput, Invoice, ApiResponse } from '@/types/finance';
import { revalidatePath } from 'next/cache';

export async function getInvoicesAction(filters?: {
  customer_id?: string;
  status?: string;
  search?: string;
}): Promise<ApiResponse<Invoice[]>> {
  try {
    const invoices = financeStore.getInvoices(filters);
    return { success: true, data: invoices };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch invoices' },
    };
  }
}

export async function getInvoiceByIdAction(id: string): Promise<ApiResponse<Invoice>> {
  try {
    const invoice = financeStore.getInvoiceById(id);
    if (!invoice) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invoice not found' },
      };
    }
    return { success: true, data: invoice };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch invoice' },
    };
  }
}

export async function createInvoiceAction(
  input: CreateInvoiceInput
): Promise<ApiResponse<Invoice>> {
  try {
    if (!input.customer_id) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Customer is required' },
      };
    }
    if (!input.lines || input.lines.length === 0) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'At least one line item is required' },
      };
    }

    const created = financeStore.createInvoice({
      ...input,
      status: 'draft',
    });

    revalidatePath('/invoices');
    revalidatePath('/admin/invoices');
    revalidatePath('/my-invoices');

    return { success: true, data: created, message: 'Invoice created successfully' };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'CREATE_ERROR', message: err.message || 'Failed to create invoice' },
    };
  }
}

export async function confirmInvoiceAction(id: string): Promise<ApiResponse<Invoice>> {
  try {
    const res = financeStore.confirmInvoice(id);
    if (!res.success || !res.invoice) {
      return {
        success: false,
        error: { code: 'TRANSITION_ERROR', message: res.error || 'Failed to confirm invoice' },
      };
    }

    revalidatePath('/invoices');
    revalidatePath('/admin/invoices');
    revalidatePath('/my-invoices');

    return { success: true, data: res.invoice, message: 'Invoice confirmed successfully' };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    };
  }
}

export async function cancelInvoiceAction(
  id: string,
  reason?: string
): Promise<ApiResponse<Invoice>> {
  try {
    const res = financeStore.cancelInvoice(id, reason);
    if (!res.success || !res.invoice) {
      return {
        success: false,
        error: { code: 'TRANSITION_ERROR', message: res.error || 'Failed to cancel invoice' },
      };
    }

    revalidatePath('/invoices');
    revalidatePath('/admin/invoices');
    revalidatePath('/my-invoices');

    return { success: true, data: res.invoice, message: 'Invoice cancelled successfully' };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    };
  }
}
