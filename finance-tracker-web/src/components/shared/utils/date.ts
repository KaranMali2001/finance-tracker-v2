/**
 * Format a date string to a human-readable format
 * @param dateString - The date string to format (ISO format or any valid date string)
 * @param locale - The locale to use for formatting (default: 'en-IN')
 * @param options - Additional Intl.DateTimeFormatOptions
 * @returns Formatted date string or 'N/A' if invalid
 */
export function formatDate(
  dateString?: string | null,
  locale: string = 'en-IN',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
  } catch {
    return dateString;
  }
}
