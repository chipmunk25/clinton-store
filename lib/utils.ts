import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  GHS: "₵",
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  KES: "KSh",
  ZAR: "R",
  XOF: "CFA",
};

// Default currency - can be overridden
let defaultCurrency = "GHS";

export function setDefaultCurrency(currency: string) {
  defaultCurrency = currency;
}

export function getDefaultCurrency() {
  return defaultCurrency;
}

export function getCurrencySymbol(currency?: string): string {
  return CURRENCY_SYMBOLS[currency || defaultCurrency] || "₵";
}

export function formatCurrency(
  amount: number | string,
  currency?: string
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const curr = currency || defaultCurrency;
  const symbol = getCurrencySymbol(curr);

  // Format number with commas and 2 decimal places
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
