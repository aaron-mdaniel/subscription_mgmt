import React from "react";
import { cn } from "@/lib/utils/cn";

export type StatusType =
  // Subscription statuses
  | "draft"
  | "quotation"
  | "confirmed"
  | "active"
  | "closed"
  // Invoice statuses
  | "paid"
  | "cancelled"
  | "overdue"
  // Quotation statuses
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted"
  // Generic
  | "pending"
  | "inactive";

interface StatusBadgeProps {
  status: string | StatusType;
  isOverdue?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isOverdue, className }) => {
  const normalized = isOverdue ? "overdue" : ((status || "").toLowerCase() as StatusType);

  // Semantic styles mapping (Document 03 Section 9)
  const getStyle = (): { bg: string; text: string; dot: string; label: string } => {
    switch (normalized) {
      case "active":
      case "paid":
      case "confirmed":
      case "accepted":
      case "converted":
        return {
          bg: "bg-emerald-50 border-emerald-200",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
          label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
        };
      case "draft":
      case "quotation":
      case "sent":
      case "pending":
        return {
          bg: "bg-sky-50 border-sky-200",
          text: "text-sky-700",
          dot: "bg-sky-500",
          label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
        };
      case "closed":
      case "inactive":
        return {
          bg: "bg-slate-100 border-slate-200",
          text: "text-slate-600",
          dot: "bg-slate-400",
          label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
        };
      case "overdue":
      case "cancelled":
      case "rejected":
      case "expired":
        return {
          bg: "bg-rose-50 border-rose-200",
          text: "text-rose-700",
          dot: "bg-rose-500",
          label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
        };
      default:
        return {
          bg: "bg-slate-50 border-slate-200",
          text: "text-slate-700",
          dot: "bg-slate-400",
          label: status || "Unknown",
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        style.bg,
        style.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
};
