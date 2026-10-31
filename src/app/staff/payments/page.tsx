import React from 'react';
import { getPaymentsAction } from '@/features/payments/actions';
import { PaymentList } from '@/features/payments/PaymentList';

export default async function StaffPaymentsPage() {
  const res = await getPaymentsAction();
  const payments = res.success ? res.data : [];

  return <PaymentList initialPayments={payments} portalMode={false} />;
}
