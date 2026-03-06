import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transactions',
  description:
    'Browse, filter, and manage all your bank transactions. Categorize expenses and income automatically captured from SMS notifications.',
};

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
