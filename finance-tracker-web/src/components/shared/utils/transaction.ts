/**
 * Transaction type definitions
 */
export type TransactionType =
  | 'DEBIT'
  | 'CREDIT'
  | 'INCOME'
  | 'REFUND'
  | 'SUBSCRIPTION'
  | 'INVESTMENT'
  | string;

/**
 * Get CSS classes for transaction type badge styling
 * @param type - The transaction type
 * @returns Tailwind CSS classes for the transaction type badge
 */
export function getTypeColor(type?: TransactionType): string {
  switch (type) {
    case 'DEBIT':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'CREDIT':
    case 'INCOME':
    case 'REFUND':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'SUBSCRIPTION':
    case 'INVESTMENT':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}
