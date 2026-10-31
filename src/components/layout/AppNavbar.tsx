'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, CreditCard, Tag, BarChart3, Shield, User } from 'lucide-react';

export const AppNavbar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/admin/reports', label: 'Finance Dashboard', icon: BarChart3 },
    { href: '/admin/invoices', label: 'Invoices', icon: FileText },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/discounts', label: 'Discounts', icon: Tag },
    { href: '/my-invoices', label: 'Customer Portal', icon: User },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
              BL
            </div>
            <div>
              <Link href="/admin/reports" className="font-bold text-lg text-white hover:text-indigo-200">
                BrightLoop
              </Link>
              <span className="text-xs text-slate-400 block -mt-1 font-mono">Subscription & Billing</span>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
