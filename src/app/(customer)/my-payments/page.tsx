import React from 'react';
import { getPaymentsAction } from '@/features/payments/actions';
import { PaymentList } from '@/features/payments/PaymentList';

export default async function CustomerMyPaymentsPage() {
  // Scoped strictly to authenticated customer (Demo: Acme Enterprise Ltd 'cust-1')
  const res = await getPaymentsAction({ customer_id: 'cust-1' });
  const payments = res.success ? res.data : [];

  return <PaymentList initialPayments={payments} portalMode={true} />;
}
