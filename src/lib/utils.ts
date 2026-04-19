import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address?: string | null) {
  if (!address) return "Unknown";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCurrency(value: string, symbol = "ETH") {
  return `${value} ${symbol}`;
}

export function percentage(value: number) {
  return `${Math.round(value * 100)}%`;
}
