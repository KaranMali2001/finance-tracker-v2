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
  themeColor: '#92400e',
};

const APP_NAME = 'Wealth Reserve';
const APP_DESCRIPTION =
  'Wealth Reserve is a personal finance management app for Indian users. Automatically capture bank transactions via SMS, track investments, reconcile statements, and get deep financial insights — all in one place.';

export const metadata: Metadata = {
  metadataBase: new URL('https://wealth-reserve.vercel.app'),
  title: {
    default: 'Wealth Reserve | Personal Finance & Investment Tracker',
    template: '%s | Wealth Reserve',
  },
  description: APP_DESCRIPTION,
  keywords: [
    'personal finance tracker India',
    'SMS bank transaction tracker',
    'investment tracker India',
    'SIP tracker',
    'mutual fund tracker',
    'budget management app',
    'expense tracker',
    'bank statement reconciliation',
    'financial dashboard',
    'wealth management app',
    'money tracker India',
    'UPI transaction tracker',
  ],
  authors: [{ name: 'Wealth Reserve' }],
  creator: 'Wealth Reserve',
  publisher: 'Wealth Reserve',
  applicationName: APP_NAME,
  category: 'finance',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Wealth Reserve | Personal Finance & Investment Tracker',
    description: APP_DESCRIPTION,
    type: 'website',
    locale: 'en_IN',
    siteName: APP_NAME,
    url: 'https://wealth-reserve.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wealth Reserve | Personal Finance & Investment Tracker',
    description: APP_DESCRIPTION,
    creator: '@wealthreserve',
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
