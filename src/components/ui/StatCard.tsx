import React from "react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number | string;
    positive?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  href?: string;
  className?: string;
  variant?: "default" | "warning" | "danger" | "success";
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  trend,
  icon,
  href,
  className,
  variant = "default",
}) => {
  const accentTopBorders = {
    default: "border-t-2 border-t-indigo-500",
    warning: "border-t-2 border-t-amber-500",
    danger: "border-t-2 border-t-rose-500",
    success: "border-t-2 border-t-emerald-500",
  };

  const content = (
    <div
      className={cn(
        "p-5 bg-white border border-slate-200/80 rounded-xl shadow-subtle hover:shadow-card transition-all duration-200 relative overflow-hidden group",
        accentTopBorders[variant],
        href && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 truncate max-w-[190px]">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px]",
                trend.positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend.positive ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
};
