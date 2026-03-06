import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your Wealth Reserve account settings, spending thresholds, and API keys.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
