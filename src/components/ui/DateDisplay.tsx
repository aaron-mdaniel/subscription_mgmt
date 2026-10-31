import React from "react";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export interface DateDisplayProps {
  date: string | Date | null | undefined;
  className?: string;
  showRelative?: boolean;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  className,
}) => {
  const formatted = formatDate(date);

  return (
    <span className={cn("text-sm text-text-secondary whitespace-nowrap", className)}>
      {formatted}
    </span>
  );
};
