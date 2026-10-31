import React from 'react';
import { getInvoiceByIdAction } from '@/features/invoices/actions';
import { InvoiceDetail } from '@/features/invoices/InvoiceDetail';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getInvoiceByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <InvoiceDetail initialInvoice={res.data} portalMode={false} />;
}
