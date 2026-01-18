//app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DelayedScripts from '../components/DelayedScripts';
import { ClientProviders } from "./providers";
import { Suspense } from 'react';
import SourceTracker from '@/components/SourceTracker';

// ★★★ নতুন ইম্পোর্ট (Auth এর জন্য) ★★★
import { AuthProvider } from '@/app/providers/AuthProvider';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

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
    default: 'GoBike - Kids Electric Bikes Australia',
    template: '%s | GoBike Australia',
  },
  description: "Australia's top-rated electric balance bikes for kids aged 2-16. Engineered for safety and built for fun. Shop now for the perfect e-bike for your child, backed by a 1-year warranty and local Aussie support.",
  
  openGraph: {
    title: 'GoBike - Kids Electric Bikes Australia',
    description: "Australia's top-rated electric balance bikes for kids.",
    url: '/',
    siteName: 'GoBike Australia',
    images: [
      {
        url: 'https://gobikes.au/wp-content/uploads/2025/11/gobike-ebike-safe-speed-modes.jpg', 
        width: 1200,
        height: 857,
        alt: 'A child riding a GoBike electric bike.',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'GoBike - Kids Electric Bikes Australia',
    description: "Australia's top-rated electric balance bikes for kids.",
    images: ['https://gobikes.au/wp-content/uploads/2025/11/gobike-ebike-safe-speed-modes.jpg'], 
  },

  keywords: ['kids electric bike','kids ebike', 'electric bike','electric bike for kids','electric balance bike', 'ebike for kids', 'GoBike','childrens electric motorbike','toddler electric bike','buy kids ebike online','GoBike Australia'],
  authors: [{ name: 'GoBike Australia', url: 'https://gobike.au' }],
  creator: 'Shariful Islam',
  publisher: 'GoBike Australia',
  
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
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

// ★★★ ইউজার ডেটা ফেচ করার কুয়েরি এবং ফাংশন ★★★
const GET_VIEWER_QUERY = `
query GetViewer {
  viewer {
    id
    firstName
    lastName
    email
  }
}
`;

async function getViewer(token: string | undefined) {
  if (!token) return null;
  
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: GET_VIEWER_QUERY }),
      cache: 'no-store', // সবসময় নতুন ডেটা ফেচ হবে
    });

    const data = await response.json();
    return data?.data?.viewer || null;
  } catch (error) {
    return null;
  }
}

// ★★★ RootLayout এখন async হতে হবে ★★★
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ★★★ সার্ভার সাইডে কুকি এবং ইউজার চেক করা ★★★
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = await getViewer(token);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {/* ★★★ AuthProvider দিয়ে পুরো অ্যাপ র‍্যাপ করা হয়েছে ★★★ */}
        <AuthProvider initialUser={user}>
          <Suspense>
            <SourceTracker />
          </Suspense>
          <ClientProviders>
            <TopBar />
            <Header />
            <main>
              {children}
            </main>
            <Footer />
          </ClientProviders>

        </AuthProvider>
        <DelayedScripts />
      </body>
    </html>
  );
}