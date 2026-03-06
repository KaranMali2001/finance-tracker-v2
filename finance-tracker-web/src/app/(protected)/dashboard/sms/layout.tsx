import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SMS Logs',
  description:
    'Review SMS messages parsed from your bank notifications. Monitor transaction extraction accuracy and manage SMS parsing rules.',
};

export default function SmsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
