// FlyOn — Root Layout v1.8.0 | 2026-02-06

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'FlyOn — Flight Search Engine',
    template: '%s | FlyOn',
  },
  description:
    'Search and compare flights with real-time pricing, smart filters, price graphs, and a cheapest-day calendar. Find the best deals instantly.',
  keywords: ['flights', 'search', 'travel', 'cheap flights', 'flight comparison', 'airfare'],
  authors: [{ name: 'FlyOn' }],
  openGraph: {
    title: 'FlyOn — Flight Search Engine',
    description: 'Find the best flights, instantly.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
