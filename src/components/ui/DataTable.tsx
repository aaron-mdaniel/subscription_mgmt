import React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { TableSkeleton } from "./LoadingState";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries matching your current view.",
  page = 1,
  totalPages = 1,
  onPageChange,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-subtle">
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-white border border-slate-200/80 rounded-xl shadow-subtle overflow-hidden flex flex-col",
        className
      )}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => {
              const rowKey = row.id ?? idx;
              return (
                <tr
                  key={rowKey}
                  className="hover:bg-slate-50/70 transition-colors duration-100 group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-xs sm:text-sm text-slate-800",
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : ((row as Record<string, unknown>)[col.key] as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong className="text-slate-800">{page}</strong> of{" "}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
