/**
 * Shared display formatters. Keep all user-facing number/date formatting here
 * so tables, charts, and stat cards render values identically.
 */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** $1,234 — whole-dollar USD, used for MRR and revenue figures. */
export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

/** 12.5K / 1.2M — compact notation for stat cards and chart axes. */
export function formatCompact(value: number) {
  return compactFormatter.format(value);
}

/** "Jan 5, 2026" — accepts ISO strings so route/serialized data needs no Date revival. */
export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

/** +12.5% / -3.2% — signed percentage for trend deltas on stat cards. */
export function formatDelta(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
