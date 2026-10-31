import React from 'react';
import { getInvoicesAction } from '@/features/invoices/actions';
import { InvoiceList } from '@/features/invoices/InvoiceList';

export default async function CustomerMyInvoicesPage() {
  // Scoped strictly to authenticated customer (Demo: Acme Enterprise Ltd 'cust-1')
  const res = await getInvoicesAction({ customer_id: 'cust-1' });
  const invoices = res.success ? res.data : [];

  return <InvoiceList initialInvoices={invoices} portalMode={true} />;
}
