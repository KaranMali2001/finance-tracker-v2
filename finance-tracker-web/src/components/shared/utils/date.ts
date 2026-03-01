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
