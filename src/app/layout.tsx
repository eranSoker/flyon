// FlyOn — Root Layout v1.8.2 | 2026-02-06

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
    default: 'flyon — Flight Search Engine',
    template: '%s | flyon',
  },
  description:
    'Search and compare flights with real-time pricing, smart filters, price graphs, and a cheapest-day calendar. Find the best deals instantly.',
  keywords: ['flights', 'search', 'travel', 'cheap flights', 'flight comparison', 'airfare'],
  authors: [{ name: 'flyon' }],
  icons: {
    icon: '/flyon_icon.svg',
    apple: '/flyon_icon.svg',
  },
  openGraph: {
    title: 'flyon — Flight Search Engine',
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
