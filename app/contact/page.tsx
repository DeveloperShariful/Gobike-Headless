import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

// --- SEO Metadata (এখন এটি সার্ভার কম্পোনেন্টে থাকায় সঠিকভাবে কাজ করবে) ---
export const metadata: Metadata = {
  title: 'Contact Us | GoBike Australia Support',
  description: 'Have a question about our kids electric bikes? Get in touch with the GoBike Australia team. We are here to help you with your inquiries and provide expert support.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | GoBike Australia Support',
    description: 'Have a question about our kids electric bikes? Get in touch with the GoBike Australia team for expert support.',
    url: 'https://gobike.au/contact',
    siteName: 'GoBike Australia',
    images: [
      {
        url: 'https://gobikes.au/wp-content/uploads/2025/09/Gobike-kids-electric-bike-ebike-for-kids-scaled.webp', // একটি ডিফল্ট শেয়ারিং ইমেজ
        width: 1200,
        height: 630,
        alt: 'Contact GoBike Australia for support',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
};
export default function ContactPage() {
  return (
    <ContactPageClient />
  );
}