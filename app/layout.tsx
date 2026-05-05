// app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
import DelayedScripts from '@/components/DelayedScripts';
import { Providers } from "./providers";
import { Suspense } from 'react';
import SourceTracker from '@/components/SourceTracker';
import { getCurrentUser } from '@/lib/session';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gobike.au'),
  
  title: {
    default: 'GoBike - Kids Electric Bikes Australia | Top Rated Balance Bikes',
    template: '%s ',
  },
  description: "Australia's #1 rated electric balance bikes for kids (ages 2-16). Engineered for safety, built for fun. Shop 12\", 16\", 20\" & 24\" e-bikes with 1-year warranty.",
  
  applicationName: 'GoBike Australia',
  authors: [{ name: 'GoBike Australia', url: 'https://gobike.au' }],
  generator: 'Next.js',
  keywords: ['kids electric bike', 'kids ebike', 'electric balance bike', 'electric dirt bike for kids', 'GoBike', 'toddler electric bike', 'kids motorcycle Australia', 'buy kids ebike online'],
  referrer: 'origin-when-cross-origin',
  creator: 'GoBike Team',
  publisher: 'GoBike Australia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    title: 'GoBike - Kids Electric Bikes Australia',
    description: "Australia's top-rated electric balance bikes for kids. Safe, fun, and built for adventure.",
    url: 'https://gobike.au',
    siteName: 'GoBike Australia',
    images: [
      {
        url: 'https://gobikes.au/wp-content/uploads/2025/11/gobike-ebike-safe-speed-modes.jpg', 
        width: 1200,
        height: 857,
        alt: 'A happy child riding a GoBike electric bike in Australia.',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    site: '@GoBikeAU',
    title: 'GoBike - Kids Electric Bikes Australia',
    description: "Australia's top-rated electric balance bikes for kids.",
    creator: '@GoBikeAU', 
    images: ['https://gobikes.au/wp-content/uploads/2025/11/gobike-ebike-safe-speed-modes.jpg'], 
  },

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
  
  alternates: {
    canonical: '/', 
    languages: {
      'en-AU': '/', 
      'x-default': '/',
    },
  },

  other: {
    'geo.region': 'AU-NSW',
    'geo.placename': 'Camden',
    'geo.position': '-34.05;150.69', 
    'ICBM': '-34.05, 150.69',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Suspense>
          <SourceTracker />
        </Suspense>
        
        {/* Main Provider for Auth (Works for both Frontend & Backend) */}
        <Providers initialUser={user}>
          {children}
        </Providers>       
        
        <DelayedScripts />
      </body>
    </html>
  );
}