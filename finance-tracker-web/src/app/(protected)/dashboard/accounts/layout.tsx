import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounts',
  description:
    'View and manage all your linked bank accounts. Track balances across savings, current, and investment accounts in one place.',
};

export default function AccountsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
