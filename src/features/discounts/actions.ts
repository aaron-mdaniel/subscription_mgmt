'use server';

// ============================================================================
// BrightLoop Subscription Management System
// Server Actions: Discounts
// Owner: Member 4 (Finance Operations Developer)
// ============================================================================

import { financeStore } from '@/lib/store/financeStore';
import { Discount, CreateDiscountInput, ApiResponse } from '@/types/finance';
import { revalidatePath } from 'next/cache';

export async function getDiscountsAction(): Promise<ApiResponse<Discount[]>> {
  try {
    const discounts = financeStore.getDiscounts();
    return { success: true, data: discounts };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch discounts' },
    };
  }
}

export async function createDiscountAction(
  input: CreateDiscountInput
): Promise<ApiResponse<Discount>> {
  try {
    if (!input.name || input.name.trim() === '') {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Discount code / name is required' },
      };
    }
    if (input.value <= 0) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Discount value must be greater than zero' },
      };
    }
    if (input.discount_type === 'percentage' && input.value > 100) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Percentage discount cannot exceed 100%' },
      };
    }

    const created = financeStore.createDiscount({
      name: input.name,
      discount_type: input.discount_type,
      value: input.value,
      minimum_purchase: input.minimum_purchase,
      minimum_quantity: input.minimum_quantity,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      usage_limit: input.usage_limit,
      scope_type: input.scope_type || 'subscription',
      is_active: input.is_active ?? true,
    });

    revalidatePath('/discounts');
    revalidatePath('/admin/discounts');

    return {
      success: true,
      data: created,
      message: `Discount code ${created.name} created successfully`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    };
  }
}
