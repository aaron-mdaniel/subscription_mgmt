import React from "react";
import { formatMoney } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export interface MoneyDisplayProps {
  amount: number | string | null | undefined;
  currency?: string;
  className?: string;
  variant?: "default" | "muted" | "positive" | "negative";
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount,
  currency,
  className,
  variant = "default",
}) => {
  const formatted = formatMoney(amount, currency);

  const variantStyles = {
    default: "text-text-primary",
    muted: "text-text-secondary",
    positive: "text-emerald-600 font-semibold",
    negative: "text-rose-600 font-semibold",
  };

  return (
    <span className={cn("font-mono font-medium tracking-tight", variantStyles[variant], className)}>
      {formatted}
    </span>
  );
};
