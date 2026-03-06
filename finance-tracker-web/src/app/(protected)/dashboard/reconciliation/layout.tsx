import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reconciliation',
  description:
    'Upload bank statements and reconcile them against your recorded transactions. Identify discrepancies and confirm matches with one click.',
};

export default function ReconciliationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
