import React from 'react';
import { getInvoicesAction } from '@/features/invoices/actions';
import { InvoiceList } from '@/features/invoices/InvoiceList';

export default async function AdminInvoicesPage() {
  const res = await getInvoicesAction();
  const invoices = res.success ? res.data : [];

  return <InvoiceList initialInvoices={invoices} portalMode={false} />;
}
