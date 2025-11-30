/**
 * Format a number as Indian Rupees (₹)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatRupees(
  amount: number | null | undefined,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showZero?: boolean;
  }
): string {
  if (amount === null || amount === undefined) {
    return options?.showZero ? '₹0.00' : 'N/A';
  }

  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options || {};

  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}

/**
 * Parse a rupee-formatted string back to a number
 * @param value - The formatted string (e.g., "₹1,23,456.78" or "123456.78")
 * @returns The parsed number or null if invalid
 */
export function parseRupees(value: string): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  // Remove currency symbol and commas
  const cleaned = value.replace(/₹/g, '').replace(/,/g, '').trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}
