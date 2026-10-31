import type { Metadata } from 'next';
import './globals.css';
import { AppNavbar } from '@/components/layout/AppNavbar';

export const metadata: Metadata = {
  title: 'BrightLoop Subscription Management',
  description: 'AI-Native Studio Subscription and Billing Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased font-sans text-slate-900 flex flex-col">
        <AppNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
