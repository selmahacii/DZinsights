import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B DA`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M DA`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K DA`;
  }
  return `${value.toLocaleString()} DA`;
}

export function formatNumber(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}
