"use client";

import React from "react";
import { UserRole } from "@/types/domain";
import {
  Menu,
  LogOut,
  Search,
  CheckCircle2,
  Bell,
  Command,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppHeaderProps {
  role: UserRole;
  onOpenMobileMenu?: () => void;
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  role,
  onOpenMobileMenu,
  title,
}) => {
  const pathname = usePathname();

  // Create clean human-readable breadcrumbs
  const pathParts = pathname.split("/").filter(Boolean);
  const currentCrumb =
    title ||
    (pathParts.length > 0
      ? pathParts[pathParts.length - 1].replace(/-/g, " ")
      : "Overview");

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium capitalize hidden sm:inline">
            {role === "customer" ? "Portal" : "Operations"}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-900 capitalize tracking-tight">
            {currentCrumb}
          </span>
        </div>
      </div>

      {/* Global Search Bar (SaaS Standard) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-400 w-72 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <span className="flex-1 truncate">Search subscriptions, invoices...</span>
        <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-500 font-mono shadow-subtle">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Real-time System Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Billing Idempotency Active</span>
        </div>

        {/* Demo Fast Role Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs font-semibold">
          <Link
            href="/dashboard"
            className={`px-2.5 py-1 rounded-md transition-all ${
              role === "admin"
                ? "bg-white text-indigo-700 shadow-subtle font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Admin
          </Link>
          <Link
            href="/staff/dashboard"
            className={`px-2.5 py-1 rounded-md transition-all ${
              role === "staff"
                ? "bg-white text-indigo-700 shadow-subtle font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Staff
          </Link>
          <Link
            href="/portal"
            className={`px-2.5 py-1 rounded-md transition-all ${
              role === "customer"
                ? "bg-white text-indigo-700 shadow-subtle font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Customer
          </Link>
        </div>

        {/* Sign Out */}
        <Link
          href="/login"
          title="Sign out of current session"
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};
