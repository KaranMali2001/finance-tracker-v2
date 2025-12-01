import { ErrorBoundary } from '@/components/shared/error-boundary';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from './Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Finance Tracker | Personal Financial Management',
  description:
    'Track, analyze, and manage your personal finances with automated SMS transaction processing and comprehensive analytics.',
  keywords: [
    'finance',
    'tracker',
    'personal finance',
    'budget',
    'expenses',
    'transactions',
    'analytics',
  ],
  authors: [{ name: 'Finance Tracker Team' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Finance Tracker | Personal Financial Management',
    description:
      'Track, analyze, and manage your personal finances with automated SMS transaction processing and comprehensive analytics.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finance Tracker | Personal Financial Management',
    description:
      'Track, analyze, and manage your personal finances with automated SMS transaction processing and comprehensive analytics.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ErrorBoundary>
            <Toaster />
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
