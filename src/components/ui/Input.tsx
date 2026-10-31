import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full h-10 px-3.5 text-sm bg-white border rounded-control transition-colors duration-150 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:bg-slate-50 disabled:text-text-muted disabled:cursor-not-allowed",
          error
            ? "border-status-danger focus:border-status-danger focus:ring-status-danger/20"
            : "border-border hover:border-border-strong focus:border-brand",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
