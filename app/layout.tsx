//app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DelayedScripts from '../components/DelayedScripts';
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
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://gobike.au/#organization',
    name: 'GoBike Australia',
    url: 'https://gobike.au',
    logo: {
      '@type': 'ImageObject',
      url: 'https://gobikes.au/wp-content/uploads/2025/06/cropped-GOBIKE-Electric-Bike-for-kids-1.webp',
      width: 112,
      height: 112
    },
    description: "Australia's top-rated electric balance bikes for kids aged 2-16.",
    email: "gobike@gobike.au", 
    telephone: "+61-426-067-277",
    address: {
      '@type': 'PostalAddress',
      streetAddress: '52 Bligh Ave ', 
      addressLocality: 'Camden south',
      addressRegion: 'NSW',
      postalCode: '2570',
      addressCountry: 'AU'
    },
    sameAs: [
      'https://www.facebook.com/Go-Bike-104997195659873',
      'https://www.instagram.com/gobikeoz/',
      'https://www.youtube.com/@Gobike-r7b'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+61-426-067-277',
      contactType: 'customer service',
      areaServed: 'AU',
      availableLanguage: 'en'
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Suspense>
          <SourceTracker />
        </Suspense>
        <Providers initialUser={user}>
          <TopBar />
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>       
        <DelayedScripts />
      </body>
    </html>
  );
}