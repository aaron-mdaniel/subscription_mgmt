"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { UserRole } from "@/types/domain";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileSpreadsheet,
  Repeat,
  FileText,
  Percent,
  CreditCard,
  BarChart3,
  ShieldCheck,
  UserCheck,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface AppSidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavSection {
  title?: string;
  items: {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  role,
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();

  const adminSections: NavSection[] = [
    {
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Commercial Operations",
      items: [
        {
          label: "Customers",
          href: "/customers",
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: "Quotations",
          href: "/quotations",
          icon: <FileSpreadsheet className="w-4 h-4" />,
        },
        {
          label: "Subscriptions",
          href: "/subscriptions",
          icon: <Repeat className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Catalogue & Plans",
      items: [
        {
          label: "Products & Variants",
          href: "/products",
          icon: <Package className="w-4 h-4" />,
        },
        {
          label: "Subscription Plans",
          href: "/plans",
          icon: <Layers className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Billing & Finance",
      items: [
        {
          label: "Invoices",
          href: "/invoices",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: "Payments",
          href: "/payments",
          icon: <CreditCard className="w-4 h-4" />,
        },
        {
          label: "Promotions & Discounts",
          href: "/discounts",
          icon: <Percent className="w-4 h-4" />,
        },
        {
          label: "Financial Analytics",
          href: "/reports",
          icon: <BarChart3 className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "System Administration",
      items: [
        {
          label: "Staff Provisioning",
          href: "/staff",
          icon: <ShieldCheck className="w-4 h-4" />,
          badge: "Admin Only",
        },
      ],
    },
  ];

  const staffSections: NavSection[] = [
    {
      items: [
        {
          label: "Operational Desk",
          href: "/staff/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Daily Tasks",
      items: [
        {
          label: "Customer Accounts",
          href: "/staff/customers",
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: "Quotations",
          href: "/staff/quotations",
          icon: <FileSpreadsheet className="w-4 h-4" />,
        },
        {
          label: "Active Subscriptions",
          href: "/staff/subscriptions",
          icon: <Repeat className="w-4 h-4" />,
        },
        {
          label: "Billing Invoices",
          href: "/staff/invoices",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: "Payment Logging",
          href: "/staff/payments",
          icon: <CreditCard className="w-4 h-4" />,
        },
      ],
    },
  ];

  const customerSections: NavSection[] = [
    {
      items: [
        {
          label: "Portal Overview",
          href: "/portal",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "My Account",
      items: [
        {
          label: "My Subscriptions",
          href: "/portal/subscriptions",
          icon: <Repeat className="w-4 h-4" />,
        },
        {
          label: "Billing & Invoices",
          href: "/portal/invoices",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: "Payment History",
          href: "/portal/payments",
          icon: <CreditCard className="w-4 h-4" />,
        },
        {
          label: "Company Profile",
          href: "/portal/profile",
          icon: <UserCheck className="w-4 h-4" />,
        },
      ],
    },
  ];

  const sections =
    role === "admin"
      ? adminSections
      : role === "staff"
      ? staffSections
      : customerSections;

  const roleMeta: Record<
    UserRole,
    { workspace: string; badge: string; color: string }
  > = {
    admin: {
      workspace: "BrightLoop Studio",
      badge: "Admin HQ",
      color: "bg-indigo-600 text-white",
    },
    staff: {
      workspace: "Operations Desk",
      badge: "Internal Staff",
      color: "bg-sky-600 text-white",
    },
    customer: {
      workspace: "Acme Cloud Technologies",
      badge: "Customer Portal",
      color: "bg-emerald-600 text-white",
    },
  };

  const currentMeta = roleMeta[role];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      {/* Workspace Branding Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            BL
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{currentMeta.workspace}</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentMeta.badge}</span>
            </div>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (
              <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1.5">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/portal" &&
                  item.href !== "/staff/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 group",
                    isActive
                      ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-subtle"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-indigo-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Context & Environment Pill */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 shadow-subtle">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate capitalize">
                {role === "customer" ? "Acme Billing" : `${role} User`}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Odoo Kochi 2026
              </p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="System Online" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-10 animate-fadeIn">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
