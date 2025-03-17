import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format timestamp to a readable date
export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
  return date.toLocaleString();
}

// Format ETH value with proper units
export function formatEthValue(wei: string | number): string {
  const value = typeof wei === 'string' ? parseInt(wei) : wei;
  const eth = value / 1e18;
  return eth.toFixed(4) + ' ETH';
}

// Truncate hash for display
export function truncateHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
} 