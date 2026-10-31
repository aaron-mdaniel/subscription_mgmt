import React from 'react';
import { getDiscountsAction } from '@/features/discounts/actions';
import { DiscountList } from '@/features/discounts/DiscountList';

export default async function AdminDiscountsPage() {
  const res = await getDiscountsAction();
  const discounts = res.success ? res.data : [];

  return <DiscountList initialDiscounts={discounts} />;
}
