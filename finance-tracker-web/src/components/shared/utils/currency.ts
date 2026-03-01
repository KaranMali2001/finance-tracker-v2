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

export function parseRupees(value: string): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  const cleaned = value.replace(/₹/g, '').replace(/,/g, '').trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}
