
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Indian number formatting ────────────────────────────────────────────────

/** Format a number with Indian comma grouping (e.g. 1500000 → "15,00,000") */
export function toIndianFormat(n: number): string {
  if (!n || isNaN(n)) return '';
  return n.toLocaleString('en-IN');
}

/**
 * Convert a square-foot number to a short Indian word description.
 * e.g. 400000 → "4 Lakh"  |  15000000 → "1.5 Crore"  |  25000 → "25 Thousand"
 */
export function toIndianSqFtWords(n: number): string {
  if (!n || isNaN(n) || n <= 0) return '';
  if (n >= 1e7) {
    const v = n / 1e7;
    return `${v % 1 === 0 ? v : parseFloat(v.toFixed(2))} Crore Sq Ft`;
  }
  if (n >= 1e5) {
    const v = n / 1e5;
    return `${v % 1 === 0 ? v : parseFloat(v.toFixed(2))} Lakh Sq Ft`;
  }
  if (n >= 1000) {
    const v = n / 1000;
    return `${v % 1 === 0 ? v : parseFloat(v.toFixed(1))} Thousand Sq Ft`;
  }
  return '';
}

/**
 * Map internal role keys to display labels used across the platform.
 * Customer → Lessee, Developer/Warehouse Developer → Lessor, Agent → Agent (ORS)
 */
export function displayRole(role: string): string {
  if (role === 'Customer') return 'Lessee';
  if (role === 'Developer' || role === 'Warehouse Developer') return 'Lessor';
  if (role === 'Agent') return 'Agent (ORS)';
  return role;
}

/**
 * Returns empty string when value is falsy.
 */
export function sqFtHelperText(n: number | undefined | null): string {
  if (!n || isNaN(n) || n <= 0) return '';
  const formatted = toIndianFormat(n);
  const words = toIndianSqFtWords(n);
  return words ? `${formatted} sft · ${words}` : `${formatted} sft`;
}
