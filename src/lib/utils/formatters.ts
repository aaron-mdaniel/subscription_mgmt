/**
 * Consistent Currency and Date Formatters
 * Reference: Document 03 (UI Spec) & Document 04 (Contract)
 */

const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_APP_CURRENCY || "₹";

export function formatMoney(
  amount: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${currency}0.00`;
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(
  dateString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return "—";

  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "Invalid Date";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return date.toLocaleDateString("en-US", defaultOptions);
}

export function formatDateTime(
  dateString: string | Date | null | undefined
): string {
  if (!dateString) return "—";

  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
