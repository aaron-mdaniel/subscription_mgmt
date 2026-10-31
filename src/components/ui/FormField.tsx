import React from "react";
import { cn } from "@/lib/utils/cn";

export interface FormFieldProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error,
  required,
  className,
  children,
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-text-primary tracking-wide">
          {label}
          {required && <span className="ml-1 text-status-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-status-danger font-medium animate-fadeIn">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
};
