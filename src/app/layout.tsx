import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "BrightLoop — Subscription Management System",
  description:
    "Unified subscription operations, recurring billing, quotations, and financial tracking for BrightLoop.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-muted text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
