import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading records...",
  className,
}) => {
  return (
    <div
      className={`py-12 flex flex-col items-center justify-center text-center ${
        className || ""
      }`}
    >
      <Loader2 className="w-8 h-8 animate-spin text-brand mb-2" />
      <p className="text-sm font-medium text-text-secondary">{message}</p>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-8 bg-slate-100 rounded w-1/4" />
          <div className="h-8 bg-slate-100 rounded w-1/3" />
          <div className="h-8 bg-slate-100 rounded w-1/6" />
          <div className="h-8 bg-slate-100 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
};
