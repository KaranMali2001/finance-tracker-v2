import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investments',
  description:
    'Track your investment goals, SIPs, mutual funds, stocks, FDs, and more. Auto-link transactions to investments and monitor portfolio performance.',
};

export default function InvestmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
